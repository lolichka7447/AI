import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AdminPage extends BasePage {
  // Navigation tabs
  readonly projectsTab: Locator;
  readonly employeesTab: Locator;
  readonly apiTokensTab: Locator;
  readonly settingsTab: Locator;
  readonly featureTogglesTab: Locator;

  // Projects section
  readonly projectList: Locator;
  readonly projectRows: Locator;
  readonly createProjectButton: Locator;
  readonly projectNameInput: Locator;
  readonly projectSaveButton: Locator;
  readonly projectSearchInput: Locator;

  // Project form
  readonly projectFormModal: Locator;
  readonly projectFormName: Locator;
  readonly projectFormDescription: Locator;
  readonly projectFormTracker: Locator;
  readonly projectFormTrackerUrl: Locator;
  readonly projectFormCloseButton: Locator;
  readonly projectFormSubmitButton: Locator;

  // Project members
  readonly membersSection: Locator;
  readonly addMemberButton: Locator;
  readonly membersList: Locator;
  readonly removeMemberButton: Locator;

  // Employees section
  readonly employeeList: Locator;
  readonly employeeRows: Locator;
  readonly employeeSearchInput: Locator;
  readonly employeeSortSelect: Locator;

  // API tokens section
  readonly tokenList: Locator;
  readonly createTokenButton: Locator;
  readonly tokenNameInput: Locator;
  readonly tokenSaveButton: Locator;
  readonly tokenDeleteButton: Locator;

  // Settings section
  readonly settingsForm: Locator;
  readonly settingsSaveButton: Locator;

  // Feature toggles
  readonly toggleList: Locator;
  readonly toggleItems: Locator;

  // Common
  readonly alertContainer: Locator;
  readonly confirmDialog: Locator;
  readonly confirmYesButton: Locator;
  readonly confirmNoButton: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation tabs
    this.projectsTab = page.locator('a:has-text("Проекты"), button:has-text("Проекты"), [class*="tab"]:has-text("Проекты")').first();
    this.employeesTab = page.locator('a:has-text("Сотрудники"), button:has-text("Сотрудники"), [class*="tab"]:has-text("Сотрудники")').first();
    this.apiTokensTab = page.locator('a:has-text("API"), button:has-text("API"), [class*="tab"]:has-text("API")').first();
    this.settingsTab = page.locator('a:has-text("Настройки"), button:has-text("Настройки"), [class*="tab"]:has-text("Настройки")').first();
    this.featureTogglesTab = page.locator('a:has-text("Feature"), button:has-text("Feature"), [class*="tab"]:has-text("Feature")').first();

    // Projects section
    this.projectList = page.locator('[class*="project-list"], table').first();
    this.projectRows = this.projectList.locator('tbody tr, [class*="project-row"]');
    this.createProjectButton = page.getByRole('button', { name: /Создать проект|Create project|Добавить/i }).first();
    this.projectNameInput = page.locator('input[class*="project-name"], input[placeholder*="проект" i]').first();
    this.projectSaveButton = page.getByRole('button', { name: /Сохранить|Save/i }).first();
    this.projectSearchInput = page.locator('input[placeholder*="Поиск" i], input[placeholder*="Search" i], input[class*="search"]').first();

    // Project form
    this.projectFormModal = page.locator('[class*="modal"], [role="dialog"]').first();
    this.projectFormName = this.projectFormModal.locator('input[class*="name"], input').first();
    this.projectFormDescription = this.projectFormModal.locator('textarea, input[class*="description"]').first();
    this.projectFormTracker = this.projectFormModal.locator('select[class*="tracker"], [class*="tracker"] select').first();
    this.projectFormTrackerUrl = this.projectFormModal.locator('input[class*="tracker-url"], input[placeholder*="URL"]').first();
    this.projectFormCloseButton = this.projectFormModal.locator('button:has-text("Закрыть"), button:has-text("Отмена"), button[class*="close"]').first();
    this.projectFormSubmitButton = this.projectFormModal.locator('button:has-text("Сохранить"), button:has-text("Создать"), button[type="submit"]').first();

    // Project members
    this.membersSection = page.locator('[class*="members"], [class*="participants"]').first();
    this.addMemberButton = page.getByRole('button', { name: /Добавить участника|Add member/i }).first();
    this.membersList = page.locator('[class*="member-list"], [class*="participants-list"]').first();
    this.removeMemberButton = page.locator('button[class*="remove-member"], button:has-text("Удалить участника")').first();

    // Employees section
    this.employeeList = page.locator('[class*="employee-list"], table').first();
    this.employeeRows = this.employeeList.locator('tbody tr, [class*="employee-row"]');
    this.employeeSearchInput = page.locator('input[placeholder*="сотрудник" i], input[class*="employee-search"]').first();
    this.employeeSortSelect = page.locator('select[class*="sort"], [class*="sort"] select').first();

    // API tokens section
    this.tokenList = page.locator('[class*="token-list"], table').first();
    this.createTokenButton = page.getByRole('button', { name: /Создать токен|Create token/i }).first();
    this.tokenNameInput = page.locator('[class*="modal"] input, [role="dialog"] input').first();
    this.tokenSaveButton = page.locator('[class*="modal"] button:has-text("Создать"), [role="dialog"] button:has-text("Создать")').first();
    this.tokenDeleteButton = page.locator('button[class*="delete-token"], button:has-text("Удалить токен")').first();

    // Settings section
    this.settingsForm = page.locator('[class*="settings-form"], form').first();
    this.settingsSaveButton = page.getByRole('button', { name: /Сохранить|Save/i }).first();

    // Feature toggles
    this.toggleList = page.locator('[class*="toggle-list"], [class*="feature-list"]').first();
    this.toggleItems = this.toggleList.locator('[class*="toggle-item"], [class*="feature-item"], tr');

    // Common
    this.alertContainer = page.locator('[class*="alert"], [class*="toast"], [role="alert"]').first();
    this.confirmDialog = page.locator('[class*="confirm"], [role="alertdialog"]').first();
    this.confirmYesButton = this.confirmDialog.locator('button:has-text("Да"), button:has-text("Подтвердить"), button:has-text("OK")').first();
    this.confirmNoButton = this.confirmDialog.locator('button:has-text("Нет"), button:has-text("Отмена"), button:has-text("Cancel")').first();
  }

  get url() { return '/admin'; }

  // --- Tab navigation ---

  async switchToProjects() {
    await this.projectsTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToEmployees() {
    await this.employeesTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToApiTokens() {
    await this.apiTokensTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToSettings() {
    await this.settingsTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToFeatureToggles() {
    await this.featureTogglesTab.click();
    await this.page.waitForTimeout(500);
  }

  // --- Project helpers ---

  getProjectRow(projectName: string): Locator {
    return this.projectList.locator(`tr:has-text("${projectName}"), [class*="row"]:has-text("${projectName}")`).first();
  }

  async getProjectNames(): Promise<string[]> {
    const rows = this.projectRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td, [class*="name"]').first().textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  async createProject(name: string, description?: string) {
    await this.createProjectButton.click();
    await this.page.waitForTimeout(300);
    await this.projectFormName.fill(name);
    if (description) {
      await this.projectFormDescription.fill(description);
    }
    await this.projectFormSubmitButton.click();
    await this.page.waitForTimeout(500);
  }

  async editProject(projectName: string) {
    const row = this.getProjectRow(projectName);
    const editBtn = row.locator('button:has-text("Редактировать"), button[class*="edit"], [title*="Редактировать"]').first();
    await editBtn.click();
    await this.page.waitForTimeout(300);
  }

  async toggleProjectStatus(projectName: string) {
    const row = this.getProjectRow(projectName);
    const toggleBtn = row.locator('button:has-text("Закрыть"), button:has-text("Открыть"), [class*="toggle-status"]').first();
    await toggleBtn.click();
    await this.page.waitForTimeout(500);
  }

  async configureTracker(projectName: string, trackerType: string, trackerUrl: string) {
    await this.editProject(projectName);
    await this.projectFormTracker.selectOption({ label: trackerType });
    await this.projectFormTrackerUrl.fill(trackerUrl);
    await this.projectFormSubmitButton.click();
    await this.page.waitForTimeout(500);
  }

  // --- Employee helpers ---

  async getEmployeeNames(): Promise<string[]> {
    const rows = this.employeeRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td, [class*="name"]').first().textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  async searchEmployees(query: string) {
    await this.employeeSearchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async sortEmployees(sortOption: string) {
    await this.employeeSortSelect.selectOption({ label: sortOption });
    await this.page.waitForTimeout(500);
  }

  // --- API token helpers ---

  async createToken(name: string) {
    await this.createTokenButton.click();
    await this.page.waitForTimeout(300);
    await this.tokenNameInput.fill(name);
    await this.tokenSaveButton.click();
    await this.page.waitForTimeout(500);
  }

  async deleteToken(tokenName: string) {
    const row = this.tokenList.locator(`tr:has-text("${tokenName}"), [class*="row"]:has-text("${tokenName}")`).first();
    const deleteBtn = row.locator('button:has-text("Удалить"), button[class*="delete"]').first();
    await deleteBtn.click();
    await this.page.waitForTimeout(300);
    if (await this.confirmYesButton.isVisible().catch(() => false)) {
      await this.confirmYesButton.click();
    }
    await this.page.waitForTimeout(500);
  }

  // --- Feature toggle helpers ---

  async getToggleState(toggleName: string): Promise<boolean> {
    const item = this.toggleList.locator(`[class*="item"]:has-text("${toggleName}"), tr:has-text("${toggleName}")`).first();
    const toggle = item.locator('input[type="checkbox"], [class*="toggle"], [role="switch"]').first();
    return await toggle.isChecked().catch(() => false);
  }

  async setToggle(toggleName: string, enabled: boolean) {
    const item = this.toggleList.locator(`[class*="item"]:has-text("${toggleName}"), tr:has-text("${toggleName}")`).first();
    const toggle = item.locator('input[type="checkbox"], [class*="toggle"], [role="switch"]').first();
    const isChecked = await toggle.isChecked().catch(() => false);
    if (isChecked !== enabled) {
      await toggle.click();
      await this.page.waitForTimeout(500);
    }
  }

  // --- Alert helpers ---

  async getAlertText(): Promise<string> {
    await this.alertContainer.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.alertContainer.textContent())?.trim() || '';
  }

  async isAlertVisible(): Promise<boolean> {
    return await this.alertContainer.isVisible().catch(() => false);
  }

  // --- Search ---

  async searchProjects(query: string) {
    await this.projectSearchInput.fill(query);
    await this.page.waitForTimeout(500);
  }
}
