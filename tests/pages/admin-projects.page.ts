import { Page, Locator } from '@playwright/test';
import { AdminPage } from './admin.page';

/**
 * Extended AdminPage with detailed project management features
 */
export class AdminProjectsPage extends AdminPage {
  // Project tabs
  readonly allProjectsTab: Locator;
  readonly myProjectsTab: Locator;

  // Project details panel
  readonly detailPanel: Locator;
  readonly detailProjectName: Locator;
  readonly detailProjectDescription: Locator;
  readonly detailProjectStatus: Locator;
  readonly detailTrackerInfo: Locator;
  readonly detailMembersList: Locator;
  readonly detailCloseButton: Locator;

  // Project form extended
  readonly projectCodeInput: Locator;
  readonly projectManagerSelect: Locator;
  readonly projectDepartmentSelect: Locator;
  readonly projectBillableCheckbox: Locator;
  readonly projectStartDate: Locator;
  readonly projectEndDate: Locator;

  // Transfer/return project
  readonly transferProjectButton: Locator;
  readonly returnProjectButton: Locator;
  readonly transferTargetSelect: Locator;
  readonly transferConfirmButton: Locator;

  // Pagination
  readonly paginationContainer: Locator;
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;

  // Sort
  readonly sortByNameButton: Locator;
  readonly sortByStatusButton: Locator;
  readonly sortByDateButton: Locator;

  constructor(page: Page) {
    super(page);

    // Tabs
    this.allProjectsTab = page.locator('a:has-text("Все"), button:has-text("Все"), [class*="tab"]:has-text("Все")').first();
    this.myProjectsTab = page.locator('a:has-text("Мои"), button:has-text("Мои"), [class*="tab"]:has-text("Мои")').first();

    // Details
    this.detailPanel = page.locator('[class*="detail-panel"], [class*="project-detail"], [class*="sidebar"], [class*="drawer"]').first();
    this.detailProjectName = this.detailPanel.locator('[class*="name"], h2, h3').first();
    this.detailProjectDescription = this.detailPanel.locator('[class*="description"], p').first();
    this.detailProjectStatus = this.detailPanel.locator('[class*="status"], [class*="badge"]').first();
    this.detailTrackerInfo = this.detailPanel.locator('[class*="tracker"], [class*="integration"]').first();
    this.detailMembersList = this.detailPanel.locator('[class*="members-list"], [class*="participants"], ul, table').first();
    this.detailCloseButton = this.detailPanel.locator('button:has-text("Закрыть"), button[class*="close"]').first();

    // Form extended
    this.projectCodeInput = page.locator('[class*="modal"] input[name*="code"], [class*="modal"] input[placeholder*="код" i]').first();
    this.projectManagerSelect = page.locator('[class*="modal"] [class*="manager-select"], [class*="modal"] select[name*="manager"]').first();
    this.projectDepartmentSelect = page.locator('[class*="modal"] [class*="department-select"], [class*="modal"] select[name*="department"]').first();
    this.projectBillableCheckbox = page.locator('[class*="modal"] input[type="checkbox"][name*="billable"], [class*="modal"] [class*="billable"]').first();
    this.projectStartDate = page.locator('[class*="modal"] input[name*="start"], [class*="modal"] input[class*="start-date"]').first();
    this.projectEndDate = page.locator('[class*="modal"] input[name*="end"], [class*="modal"] input[class*="end-date"]').first();

    // Transfer
    this.transferProjectButton = page.getByRole('button', { name: /Передать|Transfer/i }).first();
    this.returnProjectButton = page.getByRole('button', { name: /Вернуть|Return/i }).first();
    this.transferTargetSelect = page.locator('[class*="modal"] select, [class*="modal"] [class*="target-select"]').first();
    this.transferConfirmButton = page.locator('[class*="modal"] button:has-text("Передать"), [class*="modal"] button:has-text("Подтвердить")').first();

    // Pagination
    this.paginationContainer = page.locator('[class*="pagination"], nav[aria-label*="pagination"]').first();
    this.nextPageButton = this.paginationContainer.locator('button:has-text("»"), button:has-text("Next"), [aria-label="Next"]').first();
    this.prevPageButton = this.paginationContainer.locator('button:has-text("«"), button:has-text("Prev"), [aria-label="Previous"]').first();

    // Sort
    this.sortByNameButton = page.locator('th:has-text("Название"), th:has-text("Name"), button:has-text("Название")').first();
    this.sortByStatusButton = page.locator('th:has-text("Статус"), th:has-text("Status"), button:has-text("Статус")').first();
    this.sortByDateButton = page.locator('th:has-text("Дата"), th:has-text("Date"), button:has-text("Дата")').first();
  }

  // --- Tab navigation ---

  async switchToAllProjects() {
    await this.allProjectsTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToMyProjects() {
    await this.myProjectsTab.click();
    await this.page.waitForTimeout(500);
  }

  // --- Detail panel ---

  async openProjectDetails(projectName: string) {
    const row = this.getProjectRow(projectName);
    const detailBtn = row.locator('button:has-text("Подробнее"), a:has-text("Подробнее"), [title*="Подробнее"]').first();
    if (await detailBtn.isVisible().catch(() => false)) {
      await detailBtn.click();
    } else {
      await row.click();
    }
    await this.page.waitForTimeout(500);
  }

  async getDetailMemberNames(): Promise<string[]> {
    const items = this.detailMembersList.locator('li, tr, [class*="member"]');
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  async closeDetails() {
    await this.detailCloseButton.click().catch(() => this.page.keyboard.press('Escape'));
    await this.page.waitForTimeout(300);
  }

  // --- Transfer ---

  async transferProject(projectName: string, targetUser: string) {
    await this.openProjectDetails(projectName);
    await this.transferProjectButton.click();
    await this.page.waitForTimeout(300);
    await this.transferTargetSelect.selectOption({ label: targetUser });
    await this.transferConfirmButton.click();
    await this.page.waitForTimeout(500);
  }

  async returnProject(projectName: string) {
    await this.openProjectDetails(projectName);
    await this.returnProjectButton.click();
    await this.page.waitForTimeout(500);
  }

  // --- Sort ---

  async sortByName() {
    await this.sortByNameButton.click();
    await this.page.waitForTimeout(500);
  }

  async sortByStatus() {
    await this.sortByStatusButton.click();
    await this.page.waitForTimeout(500);
  }

  // --- Extended project creation ---

  async createFullProject(params: {
    name: string;
    code?: string;
    description?: string;
    manager?: string;
    billable?: boolean;
  }) {
    await this.createProjectButton.click();
    await this.page.waitForTimeout(300);
    await this.projectFormName.fill(params.name);
    if (params.code) {
      await this.projectCodeInput.fill(params.code).catch(() => {});
    }
    if (params.description) {
      await this.projectFormDescription.fill(params.description);
    }
    if (params.manager) {
      await this.projectManagerSelect.selectOption({ label: params.manager }).catch(() => {});
    }
    if (params.billable !== undefined) {
      const isChecked = await this.projectBillableCheckbox.isChecked().catch(() => false);
      if (isChecked !== params.billable) {
        await this.projectBillableCheckbox.click();
      }
    }
    await this.projectFormSubmitButton.click();
    await this.page.waitForTimeout(500);
  }

  // --- Pagination ---

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.page.waitForTimeout(500);
  }

  async goToPrevPage() {
    await this.prevPageButton.click();
    await this.page.waitForTimeout(500);
  }

  async isPaginationVisible(): Promise<boolean> {
    return await this.paginationContainer.isVisible().catch(() => false);
  }
}
