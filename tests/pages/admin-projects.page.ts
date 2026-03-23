import { Page, Locator } from '@playwright/test';
import { AdminPage } from './admin.page';
import { t } from '../i18n';

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

    // Tabs — main-tabs__item inside main-tabs__theme-main
    this.allProjectsTab = page.locator('.main-tabs__theme-main .main-tabs__item').filter({ hasText: new RegExp(`^${t('tab.all')}$`, 'i') }).first();
    this.myProjectsTab = page.locator('.main-tabs__theme-main .main-tabs__item').filter({ hasText: new RegExp(t('tab.my'), 'i') }).first();

    // Details — info-project-modal or side panel
    this.detailPanel = page.locator('.info-project-modal, .modal, [role="dialog"], [class*="detail-panel"]').first();
    this.detailProjectName = this.detailPanel.locator('.modal__title, h2, h3').first();
    this.detailProjectDescription = this.detailPanel.locator('p, [class*="description"]').first();
    this.detailProjectStatus = this.detailPanel.locator('[class*="status"], [class*="badge"]').first();
    this.detailTrackerInfo = this.detailPanel.locator('[class*="tracker"]').first();
    this.detailMembersList = this.detailPanel.locator('ul, table').first();
    this.detailCloseButton = this.detailPanel.locator(`.modal__close, button:has-text("${t('btn.close')}")`).first();

    // Form extended
    this.projectCodeInput = page.locator('.modal input[name*="code"], .modal input[placeholder*="код" i]').first();
    this.projectManagerSelect = page.locator('.modal select[name*="manager"], .modal select').nth(1);
    this.projectDepartmentSelect = page.locator('.modal select[name*="department"]').first();
    this.projectBillableCheckbox = page.locator('.modal input[type="checkbox"]').first();
    this.projectStartDate = page.locator('.modal input[type="date"]').first();
    this.projectEndDate = page.locator('.modal input[type="date"]').last();

    // Transfer
    this.transferProjectButton = page.getByRole('button', { name: new RegExp(t('btn.transfer'), 'i') }).first();
    this.returnProjectButton = page.getByRole('button', { name: new RegExp(t('btn.return'), 'i') }).first();
    this.transferTargetSelect = page.locator('.modal select').first();
    this.transferConfirmButton = page.locator(`.modal button:has-text("${t('btn.transfer')}"), .modal button:has-text("${t('btn.confirm')}")`).first();

    // Pagination — uses Pagination component
    this.paginationContainer = page.locator('.pagination, nav[aria-label*="pagination"]').first();
    this.nextPageButton = this.paginationContainer.locator('button:has-text("»"), button:has-text("Next"), [aria-label="Next"]').first();
    this.prevPageButton = this.paginationContainer.locator('button:has-text("«"), button:has-text("Prev"), [aria-label="Previous"]').first();

    // Sort
    this.sortByNameButton = page.locator(`th:has-text("${t('label.name')}")`).first();
    this.sortByStatusButton = page.locator(`th:has-text("${t('label.status')}")`).first();
    this.sortByDateButton = page.locator(`th:has-text("${t('label.date')}")`).first();
  }

  // --- Tab navigation ---

  async switchToAllProjects() {
    await this.allProjectsTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToMyProjects() {
    await this.myProjectsTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Detail panel ---

  async openProjectDetails(projectName: string) {
    const row = this.getProjectRow(projectName);
    const detailBtn = row.locator(`button:has-text("${t('btn.details')}"), a:has-text("${t('btn.details')}"), [title*="${t('btn.details')}"]`).first();
    if (await detailBtn.isVisible().catch(() => false)) {
      await detailBtn.click();
    } else {
      await row.click();
    }
    await this.page.waitForTimeout(500);
  }

  async getDetailMemberNames(): Promise<string[]> {
    const items = this.detailMembersList.locator('li, tr');
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
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async returnProject(projectName: string) {
    await this.openProjectDetails(projectName);
    await this.returnProjectButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Sort ---

  async sortByName() {
    await this.sortByNameButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async sortByStatus() {
    await this.sortByStatusButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
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
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Pagination ---

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async goToPrevPage() {
    await this.prevPageButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async isPaginationVisible(): Promise<boolean> {
    return await this.paginationContainer.isVisible().catch(() => false);
  }
}
