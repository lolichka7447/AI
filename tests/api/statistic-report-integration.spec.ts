import { test, expect } from '../fixtures/auth.fixture';
import { apiGet, safeJson, urls } from '../utils/api-helpers';
import { ENV } from '../fixtures/env.config';

/**
 * Regression tests: /statistic/report (integration endpoint, raw DB)
 * vs /statistic/report/employees (calculated endpoint).
 *
 * Ensures statistic_report table stays in sync with calculated values,
 * especially for new/rehired employees.
 *
 * Related: #3353 (effectiveBounds), production bug with budgetNorm=0.
 */

// Target: STAGE by default (closest to prod), override with TARGET_BASE env var
const BASE = process.env.TARGET_BASE || 'https://ttt-stage.noveogroup.com';
const INTEGRATION_URL = `${BASE}/api/ttt/v1/statistic/report`;
const CALCULATED_URL = `${BASE}/api/ttt/v1/statistic/report/employees`;
const VACATION_EMPLOYEES_URL = `${BASE}/api/vacation/v1/employees`;

// Increase timeout — tests make many API calls
test.use({ actionTimeout: 120_000 });

/** Timezone-safe month boundaries (avoids UTC shift issues) */
function monthRange(year: number, month: number): { startDate: string; endDate: string; reportDate: string } {
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startDate: `${year}-${mm}-01`,
    endDate: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
    reportDate: `${year}-${mm}-01`,
  };
}

function currentMonth() {
  const now = new Date();
  return monthRange(now.getFullYear(), now.getMonth() + 1);
}

function previousMonth() {
  const now = new Date();
  const m = now.getMonth(); // 0-based
  return m === 0
    ? monthRange(now.getFullYear() - 1, 12)
    : monthRange(now.getFullYear(), m);
}

/** Get all integration records (raw DB dump) */
async function getAllIntegrationRecords(page: any): Promise<any[]> {
  const resp = await apiGet(page, INTEGRATION_URL);
  if (resp.status() >= 500) {
    console.log(`WARNING: ${INTEGRATION_URL} returned ${resp.status()} — environment may be down`);
    test.skip(true, `Integration endpoint returned ${resp.status()}`);
  }
  const data = await safeJson(resp);
  return Array.isArray(data) ? data : [];
}

/** Get calculated employees for a month */
async function getCalculatedEmployees(page: any, startDate: string, endDate: string): Promise<any[]> {
  const resp = await apiGet(page, `${CALCULATED_URL}?startDate=${startDate}&endDate=${endDate}`);
  if (resp.status() >= 500) {
    console.log(`WARNING: ${CALCULATED_URL} returned ${resp.status()} — environment may be down`);
    test.skip(true, `Calculated endpoint returned ${resp.status()}`);
  }
  const data = await safeJson(resp);
  return Array.isArray(data) ? data : (data?.content || []);
}

/** Get vacation employee info (maternity, enabled, working) */
async function getVacationEmployee(page: any, login: string): Promise<any> {
  const resp = await apiGet(page, `${VACATION_EMPLOYEES_URL}/${login}`);
  return resp.ok() ? safeJson(resp) : null;
}

/** Get work-periods for employee */
async function getWorkPeriods(page: any, login: string): Promise<any[]> {
  const resp = await apiGet(page, `${BASE}/api/ttt/v1/employees/${login}/work-periods`);
  if (resp.ok()) {
    const data = await safeJson(resp);
    return Array.isArray(data) ? data : [];
  }
  return [];
}

