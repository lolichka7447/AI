import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

export class ApprovalPage extends BasePage {
  // Filters
  readonly projectFilter: Locator;
  readonly employeeFilter: Locator;
  readonly periodFilter: Locator;
  readonly departmentFilter: Locator;

  // Week navigation
  readonly currentWeekButton: Locator;
  readonly prevWeekButton: Locator;
  readonly nextWeekButton: Locator;
  readonly dateRange: Locator;

  // Employee list
  readonly employeeList: Locator;
  readonly employeeRows: Locator;

  // Approval actions
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly approveAllButton: Locator;
  readonly rejectCommentInput: Locator;
  readonly rejectConfirmButton: Locator;

  // Table
  readonly reportTable: Locator;
  readonly totalRow: Locator;

  // Status indicators
  readonly reportedBadge: Locator;
  readonly approvedBadge: Locator;
  readonly rejectedBadge: Locator;

  // Day summary
  readonly daySummary: Locator;

  constructor(page: Page) {
    super(page);

    // Filters — approve-content__filters contains filter controls
    this.projectFilter = page.locator('.approve-content__filters select, .header-filter select, [class*="filter"] select').first();
    this.employeeFilter = page.locator(`.approve-content__filters input, input[placeholder*="${t('placeholder.employee')}" i]`).first();
    this.periodFilter = page.locator('.approve-content__filters [class*="date"], [class*="period-filter"]').first();
    this.departmentFilter = page.locator('.approve-content__filters select, [class*="department-filter"]').last();

    // Week navigation — same WeekSwitcher component as report
    this.currentWeekButton = page.locator('button.week-switcher__button-set-current-week').first()
      .or(page.getByText(t('btn.currentWeek')));
    this.prevWeekButton = page.locator('button.week-switcher__button-switch_prev').first()
      .or(page.locator('.week-switcher button').first());
    this.nextWeekButton = page.locator('button.week-switcher__button-switch_next').first()
      .or(page.locator('.week-switcher button').last());
    this.dateRange = page.locator('span.week-switcher__date').first()
      .or(page.locator('text=/\\d{2}\\.\\d{2}\\.\\d{4}/').first());

    // Employee list — approve-content__table > table (rc-table)
    this.employeeList = page.locator('.approve-content__table table, .approve-reports__table table, table').first();
    this.employeeRows = this.employeeList.locator('tbody tr');

    // Approval actions
    this.approveButton = page.getByRole('button', { name: new RegExp(t('btn.approve'), 'i') });
    this.rejectButton = page.getByRole('button', { name: new RegExp(t('btn.reject'), 'i') });
    this.approveAllButton = page.getByRole('button', { name: new RegExp(t('btn.approveAll'), 'i') });
    this.rejectCommentInput = page.locator('.tooltip textarea, .modal textarea, textarea').first();
    this.rejectConfirmButton = page.locator(`.tooltip button:has-text("${t('btn.reject')}"), .modal button:has-text("${t('btn.reject')}")`).first()
      .or(page.locator(`[role="dialog"] button:has-text("${t('btn.reject')}")`).first());

    // Table
    this.reportTable = page.locator('.approve-content__table table, table').first();
    this.totalRow = page.locator(`tr:has-text("${t('label.total')}")`).last();

    // Status indicators — approve buttons show state via filled/unfilled icons
    this.reportedBadge = page.locator('[class*="reported"], [class*="REPORTED"]').first();
    this.approvedBadge = page.locator('[class*="approved"], [class*="APPROVED"]').first();
    this.rejectedBadge = page.locator('[class*="rejected"], [class*="REJECTED"]').first();

    // Day summary
    this.daySummary = page.locator('[class*="day-summary"], [class*="daily-total"]').first();
  }

  get url() { return '/approve'; }

  // --- Employee helpers ---

  getEmployeeRow(employeeName: string): Locator {
    return this.employeeList.locator(`tr:has-text("${employeeName}")`).first();
  }

  async getEmployeeNames(): Promise<string[]> {
    const rows = this.employeeRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td').first().textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  // --- Approval actions ---

  async approveEmployee(employeeName: string) {
    const row = this.getEmployeeRow(employeeName);
    // Hover to show approve buttons (ApproveButtonsOnHover)
    await row.hover();
    await this.page.waitForTimeout(200);
    const approveBtn = row.locator('button[class*="approve"], [class*="like"]').first()
      .or(row.locator(`button:has-text("${t('btn.approve')}")`).first());
    await approveBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async rejectEmployee(employeeName: string, comment: string) {
    const row = this.getEmployeeRow(employeeName);
    await row.hover();
    await this.page.waitForTimeout(200);
    const rejectBtn = row.locator('button[class*="reject"], [class*="dislike"]').first()
      .or(row.locator(`button:has-text("${t('btn.reject')}")`).first());
    await rejectBtn.click();
    await this.page.waitForTimeout(300);

    await this.rejectCommentInput.fill(comment);
    await this.rejectConfirmButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async approveAll() {
    await this.approveAllButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Cell helpers ---

  getCell(employeeName: string, dayIndex: number): Locator {
    const row = this.getEmployeeRow(employeeName);
    return row.locator('td').nth(dayIndex + 1);
  }

  async getCellValue(employeeName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(employeeName, dayIndex);
    const valueSpan = cell.locator('.week-day-effort__value').first();
    if (await valueSpan.isVisible().catch(() => false)) {
      return (await valueSpan.textContent())?.trim() || '';
    }
    return (await cell.textContent())?.trim() || '';
  }

  // --- Week navigation ---

  async goToCurrentWeek() {
    await this.currentWeekButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async goToPrevWeek() {
    await this.prevWeekButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async goToNextWeek() {
    await this.nextWeekButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Filter helpers ---

  async filterByProject(projectName: string) {
    await this.projectFilter.click();
    await this.page.locator(`text="${projectName}"`).click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async filterByEmployee(employeeName: string) {
    await this.employeeFilter.fill(employeeName);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Day totals ---

  async getDayTotal(dayIndex: number): Promise<string> {
    const cell = this.totalRow.locator('td').nth(dayIndex + 1);
    return (await cell.textContent())?.trim() || '0';
  }
}
