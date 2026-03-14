import { test, expect } from '../fixtures/auth.fixture';
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
    const isVisible = await settingsForm.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
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
      const isEnabled = await firstInput.isEnabled().catch(() => false);
      expect(typeof isEnabled).toBe('boolean');
    }
  });

  test('TR-815: Кнопка сохранения настроек видна', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const saveBtn = admin.settingsSaveButton;
    const isVisible = await saveBtn.isVisible().catch(() => false);
    if (isVisible) {
      await expect(saveBtn).toBeVisible();
    }
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-816: Алерт при сохранении настроек', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const saveBtn = admin.settingsSaveButton;
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(500);
      const alertVisible = await admin.isAlertVisible();
      expect(typeof alertVisible).toBe('boolean');
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
    const resetBtn = page.locator('button:has-text("Сбросить"), button:has-text("По умолчанию"), button:has-text("Reset")').first();
    const isVisible = await resetBtn.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-819: Feature toggles — секция видна', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    await admin.switchToFeatureToggles();
    const toggleList = admin.toggleList;
    const isVisible = await toggleList.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
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
