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

const REPORT_FILE = path.resolve(__dirname, '../../reports/test-results.md');

interface TestEntry {
  title: string;
  file: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
  duration: number;
  error?: string;
}

class MarkdownReporter implements Reporter {
  private results: TestEntry[] = [];
  private startTime = 0;
  private suiteName = '';

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.suiteName = config.projects.map((p) => p.name).join(', ');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const file = path.relative(
      path.resolve(__dirname, '../..'),
      test.location.file
    );
    this.results.push({
      title: test.title,
      file,
      status: result.status,
      duration: result.duration,
      error: result.errors?.[0]?.message?.slice(0, 200),
    });
  }

  onEnd(result: FullResult) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;
    const timedOut = this.results.filter((r) => r.status === 'timedOut').length;
    const total = this.results.length;

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const failedTests = this.results.filter((r) => r.status === 'failed');
    const timedOutTests = this.results.filter((r) => r.status === 'timedOut');

    let entry = `\n## ${date} ${time}\n\n`;
    entry += `| Metric | Value |\n|--------|-------|\n`;
    entry += `| Total | ${total} |\n`;
    entry += `| Passed | ${passed} |\n`;
    entry += `| Failed | ${failed} |\n`;
    entry += `| Skipped | ${skipped} |\n`;
    entry += `| Timed out | ${timedOut} |\n`;
    entry += `| Duration | ${duration}s |\n`;
    entry += `| Status | ${result.status} |\n\n`;

    if (failedTests.length > 0 || timedOutTests.length > 0) {
      entry += `### Failed tests\n\n`;
      for (const t of [...failedTests, ...timedOutTests]) {
        entry += `- **${t.file}** — ${t.title} (${t.status})\n`;
        if (t.error) {
          entry += `  > ${t.error.replace(/\n/g, ' ').slice(0, 150)}\n`;
        }
      }
      entry += '\n';
    }

    // Group passed by file
    const byFile = new Map<string, number>();
    for (const t of this.results.filter((r) => r.status === 'passed')) {
      byFile.set(t.file, (byFile.get(t.file) || 0) + 1);
    }
    if (byFile.size > 0) {
      entry += `### Passed by file\n\n`;
      const sortedFiles = Array.from(byFile.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      for (const [file, count] of sortedFiles) {
        entry += `- ${file}: ${count} tests\n`;
      }
      entry += '\n';
    }

    entry += `---\n`;

    // Ensure reports directory exists
    const reportDir = path.dirname(REPORT_FILE);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Append to file (create with header if doesn't exist)
    if (!fs.existsSync(REPORT_FILE)) {
      fs.writeFileSync(
        REPORT_FILE,
        '# Test Execution Results\n\nAutomatic log from Playwright test runs.\n\n---\n'
      );
    }
    fs.appendFileSync(REPORT_FILE, entry);
  }
}

export default MarkdownReporter;