// ============================================================================
// 1. REGRESSION: integration vs calculated — all employees
// ============================================================================
test.describe('REGRESSION: /statistic/report vs /statistic/report/employees', () => {

  test('Current month: every active employee must have a record in integration endpoint', async ({ authenticatedPage: page }) => {
    const { startDate, endDate, reportDate } = currentMonth();
    console.log(`Current month: ${reportDate}`);

    const employees = await getCalculatedEmployees(page, startDate, endDate);
    const allRecords = await getAllIntegrationRecords(page);

    const monthRecords = allRecords.filter((r: any) => r.reportDate === reportDate);
    const intMap = new Map<string, any>();
    for (const r of monthRecords) intMap.set(r.employeeLogin, r);

    console.log(`Calculated: ${employees.length} employees | Integration: ${monthRecords.length} records`);

    const missing: string[] = [];
    const valueMismatch: any[] = [];

    for (const emp of employees) {
      const login = emp.login || emp.employeeLogin;
      const intRecord = intMap.get(login);

      if (!intRecord) {
        missing.push(login);
      } else if (emp.budgetNorm !== undefined && intRecord.budgetNorm !== undefined) {
        if (Math.abs(emp.budgetNorm - intRecord.budgetNorm) > 1) {
          valueMismatch.push({ login, calculated: emp.budgetNorm, integration: intRecord.budgetNorm });
        }
      }
    }

    if (missing.length > 0) {
      console.log(`\nMISSING from integration (${missing.length}): ${missing.join(', ')}`);
    }
    if (valueMismatch.length > 0) {
      console.log(`\nVALUE MISMATCH (${valueMismatch.length}):`);
      for (const m of valueMismatch) {
        console.log(`  ${m.login}: calc=${m.calculated}, int=${m.integration}`);
      }
    }

    expect(missing, `Employees missing from integration for ${reportDate}`).toHaveLength(0);
    expect(valueMismatch, `BudgetNorm mismatch for ${reportDate}`).toHaveLength(0);
  });

  test('Previous month: every active employee must have a record in integration endpoint', async ({ authenticatedPage: page }) => {
    const { startDate, endDate, reportDate } = previousMonth();
    console.log(`Previous month: ${reportDate}`);

    const employees = await getCalculatedEmployees(page, startDate, endDate);
    const allRecords = await getAllIntegrationRecords(page);

    const monthRecords = allRecords.filter((r: any) => r.reportDate === reportDate);
    const intMap = new Map<string, any>();
    for (const r of monthRecords) intMap.set(r.employeeLogin, r);

    console.log(`Calculated: ${employees.length} | Integration: ${monthRecords.length}`);

    const missing: string[] = [];
    for (const emp of employees) {
      const login = emp.login || emp.employeeLogin;
      if (!intMap.has(login)) missing.push(login);
    }

    if (missing.length > 0) {
      console.log(`MISSING (${missing.length}): ${missing.join(', ')}`);
    }

    expect(missing, `Employees missing from integration for ${reportDate}`).toHaveLength(0);
  });
});

// ============================================================================
// 2. REHIRED / NEW EMPLOYEES: integration endpoint check
// ============================================================================
test.describe('REHIRED/NEW: integration records for recently hired employees', () => {

  test('Employees hired in last 3 months must have records for all active months', async ({ authenticatedPage: page }) => {
    test.setTimeout(180_000);

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const y = threeMonthsAgo.getFullYear();
    const m = threeMonthsAgo.getMonth() + 1;
    const cutoff = `${y}-${String(m).padStart(2, '0')}-01`;

    const allRecords = await getAllIntegrationRecords(page);
    const { startDate, endDate } = currentMonth();
    const employees = await getCalculatedEmployees(page, startDate, endDate);

    console.log(`Checking recent hires since ${cutoff}...\n`);

    const issues: any[] = [];
    let checked = 0;

    for (const emp of employees) {
      const login = emp.login || emp.employeeLogin;
      const periods = await getWorkPeriods(page, login);
      if (periods.length === 0) continue;

      const lastPeriod = periods[periods.length - 1];
      if (lastPeriod.periodStart < cutoff) continue;

      checked++;
      const isRehired = periods.length > 1;
      const label = isRehired ? 'REHIRED' : 'NEW';

      const employeeRecords = allRecords.filter((r: any) => r.employeeLogin === login);
      const recordMonths = new Set(employeeRecords.map((r: any) => r.reportDate));

      // Build expected months from start to now
      const startParts = lastPeriod.periodStart.split('-');
      let curY = parseInt(startParts[0]);
      let curM = parseInt(startParts[1]);
      const nowY = now.getFullYear();
      const nowM = now.getMonth() + 1;

      const missingMonths: string[] = [];
      while (curY < nowY || (curY === nowY && curM <= nowM)) {
        const monthStr = `${curY}-${String(curM).padStart(2, '0')}-01`;
        if (!recordMonths.has(monthStr)) missingMonths.push(monthStr);
        curM++;
        if (curM > 12) { curM = 1; curY++; }
      }

      if (missingMonths.length > 0) {
        issues.push({ login, label, lastStart: lastPeriod.periodStart, missingMonths });
        console.log(`FAIL ${label} ${login} (started ${lastPeriod.periodStart}): missing ${missingMonths.join(', ')}`);
      } else {
        console.log(`OK   ${label} ${login} (started ${lastPeriod.periodStart})`);
      }
    }

    console.log(`\nChecked: ${checked} recent hires, issues: ${issues.length}`);
    expect(issues, 'New/rehired employees should have records for all active months').toHaveLength(0);
  });
});

