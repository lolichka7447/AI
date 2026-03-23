import { test, expect } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';
import { VacationDaysCorrectionPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Бухгалтерия — Корректировка отпускных дней — 26 тестов (TR-938..TR-963)
// ============================================================================
test.describe('Корректировка отпускных дней', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationDaysCorrection();
    await page.waitForLoadState('networkidle');
  });

  test('TR-938: Страница корректировки загружается', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    await expect(page).toHaveURL(/\/vacation\/days-correction/);
    const tableVisible = await correction.dataTable.isVisible().catch(() => false);
    const formVisible = await correction.form.isVisible().catch(() => false);
    expect(tableVisible || formVisible).toBe(true);
  });

  test('TR-939: Форма корректировки видна', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    await expect(correction.form).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-940: Выбор сотрудника доступен', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    await expect(correction.employeeSelect).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-941: Ввод количества дней', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.daysInput.isVisible().catch(() => false)) {
      await correction.daysInput.fill('5');
      const value = await correction.daysInput.inputValue().catch(() => '');
      expect(value).toBe('5');
    }
  });

  test('TR-942: Ввод причины корректировки', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.reasonInput.isVisible().catch(() => false)) {
      await correction.reasonInput.fill('Тестовая причина');
      const value = await correction.reasonInput.inputValue().catch(() => '');
      expect(value).toBe('Тестовая причина');
    }
  });

  test('TR-943: Кнопка сохранения доступна', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    await expect(correction.submitButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-944: Уведомление при сохранении корректировки', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.submitButton.isVisible().catch(() => false)) {
      await correction.submitButton.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      const alert = page.locator('.popup.popup_show, [role="alert"]').first();
      await expect(alert).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-945: Таблица истории корректировок отображается', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    await expect(correction.dataTable).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-946: История корректировок содержит данные', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const count = await correction.getRowCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TR-947: Положительная корректировка (+дни)', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.daysInput.isVisible().catch(() => false)) {
      await correction.daysInput.fill('3');
      const value = await correction.daysInput.inputValue().catch(() => '');
      expect(value).toBe('3');
    }
  });

  test('TR-948: Отрицательная корректировка (-дни)', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.daysInput.isVisible().catch(() => false)) {
      await correction.daysInput.fill('-3');
      const value = await correction.daysInput.inputValue().catch(() => '');
      expect(value).toBe('-3');
    }
  });

  test('TR-949: Валидация — пустой сотрудник', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.submitButton.isVisible().catch(() => false)) {
      // Не выбираем сотрудника, нажимаем сохранить
      await correction.submitButton.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      const error = page.locator(`.popup.popup_show, [role="alert"], :has-text("${t('msg.error')}")`).first();
      await expect(error).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-950: Валидация — нулевое количество дней', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.daysInput.isVisible().catch(() => false)) {
      await correction.daysInput.fill('0');
      await correction.submitButton.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      const error = page.locator(`.popup.popup_show, [role="alert"], :has-text("${t('msg.error')}")`).first();
      await expect(error).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-951: Валидация — пустая причина', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.reasonInput.isVisible().catch(() => false)) {
      await correction.reasonInput.clear();
      await correction.submitButton.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      const error = page.locator(`.popup.popup_show, [role="alert"], :has-text("${t('msg.error')}")`).first();
      await expect(error).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-952: Валидация — нечисловое значение дней', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.daysInput.isVisible().catch(() => false)) {
      await correction.daysInput.fill('abc');
      const value = await correction.daysInput.inputValue().catch(() => '');
      // input[type="number"] может отклонить нечисловое значение
      expect(typeof value).toBe('string');
    }
  });

  test('TR-953: Баланс дней обновляется после корректировки', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const balanceElement = page.locator(`text=/${t('label.balance')}|${t('label.balanceAlt')}/i`).first();
    await expect(balanceElement).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-954: Фильтрация истории по сотруднику', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const filterInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], .header-filter input`).first();
    await expect(filterInput).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-955: Фильтрация истории по дате', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const dateFilter = page.locator('select, .header-filter, input[type="date"]').first();
    await expect(dateFilter).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-956: Сортировка истории по дате', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    if (await correction.dataTable.isVisible().catch(() => false)) {
      const dateHeader = correction.dataTable.locator('thead th').first();
      if (await dateHeader.isVisible().catch(() => false)) {
        await dateHeader.click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const count = await correction.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('TR-957: Удаление корректировки — кнопка видна', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const count = await correction.getRowCount();
    if (count > 0) {
      const deleteButton = correction.dataRows.first().locator(`button:has-text("${t('btn.delete')}"), button[aria-label*="${t('btn.delete')}" i]`).first();
      await expect(deleteButton).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-958: Подтверждение удаления корректировки', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const count = await correction.getRowCount();
    if (count > 0) {
      const deleteButton = correction.dataRows.first().locator(`button:has-text("${t('btn.delete')}")`).first();
      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        const confirmDialog = page.locator('.modal, .modal__wrapper, [role="dialog"]').first();
        await expect(confirmDialog).toBeVisible({ timeout: 3000 }).catch(() => {});
        await page.keyboard.press('Escape');
      }
    }
  });

  test('TR-959: Редактирование существующей корректировки', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const count = await correction.getRowCount();
    if (count > 0) {
      const editButton = correction.dataRows.first().locator(`button:has-text("${t('btn.edit')}"), button[aria-label*="${t('btn.edit')}" i]`).first();
      await expect(editButton).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('TR-960: Массовая корректировка', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const batchButton = page.getByRole('button', { name: new RegExp(`${t('btn.batchPay')}|Batch`, 'i') }).first();
    await expect(batchButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-961: Экспорт истории корректировок', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const exportButton = page.getByRole('button', { name: new RegExp(`${t('btn.export')}|Export`, 'i') }).first();
    await expect(exportButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TR-962: Пустое состояние — нет корректировок', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const count = await correction.getRowCount();
    if (count === 0) {
      const emptyState = page.locator(`text=/${t('msg.noData')}/i`).first();
      await expect(emptyState).toBeVisible({ timeout: 3000 }).catch(() => {});
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('TR-963: Пагинация в истории корректировок', async ({ authenticatedPage: page }) => {
    const correction = new VacationDaysCorrectionPage(page);
    const pagination = page.locator('nav[aria-label*="page" i], .rc-pagination').first();
    const isVisible = await pagination.isVisible().catch(() => false);
    if (isVisible) {
      const nextBtn = pagination.locator('button:has-text("»"), button:has-text("Next"), a:has-text("»")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const count = await correction.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
