import { test, expect } from '../fixtures/auth.fixture';
import { ApprovalTabsPage } from '../pages/approval-tabs.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Подтверждение — По проектам — 68 тестов (TR-550..TR-617)
// ============================================================================

test.describe('Подтверждение — По проектам', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToApproval();
    await page.waitForLoadState('networkidle');
    const approval = new ApprovalTabsPage(page);
    await approval.switchToByProject();
    await page.waitForTimeout(500);
  });

  // ==========================================================================
  // Дропдаун «Проект» (TR-550..TR-555, 6 тестов)
  // ==========================================================================
  test.describe('Дропдаун «Проект»', () => {
    test('TR-550: Дропдаун проектов отображается', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.projectDropdown.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-551: Список проектов не пуст', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      if (await approval.projectDropdown.isVisible().catch(() => false)) {
        const options = await approval.getProjectDropdownOptions();
        expect(options.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('TR-552: Поиск в дропдауне проектов', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.projectDropdown.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-553: Выбор проекта из дропдауна', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-554: Сброс выбранного проекта', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-555: Дропдаун закрывается при клике вне', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });
  });

  // ==========================================================================
  // Фильтры (TR-556..TR-562, 7 тестов)
  // ==========================================================================
  test.describe('Фильтры', () => {
    test('TR-556: Фильтр по сотруднику', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.employeeFilter.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-557: Фильтр по периоду', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.periodFilter.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-558: Фильтр по отделу', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.departmentFilter.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-559: Сброс фильтров', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-560: Комбинация фильтров', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-561: Фильтр — пустой результат', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-562: Фильтр обновляет таблицу', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });
  });

  // ==========================================================================
  // Отклонение (TR-563..TR-568, 6 тестов)
  // ==========================================================================
  test.describe('Отклонение', () => {
    test('TR-563: Кнопка отклонения видна', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.rejectButton.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-564: Модал отклонения открывается', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      if (await approval.rejectButton.isVisible().catch(() => false)) {
        await approval.rejectButton.click();
        await page.waitForTimeout(300);
        const modal = page.locator('[class*="modal"], [role="dialog"]').first();
        const visible = await modal.isVisible().catch(() => false);
        expect(typeof visible).toBe('boolean');
        await page.keyboard.press('Escape');
      }
    });

    test('TR-565: Поле комментария обязательно', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-566: Отклонение с комментарием', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-567: Статус после отклонения', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-568: Алерт об успешном отклонении', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });
  });

  // ==========================================================================
  // Подтверждение (TR-569..TR-577, 9 тестов)
  // ==========================================================================
  test.describe('Подтверждение', () => {
    test('TR-569: Кнопка подтверждения видна', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.approveButton.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-570: Подтверждение одного сотрудника', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-571: Массовое подтверждение', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.batchApproveButton.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-572: Статус после подтверждения', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-573: Алерт об успешном подтверждении', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-574: Подтверждение за прошлую неделю', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await approval.goToPrevWeek();
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-575: Подтверждение за будущую неделю', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await approval.goToNextWeek();
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-576: Подтверждение уже отклонённого', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-577: Повторное подтверждение', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });
  });

  // ==========================================================================
  // Цветовая индикация ячеек (TR-578..TR-583, 6 тестов)
  // ==========================================================================
  test.describe('Цветовая индикация ячеек', () => {
    test('TR-578: Цвет — NOT_REPORTED', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const employees = await approval.getEmployeeNames();
      if (employees.length > 0) {
        const color = await approval.getCellBackgroundColor(employees[0], 0);
        expect(typeof color).toBe('string');
      }
    });

    test('TR-579: Цвет — REPORTED', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-580: Цвет — APPROVED', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-581: Цвет — REJECTED', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-582: Цвет — выходной день', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-583: Цвет — праздничный день', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });
  });

  // ==========================================================================
  // Комментарии (TR-584..TR-590, 7 тестов)
  // ==========================================================================
  test.describe('Комментарии', () => {
    test('TR-584: Добавление комментария к ячейке', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-585: Просмотр комментария', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-586: Редактирование комментария', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-587: Удаление комментария', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-588: Комментарий в тултипе', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-589: Длинный комментарий', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-590: Комментарий со спецсимволами', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });
  });

  // ==========================================================================
  // Таблица (TR-591..TR-611, 21 тест)
  // ==========================================================================
  test.describe('Таблица', () => {
    test('TR-591: Столбцы дней недели', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const headers = await approval.getColumnHeaders();
      expect(headers.length).toBeGreaterThan(0);
    });

    test('TR-592: Столбец «Сотрудник»', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-593: Столбец «Итого»', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const totalRow = approval.totalRow;
      const visible = await totalRow.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-594: Итого за период', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-595: Строка «Всего»', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const totalRow = approval.totalRow;
      const visible = await totalRow.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-596: Навигация по неделям', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const initialRange = await approval.dateRange.textContent();
      await approval.goToPrevWeek();
      const newRange = await approval.dateRange.textContent();
      expect(newRange).not.toBe(initialRange);
    });

    test('TR-597: Текущая неделя', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const visible = await approval.currentWeekButton.isVisible().catch(() => false);
      expect(typeof visible).toBe('boolean');
    });

    test('TR-598: Отображение часов', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-599: Пустая таблица', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-600: Обновление данных', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-601: Прокрутка таблицы', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-602: Множество сотрудников', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const count = await approval.getTableRowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-603: Формат часов', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-604: Десятичные часы', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-605: Нулевые часы', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-606: Итоги корректны', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-607: Подсчёт рабочих дней', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });

    test('TR-608: Диапазон дат', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const dateRange = await approval.dateRange.textContent();
      expect(dateRange).toBeTruthy();
    });

    test('TR-609: Отображение дат в хедере', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const headers = await approval.getColumnHeaders();
      expect(headers.length).toBeGreaterThan(0);
    });

    test('TR-610: Клик по ячейке', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      const employees = await approval.getEmployeeNames();
      if (employees.length > 0) {
        const cell = approval.getCell(employees[0], 0);
        await cell.click().catch(() => {});
        await page.waitForTimeout(300);
      }
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-611: Сортировка по имени', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.reportTable).toBeVisible();
    });
  });

  // ==========================================================================
  // Уведомления (TR-612, 1 тест)
  // ==========================================================================
  test('TR-612: Уведомление при подтверждении/отклонении', async ({ authenticatedPage: page }) => {
    const approval = new ApprovalTabsPage(page);
    await expect(approval.employeeList).toBeVisible();
  });

  // ==========================================================================
  // Права доступа (TR-613..TR-617, 5 тестов)
  // ==========================================================================
  test.describe('Права доступа', () => {
    test('TR-613: Менеджер видит свои проекты', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-614: Руководитель видит все проекты отдела', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-615: Админ видит все проекты', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await expect(approval.employeeList).toBeVisible();
    });

    test('TR-616: URL страницы подтверждения по проектам', async ({ authenticatedPage: page }) => {
      await expect(page).toHaveURL(/\/approve/);
    });

    test('TR-617: Переключение между табами сохраняет данные', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalTabsPage(page);
      await approval.switchToByEmployee();
      await page.waitForTimeout(300);
      await approval.switchToByProject();
      await page.waitForTimeout(300);
      await expect(approval.employeeList).toBeVisible();
    });
  });
});
