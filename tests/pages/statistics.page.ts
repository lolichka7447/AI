import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t, tRegex } from '../i18n';

export class StatisticsPage extends BasePage {
  // General Statistics tabs (rc-tabs on /statistics/general)
  readonly myTasksTab: Locator;
  readonly myProjectsTab: Locator;
  readonly projectEmployeesTab: Locator;
  readonly deptProjectsTab: Locator;
  readonly deptEmployeesTab: Locator;
  readonly officeProjectsTab: Locator;
  readonly officeEmployeesTab: Locator;
  readonly tasksByEmployeeTab: Locator;

  // Legacy aliases (keep tests from breaking)
  readonly departmentsTab: Locator;
  readonly employeesTab: Locator;
  readonly projectsTab: Locator;
  readonly tasksTab: Locator;

  // Filters
  readonly periodFilter: Locator;
  readonly periodStartInput: Locator;
  readonly periodEndInput: Locator;
  readonly contractorFilter: Locator;
  readonly departmentFilter: Locator;

  // Data table
  readonly dataTable: Locator;
  readonly dataRows: Locator;
  readonly totalRow: Locator;
  readonly emptyState: Locator;

  // Export
  readonly exportButton: Locator;

  // Headers
  readonly tableHeaders: Locator;

  // Employee Reports — Norm tooltip
  readonly normHeader: Locator;
  readonly normTooltipTrigger: Locator;

  constructor(page: Page) {
    super(page);

    // Tabs — Statistics uses rc-tabs (Ant Design)
    // Real tab names discovered from DOM: "Мои задачи", "Мои проекты",
    // "Сотрудники моих проектов", "Проекты отдела", "Сотрудники отдела",
    // "Проекты офиса", "Сотрудники офиса", "@ Задачи по сотрудникам"
    this.myTasksTab = page.locator('.rc-tabs-tab').filter({ hasText: tRegex('tab.stat.myTasks') }).first();
    this.myProjectsTab = page.locator('.rc-tabs-tab').filter({ hasText: tRegex('tab.stat.myProjects') }).first();
    this.projectEmployeesTab = page.locator('.rc-tabs-tab').filter({ hasText: tRegex('tab.stat.projectEmployees') }).first();
    this.deptProjectsTab = page.locator('.rc-tabs-tab').filter({ hasText: tRegex('tab.stat.deptProjects') }).first();
    this.deptEmployeesTab = page.locator('.rc-tabs-tab').filter({ hasText: tRegex('tab.stat.deptEmployees') }).first();
    this.officeProjectsTab = page.locator('.rc-tabs-tab').filter({ hasText: tRegex('tab.stat.officeProjects') }).first();
    this.officeEmployeesTab = page.locator('.rc-tabs-tab').filter({ hasText: tRegex('tab.stat.officeEmployees') }).first();
    this.tasksByEmployeeTab = page.locator('.rc-tabs-tab').filter({ hasText: tRegex('tab.stat.tasksByEmployee') }).first();

    // Legacy aliases — map old names to correct tabs
    this.departmentsTab = this.deptProjectsTab;
    this.employeesTab = this.projectEmployeesTab;
    this.projectsTab = this.myProjectsTab;
    this.tasksTab = this.myTasksTab;

    // Filters
    this.periodFilter = page.locator('.header-filter, [class*="period"], [class*="date-range"]').first();
    this.periodStartInput = page.locator('input[type="date"], input[placeholder*="с" i], input[placeholder*="from" i]').first();
    this.periodEndInput = page.locator('input[type="date"], input[placeholder*="по" i], input[placeholder*="to" i]').last();
    this.contractorFilter = page.locator('select').filter({ hasText: new RegExp(t('label.contractor'), 'i') }).first()
      .or(page.locator('[class*="contractor"]').first());
    this.departmentFilter = page.locator('select').filter({ hasText: new RegExp(t('filter.department'), 'i') }).first()
      .or(page.locator('[class*="department-filter"]').first());

    // Data table
    this.dataTable = page.locator('table:visible').first();
    this.dataRows = this.dataTable.locator('tbody tr');
    this.totalRow = this.dataTable.locator(`tr:has-text("${t('label.totalAlt')}"), tr:has-text("${t('label.total')}"), tfoot tr`).last();
    this.emptyState = page.locator(`[class*="empty"], text=${new RegExp(t('msg.noData'), 'i')}`).first();

    // Export
    this.exportButton = page.getByRole('button', { name: new RegExp(t('btn.export'), 'i') }).first();

    // Headers
    this.tableHeaders = this.dataTable.locator('th');

    // Employee Reports — Norm column tooltip
    // Structure: th > .uikit-table__cell > .uikit-table__title > div > .ReportsTable_normTitle__* > .custom-tooltip__wrapper > button
    this.normHeader = page.locator('th:visible').filter({ hasText: tRegex('stat.norm') }).first();
    this.normTooltipTrigger = this.normHeader.locator('[data-testid="custom-tooltip-wrapper"] button, [class*="custom-tooltip"] button').first();
  }

  get url() { return '/statistics'; }

  // --- Tab navigation ---

