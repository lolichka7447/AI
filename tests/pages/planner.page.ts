import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

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

    // Filters
    this.projectFilter = page.locator('[class*="project-filter"], [class*="filter"] select').first();
    this.employeeFilter = page.locator('[class*="employee-filter"], [placeholder*="сотрудник" i]').first();

    // Task list
    this.taskList = page.locator('[class*="task-list"], [class*="planner-board"], table').first();
    this.taskRows = this.taskList.locator('tr, [class*="task-row"], [class*="task-card"]');
    this.emptyState = page.locator('[class*="empty"], text=/нет задач/i').first();

    // Task actions
    this.createTaskButton = page.getByRole('button', { name: /Создать|Добавить|Create/i }).first();
    this.deleteAssignmentButton = page.getByRole('button', { name: /Удалить|Remove|Delete/i }).first();
    this.taskDetailPanel = page.locator('[class*="task-detail"], [class*="side-panel"], [class*="drawer"]').first();

    // Task creation form
    this.taskNameInput = page.locator('[class*="modal"] input[type="text"], [role="dialog"] input[type="text"]').first();
    this.taskProjectSelect = page.locator('[class*="modal"] select, [role="dialog"] [class*="project"]').first();
    this.taskAssigneeSelect = page.locator('[class*="modal"] [class*="assignee"], [role="dialog"] [class*="assignee"]').first();
    this.taskSaveButton = page.locator('[class*="modal"] button:has-text("Сохранить"), [role="dialog"] button:has-text("Сохранить")').first();
    this.taskCancelButton = page.locator('[class*="modal"] button:has-text("Отмена"), [role="dialog"] button:has-text("Отмена")').first();

    // Drag and drop
    this.dragHandles = page.locator('[class*="drag-handle"], [draggable="true"]');
  }

  get url() { return '/planner'; }

  // --- Task helpers ---

  getTaskRow(taskName: string): Locator {
    return this.taskList.locator(`tr:has-text("${taskName}"), [class*="task"]:has-text("${taskName}")`).first();
  }

  async getTaskNames(): Promise<string[]> {
    const rows = this.taskRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td, [class*="name"], [class*="title"]').first().textContent();
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
    await this.page.waitForTimeout(500);
  }

  async reassignTask(taskName: string, newEmployee: string) {
    await this.assignTask(taskName, newEmployee);
  }

  async deleteAssignment(taskName: string) {
    await this.openTaskDetails(taskName);
    await this.deleteAssignmentButton.click();
    await this.page.waitForTimeout(500);
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
    await this.page.waitForTimeout(500);
  }

  // --- Filter helpers ---

  async filterByProject(projectName: string) {
    await this.projectFilter.click();
    await this.page.locator(`text="${projectName}"`).click();
    await this.page.waitForTimeout(500);
  }

  async filterByEmployee(employeeName: string) {
    await this.employeeFilter.fill(employeeName);
    await this.page.waitForTimeout(500);
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
