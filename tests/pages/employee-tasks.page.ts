import { Page, Locator } from '@playwright/test';
import { ReportPage } from './report.page';
import { t } from '../i18n';

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

    // Employee selector — uses react-autosuggest or a custom dropdown
    this.employeeDropdown = page.locator('.react-autosuggest__container, [class*="employee-select"], select').first();
    this.employeeSearchInput = page.locator(`.react-autosuggest__input, input[placeholder*="${t('placeholder.employee')}" i]`).first();
    this.employeeListItems = page.locator('.react-autosuggest__suggestion, [class*="dropdown-item"], [role="option"]');
    this.selectedEmployeeName = page.locator('.navbar__user-name, .page-header__left, [class*="employee-name"]').first();

    // Role indicator
    this.roleIndicator = page.locator('[class*="role"], [class*="badge"]').first();

    // Manager-specific
    this.addTaskForEmployeeInput = page.locator(`input.react-autosuggest__input, input[placeholder*="${t('placeholder.myProject')}"]`).first();
    this.assignProjectSelect = page.locator('select').first();

    // Warnings — popup component
    this.duplicateWarning = page.locator(`.popup.popup_show, [class*="warning"]:has-text("${t('msg.duplicate')}"), [class*="error"]:has-text("${t('msg.duplicate')}")`).first();
    this.hoursValidationError = page.locator(`.popup.popup_show:has-text("${t('msg.hours')}"), [class*="error"]:has-text("${t('msg.hours')}")`).first();
    this.maxHoursWarning = page.locator(`.popup.popup_show:has-text("${t('msg.maxExceeded')}"), [class*="warning"]:has-text("${t('msg.maxExceeded')}")`).first();
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
    const item = this.page.locator('.react-autosuggest__suggestion, [class*="dropdown-item"]')
      .filter({ hasText: employeeName }).first()
      .or(this.page.locator(`text="${employeeName}"`).first());
    await item.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
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
    await this.page.waitForLoadState('networkidle').catch(() => {});
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
