import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

const HISTORY_FILE = path.resolve(__dirname, '../../reports/history.json');

interface ModuleResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
  duration: number;
  failedTests: string[];
}

interface RunEntry {
  date: string;
  timestamp: number;
  totalDuration: number;
  status: string;
  modules: Record<string, ModuleResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
    passRate: number;
  };
}

/**
 * JSON History Reporter — stores structured test run data for trend analysis.
 * Used by /quality-trend skill to show coverage trends over time.
 */
class HistoryReporter implements Reporter {
  private results: Array<{
    title: string;
    file: string;
    module: string;
    status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
    duration: number;
    error?: string;
  }> = [];
  private startTime = 0;

  onBegin(_config: FullConfig, _suite: Suite) {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const file = path.relative(
      path.resolve(__dirname, '../..'),
      test.location.file
    ).replace(/\\/g, '/');

    // Extract module name from file path: tests/e2e/admin-calendar.spec.ts → admin-calendar
    const match = file.match(/tests\/e2e\/(.+)\.spec\.ts/);
    const module = match ? match[1] : 'unknown';

    this.results.push({
      title: test.title,
      file,
      module,
      status: result.status,
      duration: result.duration,
      error: result.errors?.[0]?.message?.slice(0, 200),
    });
  }

  onEnd(result: FullResult) {
    const totalDuration = (Date.now() - this.startTime) / 1000;
    const now = new Date();

    // Group by module
    const modules: Record<string, ModuleResult> = {};
    for (const r of this.results) {
      if (!modules[r.module]) {
        modules[r.module] = {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          timedOut: 0,
          duration: 0,
          failedTests: [],
        };
      }
      const m = modules[r.module];
      m.total++;
      m.duration += r.duration;
      if (r.status === 'passed') m.passed++;
      else if (r.status === 'failed') {
        m.failed++;
        m.failedTests.push(r.title);
      } else if (r.status === 'skipped') m.skipped++;
      else if (r.status === 'timedOut') {
        m.timedOut++;
        m.failedTests.push(`[timeout] ${r.title}`);
      }
    }

    const total = this.results.length;
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;
    const timedOut = this.results.filter((r) => r.status === 'timedOut').length;

    const entry: RunEntry = {
      date: now.toISOString(),
      timestamp: now.getTime(),
      totalDuration: Math.round(totalDuration * 10) / 10,
      status: result.status,
      modules,
      summary: {
        total,
        passed,
        failed,
        skipped,
        timedOut,
        passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
      },
    };

    // Load existing history
    const reportDir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    let history: RunEntry[] = [];
    if (fs.existsSync(HISTORY_FILE)) {
      try {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
      } catch {
        history = [];
      }
    }

    // Keep last 50 runs
    history.push(entry);
    if (history.length > 50) {
      history = history.slice(-50);
    }

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  }
}

export default HistoryReporter;