// ============================================================================
// 3. BUDGETNORM=0 VALIDATION: maternity + enabled check
// ============================================================================
test.describe('BUDGETNORM=0: validate against maternity and enabled status', () => {

  test('Every budgetNorm=0 must be explained by maternity OR disabled OR no active work-period', async ({ authenticatedPage: page }) => {
    test.setTimeout(180_000);

    const { reportDate } = currentMonth();
    const allRecords = await getAllIntegrationRecords(page);

    const zeroRecords = allRecords.filter((r: any) =>
      r.reportDate === reportDate && r.budgetNorm === 0
    );

    console.log(`Records with budgetNorm=0 for ${reportDate}: ${zeroRecords.length}\n`);

    if (zeroRecords.length === 0) {
      console.log('No zero-norm records to check.');
      return;
    }

    const unexplained: any[] = [];

    for (const record of zeroRecords) {
      const login = record.employeeLogin;

      // Vacation API: maternity + enabled
      const vacEmp = await getVacationEmployee(page, login);
      const maternity = vacEmp?.maternity === true;
      const vacEnabled = vacEmp?.enabled !== false;

      // TTT API: enabled, beingDismissed
      const tttResp = await apiGet(page, `${BASE}/api/ttt/v1/employees/${login}`);
      let tttEnabled = true;
      let beingDismissed = false;
      if (tttResp.ok()) {
        const d = await safeJson(tttResp);
        tttEnabled = d?.enabled !== false;
        beingDismissed = d?.beingDismissed === true;
      }

      // Work-periods
      const periods = await getWorkPeriods(page, login);
      const hasActivePeriod = periods.some((p: any) => !p.periodEnd);

      const isExplained = maternity || !vacEnabled || !tttEnabled || beingDismissed || !hasActivePeriod;

      const reason = [
        maternity ? 'maternity' : null,
        !vacEnabled ? 'vac:disabled' : null,
        !tttEnabled ? 'ttt:disabled' : null,
        beingDismissed ? 'dismissing' : null,
        !hasActivePeriod ? 'no active period' : null,
      ].filter(Boolean).join(', ') || 'NONE';

      if (!isExplained) {
        unexplained.push({ login, reason });
        console.log(`BUG ${login}: budgetNorm=0, no explanation`);
      } else {
        console.log(`OK  ${login}: ${reason}`);
      }
    }

    console.log(`\nUnexplained budgetNorm=0: ${unexplained.length}`);
    expect(unexplained, 'Active non-maternity employees should not have budgetNorm=0').toHaveLength(0);
  });

  test('Cross-check: budgetNorm=0 in integration but >0 in calculated = definite bug', async ({ authenticatedPage: page }) => {
    const { startDate, endDate, reportDate } = currentMonth();
    console.log(`Cross-checking month: ${reportDate}`);

    const allRecords = await getAllIntegrationRecords(page);
    const monthRecords = allRecords.filter((r: any) => r.reportDate === reportDate);

    const employees = await getCalculatedEmployees(page, startDate, endDate);
    const calcMap = new Map<string, any>();
    for (const emp of employees) calcMap.set(emp.login || emp.employeeLogin, emp);

    console.log(`Integration: ${monthRecords.length} | Calculated: ${employees.length}\n`);

    // 1. Records with budgetNorm=0 in integration but >0 in calculated
    const zeroButShouldnt: any[] = [];
    for (const record of monthRecords) {
      if (record.budgetNorm !== 0) continue;
      const calcEmp = calcMap.get(record.employeeLogin);
      if (calcEmp && calcEmp.budgetNorm > 0) {
        zeroButShouldnt.push({
          login: record.employeeLogin,
          integration: record.budgetNorm,
          calculated: calcEmp.budgetNorm,
        });
        console.log(`BUG ${record.employeeLogin}: int=0, calc=${calcEmp.budgetNorm}`);
      }
    }

    // 2. Active employees missing from integration entirely
    const intLogins = new Set(monthRecords.map((r: any) => r.employeeLogin));
    const missingWithNorm: any[] = [];
    for (const emp of employees) {
      const login = emp.login || emp.employeeLogin;
      if (!intLogins.has(login) && emp.budgetNorm > 0) {
        missingWithNorm.push({ login, calculatedNorm: emp.budgetNorm });
        console.log(`BUG ${login}: missing from integration, calc=${emp.budgetNorm}`);
      }
    }

    const total = zeroButShouldnt.length + missingWithNorm.length;
    console.log(`\nTotal discrepancies: ${total}`);

    expect(zeroButShouldnt, 'budgetNorm=0 in integration but >0 in calculated').toHaveLength(0);
    expect(missingWithNorm, 'Active employees with norm>0 missing from integration').toHaveLength(0);
  });
});

