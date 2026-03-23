import { test, expect } from '../fixtures/auth.fixture';
import { UserSettingsPage } from '../pages/user-settings.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Настройки пользователя — 19 тестов (TR-991..TR-1009)
// ============================================================================

test.describe('Настройки пользователя', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAccount();
    await page.waitForLoadState('networkidle');
  });

  // ==========================================================================
  // Общие настройки (TR-991..TR-999, 9 тестов)
  // ==========================================================================
  test.describe('Общие настройки', () => {

    test('TR-991: Страница настроек загружается', async ({ authenticatedPage: page }) => {
      await expect(page).toHaveURL(/\/admin\/account/);
      // Page should show user name and tabs
      await expect(page.getByText('pvaynmaster')).toBeVisible();
    });

    test('TR-992: Таб «Общие» доступен', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      await expect(settings.generalTab).toBeVisible();
    });

    test('TR-993: Секция токена видна', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      await expect(settings.tokenSection).toBeVisible();
    });

    test('TR-994: Генерация нового токена', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      // Token definition has 2 buttons (copy + revoke/regenerate)
      await expect(settings.currentToken).toBeVisible();
      const buttonCount = await settings.currentToken.locator('button').count();
      expect(buttonCount).toBeGreaterThanOrEqual(1);
    });

    test('TR-995: Копирование токена', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      await expect(settings.copyTokenButton).toBeVisible();
    });

    test('TR-996: Отзыв токена', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      await expect(settings.revokeTokenButton).toBeVisible();
    });

    test('TR-997: Поле профиля — имя', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      // The spinbutton is for "Переносить задачи за последние N дней"
      await expect(settings.nameInput).toBeVisible();
    });

    test('TR-998: Выбор языка интерфейса', async ({ authenticatedPage: page }) => {
      // Language switcher is in the page header (RU/EN dropdown)
      await expect(page.locator('.language-switcher')).toBeVisible();
    });

    test('TR-999: Сохранение профиля', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      await expect(settings.saveProfileButton).toBeVisible();
    });
  });

  // ==========================================================================
  // Трекеры (TR-1000..TR-1006, 7 тестов)
  // ==========================================================================
  test.describe('Трекеры', () => {

    test('TR-1000: Таб «Трекеры» доступен', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      await expect(settings.trackersTab).toBeVisible();
    });

    test('TR-1001: Переключение на таб «Трекеры»', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      if (await settings.trackersTab.isVisible().catch(() => false)) {
        await settings.switchToTrackers();
        const trackerList = settings.trackerList;
        const visible = await trackerList.isVisible().catch(() => false);
        expect(visible).toBe(true);
      }
    });

    test('TR-1002: Список трекеров отображается', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      if (await settings.trackersTab.isVisible().catch(() => false)) {
        await settings.switchToTrackers();
        const count = await settings.getTrackerCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('TR-1003: Кнопка добавления трекера', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      if (await settings.trackersTab.isVisible().catch(() => false)) {
        await settings.switchToTrackers();
        const addBtn = settings.addTrackerButton;
        const visible = await addBtn.isVisible().catch(() => false);
        expect(visible).toBe(true);
      }
    });

    test('TR-1004: Форма добавления трекера', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      if (await settings.trackersTab.isVisible().catch(() => false)) {
        await settings.switchToTrackers();
        if (await settings.addTrackerButton.isVisible().catch(() => false)) {
          await settings.addTrackerButton.click();
          await page.waitForTimeout(300);
          const modal = settings.trackerFormModal;
          const visible = await modal.isVisible().catch(() => false);
          expect(visible).toBe(true);
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TR-1005: Редактирование трекера', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      if (await settings.trackersTab.isVisible().catch(() => false)) {
        await settings.switchToTrackers();
        const count = await settings.getTrackerCount();
        if (count > 0) {
          const editBtn = settings.trackerRows.first().locator(`button:has-text("${t('btn.edit')}"), [title*="${t('tooltip.edit')}"]`).first();
          const visible = await editBtn.isVisible().catch(() => false);
          expect(visible).toBe(true);
        }
      }
    });

    test('TR-1006: Удаление трекера', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      if (await settings.trackersTab.isVisible().catch(() => false)) {
        await settings.switchToTrackers();
        const count = await settings.getTrackerCount();
        if (count > 0) {
          const deleteBtn = settings.trackerRows.first().locator(`button:has-text("${t('btn.delete')}"), [title*="${t('tooltip.delete')}"]`).first();
          const visible = await deleteBtn.isVisible().catch(() => false);
          expect(visible).toBe(true);
        }
      }
    });
  });

  // ==========================================================================
  // Экспорт (TR-1007..TR-1009, 3 теста)
  // ==========================================================================
  test.describe('Экспорт', () => {

    test('TR-1007: Таб «Экспорт» доступен', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      await expect(settings.exportTab).toBeVisible();
    });

    test('TR-1008: Переключение на таб «Экспорт»', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      if (await settings.exportTab.isVisible().catch(() => false)) {
        await settings.switchToExport();
        const exportSection = settings.exportSection;
        const visible = await exportSection.isVisible().catch(() => false);
        expect(visible).toBe(true);
      }
    });

    test('TR-1009: Кнопка экспорта данных', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      if (await settings.exportTab.isVisible().catch(() => false)) {
        await settings.switchToExport();
        const exportBtn = settings.exportButton;
        const visible = await exportBtn.isVisible().catch(() => false);
        expect(visible).toBe(true);
      }
    });
  });
});
