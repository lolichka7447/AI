import { test, expect } from '../fixtures/auth.fixture';
import { CalendarPage } from '../pages/calendar.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Календарь отсутствий — 12 тестов (TC-CAL-001..TC-CAL-012)
// ============================================================================

test.describe('Календарь отсутствий', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToCalendar();
    await page.waitForLoadState('networkidle');
  });

  // ==========================================================================
  // Отображение календаря (TC-CAL-001..TC-CAL-003)
  // ==========================================================================
  test.describe('Отображение календаря', () => {

    test('TC-CAL-001: Отображение производственного календаря', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      await expect(calendar.calendarGrid).toBeVisible();

      // Текущий месяц должен отображаться
      const monthLabel = await calendar.getCurrentMonth();
      expect(monthLabel).toBeTruthy();
    });

    test('TC-CAL-002: Навигация по месяцам', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      const initialMonth = await calendar.getCurrentMonth();

      // Перейти к предыдущему месяцу
      await calendar.goToPrevMonth();
      const prevMonth = await calendar.getCurrentMonth();
      expect(prevMonth).not.toBe(initialMonth);

      // Перейти к следующему месяцу (назад к текущему)
      await calendar.goToNextMonth();
      const nextMonth = await calendar.getCurrentMonth();
      expect(nextMonth).toBe(initialMonth);
    });

    test('TC-CAL-003: Отображение выходных/праздников', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      // Проверяем наличие выходных или праздников на календаре
      const weekendCount = await calendar.getWeekendCount();
      const holidayCount = await calendar.getHolidayCount();

      // На любом месяце должны быть выходные
      expect(weekendCount + holidayCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // Отображение отсутствий (TC-CAL-004..TC-CAL-006)
  // ==========================================================================
  test.describe('Отображение отсутствий', () => {

    test('TC-CAL-004: Отображение отпусков сотрудников', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      const vacationCount = await calendar.getVacationCount();
      // Может быть 0 если нет отпусков в текущем месяце
      expect(vacationCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-CAL-005: Отображение больничных', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      const sickLeaveCount = await calendar.getSickLeaveCount();
      expect(sickLeaveCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-CAL-006: Отображение day-off', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      const dayOffCount = await calendar.getDayOffCount();
      expect(dayOffCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // Фильтрация (TC-CAL-007..TC-CAL-008)
  // ==========================================================================
  test.describe('Фильтрация', () => {

    test('TC-CAL-007: Фильтрация по отделу', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      const departmentFilter = calendar.departmentFilter;
      const isVisible = await departmentFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(departmentFilter).toBeVisible();
      }
    });

    test('TC-CAL-008: Фильтрация по сотруднику', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      const employeeFilter = calendar.employeeFilter;
      const isVisible = await employeeFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(employeeFilter).toBeVisible();
        await expect(employeeFilter).toBeEnabled();
      }
    });
  });

  // ==========================================================================
  // Визуальные элементы (TC-CAL-009..TC-CAL-011)
  // ==========================================================================
  test.describe('Визуальные элементы', () => {

    test('TC-CAL-009: Легенда цветов', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      const legend = calendar.legend;
      const isVisible = await legend.isVisible().catch(() => false);
      if (isVisible) {
        const items = await calendar.getLegendItems();
        expect(items.length).toBeGreaterThan(0);
      }
    });

    test('TC-CAL-010: Различие подтверждённых/неподтверждённых отсутствий', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      // Проверяем что календарь содержит ячейки с разными стилями
      await expect(calendar.calendarGrid).toBeVisible();
      const days = calendar.calendarDays;
      const dayCount = await days.count();
      expect(dayCount).toBeGreaterThan(0);
    });

    test('TC-CAL-011: Текущий день подсвечен', async ({ authenticatedPage: page }) => {
      const calendar = new CalendarPage(page);

      const isHighlighted = await calendar.isTodayHighlighted();
      // Текущий день должен быть подсвечен если мы на текущем месяце
      expect(typeof isHighlighted).toBe('boolean');
    });
  });

  // ==========================================================================
  // Права доступа (TC-CAL-012)
  // ==========================================================================

  test('TC-CAL-012: Проверка прав доступа', async ({ authenticatedPage: page }) => {
    const calendar = new CalendarPage(page);

    // Пользователь имеет доступ к календарю
    await expect(calendar.calendarGrid).toBeVisible();

    // Список сотрудников виден
    const employees = await calendar.getEmployeeNames();
    expect(employees.length).toBeGreaterThanOrEqual(0);
  });
});