// ============================================================================
// 4. MONTHNORM CONSISTENCY: integration vs calculated
// ============================================================================
test.describe('MONTHNORM: integration vs calculated consistency', () => {

  test('monthNorm in integration must match norm in calculated (tolerance ±1h)', async ({ authenticatedPage: page }) => {
    test.setTimeout(120_000);
    const { startDate, endDate, reportDate } = currentMonth();
    console.log(`monthNorm check for: ${reportDate}`);

    const allRecords = await getAllIntegrationRecords(page);
    const monthRecords = allRecords.filter((r: any) => r.reportDate === reportDate);

    const employees = await getCalculatedEmployees(page, startDate, endDate);
    const calcMap = new Map<string, any>();
    for (const emp of employees) calcMap.set(emp.login || emp.employeeLogin, emp);

    const mismatches: any[] = [];

    for (const record of monthRecords) {
      const calcEmp = calcMap.get(record.employeeLogin);
      if (!calcEmp) continue;

      // Integration uses monthNorm, calculated uses norm
      const intNorm = record.monthNorm ?? record.norm;
      const calcNorm = calcEmp.norm ?? calcEmp.monthNorm;

      if (intNorm !== undefined && calcNorm !== undefined) {
        if (Math.abs(intNorm - calcNorm) > 1) {
          mismatches.push({
            login: record.employeeLogin,
            intMonthNorm: intNorm,
            calcNorm: calcNorm,
            diff: Math.abs(intNorm - calcNorm),
          });
        }
      }
    }

    if (mismatches.length > 0) {
      console.log(`monthNorm mismatches (${mismatches.length}):`);
      for (const m of mismatches) {
        console.log(`  ${m.login}: integration=${m.intMonthNorm}, calculated=${m.calcNorm}, diff=${m.diff}`);
      }
    }

    expect(mismatches, 'monthNorm should match between integration and calculated endpoints').toHaveLength(0);
  });
});

