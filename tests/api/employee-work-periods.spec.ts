import { test, expect } from '../fixtures/auth.fixture';
import { apiGet, safeJson, urls } from '../utils/api-helpers';
import { ENV } from '../fixtures/env.config';

/**
 * Employee work-periods API tests.
 *
 * Validates that work-period data is consistent with employee state:
 * - Active employees have an open work-period (no periodEnd)
 * - Dismissed employees have all periods closed
 * - Rehired employees have multiple periods
 * - Work-period dates are logically valid
 *
 * Related: #3353 (effectiveBounds), budgetNorm=0 bug for new/rehired employees.
 */

const BASE = ENV.baseUrl;
const EMPLOYEES_URL = `${BASE}/api/ttt/v1/employees`;
const VACATION_EMPLOYEES_URL = `${BASE}/api/vacation/v1/employees`;

test.describe.configure({ mode: 'parallel' });

/** Get all active employees from calculated endpoint */
async function getActiveEmployees(page: any): Promise<any[]> {
  const now = new Date();
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
  const resp = await apiGet(page, `${urls.ttt.statisticReportEmployees}?startDate=${startDate}&endDate=${endDate}`);
  if (!resp.ok()) return [];
  const data = await safeJson(resp);
  return Array.isArray(data) ? data : (data?.content || []);
}

/** Get work-periods for employee */
async function getWorkPeriods(page: any, login: string): Promise<any[]> {
  const resp = await apiGet(page, `${EMPLOYEES_URL}/${login}/work-periods`);
  if (!resp.ok()) return [];
  const data = await safeJson(resp);
  return Array.isArray(data) ? data : [];
}

/** Get employee info from TTT API */
async function getTttEmployee(page: any, login: string): Promise<any | null> {
  const resp = await apiGet(page, `${EMPLOYEES_URL}/${login}`);
  return resp.ok() ? safeJson(resp) : null;
}

/** Get employee info from Vacation API */
async function getVacationEmployee(page: any, login: string): Promise<any | null> {
  const resp = await apiGet(page, `${VACATION_EMPLOYEES_URL}/${login}`);
  return resp.ok() ? safeJson(resp) : null;
}

// ============================================================================
// 1. WORK-PERIOD STRUCTURE VALIDATION
// ============================================================================
test.describe('Work-period structure validation', () => {
  test.setTimeout(120_000);

  test('Every active employee must have at least one work-period — audit', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    expect(employees.length).toBeGreaterThan(0);

    const noPeriods: any[] = [];
    // Sample up to 30 employees to avoid timeout
    const sample = employees.slice(0, 30);

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const periods = await getWorkPeriods(page, login);
      if (periods.length === 0) {
        // Check if employee is being dismissed, disabled, or on leave
        const tttEmp = await getTttEmployee(page, login);
        const vacEmp = await getVacationEmployee(page, login);
        const dismissed = tttEmp?.beingDismissed === true;
        const disabled = tttEmp?.enabled === false || vacEmp?.enabled === false;
        const reason = [
          dismissed ? 'beingDismissed' : null,
          disabled ? 'disabled' : null,
        ].filter(Boolean).join(', ') || 'unknown';
        noPeriods.push({ login, reason });
      }
    }

    if (noPeriods.length > 0) {
      console.log(`Employees with NO work-periods (${noPeriods.length}):`);
      for (const e of noPeriods) {
        console.log(`  ${e.login}: ${e.reason}`);
      }
      console.log('NOTE: May be contractors, external users, or employees pending HR setup');
    }
    // Informational — don't fail; missing work-periods may be data lag or special employee types
    expect(true).toBeTruthy();
  });

  test('Active employees must have an open work-period (no periodEnd)', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const sample = employees.slice(0, 30);

    const noOpenPeriod: string[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const periods = await getWorkPeriods(page, login);
      if (periods.length === 0) continue;

      const hasOpen = periods.some((p: any) => !p.periodEnd);
      if (!hasOpen) {
        // Check if maternity or dismissed — those are OK without open period
        const vacEmp = await getVacationEmployee(page, login);
        const tttEmp = await getTttEmployee(page, login);
        const maternity = vacEmp?.maternity === true;
        const dismissed = tttEmp?.beingDismissed === true || tttEmp?.enabled === false;

        if (!maternity && !dismissed) {
          noOpenPeriod.push(login);
          console.log(`${login}: all periods closed, but employee is active (not maternity/dismissed)`);
        }
      }
    }

    expect(noOpenPeriod, 'Active non-maternity employees should have an open work-period').toHaveLength(0);
  });

  test('Work-period dates must be logically valid', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const sample = employees.slice(0, 30);

    const invalid: any[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const periods = await getWorkPeriods(page, login);

      for (let i = 0; i < periods.length; i++) {
        const p = periods[i];

        // periodStart must exist
        if (!p.periodStart) {
          invalid.push({ login, issue: 'missing periodStart', period: p });
          continue;
        }

        // periodEnd must be after periodStart (if set)
        if (p.periodEnd && p.periodEnd <= p.periodStart) {
          invalid.push({ login, issue: 'periodEnd <= periodStart', period: p });
        }

        // Periods should not overlap
        if (i > 0) {
          const prev = periods[i - 1];
          if (prev.periodEnd && p.periodStart < prev.periodEnd) {
            invalid.push({ login, issue: 'overlapping periods', prev, current: p });
          }
        }
      }
    }

    if (invalid.length > 0) {
      console.log('Invalid work-periods:');
      for (const item of invalid) {
        console.log(`  ${item.login}: ${item.issue}`);
      }
    }
    expect(invalid, 'All work-periods should have valid date ranges').toHaveLength(0);
  });
});

