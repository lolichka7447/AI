import { Page, Locator } from '@playwright/test';
import { ApprovalPage } from './approval.page';
import { t } from '../i18n';

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

    // Tabs — main-tabs__item inside main-tabs__theme-main
    this.byEmployeeTab = page.locator('.main-tabs__theme-main .main-tabs__item').filter({ hasText: new RegExp(t('tab.byEmployee'), 'i') }).first();
    this.byProjectTab = page.locator('.main-tabs__theme-main .main-tabs__item').filter({ hasText: new RegExp(t('tab.byProject'), 'i') }).first();

    // Dropdowns — header-filter or standard select elements
    this.employeeDropdown = page.locator('.header-filter select, .approve-content__filters select').first();
    this.employeeDropdownItems = page.locator('option, [role="option"]');
    this.projectDropdown = page.locator('.header-filter select, .approve-content__filters select').last();
    this.projectDropdownItems = page.locator('option, [role="option"]');

    // Comment popup — rc-tooltip with FormReportComment or FormStateComment
    this.commentPopup = page.locator('.tooltip.tooltip_light, [class*="tooltip_large"]').first()
      .or(page.locator(`.modal:has-text("${t('btn.comment')}"), [role="dialog"]:has-text("${t('btn.comment')}")`));
    this.commentTextarea = this.commentPopup.locator('textarea').first();
    this.commentSaveButton = this.commentPopup.locator(`button:has-text("${t('btn.save')}"), button:has-text("${t('btn.ok')}")`).first();
    this.commentCancelButton = this.commentPopup.locator(`button:has-text("${t('btn.cancel')}"), button:has-text("${t('btn.close')}")`).first();
    this.commentDeleteButton = this.commentPopup.locator(`button:has-text("${t('btn.delete')}")`).first();

    // Color indicators
    this.headerCells = page.locator('thead th');
    this.footerCells = page.locator(`tfoot td, tr:has-text("${t('label.total')}") td, tr:has-text("${t('label.totalAlt')}") td`);

    // Notification — orange point icon
    this.approvalNotificationBadge = page.locator('.need-to-approve-point, [class*="notification-badge"], [class*="badge"]').first();

    // Batch actions
    this.selectAllCheckbox = page.locator('thead input[type="checkbox"]').first();
    this.batchApproveButton = page.getByRole('button', { name: new RegExp(t('btn.approveSelected'), 'i') }).first();
    this.batchRejectButton = page.getByRole('button', { name: new RegExp(t('btn.rejectSelected'), 'i') }).first();
  }

  // --- Tab navigation ---

  async switchToByEmployee() {
    await this.byEmployeeTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToByProject() {
    await this.byProjectTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Dropdown helpers ---

  async selectEmployeeFromDropdown(employeeName: string) {
    await this.employeeDropdown.selectOption({ label: employeeName }).catch(async () => {
      await this.employeeDropdown.click();
      await this.page.locator(`text="${employeeName}"`).first().click();
    });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async selectProjectFromDropdown(projectName: string) {
    await this.projectDropdown.selectOption({ label: projectName }).catch(async () => {
      await this.projectDropdown.click();
      await this.page.locator(`text="${projectName}"`).first().click();
    });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getEmployeeDropdownOptions(): Promise<string[]> {
    const options = this.employeeDropdown.locator('option');
    const count = await options.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  async getProjectDropdownOptions(): Promise<string[]> {
    const options = this.projectDropdown.locator('option');
    const count = await options.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  // --- Comment helpers ---

  async addCommentToCell(employeeName: string, dayIndex: number, comment: string) {
    const cell = this.getCell(employeeName, dayIndex);
    await cell.hover();
    await this.page.waitForTimeout(200);
    // Click the comment toggle button
    const commentBtn = cell.locator('.week-day-effort__button-toggle-comment-form').first();
    if (await commentBtn.isVisible().catch(() => false)) {
      await commentBtn.click();
    } else {
      await cell.click();
    }
    await this.page.waitForTimeout(300);
    if (await this.commentPopup.isVisible().catch(() => false)) {
      await this.commentTextarea.fill(comment);
      await this.commentSaveButton.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  async getCommentFromCell(employeeName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(employeeName, dayIndex);
    await cell.hover();
    await this.page.waitForTimeout(200);
    const commentBtn = cell.locator('.week-day-effort__button-toggle-comment-form').first();
    if (await commentBtn.isVisible().catch(() => false)) {
      await commentBtn.click();
    } else {
      await cell.click();
    }
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
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async batchReject(comment: string) {
    await this.batchRejectButton.click();
    await this.page.waitForTimeout(300);
    await this.rejectCommentInput.fill(comment);
    await this.rejectConfirmButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}
