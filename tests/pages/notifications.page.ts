import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

export class NotificationsPage extends BasePage {
  // Notification list
  readonly notificationList: Locator;
  readonly notificationItems: Locator;
  readonly emptyState: Locator;

  // Notification actions
  readonly markAsReadButton: Locator;
  readonly deleteButton: Locator;
  readonly markAllAsReadButton: Locator;

  // Unread counter
  readonly unreadCounter: Locator;

  // Filters
  readonly typeFilter: Locator;

  // Pagination
  readonly paginationContainer: Locator;
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;
  readonly pageNumbers: Locator;

  constructor(page: Page) {
    super(page);

    // Notification list
    this.notificationList = page.locator('.page-content, main, [class*="notification-list"]').first();
    this.notificationItems = this.notificationList.locator('li, tr, [class*="notification-item"]');
    this.emptyState = page.locator(`text=/${t('msg.noNotifications')}/i, [class*="empty"]`).first();

    // Notification actions
    this.markAsReadButton = page.getByRole('button', { name: new RegExp(t('btn.markAsRead'), 'i') }).first();
    this.deleteButton = page.getByRole('button', { name: new RegExp(t('btn.delete'), 'i') }).first();
    this.markAllAsReadButton = page.getByRole('button', { name: new RegExp(t('btn.markAllAsRead'), 'i') }).first();

    // Unread counter (in navigation bar) — bold__navbar__link or badge
    this.unreadCounter = page.locator('b.bold__navbar__link, [class*="badge"], [class*="counter"]').first();

    // Filters
    this.typeFilter = page.locator('[class*="type-filter"], select[class*="filter"]').first();

    // Pagination — uses Pagination component
    this.paginationContainer = page.locator('.pagination, nav[aria-label*="pagination"]').first();
    this.nextPageButton = this.paginationContainer.locator('button:has-text("»"), button:has-text("Next"), [aria-label="Next"]').first();
    this.prevPageButton = this.paginationContainer.locator('button:has-text("«"), button:has-text("Prev"), [aria-label="Previous"]').first();
    this.pageNumbers = this.paginationContainer.locator('button, a').filter({ hasNotText: /[«»]/ });
  }

  get url() { return '/notifications'; }

  // --- Notification helpers ---

  getNotification(index: number): Locator {
    return this.notificationItems.nth(index);
  }

  getNotificationByText(text: string): Locator {
    return this.notificationList.locator(`[class*="notification"]:has-text("${text}"), li:has-text("${text}"), tr:has-text("${text}")`).first();
  }

  async getNotificationCount(): Promise<number> {
    return await this.notificationItems.count();
  }

  async getNotificationTexts(): Promise<string[]> {
    const items = this.notificationItems;
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) texts.push(text.trim());
    }
    return texts;
  }

  // --- Actions ---

  async markAsRead(index: number) {
    const item = this.getNotification(index);
    await item.hover();
    await this.page.waitForTimeout(200);
    const readBtn = item.locator(`button:has-text("${t('btn.markAsRead')}"), button[class*="read"], [title*="${t('tooltip.read')}"]`).first();
    await readBtn.click();
    await this.page.waitForTimeout(500);
  }

  async deleteNotification(index: number) {
    const item = this.getNotification(index);
    await item.hover();
    await this.page.waitForTimeout(200);
    const deleteBtn = item.locator(`button:has-text("${t('btn.delete')}"), button[class*="delete"], [title*="${t('tooltip.delete')}"]`).first();
    await deleteBtn.click();
    await this.page.waitForTimeout(500);
  }

  async clickNotification(index: number) {
    const item = this.getNotification(index);
    const link = item.locator('a').first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
    } else {
      await item.click();
    }
    await this.page.waitForTimeout(500);
  }

  // --- Unread counter ---

  async getUnreadCount(): Promise<number> {
    const text = await this.unreadCounter.textContent().catch(() => '0');
    return parseInt(text || '0', 10) || 0;
  }

  // --- Filter ---

  async filterByType(type: string) {
    await this.typeFilter.selectOption({ label: type });
    await this.page.waitForTimeout(500);
  }

  // --- Pagination ---

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.page.waitForTimeout(500);
  }

  async goToPrevPage() {
    await this.prevPageButton.click();
    await this.page.waitForTimeout(500);
  }

  async isNotificationRead(index: number): Promise<boolean> {
    const item = this.getNotification(index);
    const classes = await item.evaluate(el => el.className);
    return classes.includes('read') || !classes.includes('unread');
  }
}
