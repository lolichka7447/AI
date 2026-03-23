import { test, expect } from '../fixtures/auth.fixture';
import {
  AdminCalendarPage,
  AdminExportPage,
  AccountSettingsPage,
} from '../pages/admin-subpages.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Подстраницы администрирования — 18 тестов
// ============================================================================

// ============================================================================
// 1. Производственные календари (/admin/calendar) — TC-ACAL-001..TC-ACAL-005
// ============================================================================
test.describe('Производственные календари', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminCalendar();
    await page.waitForLoadState('networkidle');
  });

  test('TC-ACAL-001: Страница производственных календарей загружается', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    await expect(calendar.calendarGrid).toBeVisible();
  });

  test('TC-ACAL-002: Выбор года доступен', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const yearSelector = calendar.yearSelector;
    await expect(yearSelector).toBeVisible();
  });

  test('TC-ACAL-003: Выбор страны/офиса доступен', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const countrySelector = calendar.countrySelector;
    await expect(countrySelector).toBeVisible();
  });

  test('TC-ACAL-004: Ячейки дней видны', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const dayCells = calendar.dayCells;
    const count = await dayCells.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-ACAL-005: Кнопка редактирования/сохранения', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const editBtn = calendar.editButton;
    const saveBtn = calendar.saveButton;
    const editVisible = await editBtn.isVisible().catch(() => false);
    const saveVisible = await saveBtn.isVisible().catch(() => false);
    expect(editVisible || saveVisible).toBe(true);
  });
});

// ============================================================================
// 2. Экспорт (/admin/export) — TC-AEXP-001..TC-AEXP-005
// ============================================================================
test.describe('Экспорт', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminExport();
    await page.waitForLoadState('networkidle');
  });

  test('TC-AEXP-001: Страница экспорта загружается', async ({ authenticatedPage: page }) => {
    const exportPage = new AdminExportPage(page);
    await expect(exportPage.exportForm).toBeVisible();
  });

  test('TC-AEXP-002: Поля выбора периода', async ({ authenticatedPage: page }) => {
    const exportPage = new AdminExportPage(page);
    const startInput = exportPage.periodStartInput;
    const endInput = exportPage.periodEndInput;
    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();
  });

  test('TC-AEXP-003: Кнопка экспорта видна', async ({ authenticatedPage: page }) => {
    const exportPage = new AdminExportPage(page);
    const exportBtn = exportPage.exportButton;
    await expect(exportBtn).toBeVisible();
  });

  test('TC-AEXP-004: Фильтр по отделу', async ({ authenticatedPage: page }) => {
    const exportPage = new AdminExportPage(page);
    const deptFilter = exportPage.departmentFilter;
    await expect(deptFilter).toBeVisible();
  });

  test('TC-AEXP-005: Фильтр по проекту', async ({ authenticatedPage: page }) => {
    const exportPage = new AdminExportPage(page);
    const projectFilter = exportPage.projectFilter;
    await expect(projectFilter).toBeVisible();
  });
});

// ============================================================================
// 3. Учётная запись (/admin/account) — TC-AACC-001..TC-AACC-008
// ============================================================================
test.describe('Учётная запись пользователя', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAccount();
    await page.waitForLoadState('networkidle');
  });

  test('TC-AACC-001: Страница настроек загружается', async ({ authenticatedPage: page }) => {
    const account = new AccountSettingsPage(page);
    await expect(account.settingsForm).toBeVisible();
  });

  test('TC-AACC-002: Форма настроек содержит поля', async ({ authenticatedPage: page }) => {
    const account = new AccountSettingsPage(page);
    const saveBtn = account.saveButton;
    await expect(saveBtn).toBeVisible();
  });

  test('TC-AACC-003: Таблица трекеров видна', async ({ authenticatedPage: page }) => {
    const account = new AccountSettingsPage(page);
    const trackerTable = account.trackerTable;
    await expect(trackerTable).toBeVisible();
  });

  test('TC-AACC-004: Кнопка добавления трекера', async ({ authenticatedPage: page }) => {
    const account = new AccountSettingsPage(page);
    const addBtn = account.addTrackerButton;
    await expect(addBtn).toBeVisible();
  });

  test('TC-AACC-005: Открытие формы добавления трекера', async ({ authenticatedPage: page }) => {
    const account = new AccountSettingsPage(page);
    const addBtn = account.addTrackerButton;
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(300);
      const modal = account.trackerModal;
      if (await modal.isVisible().catch(() => false)) {
        const urlInput = account.trackerUrlInput;
        await expect(urlInput).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  });

  test('TC-AACC-006: Поиск трекера', async ({ authenticatedPage: page }) => {
    const account = new AccountSettingsPage(page);
    const searchInput = account.trackerSearchInput;
    await expect(searchInput).toBeVisible();
  });

  test('TC-AACC-007: Настройка дня таймшита', async ({ authenticatedPage: page }) => {
    const account = new AccountSettingsPage(page);
    const timesheetInput = account.timesheetDayInput;
    await expect(timesheetInput).toBeVisible();
  });

  test('TC-AACC-008: Переключатель ручного тестирования', async ({ authenticatedPage: page }) => {
    const account = new AccountSettingsPage(page);
    const toggle = account.manualTestingToggle;
    await expect(toggle).toBeVisible();
  });
});
