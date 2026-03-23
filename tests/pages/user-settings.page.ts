import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

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

    // Tabs — account page uses simple button tabs (not .main-tabs__item)
    this.generalTab = page.getByRole('button', { name: new RegExp(t('tab.general'), 'i') }).first();
    this.trackersTab = page.getByRole('button', { name: new RegExp(t('tab.trackers'), 'i') }).first();
    this.exportTab = page.getByRole('button', { name: new RegExp(t('tab.export'), 'i') }).first();

    // General — page content area after the header
    this.profileSection = page.locator('.page-body, .page-body__tabs, main').first();
    this.nameInput = page.getByRole('spinbutton').first();
    this.emailInput = page.locator('input[name*="email"], input[type="email"]').first();
    this.languageSelect = page.locator('.language-switcher, select[name*="lang"]').first();
    this.saveProfileButton = page.getByRole('button', { name: /Сохранить настройки|Сохранить/i }).first();

    // Token — "Ваш секретный API Token" section uses <dt>/<dd> (term/definition)
    this.tokenSection = page.locator('dt, text=/секретн|token|токен/i').first();
    this.currentToken = page.locator('dd').first();
    this.generateTokenButton = this.currentToken.locator('button').first();
    this.copyTokenButton = this.currentToken.locator('button').first();
    this.revokeTokenButton = this.currentToken.locator('button').nth(1);
    this.tokenInput = page.locator('dd, input[readonly], input[class*="token"]').first();

    // Trackers
    this.trackerList = page.locator('[class*="tracker-list"], table').first();
    this.trackerRows = this.trackerList.locator('tbody tr, [class*="tracker-row"]');
    this.addTrackerButton = page.getByRole('button', { name: new RegExp(t('btn.addTracker'), 'i') }).first();
    this.trackerNameInput = page.locator('.modal input[name*="name"], .modal input, [role="dialog"] input').first();
    this.trackerUrlInput = page.locator('.modal input[name*="url"], .modal input[placeholder*="URL"]').first();
    this.trackerTokenInput = page.locator(`.modal input[name*="token"], .modal input[placeholder*="${t('placeholder.token')}" i]`).first();
    this.trackerProjectSelect = page.locator('.modal select').first();
    this.saveTrackerButton = page.locator(`.modal button:has-text("${t('btn.save')}"), [role="dialog"] button:has-text("${t('btn.save')}")`).first();
    this.deleteTrackerButton = page.locator(`button:has-text("${t('btn.delete')}"), button[class*="delete-tracker"]`).first();
    this.trackerFormModal = page.locator('.modal__wrapper, .modal, [role="dialog"]').first();

    // Export
    this.exportSection = page.locator('[class*="export"], [class*="download"]').first();
    this.exportFormatSelect = page.locator('select[class*="format"], [class*="export-format"]').first();
    this.exportPeriodStart = page.locator('[class*="export"] input[type="date"], [class*="export"] input[class*="start"]').first();
    this.exportPeriodEnd = page.locator('[class*="export"] input[type="date"], [class*="export"] input[class*="end"]').last();
    this.exportButton = page.getByRole('button', { name: new RegExp(t('btn.export'), 'i') }).first();
    this.downloadLink = page.locator(`a[download], a:has-text("${t('btn.download')}")`).first();

    // Common
    this.alertContainer = page.locator('.popup.popup_show, [role="alert"], .rc-notification').first();
    this.confirmDialog = page.locator(`.modal:has-text("${t('btn.confirm')}"), [role="alertdialog"]`).first();
    this.confirmYesButton = this.confirmDialog.locator(`button:has-text("${t('btn.yes')}"), button:has-text("${t('btn.ok')}")`).first();
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
    const deleteBtn = row.locator(`button:has-text("${t('btn.delete')}"), button[class*="delete"]`).first();
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
