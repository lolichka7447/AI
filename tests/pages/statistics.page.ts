import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

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

    // Tabs
    this.departmentsTab = page.getByRole('tab', { name: /Отделы|Departments/i }).or(
      page.locator('button:has-text("Отделы"), a:has-text("Отделы")').first()
    );
    this.employeesTab = page.getByRole('tab', { name: /Сотрудники|Employees/i }).or(
      page.locator('button:has-text("Сотрудники"), a:has-text("Сотрудники")').first()
    );
    this.projectsTab = page.getByRole('tab', { name: /Проекты|Projects/i }).or(
      page.locator('button:has-text("Проекты"), a:has-text("Проекты")').first()
    );
    this.tasksTab = page.getByRole('tab', { name: /Задачи|Tasks/i }).or(
      page.locator('button:has-text("Задачи"), a:has-text("Задачи")').first()
    );

    // Filters
    this.periodFilter = page.locator('[class*="period"], [class*="date-range"]').first();
    this.periodStartInput = page.locator('input[class*="start"], input[placeholder*="с" i], input[placeholder*="from" i]').first();
    this.periodEndInput = page.locator('input[class*="end"], input[placeholder*="по" i], input[placeholder*="to" i]').first();
    this.contractorFilter = page.locator('[class*="contractor"], select:has-text("Подрядчик")').first();
    this.departmentFilter = page.locator('[class*="department-filter"], select:has-text("Отдел")').first();

    // Data table
    this.dataTable = page.locator('table').first();
    this.dataRows = this.dataTable.locator('tbody tr');
    this.totalRow = this.dataTable.locator('tr:has-text("Итого"), tr:has-text("Всего"), tfoot tr').last();
    this.emptyState = page.locator('[class*="empty"], text=/нет данных/i, text=/No data/i').first();

    // Export
    this.exportButton = page.getByRole('button', { name: /Экспорт|Export|Скачать|Download/i }).first();

    // Headers
    this.tableHeaders = this.dataTable.locator('th');
  }

  get url() { return '/statistics'; }

  // --- Tab navigation ---

  async switchToDepartments() {
    await this.departmentsTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToEmployees() {
    await this.employeesTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToProjects() {
    await this.projectsTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToTasks() {
    await this.tasksTab.click();
    await this.page.waitForTimeout(500);
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
    await this.page.waitForTimeout(500);
  }

  async filterByContractor(contractorName: string) {
    await this.contractorFilter.click();
    await this.page.locator(`text="${contractorName}"`).click();
    await this.page.waitForTimeout(500);
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
