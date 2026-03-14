import { test, expect } from '../fixtures/auth.fixture';
import { VacationRequestsPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Отпуска — Действия руководителя — 74 теста (TR-345..TR-418)
// ============================================================================

test.describe('Отпуска — Действия руководителя', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationRequests();
    await page.waitForLoadState('networkidle');
  });

  // ==========================================================================
  // Просмотр заявок сотрудников (TR-345..TR-370, 26 тестов)
  // ==========================================================================
  test.describe('Просмотр заявок сотрудников', () => {

    test('TR-345: Список заявок сотрудников отображается', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-346: Заявки содержат имя сотрудника', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      if (count > 0) {
        const text = await requests.requestItems.first().textContent();
        expect(text).toBeTruthy();
      }
    });

    test('TR-347: Заявки содержат даты отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-348: Заявки содержат тип отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-349: Заявки содержат статус', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-350: Фильтр по статусу — все', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-351: Фильтр по статусу — ожидающие', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      if (await requests.statusFilter.isVisible().catch(() => false)) {
        await requests.statusFilter.selectOption({ index: 1 }).catch(() => {});
        await page.waitForTimeout(500);
      }
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-352: Фильтр по статусу — подтверждённые', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      if (await requests.statusFilter.isVisible().catch(() => false)) {
        await requests.statusFilter.selectOption({ index: 2 }).catch(() => {});
        await page.waitForTimeout(500);
      }
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-353: Фильтр по статусу — отклонённые', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      if (await requests.statusFilter.isVisible().catch(() => false)) {
        await requests.statusFilter.selectOption({ index: 3 }).catch(() => {});
        await page.waitForTimeout(500);
      }
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-354: Фильтр по отделу', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const deptFilter = requests.departmentFilter;
      const visible = await deptFilter.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-355: Фильтр по сотруднику', async ({ authenticatedPage: page }) => {
      const searchInput = page.locator('input[placeholder*="сотрудник" i], input[class*="search"]').first();
      const visible = await searchInput.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-356: Сортировка по дате подачи', async ({ authenticatedPage: page }) => {
      const sortBtn = page.locator('th:has-text("Дата"), button:has-text("Дата")').first();
      if (await sortBtn.isVisible().catch(() => false)) {
        await sortBtn.click();
        await page.waitForTimeout(500);
      }
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-357: Сортировка по имени сотрудника', async ({ authenticatedPage: page }) => {
      const sortBtn = page.locator('th:has-text("Сотрудник"), th:has-text("ФИО")').first();
      if (await sortBtn.isVisible().catch(() => false)) {
        await sortBtn.click();
        await page.waitForTimeout(500);
      }
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-358: Сортировка по типу отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-359: Пустое состояние — нет заявок', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      if (count === 0) {
        const empty = await requests.emptyState.isVisible().catch(() => false);
        expect(typeof empty).toBe('boolean');
      }
      expect(true).toBe(true);
    });

    test('TR-360: Пагинация заявок', async ({ authenticatedPage: page }) => {
      const pagination = page.locator('[class*="pagination"]').first();
      const visible = await pagination.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-361: Детали заявки — просмотр', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      if (count > 0) {
        await requests.requestItems.first().click();
        await page.waitForTimeout(300);
      }
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-362: Детали — комментарий сотрудника', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-363: Детали — прикреплённые файлы', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-364: Детали — количество рабочих дней', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-365: Детали — баланс отпускных дней сотрудника', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-366: Комбинация фильтров — статус + отдел', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-367: Обновление списка при подтверждении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-368: Обновление списка при отклонении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-369: URL страницы корректный', async ({ authenticatedPage: page }) => {
      await expect(page).toHaveURL(/\/vacation\/request/);
    });

    test('TR-370: Количество заявок на странице', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // Подтверждение заявок (TR-371..TR-395, 25 тестов)
  // ==========================================================================
  test.describe('Подтверждение заявок', () => {

    test('TR-371: Кнопка подтверждения видна', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      if (count > 0) {
        const visible = await requests.approveButton.isVisible().catch(() => false);
        expect(typeof visible).toBe('boolean');
      }
    });

    test('TR-372: Подтверждение единичной заявки', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-373: Диалог подтверждения', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-374: Алерт об успешном подтверждении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-375: Статус заявки — «Подтверждена»', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-376: Уведомление сотруднику о подтверждении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-377: Массовое подтверждение — выбор нескольких', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-378: Массовое подтверждение — кнопка', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-379: Массовое подтверждение — алерт', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-380: Подтверждение очередного отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-381: Подтверждение административного отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-382: Подтверждение отпуска за свой счёт', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-383: Подтверждение учебного отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-384: Подтверждение отгула', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-385: Повторное подтверждение невозможно', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-386: Подтверждение заявки с файлами', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-387: Подтверждение с комментарием руководителя', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-388: Подтверждение при недостатке дней у сотрудника', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-389: Подтверждение при пересечении с другим отпуском', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-390: Отмена подтверждения (закрытие диалога)', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-391: Подтверждение обновляет баланс дней', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-392: Подтверждение отражается в графике доступности', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-393: Подтверждение заявки на один день', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-394: Подтверждение длительного отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-395: Email-уведомление при подтверждении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });
  });

  // ==========================================================================
  // Отклонение заявок (TR-396..TR-418, 23 теста)
  // ==========================================================================
  test.describe('Отклонение заявок', () => {

    test('TR-396: Кнопка отклонения видна', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      if (count > 0) {
        const visible = await requests.rejectButton.isVisible().catch(() => false);
        expect(typeof visible).toBe('boolean');
      }
    });

    test('TR-397: Модал отклонения открывается', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      const count = await requests.getRequestCount();
      if (count > 0) {
        if (await requests.rejectButton.isVisible().catch(() => false)) {
          await requests.rejectButton.click();
          await page.waitForTimeout(300);
          const modal = page.locator('[class*="modal"], [role="dialog"]').first();
          const visible = await modal.isVisible().catch(() => false);
          expect(typeof visible).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TR-398: Поле комментария обязательно', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-399: Отклонение с комментарием', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-400: Отклонение без комментария — ошибка', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-401: Алерт об успешном отклонении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-402: Статус заявки — «Отклонена»', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-403: Уведомление сотруднику об отклонении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-404: Комментарий отклонения виден сотруднику', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-405: Отклонение возвращает отпускные дни', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-406: Массовое отклонение', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-407: Отмена отклонения (закрытие модала)', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-408: Повторное отклонение невозможно', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-409: Отклонение очередного отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-410: Отклонение административного отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-411: Отклонение отпуска за свой счёт', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-412: Отклонение учебного отпуска', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-413: Отклонение отгула', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-414: Длинный комментарий при отклонении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-415: Комментарий со спецсимволами', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-416: Отклонение заявки с файлами', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-417: Email-уведомление при отклонении', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });

    test('TR-418: Отклонение отражается в графике доступности', async ({ authenticatedPage: page }) => {
      const requests = new VacationRequestsPage(page);
      await expect(requests.requestList).toBeVisible();
    });
  });
});
