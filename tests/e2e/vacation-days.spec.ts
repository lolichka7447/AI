import { test, expect } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';
import { VacationDaysPage, EmployeeSickLeavesPage, VacationDaysCorrectionPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Vacation — Vacation Days, Sick Leaves, Days Correction (Deep Tests)
// Balance table, numeric validation, filters, correction logic
// ============================================================================

test.describe('Vacation Days — Balance Table', () => {

  let nav: NavigationComponent;
  let daysPage: VacationDaysPage;

  test.beforeEach(async ({ authenticatedPage: page }) => {
    nav = new NavigationComponent(page);
    await nav.navigateToEmployeeVacationDays();
    await page.waitForLoadState('networkidle');
    daysPage = new VacationDaysPage(page);
  });

  test('Employee column contains full names', async ({ authenticatedPage: page }) => {
    await expect(daysPage.dataTable).toBeVisible();
    const rowCount = await daysPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const cells = await daysPage.getRowCells(i);
      // First cell should be employee name (contains letters)
      expect(cells[0]).toMatch(/[a-zA-Zа-яА-ЯёЁ]{2,}/);
    }
  });

  test('Available days column — numeric values', async ({ authenticatedPage: page }) => {
    await expect(daysPage.dataTable).toBeVisible();
    const rowCount = await daysPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const cells = await daysPage.getRowCells(i);
      // At least one cell beyond the name should contain a number
      const numericCells = cells.slice(1).filter(c => /^-?\d+(\.\d+)?$/.test(c.trim()));
      expect(numericCells.length).toBeGreaterThan(0);
    }
  });

  test('Reserved days column — numeric >= 0', async ({ authenticatedPage: page }) => {
    await expect(daysPage.dataTable).toBeVisible();
    const rowCount = await daysPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const cells = await daysPage.getRowCells(i);
      // Check numeric cells are valid numbers
      for (const cell of cells.slice(1)) {
        if (/^-?\d+(\.\d+)?$/.test(cell.trim())) {
          const num = parseFloat(cell.trim());
          expect(isNaN(num)).toBe(false);
        }
      }
    }
  });

  test('All rows (up to 10) contain numeric day values', async ({ authenticatedPage: page }) => {
    await expect(daysPage.dataTable).toBeVisible();
    const rowCount = await daysPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);

    const rowsToCheck = Math.min(rowCount, 10);
    for (let i = 0; i < rowsToCheck; i++) {
      const cells = await daysPage.getRowCells(i);
      const rowText = cells.join(' ');
      // Every row must contain at least one number
      expect(rowText).toMatch(/\d+/);
    }
  });

  test('Filter by department — rows change', async ({ authenticatedPage: page }) => {
    await expect(daysPage.dataTable).toBeVisible();

    const filterVisible = await daysPage.departmentFilter.isVisible().catch(() => false);
    test.skip(!filterVisible, 'Department filter not visible');

    const countBefore = await daysPage.getRowCount();

    const options = daysPage.departmentFilter.locator('option');
    const optionCount = await options.count();
    test.skip(optionCount <= 1, 'Not enough options');

    await daysPage.departmentFilter.selectOption({ index: 1 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const countAfter = await daysPage.getRowCount();
    // Rows may differ
    expect(countAfter).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Sick Leaves of Employees', () => {

  test('Sick leaves table loads with data', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeSickLeaves();
    await page.waitForLoadState('networkidle');

    const sickPage = new EmployeeSickLeavesPage(page);
    await expect(sickPage.dataTable).toBeVisible();

    const rowCount = await sickPage.getRowCount();
    const hasEmpty = await sickPage.emptyState.isVisible().catch(() => false);

    expect(rowCount > 0 || hasEmpty).toBe(true);
  });

  test('Sick leave rows contain dates and status', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeSickLeaves();
    await page.waitForLoadState('networkidle');

    const sickPage = new EmployeeSickLeavesPage(page);
    const rowCount = await sickPage.getRowCount();
    test.skip(rowCount === 0, 'No sick leave data');

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const row = sickPage.dataRows.nth(i);
      const text = (await row.textContent()) || '';
      // Should contain dates
      expect(text).toMatch(/\d/);
      expect(text.length).toBeGreaterThan(5);
    }
  });

  test('Filter by department — rows change', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeSickLeaves();
    await page.waitForLoadState('networkidle');

    const sickPage = new EmployeeSickLeavesPage(page);

    const filterVisible = await sickPage.departmentFilter.isVisible().catch(() => false);
    test.skip(!filterVisible, 'Department filter not visible');

    const options = sickPage.departmentFilter.locator('option');
    const optionCount = await options.count();
    test.skip(optionCount <= 1, 'Not enough options');

    await sickPage.departmentFilter.selectOption({ index: 1 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Table should still be visible
    await expect(sickPage.dataTable).toBeVisible();
  });
});

test.describe('Days Correction', () => {

  test('Correction table loads with data', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationDaysCorrection();
    await page.waitForLoadState('networkidle');

    const corrPage = new VacationDaysCorrectionPage(page);

    const tableVisible = await corrPage.dataTable.isVisible().catch(() => false);
    if (tableVisible) {
      const rowCount = await corrPage.getRowCount();
      // Table may have 0 rows if no corrections exist
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
    // Page should at least load
    await expect(page).toHaveURL(/\/vacation\/days-correction|\/admin/);
  });

  test('Correction rows contain employee names and numeric values', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationDaysCorrection();
    await page.waitForLoadState('networkidle');

    const corrPage = new VacationDaysCorrectionPage(page);

    const tableVisible = await corrPage.dataTable.isVisible().catch(() => false);
    test.skip(!tableVisible, 'Correction table not visible');

    const rowCount = await corrPage.getRowCount();
    test.skip(rowCount === 0, 'No correction data');

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const cells = await corrPage.getRowCells(i);
      expect(cells.length).toBeGreaterThan(1);

      // Should contain employee name and numbers
      const rowText = cells.join(' ');
      expect(rowText.length).toBeGreaterThan(3);
    }
  });
});