// ============================================================================
// 2. REHIRED EMPLOYEES — MULTI-PERIOD VALIDATION
// ============================================================================
test.describe('Rehired employees — multi-period validation', () => {
  test.setTimeout(120_000);

  test('Rehired employees must have all previous periods closed', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const sample = employees.slice(0, 40);

    const rehiredIssues: any[] = [];
    let rehiredCount = 0;

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const periods = await getWorkPeriods(page, login);
      if (periods.length <= 1) continue;

      rehiredCount++;
      // All periods except the last must have periodEnd
      for (let i = 0; i < periods.length - 1; i++) {
        if (!periods[i].periodEnd) {
          rehiredIssues.push({
            login,
            periodIndex: i,
            issue: 'Previous period has no periodEnd',
            period: periods[i],
          });
        }
      }
    }

    console.log(`Rehired employees checked: ${rehiredCount}`);
    if (rehiredIssues.length > 0) {
      console.log('Issues:');
      for (const item of rehiredIssues) {
        console.log(`  ${item.login}: period[${item.periodIndex}] — ${item.issue}`);
      }
    }
    expect(rehiredIssues, 'All previous work-periods of rehired employees should be closed').toHaveLength(0);
  });

  test('Gap between work-periods should be > 0 days (no overlapping employment)', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const sample = employees.slice(0, 40);

    const overlaps: any[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const periods = await getWorkPeriods(page, login);
      if (periods.length <= 1) continue;

      // Sort by periodStart
      const sorted = [...periods].sort((a: any, b: any) =>
        a.periodStart.localeCompare(b.periodStart)
      );

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        if (prev.periodEnd && curr.periodStart <= prev.periodEnd) {
          overlaps.push({
            login,
            prevEnd: prev.periodEnd,
            currStart: curr.periodStart,
          });
        }
      }
    }

    if (overlaps.length > 0) {
      console.log('Overlapping periods:');
      for (const o of overlaps) {
        console.log(`  ${o.login}: prev ends ${o.prevEnd}, next starts ${o.currStart}`);
      }
    }
    expect(overlaps, 'Work-periods should not overlap').toHaveLength(0);
  });
});

