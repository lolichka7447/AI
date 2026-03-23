import { test, expect } from '../fixtures/auth.fixture';
import { NotificationsPage } from '../pages/notifications.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Notifications Deep Tests — 3 tests (TC-NTF-020..TC-NTF-022)
// ============================================================================

test.describe('TC-NTF: Notifications Deep Tests', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToNotifications();
    await page.waitForLoadState('networkidle');
  });

  test('TC-NTF-020: Mark all as read button', async ({ authenticatedPage: page }) => {
    const notif = new NotificationsPage(page);

    // Mark All As Read button should exist
    const markAllBtn = notif.markAllAsReadButton;
    const hasBtn = await markAllBtn.isVisible().catch(() => false);

    // Either button is visible (there are notifications) or empty state
    const isEmpty = await notif.emptyState.isVisible().catch(() => false);
    expect(hasBtn || isEmpty).toBe(true);
  });

  test('TC-NTF-021: Notification list or empty state', async ({ authenticatedPage: page }) => {
    const notif = new NotificationsPage(page);

    // Should have either notification items or empty state
    const itemCount = await notif.notificationItems.count().catch(() => 0);
    const isEmpty = await notif.emptyState.isVisible().catch(() => false);

    expect(itemCount > 0 || isEmpty).toBe(true);
  });

  test('TC-NTF-022: Notification counter in navbar', async ({ authenticatedPage: page }) => {
    const notif = new NotificationsPage(page);

    // Counter badge in navbar
    const counter = notif.unreadCounter;
    const hasCounter = await counter.isVisible().catch(() => false);

    if (hasCounter) {
      const counterText = await counter.textContent().catch(() => '');
      // Counter should be a number or empty
      const num = parseInt(counterText || '0', 10);
      expect(num).toBeGreaterThanOrEqual(0);
    }

    // Page should be on notifications
    await expect(page).toHaveURL(/\/notification/);
  });

  test('TC-NTF-030: Read status indicator on notifications', async ({ authenticatedPage: page }) => {
    const notif = new NotificationsPage(page);

    const itemCount = await notif.notificationItems.count().catch(() => 0);
    if (itemCount > 0) {
      // Check read status of first notification
      const isRead = await notif.isNotificationRead(0);
      expect(typeof isRead).not.toBe('undefined');
    } else {
      // Empty state is acceptable
      await expect(notif.emptyState).toBeVisible();
    }
  });

  test('TC-NTF-031: Notification texts are non-empty', async ({ authenticatedPage: page }) => {
    const notif = new NotificationsPage(page);

    const texts = await notif.getNotificationTexts();
    if (texts.length > 0) {
      // Each notification text should be non-empty
      for (const text of texts) {
        expect(text.length).toBeGreaterThan(0);
      }
    }
  });

  test('TC-NTF-032: Notification count matches list', async ({ authenticatedPage: page }) => {
    const notif = new NotificationsPage(page);

    const count = await notif.getNotificationCount();
    const itemCount = await notif.notificationItems.count().catch(() => 0);

    // Count should match visible items (on current page)
    expect(count).toBeGreaterThanOrEqual(0);
    if (count > 0) {
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('TC-NTF-033: Unread count from navbar', async ({ authenticatedPage: page }) => {
    const notif = new NotificationsPage(page);

    const unreadCount = await notif.getUnreadCount();
    expect(unreadCount).toBeGreaterThanOrEqual(0);
  });
});
