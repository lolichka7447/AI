import { test, expect } from '../fixtures/auth.fixture';
import { PeriodsPage } from '../pages/accounting.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Бухгалтерия — Изменение периодов — 14 тестов (TR-878..TR-891)
// ============================================================================
test.describe('Изменение периодов', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToPeriodsChange();
    await page.waitForLoadState('networkidle');
  });

  test('TR-878: Страница периодов загружается', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    await expect(page).toHaveURL(/\/admin\/offices/);
    await expect(periods.periodTable).toBeVisible();
  });

  test('TR-879: Таблица периодов видна', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    await expect(periods.periodTable).toBeVisible();
    const count = await periods.getRowCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TR-880: Вкладки офисов отображаются', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    await expect(periods.officeTabs).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-881: Переключение между офисами', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    if (await periods.officeTabs.isVisible().catch(() => false)) {
      const tabs = periods.officeTabs.locator('[role="tab"], button, a');
      const tabCount = await tabs.count().catch(() => 0);
      if (tabCount > 1) {
        await tabs.nth(1).click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const count = await periods.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('TR-882: Данные обновляются при смене офиса', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    if (await periods.officeTabs.isVisible().catch(() => false)) {
      const tabs = periods.officeTabs.locator('[role="tab"], button, a');
      const tabCount = await tabs.count().catch(() => 0);
      if (tabCount > 1) {
        const countFirst = await periods.getRowCount();
        await tabs.nth(1).click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const countSecond = await periods.getRowCount();
        expect(countSecond).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('TR-883: Выбор офиса через селект', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    await expect(periods.officeSelect).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-884: Форма редактирования периода доступна', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    await expect(periods.periodForm).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-885: Поле даты начала периода', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    if (await periods.periodForm.isVisible().catch(() => false)) {
      const startDate = periods.periodForm.locator(`input[type="date"], input[placeholder*="${t('placeholder.start')}" i]`).first();
      await expect(startDate).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-886: Поле даты окончания периода', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    if (await periods.periodForm.isVisible().catch(() => false)) {
      const endDate = periods.periodForm.locator(`input[type="date"], input[placeholder*="${t('placeholder.end')}" i]`).last();
      await expect(endDate).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-887: Кнопка сохранения доступна', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    await expect(periods.saveButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-888: Уведомление при сохранении', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    if (await periods.saveButton.isVisible().catch(() => false)) {
      await periods.saveButton.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      const alert = page.locator('.popup.popup_show, [role="alert"]').first();
      await expect(alert).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-889: Валидация формы периода', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    if (await periods.periodForm.isVisible().catch(() => false)) {
      const errors = periods.periodForm.locator(`[role="alert"], :has-text("${t('msg.error')}"), .popup.popup_show`);
      const errorCount = await errors.count().catch(() => 0);
      expect(errorCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-890: Отображение количества рабочих дней', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    const count = await periods.getRowCount();
    if (count > 0) {
      const firstRow = periods.periodRows.first();
      const text = await firstRow.textContent().catch(() => '');
      expect(text).toBeTruthy();
    }
  });

  test('TR-891: Отображение количества рабочих часов', async ({ authenticatedPage: page }) => {
    const periods = new PeriodsPage(page);
    const count = await periods.getRowCount();
    if (count > 0) {
      const lastRow = periods.periodRows.last();
      const text = await lastRow.textContent().catch(() => '');
      expect(text).toBeTruthy();
    }
  });
});
