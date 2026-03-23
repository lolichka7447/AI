import { test, expect } from '../fixtures/auth.fixture';
import { test as base } from '@playwright/test';
import { NavigationComponent } from '../pages/navigation.component';
import { ENV, TEST_USERS } from '../fixtures/env.config';
import { loginAsUser } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';

// ============================================================================
// Accounting Role Tests — 3 tests (TC-ACC-050..TC-ACC-060)
// ============================================================================

base.describe('TC-ACC: Role-Based Accounting Access', () => {

  base('TC-ACC-050: Chief Accountant can access accounting', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.chief_accountant.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);

    // Accounting button should be visible
    const accountingVisible = await nav.accountingButton.isVisible().catch(() => false);
    expect(accountingVisible).toBe(true);

    // Navigate to salary
    await nav.navigateToSalary();
    await page.waitForLoadState('networkidle');

    const pageContent = page.locator('table:visible, .page-content, main').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  base('TC-ACC-051: Employee cannot access accounting', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.employee.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);

    // Accounting button should NOT be visible for employee
    const accountingVisible = await nav.accountingButton.isVisible().catch(() => false);
    expect(accountingVisible).toBe(false);

    // Direct URL should not show accounting content
    await page.goto(`${ENV.baseUrl}/admin/salary`);
    await page.waitForLoadState('networkidle');

    // Should not see salary table
    const salaryTable = page.locator('[class*="salary"] table:visible').first();
    const hasSalary = await salaryTable.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasSalary).toBe(false);
  });
});

test.describe('TC-ACC: Accounting Deep Tests (chief_officer)', () => {

  test('TC-ACC-060: Periods page with table', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToPeriodsChange();
    await page.waitForLoadState('networkidle');

    const pageContent = page.locator('table:visible, .page-content, main').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });

    // Check for period rows in table
    const table = page.locator('table:visible').first();
    const tableVisible = await table.isVisible().catch(() => false);
    expect(tableVisible).toBe(true);
  });
});
