import { test, expect } from '../fixtures/auth.fixture';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Подменю навигации — 22 теста (TC-SUB-001..TC-SUB-022)
// ============================================================================

test.describe('Подменю навигации', () => {

  // ==========================================================================
  // Подменю "Календарь отсутствий" (TC-SUB-001..TC-SUB-007)
  // ==========================================================================
  test.describe('Подменю — Календарь отсутствий', () => {

    test('TC-SUB-001: Подменю открывается по клику', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.absenceCalendarButton.click();
      await page.waitForTimeout(300);
      const dropdown = page.locator('.navbar__list-drop, [role="menu"]').first();
      const isVisible = await dropdown.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('TC-SUB-002: Переход — Мои отпуска и выходные', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToMyVacations();
      await expect(page).toHaveURL(/\/vacation\/my/);
    });

    test('TC-SUB-003: Переход — Мои больничные', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToMySickLeaves();
      await expect(page).toHaveURL(/\/sick-leave\/my/);
    });

    test('TC-SUB-004: Переход — График доступности', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToAvailabilityChart();
      await expect(page).toHaveURL(/\/vacation\/chart/);
    });

    test('TC-SUB-005: Переход — Заявки сотрудников', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToVacationRequests();
      await expect(page).toHaveURL(/\/vacation\/request/);
    });

    test('TC-SUB-006: Переход — Отпускные дни сотрудников', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToEmployeeVacationDays();
      await expect(page).toHaveURL(/\/vacation\/vacation-days/);
    });

    test('TC-SUB-007: Переход — Больничные листы сотрудников', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToEmployeeSickLeaves();
      await expect(page).toHaveURL(/\/vacation\/sick-leaves/);
    });
  });

  // ==========================================================================
  // Подменю "Статистика" (TC-SUB-008..TC-SUB-010)
  // ==========================================================================
  test.describe('Подменю — Статистика', () => {

    test('TC-SUB-008: Подменю открывается по клику', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.statisticsButton.click();
      await page.waitForTimeout(300);
      const dropdown = page.locator('.navbar__list-drop, [role="menu"]').first();
      const isVisible = await dropdown.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('TC-SUB-009: Переход — Общая статистика', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToGeneralStatistics();
      await expect(page).toHaveURL(/\/statistics\/general/);
    });

    test('TC-SUB-010: Переход — Репорты сотрудников', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToEmployeeReports();
      await expect(page).toHaveURL(/\/statistics\/employee-reports/);
    });
  });

  // ==========================================================================
  // Подменю "Админка" (TC-SUB-011..TC-SUB-017)
  // ==========================================================================
  test.describe('Подменю — Админка', () => {

    test('TC-SUB-011: Подменю открывается по клику', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.adminButton.click();
      await page.waitForTimeout(300);
      const dropdown = page.locator('.navbar__list-drop, [role="menu"]').first();
      const isVisible = await dropdown.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('TC-SUB-012: Переход — Проекты', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToAdminProjects();
      await expect(page).toHaveURL(/\/admin\/projects/);
    });

    test('TC-SUB-013: Переход — Сотрудники и подрядчики', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToAdminEmployees();
      await expect(page).toHaveURL(/\/admin\/employees/);
    });

    test('TC-SUB-014: Переход — Параметры TTT', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToAdminSettings();
      await expect(page).toHaveURL(/\/admin\/settings/);
    });

    test('TC-SUB-015: Переход — Производственные календари', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToAdminCalendar();
      await expect(page).toHaveURL(/\/admin\/calendar/);
    });

    test('TC-SUB-016: Переход — API', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToAdminApi();
      await expect(page).toHaveURL(/\/admin\/api/);
    });

    test('TC-SUB-017: Переход — Экспорт', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToAdminExport();
      await expect(page).toHaveURL(/\/admin\/export/);
    });
  });

  // ==========================================================================
  // Подменю "Бухгалтерия" (TC-SUB-018..TC-SUB-022)
  // ==========================================================================
  test.describe('Подменю — Бухгалтерия', () => {

    test('TC-SUB-018: Переход — Заработная плата', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToSalary();
      await expect(page).toHaveURL(/\/admin\/salary|\/accounting\/salary/);
    });

    test('TC-SUB-019: Переход — Изменение периодов', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToPeriodsChange();
      await expect(page).toHaveURL(/\/admin\/offices|\/accounting\/periods/);
    });

    test('TC-SUB-020: Переход — Выплата отпускных', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToVacationPayment();
      await expect(page).toHaveURL(/\/vacation\/payment/);
    });

    test('TC-SUB-021: Переход — Корректировка отпускных дней', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToVacationDaysCorrection();
      await expect(page).toHaveURL(/\/vacation\/days-correction/);
    });

    test('TC-SUB-022: Переход — Учет больничных листов', async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);
      await nav.navigateToAccountingSickLeaves();
      await expect(page).toHaveURL(/\/accounting\/sick-leaves/);
    });
  });
});
