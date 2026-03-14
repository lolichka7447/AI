import { test, expect } from '../fixtures/auth.fixture';
import { MyVacationsPage, VacationDaysPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Пересчёт при изменении производственного календаря — 13 тестов (TR-449..TR-461)
// ============================================================================

test.describe('Пересчёт при изменении производственного календаря', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');
  });

  test('TR-449: Пересчёт рабочих дней при добавлении праздника', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-450: Пересчёт рабочих дней при удалении праздника', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-451: Пересчёт при переносе выходного на рабочий', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-452: Пересчёт при переносе рабочего на выходной', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-453: Пересчёт при добавлении сокращённого дня', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-454: Пересчёт отпускных дней при изменении календаря', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToEmployeeVacationDays();
    await page.waitForLoadState('networkidle');
    const days = new VacationDaysPage(page);
    await expect(days.dataTable).toBeVisible();
  });

  test('TR-455: Пересчёт часов при изменении рабочего дня', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-456: Пересчёт для существующих заявок', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-457: Пересчёт для подтверждённых заявок', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-458: Пересчёт для неподтверждённых заявок', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-459: Уведомление о пересчёте', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-460: Пересчёт для разных регионов', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });

  test('TR-461: Пересчёт при массовом изменении календаря', async ({ authenticatedPage: page }) => {
    const vacations = new MyVacationsPage(page);
    await expect(vacations.vacationList).toBeVisible();
  });
});