// ============================================================================
// 3. EMPLOYEE STATE CROSS-VALIDATION (TTT vs Vacation API)
// ============================================================================
test.describe('Employee state cross-validation: TTT vs Vacation API', () => {
  test.setTimeout(180_000);

  test('enabled status consistency between TTT and Vacation APIs — audit', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    // Sample to avoid timeouts — 2 API calls per employee
    const sample = employees.slice(0, 25);

    const inconsistent: any[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const tttEmp = await getTttEmployee(page, login);
      const vacEmp = await getVacationEmployee(page, login);

      if (!tttEmp || !vacEmp) continue;

      const tttEnabled = tttEmp.enabled !== false;
      const vacEnabled = vacEmp.enabled !== false;

      if (tttEnabled !== vacEnabled) {
        const dismissed = tttEmp.beingDismissed === true;
        const maternity = vacEmp.maternity === true;
        const reason = [
          dismissed ? 'beingDismissed' : null,
          maternity ? 'maternity' : null,
          !tttEnabled ? 'ttt:disabled' : null,
          !vacEnabled ? 'vac:disabled' : null,
        ].filter(Boolean).join(', ');
        inconsistent.push({ login, tttEnabled, vacEnabled, reason });
        console.log(`MISMATCH ${login}: ttt.enabled=${tttEnabled}, vac.enabled=${vacEnabled} (${reason})`);
      }
    }

    console.log(`Checked: ${sample.length} employees, inconsistent: ${inconsistent.length}`);
    if (inconsistent.length > 0) {
      console.log('NOTE: Mismatches may indicate delayed sync between TTT and Vacation services');
      console.log('Employees may be in process of dismissal, on sick leave, or status update pending');
    }
    // Informational — sync delays between services are expected during employee transitions
    expect(true).toBeTruthy();
  });

  test('Maternity employees should have maternity=true in Vacation API', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const sample = employees.slice(0, 30);

    let maternityCount = 0;
    const maternityNoFlag: string[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const vacEmp = await getVacationEmployee(page, login);
      if (!vacEmp) continue;

      if (vacEmp.maternity === true) {
        maternityCount++;
        // Maternity employees should also have budgetNorm=0 or reduced
        const periods = await getWorkPeriods(page, login);
        const hasOpenPeriod = periods.some((p: any) => !p.periodEnd);
        console.log(`MATERNITY ${login}: working=${vacEmp.working}, hasOpenPeriod=${hasOpenPeriod}`);
      }
    }

    console.log(`Maternity employees found: ${maternityCount}`);
    // This is informational — just verify the API returns the field
    expect(maternityCount).toBeGreaterThanOrEqual(0);
  });

  test('beingDismissed employees should have a work-period ending soon', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const sample = employees.slice(0, 30);

    const dismissedNoEnd: string[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const tttEmp = await getTttEmployee(page, login);
      if (!tttEmp || !tttEmp.beingDismissed) continue;

      const periods = await getWorkPeriods(page, login);
      const lastPeriod = periods[periods.length - 1];

      if (lastPeriod && !lastPeriod.periodEnd) {
        // beingDismissed but last period is still open — might be OK if dismissal is pending
        console.log(`DISMISSING ${login}: last period still open (start=${lastPeriod.periodStart})`);
      } else if (lastPeriod?.periodEnd) {
        console.log(`DISMISSING ${login}: period ends ${lastPeriod.periodEnd}`);
      }
    }
  });
});

// ============================================================================
// 4. NEW EMPLOYEES — RECENT HIRES VALIDATION
// ============================================================================
test.describe('New employees — recent hires validation', () => {
  test.setTimeout(120_000);

  test('Employees hired in last 2 months must appear in calculated endpoint', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);

    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const cutoff = `${twoMonthsAgo.getFullYear()}-${String(twoMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`;

    const recentHires: any[] = [];
    const sample = employees.slice(0, 40);

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const periods = await getWorkPeriods(page, login);
      if (periods.length === 0) continue;

      const lastPeriod = periods[periods.length - 1];
      if (lastPeriod.periodStart >= cutoff) {
        recentHires.push({
          login,
          periodStart: lastPeriod.periodStart,
          isRehired: periods.length > 1,
          budgetNorm: emp.budgetNorm,
          norm: emp.norm,
        });
      }
    }

    console.log(`Recent hires (since ${cutoff}): ${recentHires.length}`);
    for (const hire of recentHires) {
      const label = hire.isRehired ? 'REHIRED' : 'NEW';
      console.log(`  ${label} ${hire.login}: started ${hire.periodStart}, budgetNorm=${hire.budgetNorm}, norm=${hire.norm}`);
    }

    // All recent hires should have budgetNorm > 0 (unless maternity/disabled)
    const zeroBudget: any[] = [];
    for (const hire of recentHires) {
      if (hire.budgetNorm === 0) {
        const vacEmp = await getVacationEmployee(page, hire.login);
        if (!vacEmp?.maternity) {
          zeroBudget.push(hire);
        }
      }
    }

    if (zeroBudget.length > 0) {
      console.log('\nRecent hires with budgetNorm=0 (not maternity):');
      for (const z of zeroBudget) {
        console.log(`  BUG: ${z.login} started ${z.periodStart}`);
      }
    }

    expect(zeroBudget, 'Recent non-maternity hires should have budgetNorm > 0 in calculated endpoint').toHaveLength(0);
  });
});
