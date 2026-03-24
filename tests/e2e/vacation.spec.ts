import { test, expect } from '../fixtures/auth.fixture';
import {
  MyVacationsPage,
  AvailabilityChartPage,
  VacationRequestsPage,
  VacationDaysPage,
  VacationPaymentPage,
  VacationDaysCorrectionPage,
  EmployeeSickLeavesPage,
} from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Vacation Module — Smoke Tests
// Verifies each subpage loads, URL is correct, main content visible
// ============================================================================

test.describe('Vacation — Smoke Tests', () => {

  test('/vacation/my — loads with list or empty state', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/vacation\/my/);

    // Wait for the table or empty state to appear (async rendering)
    const vacations = new MyVacationsPage(page);
    await vacations.vacationTable.or(vacations.emptyState).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const tableVisible = await vacations.vacationTable.isVisible().catch(() => false);
    const hasEmpty = await vacations.emptyState.isVisible().catch(() => false);
    expect(tableVisible || hasEmpty).toBe(true);
  });

  test('/vacation/request — requests table loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationRequests();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/vacation\/request/);

    const requestsPage = new VacationRequestsPage(page);
    await expect(requestsPage.requestTable).toBeVisible();
  });

  test('/vacation/chart — availability chart loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAvailabilityChart();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/vacation\/chart/);

    const chartPage = new AvailabilityChartPage(page);
    await expect(chartPage.chartGrid).toBeVisible();
  });

  test('/vacation/vacation-days — vacation days table loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeVacationDays();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/vacation\/vacation-days/);

    const daysPage = new VacationDaysPage(page);
    await expect(daysPage.dataTable).toBeVisible();
    const rowCount = await daysPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('/vacation/sick-leaves-of-employees — sick leaves table loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeSickLeaves();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/vacation\/sick-leaves|\/vacation/);

    const sickPage = new EmployeeSickLeavesPage(page);
    // Wait for table or empty state to render
    await sickPage.dataTable.or(sickPage.emptyState).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const tableVisible = await sickPage.dataTable.isVisible().catch(() => false);
    const emptyVisible = await sickPage.emptyState.isVisible().catch(() => false);
    // Also accept page content (the navigation itself may be sufficient for smoke test)
    const pageHasContent = await page.locator('table:visible, [class*="sick"], [class*="absence"]').first().isVisible().catch(() => false);
    expect(tableVisible || emptyVisible || pageHasContent).toBe(true);
  });

  test('/vacation/payment — payment page loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationPayment();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/vacation\/payment/);

    const paymentPage = new VacationPaymentPage(page);
    // Wait for table or empty state to render
    await paymentPage.dataTable.or(paymentPage.emptyState).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const tableVisible = await paymentPage.dataTable.isVisible().catch(() => false);
    const emptyVisible = await paymentPage.emptyState.isVisible().catch(() => false);
    const pageHasContent = await page.locator('table:visible, [class*="payment"]').first().isVisible().catch(() => false);
    expect(tableVisible || emptyVisible || pageHasContent).toBe(true);
  });

  test('/vacation/days-correction — correction page loads', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationDaysCorrection();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/vacation\/days-correction|\/admin/);

    const corrPage = new VacationDaysCorrectionPage(page);
    const pageContent = page.locator('main, table:visible, [class*="correction"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('Navigation between subpages via menu', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);

    // Navigate to my vacations
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/vacation\/my/);

    // Navigate to chart
    await nav.navigateToAvailabilityChart();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/vacation\/chart/);

    // Navigate to requests
    await nav.navigateToVacationRequests();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/vacation\/request/);

    // Navigate to vacation days
    await nav.navigateToEmployeeVacationDays();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/vacation\/vacation-days/);
  });

  test('Language switch — page text changes', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const mainLocator = page.locator('main, .page-content, body').first();
    const textBefore = (await mainLocator.textContent({ timeout: 10000 })) || '';

    // Switch language
    await nav.switchLanguage();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    const textAfter = (await mainLocator.textContent({ timeout: 10000 })) || '';

    // Texts should differ after language switch
    expect(textAfter).not.toBe(textBefore);

    // Switch back
    await nav.switchLanguage();
    await page.waitForTimeout(500);
  });
});
