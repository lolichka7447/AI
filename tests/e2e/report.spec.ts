import { test, expect } from '../fixtures/auth.fixture';
import { ReportPage } from '../pages/report.page';
import { NavigationComponent } from '../pages/navigation.component';

test.describe('TC-REPORT: Страница "Мои задачи"', () => {

  test('TC-REPORT-001: Главная страница загружается после авторизации',
    async ({ authenticatedPage: page }) => {
      await expect(page).toHaveURL(/\/report/);
      await expect(page).toHaveTitle(/TTT/);

      const reportPage = new ReportPage(page);
      await expect(reportPage.taskTable).toBeVisible();
      await expect(reportPage.addTaskInput).toBeVisible();
      await expect(reportPage.addTaskButton).toBeVisible();
    }
  );

  test('TC-REPORT-002: Таблица задач содержит дни недели',
    async ({ authenticatedPage: page }) => {
      const reportPage = new ReportPage(page);

      // Verify week day columns
      const headers = page.getByRole('columnheader');
      await expect(headers.filter({ hasText: /Пн/i })).toBeVisible();
      await expect(headers.filter({ hasText: /Вт/i })).toBeVisible();
      await expect(headers.filter({ hasText: /Ср/i })).toBeVisible();
      await expect(headers.filter({ hasText: /Чт/i })).toBeVisible();
      await expect(headers.filter({ hasText: /Пт/i })).toBeVisible();

      // Verify summary columns
      await expect(headers.filter({ hasText: 'За период' })).toBeVisible();
      await expect(headers.filter({ hasText: 'Всего' })).toBeVisible();
    }
  );

  test('TC-REPORT-003: Строка "Всего" отображается в таблице',
    async ({ authenticatedPage: page }) => {
      const reportPage = new ReportPage(page);

      // Wait for data to load (table may show "Загрузка данных..." initially)
      await expect(reportPage.totalRow).toBeVisible({ timeout: 15000 });
      const totalText = await reportPage.totalRow.textContent();
      expect(totalText).toContain('Всего');
    }
  );

  test('TC-REPORT-004: Переключатель "Группировать по проектам" работает',
    async ({ authenticatedPage: page }) => {
      const reportPage = new ReportPage(page);
      const toggleLabel = page.getByText('Группировать по проектам');

      await expect(reportPage.groupByProjectsCheckbox).toBeChecked();

      // Click the label to toggle (checkbox input is visually hidden)
      await toggleLabel.click();
      await expect(reportPage.groupByProjectsCheckbox).not.toBeChecked();

      // Re-enable grouping
      await toggleLabel.click();
      await expect(reportPage.groupByProjectsCheckbox).toBeChecked();
    }
  );

  test('TC-REPORT-005: Поле добавления задачи принимает текст',
    async ({ authenticatedPage: page }) => {
      const reportPage = new ReportPage(page);

      await reportPage.addTaskInput.fill('Test project / Test task');
      await expect(reportPage.addTaskInput).toHaveValue('Test project / Test task');
    }
  );
});

test.describe('TC-NAV: Навигация', () => {

  test('TC-NAV-001: Все элементы навигации видны',
    async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);

      await expect(nav.logo).toBeVisible();
      await expect(nav.myTasksLink).toBeVisible();
      await expect(nav.absenceCalendarButton).toBeVisible();
      await expect(nav.approvalLink).toBeVisible();
      await expect(nav.plannerLink).toBeVisible();
      await expect(nav.statisticsButton).toBeVisible();
      await expect(nav.adminButton).toBeVisible();
      await expect(nav.notificationsLink).toBeVisible();
    }
  );

  test('TC-NAV-002: Переход на страницу "Подтверждение"',
    async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);

      await nav.navigateToApproval();
      await expect(page).toHaveURL(/\/approve/);
    }
  );

  test('TC-NAV-003: Переход на страницу "Планировщик"',
    async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);

      await nav.navigateToPlanner();
      await expect(page).toHaveURL(/\/planner/);
    }
  );

  test('TC-NAV-004: Переход на страницу "Нотификации"',
    async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);

      await nav.navigateToNotifications();
      await expect(page).toHaveURL(/\/notifications/);
    }
  );

  test('TC-NAV-005: Возврат на "Мои задачи" через навигацию',
    async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);

      await nav.navigateToApproval();
      await expect(page).toHaveURL(/\/approve/);

      await nav.navigateToMyTasks();
      await expect(page).toHaveURL(/\/report/);
    }
  );

  test('TC-NAV-006: Имя пользователя отображается в навигации',
    async ({ authenticatedPage: page }) => {
      const nav = new NavigationComponent(page);

      await expect(nav.userMenuButton).toBeAttached();
      await expect(nav.userMenuButton).toContainText(/Павел|Pavel|pvaynmaster/i);
    }
  );
});
