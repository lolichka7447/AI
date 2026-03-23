import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

export class AdminPage extends BasePage {
  // Navigation tabs — admin uses navbar submenu, pages are separate routes
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

    // Admin navbar submenu links (inside dropdown, not .main-tabs)
    this.projectsTab = page.getByRole('link', { name: new RegExp(t('tab.projects'), 'i') }).first();
    this.employeesTab = page.getByRole('link', { name: new RegExp(t('tab.employees'), 'i') }).first();
    this.apiTokensTab = page.getByRole('link', { name: /API/i }).first();
    this.settingsTab = page.getByRole('link', { name: new RegExp(t('admin.settings'), 'i') }).first();
    this.featureTogglesTab = page.getByRole('link', { name: /Feature|Фичи|Toggle/i }).first();

    // Projects section — uses TableSimple (admin uikit)
    this.projectList = page.locator('table:visible').first();
    this.projectRows = this.projectList.locator('tbody tr');
    this.createProjectButton = page.getByRole('button', { name: new RegExp(t('btn.createProject'), 'i') }).first();
    this.projectNameInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], input[placeholder*="Search" i], input[class*="search"]`).first();
    this.projectSaveButton = page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).first();
    this.projectSearchInput = page.locator(`.react-autosuggest__input, input[placeholder*="${t('placeholder.search')}" i], input[class*="search"]`).first();

    // Project form — uses ModalDialog (modal__wrapper > modal > modal__title / modal__body)
    this.projectFormModal = page.locator('.modal__wrapper, .modal, [role="dialog"]').first();
    this.projectFormName = this.projectFormModal.locator('input').first();
    this.projectFormDescription = this.projectFormModal.locator('textarea').first();
    this.projectFormTracker = this.projectFormModal.locator('select').first();
    this.projectFormTrackerUrl = this.projectFormModal.locator('input[placeholder*="URL"], input[type="url"]').first();
    this.projectFormCloseButton = this.projectFormModal.locator(`.modal__close, button:has-text("${t('btn.close')}"), button:has-text("${t('btn.cancel')}")`).first();
    this.projectFormSubmitButton = this.projectFormModal.locator(`button:has-text("${t('btn.save')}"), button:has-text("${t('btn.create')}"), button[type="submit"]`).first();

    // Project members
    this.membersSection = page.locator('[class*="members"], [class*="participants"]').first();
    this.addMemberButton = page.getByRole('button', { name: new RegExp(t('btn.addMember'), 'i') }).first();
    this.membersList = page.locator('[class*="member-list"], [class*="participants-list"]').first();
    this.removeMemberButton = page.locator(`button:has-text("${t('btn.removeMember')}")`).first();

    // Employees section — uses TableTemplate (admin employees)
    this.employeeList = page.locator('table:visible').first();
    this.employeeRows = this.employeeList.locator('tbody tr');
    this.employeeSearchInput = page.locator(`.react-autosuggest__input, input[placeholder*="${t('placeholder.employee')}" i], input[placeholder*="${t('placeholder.search')}" i]`).first();
    this.employeeSortSelect = page.locator('select, [class*="sort"], [class*="filter"]').first();

    // API tokens section — token-modal for form
    this.tokenList = page.locator('table:visible').first();
    this.createTokenButton = page.getByRole('button', { name: new RegExp(t('btn.createToken'), 'i') }).first();
    this.tokenNameInput = page.locator('.token-modal input, .modal input, [role="dialog"] input').first();
    this.tokenSaveButton = page.locator(`.token-modal button:has-text("${t('btn.create')}"), .modal button:has-text("${t('btn.create')}")`).first()
      .or(page.locator(`[role="dialog"] button:has-text("${t('btn.create')}")`).first());
    this.tokenDeleteButton = page.locator(`button:has-text("${t('btn.delete')}"), button[class*="delete"]`).first();

    // Settings section
    this.settingsForm = page.locator('form, [class*="settings"]').first();
    this.settingsSaveButton = page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).first();

    // Feature toggles
    this.toggleList = page.locator('table:visible, [class*="toggle-list"], [class*="feature"]').first();
    this.toggleItems = this.toggleList.locator('tr, [class*="toggle-item"]');

    // Common — popup for alerts
    this.alertContainer = page.locator('.popup.popup_show, [role="alert"], .rc-notification').first();
    this.confirmDialog = page.locator(`.modal__wrapper:has-text("${t('btn.confirm')}"), .modal:has-text("${t('btn.confirm')}"), [role="alertdialog"]`).first();
    this.confirmYesButton = this.confirmDialog.locator(`button:has-text("${t('btn.yes')}"), button:has-text("${t('btn.confirm')}"), button:has-text("${t('btn.ok')}")`).first();
    this.confirmNoButton = this.confirmDialog.locator(`button:has-text("${t('btn.no')}"), button:has-text("${t('btn.cancel')}"), button:has-text("Cancel")`).first();
  }

  get url() { return '/admin'; }

  // --- Tab navigation ---

  async switchToProjects() {
    await this.page.goto('/admin/projects');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToEmployees() {
    await this.page.goto('/admin/employees');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToApiTokens() {
    await this.page.goto('/admin/api');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToSettings() {
    await this.page.goto('/admin/settings');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async switchToFeatureToggles() {
    if (await this.featureTogglesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.featureTogglesTab.click();
    } else {
      await this.page.goto('/admin/settings');
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Project helpers ---

  getProjectRow(projectName: string): Locator {
    return this.projectList.locator(`tr:has-text("${projectName}")`).first();
  }

  async getProjectNames(): Promise<string[]> {
    const rows = this.projectRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td').first().textContent();
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
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async editProject(projectName: string) {
    const row = this.getProjectRow(projectName);
    const editBtn = row.locator(`button:has-text("${t('btn.edit')}"), [title*="${t('btn.edit')}"], [title*="Edit"]`).first();
    await editBtn.click();
    await this.page.waitForTimeout(300);
  }

  async toggleProjectStatus(projectName: string) {
    const row = this.getProjectRow(projectName);
    const toggleBtn = row.locator(`button:has-text("${t('btn.close')}"), button:has-text("${t('btn.open')}")`).first();
    await toggleBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async configureTracker(projectName: string, trackerType: string, trackerUrl: string) {
    await this.editProject(projectName);
    await this.projectFormTracker.selectOption({ label: trackerType });
    await this.projectFormTrackerUrl.fill(trackerUrl);
    await this.projectFormSubmitButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Employee helpers ---

  async getEmployeeNames(): Promise<string[]> {
    const rows = this.employeeRows;
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td').first().textContent();
      if (text && text.trim()) names.push(text.trim());
    }
    return names;
  }

  async searchEmployees(query: string) {
    await this.employeeSearchInput.fill(query);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async sortEmployees(sortOption: string) {
    await this.employeeSortSelect.selectOption({ label: sortOption });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- API token helpers ---

  async createToken(name: string) {
    await this.createTokenButton.click();
    await this.page.waitForTimeout(300);
    await this.tokenNameInput.fill(name);
    await this.tokenSaveButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async deleteToken(tokenName: string) {
    const row = this.tokenList.locator(`tr:has-text("${tokenName}")`).first();
    const deleteBtn = row.locator(`button:has-text("${t('btn.delete')}"), button[class*="delete"]`).first();
    await deleteBtn.click();
    await this.page.waitForTimeout(300);
    if (await this.confirmYesButton.isVisible().catch(() => false)) {
      await this.confirmYesButton.click();
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Feature toggle helpers ---

  async getToggleState(toggleName: string): Promise<boolean> {
    const item = this.toggleList.locator(`tr:has-text("${toggleName}")`).first();
    const toggle = item.locator('input[type="checkbox"], [role="switch"]').first();
    return await toggle.isChecked().catch(() => false);
  }

  async setToggle(toggleName: string, enabled: boolean) {
    const item = this.toggleList.locator(`tr:has-text("${toggleName}")`).first();
    const toggle = item.locator('input[type="checkbox"], [role="switch"]').first();
    const isChecked = await toggle.isChecked().catch(() => false);
    if (isChecked !== enabled) {
      await toggle.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
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
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}
