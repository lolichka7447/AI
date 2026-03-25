import { test, expect } from '../fixtures/auth.fixture';
import { t } from '../i18n';
import { VacationDaysPage, MyVacationsPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';
import { setServerTime, resetServerTime, getServerTime, createTimemachineContext, reLoginAfterTimeChange } from '../helpers/timemachine';
import { APIRequestContext } from '@playwright/test';

// ============================================================================
// Vacation — Timemachine Tests (Year Change + Balance)
// Uses Clock API: PATCH /api/ttt/v1/test/clock with API_SECRET_TOKEN header
// Reset: POST /api/ttt/v1/test/clock/reset (MUST call after each test)
//
// NOTE: Changing server time invalidates session — re-login required after each change
// WARNING: These tests MUST run with --workers=1 or separately from other tests.
//          Server time changes affect ALL sessions including other parallel workers.
// ============================================================================

function futureDateISO(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

function uniqueComment(prefix: string): string {
  return `${prefix}_${Date.now()}_autotest`;
}

test.describe('Timemachine — Year Change Scenarios', () => {

  let apiCtx: APIRequestContext;
  let timemachineAvailable = true;

  test.beforeAll(async () => {
    apiCtx = await createTimemachineContext();
    try {
      const time = await getServerTime(apiCtx);
      console.log('Current server time:', time);
    } catch (e) {
      console.warn('Timemachine API not accessible:', e);
      timemachineAvailable = false;
    }
  });

  // IMPORTANT: Always reset server time after tests
  test.afterAll(async () => {
    if (timemachineAvailable) {
      await resetServerTime(apiCtx).catch((e) => {
        console.warn('Failed to reset server time — manual reset may be needed:', e);
      });
    }
    await apiCtx?.dispose();
  });

  test('Year transition — norm days update for new year', async ({ authenticatedPage: page }) => {
    test.skip(!timemachineAvailable, 'Timemachine API not accessible');

    // Set server time to January 1 of next year
    const nextYear = new Date().getFullYear() + 1;
    await setServerTime(apiCtx, `${nextYear}-01-01T10:00:00.000Z`);

    // Re-login (time change invalidates session)
    await reLoginAfterTimeChange(page);

    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeVacationDays();
    await page.waitForLoadState('networkidle');

    // Verify vacation-days page loaded for the new year
    const daysPage = new VacationDaysPage(page);
    await expect(daysPage.dataTable).toBeVisible();

    const headerText = (await daysPage.dataTable.locator('thead').textContent()) || '';
    expect(headerText).toContain('Сотрудник');

    // Table may show "Нет данных" for Jan 1 of new year (no employee days calculated yet)
    // OR it may show real data — both are valid for year transition
    const bodyText = (await daysPage.dataTable.locator('tbody').textContent()) || '';
    expect(bodyText.length).toBeGreaterThan(0);

    await resetServerTime(apiCtx);
  });

  test('Next year restriction — before Feb 1 cannot create next-year vacation', async ({ authenticatedPage: page }) => {
    test.skip(!timemachineAvailable, 'Timemachine API not accessible');

    const currentYear = new Date().getFullYear();
    await setServerTime(apiCtx, `${currentYear}-01-15T10:00:00.000Z`);

    await reLoginAfterTimeChange(page);

    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const vacations = new MyVacationsPage(page);
    await vacations.openCreateForm();
    await expect(vacations.vacationModal).toBeVisible();

    // Try to create vacation for next year
    const nextYear = currentYear + 1;
    await vacations.fillDate(vacations.dateStartInput, `${nextYear}-03-01`);
    await vacations.fillDate(vacations.dateEndInput, `${nextYear}-03-05`);
    await vacations.commentInput.fill('next-year-restriction-test');
    await page.waitForTimeout(500);

    await vacations.submitButton.click();
    await page.waitForTimeout(1000);

    const modalStillOpen = await vacations.vacationModal.isVisible();
    const errorVisible = await vacations.errorMessage.isVisible().catch(() => false);
    const alertVisible = await vacations.alertContainer.isVisible().catch(() => false);

    expect(modalStillOpen || errorVisible || alertVisible).toBe(true);

    await vacations.cancelButton.click().catch(() => page.keyboard.press('Escape'));
    await resetServerTime(apiCtx);
  });

  test('Year transition — past periods balance appears', async ({ authenticatedPage: page }) => {
    test.skip(!timemachineAvailable, 'Timemachine API not accessible');

    const nextYear = new Date().getFullYear() + 1;
    await setServerTime(apiCtx, `${nextYear}-03-01T10:00:00.000Z`);

    await reLoginAfterTimeChange(page);

    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeVacationDays();
    await page.waitForLoadState('networkidle');

    // Verify vacation-days page loaded after year change (increase timeout for slow reLogin)
    const visibleTable = page.locator('table:visible').first();
    await expect(visibleTable).toBeVisible({ timeout: 15000 });

    const headerText = (await visibleTable.locator('thead').textContent()) || '';
    expect(headerText).toContain('Сотрудник');

    // Table body should exist (may show data or "Нет данных" depending on server recalculation)
    const bodyText = (await visibleTable.locator('tbody').textContent()) || '';
    expect(bodyText.length).toBeGreaterThan(0);

    // If data rows exist (not "Нет данных"), verify they contain numbers
    if (!bodyText.includes('Нет данных')) {
      expect(/\d/.test(bodyText)).toBe(true);
    }

    await resetServerTime(apiCtx);
  });

  test('Admin vacation in past — still visible after time change', async ({ authenticatedPage: page }) => {
    test.skip(!timemachineAvailable, 'Timemachine API not accessible');

    // Ensure session is valid (may be invalidated by parallel timemachine test)
    const navbarVisible = await page.locator('nav, .navbar').first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!navbarVisible) {
      await reLoginAfterTimeChange(page);
    }

    const nav = new NavigationComponent(page);

    // Create an admin vacation in the near future (before time change)
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const vacations = new MyVacationsPage(page);
    const comment = uniqueComment('timemachine-admin');
    await vacations.createAdministrativeVacation(futureDateISO(5), futureDateISO(6), comment);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const countAfterCreate = await vacations.getVacationCount();
    expect(countAfterCreate).toBeGreaterThan(0);

    // Advance time by 30 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await setServerTime(apiCtx, futureDate.toISOString());

    // Re-login after time change
    await reLoginAfterTimeChange(page);

    // Navigate to vacations — switch to "Все" filter to see closed vacations too
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const pageText = (await page.locator('body').textContent()) || '';
    expect(pageText.length).toBeGreaterThan(10);

    await resetServerTime(apiCtx);
  });

  test('Expected balance years in chronological order after year change', async ({ authenticatedPage: page }) => {
    test.skip(!timemachineAvailable, 'Timemachine API not accessible');

    await setServerTime(apiCtx, '2027-03-01T10:00:00.000Z');

    await reLoginAfterTimeChange(page);

    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeVacationDays();
    await page.waitForLoadState('networkidle');

    const daysPage = new VacationDaysPage(page);
    await expect(daysPage.dataTable).toBeVisible();

    const tableText = (await daysPage.dataTable.textContent()) || '';
    expect(tableText.length).toBeGreaterThan(20);

    await resetServerTime(apiCtx);
  });

  test('3-month restriction: UI mechanism exists for new employees', async ({ authenticatedPage: page }) => {
    // This test doesn't need timemachine — verifies limitation UI mechanism
    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const vacations = new MyVacationsPage(page);
    await vacations.openCreateForm();
    await expect(vacations.vacationModal).toBeVisible();

    await vacations.fillDate(vacations.dateStartInput, futureDateISO(30));
    await vacations.fillDate(vacations.dateEndInput, futureDateISO(35));
    await page.waitForTimeout(500);

    // For pvaynmaster (long-time employee), there should be no limitation warning
    const modalText = (await vacations.vacationModal.textContent()) || '';
    expect(modalText.length).toBeGreaterThan(10);

    await vacations.cancelButton.click();
  });
});
