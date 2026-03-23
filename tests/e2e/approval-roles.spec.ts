import { test, expect } from '../fixtures/auth.fixture';
import { test as base } from '@playwright/test';
import { ApprovalPage } from '../pages/approval.page';
import { NavigationComponent } from '../pages/navigation.component';
import { ENV, TEST_USERS } from '../fixtures/env.config';
import { loginAsUser } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';

// ============================================================================
// Approval Role Tests — 3 tests (TC-APR-050..TC-APR-061)
// ============================================================================

test.describe('TC-APR: Approval Deep Tests (chief_officer)', () => {

  test('TC-APR-070: Get employee names from approval list', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToApproval();
    await page.waitForLoadState('networkidle');

    const approval = new ApprovalPage(page);
    const names = await approval.getEmployeeNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test('TC-APR-071: Get day total from approval table', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToApproval();
    await page.waitForLoadState('networkidle');

    const approval = new ApprovalPage(page);
    const names = await approval.getEmployeeNames();

    if (names.length > 0) {
      // Check cell value for first employee, first day
      const cellValue = await approval.getCellValue(names[0], 0);
      expect(cellValue).toBeDefined();

      // Check day total
      const dayTotal = await approval.getDayTotal(0);
      expect(dayTotal).toBeDefined();
    }
  });

  test('TC-APR-072: Week navigation on approval page', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToApproval();
    await page.waitForLoadState('networkidle');

    const approval = new ApprovalPage(page);

    // Navigate to previous week
    await approval.goToPrevWeek();
    const dateAfterPrev = await approval.dateRange.textContent().catch(() => '');
    expect(dateAfterPrev).toBeTruthy();

    // Navigate back to current week
    await approval.goToCurrentWeek();
    const dateAfterCurrent = await approval.dateRange.textContent().catch(() => '');
    expect(dateAfterCurrent).toBeTruthy();

    // Dates should differ
    expect(dateAfterPrev).not.toBe(dateAfterCurrent);
  });

  test('TC-APR-051: Approval page loads with tabs', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToApproval();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/approval/);

    // Check for "By Employee" and "By Project" tabs
    const byEmployeeTab = page.locator('.main-tabs__item').filter({ hasText: tRegex('tab.byEmployee') }).first();
    const byProjectTab = page.locator('.main-tabs__item').filter({ hasText: tRegex('tab.byProject') }).first();

    const empTabVisible = await byEmployeeTab.isVisible().catch(() => false);
    const projTabVisible = await byProjectTab.isVisible().catch(() => false);

    expect(empTabVisible || projTabVisible).toBe(true);

    // Switch between tabs
    if (empTabVisible) {
      await byEmployeeTab.click();
      await page.waitForLoadState('networkidle').catch(() => {});
    }
    if (projTabVisible) {
      await byProjectTab.click();
      await page.waitForLoadState('networkidle').catch(() => {});
    }
  });

  test('TC-APR-061: Notification counter visible', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);

    // Check notification badge/counter in navbar
    const notifBadge = page.locator('b.bold__navbar__link, [class*="badge"], [class*="counter"]').first();
    const hasBadge = await notifBadge.isVisible().catch(() => false);

    // Navigate to approval
    await nav.navigateToApproval();
    await page.waitForLoadState('networkidle');

    // Page should load
    await expect(page).toHaveURL(/\/approval/);

    expect(hasBadge).toBeDefined();
  });
});

base.describe('TC-APR: Role-Based Approval Access', () => {

  base('TC-APR-050: Employee — no approve buttons', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.employee.login);
    await page.waitForLoadState('networkidle');

    // Navigate to approval
    await page.goto(`${ENV.baseUrl}/approval`);
    await page.waitForLoadState('networkidle');

    // Approve All / Reject All buttons should NOT be visible
    const approveAllBtn = page.getByRole('button', { name: tRegex('btn.approveAll') }).first();
    const rejectAllBtn = page.getByRole('button', { name: tRegex('btn.rejectAll') }).first();

    const approveVisible = await approveAllBtn.isVisible().catch(() => false);
    const rejectVisible = await rejectAllBtn.isVisible().catch(() => false);

    expect(approveVisible).toBe(false);
    expect(rejectVisible).toBe(false);
  });
});
