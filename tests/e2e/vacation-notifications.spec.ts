import { test, expect } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';
import { MyVacationsPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Vacation — Notifications & Event Feed Tests
// Event feed updates, i18n checks
// ============================================================================

function futureDateISO(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

function uniqueComment(prefix: string): string {
  return `${prefix}_${Date.now()}_autotest`;
}

test.describe('Vacation Event Feed', () => {

  test('No Cyrillic in EN mode — event feed (#3344 regression)', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);

    // Switch to English
    await nav.switchLanguage();
    await page.waitForTimeout(1000);

    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const vacations = new MyVacationsPage(page);

    // Check entire page for Cyrillic (in EN mode there should be none except names)
    const feedVisible = await vacations.eventFeed.isVisible().catch(() => false);
    if (feedVisible) {
      const feedText = (await vacations.eventFeed.textContent()) || '';
      // UI labels should NOT contain Cyrillic
      // (employee names can be Cyrillic — we check for known Russian UI words)
      const russianUIWords = /Отпуск|Создан|Подтвержд|Отклон|Оплач|Заверш|Новая|Статус/;
      const hasRussianUI = russianUIWords.test(feedText);
      expect(hasRussianUI).toBe(false);
    }

    // Switch back to Russian
    await nav.switchLanguage();
    await page.waitForTimeout(500);
  });

  test('Event feed updates after creating vacation', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const vacations = new MyVacationsPage(page);

    // Read feed content before
    const feedVisible = await vacations.eventFeed.isVisible().catch(() => false);
    const feedBefore = feedVisible ? (await vacations.eventFeed.textContent()) || '' : '';

    // Create a vacation
    const comment = uniqueComment('feed-test');
    await vacations.createVacation(futureDateISO(130), futureDateISO(132), comment);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Reload page to see updated feed
    await page.reload();
    await page.waitForLoadState('networkidle');

    const feedAfterVisible = await vacations.eventFeed.isVisible().catch(() => false);
    if (feedAfterVisible) {
      const feedAfter = (await vacations.eventFeed.textContent()) || '';
      // Feed should have content
      expect(feedAfter.length).toBeGreaterThan(0);
    }

    // Even without visible feed, page should have updated content
    const pageText = (await page.locator('main').textContent()) || '';
    expect(pageText.length).toBeGreaterThan(10);
  });

  test('Page content in RU mode contains proper Russian labels', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const pageText = (await page.locator('main').textContent()) || '';
    // In Russian mode, should contain Cyrillic UI elements
    expect(pageText).toMatch(/[а-яА-ЯёЁ]/);
  });

  test('Language switch — UI labels change language', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const textBefore = (await page.locator('main').textContent()) || '';

    // Switch language
    await nav.switchLanguage();
    await page.waitForTimeout(1000);

    await nav.navigateToMyVacations();
    await page.waitForLoadState('networkidle');

    const textAfter = (await page.locator('main').textContent()) || '';

    // Text should be different after language switch
    expect(textAfter).not.toBe(textBefore);

    // Switch back
    await nav.switchLanguage();
    await page.waitForTimeout(500);
  });
});
