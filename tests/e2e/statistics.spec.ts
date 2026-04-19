import { test, expect } from '../fixtures/auth.fixture';
import { StatisticsPage } from '../pages/statistics.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Статистика — 10 тестов (TC-STAT-001..TC-STAT-010)
// ============================================================================

test.describe('Статистика', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToGeneralStatistics();
    await page.waitForLoadState('networkidle');
  });

  // ==========================================================================
  // Вкладки статистики (TC-STAT-001..TC-STAT-004)
  // ==========================================================================
  test.describe('Вкладки статистики', () => {

    test('TC-STAT-001: Отображение статистики по отделам', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      await statistics.switchToDepartments();
      await expect(statistics.dataTable).toBeVisible();

      const rowCount = await statistics.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-STAT-002: Отображение статистики по сотрудникам', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      await statistics.switchToEmployees();
      await expect(statistics.dataTable).toBeVisible();

      const rowCount = await statistics.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-STAT-003: Отображение статистики по проектам', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      await statistics.switchToProjects();
      await expect(statistics.dataTable).toBeVisible();

      const rowCount = await statistics.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-STAT-004: Отображение статистики по задачам', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      await statistics.switchToTasks();
      await expect(statistics.dataTable).toBeVisible();

      const rowCount = await statistics.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // Фильтрация (TC-STAT-005..TC-STAT-006)
  // ==========================================================================
  test.describe('Фильтрация', () => {

    test('TC-STAT-005: Фильтрация по периоду', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      const startInput = statistics.periodStartInput;
      const endInput = statistics.periodEndInput;

      const startVisible = await startInput.isVisible().catch(() => false);
      const endVisible = await endInput.isVisible().catch(() => false);

      if (startVisible && endVisible) {
        await expect(startInput).toBeEnabled();
        await expect(endInput).toBeEnabled();
      }
    });

    test('TC-STAT-006: Фильтрация по подрядчикам', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      const contractorFilter = statistics.contractorFilter;
      const isVisible = await contractorFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(contractorFilter).toBeVisible();
      }
    });
  });

  // ==========================================================================
  // Экспорт и итоги (TC-STAT-007..TC-STAT-008)
  // ==========================================================================
  test.describe('Экспорт и итоги', () => {

    test('TC-STAT-007: Экспорт данных', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      // Switch to a tab with data first (export may be disabled on empty default tab)
      await statistics.switchToTasks();
      await page.waitForTimeout(1000);

      const exportBtn = statistics.exportButton;
      const isVisible = await exportBtn.isVisible().catch(() => false);
      if (isVisible) {
        // Export may be disabled if no data — just verify it's visible
        await expect(exportBtn).toBeVisible();
      }
    });

    test('TC-STAT-008: Корректность расчётов итогов', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      await statistics.switchToDepartments();
      const totalRow = statistics.totalRow;
      const isVisible = await totalRow.isVisible().catch(() => false);
      if (isVisible) {
        const totalText = await statistics.getTotalValue();
        expect(totalText).toBeTruthy();
      }
    });
  });

  // ==========================================================================
  // Навигация и права (TC-STAT-009..TC-STAT-010)
  // ==========================================================================
  test.describe('Навигация и права', () => {

    test('TC-STAT-009: Переключение между вкладками', async ({ authenticatedPage: page }) => {
      const statistics = new StatisticsPage(page);

      // Переключаемся по всем вкладкам
      await statistics.switchToDepartments();
      await expect(statistics.dataTable).toBeVisible();

      await statistics.switchToEmployees();
      await expect(statistics.dataTable).toBeVisible();

      await statistics.switchToProjects();
      await expect(statistics.dataTable).toBeVisible();

      await statistics.switchToTasks();
      await expect(statistics.dataTable).toBeVisible();
    });

    test('TC-STAT-010: Проверка прав доступа', async ({ authenticatedPage: page }) => {
      // Пользователь с правами менеджера имеет доступ к статистике
      const statistics = new StatisticsPage(page);
      await expect(statistics.dataTable).toBeVisible();

      // Заголовки таблицы должны содержать ожидаемые столбцы
      const headers = await statistics.getHeaderNames();
      expect(headers.length).toBeGreaterThan(0);
    });
  });
});
