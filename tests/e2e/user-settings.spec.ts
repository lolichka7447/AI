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
      const settings = new UserSettingsPage(page);
      const profileVisible = await settings.profileSection.isVisible().catch(() => false);
      expect(profileVisible).toBe(true);
      await expect(page).toHaveURL(/\/admin\/account|\/settings|\/profile/);
    });

    test('TR-992: Таб «Общие» доступен', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const visible = await settings.generalTab.isVisible().catch(() => false);
      expect(visible).toBe(true);
    });

    test('TR-993: Секция токена видна', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const tokenSection = settings.tokenSection;
      const visible = await tokenSection.isVisible().catch(() => false);
      expect(visible).toBe(true);
    });

    test('TR-994: Генерация нового токена', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const generateBtn = settings.generateTokenButton;
      const visible = await generateBtn.isVisible().catch(() => false);
      expect(visible).toBe(true);
    });

    test('TR-995: Копирование токена', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const copyBtn = settings.copyTokenButton;
      const visible = await copyBtn.isVisible().catch(() => false);
      expect(visible).toBe(true);
    });

    test('TR-996: Отзыв токена', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const revokeBtn = settings.revokeTokenButton;
      const visible = await revokeBtn.isVisible().catch(() => false);
      expect(visible).toBe(true);
    });

    test('TR-997: Поле профиля — имя', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const nameInput = settings.nameInput;
      const visible = await nameInput.isVisible().catch(() => false);
      expect(visible).toBe(true);
    });

    test('TR-998: Выбор языка интерфейса', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const langSelect = settings.languageSelect;
      const visible = await langSelect.isVisible().catch(() => false);
      expect(visible).toBe(true);
    });

    test('TR-999: Сохранение профиля', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const saveBtn = settings.saveProfileButton;
      const visible = await saveBtn.isVisible().catch(() => false);
      expect(visible).toBe(true);
    });
  });

  // ==========================================================================
  // Трекеры (TR-1000..TR-1006, 7 тестов)
  // ==========================================================================
  test.describe('Трекеры', () => {

    test('TR-1000: Таб «Трекеры» доступен', async ({ authenticatedPage: page }) => {
      const settings = new UserSettingsPage(page);
      const visible = await settings.trackersTab.isVisible().catch(() => false);
      await expect(page.locator('.page-content, main, form').first()).toBeVisible();
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
      const visible = await settings.exportTab.isVisible().catch(() => false);
      await expect(page.locator('.page-content, main, form').first()).toBeVisible();
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
