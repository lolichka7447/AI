import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ReportPage extends BasePage {
  // Add task
  readonly addTaskInput: Locator;
  readonly addTaskButton: Locator;

  // Work summary
  readonly workSummary: Locator;

  // Week navigation
  readonly currentWeekButton: Locator;
  readonly prevWeekButton: Locator;
  readonly nextWeekButton: Locator;

  // Table
  readonly taskTable: Locator;
  readonly totalRow: Locator;

  // Group by projects
  readonly groupByProjectsCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.addTaskInput = page.getByRole('textbox', { name: /Мой проект.*моя задача/ });
    this.addTaskButton = page.getByRole('button', { name: 'Добавить задачу' });
    this.workSummary = page.locator('[class*="work-summary"], [class*="workSummary"]').first();
    this.currentWeekButton = page.getByRole('button', { name: 'Текущая неделя' });
    this.prevWeekButton = page.locator('button:has(img)').first();
    this.nextWeekButton = page.locator('button:has(img)').nth(1);
    this.taskTable = page.getByRole('table');
    this.totalRow = page.getByRole('row', { name: /Всего/ });
    this.groupByProjectsCheckbox = page.getByRole('checkbox', { name: 'Группировать по проектам' });
  }

  get url() { return '/report'; }

  async getProjectRows() {
    return this.taskTable.getByRole('row').filter({ hasNot: this.page.getByRole('columnheader') });
  }

  async getTotalHours(): Promise<string> {
    const totalCell = this.totalRow.getByRole('cell').nth(8);
    return (await totalCell.textContent()) || '0';
  }

  async addTask(taskText: string) {
    await this.addTaskInput.fill(taskText);
    await this.addTaskButton.click();
  }
}