  private async switchTab(tab: Locator) {
    await tab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToMyTasks() { await this.switchTab(this.myTasksTab); }
  async switchToMyProjects() { await this.switchTab(this.myProjectsTab); }
  async switchToProjectEmployees() { await this.switchTab(this.projectEmployeesTab); }
  async switchToDeptProjects() { await this.switchTab(this.deptProjectsTab); }
  async switchToDeptEmployees() { await this.switchTab(this.deptEmployeesTab); }
  async switchToOfficeProjects() { await this.switchTab(this.officeProjectsTab); }
  async switchToOfficeEmployees() { await this.switchTab(this.officeEmployeesTab); }
  async switchToTasksByEmployee() { await this.switchTab(this.tasksByEmployeeTab); }

  // Legacy methods (kept for backward compatibility)
  async switchToDepartments() { await this.switchTab(this.deptProjectsTab); }
  async switchToEmployees() { await this.switchTab(this.projectEmployeesTab); }
  async switchToProjects() { await this.switchTab(this.myProjectsTab); }
  async switchToTasks() { await this.switchTab(this.myTasksTab); }

  // --- Norm tooltip (Employee Reports page) ---

  async clickNormTooltip() {
    await this.normTooltipTrigger.click();
    await this.page.waitForTimeout(500);
  }

  async getNormTooltipText(): Promise<string> {
    await this.clickNormTooltip();
    // Tooltip appears as a sibling/child of custom-tooltip__wrapper
    const tooltip = this.page.locator('[class*="custom-tooltip__content"], [class*="custom-tooltip"] [class*="content"], [role="tooltip"]').first();
    const isVisible = await tooltip.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      return (await tooltip.textContent())?.trim() || '';
    }
    // Fallback: get text from any newly appeared tooltip-like element
    const fallback = this.page.locator('.rc-tooltip-inner, [class*="tooltip-content"], [class*="Tooltip"]').first();
    return (await fallback.textContent().catch(() => ''))?.trim() || '';
  }

  // --- Data helpers ---

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }

  getRow(index: number): Locator {
    return this.dataRows.nth(index);
  }

  getRowByName(name: string): Locator {
    return this.dataTable.locator(`tr:has-text("${name}")`).first();
  }

  async getColumnValues(columnIndex: number): Promise<string[]> {
    const rows = this.dataRows;
    const count = await rows.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      const cell = rows.nth(i).locator('td').nth(columnIndex);
      const text = await cell.textContent();
      if (text) values.push(text.trim());
    }
    return values;
  }

  async getTotalValue(): Promise<string> {
    return (await this.totalRow.textContent())?.trim() || '';
  }

  // --- Period filter ---

  async filterByPeriod(startDate: string, endDate: string) {
    await this.periodStartInput.fill(startDate);
    await this.periodEndInput.fill(endDate);
    await this.periodEndInput.press('Enter');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async filterByContractor(contractorName: string) {
    await this.contractorFilter.selectOption({ label: contractorName }).catch(async () => {
      await this.contractorFilter.click();
      await this.page.locator(`text="${contractorName}"`).click();
    });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Export ---

  async exportData() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download').catch(() => null),
      this.exportButton.click(),
    ]);
    return download;
  }

  // --- Header helpers ---

  async getHeaderNames(): Promise<string[]> {
    const headers = this.tableHeaders;
    const count = await headers.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  // --- Employee Reports page helpers ---

  /** Get all employee names from the data table */
  async getEmployeeNames(): Promise<string[]> {
    const rows = this.dataRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const firstCell = rows.nth(i).locator('td').first();
      const text = await firstCell.textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  /** Get norm value for a specific employee row */
  async getNormForEmployee(name: string): Promise<string> {
    const row = this.getRowByName(name);
    // Norm is typically the 3rd or 4th column in employee reports
    const cells = row.locator('td');
    const count = await cells.count();
    // Find cell in the norm column — look for numeric value
    for (let i = 0; i < count; i++) {
      const text = (await cells.nth(i).textContent())?.trim() || '';
      if (/^\d+(\.\d+)?$/.test(text) && i >= 2) return text;
    }
    return '';
  }

  /** Get all header names from the currently visible table */
  async getVisibleHeaders(): Promise<string[]> {
    const headers = this.page.locator('th:visible');
    const count = await headers.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  /** Check if employee search/filter is available */
  async searchEmployee(name: string) {
    const searchInput = this.page.locator('input[placeholder*="поиск" i], input[placeholder*="search" i], input[placeholder*="найти" i]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(name);
      await this.page.waitForTimeout(500);
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  /** Check if pagination controls are visible */
  async isPaginationVisible(): Promise<boolean> {
    const pagination = this.page.locator('.rc-pagination, [class*="pagination"], nav[aria-label*="pagination"]').first();
    return pagination.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /** Get current page number from pagination */
  async getCurrentPageNumber(): Promise<number> {
    const active = this.page.locator('.rc-pagination-item-active, [class*="pagination"] [aria-current="page"]').first();
    const text = await active.textContent().catch(() => '1');
    return parseInt(text || '1', 10);
  }

  /** Click next page in pagination */
  async goToNextPage() {
    const nextBtn = this.page.locator('.rc-pagination-next, [class*="pagination"] button[aria-label*="next" i]').first();
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  // --- Active tab ---

  async getActiveTabText(): Promise<string> {
    const active = this.page.locator('.rc-tabs-tab-active');
    return (await active.textContent().catch(() => ''))?.trim() || '';
  }

  async getAllTabTexts(): Promise<string[]> {
    const tabs = this.page.locator('.rc-tabs-tab');
    const count = await tabs.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await tabs.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }
}
