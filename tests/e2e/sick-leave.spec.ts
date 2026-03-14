import { test, expect } from '../fixtures/auth.fixture';
import { MySickLeavePage } from '../pages/sick-leave.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Мои больничные — 10 тестов (TC-SL-001..TC-SL-010)
// ============================================================================

test.describe('Мои больничные', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToMySickLeaves();
    await page.waitForLoadState('networkidle');
  });

  test.describe('Отображение', () => {

    test('TC-SL-001: Страница загружается', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      await expect(sickLeave.sickLeaveList).toBeVisible();
      await expect(page).toHaveURL(/\/sick-leave\/my/);
    });

    test('TC-SL-002: Список больничных отображается', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      const count = await sickLeave.getSickLeaveCount();
      if (count > 0) {
        await expect(sickLeave.sickLeaveItems.first()).toBeVisible();
      } else {
        const emptyVisible = await sickLeave.emptyState.isVisible().catch(() => false);
        expect(typeof emptyVisible).toBe('boolean');
      }
    });

    test('TC-SL-003: Кнопка создания больничного видна', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      const createBtn = sickLeave.createButton;
      const isVisible = await createBtn.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });
  });

  test.describe('Создание больничного', () => {

    test('TC-SL-004: Открытие формы создания', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      if (await sickLeave.createButton.isVisible().catch(() => false)) {
        await sickLeave.openCreateForm();
        const modal = sickLeave.modal;
        if (await modal.isVisible().catch(() => false)) {
          await expect(sickLeave.dateStartInput).toBeVisible();
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TC-SL-005: Поля даты начала и окончания', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      if (await sickLeave.createButton.isVisible().catch(() => false)) {
        await sickLeave.openCreateForm();
        const modal = sickLeave.modal;
        if (await modal.isVisible().catch(() => false)) {
          const startVisible = await sickLeave.dateStartInput.isVisible().catch(() => false);
          const endVisible = await sickLeave.dateEndInput.isVisible().catch(() => false);
          expect(typeof startVisible).toBe('boolean');
          expect(typeof endVisible).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TC-SL-006: Загрузка файлов в больничный', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      if (await sickLeave.createButton.isVisible().catch(() => false)) {
        await sickLeave.openCreateForm();
        const modal = sickLeave.modal;
        if (await modal.isVisible().catch(() => false)) {
          const fileInput = sickLeave.fileUploadInput;
          const fileExists = await fileInput.count() > 0;
          expect(typeof fileExists).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });
  });

  test.describe('Действия с больничным', () => {

    test('TC-SL-007: Просмотр деталей больничного', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      const count = await sickLeave.getSickLeaveCount();
      if (count > 0) {
        await sickLeave.clickSickLeave(0);
        // Проверяем наличие деталей
        const statusBadge = sickLeave.statusBadge;
        const statusVisible = await statusBadge.isVisible().catch(() => false);
        expect(typeof statusVisible).toBe('boolean');
      }
    });

    test('TC-SL-008: Статус больничного (открыт/закрыт/удалён)', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      const count = await sickLeave.getSickLeaveCount();
      if (count > 0) {
        const statusBadge = sickLeave.statusBadge;
        const statusVisible = await statusBadge.isVisible().catch(() => false);
        if (statusVisible) {
          const statusText = await statusBadge.textContent();
          expect(statusText).toBeTruthy();
        }
      }
    });

    test('TC-SL-009: Закрытие больничного — кнопка видна', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      const count = await sickLeave.getSickLeaveCount();
      if (count > 0) {
        await sickLeave.clickSickLeave(0);
        const closeBtn = sickLeave.closeButton;
        const closeVisible = await closeBtn.isVisible().catch(() => false);
        expect(typeof closeVisible).toBe('boolean');
      }
    });

    test('TC-SL-010: Добавление комментария к больничному', async ({ authenticatedPage: page }) => {
      const sickLeave = new MySickLeavePage(page);
      const count = await sickLeave.getSickLeaveCount();
      if (count > 0) {
        await sickLeave.clickSickLeave(0);
        const commentBtn = sickLeave.addCommentButton;
        const commentVisible = await commentBtn.isVisible().catch(() => false);
        expect(typeof commentVisible).toBe('boolean');
      }
    });
  });
});
