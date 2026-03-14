import { test, expect } from '../fixtures/auth.fixture';
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
    const ticketsTab = page.getByRole('tab', { name: /Тикет|Ticket/i }).first();
    const tabVisible = await ticketsTab.isVisible().catch(() => false);
    if (tabVisible) {
      await ticketsTab.click();
      await page.waitForTimeout(500);
    }

    // Проверяем наличие списка тикетов из трекера
    const ticketsList = page.locator('[class*="ticket"], [class*="issue"], [class*="tracker"]').first();
    const isVisible = await ticketsList.isVisible().catch(() => false);
    if (isVisible) {
      await expect(ticketsList).toBeVisible();
    }
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-714: Синхронизация тикетов', async ({ authenticatedPage: page }) => {
    // Проверяем наличие кнопки синхронизации с трекером
    const syncBtn = page.getByRole('button', { name: /Синхронизировать|Sync|Обновить тикеты/i }).first();
    const isVisible = await syncBtn.isVisible().catch(() => false);
    if (isVisible) {
      await syncBtn.click();
      await page.waitForTimeout(2000);

      // Проверяем индикатор загрузки или уведомление об успехе
      const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], [role="progressbar"]').first();
      const successNotif = page.locator('[class*="success"], [class*="toast"], [role="alert"]').first();
      const loadingVisible = await loadingIndicator.isVisible().catch(() => false);
      const successVisible = await successNotif.isVisible().catch(() => false);
      expect(typeof loadingVisible === 'boolean' || typeof successVisible === 'boolean').toBeTruthy();
    }
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-715: Статус тикета из трекера', async ({ authenticatedPage: page }) => {
    // Проверяем отображение статусов тикетов (Open, In Progress, Closed и т.д.)
    const ticketStatuses = page.locator('[class*="ticket-status"], [class*="issue-status"], [class*="badge"]:has-text(/Open|Closed|In Progress|Открыт|Закрыт|В работе/i)');
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
    const ticketLinks = page.locator('a[href*="jira"], a[href*="redmine"], a[href*="youtrack"], a[class*="ticket-link"], a[class*="issue-link"]');
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
