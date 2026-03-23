import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

export class CalendarPage extends BasePage {
  // Month navigation
  readonly prevMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly currentMonthLabel: Locator;

  // Calendar grid
  readonly calendarGrid: Locator;
  readonly calendarDays: Locator;
  readonly todayCell: Locator;

  // Filters
  readonly departmentFilter: Locator;
  readonly employeeFilter: Locator;

  // Legend
  readonly legend: Locator;
  readonly legendItems: Locator;

  // Absence types
  readonly vacationCells: Locator;
  readonly sickLeaveCells: Locator;
  readonly dayOffCells: Locator;
  readonly holidayCells: Locator;
  readonly weekendCells: Locator;

  // Employee list (sidebar)
  readonly employeeList: Locator;
  readonly employeeRows: Locator;

  constructor(page: Page) {
    super(page);

    // Month navigation — uses standard prev/next buttons
    this.prevMonthButton = page.locator('button[class*="prev"], button:has(svg)').first();
    this.nextMonthButton = page.locator('button[class*="next"], button:has(svg)').last();
    this.currentMonthLabel = page.locator('.page-header__left, h2, h3, [class*="month-label"]').first();

    // Calendar grid
    this.calendarGrid = page.locator('table:visible, [class*="calendar"]').first();
    this.calendarDays = this.calendarGrid.locator('td');
    this.todayCell = this.calendarGrid.locator('[class*="today"], [class*="current"], td.today').first();

    // Filters
    this.departmentFilter = page.locator(`[class*="department-filter"], select:has-text("${t('filter.department')}")`).first();
    this.employeeFilter = page.locator(`[class*="employee-filter"], input[placeholder*="${t('placeholder.employee')}" i]`).first();

    // Legend
    this.legend = page.locator('[class*="legend"]').first();
    this.legendItems = this.legend.locator('[class*="legend-item"], li, span');

    // Absence types (by CSS class or color)
    this.vacationCells = this.calendarGrid.locator('[class*="vacation"], [class*="отпуск"]');
    this.sickLeaveCells = this.calendarGrid.locator('[class*="sick"], [class*="больничн"]');
    this.dayOffCells = this.calendarGrid.locator('[class*="dayoff"], [class*="day-off"]');
    this.holidayCells = this.calendarGrid.locator('[class*="holiday"], [class*="праздник"]');
    this.weekendCells = this.calendarGrid.locator('[class*="weekend"], [class*="выходной"]');

    // Employee list
    this.employeeList = page.locator('[class*="employee-list"], [class*="sidebar"]').first();
    this.employeeRows = this.employeeList.locator('[class*="employee-row"], tr, li');
  }

  get url() { return '/calendar'; }

  // --- Month navigation ---

  async goToPrevMonth() {
    await this.prevMonthButton.click();
    await this.page.waitForTimeout(500);
  }

  async goToNextMonth() {
    await this.nextMonthButton.click();
    await this.page.waitForTimeout(500);
  }

  async getCurrentMonth(): Promise<string> {
    return (await this.currentMonthLabel.textContent())?.trim() || '';
  }

  // --- Day helpers ---

  getDayCell(day: number): Locator {
    return this.calendarGrid.locator(`td:has-text("${day}"), [class*="day"]:has-text("${day}")`).first();
  }

  async getDayCellColor(day: number): Promise<string> {
    const cell = this.getDayCell(day);
    return await cell.evaluate(el => getComputedStyle(el).backgroundColor);
  }

  async getDayCellClasses(day: number): Promise<string> {
    const cell = this.getDayCell(day);
    return await cell.evaluate(el => el.className);
  }

  async isTodayHighlighted(): Promise<boolean> {
    return await this.todayCell.isVisible().catch(() => false);
  }

  // --- Filter helpers ---

  async filterByDepartment(department: string) {
    await this.departmentFilter.click();
    await this.page.locator(`text="${department}"`).click();
    await this.page.waitForTimeout(500);
  }

  async filterByEmployee(employeeName: string) {
    await this.employeeFilter.fill(employeeName);
    await this.page.waitForTimeout(500);
  }

  // --- Employee helpers ---

  async getEmployeeNames(): Promise<string[]> {
    const rows = this.employeeRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  getEmployeeRow(employeeName: string): Locator {
    return this.employeeList.locator(`[class*="row"]:has-text("${employeeName}"), tr:has-text("${employeeName}"), li:has-text("${employeeName}")`).first();
  }

  // --- Absence counts ---

  async getVacationCount(): Promise<number> {
    return await this.vacationCells.count();
  }

  async getSickLeaveCount(): Promise<number> {
    return await this.sickLeaveCells.count();
  }

  async getDayOffCount(): Promise<number> {
    return await this.dayOffCells.count();
  }

  async getHolidayCount(): Promise<number> {
    return await this.holidayCells.count();
  }

  async getWeekendCount(): Promise<number> {
    return await this.weekendCells.count();
  }

  // --- Legend helpers ---

  async getLegendItems(): Promise<string[]> {
    const items = this.legendItems;
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) texts.push(text.trim());
    }
    return texts;
  }

  // --- Absence type checks ---

  async isAbsenceConfirmed(employeeName: string, day: number): Promise<boolean> {
    const row = this.getEmployeeRow(employeeName);
    const cell = row.locator(`td:has-text("${day}"), [class*="day"]:has-text("${day}")`).first();
    const classes = await cell.evaluate(el => el.className).catch(() => '');
    return classes.includes('confirmed') || classes.includes('approved');
  }
}
