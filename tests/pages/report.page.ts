import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

export class ReportPage extends BasePage {
  // Add task input
  readonly addTaskInput: Locator;
  readonly addTaskButton: Locator;

  // Work summary
  readonly workSummary: Locator;
  readonly workSummaryInfo: Locator;

  // Week navigation
  readonly currentWeekButton: Locator;
  readonly prevWeekButton: Locator;
  readonly nextWeekButton: Locator;
  readonly dateRange: Locator;

  // Table
  readonly taskTable: Locator;
  readonly totalRow: Locator;
  readonly activeTasksHeader: Locator;

  // View toggles
  readonly compactViewButton: Locator;
  readonly normalViewButton: Locator;

  // Group by projects
  readonly groupByProjectsCheckbox: Locator;

  // Alerts
  readonly alertContainer: Locator;

  // Rejected reports block
  readonly rejectedReportsBlock: Locator;
  readonly goToReportButton: Locator;
  readonly resendHoursButton: Locator;

  // Rename popup
  readonly renamePopup: Locator;
  readonly renameInput: Locator;
  readonly renameButton: Locator;
  readonly renameError: Locator;

  // Comment popup
  readonly commentPopup: Locator;
  readonly commentInput: Locator;
  readonly commentSaveButton: Locator;

  // Weekly comments block
  readonly weeklyCommentsBlock: Locator;

  // Error popup
  readonly errorPopup: Locator;
  readonly errorPopupTitle: Locator;
  readonly errorPopupMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Add task — uses react-autosuggest input
    this.addTaskInput = page.locator('input.react-autosuggest__input').first()
      .or(page.locator(`input[placeholder*="${t('placeholder.myProject')}"]`));
    this.addTaskButton = page.locator(`button:has-text("${t('btn.add')}"), button[type="submit"]`).first();

    // Work summary: "В марте отработано: 0/24/176"
    this.workSummary = page.locator(`text=/${t('label.worked')}/i`).first();
    this.workSummaryInfo = page.locator('.page-header__end, .page-header__left').first()
      .or(page.locator(`button:near(:text("${t('label.worked')}"))`).first());

    // Week navigation — real BEM classes from WeekSwitcher component
    this.currentWeekButton = page.locator('button.week-switcher__button-set-current-week').first();
    this.prevWeekButton = page.locator('button.week-switcher__button-switch_prev').first();
    this.nextWeekButton = page.locator('button.week-switcher__button-switch_next').first();
    this.dateRange = page.locator('span.week-switcher__date').first()
      .or(page.locator('text=/\\d{2}\\.\\d{2}\\.\\d{4}/').first());

    // Table — rc-table renders <table>, cells have table-task-reports prefix
    this.taskTable = page.locator('table:visible').first();
    this.totalRow = page.locator(`tr:has-text("${t('label.total')}")`).last();
    this.activeTasksHeader = page.locator(`text=/${t('label.activeTasks')}/i`).first();

    // View toggles — in FirstTitleContainer (compact/normal icons)
    this.compactViewButton = page.locator(`[title*="${t('tooltip.compact')}"], [aria-label*="${t('tooltip.compact')}"]`).first();
    this.normalViewButton = page.locator(`[title*="${t('tooltip.normal')}"], [aria-label*="${t('tooltip.normal')}"]`).first();

    // Group by projects
    this.groupByProjectsCheckbox = page.getByRole('checkbox', { name: new RegExp(t('label.groupByProjects'), 'i') })
      .or(page.locator('input[type="checkbox"]').first());

    // Alerts — uses popup component (div.popup.popup_show) or rc-notification
    this.alertContainer = page.locator('.popup.popup_show, [role="alert"], .rc-notification').first();

    // Rejected reports block
    this.rejectedReportsBlock = page.locator('[class*="auto-rejected"], [class*="rejected"]').first();
    this.goToReportButton = page.getByText(t('btn.goToReport'));
    this.resendHoursButton = page.getByText(t('btn.resendHours'));

