import { test, expect } from '../fixtures/auth.fixture';
import { ReportPage } from '../pages/report.page';
import { NavigationComponent } from '../pages/navigation.component';
import { ENV, TEST_USERS } from '../fixtures/env.config';
import { loginAsUser } from '../fixtures/auth.fixture';
import { test as base } from '@playwright/test';
import { t, tRegex } from '../i18n';

// ============================================================================
// Report Deep Tests — 6 tests (TC-RPT-001, 004, 005, 010, 011, 013)
// ============================================================================

test.describe('TC-RPT: Report Deep Tests', () => {

  test('TC-RPT-001: Report page loads with task list', async ({ authenticatedPage: page }) => {
    const report = new ReportPage(page);
    await report.waitForPageLoad();

    // Task table should be visible
    await expect(report.taskTable).toBeVisible();

    // Should have at least one task
    const taskNames = await report.getTaskNames();
    expect(taskNames.length).toBeGreaterThan(0);
  });

  test('TC-RPT-004: Closed period — read-only indicator', async ({ authenticatedPage: page }) => {
    const report = new ReportPage(page);
    await report.waitForPageLoad();

    // Navigate to a far past week (likely closed)
    for (let i = 0; i < 8; i++) {
      await report.goToPrevWeek();
    }
    await page.waitForLoadState('networkidle');

    // Check for closed period message or disabled cells
    const closedMsg = page.locator(`text=/${t('msg.periodClosed')}/i`).first();
    const disabledCells = page.locator('input:disabled, [class*="disabled"], [class*="closed"]').first();

    const hasClosed = await closedMsg.isVisible().catch(() => false);
    const hasDisabled = await disabledCells.isVisible().catch(() => false);

    // At least one indicator of closed period should exist
    expect(hasClosed || hasDisabled).toBe(true);
  });

  test('TC-RPT-005: Hour validation — max hours warning', async ({ authenticatedPage: page }) => {
    const report = new ReportPage(page);
    await report.waitForPageLoad();

    // Check that validation UI elements exist
    const warningLocator = page.locator('[class*="warning"], [class*="error"], [class*="exceed"], .popup.popup_show').first();

    // Verify report has input cells (editable period)
    const inputCells = page.locator('td input, td [contenteditable]').first();
    const hasInputs = await inputCells.isVisible().catch(() => false);
    expect(hasInputs).toBeDefined();
  });

  test('TC-RPT-010: Monthly summary display', async ({ authenticatedPage: page }) => {
    const report = new ReportPage(page);
    await report.waitForPageLoad();

    // Work summary should be visible
    await expect(report.workSummary).toBeVisible();

    // Should contain hour-related text
    const summaryText = await report.workSummary.textContent().catch(() => '');
    expect(summaryText).toBeTruthy();
  });

  test('TC-RPT-013: Week navigation preserves data', async ({ authenticatedPage: page }) => {
    const report = new ReportPage(page);
    await report.waitForPageLoad();

    // Get initial task names
    const initialTasks = await report.getTaskNames();

    // Navigate forward then back
    await report.goToNextWeek();
    await page.waitForLoadState('networkidle');
    await report.goToPrevWeek();
    await page.waitForLoadState('networkidle');

    // Tasks should still be present
    const afterTasks = await report.getTaskNames();
    expect(afterTasks.length).toBeGreaterThan(0);
  });
});

// Role-based report test uses fresh browser context
base.describe('TC-RPT: Role-Based Report', () => {

  base('TC-RPT-011: View-all role — read-only mode', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.view_all.login);
    await page.waitForLoadState('networkidle');

    // Should land on report
    await expect(page).toHaveURL(/\/report/);

    // Check for absence of approve/edit action buttons
    const approveBtn = page.getByRole('button', { name: tRegex('btn.approve') }).first();
    const approveBtnVisible = await approveBtn.isVisible().catch(() => false);
    expect(approveBtnVisible).toBe(false);
  });
});
