import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

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

    // Filters
    this.projectFilter = page.locator('[class*="filter"] select, [class*="project-filter"]').first();
    this.employeeFilter = page.locator('[class*="employee-filter"], [placeholder*="сотрудник" i]').first();
    this.periodFilter = page.locator('[class*="period-filter"], [class*="date-picker"]').first();
    this.departmentFilter = page.locator('[class*="department-filter"]').first();

    // Week navigation
    this.currentWeekButton = page.getByText('Текущая неделя');
    this.prevWeekButton = page.locator('button:has(svg), button:has(img)').first();
    this.nextWeekButton = page.locator('button:has(svg), button:has(img)').nth(1);
    this.dateRange = page.locator('text=/\\d{2}\\.\\d{2}\\.\\d{4}.*–.*\\d{2}\\.\\d{2}\\.\\d{4}/');

    // Employee list
    this.employeeList = page.locator('[class*="employee-list"], [class*="approval-list"], table').first();
    this.employeeRows = this.employeeList.locator('tr, [class*="employee-row"]');

    // Approval actions
    this.approveButton = page.getByRole('button', { name: /Подтвердить|Approve/i });
    this.rejectButton = page.getByRole('button', { name: /Отклонить|Reject/i });
    this.approveAllButton = page.getByRole('button', { name: /Подтвердить все|Approve all/i });
    this.rejectCommentInput = page.locator('textarea, [class*="reject-comment"] input, [class*="modal"] textarea').first();
    this.rejectConfirmButton = page.locator('[class*="modal"] button:has-text("Отклонить"), [role="dialog"] button:has-text("Отклонить")').first();

    // Table
    this.reportTable = page.locator('table').first();
    this.totalRow = page.locator('tr:has-text("Всего"), tr:has-text("Total")').last();

    // Status indicators
    this.reportedBadge = page.locator('[class*="reported"], [class*="status"]:has-text("REPORTED")').first();
    this.approvedBadge = page.locator('[class*="approved"], [class*="status"]:has-text("APPROVED")').first();
    this.rejectedBadge = page.locator('[class*="rejected"], [class*="status"]:has-text("REJECTED")').first();

    // Day summary
    this.daySummary = page.locator('[class*="day-summary"], [class*="daily-total"]').first();
  }

  get url() { return '/approve'; }

  // --- Employee helpers ---

  getEmployeeRow(employeeName: string): Locator {
    return this.employeeList.locator(`tr:has-text("${employeeName}"), [class*="row"]:has-text("${employeeName}")`).first();
  }

  async getEmployeeNames(): Promise<string[]> {
    const rows = this.employeeRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td, [class*="name"]').first().textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  // --- Approval actions ---

  async approveEmployee(employeeName: string) {
    const row = this.getEmployeeRow(employeeName);
    const approveBtn = row.locator('button:has-text("Подтвердить"), button[class*="approve"]').first();
    await approveBtn.click();
    await this.page.waitForTimeout(500);
  }

  async rejectEmployee(employeeName: string, comment: string) {
    const row = this.getEmployeeRow(employeeName);
    const rejectBtn = row.locator('button:has-text("Отклонить"), button[class*="reject"]').first();
    await rejectBtn.click();
    await this.page.waitForTimeout(300);

    await this.rejectCommentInput.fill(comment);
    await this.rejectConfirmButton.click();
    await this.page.waitForTimeout(500);
  }

  async approveAll() {
    await this.approveAllButton.click();
    await this.page.waitForTimeout(500);
  }

  // --- Cell helpers ---

  getCell(employeeName: string, dayIndex: number): Locator {
    const row = this.getEmployeeRow(employeeName);
    return row.locator('td').nth(dayIndex + 1);
  }

  async getCellValue(employeeName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(employeeName, dayIndex);
    return (await cell.textContent())?.trim() || '';
  }

  // --- Week navigation ---

  async goToCurrentWeek() {
    await this.currentWeekButton.click();
    await this.page.waitForTimeout(500);
  }

  async goToPrevWeek() {
    await this.prevWeekButton.click();
    await this.page.waitForTimeout(500);
  }

  async goToNextWeek() {
    await this.nextWeekButton.click();
    await this.page.waitForTimeout(500);
  }

  // --- Filter helpers ---

  async filterByProject(projectName: string) {
    await this.projectFilter.click();
    await this.page.locator(`text="${projectName}"`).click();
    await this.page.waitForTimeout(500);
  }

  async filterByEmployee(employeeName: string) {
    await this.employeeFilter.fill(employeeName);
    await this.page.waitForTimeout(500);
  }

  // --- Day totals ---

  async getDayTotal(dayIndex: number): Promise<string> {
    const cell = this.totalRow.locator('td').nth(dayIndex + 1);
    return (await cell.textContent())?.trim() || '0';
  }
}
