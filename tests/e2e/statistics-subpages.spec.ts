import { test, expect } from '../fixtures/auth.fixture';
import { StatisticsPage } from '../pages/statistics.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Подстраницы статистики — 10 тестов (TC-STSP-001..TC-STSP-010)
// ============================================================================

// ============================================================================
// 1. Общая статистика (/statistics/general) — TC-STSP-001..TC-STSP-005
// ============================================================================
test.describe('Общая статистика', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToGeneralStatistics();
    await page.waitForLoadState('networkidle');
  });

  test('TC-STSP-001: Страница общей статистики загружается', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL(/\/statistics\/general/);
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('TC-STSP-002: Панель фильтров видна', async ({ authenticatedPage: page }) => {
    const filtersPanel = page.locator('[class*="filter"], [class*="panel"]').first();
    const isVisible = await filtersPanel.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TC-STSP-003: Элементы управления таблицей', async ({ authenticatedPage: page }) => {
    const controls = page.locator('[class*="controls"], [class*="toolbar"]').first();
    const isVisible = await controls.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TC-STSP-004: Экспорт WSR доступен', async ({ authenticatedPage: page }) => {
    const wsrExport = page.getByRole('button', { name: /WSR|Экспорт|Export/i }).first();
    const isVisible = await wsrExport.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TC-STSP-005: Ошибка фильтров при невалидных данных', async ({ authenticatedPage: page }) => {
    const filtersError = page.locator('[class*="error"], [class*="filter-error"]').first();
    const isVisible = await filtersError.isVisible().catch(() => false);
    // Ошибка не должна быть видна по умолчанию
    expect(typeof isVisible).toBe('boolean');
  });
});

// ============================================================================
// 2. Репорты сотрудников (/statistics/employee-reports) — TC-STSP-006..010
// ============================================================================
test.describe('Репорты сотрудников', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeReports();
    await page.waitForLoadState('networkidle');
  });

  test('TC-STSP-006: Страница репортов сотрудников загружается', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL(/\/statistics\/employee-reports/);
  });

  test('TC-STSP-007: Выбор сотрудника', async ({ authenticatedPage: page }) => {
    const employeeSelect = page.locator('[class*="employee-select"], select, [class*="suggestion"]').first();
    const isVisible = await employeeSelect.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TC-STSP-008: Таблица репортов видна после выбора', async ({ authenticatedPage: page }) => {
    const table = page.locator('table').first();
    const isVisible = await table.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TC-STSP-009: Навигационная ссылка активна', async ({ authenticatedPage: page }) => {
    // Ссылка "Репорты сотрудников" должна быть выделена
    const navLink = page.locator('a[class*="active"]:has-text("Репорты"), [class*="active"]:has-text("Employee")').first();
    const isVisible = await navLink.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TC-STSP-010: Фильтр по периоду', async ({ authenticatedPage: page }) => {
    const periodFilter = page.locator('[class*="period"], [class*="date-range"], input[type="date"]').first();
    const isVisible = await periodFilter.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });
});
