import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

export class PlannerPage extends BasePage {
  // Filters
  readonly projectFilter: Locator;
  readonly employeeFilter: Locator;

  // Task list
  readonly taskList: Locator;
  readonly taskRows: Locator;
  readonly emptyState: Locator;

  // Task actions
  readonly createTaskButton: Locator;
  readonly deleteAssignmentButton: Locator;
  readonly taskDetailPanel: Locator;

  // Task creation form
  readonly taskNameInput: Locator;
  readonly taskProjectSelect: Locator;
  readonly taskAssigneeSelect: Locator;
  readonly taskSaveButton: Locator;
  readonly taskCancelButton: Locator;

  // Drag and drop
  readonly dragHandles: Locator;

  constructor(page: Page) {
    super(page);

    // Filters — planner uses header-filter or standard filter dropdowns
    this.projectFilter = page.locator('.header-filter select, .planner__roles-filter select, [class*="filter"] select').first();
    this.employeeFilter = page.locator(`.react-autosuggest__input, input[placeholder*="${t('placeholder.employee')}" i]`).first();

    // Task list — planner__table contains rc-table
    this.taskList = page.locator('.planner__table table, table').first();
    this.taskRows = this.taskList.locator('tbody tr');
    this.emptyState = page.locator(`.approve-table__placeholder, [class*="empty"], text=${new RegExp(t('msg.noTasks'), 'i')}`).first();

    // Task actions
    this.createTaskButton = page.locator(`.planner__project-group-add__button, button:has-text("${t('btn.create')}"), button:has-text("${t('btn.add')}")`).first()
      .or(page.getByRole('button', { name: new RegExp(t('btn.create'), 'i') }).first());
    this.deleteAssignmentButton = page.getByRole('button', { name: new RegExp(t('btn.delete'), 'i') }).first();
    this.taskDetailPanel = page.locator('.planner__history-dialog, [class*="task-detail"], [class*="side-panel"]').first();

    // Task creation form — uses SearchTask input and modal/tooltip
    this.taskNameInput = page.locator('.react-autosuggest__input, .modal input[type="text"], [role="dialog"] input[type="text"]').first();
    this.taskProjectSelect = page.locator('.modal select, [role="dialog"] select').first();
    this.taskAssigneeSelect = page.locator('.modal [class*="assignee"], [role="dialog"] [class*="assignee"]').first();
    this.taskSaveButton = page.locator(`.modal button:has-text("${t('btn.save')}"), [role="dialog"] button:has-text("${t('btn.save')}")`).first()
      .or(page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).first());
    this.taskCancelButton = page.locator(`.modal button:has-text("${t('btn.cancel')}"), [role="dialog"] button:has-text("${t('btn.cancel')}")`).first();

    // Drag and drop
    this.dragHandles = page.locator('[class*="drag-handle"], [draggable="true"]');
  }

  get url() { return '/planner'; }

  // --- Task helpers ---

  getTaskRow(taskName: string): Locator {
    return this.taskList.locator(`tr:has-text("${taskName}")`).first();
  }

  async getTaskNames(): Promise<string[]> {
    const nameElements = this.taskList.locator('.planner__table__task-row, [class$="__task-name"], td').first();
    const rows = this.taskRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const nameEl = row.locator('.planner__table__task-row, [class*="task-name"], td').first();
      const text = await nameEl.textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  async getTaskCount(): Promise<number> {
    return await this.taskRows.count();
  }

  // --- Task actions ---

  async openTaskDetails(taskName: string) {
    const row = this.getTaskRow(taskName);
    await row.click();
    await this.page.waitForTimeout(500);
  }

  async assignTask(taskName: string, employeeName: string) {
    await this.openTaskDetails(taskName);
    await this.taskAssigneeSelect.click();
    await this.page.locator(`text="${employeeName}"`).click();
    await this.taskSaveButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async reassignTask(taskName: string, newEmployee: string) {
    await this.assignTask(taskName, newEmployee);
  }

  async deleteAssignment(taskName: string) {
    await this.openTaskDetails(taskName);
    await this.deleteAssignmentButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async createTask(name: string, project?: string) {
    await this.createTaskButton.click();
    await this.page.waitForTimeout(300);
    await this.taskNameInput.fill(name);
    if (project) {
      await this.taskProjectSelect.click();
      await this.page.locator(`text="${project}"`).click();
    }
    await this.taskSaveButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Filter helpers ---

  async filterByProject(projectName: string) {
    await this.projectFilter.selectOption({ label: projectName }).catch(async () => {
      await this.projectFilter.click();
      await this.page.locator(`text="${projectName}"`).click();
    });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async filterByEmployee(employeeName: string) {
    await this.employeeFilter.fill(employeeName);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Drag and drop ---

  async dragTask(fromIndex: number, toIndex: number) {
    const handles = this.dragHandles;
    const from = handles.nth(fromIndex);
    const to = handles.nth(toIndex);

    const fromBox = await from.boundingBox();
    const toBox = await to.boundingBox();

    if (fromBox && toBox) {
      await this.page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });
      await this.page.mouse.up();
      await this.page.waitForTimeout(500);
    }
  }
}
