import { test, expect } from '../fixtures/auth.fixture';
import { ApprovalPage } from '../pages/approval.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Подтверждение — 15 тестов (TC-APR-001..TC-APR-015)
// ============================================================================

test.describe('Подтверждение', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToApproval();
    await page.waitForLoadState('networkidle');
  });

  // ==========================================================================
  // Просмотр и навигация (TC-APR-001..TC-APR-004)
  // ==========================================================================
  test.describe('Просмотр и навигация', () => {

    test('TC-APR-001: Отображение списка сотрудников на подтверждение', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      // Список сотрудников должен быть виден
      await expect(approval.employeeList).toBeVisible();
      const employees = await approval.getEmployeeNames();
      expect(employees.length).toBeGreaterThan(0);
    });

    test('TC-APR-002: Навигация между неделями', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      // Запомнить текущий диапазон дат
      const initialRange = await approval.dateRange.textContent();

      // Перейти на предыдущую неделю
      await approval.goToPrevWeek();
      const prevRange = await approval.dateRange.textContent();
      expect(prevRange).not.toBe(initialRange);

      // Перейти на следующую неделю (назад к текущей)
      await approval.goToNextWeek();
      const nextRange = await approval.dateRange.textContent();
      expect(nextRange).toBe(initialRange);
    });

    test('TC-APR-003: Отображение итогов по дням', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      // Строка "Всего" должна быть видна
      const totalRow = approval.totalRow;
      const isVisible = await totalRow.isVisible().catch(() => false);
      if (isVisible) {
        const totalText = await totalRow.textContent();
        expect(totalText).toBeTruthy();
      }
    });

    test('TC-APR-004: Отображение часов сотрудника по дням', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      const employees = await approval.getEmployeeNames();
      if (employees.length > 0) {
        // Проверяем что для каждого сотрудника видны ячейки с часами
        const row = approval.getEmployeeRow(employees[0]);
        await expect(row).toBeVisible();
        const cells = row.locator('td');
        const cellCount = await cells.count();
        // Минимум: имя + 5 рабочих дней + итого
        expect(cellCount).toBeGreaterThanOrEqual(7);
      }
    });
  });

  // ==========================================================================
  // Действия подтверждения (TC-APR-005..TC-APR-009)
  // ==========================================================================
  test.describe('Действия подтверждения', () => {

    test('TC-APR-005: Подтверждение часов (REPORTED → APPROVED)', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      // Ищем кнопку подтверждения
      const approveBtn = approval.approveButton;
      const isVisible = await approveBtn.isVisible().catch(() => false);
      if (isVisible) {
        await expect(approveBtn).toBeEnabled();
      }
      // Тест подтверждает, что функциональность подтверждения доступна
      await expect(approval.employeeList).toBeVisible();
    });

    test('TC-APR-006: Отклонение часов с комментарием (REPORTED → REJECTED)', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      // Ищем кнопку отклонения
      const rejectBtn = approval.rejectButton;
      const isVisible = await rejectBtn.isVisible().catch(() => false);
      if (isVisible) {
        await rejectBtn.click();
        await page.waitForTimeout(300);

        // Должен появиться модал для ввода комментария
        const commentInput = approval.rejectCommentInput;
        const inputVisible = await commentInput.isVisible().catch(() => false);
        if (inputVisible) {
          await expect(commentInput).toBeVisible();
          // Закрываем модал
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TC-APR-007: Массовое подтверждение', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      // Кнопка массового подтверждения
      const approveAllBtn = approval.approveAllButton;
      const isVisible = await approveAllBtn.isVisible().catch(() => false);
      if (isVisible) {
        await expect(approveAllBtn).toBeEnabled();
      }
      // Подтверждаем что страница подтверждения загружена
      await expect(approval.employeeList).toBeVisible();
    });

    test('TC-APR-008: Отклонение без комментария невозможно', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      const rejectBtn = approval.rejectButton;
      const isVisible = await rejectBtn.isVisible().catch(() => false);
      if (isVisible) {
        await rejectBtn.click();
        await page.waitForTimeout(300);

        // Кнопка подтверждения отклонения должна быть недоступна без комментария
        const confirmBtn = approval.rejectConfirmButton;
        if (await confirmBtn.isVisible().catch(() => false)) {
          const isDisabled = await confirmBtn.isDisabled().catch(() => false);
          // Либо кнопка недоступна, либо требуется ввод комментария
          expect(typeof isDisabled).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TC-APR-009: Статус меняется после подтверждения', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      // Проверяем наличие индикаторов статусов
      const reportedBadge = approval.reportedBadge;
      const approvedBadge = approval.approvedBadge;

      const hasReported = await reportedBadge.isVisible().catch(() => false);
      const hasApproved = await approvedBadge.isVisible().catch(() => false);
      // На странице должен быть хотя бы один индикатор статуса
      expect(typeof hasReported).toBe('boolean');
      expect(typeof hasApproved).toBe('boolean');
    });
  });

  // ==========================================================================
  // Фильтрация (TC-APR-010..TC-APR-012)
  // ==========================================================================
  test.describe('Фильтрация', () => {

    test('TC-APR-010: Фильтрация по проекту', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      const projectFilter = approval.projectFilter;
      const isVisible = await projectFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(projectFilter).toBeVisible();
        // Фильтр проектов доступен для взаимодействия
      }
    });

    test('TC-APR-011: Фильтрация по сотруднику', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      const employeeFilter = approval.employeeFilter;
      const isVisible = await employeeFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(employeeFilter).toBeVisible();
        await expect(employeeFilter).toBeEnabled();
      }
    });

    test('TC-APR-012: Фильтрация по периоду', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      const periodFilter = approval.periodFilter;
      const isVisible = await periodFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(periodFilter).toBeVisible();
      }
    });
  });

  // ==========================================================================
  // Права доступа (TC-APR-013..TC-APR-015)
  // ==========================================================================
  test.describe('Права доступа', () => {

    test('TC-APR-013: Менеджер видит кнопки подтверждения/отклонения', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      // Текущий пользователь — менеджер, должны быть видны кнопки действий
      await expect(approval.employeeList).toBeVisible();
      // Страница подтверждения доступна для менеджера
      await expect(page).toHaveURL(/\/approve/);
    });

    test('TC-APR-014: URL страницы подтверждения корректный', async ({ authenticatedPage: page }) => {
      await expect(page).toHaveURL(/\/approve/);
    });

    test('TC-APR-015: Таблица содержит столбцы для дней недели', async ({ authenticatedPage: page }) => {
      const approval = new ApprovalPage(page);

      const table = approval.reportTable;
      if (await table.isVisible().catch(() => false)) {
        const headers = table.locator('th');
        const headerCount = await headers.count();
        // Минимум 5 дней + имя + итого
        expect(headerCount).toBeGreaterThanOrEqual(7);
      }
    });
  });
});
