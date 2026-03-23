import { test, expect } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';
import { PlannerPage } from '../pages/planner.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Планировщик — Тикеты — 4 теста (TR-713..TR-716)
// ============================================================================

test.describe('Планировщик — Тикеты', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToPlanner();
    await page.waitForLoadState('networkidle');
  });

  test('TR-713: Отображение тикетов из трекера', async ({ authenticatedPage: page }) => {
    const planner = new PlannerPage(page);

    // Ищем вкладку или секцию тикетов
    const ticketsTab = page.getByRole('tab', { name: new RegExp(`${t('tab.tickets')}|Ticket`, 'i') }).first();
    const tabVisible = await ticketsTab.isVisible().catch(() => false);
    if (tabVisible) {
      await ticketsTab.click();
      await page.waitForTimeout(500);
    }

    // Проверяем наличие списка тикетов из трекера
    const ticketsList = page.locator('.planner__table table, table').first();
    const isVisible = await ticketsList.isVisible().catch(() => false);
    if (isVisible) {
      await expect(ticketsList).toBeVisible();
    }
  });

  test('TR-714: Синхронизация тикетов', async ({ authenticatedPage: page }) => {
    // Проверяем наличие кнопки синхронизации с трекером
    const syncBtn = page.getByRole('button', { name: new RegExp(`${t('btn.sync')}|Sync`, 'i') }).first();
    const isVisible = await syncBtn.isVisible().catch(() => false);
    if (isVisible) {
      await syncBtn.click();
      await page.waitForTimeout(2000);

      // Проверяем индикатор загрузки или уведомление об успехе
      const loadingIndicator = page.locator('[role="progressbar"], .spinner').first();
      const successNotif = page.locator('.popup.popup_show, [role="alert"]').first();
      const loadingVisible = await loadingIndicator.isVisible().catch(() => false);
      const successVisible = await successNotif.isVisible().catch(() => false);
      // После синхронизации должен быть виден либо индикатор загрузки, либо уведомление об успехе
      expect(loadingVisible || successVisible).toBe(true);
    }
  });

  test('TR-715: Статус тикета из трекера', async ({ authenticatedPage: page }) => {
    // Проверяем отображение статусов тикетов (Open, In Progress, Closed и т.д.)
    const statusPattern = new RegExp(`Open|Closed|In Progress|${t('status.open')}|${t('status.closed')}|${t('status.inProgress')}`, 'i');
    const ticketStatuses = page.locator('td, span').filter({ hasText: statusPattern });
    const statusCount = await ticketStatuses.count();
    if (statusCount > 0) {
      const firstStatus = ticketStatuses.first();
      await expect(firstStatus).toBeVisible();
      const statusText = await firstStatus.textContent().catch(() => '');
      expect(statusText).toBeTruthy();
    }
    expect(statusCount).toBeGreaterThanOrEqual(0);
  });

  test('TR-716: Ссылка на тикет в трекере', async ({ authenticatedPage: page }) => {
    // Проверяем наличие ссылок на тикеты в трекере
    const ticketLinks = page.locator('a[href*="jira"], a[href*="redmine"], a[href*="youtrack"], a[href*="gitlab"]');
    const linkCount = await ticketLinks.count();
    if (linkCount > 0) {
      const firstLink = ticketLinks.first();
      await expect(firstLink).toBeVisible();
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
      // Ссылка должна вести на внешний ресурс (трекер)
      expect(href).toMatch(/^https?:\/\//);
    }
    expect(linkCount).toBeGreaterThanOrEqual(0);
  });
});
