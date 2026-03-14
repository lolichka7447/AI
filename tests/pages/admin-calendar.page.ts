import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for /admin/calendar — Производственные календари
 */
export class AdminCalendarPage extends BasePage {
  // Year selector
  readonly yearSelect: Locator;
  readonly currentYearLabel: Locator;
  readonly prevYearButton: Locator;
  readonly nextYearButton: Locator;

  // Country/Region selector
  readonly countrySelect: Locator;
  readonly regionSelect: Locator;

  // Calendar grid
  readonly calendarGrid: Locator;
  readonly monthBlocks: Locator;
  readonly dayCells: Locator;

  // Day type controls
  readonly workingDayButton: Locator;
  readonly holidayButton: Locator;
  readonly shortenedDayButton: Locator;
  readonly transferDayButton: Locator;

  // Day details
  readonly dayDetailPopup: Locator;
  readonly dayNameInput: Locator;
  readonly dayTypeSelect: Locator;
  readonly dayHoursInput: Locator;
  readonly daySaveButton: Locator;

  // Actions
  readonly saveCalendarButton: Locator;
  readonly resetCalendarButton: Locator;
  readonly importCalendarButton: Locator;
  readonly exportCalendarButton: Locator;
  readonly copyFromYearButton: Locator;

  // Summary
  readonly workingDaysCount: Locator;
  readonly workingHoursCount: Locator;
  readonly holidaysCount: Locator;

  // Alerts
  readonly alertContainer: Locator;

  // Legend
  readonly legend: Locator;
  readonly legendItems: Locator;

  constructor(page: Page) {
    super(page);

    // Year
    this.yearSelect = page.locator('select[class*="year"], [class*="year-select"]').first();
    this.currentYearLabel = page.locator('[class*="year-label"], [class*="current-year"], h2:has-text(/\\d{4}/)').first();
    this.prevYearButton = page.locator('button[class*="prev-year"], button:has(svg):near([class*="year"])').first();
    this.nextYearButton = page.locator('button[class*="next-year"], button:has(svg):near([class*="year"])').last();

    // Country/Region
    this.countrySelect = page.locator('select[class*="country"], [class*="country-select"]').first();
    this.regionSelect = page.locator('select[class*="region"], [class*="region-select"], [class*="office-select"]').first();

    // Calendar grid
    this.calendarGrid = page.locator('[class*="calendar-grid"], [class*="calendar-container"], table, [class*="year-calendar"]').first();
    this.monthBlocks = this.calendarGrid.locator('[class*="month"], [class*="month-block"]');
    this.dayCells = this.calendarGrid.locator('[class*="day-cell"], td[class*="day"], [class*="calendar-day"]');

    // Day type
    this.workingDayButton = page.locator('button:has-text("Рабочий"), [class*="working-day"]').first();
    this.holidayButton = page.locator('button:has-text("Выходной"), [class*="holiday"]').first();
    this.shortenedDayButton = page.locator('button:has-text("Сокращённый"), [class*="shortened"]').first();
    this.transferDayButton = page.locator('button:has-text("Перенос"), [class*="transfer"]').first();

    // Day details
    this.dayDetailPopup = page.locator('[class*="day-popup"], [class*="modal"], [role="dialog"]').first();
    this.dayNameInput = this.dayDetailPopup.locator('input[name*="name"], input[placeholder*="назван" i]').first();
    this.dayTypeSelect = this.dayDetailPopup.locator('select, [class*="type-select"]').first();
    this.dayHoursInput = this.dayDetailPopup.locator('input[type="number"], input[name*="hours"]').first();
    this.daySaveButton = this.dayDetailPopup.locator('button:has-text("Сохранить"), button:has-text("ОК")').first();

    // Actions
    this.saveCalendarButton = page.getByRole('button', { name: /Сохранить календарь|Сохранить/i }).first();
    this.resetCalendarButton = page.getByRole('button', { name: /Сбросить|Reset/i }).first();
    this.importCalendarButton = page.getByRole('button', { name: /Импорт|Import/i }).first();
    this.exportCalendarButton = page.getByRole('button', { name: /Экспорт|Export/i }).first();
    this.copyFromYearButton = page.getByRole('button', { name: /Скопировать|Copy from/i }).first();

    // Summary
    this.workingDaysCount = page.locator('[class*="working-days"], text=/рабочих дней/i').first();
    this.workingHoursCount = page.locator('[class*="working-hours"], text=/рабочих часов/i').first();
    this.holidaysCount = page.locator('[class*="holidays-count"], text=/выходных/i').first();

    // Alert
    this.alertContainer = page.locator('[class*="alert"], [class*="toast"], [role="alert"]').first();

    // Legend
    this.legend = page.locator('[class*="legend"]').first();
    this.legendItems = this.legend.locator('[class*="legend-item"], li, span');
  }

  get url() { return '/admin/calendar'; }

  // --- Year navigation ---

  async selectYear(year: string) {
    if (await this.yearSelect.isVisible().catch(() => false)) {
      await this.yearSelect.selectOption({ label: year });
    }
    await this.page.waitForTimeout(500);
  }

  async getCurrentYear(): Promise<string> {
    return (await this.currentYearLabel.textContent())?.trim() || '';
  }

  // --- Country/Region ---

  async selectCountry(country: string) {
    await this.countrySelect.selectOption({ label: country });
    await this.page.waitForTimeout(500);
  }

  async selectRegion(region: string) {
    await this.regionSelect.selectOption({ label: region });
    await this.page.waitForTimeout(500);
  }

  // --- Day management ---

  async getDayCount(): Promise<number> {
    return await this.dayCells.count();
  }

  async clickDay(dayIndex: number) {
    await this.dayCells.nth(dayIndex).click();
    await this.page.waitForTimeout(300);
  }

  async getDayCellColor(dayIndex: number): Promise<string> {
    const cell = this.dayCells.nth(dayIndex);
    return await cell.evaluate(el => getComputedStyle(el).backgroundColor);
  }

  async getDayCellClasses(dayIndex: number): Promise<string> {
    const cell = this.dayCells.nth(dayIndex);
    return await cell.evaluate(el => el.className);
  }

  async getMonthCount(): Promise<number> {
    return await this.monthBlocks.count();
  }

  // --- Summary helpers ---

  async getWorkingDaysText(): Promise<string> {
    return (await this.workingDaysCount.textContent())?.trim() || '';
  }

  async getHolidaysText(): Promise<string> {
    return (await this.holidaysCount.textContent())?.trim() || '';
  }

  // --- Legend ---

  async getLegendTexts(): Promise<string[]> {
    const items = this.legendItems;
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) texts.push(text.trim());
    }
    return texts;
  }

  // --- Alert ---

  async isAlertVisible(): Promise<boolean> {
    return await this.alertContainer.isVisible().catch(() => false);
  }

  async getAlertText(): Promise<string> {
    await this.alertContainer.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.alertContainer.textContent())?.trim() || '';
  }
}
