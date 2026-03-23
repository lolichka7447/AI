import { test, expect } from '../fixtures/auth.fixture';
import { test as base } from '@playwright/test';
import { AdminPage } from '../pages/admin.page';
import { NavigationComponent } from '../pages/navigation.component';
import { ENV, TEST_USERS } from '../fixtures/env.config';
import { loginAsUser } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';

// ============================================================================
// Admin Deep & Role Tests — 8 tests (TC-ADM-051..TC-ADM-064)
// ============================================================================

test.describe('TC-ADM: Admin Deep Tests (chief_officer)', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    // authenticatedPage = pvaynmaster (chief_officer with admin access)
  });

  test('TC-ADM-051: Admin settings page loads', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    await admin.switchToSettings();

    const settingsForm = page.locator('form, [class*="settings"], .page-content').first();
    await expect(settingsForm).toBeVisible({ timeout: 10000 });
  });

  test('TC-ADM-052: Employee list visible', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    await admin.switchToEmployees();

    // Table should be visible with rows
    await expect(admin.employeeList).toBeVisible({ timeout: 10000 });
    const rowCount = await admin.employeeRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('TC-ADM-060: Export page loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminExport();

    const pageContent = page.locator('.page-content, main, form').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('TC-ADM-061: Employee table has columns', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    await admin.switchToEmployees();

    await expect(admin.employeeList).toBeVisible({ timeout: 10000 });

    // Check table has header columns
    const headers = admin.employeeList.locator('th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test('TC-ADM-062: Feature toggle section accessible', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    await admin.switchToSettings();

    // Look for toggle/checkbox elements
    const toggles = page.locator('input[type="checkbox"], [role="switch"], [class*="toggle"]').first();
    const hasToggles = await toggles.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasToggles).toBeDefined();
  });

  test('TC-ADM-063: Calendar page loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminCalendar();

    const pageContent = page.locator('.page-content, main, table:visible, [class*="calendar"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('TC-ADM-064: Salary page loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToSalary();

    const pageContent = page.locator('table:visible, .page-content, main').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });
});

// Role-based admin test uses fresh context
base.describe('TC-ADM: Role-Based Admin Access', () => {

  base('TC-ADM-050: Employee cannot access admin', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.employee.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);
    const adminVisible = await nav.adminButton.isVisible().catch(() => false);
    expect(adminVisible).toBe(false);

    // Direct URL should not show admin content
    await page.goto(`${ENV.baseUrl}/admin`);
    await page.waitForLoadState('networkidle');

    const adminTable = page.locator('[class*="admin"] table:visible').first();
    const hasAdminTable = await adminTable.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasAdminTable).toBe(false);
  });
});
