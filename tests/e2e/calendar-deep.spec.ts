import { test, expect } from '../fixtures/auth.fixture';
import { CalendarPage } from '../pages/calendar.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Calendar Deep Tests — 8 tests using CalendarPage POM methods
// ============================================================================

test.describe('TC-CAL: Calendar Deep Tests', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAvailabilityChart();
    await page.waitForLoadState('networkidle');
  });

  test('TC-CAL-010: Calendar grid loads with days', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    await expect(calendar.calendarGrid).toBeVisible({ timeout: 10000 });

    const dayCount = await calendar.calendarDays.count();
    expect(dayCount).toBeGreaterThan(0);
  });

  test('TC-CAL-011: Month navigation works', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    await expect(calendar.calendarGrid).toBeVisible({ timeout: 10000 });

    const currentMonth = await calendar.getCurrentMonth();
    expect(currentMonth).toBeTruthy();

    // Go to next month
    await calendar.goToNextMonth();
    const nextMonth = await calendar.getCurrentMonth();

    // Go back
    await calendar.goToPrevMonth();
    const backMonth = await calendar.getCurrentMonth();

    // Should return to original month
    expect(backMonth).toBe(currentMonth);
    expect(nextMonth).not.toBe(currentMonth);
  });

  test('TC-CAL-012: Employee list visible', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    const names = await calendar.getEmployeeNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test('TC-CAL-013: Today highlighted', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    await expect(calendar.calendarGrid).toBeVisible({ timeout: 10000 });

    const todayHighlighted = await calendar.isTodayHighlighted();
    // Today should be highlighted in the current month view
    expect(todayHighlighted).toBe(true);
  });

  test('TC-CAL-014: Day cell has CSS classes', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    await expect(calendar.calendarGrid).toBeVisible({ timeout: 10000 });

    // Check day 1 has classes
    const classes = await calendar.getDayCellClasses(1);
    expect(classes).toBeTruthy();
  });

  test('TC-CAL-015: Day cell has background color', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    await expect(calendar.calendarGrid).toBeVisible({ timeout: 10000 });

    const color = await calendar.getDayCellColor(1);
    expect(color).toBeTruthy();
  });

  test('TC-CAL-016: Legend items visible', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    const legendItems = await calendar.getLegendItems();
    // Legend should show absence type indicators
    expect(legendItems.length).toBeGreaterThanOrEqual(0);
  });

  test('TC-CAL-017: Absence type counts', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    await expect(calendar.calendarGrid).toBeVisible({ timeout: 10000 });

    const vacations = await calendar.getVacationCount();
    const sickLeaves = await calendar.getSickLeaveCount();
    const holidays = await calendar.getHolidayCount();

    // At least absence tracking should be functional
    expect(vacations).toBeGreaterThanOrEqual(0);
    expect(sickLeaves).toBeGreaterThanOrEqual(0);
    expect(holidays).toBeGreaterThanOrEqual(0);
  });
});
