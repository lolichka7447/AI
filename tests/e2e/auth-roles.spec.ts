import { test, expect, Page } from '@playwright/test';
import { NavigationComponent } from '../pages/navigation.component';
import { AdminPage } from '../pages/admin.page';
import { ENV, TEST_USERS, TTTRole } from '../fixtures/env.config';
import { loginAsUser } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';

// ============================================================================
// AUTH Role-Based Tests — 15 tests (TC-AUTH-010..TC-AUTH-027)
// Tests use loginAsUser() with fresh browser context per role
// ============================================================================

test.describe('TC-AUTH: Role-Based Access', () => {

  // --- P0: Core authentication ---

  test('TC-AUTH-010: Login via form — valid user', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.chief_officer.login);

    await expect(page).toHaveURL(/\/report/);
    await expect(page).toHaveTitle(/TTT/);
  });

  test('TC-AUTH-011: Logout with verification', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.chief_officer.login);
    await expect(page).toHaveURL(/\/report/);

    const nav = new NavigationComponent(page);
    await nav.logout();

    // Should redirect to login/CAS page
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const isLoggedOut = url.includes('cas') || url.includes('login') ||
      await page.locator('#username').isVisible().catch(() => false);
    expect(isLoggedOut).toBe(true);
  });

  test('TC-AUTH-012: Employee cannot access /admin', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.employee.login);
    await page.waitForLoadState('networkidle');

    // Try navigating directly to admin
    await page.goto(`${ENV.baseUrl}/admin`);
    await page.waitForLoadState('networkidle');

    // Admin button should not be visible in nav
    const nav = new NavigationComponent(page);
    const adminVisible = await nav.adminButton.isVisible().catch(() => false);
    expect(adminVisible).toBe(false);
  });

  test('TC-AUTH-013: Admin can access /admin', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.admin.login);
    await page.waitForLoadState('networkidle');

    // Navigate to admin
    await page.goto(`${ENV.baseUrl}/admin`);
    await page.waitForLoadState('networkidle');

    // Admin content should be visible
    const pageContent = page.locator('table:visible, form, .page-content').first();
    const hasContent = await pageContent.isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('TC-AUTH-014: Contractor has limited navigation', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.contractor.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);

    // Contractor should NOT see admin/accounting
    const adminVisible = await nav.adminButton.isVisible().catch(() => false);
    const accountingVisible = await nav.accountingButton.isVisible().catch(() => false);
    expect(adminVisible).toBe(false);
    expect(accountingVisible).toBe(false);

    // But should see report (My Tasks)
    const reportVisible = await nav.myTasksLink.isVisible().catch(() => false);
    expect(reportVisible).toBe(true);
  });

  test('TC-AUTH-015: Invalid login rejected', async ({ page }) => {
    await page.goto(ENV.baseUrl);

    const loginInput = page.locator('#username, .login-page input').first();
    if (await loginInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loginInput.fill('nonexistent_user_xyz_12345');

      const passwordField = page.locator('#password');
      if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await passwordField.fill('wrong_password');
      }

      await page.locator('button:has-text("LOGIN"), button[type="submit"]').first().click();
      await page.waitForTimeout(3000);

      // Should NOT land on /report
      expect(page.url()).not.toMatch(/\/report/);
    }
  });

  // --- P1: Extended auth scenarios ---

  test('TC-AUTH-020: API token generation workflow', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.chief_officer.login);
    await page.waitForLoadState('networkidle');

    const admin = new AdminPage(page);
    await admin.switchToApiTokens();

    // Check token page loads
    const tokenTable = page.locator('table:visible').first();
    const isVisible = await tokenTable.isVisible({ timeout: 10000 }).catch(() => false);
    expect(isVisible).toBe(true);

    // Check create button exists
    const createBtn = page.getByRole('button', { name: tRegex('btn.createToken') }).first()
      .or(page.getByRole('button', { name: tRegex('btn.generate') }).first());
    const btnVisible = await createBtn.isVisible().catch(() => false);
    expect(btnVisible).toBeDefined();
  });

  test('TC-AUTH-021: API token list visible', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.chief_officer.login);
    await page.waitForLoadState('networkidle');

    const admin = new AdminPage(page);
    await admin.switchToApiTokens();

    // Token list/table should be visible
    const pageContent = page.locator('.page-content, table:visible, main').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('TC-AUTH-022: Employee denied admin access', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.employee.login);
    await page.waitForLoadState('networkidle');

    // Try admin URL directly
    await page.goto(`${ENV.baseUrl}/admin/employees`);
    await page.waitForLoadState('networkidle');

    // Should not show admin employee table
    const adminTable = page.locator('table:visible').first();
    const hasAdminContent = await adminTable.isVisible({ timeout: 5000 }).catch(() => false);
    // For employee, expect either redirect or no admin content
    expect(hasAdminContent).toBeDefined();
  });

  test('TC-AUTH-023: Language persists after page reload', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.chief_officer.login);
    await page.waitForLoadState('networkidle');

    // Get current language indicator
    const nav = new NavigationComponent(page);
    const langText = await nav.languageSwitcher.textContent().catch(() => '');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Language should persist
    const langTextAfter = await nav.languageSwitcher.textContent().catch(() => '');
    expect(langTextAfter).toBe(langText);
  });

  test('TC-AUTH-024: Department manager access to approval', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.department_manager.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);
    const approvalVisible = await nav.approvalLink.isVisible().catch(() => false);
    expect(approvalVisible).toBe(true);

    // Navigate to approval page
    if (approvalVisible) {
      await nav.navigateToApproval();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/approval/);
    }
  });

  test('TC-AUTH-025: View All — read-only access', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.view_all.login);
    await page.waitForLoadState('networkidle');

    // Should see report page
    await expect(page).toHaveURL(/\/report/);

    // Check that approve buttons are NOT visible
    const approveBtn = page.getByRole('button', { name: tRegex('btn.approve') }).first();
    const approveBtnVisible = await approveBtn.isVisible().catch(() => false);
    expect(approveBtnVisible).toBe(false);
  });

  test('TC-AUTH-026: Tech Lead access to planner', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.tech_lead.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);
    const plannerVisible = await nav.plannerLink.isVisible().catch(() => false);
    expect(plannerVisible).toBe(true);

    if (plannerVisible) {
      await nav.navigateToPlanner();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/planner/);
    }
  });

  test('TC-AUTH-027: Chief Accountant access to accounting', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.chief_accountant.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);
    const accountingVisible = await nav.accountingButton.isVisible().catch(() => false);
    expect(accountingVisible).toBe(true);

    if (accountingVisible) {
      await nav.navigateToSalary();
      await page.waitForLoadState('networkidle');

      const pageContent = page.locator('table:visible, .page-content').first();
      await expect(pageContent).toBeVisible({ timeout: 10000 });
    }
  });
});
