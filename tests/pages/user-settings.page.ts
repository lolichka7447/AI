import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for /admin/account — Настройки пользователя
 */
export class UserSettingsPage extends BasePage {
  // Tabs
  readonly generalTab: Locator;
  readonly trackersTab: Locator;
  readonly exportTab: Locator;

  // General settings
  readonly profileSection: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly languageSelect: Locator;
  readonly saveProfileButton: Locator;

  // Token management
  readonly tokenSection: Locator;
  readonly currentToken: Locator;
  readonly generateTokenButton: Locator;
  readonly copyTokenButton: Locator;
  readonly revokeTokenButton: Locator;
  readonly tokenInput: Locator;

  // Tracker settings
  readonly trackerList: Locator;
  readonly trackerRows: Locator;
  readonly addTrackerButton: Locator;
  readonly trackerNameInput: Locator;
  readonly trackerUrlInput: Locator;
  readonly trackerTokenInput: Locator;
  readonly trackerProjectSelect: Locator;
  readonly saveTrackerButton: Locator;
  readonly deleteTrackerButton: Locator;
  readonly trackerFormModal: Locator;

  // Export
  readonly exportSection: Locator;
  readonly exportFormatSelect: Locator;
  readonly exportPeriodStart: Locator;
  readonly exportPeriodEnd: Locator;
  readonly exportButton: Locator;
  readonly downloadLink: Locator;

  // Common
  readonly alertContainer: Locator;
  readonly confirmDialog: Locator;
  readonly confirmYesButton: Locator;

  constructor(page: Page) {
    super(page);

    // Tabs
    this.generalTab = page.locator('a:has-text("Общие"), button:has-text("Общие"), [class*="tab"]:has-text("Общие")').first();
    this.trackersTab = page.locator('a:has-text("Трекеры"), button:has-text("Трекеры"), [class*="tab"]:has-text("Трекеры")').first();
    this.exportTab = page.locator('a:has-text("Экспорт"), button:has-text("Экспорт"), [class*="tab"]:has-text("Экспорт")').first();

    // General
    this.profileSection = page.locator('[class*="profile"], [class*="general"], form').first();
    this.nameInput = page.locator('input[name*="name"], input[placeholder*="имя" i]').first();
    this.emailInput = page.locator('input[name*="email"], input[type="email"]').first();
    this.languageSelect = page.locator('select[name*="lang"], [class*="language-select"]').first();
    this.saveProfileButton = page.getByRole('button', { name: /Сохранить|Save/i }).first();

    // Token
    this.tokenSection = page.locator('[class*="token"], [class*="api-key"]').first();
    this.currentToken = page.locator('[class*="token-value"], code, [class*="api-key-value"]').first();
    this.generateTokenButton = page.getByRole('button', { name: /Сгенерировать|Generate|Создать токен/i }).first();
    this.copyTokenButton = page.getByRole('button', { name: /Копировать|Copy/i }).first();
    this.revokeTokenButton = page.getByRole('button', { name: /Отозвать|Revoke|Удалить токен/i }).first();
    this.tokenInput = page.locator('input[class*="token"], input[readonly]').first();

    // Trackers
    this.trackerList = page.locator('[class*="tracker-list"], table').first();
    this.trackerRows = this.trackerList.locator('tbody tr, [class*="tracker-row"]');
    this.addTrackerButton = page.getByRole('button', { name: /Добавить трекер|Add tracker/i }).first();
    this.trackerNameInput = page.locator('[class*="modal"] input[name*="name"], [role="dialog"] input').first();
    this.trackerUrlInput = page.locator('[class*="modal"] input[name*="url"], [class*="modal"] input[placeholder*="URL"]').first();
    this.trackerTokenInput = page.locator('[class*="modal"] input[name*="token"], [class*="modal"] input[placeholder*="токен" i]').first();
    this.trackerProjectSelect = page.locator('[class*="modal"] select, [class*="modal"] [class*="project-select"]').first();
    this.saveTrackerButton = page.locator('[class*="modal"] button:has-text("Сохранить"), [role="dialog"] button:has-text("Сохранить")').first();
    this.deleteTrackerButton = page.locator('button:has-text("Удалить"), button[class*="delete-tracker"]').first();
    this.trackerFormModal = page.locator('[class*="modal"], [role="dialog"]').first();

    // Export
    this.exportSection = page.locator('[class*="export"], [class*="download"]').first();
    this.exportFormatSelect = page.locator('select[class*="format"], [class*="export-format"]').first();
    this.exportPeriodStart = page.locator('[class*="export"] input[type="date"], [class*="export"] input[class*="start"]').first();
    this.exportPeriodEnd = page.locator('[class*="export"] input[type="date"], [class*="export"] input[class*="end"]').last();
    this.exportButton = page.getByRole('button', { name: /Экспорт|Export|Скачать|Download/i }).first();
    this.downloadLink = page.locator('a[download], a:has-text("Скачать")').first();

    // Common
    this.alertContainer = page.locator('[class*="alert"], [class*="toast"], [role="alert"]').first();
    this.confirmDialog = page.locator('[class*="confirm"], [role="alertdialog"]').first();
    this.confirmYesButton = this.confirmDialog.locator('button:has-text("Да"), button:has-text("OK")').first();
  }

  get url() { return '/admin/account'; }

  // --- Tab navigation ---

  async switchToGeneral() {
    await this.generalTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToTrackers() {
    await this.trackersTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToExport() {
    await this.exportTab.click();
    await this.page.waitForTimeout(500);
  }

  // --- Tracker helpers ---

  async getTrackerCount(): Promise<number> {
    return await this.trackerRows.count();
  }

  getTrackerRow(trackerName: string): Locator {
    return this.trackerList.locator(`tr:has-text("${trackerName}"), [class*="row"]:has-text("${trackerName}")`).first();
  }

  async addTracker(name: string, url: string, token: string) {
    await this.addTrackerButton.click();
    await this.page.waitForTimeout(300);
    await this.trackerNameInput.fill(name);
    await this.trackerUrlInput.fill(url);
    await this.trackerTokenInput.fill(token);
    await this.saveTrackerButton.click();
    await this.page.waitForTimeout(500);
  }

  async deleteTracker(trackerName: string) {
    const row = this.getTrackerRow(trackerName);
    const deleteBtn = row.locator('button:has-text("Удалить"), button[class*="delete"]').first();
    await deleteBtn.click();
    await this.page.waitForTimeout(300);
    if (await this.confirmYesButton.isVisible().catch(() => false)) {
      await this.confirmYesButton.click();
    }
    await this.page.waitForTimeout(500);
  }

  // --- Alert helpers ---

  async getAlertText(): Promise<string> {
    await this.alertContainer.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.alertContainer.textContent())?.trim() || '';
  }

  async isAlertVisible(): Promise<boolean> {
    return await this.alertContainer.isVisible().catch(() => false);
  }
}
