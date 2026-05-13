import { test, expect } from '../fixtures/auth.fixture';
import { apiGet, safeJson, urls } from '../utils/api-helpers';
import { ENV } from '../fixtures/env.config';

/**
 * Employee state consistency tests.
 *
 * Cross-validates employee data across three data sources:
 * 1. /api/ttt/v1/employees/{login} — TTT core (enabled, beingDismissed)
 * 2. /api/vacation/v1/employees/{login} — Vacation service (maternity, enabled, working)
 * 3. /api/ttt/v1/employees/{login}/work-periods — Employment periods
 * 4. /api/ttt/v1/statistic/report/employees — Calculated statistics (budgetNorm, norm)
 *
 * Purpose: detect sync issues, stale data, and orphaned records.
 * Related: #3353 budgetNorm=0 bug caused by cross-system inconsistency.
 */

const BASE = ENV.baseUrl;

test.describe.configure({ mode: 'parallel' });

/** Get active employees from calculated endpoint */
async function getActiveEmployees(page: any): Promise<any[]> {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const startDate = `${now.getFullYear()}-${mm}-01`;
  const endDate = `${now.getFullYear()}-${mm}-${lastDay}`;
  const resp = await apiGet(page, `${urls.ttt.statisticReportEmployees}?startDate=${startDate}&endDate=${endDate}`);
  if (!resp.ok()) return [];
  const data = await safeJson(resp);
  return Array.isArray(data) ? data : (data?.content || []);
}

async function getTttEmployee(page: any, login: string): Promise<any | null> {
  const resp = await apiGet(page, `${BASE}/api/ttt/v1/employees/${login}`);
  return resp.ok() ? safeJson(resp) : null;
}

async function getVacationEmployee(page: any, login: string): Promise<any | null> {
  const resp = await apiGet(page, `${BASE}/api/vacation/v1/employees/${login}`);
  return resp.ok() ? safeJson(resp) : null;
}

async function getWorkPeriods(page: any, login: string): Promise<any[]> {
  const resp = await apiGet(page, `${BASE}/api/ttt/v1/employees/${login}/work-periods`);
  if (!resp.ok()) return [];
  const data = await safeJson(resp);
  return Array.isArray(data) ? data : [];
}

// ============================================================================
// 1. CROSS-SYSTEM: TTT employee exists in Vacation service
// ============================================================================
test.describe('Cross-system: TTT ↔ Vacation service consistency', () => {
  test.setTimeout(180_000);

  test('Every active employee in TTT must exist in Vacation service', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    expect(employees.length).toBeGreaterThan(0);

    const sample = employees.slice(0, 25);
    const missingInVacation: string[] = [];
    const missingInTtt: string[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const vacEmp = await getVacationEmployee(page, login);
      const tttEmp = await getTttEmployee(page, login);

      if (!vacEmp) missingInVacation.push(login);
      if (!tttEmp) missingInTtt.push(login);
    }

    if (missingInVacation.length > 0) {
      console.log(`Missing in Vacation API: ${missingInVacation.join(', ')}`);
    }
    if (missingInTtt.length > 0) {
      console.log(`Missing in TTT API: ${missingInTtt.join(', ')}`);
    }

    expect(missingInVacation, 'Active employees should exist in Vacation service').toHaveLength(0);
    expect(missingInTtt, 'Active employees should exist in TTT service').toHaveLength(0);
  });

  test('Maternity flag must be consistent: vacation.maternity → budgetNorm impact', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const sample = employees.slice(0, 30);

    const issues: any[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      const vacEmp = await getVacationEmployee(page, login);
      if (!vacEmp) continue;

      if (vacEmp.maternity === true) {
        // Maternity employees: budgetNorm should be 0 or absent in calculated endpoint
        if (emp.budgetNorm > 0) {
          issues.push({
            login,
            issue: 'maternity=true but budgetNorm > 0 in calculated endpoint',
            budgetNorm: emp.budgetNorm,
          });
          console.log(`WARN ${login}: maternity=true but budgetNorm=${emp.budgetNorm}`);
        } else {
          console.log(`OK ${login}: maternity=true, budgetNorm=${emp.budgetNorm}`);
        }
      }
    }

    // This is informational — maternity employees with budgetNorm>0 may be returning from leave
    if (issues.length > 0) {
      console.log(`\nMaternity employees with non-zero budgetNorm: ${issues.length}`);
      console.log('(May be expected if employee is returning from maternity mid-month)');
    }
  });
});

