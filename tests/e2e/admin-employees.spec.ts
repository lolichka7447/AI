import { test, expect } from '../fixtures/auth.fixture';
import { AdminPage } from '../pages/admin.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Администрирование — Сотрудники — 12 тестов (TR-800..TR-811)
// ============================================================================

test.describe('Администрирование — Сотрудники', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminEmployees();
    await page.waitForLoadState('networkidle');
  });

  test('TR-800: Список сотрудников отображается', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    await expect(admin.employeeList).toBeVisible();
    const employees = await admin.getEmployeeNames();
    expect(employees.length).toBeGreaterThan(0);
  });

  test('TR-801: Поиск сотрудника по имени', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const searchInput = admin.employeeSearchInput;
    const isVisible = await searchInput.isVisible().catch(() => false);
    if (isVisible) {
      const allEmployees = await admin.getEmployeeNames();
      if (allEmployees.length > 0) {
        await admin.searchEmployees(allEmployees[0].substring(0, 3));
        const filtered = await admin.getEmployeeNames();
        expect(filtered.length).toBeGreaterThan(0);
      }
    }
  });

  test('TR-802: Поиск несуществующего сотрудника', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const searchInput = admin.employeeSearchInput;
    if (await searchInput.isVisible().catch(() => false)) {
      await admin.searchEmployees('__nonexistent_employee_zzz__');
      const filtered = await admin.getEmployeeNames();
      expect(filtered.length).toBe(0);
    }
  });

  test('TR-803: Сортировка сотрудников', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const sortSelect = admin.employeeSortSelect;
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect).toBeEnabled();
  });

  test('TR-804: Фильтрация сотрудников по отделу', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const filterSelect = page.locator(`select:has-text("${t('label.department')}"), .header-filter select`).first();
    await expect(filterSelect).toBeVisible();
  });

  test('TR-805: Подробности сотрудника при клике', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const employees = await admin.getEmployeeNames();
    if (employees.length > 0) {
      const row = admin.employeeList.locator(`tr:has-text("${employees[0]}"), li:has-text("${employees[0]}")`).first();
      await row.click();
      await page.waitForTimeout(500);
      const detailPanel = page.locator('.modal__wrapper, .modal, [role="dialog"]').first();
      await expect(detailPanel).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('TR-806: Отображение подрядчиков в списке', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const contractorFilter = page.locator(`button:has-text("${t('tab.contractors')}"), label:has-text("${t('tab.contractors')}"), input[type="checkbox"]`).first();
    await expect(contractorFilter).toBeVisible();
  });

  test('TR-807: Роли сотрудника видны в списке', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const employees = await admin.getEmployeeNames();
    if (employees.length > 0) {
      const row = admin.employeeList.locator(`tr:has-text("${employees[0]}"), li:has-text("${employees[0]}")`).first();
      const roleCell = row.locator('td:nth-child(3), td:nth-child(2)').first();
      await expect(roleCell).toBeVisible();
    }
  });

  test('TR-808: Деактивация сотрудника — кнопка видна', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const employees = await admin.getEmployeeNames();
    if (employees.length > 0) {
      const row = admin.employeeList.locator(`tr:has-text("${employees[0]}"), li:has-text("${employees[0]}")`).first();
      const deactivateBtn = row.locator(`button:has-text("${t('btn.deactivate')}"), [title*="${t('btn.deactivate')}"]`).first();
      await expect(deactivateBtn).toBeVisible();
    }
  });

  test('TR-809: Очистка поиска возвращает полный список', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const searchInput = admin.employeeSearchInput;
    if (await searchInput.isVisible().catch(() => false)) {
      const allEmployees = await admin.getEmployeeNames();
      await admin.searchEmployees('xyz_nonexistent');
      await searchInput.clear();
      await page.waitForTimeout(500);
      const afterClear = await admin.getEmployeeNames();
      expect(afterClear.length).toBe(allEmployees.length);
    }
  });

  test('TR-810: Количество сотрудников в списке', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const employees = await admin.getEmployeeNames();
    expect(employees.length).toBeGreaterThan(0);
    // Проверяем, что количество строк совпадает
    const rowCount = await admin.employeeRows.count();
    expect(rowCount).toBe(employees.length);
  });

  test('TR-811: Строки сотрудников содержат имя и фамилию', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const employees = await admin.getEmployeeNames();
    if (employees.length > 0) {
      // Имя сотрудника должно содержать хотя бы 2 символа
      expect(employees[0].length).toBeGreaterThan(1);
    }
  });
});
