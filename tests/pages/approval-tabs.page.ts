import { Page, Locator } from '@playwright/test';
import { ApprovalPage } from './approval.page';

/**
 * Extended ApprovalPage with tab navigation (По сотрудникам / По проектам)
 */
export class ApprovalTabsPage extends ApprovalPage {
  // Tabs
  readonly byEmployeeTab: Locator;
  readonly byProjectTab: Locator;

  // Dropdown selectors
  readonly employeeDropdown: Locator;
  readonly employeeDropdownItems: Locator;
  readonly projectDropdown: Locator;
  readonly projectDropdownItems: Locator;

  // Comment popup
  readonly commentPopup: Locator;
  readonly commentTextarea: Locator;
  readonly commentSaveButton: Locator;
  readonly commentCancelButton: Locator;
  readonly commentDeleteButton: Locator;

  // Cell color indicators
  readonly headerCells: Locator;
  readonly footerCells: Locator;

  // Notification badge
  readonly approvalNotificationBadge: Locator;

  // Batch actions
  readonly selectAllCheckbox: Locator;
  readonly batchApproveButton: Locator;
  readonly batchRejectButton: Locator;

  constructor(page: Page) {
    super(page);

    // Tabs
    this.byEmployeeTab = page.locator('a:has-text("По сотрудникам"), button:has-text("По сотрудникам"), [class*="tab"]:has-text("По сотрудникам")').first();
    this.byProjectTab = page.locator('a:has-text("По проектам"), button:has-text("По проектам"), [class*="tab"]:has-text("По проектам")').first();

    // Dropdowns
    this.employeeDropdown = page.locator('[class*="employee-dropdown"], [class*="employee-select"], select[class*="employee"]').first();
    this.employeeDropdownItems = page.locator('[class*="dropdown-menu"] li, [class*="dropdown-item"], [role="option"]');
    this.projectDropdown = page.locator('[class*="project-dropdown"], [class*="project-select"], select[class*="project"]').first();
    this.projectDropdownItems = page.locator('[class*="dropdown-menu"] li, [class*="dropdown-item"], [role="option"]');

    // Comment popup
    this.commentPopup = page.locator('[class*="comment-popup"], [class*="modal"]:has-text("Комментарий"), [role="dialog"]:has-text("Комментарий")');
    this.commentTextarea = this.commentPopup.locator('textarea, input[type="text"]').first();
    this.commentSaveButton = this.commentPopup.locator('button:has-text("Сохранить"), button:has-text("ОК")').first();
    this.commentCancelButton = this.commentPopup.locator('button:has-text("Отмена"), button:has-text("Закрыть")').first();
    this.commentDeleteButton = this.commentPopup.locator('button:has-text("Удалить"), button[class*="delete"]').first();

    // Color indicators
    this.headerCells = page.locator('thead th, [class*="header"] td');
    this.footerCells = page.locator('tfoot td, tr:has-text("Всего") td, tr:has-text("Итого") td');

    // Notification
    this.approvalNotificationBadge = page.locator('[class*="notification-badge"], [class*="badge"]').first();

    // Batch actions
    this.selectAllCheckbox = page.locator('thead input[type="checkbox"], [class*="select-all"]').first();
    this.batchApproveButton = page.getByRole('button', { name: /Подтвердить выбранные|Подтвердить все/i }).first();
    this.batchRejectButton = page.getByRole('button', { name: /Отклонить выбранные|Отклонить все/i }).first();
  }

  // --- Tab navigation ---

  async switchToByEmployee() {
    await this.byEmployeeTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToByProject() {
    await this.byProjectTab.click();
    await this.page.waitForTimeout(500);
  }

  // --- Dropdown helpers ---

  async selectEmployeeFromDropdown(employeeName: string) {
    await this.employeeDropdown.click();
    await this.page.waitForTimeout(300);
    const item = this.page.locator(`text="${employeeName}"`).first();
    await item.click();
    await this.page.waitForTimeout(500);
  }

  async selectProjectFromDropdown(projectName: string) {
    await this.projectDropdown.click();
    await this.page.waitForTimeout(300);
    const item = this.page.locator(`text="${projectName}"`).first();
    await item.click();
    await this.page.waitForTimeout(500);
  }

  async getEmployeeDropdownOptions(): Promise<string[]> {
    await this.employeeDropdown.click();
    await this.page.waitForTimeout(300);
    const items = this.employeeDropdownItems;
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    await this.page.keyboard.press('Escape');
    return names;
  }

  async getProjectDropdownOptions(): Promise<string[]> {
    await this.projectDropdown.click();
    await this.page.waitForTimeout(300);
    const items = this.projectDropdownItems;
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    await this.page.keyboard.press('Escape');
    return names;
  }

  // --- Comment helpers ---

  async addCommentToCell(employeeName: string, dayIndex: number, comment: string) {
    const cell = this.getCell(employeeName, dayIndex);
    await cell.click();
    await this.page.waitForTimeout(300);
    if (await this.commentPopup.isVisible().catch(() => false)) {
      await this.commentTextarea.fill(comment);
      await this.commentSaveButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  async getCommentFromCell(employeeName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(employeeName, dayIndex);
    await cell.click();
    await this.page.waitForTimeout(300);
    if (await this.commentPopup.isVisible().catch(() => false)) {
      const text = (await this.commentTextarea.inputValue()) || '';
      await this.commentCancelButton.click().catch(() => this.page.keyboard.press('Escape'));
      return text;
    }
    return '';
  }

  // --- Cell color helpers ---

  async getCellBackgroundColor(employeeName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(employeeName, dayIndex);
    return await cell.evaluate(el => getComputedStyle(el).backgroundColor);
  }

  async getHeaderCellColor(dayIndex: number): Promise<string> {
    const cell = this.headerCells.nth(dayIndex + 1);
    return await cell.evaluate(el => getComputedStyle(el).backgroundColor);
  }

  async getFooterCellColor(dayIndex: number): Promise<string> {
    const cell = this.footerCells.nth(dayIndex);
    return await cell.evaluate(el => getComputedStyle(el).backgroundColor);
  }

  // --- Table helpers ---

  async getTableRowCount(): Promise<number> {
    return await this.employeeRows.count();
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = this.reportTable.locator('th');
    const count = await headers.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }

  // --- Batch actions ---

  async selectAll() {
    await this.selectAllCheckbox.click();
    await this.page.waitForTimeout(300);
  }

  async batchApprove() {
    await this.batchApproveButton.click();
    await this.page.waitForTimeout(500);
  }

  async batchReject(comment: string) {
    await this.batchRejectButton.click();
    await this.page.waitForTimeout(300);
    await this.rejectCommentInput.fill(comment);
    await this.rejectConfirmButton.click();
    await this.page.waitForTimeout(500);
  }
}