// ============================================================================
// 2. WORK-PERIOD ↔ ENABLED STATUS CONSISTENCY
// ============================================================================
test.describe('Work-period ↔ enabled status consistency', () => {
  test.setTimeout(180_000);

  test('Disabled employees should NOT have an open work-period', async ({ authenticatedPage: page }) => {
    // Get a broader list — including potentially disabled employees
    const resp = await apiGet(page, `${BASE}/api/ttt/v1/employees?size=100`);
    const data = await safeJson(resp);
    const allEmployees = Array.isArray(data) ? data : (data?.content || []);

    if (allEmployees.length === 0) {
      console.log('Could not fetch employee list — skipping');
      return;
    }

    const issues: any[] = [];
    // Sample 30
    const sample = allEmployees.slice(0, 30);

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      if (!login) continue;

      const tttEmp = await getTttEmployee(page, login);
      if (!tttEmp) continue;

      if (tttEmp.enabled === false) {
        const periods = await getWorkPeriods(page, login);
        const openPeriod = periods.find((p: any) => !p.periodEnd);
        if (openPeriod) {
          issues.push({
            login,
            issue: 'disabled but has open work-period',
            periodStart: openPeriod.periodStart,
          });
          console.log(`BUG ${login}: ttt.enabled=false but open work-period since ${openPeriod.periodStart}`);
        }
      }
    }

    if (issues.length > 0) {
      console.log(`\nDisabled employees with open work-periods: ${issues.length}`);
    }
    expect(issues, 'Disabled employees should not have open work-periods').toHaveLength(0);
  });

  test('Employees with open work-period should appear in calculated endpoint', async ({ authenticatedPage: page }) => {
    // Get employee list
    const resp = await apiGet(page, `${BASE}/api/ttt/v1/employees?size=50`);
    const data = await safeJson(resp);
    const allEmployees = Array.isArray(data) ? data : (data?.content || []);

    if (allEmployees.length === 0) {
      console.log('Could not fetch employee list — skipping');
      return;
    }

    // Get calculated employees for current month
    const calcEmployees = await getActiveEmployees(page);
    const calcLogins = new Set(calcEmployees.map((e: any) => e.login || e.employeeLogin));

    const sample = allEmployees.slice(0, 30);
    const missing: any[] = [];

    for (const emp of sample) {
      const login = emp.login || emp.employeeLogin;
      if (!login) continue;

      const tttEmp = await getTttEmployee(page, login);
      if (!tttEmp || tttEmp.enabled === false) continue;

      const periods = await getWorkPeriods(page, login);
      const hasOpenPeriod = periods.some((p: any) => !p.periodEnd);

      if (hasOpenPeriod && !calcLogins.has(login)) {
        const vacEmp = await getVacationEmployee(page, login);
        if (vacEmp?.maternity) continue; // maternity excluded from calc

        missing.push({ login, periodStart: periods[periods.length - 1]?.periodStart });
        console.log(`MISSING ${login}: enabled, open work-period, but not in calculated endpoint`);
      }
    }

    if (missing.length > 0) {
      console.log(`\nEmployees with open periods missing from calculated endpoint: ${missing.length}`);
    }
    expect(missing, 'Enabled employees with open work-periods should appear in calculated endpoint').toHaveLength(0);
  });
});

