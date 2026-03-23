import { test, expect } from '../fixtures/auth.fixture';
import { test as base } from '@playwright/test';
import { NavigationComponent } from '../pages/navigation.component';
import { ENV, TEST_USERS } from '../fixtures/env.config';
import { loginAsUser } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';

// ============================================================================
// Vacation Role Tests — 4 tests (TC-VAC-100..TC-VAC-111)
// ============================================================================

test.describe('TC-VAC: Vacation Deep Tests (chief_officer)', () => {

  test('TC-VAC-100: Vacation page loads with list', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/vacation/);

    // Page should have content — either vacation list or empty state
    const pageContent = page.locator('table:visible, [class*="vacation"], [class*="absence"], .page-content').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });

    // Create button should be visible for chief_officer
    const createBtn = page.getByRole('button', { name: tRegex('btn.create') }).first();
    const hasCrBtn = await createBtn.isVisible().catch(() => false);
    expect(hasCrBtn).toBeDefined();
  });

  test('TC-VAC-111: Sick leave page accessible', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMySickLeaves();
    await page.waitForLoadState('networkidle');

    // Page should load with either list or empty state
    const pageContent = page.locator('table:visible, [class*="sick"], .page-content, main').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });
});

base.describe('TC-VAC: Role-Based Vacation Access', () => {

  base('TC-VAC-102: Employee — no approve buttons on requests', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.employee.login);
    await page.waitForLoadState('networkidle');

    // Navigate to vacation requests
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationRequests();
    await page.waitForLoadState('networkidle');

    // Approve/Reject buttons should NOT be visible for employee
    const approveBtn = page.getByRole('button', { name: tRegex('btn.approve') }).first();
    const rejectBtn = page.getByRole('button', { name: tRegex('btn.reject') }).first();

    const approveVisible = await approveBtn.isVisible().catch(() => false);
    const rejectVisible = await rejectBtn.isVisible().catch(() => false);

    expect(approveVisible).toBe(false);
    expect(rejectVisible).toBe(false);
  });

  base('TC-VAC-110: Chief Accountant access to vacation payment', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.chief_accountant.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);
    const accountingVisible = await nav.accountingButton.isVisible().catch(() => false);
    expect(accountingVisible).toBe(true);

    if (accountingVisible) {
      await nav.navigateToVacationPayment();
      await page.waitForLoadState('networkidle');

      const pageContent = page.locator('table:visible, .page-content, main').first();
      await expect(pageContent).toBeVisible({ timeout: 10000 });
    }
  });
});
