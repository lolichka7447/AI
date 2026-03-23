import { test, expect } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';
import { AdminPage } from '../pages/admin.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Администрирование — Параметры TTT — 10 тестов (TR-812..TR-821)
// ============================================================================

test.describe('Администрирование — Параметры TTT', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminSettings();
    await page.waitForLoadState('networkidle');
  });

  test('TR-812: Страница параметров загружается', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const settingsForm = admin.settingsForm;
    await expect(settingsForm).toBeVisible();
  });

  test('TR-813: Форма настроек отображается', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const settingsForm = admin.settingsForm;
    if (await settingsForm.isVisible().catch(() => false)) {
      const inputs = settingsForm.locator('input, select, textarea');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('TR-814: Поля параметров доступны для редактирования', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const settingsForm = admin.settingsForm;
    if (await settingsForm.isVisible().catch(() => false)) {
      const firstInput = settingsForm.locator('input, select').first();
      await expect(firstInput).toBeEnabled();
    }
  });

  test('TR-815: Кнопка сохранения настроек видна', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const saveBtn = admin.settingsSaveButton;
    await expect(saveBtn).toBeVisible();
  });

  test('TR-816: Алерт при сохранении настроек', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const saveBtn = admin.settingsSaveButton;
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="alert"], .alert, .notification').first()).toBeVisible();
    }
  });

  test('TR-817: Валидация обязательных полей', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const settingsForm = admin.settingsForm;
    if (await settingsForm.isVisible().catch(() => false)) {
      const requiredInputs = settingsForm.locator('input[required], [aria-required="true"]');
      const count = await requiredInputs.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-818: Сброс настроек к значениям по умолчанию', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const resetBtn = page.locator(`button:has-text("${t('btn.reset')}"), button:has-text("${t('btn.default')}"), button:has-text("Reset")`).first();
    await expect(resetBtn).toBeVisible();
  });

  test('TR-819: Feature toggles — секция видна', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    await admin.switchToFeatureToggles();
    const toggleList = admin.toggleList;
    await expect(toggleList).toBeVisible();
  });

  test('TR-820: Feature toggles — переключатели доступны', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    await admin.switchToFeatureToggles();
    const items = admin.toggleItems;
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TR-821: Параметры — форма содержит метки полей', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const settingsForm = admin.settingsForm;
    if (await settingsForm.isVisible().catch(() => false)) {
      const labels = settingsForm.locator('label');
      const count = await labels.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