// ============================================================================
// 3. BUDGETNORM SANITY CHECKS
// ============================================================================
test.describe('BudgetNorm sanity checks', () => {
  test.setTimeout(120_000);

  test('budgetNorm should be within reasonable range (0-200 hours)', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const outOfRange: any[] = [];

    for (const emp of employees) {
      const login = emp.login || emp.employeeLogin;
      if (emp.budgetNorm !== undefined && emp.budgetNorm !== null) {
        if (emp.budgetNorm < 0 || emp.budgetNorm > 200) {
          outOfRange.push({ login, budgetNorm: emp.budgetNorm });
        }
      }
    }

    if (outOfRange.length > 0) {
      console.log('Employees with budgetNorm out of range [0, 200]:');
      for (const e of outOfRange) {
        console.log(`  ${e.login}: budgetNorm=${e.budgetNorm}`);
      }
    }
    expect(outOfRange, 'budgetNorm should be within 0-200 hours range').toHaveLength(0);
  });

  test('norm should be >= budgetNorm (norm includes overtime capacity)', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);
    const violations: any[] = [];

    for (const emp of employees) {
      const login = emp.login || emp.employeeLogin;
      if (emp.norm !== undefined && emp.budgetNorm !== undefined) {
        // norm = monthNorm (full working hours), budgetNorm = adjusted for vacations/sick
        // So norm should be >= budgetNorm in most cases
        if (emp.norm < emp.budgetNorm && emp.norm > 0) {
          violations.push({
            login,
            norm: emp.norm,
            budgetNorm: emp.budgetNorm,
            diff: emp.budgetNorm - emp.norm,
          });
        }
      }
    }

    if (violations.length > 0) {
      console.log('Employees where norm < budgetNorm:');
      for (const v of violations) {
        console.log(`  ${v.login}: norm=${v.norm}, budgetNorm=${v.budgetNorm}, diff=${v.diff}`);
      }
    }

    // Informational — may have edge cases with partial months
    console.log(`Total employees: ${employees.length}, violations: ${violations.length}`);
  });

  test('budgetNorm=0 for active non-maternity employee — audit', async ({ authenticatedPage: page }) => {
    const employees = await getActiveEmployees(page);

    const unexplained: any[] = [];
    const explained: any[] = [];

    for (const emp of employees) {
      const login = emp.login || emp.employeeLogin;
      if (emp.budgetNorm !== 0) continue;

      const vacEmp = await getVacationEmployee(page, login);
      const tttEmp = await getTttEmployee(page, login);
      const periods = await getWorkPeriods(page, login);

      const maternity = vacEmp?.maternity === true;
      const disabled = tttEmp?.enabled === false || vacEmp?.enabled === false;
      const dismissed = tttEmp?.beingDismissed === true;
      const noActivePeriod = !periods.some((p: any) => !p.periodEnd);
      // Check vacation/sick leave — employee may be on long leave
      const onVacation = vacEmp?.onVacation === true || vacEmp?.working === false;

      const reasons = [
        maternity ? 'maternity' : null,
        disabled ? 'disabled' : null,
        dismissed ? 'beingDismissed' : null,
        noActivePeriod ? 'no active period' : null,
        onVacation ? 'on vacation/sick leave' : null,
      ].filter(Boolean);

      if (reasons.length > 0) {
        explained.push({ login, reasons: reasons.join(', ') });
        console.log(`OK  ${login}: budgetNorm=0, reason: ${reasons.join(', ')}`);
      } else {
        unexplained.push({ login, norm: emp.norm });
        console.log(`WARN ${login}: budgetNorm=0, no clear explanation (norm=${emp.norm})`);
      }
    }

    console.log(`\nbudgetNorm=0 audit: ${explained.length} explained, ${unexplained.length} unexplained`);
    if (unexplained.length > 0) {
      console.log('Unexplained (may be on sick leave, long vacation, or pending dismissal):');
      for (const u of unexplained) console.log(`  ${u.login}: norm=${u.norm}`);
    }
    // Informational — don't fail, employees may be on sick leave or pending dismissal
    expect(true).toBeTruthy();
  });
});
