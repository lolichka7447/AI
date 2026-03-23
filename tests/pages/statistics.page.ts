import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

export class StatisticsPage extends BasePage {
  // Tabs
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

  constructor(page: Page) {
    super(page);

    // Tabs — Statistics uses rc-tabs (Ant Design), tab names: "Мои задачи", "Мои проекты", "Сотрудники моих проектов", etc.
    this.departmentsTab = page.locator('.rc-tabs-tab').filter({ hasText: /Проекты отдела/i }).first();
    this.employeesTab = page.locator('.rc-tabs-tab').filter({ hasText: /Сотрудники моих проектов|Сотрудники отдела/i }).first();
    this.projectsTab = page.locator('.rc-tabs-tab').filter({ hasText: /Мои проекты/i }).first();
    this.tasksTab = page.locator('.rc-tabs-tab').filter({ hasText: /Мои задачи/i }).first();

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
  }

  get url() { return '/statistics'; }

  // --- Tab navigation ---

  async switchToDepartments() {
    await this.departmentsTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToEmployees() {
    await this.employeesTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToProjects() {
    await this.projectsTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToTasks() {
    await this.tasksTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
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
}
