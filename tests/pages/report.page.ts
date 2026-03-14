import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

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

    // Add task
    this.addTaskInput = page.locator('input[placeholder*="Мой проект"]');
    this.addTaskButton = page.locator('button:has-text("Добавить"), button[type="submit"]').first();

    // Work summary: "В марте отработано: 0/24/176"
    this.workSummary = page.locator('text=/отработано/i').first();
    this.workSummaryInfo = page.locator('[class*="info"], button:near(:text("отработано"))').first();

    // Week navigation
    this.currentWeekButton = page.getByText('Текущая неделя');
    this.prevWeekButton = page.locator('button:has(svg), button:has(img)').first();
    this.nextWeekButton = page.locator('button:has(svg), button:has(img)').nth(1);
    this.dateRange = page.locator('text=/\\d{2}\\.\\d{2}\\.\\d{4}.*–.*\\d{2}\\.\\d{2}\\.\\d{4}/');

    // Table
    this.taskTable = page.locator('table').first();
    this.totalRow = page.locator('tr:has-text("Всего")').last();
    this.activeTasksHeader = page.locator('text=Активные задачи');

    // View toggles (compact/normal icons near "Активные задачи")
    this.compactViewButton = page.locator('[title*="Компактный"], [aria-label*="Компактный"]').first();
    this.normalViewButton = page.locator('[title*="Обычный"], [aria-label*="Обычный"]').first();

    // Group by projects
    this.groupByProjectsCheckbox = page.getByRole('checkbox', { name: 'Группировать по проектам' });

    // Alerts (toast notifications at top of page)
    this.alertContainer = page.locator('[class*="alert"], [class*="toast"], [class*="notification"], [role="alert"]').first();

    // Rejected reports block
    this.rejectedReportsBlock = page.locator('[class*="rejected"], [class*="decline"]').first();
    this.goToReportButton = page.getByText('Перейти к репорту');
    this.resendHoursButton = page.getByText('Отправить часы повторно');

    // Rename popup
    this.renamePopup = page.locator('[class*="modal"], [class*="popup"], [role="dialog"]').first();
    this.renameInput = page.locator('[class*="modal"] input, [class*="popup"] input, [role="dialog"] input').first();
    this.renameButton = page.getByRole('button', { name: 'Переименовать' });
    this.renameError = page.locator('[class*="modal"] [class*="error"], [role="dialog"] [class*="error"]').first();

    // Comment popup
    this.commentPopup = page.locator('[class*="comment-popup"], [class*="modal"]:has-text("Комментарий")');
    this.commentInput = page.locator('textarea, [class*="comment"] input').first();
    this.commentSaveButton = page.getByRole('button', { name: /Сохранить|Добавить/ });

    // Weekly comments block
    this.weeklyCommentsBlock = page.locator('text=Комментарии за неделю').locator('..');

    // Error popup
    this.errorPopup = page.locator('[class*="modal"]:has-text("Ошибка"), [role="dialog"]:has-text("Ошибка")');
    this.errorPopupTitle = this.errorPopup.locator('[class*="title"], h2, h3').first();
    this.errorPopupMessage = this.errorPopup.locator('[class*="body"], [class*="message"], p').first();
  }

  get url() { return '/report'; }

  // --- Task creation ---

  async createTask(projectSlashTask: string) {
    await this.addTaskInput.fill(projectSlashTask);
    await this.addTaskInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  async createTaskWithHours(projectSlashTask: string, hours: string) {
    await this.addTaskInput.fill(`${projectSlashTask} ${hours}h`);
    await this.addTaskInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  async addTask(taskText: string) {
    await this.addTaskInput.fill(taskText);
    await this.addTaskInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  // --- Task row helpers ---

  getTaskRow(taskName: string): Locator {
    return this.taskTable.locator(`tr:has-text("${taskName}")`).first();
  }

  getProjectGroup(projectName: string): Locator {
    return this.taskTable.locator(`tr:has-text("${projectName}")`).first();
  }

  async getTaskNames(): Promise<string[]> {
    const rows = this.taskTable.locator('tr');
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td').first().textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  // --- Pin/unpin ---

  getPinButton(taskName: string): Locator {
    return this.getTaskRow(taskName).locator('[class*="pin"], [title*="Закрепить"], [title*="Открепить"], svg, img').first();
  }

  async pinTask(taskName: string) {
    const row = this.getTaskRow(taskName);
    const pinBtn = row.locator('[title*="Закрепить"], [aria-label*="Закрепить"]').first();
    await pinBtn.click();
    await this.page.waitForTimeout(300);
  }

  async unpinTask(taskName: string) {
    const row = this.getTaskRow(taskName);
    const unpinBtn = row.locator('[title*="Открепить"], [aria-label*="Открепить"]').first();
    await unpinBtn.click();
    await this.page.waitForTimeout(300);
  }

  async isTaskPinned(taskName: string): Promise<boolean> {
    const row = this.getTaskRow(taskName);
    const unpinBtn = row.locator('[title*="Открепить"], [aria-label*="Открепить"]');
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
    // First cell is task name, then day cells start
    return row.locator('td').nth(dayIndex + 1);
  }

  async reportHours(taskName: string, dayIndex: number, hours: string) {
    const cell = this.getCell(taskName, dayIndex);
    await cell.click();
    await this.page.waitForTimeout(200);
    // The cell should become an input or the input appears
    const input = cell.locator('input').first();
    await input.fill(hours);
    await input.press('Tab');
    await this.page.waitForTimeout(500);
  }

  async getCellValue(taskName: string, dayIndex: number): Promise<string> {
    const cell = this.getCell(taskName, dayIndex);
    return (await cell.textContent())?.trim() || '';
  }

  async getTotalHours(): Promise<string> {
    const cells = this.totalRow.locator('td');
    const lastCell = cells.last();
    return (await lastCell.textContent())?.trim() || '0';
  }

  async getPeriodTotal(taskName: string): Promise<string> {
    const row = this.getTaskRow(taskName);
    // "За период" is typically the 8th column (after 7 day columns)
    const periodCell = row.locator('td').nth(8);
    return (await periodCell.textContent())?.trim() || '0';
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
    return await cell.evaluate(el => el.className);
  }

  // --- Header day colors (for calendar indication) ---

  getDayHeader(dayIndex: number): Locator {
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
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
    const nameCell = row.locator('td').first();
    await nameCell.click();
    await this.page.waitForTimeout(300);
  }

  async renameTask(oldName: string, newName: string) {
    await this.openRenamePopup(oldName);
    await expect(this.renamePopup).toBeVisible({ timeout: 5000 });
    await this.renameInput.clear();
    await this.renameInput.fill(newName);
    await this.renameButton.click();
    await this.page.waitForTimeout(500);
  }

  // --- Comments ---

  getCommentIcon(taskName: string): Locator {
    return this.getTaskRow(taskName).locator('[class*="comment"], [title*="коммент"], svg').first();
  }

  getTotalRowCommentIcon(): Locator {
    return this.totalRow.locator('[class*="comment"], [title*="коммент"]').first();
  }

  async hoverCell(taskName: string, dayIndex: number) {
    const cell = this.getCell(taskName, dayIndex);
    await cell.hover();
    await this.page.waitForTimeout(300);
  }

  async getTooltipText(): Promise<string> {
    const tooltip = this.page.locator('[class*="tooltip"], [role="tooltip"]').first();
    return (await tooltip.textContent())?.trim() || '';
  }

  async addComment(taskName: string, dayIndex: number, comment: string) {
    const cell = this.getCell(taskName, dayIndex);
    await cell.click();
    await this.page.waitForTimeout(300);
    await this.commentInput.fill(comment);
    await this.commentSaveButton.click();
    await this.page.waitForTimeout(500);
  }

  async deleteComment(taskName: string, dayIndex: number) {
    const cell = this.getCell(taskName, dayIndex);
    await cell.click();
    await this.page.waitForTimeout(300);
    await this.commentInput.clear();
    await this.commentSaveButton.click();
    await this.page.waitForTimeout(500);
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
    const tooltip = this.page.locator('[class*="tooltip"], [role="tooltip"]').first();
    if (await tooltip.isVisible()) {
      return (await tooltip.textContent())?.trim() || '';
    }
    return await locator.getAttribute('title') || '';
  }

  // --- Sorting helpers ---

  async getPinnedTaskNames(): Promise<string[]> {
    const pinnedRows = this.taskTable.locator('tr:has([title*="Открепить"])');
    const count = await pinnedRows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await pinnedRows.nth(i).locator('td').first().textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  async getUnpinnedTaskNames(): Promise<string[]> {
    const unpinnedRows = this.taskTable.locator('tr:has([title*="Закрепить"])');
    const count = await unpinnedRows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await unpinnedRows.nth(i).locator('td').first().textContent();
      if (text) names.push(text.trim());
    }
    return names;
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

  // --- Table scroll helpers ---

  async scrollToTask(taskName: string) {
    const row = this.getTaskRow(taskName);
    await row.scrollIntoViewIfNeeded();
  }

  async isTaskHighlighted(taskName: string): Promise<boolean> {
    const row = this.getTaskRow(taskName);
    const classes = await row.evaluate(el => el.className);
    return classes.includes('highlight') || classes.includes('selected') || classes.includes('active');
  }

  async isTaskInTable(taskName: string): Promise<boolean> {
    const row = this.getTaskRow(taskName);
    return await row.isVisible().catch(() => false);
  }
}
