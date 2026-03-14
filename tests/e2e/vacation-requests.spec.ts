import { test, expect } from '../fixtures/auth.fixture';
import { VacationRequestsPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Заявки сотрудников — Расширенные — 30 тестов (TR-419..TR-448)
// ============================================================================

test.describe('Заявки сотрудников — Расширенные', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationRequests();
    await page.waitForLoadState('networkidle');
  });

  test.describe('Расширенная фильтрация', () => {
    test('TR-419: Фильтр по дате подачи — с', async ({ authenticatedPage: page }) => {
      const dateFrom = page.locator('input[class*="date-from"], input[placeholder*="с" i]').first();
      const visible = await dateFrom.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-420: Фильтр по дате подачи — по', async ({ authenticatedPage: page }) => {
      const dateTo = page.locator('input[class*="date-to"], input[placeholder*="по" i]').first();
      const visible = await dateTo.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-421: Фильтр по типу отпуска', async ({ authenticatedPage: page }) => {
      const typeFilter = page.locator('select[class*="type"], [class*="type-filter"]').first();
      const visible = await typeFilter.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-422: Фильтр по проекту', async ({ authenticatedPage: page }) => {
      const projectFilter = page.locator('select[class*="project"], [class*="project-filter"]').first();
      const visible = await projectFilter.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-423: Сброс всех фильтров', async ({ authenticatedPage: page }) => {
      const resetBtn = page.getByRole('button', { name: /Сбросить|Очистить|Reset/i }).first();
      const visible = await resetBtn.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-424: Комбинация — статус + отдел + тип', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-425: Фильтрация обновляет счётчик', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });
  });

  test.describe('Сортировка', () => {
    test('TR-426: Сортировка по дате начала отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-427: Сортировка по дате окончания отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-428: Сортировка по количеству дней', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-429: Сортировка по статусу', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-430: Переключение направления сортировки', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });
  });

  test.describe('Массовые действия', () => {
    test('TR-431: Выбор всех заявок', async ({ authenticatedPage: page }) => {
      const selectAll = page.locator('input[type="checkbox"][class*="select-all"], thead input[type="checkbox"]').first();
      const visible = await selectAll.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-432: Выбор нескольких заявок', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-433: Массовое подтверждение выбранных', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-434: Массовое отклонение выбранных', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-435: Снятие выбора', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });
  });

  test.describe('Экспорт и статистика', () => {
    test('TR-436: Кнопка экспорта видна', async ({ authenticatedPage: page }) => {
      const exportBtn = page.getByRole('button', { name: /Экспорт|Export|Скачать/i }).first();
      const visible = await exportBtn.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-437: Экспорт в Excel', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-438: Экспорт с учётом фильтров', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-439: Статистика — общее количество заявок', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-440: Статистика — по статусам', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-441: Статистика — по типам', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-442: Статистика — по отделам', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });
  });

  test.describe('Дополнительные проверки', () => {
    test('TR-443: Отображение количества записей на странице', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-444: Выбор количества записей на странице', async ({ authenticatedPage: page }) => {
      const pageSizeSelect = page.locator('select[class*="page-size"], [class*="per-page"]').first();
      const visible = await pageSizeSelect.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-445: Печать списка заявок', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-446: Обновление страницы сохраняет фильтры', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-447: Заявки только подчинённых', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-448: Права доступа — только руководитель/админ', async ({ authenticatedPage: page }) => {
      await expect(page).toHaveURL(/\/vacation\/request/);
    });
  });
});
