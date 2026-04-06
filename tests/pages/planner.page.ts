import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { t, tRegex } from '../i18n';

/**
 * Planner Page Object — verified against live DOM (2026-04-05)
 *
 * Two modes:
 * - Tasks tab: /planner/TABS_ASSIGNMENTS_TASK — personal task planner
 * - Projects tab: /planner/TABS_ASSIGNMENTS_PROJECT — project planner with member views
 *
 * Key DOM facts:
 * - Tabs are `<button>`, not `.main-tabs__item`
 * - "Открыть для редактирования" generates editable assignments
 * - After "Open for editing": search input + "Добавить задачу" button appear
 * - Tasks are grouped by project in separate `<tbody>` (rowgroup) sections
 * - Each project group: header row (project name + total) + task rows
 * - Footer row: "Всего" with total hours
 */
export class PlannerPage extends BasePage {
  // --- Tab buttons ---
  readonly tasksTab: Locator;
  readonly projectsTab: Locator;

  // --- Tasks tab controls ---
  readonly openForEditingButton: Locator;
  readonly taskSearchInput: Locator;
  readonly addTaskButton: Locator;

  // --- Projects tab controls ---
  readonly projectSelector: Locator;
  readonly roleFilterSelector: Locator;

  // --- Table ---
  readonly table: Locator;
  readonly tableHeaderRow: Locator;
  readonly tableBody: Locator;
  readonly totalRow: Locator;

  // --- Date navigation ---
  readonly datePrevButton: Locator;
  readonly dateNextButton: Locator;
  readonly dateLabel: Locator;

  // --- Column headers ---
  readonly taskTicketToggle: Locator;

  constructor(page: Page) {
    super(page);

    // Tabs — real DOM: button "Задачи" / button "Проекты"
    this.tasksTab = page.getByRole('button', { name: tRegex('tab.tasks') });
    this.projectsTab = page.getByRole('button', { name: tRegex('tab.projects') });

    // "Открыть для редактирования" — appears only when not yet opened
    this.openForEditingButton = page.getByRole('button', {
      name: tRegex('planner.openForEditing'),
    });

    // After "Open for editing" — search + add
    this.taskSearchInput = page.locator(
      'input[type="text"][class*="autosuggest"], input[placeholder*="проект" i], input[placeholder*="project" i]',
    ).first();
    this.addTaskButton = page.getByRole('button', {
      name: tRegex('planner.addTask'),
    });

    // Projects tab — react-select dropdowns
    // The combobox input is hidden/disabled, click the container div instead
    this.projectSelector = page.locator('[class*="css-"][class*="container"]')
      .filter({ hasText: tRegex('planner.selectProject') }).first()
      .or(page.locator('div').filter({ hasText: tRegex('planner.selectProject') })
        .locator('[class*="control"], [class*="ValueContainer"]').first());
    this.roleFilterSelector = page.locator('[class*="css-"][class*="container"]')
      .filter({ hasText: /Выбрать|Select|Участник|Member/i }).first();

    // Table — always use visible table
    this.table = page.locator('table:visible').first();
    this.tableHeaderRow = this.table.locator('thead tr, rowgroup:first-child tr').first();
    this.tableBody = this.table.locator('tbody');
    this.totalRow = this.table.locator('tr').filter({ hasText: tRegex('label.total') }).last();

    // Date navigation — buttons around the date in column header
    // Structure: button(prev) > date text > button(next) inside a columnheader
    const dateHeader = this.table.locator('th').filter({ hasText: /\d{2}\.\d{2}/ }).first();
    this.datePrevButton = dateHeader.locator('button').first();
    this.dateNextButton = dateHeader.locator('button').last();
    this.dateLabel = dateHeader.locator('[cursor="pointer"]').first();

    // Task/Ticket toggle button in header
    this.taskTicketToggle = page.getByRole('button', { name: tRegex('tab.tickets') });
  }

  get url() { return '/planner'; }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  async goToTasksTab() {
    await this.tasksTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async goToProjectsTab() {
    await this.projectsTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async isTasksTabActive(): Promise<boolean> {
    return this.page.url().includes('TABS_ASSIGNMENTS_TASK');
  }

  async isProjectsTabActive(): Promise<boolean> {
    return this.page.url().includes('TABS_ASSIGNMENTS_PROJECT');
  }

  // ==========================================================================
  // Open for editing
  // ==========================================================================

  /** Click "Открыть для редактирования" and wait for editable state */
  async openForEditing() {
    const visible = await this.openForEditingButton.isVisible().catch(() => false);
    if (visible) {
      await this.openForEditingButton.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
      // Wait for search input or add button to appear
      await this.addTaskButton.or(this.taskSearchInput)
        .waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    }
  }

  /** Check if planner is in editing mode */
  async isInEditingMode(): Promise<boolean> {
    return this.addTaskButton.isVisible().catch(() => false);
  }

  // ==========================================================================
  // Project groups and tasks
  // ==========================================================================

  /** Get all project group header rows (rows with project names + totals) */
  getProjectGroupHeaders(): Locator {
    // Project headers have cells spanning columns, with collapse button + project name
    // They are inside separate tbody/rowgroup elements
    return this.table.locator('tbody tr').filter({
      has: this.page.locator('td:first-child button img'),
    }).filter({
      hasNot: this.page.locator('td:nth-child(4)'), // project rows have fewer cells
    });
  }

  /** Get all project names from the table */
  async getProjectNames(): Promise<string[]> {
    const groups = this.table.locator('tbody');
    const count = await groups.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const firstRow = groups.nth(i).locator('tr').first();
      const text = await firstRow.textContent().catch(() => '');
      // Project header rows contain just project name + a number
      // Task rows have numbered cells — skip the footer "Всего"
      if (text && !text.includes('Всего') && !/^\d+\s/.test(text.trim())) {
        const cleaned = text.replace(/\d+$/, '').trim();
        if (cleaned) names.push(cleaned);
      }
    }
    return names;
  }

  /** Get all task rows (rows with numbered tasks under projects) */
  getTaskRows(): Locator {
    // Task rows have a numbered first cell like "1", "2" etc.
    return this.table.locator('tbody tr').filter({
      has: this.page.locator('td:first-child'),
    }).filter({
      hasText: /^\d/,
    });
  }

  /** Get task names from visible rows */
  async getTaskNames(): Promise<string[]> {
    // Wait for table to render
    await this.table.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Strategy: find all buttons inside table cells that have meaningful text
    // Task name buttons have text like "Management", "Status meeting" etc.
    // Skip: icon-only buttons (empty text), number-only buttons, collapse buttons
    const allButtons = this.table.locator('td button, [role="cell"] button');
    const count = await allButtons.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const btn = allButtons.nth(i);
      const text = (await btn.textContent().catch(() => '')).trim();
      // Keep buttons with meaningful text (task names are > 2 chars, not just numbers)
      if (text && text.length > 2 && !/^\d+$/.test(text)) {
        names.push(text);
      }
    }
    return names;
  }