    // Rename popup — uses modal BEM: modal__wrapper > modal > modal__title / modal__body
    this.renamePopup = page.locator('.modal__wrapper, .modal, [role="dialog"]').first();
    this.renameInput = page.locator('.modal input, [role="dialog"] input').first();
    this.renameButton = page.getByRole('button', { name: new RegExp(t('btn.rename'), 'i') });
    this.renameError = page.locator('.modal [class*="error"], [role="dialog"] [class*="error"]').first();

    // Comment popup — tooltip with FormReportComment (rc-tooltip)
    this.commentPopup = page.locator('.tooltip.tooltip_light, [class*="tooltip_large"]').first()
      .or(page.locator(`[class*="comment-popup"], [class*="modal"]:has-text("${t('btn.comment')}")`));
    this.commentInput = page.locator('.tooltip textarea, .tooltip_light textarea, textarea').first();
    this.commentSaveButton = page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') });

    // Weekly comments block
    this.weeklyCommentsBlock = page.locator(`text=/${t('label.weeklyComments')}/i`).locator('..');

    // Error popup
    this.errorPopup = page.locator(`.modal:has-text("${t('label.error')}"), [role="dialog"]:has-text("${t('label.error')}")`);
    this.errorPopupTitle = this.errorPopup.locator('.modal__title, h2, h3').first();
    this.errorPopupMessage = this.errorPopup.locator('.modal__body, p').first();
  }

  get url() { return '/report'; }

  // --- Task creation ---

  async createTask(projectSlashTask: string) {
    await this.addTaskInput.fill(projectSlashTask);
    await this.addTaskInput.press('Enter');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async createTaskWithHours(projectSlashTask: string, hours: string) {
    await this.addTaskInput.fill(`${projectSlashTask} ${hours}h`);
    await this.addTaskInput.press('Enter');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async addTask(taskText: string) {
    await this.addTaskInput.fill(taskText);
    await this.addTaskInput.press('Enter');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Task row helpers ---

  getTaskRow(taskName: string): Locator {
    return this.taskTable.locator(`tr:has-text("${taskName}")`).first();
  }

  getProjectGroup(projectName: string): Locator {
    return this.taskTable.locator(`tr:has(.task-title_project):has-text("${projectName}")`).first()
      .or(this.taskTable.locator(`tr:has-text("${projectName}")`).first());
  }

  async getTaskNames(): Promise<string[]> {
    // Task names are in span elements with class ending in __task-name
    const taskNameSpans = this.taskTable.locator('[class$="__task-name"], .task-name__task-name');
    const count = await taskNameSpans.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await taskNameSpans.nth(i).textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  // --- Pin/unpin ---
  // Pin button uses withInfoTooltip with text from i18n: common.style.pin_task / common.style.unpin_task

  getPinButton(taskName: string): Locator {
    return this.getTaskRow(taskName).locator(`[class*="pin"], [title*="${t('tooltip.pin')}"], [title*="${t('tooltip.unpin')}"]`).first();
  }

  async pinTask(taskName: string) {
    const row = this.getTaskRow(taskName);
    await row.hover();
    await this.page.waitForTimeout(200);
    const pinBtn = row.locator(`[title*="${t('tooltip.pin')}"], [aria-label*="${t('tooltip.pin')}"]`).first();
    await pinBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async unpinTask(taskName: string) {
    const row = this.getTaskRow(taskName);
    await row.hover();
    await this.page.waitForTimeout(200);
    const unpinBtn = row.locator(`[title*="${t('tooltip.unpin')}"], [aria-label*="${t('tooltip.unpin')}"]`).first();
    await unpinBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async isTaskPinned(taskName: string): Promise<boolean> {
    const row = this.getTaskRow(taskName);
    const unpinBtn = row.locator(`[title*="${t('tooltip.unpin')}"], [aria-label*="${t('tooltip.unpin')}"]`);
    return await unpinBtn.isVisible().catch(() => false);
  }

  // --- Compact/normal view ---

  async toggleCompactView() {
    await this.compactViewButton.click();
    await this.page.waitForTimeout(300);
  }

  async toggleNormalView() {
    await this.normalViewButton.click();
    await this.page.waitForTimeout(300);
  }

  // --- Report hours ---

  getCell(taskName: string, dayIndex: number): Locator {
    // dayIndex: 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Сб, 6=Вс
    const row = this.getTaskRow(taskName);
    // Cells with BEM class: table-task-reports__cell_weekday-effort
    // First cell is task name, then day cells start
    return row.locator('td').nth(dayIndex + 1);
  }

  async reportHours(taskName: string, dayIndex: number, hours: string) {
    const cell = this.getCell(taskName, dayIndex);
    // Hover to show input, then click
    await cell.hover();
    await this.page.waitForTimeout(200);
    await cell.click();
    await this.page.waitForTimeout(200);
    // The cell contains div.week-day-effort with input.week-day-effort__input
    const input = cell.locator('input.week-day-effort__input').first()
      .or(cell.locator('input').first());
    await input.fill(hours);
    await input.press('Tab');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getCellValue(taskName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(taskName, dayIndex);
    // Value is in span.week-day-effort__value
    const valueSpan = cell.locator('.week-day-effort__value').first();
    if (await valueSpan.isVisible().catch(() => false)) {
      return (await valueSpan.textContent())?.trim() || '';
    }
    return (await cell.textContent())?.trim() || '';
  }

  async getTotalHours(): Promise<string> {
    const cells = this.totalRow.locator('td');
    const lastCell = cells.last();
    return (await lastCell.textContent())?.trim() || '0';
  }

  async getPeriodTotal(taskName: string): Promise<string> {
    const row = this.getTaskRow(taskName);
    // "За период" — the effort cell after 7 weekday cells
    // BEM: table-task-reports__cell_task-effort
    const effortCell = row.locator('.table-task-reports__cell_task-effort, td.table-task-reports__cell_task-effort').first()
      .or(row.locator('td').nth(8));
    return (await effortCell.textContent())?.trim() || '0';
  }

  // --- Cell colors ---

  async getCellBackgroundColor(taskName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(taskName, dayIndex);
    return await cell.evaluate(el => getComputedStyle(el).backgroundColor);
  }

  async getCellTextColor(taskName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(taskName, dayIndex);
    return await cell.evaluate(el => getComputedStyle(el).color);
  }

  async getCellClasses(taskName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(taskName, dayIndex);
    // Check both the td and the inner week-day-effort div
    const innerDiv = cell.locator('.week-day-effort').first();
    if (await innerDiv.isVisible().catch(() => false)) {
      return await innerDiv.evaluate(el => el.className);
    }
    return await cell.evaluate(el => el.className);
  }

  // --- Header day colors (for calendar indication) ---

  getDayHeader(dayIndex: number): Locator {
    const dayNames = [t('day.mon'), t('day.tue'), t('day.wed'), t('day.thu'), t('day.fri'), t('day.sat'), t('day.sun')];
    return this.taskTable.locator(`th:has-text("${dayNames[dayIndex]}")`).first();
  }

  async getDayHeaderColor(dayIndex: number): Promise<string> {
    const header = this.getDayHeader(dayIndex);
    return await header.evaluate(el => getComputedStyle(el).color);
  }

  async getTotalRowDayColor(dayIndex: number): Promise<string> {
    const cell = this.totalRow.locator('td').nth(dayIndex + 1);
    return await cell.evaluate(el => getComputedStyle(el).color);
  }

  // --- Rename ---

  async openRenamePopup(taskName: string) {
    const row = this.getTaskRow(taskName);
    // Task name span has onClick handler for rename
    const nameSpan = row.locator('[class$="__task-name"], .task-name__task-name').first();
    await nameSpan.click();
    await this.page.waitForTimeout(300);
  }

  async renameTask(oldName: string, newName: string) {
    await this.openRenamePopup(oldName);
    await expect(this.renamePopup).toBeVisible({ timeout: 5000 });
    await this.renameInput.clear();
    await this.renameInput.fill(newName);
    await this.renameButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Comments ---

  getCommentIcon(taskName: string): Locator {
    // Comment icon is week-day-effort__button-toggle-comment-form (IconQuoteChat)
    return this.getTaskRow(taskName).locator('.week-day-effort__button-toggle-comment-form, [class*="comment"], [title*="коммент"]').first();
  }

  getTotalRowCommentIcon(): Locator {
    return this.totalRow.locator('.task-effort__icon-wrapper, [class*="comment"], [title*="коммент"]').first();
  }

  async hoverCell(taskName: string, dayIndex: number) {
    const cell = this.getCell(taskName, dayIndex);
    await cell.hover();
    await this.page.waitForTimeout(300);
  }

  async getTooltipText(): Promise<string> {
    // rc-tooltip renders div.tooltip
    const tooltip = this.page.locator('.tooltip, [role="tooltip"]').first();
    return (await tooltip.textContent())?.trim() || '';
  }

  async addComment(taskName: string, dayIndex: number, comment: string) {
    await this.hoverCell(taskName, dayIndex);
    // Click the comment toggle button to open the comment form tooltip
    const cell = this.getCell(taskName, dayIndex);
    const commentBtn = cell.locator('.week-day-effort__button-toggle-comment-form').first();
    await commentBtn.click();
    await this.page.waitForTimeout(300);
    await this.commentInput.fill(comment);
    await this.commentSaveButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async deleteComment(taskName: string, dayIndex: number) {
    await this.hoverCell(taskName, dayIndex);
    const cell = this.getCell(taskName, dayIndex);
    const commentBtn = cell.locator('.week-day-effort__button-toggle-comment-form').first();
    await commentBtn.click();
    await this.page.waitForTimeout(300);
    await this.commentInput.clear();
    await this.commentSaveButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Alerts ---

  async getAlertText(): Promise<string> {
    await this.alertContainer.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.alertContainer.textContent())?.trim() || '';
  }

  async isAlertVisible(): Promise<boolean> {
    return await this.alertContainer.isVisible().catch(() => false);
  }

  // --- Tooltips ---

  async getTooltip(locator: Locator): Promise<string> {
    await locator.hover();
    await this.page.waitForTimeout(300);
    const tooltip = this.page.locator('.tooltip, [role="tooltip"]').first();
    if (await tooltip.isVisible()) {
      return (await tooltip.textContent())?.trim() || '';
    }
    return await locator.getAttribute('title') || '';
  }

  // --- Sorting helpers ---

  async getPinnedTaskNames(): Promise<string[]> {
    const pinnedRows = this.taskTable.locator(`tr:has([title*="${t('tooltip.unpin')}"])`);
    const count = await pinnedRows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const nameSpan = pinnedRows.nth(i).locator('[class$="__task-name"]').first();
      const text = await nameSpan.textContent().catch(() => null)
        || await pinnedRows.nth(i).locator('td').first().textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  async getUnpinnedTaskNames(): Promise<string[]> {
    const unpinnedRows = this.taskTable.locator(`tr:has([title*="${t('tooltip.pin')}"])`);
    const count = await unpinnedRows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const nameSpan = unpinnedRows.nth(i).locator('[class$="__task-name"]').first();
      const text = await nameSpan.textContent().catch(() => null)
        || await unpinnedRows.nth(i).locator('td').first().textContent();
      if (text) names.push(text.trim());
    }
    return names;
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

  // --- Table scroll helpers ---

  async scrollToTask(taskName: string) {
    const row = this.getTaskRow(taskName);
    await row.scrollIntoViewIfNeeded();
  }

  async isTaskHighlighted(taskName: string): Promise<boolean> {
    const row = this.getTaskRow(taskName);
    // New task highlight: div.task-name__new-task inside the row
    const highlight = row.locator('.task-name__new-task');
    return await highlight.isVisible().catch(() => false);
  }

  async isTaskInTable(taskName: string): Promise<boolean> {
    const row = this.getTaskRow(taskName);
    return await row.isVisible().catch(() => false);
  }
}
