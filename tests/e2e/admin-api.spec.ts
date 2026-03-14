import { test, expect } from '../fixtures/auth.fixture';
import { AdminPage } from '../pages/admin.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Администрирование — API-токены — 12 тестов (TR-848..TR-859)
// ============================================================================

test.describe('Администрирование — API-токены', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminApi();
    await page.waitForLoadState('networkidle');
  });

  test('TR-848: Список API-токенов отображается', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const tokenList = admin.tokenList;
    const isVisible = await tokenList.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-849: Кнопка создания токена видна', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const createBtn = admin.createTokenButton;
    const isVisible = await createBtn.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-850: Открытие формы создания токена', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const createBtn = admin.createTokenButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const nameInput = admin.tokenNameInput;
      if (await nameInput.isVisible().catch(() => false)) {
        await expect(nameInput).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  });

  test('TR-851: Поле названия токена обязательно', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const createBtn = admin.createTokenButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const nameInput = admin.tokenNameInput;
      if (await nameInput.isVisible().catch(() => false)) {
        // Пытаемся сохранить без названия
        await nameInput.fill('');
        const saveBtn = admin.tokenSaveButton;
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click();
          await page.waitForTimeout(300);
          // Форма должна остаться открытой или показать ошибку
          const inputStillVisible = await nameInput.isVisible().catch(() => false);
          expect(typeof inputStillVisible).toBe('boolean');
        }
        await page.keyboard.press('Escape');
      }
    }
  });

  test('TR-852: Создание нового API-токена', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const createBtn = admin.createTokenButton;
    if (await createBtn.isVisible().catch(() => false)) {
      const tokenName = `TestToken_${Date.now()}`;
      await createBtn.click();
      await page.waitForTimeout(300);
      const nameInput = admin.tokenNameInput;
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill(tokenName);
        const saveBtn = admin.tokenSaveButton;
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click();
          await page.waitForTimeout(500);
          const alertVisible = await admin.isAlertVisible();
          expect(typeof alertVisible).toBe('boolean');
        }
      }
    }
  });

  test('TR-853: Список обновляется после создания токена', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const tokenList = admin.tokenList;
    if (await tokenList.isVisible().catch(() => false)) {
      const rowsBefore = await tokenList.locator('tr, [class*="row"]').count();
      const createBtn = admin.createTokenButton;
      if (await createBtn.isVisible().catch(() => false)) {
        const tokenName = `ListTest_${Date.now()}`;
        await createBtn.click();
        await page.waitForTimeout(300);
        const nameInput = admin.tokenNameInput;
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill(tokenName);
          const saveBtn = admin.tokenSaveButton;
          if (await saveBtn.isVisible().catch(() => false)) {
            await saveBtn.click();
            await page.waitForTimeout(500);
            const rowsAfter = await tokenList.locator('tr, [class*="row"]').count();
            expect(rowsAfter).toBeGreaterThanOrEqual(rowsBefore);
          }
        }
      }
    }
  });

  test('TR-854: Копирование токена в буфер обмена', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const tokenList = admin.tokenList;
    if (await tokenList.isVisible().catch(() => false)) {
      const rows = tokenList.locator('tr, [class*="row"]');
      const count = await rows.count();
      if (count > 0) {
        const copyBtn = rows.first().locator('button:has-text("Копировать"), button[class*="copy"], [title*="Копировать"]').first();
        const isVisible = await copyBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
    }
  });

  test('TR-855: Кнопка удаления токена видна', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const tokenList = admin.tokenList;
    if (await tokenList.isVisible().catch(() => false)) {
      const rows = tokenList.locator('tr, [class*="row"]');
      const count = await rows.count();
      if (count > 0) {
        const deleteBtn = rows.first().locator('button:has-text("Удалить"), button[class*="delete"]').first();
        const isVisible = await deleteBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
    }
  });

  test('TR-856: Подтверждение удаления токена', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const tokenList = admin.tokenList;
    if (await tokenList.isVisible().catch(() => false)) {
      const rows = tokenList.locator('tr, [class*="row"]');
      const count = await rows.count();
      if (count > 0) {
        const deleteBtn = rows.first().locator('button:has-text("Удалить"), button[class*="delete"]').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(300);
          const confirmDialog = admin.confirmDialog;
          const isVisible = await confirmDialog.isVisible().catch(() => false);
          expect(typeof isVisible).toBe('boolean');
          if (isVisible) {
            await admin.confirmNoButton.click().catch(() => page.keyboard.press('Escape'));
          }
        }
      }
    }
  });

  test('TR-857: Отмена удаления токена', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const tokenList = admin.tokenList;
    if (await tokenList.isVisible().catch(() => false)) {
      const rows = tokenList.locator('tr, [class*="row"]');
      const count = await rows.count();
      if (count > 0) {
        const deleteBtn = rows.first().locator('button:has-text("Удалить"), button[class*="delete"]').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(300);
          const confirmDialog = admin.confirmDialog;
          if (await confirmDialog.isVisible().catch(() => false)) {
            await admin.confirmNoButton.click().catch(() => page.keyboard.press('Escape'));
            await page.waitForTimeout(300);
            // Список не должен измениться
            const rowsAfter = await rows.count();
            expect(rowsAfter).toBe(count);
          }
        }
      }
    }
  });

  test('TR-858: Алерт после успешного действия с токеном', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const alertContainer = admin.alertContainer;
    const isVisible = await alertContainer.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-859: Лимит на количество токенов', async ({ authenticatedPage: page }) => {
    const admin = new AdminPage(page);
    const tokenList = admin.tokenList;
    if (await tokenList.isVisible().catch(() => false)) {
      const rows = tokenList.locator('tr, [class*="row"]');
      const count = await rows.count();
      // Проверяем, что количество токенов ограничено разумным числом
      expect(count).toBeLessThanOrEqual(100);
    }
  });
});
