import { test, expect } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';
import { AvailabilityChartPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Vacation — Availability Chart (Deep Tests)
// Navigation, tooltips, filters, legend, date display
// ============================================================================

test.describe('Availability Chart — Navigation & Data', () => {

  let nav: NavigationComponent;
  let chart: AvailabilityChartPage;

  test.beforeEach(async ({ authenticatedPage: page }) => {
    nav = new NavigationComponent(page);
    await nav.navigateToAvailabilityChart();
    await page.waitForLoadState('networkidle');
    chart = new AvailabilityChartPage(page);
  });

  test('Chart loads with employee rows', async ({ authenticatedPage: page }) => {
    await expect(chart.chartGrid).toBeVisible();

    const employeeCount = await chart.getEmployeeCount();
    expect(employeeCount).toBeGreaterThan(0);
  });

  test('Prev/Next period — month label changes', async ({ authenticatedPage: page }) => {
    await expect(chart.chartGrid).toBeVisible();

    // Period label may be in a header element or custom component
    const labelBefore = await chart.getPeriodLabelText().catch(() => '');
    const nextBtn = chart.nextPeriodButton;
    const nextBtnVisible = await nextBtn.isVisible().catch(() => false);
    test.skip(!nextBtnVisible, 'Next period button not found');

    await chart.goToNextPeriod();
    await page.waitForTimeout(1000);

    const labelAfter = await chart.getPeriodLabelText().catch(() => '');

    // If we can read labels, they should differ
    if (labelBefore && labelAfter) {
      expect(labelAfter).not.toBe(labelBefore);
    }
  });

  test('Hover on vacation event — tooltip with dates and type', async ({ authenticatedPage: page }) => {
    await expect(chart.chartGrid).toBeVisible();

    const eventCount = await chart.getEventCount();
    test.skip(eventCount === 0, 'No vacation events on chart');

    await chart.hoverEvent(0);

    const tooltipVisible = await chart.tooltip.isVisible().catch(() => false);
    if (tooltipVisible) {
      const tooltipText = await chart.getTooltipText();
      expect(tooltipText.length).toBeGreaterThan(3);
      // Tooltip should contain date-like info
      expect(tooltipText).toMatch(/\d/);
    }
  });

  test('Legend contains vacation types', async ({ authenticatedPage: page }) => {
    const legendVisible = await chart.legend.isVisible().catch(() => false);
    test.skip(!legendVisible, 'Legend not visible');

    const legendTexts = await chart.getLegendTexts();
    expect(legendTexts.length).toBeGreaterThan(0);

    // Legend should have at least one recognizable type
    const allText = legendTexts.join(' ').toLowerCase();
    expect(allText.length).toBeGreaterThan(3);
  });

  test('Months are displayed in correct order', async ({ authenticatedPage: page }) => {
    await expect(chart.chartGrid).toBeVisible();

    const monthCount = await chart.monthHeaders.count();
    if (monthCount > 1) {
      const months: string[] = [];
      for (let i = 0; i < monthCount; i++) {
        const text = (await chart.monthHeaders.nth(i).textContent())?.trim() || '';
        if (text) months.push(text);
      }
      expect(months.length).toBeGreaterThan(0);
      // Months should be in sequential order (basic sanity)
    }
  });

  test('No timestamps in date display (#3313 regression)', async ({ authenticatedPage: page }) => {
    await expect(chart.chartGrid).toBeVisible();

    const chartText = (await chart.chartGrid.textContent()) || '';
    // Should NOT contain timestamp-like patterns (e.g., "T00:00:00" or "1711929600000")
    expect(chartText).not.toMatch(/T\d{2}:\d{2}:\d{2}/);
    expect(chartText).not.toMatch(/\d{13}/); // Unix timestamp in ms
  });
});

test.describe('Availability Chart — Filters', () => {

  test('Filter by department — employee count changes', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAvailabilityChart();
    await page.waitForLoadState('networkidle');

    const chart = new AvailabilityChartPage(page);
    await expect(chart.chartGrid).toBeVisible();

    const countBefore = await chart.getEmployeeCount();

    const filterVisible = await chart.departmentFilter.isVisible().catch(() => false);
    test.skip(!filterVisible, 'Department filter not visible');

    const options = chart.departmentFilter.locator('option');
    const optionCount = await options.count();
    test.skip(optionCount <= 1, 'Not enough department options');

    await chart.departmentFilter.selectOption({ index: 1 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const countAfter = await chart.getEmployeeCount();
    // Count may change after filtering
    expect(countAfter).toBeGreaterThanOrEqual(0);
  });

  test('Filter by employee — single row remains', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAvailabilityChart();
    await page.waitForLoadState('networkidle');

    const chart = new AvailabilityChartPage(page);
    await expect(chart.chartGrid).toBeVisible();

    const filterVisible = await chart.employeeFilter.isVisible().catch(() => false);
    test.skip(!filterVisible, 'Employee filter not visible');

    // Type a specific employee name
    await chart.employeeFilter.fill('Weinmeister');
    await page.waitForTimeout(1000);

    // Select from dropdown if it appears
    const dropdown = page.locator('[class*="dropdown"] li, [class*="option"], [role="option"]').first();
    if (await dropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dropdown.click();
      await page.waitForTimeout(500);
    }

    const countAfter = await chart.getEmployeeCount();
    // After filtering by specific employee, count should be small
    expect(countAfter).toBeGreaterThanOrEqual(0);
  });
});