  /** Get count of task rows (excluding project headers and totals) */
  async getTaskCount(): Promise<number> {
    const names = await this.getTaskNames();
    return names.length;
  }

  /** Get task row by task name */
  getTaskRow(taskName: string): Locator {
    return this.table.locator('tr').filter({
      has: this.page.locator(`button:has-text("${taskName}")`),
    }).first();
  }

  /** Click on a task name button */
  async clickTask(taskName: string) {
    const btn = this.table.locator(`button:has-text("${taskName}")`).first();
    await btn.click();
  }

  // ==========================================================================
  // Date navigation
  // ==========================================================================

  /** Get current date text from the column header */
  async getCurrentDate(): Promise<string> {
    const dateHeader = this.table.locator('th').filter({ hasText: /\d{2}\.\d{2}/ }).first();
    return (await dateHeader.textContent() || '').trim();
  }

  async navigateToPrevDate() {
    await this.datePrevButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async navigateToNextDate() {
    const isDisabled = await this.dateNextButton.getAttribute('disabled');
    if (isDisabled === null) {
      await this.dateNextButton.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  // ==========================================================================
  // Totals
  // ==========================================================================

  /** Get the "Всего" total value from footer */
  async getTotalHours(): Promise<string> {
    const totalCells = this.totalRow.locator('th, td');
    const count = await totalCells.count();
    if (count >= 2) {
      return (await totalCells.nth(1).textContent() || '0').trim();
    }
    return '0';
  }

  // ==========================================================================
  // Add task (after "Open for editing")
  // ==========================================================================

  /** Search and add a task via the search input */
  async searchAndAddTask(query: string) {
    await this.taskSearchInput.fill(query);
    await this.page.waitForTimeout(500);
    // Select first suggestion
    const suggestion = this.page.locator(
      '[class*="autosuggest__suggestion"], [role="option"], [class*="suggestion"]',
    ).first();
    const hasSuggestion = await suggestion.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasSuggestion) {
      await suggestion.click();
    }
    await this.addTaskButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ==========================================================================
  // Drag and drop
  // ==========================================================================

  /** Get drag handles (first button in numbered task rows) */
  getDragHandles(): Locator {
    return this.table.locator('tbody tr td:first-child button').first();
  }

  /** Drag task from one position to another by row index */
  async dragTask(fromIndex: number, toIndex: number) {
    // Find all task rows (rows with meaningful task name buttons)
    const allButtons = this.table.locator('td button');
    const taskRows: import('@playwright/test').Locator[] = [];
    const count = await allButtons.count();

    for (let i = 0; i < count; i++) {
      const btn = allButtons.nth(i);
      const text = (await btn.textContent().catch(() => '')).trim();
      if (text && text.length > 2 && !/^\d+$/.test(text)) {
        // Found a task name button — get its row's first-cell drag handle
        const row = btn.locator('xpath=ancestor::tr');
        taskRows.push(row);
      }
    }

    if (taskRows.length > Math.max(fromIndex, toIndex)) {
      const fromHandle = taskRows[fromIndex].locator('td:first-child').first();
      const toHandle = taskRows[toIndex].locator('td:first-child').first();

      const fromBox = await fromHandle.boundingBox();
      const toBox = await toHandle.boundingBox();

      if (fromBox && toBox) {
        await this.page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });
        await this.page.mouse.up();
        await this.page.waitForTimeout(500);
      }
    }
  }

  // ==========================================================================
  // Projects tab helpers
  // ==========================================================================

  /** Select a project in the Projects tab combobox */
  async selectProject(projectName: string) {
    await this.projectSelector.fill(projectName);
    await this.page.waitForTimeout(500);
    const option = this.page.locator(
      '[role="option"], [class*="suggestion"]',
    ).filter({ hasText: projectName }).first();
    const visible = await option.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await option.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  /** Get current column header texts */
  async getColumnHeaders(): Promise<string[]> {
    const headers = this.table.locator('thead th, tr:first-child th');
    const count = await headers.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent().catch(() => '');
      if (text) texts.push(text.trim());
    }
    return texts;
  }
}
