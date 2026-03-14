import { Page, Locator } from '@playwright/test';
import { ReportPage } from './report.page';

/**
 * Page Object for /report/:employeeLogin — Репорт за сотрудника
 * Extends ReportPage with employee selection and role-specific features
 */
export class EmployeeTasksPage extends ReportPage {
  // Employee selector
  readonly employeeDropdown: Locator;
  readonly employeeSearchInput: Locator;
  readonly employeeListItems: Locator;
  readonly selectedEmployeeName: Locator;

  // Role indicator
  readonly roleIndicator: Locator;

  // Manager-specific actions
  readonly addTaskForEmployeeInput: Locator;
  readonly assignProjectSelect: Locator;

  // Duplicate task warning
  readonly duplicateWarning: Locator;

  // Hours validation
  readonly hoursValidationError: Locator;
  readonly maxHoursWarning: Locator;

  constructor(page: Page) {
    super(page);

    // Employee selector
    this.employeeDropdown = page.locator('[class*="employee-select"], [class*="user-select"], select[class*="employee"]').first();
    this.employeeSearchInput = page.locator('[class*="employee-search"] input, [class*="user-search"] input, input[placeholder*="сотрудник" i]').first();
    this.employeeListItems = page.locator('[class*="employee-list"] li, [class*="user-list"] li, [class*="dropdown-item"]');
    this.selectedEmployeeName = page.locator('[class*="selected-employee"], [class*="employee-name"], [class*="user-name"]').first();

    // Role indicator
    this.roleIndicator = page.locator('[class*="role"], [class*="badge"]:has-text("Менеджер"), [class*="badge"]:has-text("Руководитель"), [class*="badge"]:has-text("Админ")').first();

    // Manager-specific
    this.addTaskForEmployeeInput = page.locator('input[placeholder*="Мой проект"], input[placeholder*="задач" i]').first();
    this.assignProjectSelect = page.locator('[class*="project-select"], select[class*="project"]').first();

    // Warnings
    this.duplicateWarning = page.locator('[class*="duplicate"], [class*="warning"]:has-text("дубликат"), [class*="error"]:has-text("уже существует")').first();
    this.hoursValidationError = page.locator('[class*="error"]:has-text("час"), [class*="validation"]:has-text("час")').first();
    this.maxHoursWarning = page.locator('[class*="warning"]:has-text("максимум"), [class*="warning"]:has-text("превыш")').first();
  }

  get url() { return '/report'; }

  // --- Employee selection ---

  async selectEmployee(employeeName: string) {
    await this.employeeDropdown.click();
    await this.page.waitForTimeout(300);
    if (await this.employeeSearchInput.isVisible().catch(() => false)) {
      await this.employeeSearchInput.fill(employeeName);
      await this.page.waitForTimeout(300);
    }
    const item = this.page.locator(`text="${employeeName}"`).first();
    await item.click();
    await this.page.waitForTimeout(500);
  }

  async getSelectedEmployeeName(): Promise<string> {
    return (await this.selectedEmployeeName.textContent())?.trim() || '';
  }

  async getAvailableEmployees(): Promise<string[]> {
    await this.employeeDropdown.click();
    await this.page.waitForTimeout(300);
    const items = this.employeeListItems;
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    await this.page.keyboard.press('Escape');
    return names;
  }

  // --- Role checks ---

  async getCurrentRole(): Promise<string> {
    return (await this.roleIndicator.textContent())?.trim() || '';
  }

  async isManagerView(): Promise<boolean> {
    const role = await this.getCurrentRole();
    return role.toLowerCase().includes('менеджер');
  }

  // --- Task creation for employee ---

  async createTaskForEmployee(projectSlashTask: string) {
    await this.addTaskForEmployeeInput.fill(projectSlashTask);
    await this.addTaskForEmployeeInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  async isDuplicateWarningVisible(): Promise<boolean> {
    return await this.duplicateWarning.isVisible().catch(() => false);
  }

  async isHoursValidationErrorVisible(): Promise<boolean> {
    return await this.hoursValidationError.isVisible().catch(() => false);
  }

  // --- Navigate to employee report ---

  async navigateToEmployeeReport(employeeLogin: string) {
    await this.page.goto(`/report/${employeeLogin}`);
    await this.page.waitForLoadState('networkidle');
  }
}
