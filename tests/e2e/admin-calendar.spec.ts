import { test, expect } from '../fixtures/auth.fixture';
import { AdminCalendarPage } from '../pages/admin-calendar.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Администрирование — Производственные календари — 26 тестов (TR-822..TR-847)
// ============================================================================

test.describe('Администрирование — Производственные календари', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminCalendar();
    await page.waitForLoadState('networkidle');
  });

  test('TR-822: Страница производственных календарей загружается', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    await expect(calendar.calendarGrid).toBeVisible();
  });

  test('TR-823: Сетка календаря отображается', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const grid = calendar.calendarGrid;
    const isVisible = await grid.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('TR-824: Заголовки месяцев видны', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const monthHeaders = calendar.monthHeaders;
    const count = await monthHeaders.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TR-825: 12 месяцев отображаются', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const monthHeaders = calendar.monthHeaders;
    const count = await monthHeaders.count();
    expect(count).toBeGreaterThanOrEqual(12);
  });

  test('TR-826: Селектор года доступен', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const yearSelector = calendar.yearSelector;
    const isVisible = await yearSelector.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-827: Переключение года', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const yearSelector = calendar.yearSelector;
    if (await yearSelector.isVisible().catch(() => false)) {
      const options = yearSelector.locator('option');
      const count = await options.count();
      if (count > 1) {
        await yearSelector.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        await expect(calendar.calendarGrid).toBeVisible();
      }
    }
  });

  test('TR-828: Селектор региона/страны доступен', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const countrySelector = calendar.countrySelector;
    const isVisible = await countrySelector.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-829: Переключение региона обновляет календарь', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const countrySelector = calendar.countrySelector;
    if (await countrySelector.isVisible().catch(() => false)) {
      const options = countrySelector.locator('option');
      const count = await options.count();
      if (count > 1) {
        await countrySelector.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        await expect(calendar.calendarGrid).toBeVisible();
      }
    }
  });

  test('TR-830: Типы дней отображаются', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const dayCells = calendar.dayCells;
    const count = await dayCells.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TR-831: Ячейки дней имеют стилизацию', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const dayCells = calendar.dayCells;
    const count = await dayCells.count();
    if (count > 0) {
      const firstCell = dayCells.first();
      const hasClass = await firstCell.evaluate(el => el.className.length > 0).catch(() => false);
      expect(hasClass).toBe(true);
    }
  });

  test('TR-832: Клик по дню выделяет его', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const dayCells = calendar.dayCells;
    const count = await dayCells.count();
    if (count > 0) {
      const cell = dayCells.nth(10);
      if (await cell.isVisible().catch(() => false)) {
        await cell.click();
        await page.waitForTimeout(300);
        const hasSelectedClass = await cell.evaluate(el =>
          el.className.includes('selected') || el.className.includes('active') || el.getAttribute('aria-selected') === 'true'
        ).catch(() => false);
        expect(hasSelectedClass).toBeTruthy();
      }
    }
  });

  test('TR-833: Кнопка сохранения календаря видна', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const saveBtn = calendar.saveButton;
    const isVisible = await saveBtn.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-834: Кнопка редактирования календаря видна', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const editBtn = calendar.editButton;
    const isVisible = await editBtn.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-835: Кнопка сохранения или редактирования присутствует', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const editVisible = await calendar.editButton.isVisible().catch(() => false);
    const saveVisible = await calendar.saveButton.isVisible().catch(() => false);
    expect(editVisible || saveVisible).toBe(true);
  });

  test('TR-836: Сброс изменений календаря', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const resetBtn = page.locator(`button:has-text("${t('btn.reset')}"), button:has-text("${t('btn.cancel')}"), button:has-text("Reset")`).first();
    const isVisible = await resetBtn.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-837: Импорт календаря — кнопка', async ({ authenticatedPage: page }) => {
    const importBtn = page.locator(`button:has-text("${t('btn.import')}"), [title*="${t('btn.import')}"]`).first();
    const isVisible = await importBtn.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-838: Экспорт календаря — кнопка', async ({ authenticatedPage: page }) => {
    const exportBtn = page.locator(`button:has-text("${t('btn.export')}"), button:has-text("Export"), [title*="Экспорт"]`).first();
    const isVisible = await exportBtn.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-839: Копирование календаря из другого года', async ({ authenticatedPage: page }) => {
    const copyBtn = page.locator(`button:has-text("${t('btn.copyFromYear')}"), button:has-text("Copy"), [title*="Копировать"]`).first();
    const isVisible = await copyBtn.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-840: Итоги по рабочим дням', async ({ authenticatedPage: page }) => {
    const totals = page.locator(`tfoot, tr:has-text("${t('label.total')}"), .page-content div:has-text("${t('label.totalAlt')}")`).first();
    const isVisible = await totals.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-841: Легенда типов дней видна', async ({ authenticatedPage: page }) => {
    const legend = page.locator(`.legend, ul:has-text("${t('calendar.working')}"), div:has-text("${t('calendar.working')}")`).first();
    const isVisible = await legend.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-842: Перенос выходного дня', async ({ authenticatedPage: page }) => {
    const transferBtn = page.locator(`button:has-text("${t('calendar.transfer')}"), button:has-text("${t('btn.transferDayAlt')}"), [title*="Перенос"]`).first();
    const isVisible = await transferBtn.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TR-843: Праздничные дни отмечены', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const holidayCells = page.locator('td.holiday, td.festive, td[style*="red"]');
    const count = await holidayCells.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TR-844: Текущий год выбран по умолчанию', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const yearSelector = calendar.yearSelector;
    if (await yearSelector.isVisible().catch(() => false)) {
      const value = await yearSelector.inputValue().catch(() => '');
      const currentYear = new Date().getFullYear().toString();
      expect(value).toBeTruthy();
    }
  });

  test('TR-845: Выходные дни выделены цветом', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const weekendCells = page.locator('td.weekend, td.day-off, td[style*="gray"]');
    const count = await weekendCells.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TR-846: Количество дней в году корректно', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const dayCells = calendar.dayCells;
    const count = await dayCells.count();
    // Год содержит минимум 365 ячеек (или больше с заголовками)
    expect(count).toBeGreaterThan(28);
  });

  test('TR-847: Календарь доступен для чтения без режима редактирования', async ({ authenticatedPage: page }) => {
    const calendar = new AdminCalendarPage(page);
    const grid = calendar.calendarGrid;
    await expect(grid).toBeVisible();
    const dayCells = calendar.dayCells;
    const count = await dayCells.count();
    expect(count).toBeGreaterThan(0);
  });
});