// ============================================================================
// 5. REPORTED EFFORT SANITY: negative or unreasonable values
// ============================================================================
test.describe('REPORTED EFFORT: sanity checks on integration data', () => {

  test('reportedEffort must be >= 0 and <= 744 (max hours in a month)', async ({ authenticatedPage: page }) => {
    const { reportDate } = currentMonth();
    const allRecords = await getAllIntegrationRecords(page);
    const monthRecords = allRecords.filter((r: any) => r.reportDate === reportDate);

    const invalid: any[] = [];

    for (const record of monthRecords) {
      const effort = record.reportedEffort;
      if (effort === undefined || effort === null) continue;

      if (effort < 0) {
        invalid.push({ login: record.employeeLogin, reportedEffort: effort, issue: 'negative' });
      } else if (effort > 744) {
        invalid.push({ login: record.employeeLogin, reportedEffort: effort, issue: 'exceeds max hours' });
      }
    }

    if (invalid.length > 0) {
      console.log('Invalid reportedEffort values:');
      for (const i of invalid) {
        console.log(`  ${i.login}: ${i.reportedEffort} (${i.issue})`);
      }
    }
    expect(invalid, 'reportedEffort should be within valid range [0, 744]').toHaveLength(0);
  });

  test('reportedEffort should not exceed monthNorm by more than 100% (extreme overtime)', async ({ authenticatedPage: page }) => {
    const { reportDate } = currentMonth();
    const allRecords = await getAllIntegrationRecords(page);
    const monthRecords = allRecords.filter((r: any) => r.reportDate === reportDate);

    const extremeOvertime: any[] = [];

    for (const record of monthRecords) {
      const effort = record.reportedEffort;
      const norm = record.monthNorm;
      if (!effort || !norm || norm === 0) continue;

      const ratio = effort / norm;
      if (ratio > 2.0) {
        extremeOvertime.push({
          login: record.employeeLogin,
          reportedEffort: effort,
          monthNorm: norm,
          ratio: ratio.toFixed(2),
        });
      }
    }

    if (extremeOvertime.length > 0) {
      console.log(`Extreme overtime (effort > 2x norm): ${extremeOvertime.length}`);
      for (const e of extremeOvertime) {
        console.log(`  ${e.login}: effort=${e.reportedEffort}, norm=${e.monthNorm}, ratio=${e.ratio}x`);
      }
    }
    // Informational — extreme overtime might be legitimate
    console.log(`Total records: ${monthRecords.length}, extreme overtime: ${extremeOvertime.length}`);
  });
});

// ============================================================================
// 6. MULTI-MONTH COVERAGE: last 6 months record completeness
// ============================================================================
test.describe('MULTI-MONTH: record completeness for last 6 months', () => {

  test('Integration endpoint should have records for all 6 recent months', async ({ authenticatedPage: page }) => {
    test.setTimeout(120_000);
    const allRecords = await getAllIntegrationRecords(page);
    if (allRecords.length === 0) {
      console.log('No integration records available');
      return;
    }

    const now = new Date();
    const months: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${y}-${m}-01`);
    }

    console.log(`Checking months: ${months.join(', ')}\n`);

    const monthCounts = new Map<string, number>();
    for (const r of allRecords) {
      const count = monthCounts.get(r.reportDate) || 0;
      monthCounts.set(r.reportDate, count + 1);
    }

    const emptyMonths: string[] = [];
    for (const month of months) {
      const count = monthCounts.get(month) || 0;
      console.log(`${month}: ${count} records`);
      if (count === 0) emptyMonths.push(month);
    }

    if (emptyMonths.length > 0) {
      console.log(`\nMonths with ZERO records: ${emptyMonths.join(', ')}`);
    }
    expect(emptyMonths, 'All recent months should have integration records').toHaveLength(0);
  });

  test('Employee count should be consistent across recent months (no sudden drops)', async ({ authenticatedPage: page }) => {
    test.setTimeout(120_000);
    const allRecords = await getAllIntegrationRecords(page);
    if (allRecords.length === 0) return;

    const now = new Date();
    const monthCounts: { month: string; count: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const month = `${y}-${m}-01`;
      const count = allRecords.filter((r: any) => r.reportDate === month).length;
      monthCounts.push({ month, count });
    }

    console.log('Employee count by month:');
    for (const mc of monthCounts) {
      console.log(`  ${mc.month}: ${mc.count}`);
    }

    // Check for sudden drops (>30% decrease month-over-month)
    const drops: any[] = [];
    for (let i = 0; i < monthCounts.length - 1; i++) {
      const curr = monthCounts[i];
      const prev = monthCounts[i + 1];
      if (prev.count > 0 && curr.count > 0) {
        const dropPct = ((prev.count - curr.count) / prev.count) * 100;
        if (dropPct > 30) {
          drops.push({
            from: prev.month,
            to: curr.month,
            fromCount: prev.count,
            toCount: curr.count,
            dropPct: dropPct.toFixed(1),
          });
        }
      }
    }

    if (drops.length > 0) {
      console.log('\nSudden drops in employee count:');
      for (const d of drops) {
        console.log(`  ${d.from} (${d.fromCount}) → ${d.to} (${d.toCount}): -${d.dropPct}%`);
      }
    }
    expect(drops, 'Employee count should not drop >30% between months (indicates sync issue)').toHaveLength(0);
  });
});
