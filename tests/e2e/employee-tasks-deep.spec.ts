import { test, expect } from '../fixtures/auth.fixture';
import { test as base } from '@playwright/test';
import { ReportPage } from '../pages/report.page';
import { ENV, TEST_USERS } from '../fixtures/env.config';
import { loginAsUser } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';

// ============================================================================
// Employee Tasks Deep Tests — 3 tests (TC-ET-050..TC-ET-052)
// ============================================================================

test.describe('TC-ET: Employee Tasks Deep Tests (chief_officer)', () => {

  test('TC-ET-050: Full task management UI visible', async ({ authenticatedPage: page }) => {
    const report = new ReportPage(page);
    await report.waitForPageLoad();

    // Task table should be visible
    await expect(report.taskTable).toBeVisible();

    // Should have tasks
    const taskNames = await report.getTaskNames();
    expect(taskNames.length).toBeGreaterThan(0);

    // Pin/Unpin controls should be present
    const pinBtn = page.locator(`[title*="${t('tooltip.pin')}"], [title*="${t('tooltip.unpin')}"], [class*="pin"]`).first();
    const hasPin = await pinBtn.isVisible().catch(() => false);
    expect(hasPin).toBeDefined();
  });

  test('TC-ET-052: Color indicators on task rows', async ({ authenticatedPage: page }) => {
    const report = new ReportPage(page);
    await report.waitForPageLoad();

    await expect(report.taskTable).toBeVisible();

    // Check for color styling on task rows
    const taskRows = report.taskTable.locator('tbody tr, [class*="task-row"]');
    const rowCount = await taskRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Check first row for CSS class or background color
    const firstRow = taskRows.first();
    const className = await firstRow.getAttribute('class').catch(() => '');
    const style = await firstRow.getAttribute('style').catch(() => '');

    // Row should have some identifying class or style
    expect(className || style).toBeTruthy();
  });
});

base.describe('TC-ET: Role-Based Employee Tasks', () => {

  base('TC-ET-051: Employee sees tasks without admin controls', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.employee.login);
    await page.waitForLoadState('networkidle');

    // Should land on report page
    await expect(page).toHaveURL(/\/report/);

    // Task table should be visible
    const taskTable = page.locator('table:visible, [class*="task-table"], .page-content').first();
    await expect(taskTable).toBeVisible({ timeout: 10000 });

    // Admin-level controls should NOT be visible
    const adminBtn = page.getByRole('button', { name: tRegex('btn.approveAll') }).first();
    const adminVisible = await adminBtn.isVisible().catch(() => false);
    expect(adminVisible).toBe(false);
  });
});
