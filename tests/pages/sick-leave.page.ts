import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

/**
 * Page Object for /sick-leave/my — Мои больничные
 */
export class MySickLeavePage extends BasePage {
  // Sick leave list
  readonly sickLeaveList: Locator;
  readonly sickLeaveItems: Locator;
  readonly emptyState: Locator;

  // Create sick leave
  readonly createButton: Locator;
  readonly modal: Locator;
  readonly dateStartInput: Locator;
  readonly dateEndInput: Locator;
  readonly commentInput: Locator;
  readonly fileUploadInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Actions
  readonly closeButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly addCommentButton: Locator;

  // Status
  readonly statusBadge: Locator;

  // Alerts
  readonly alertContainer: Locator;

  constructor(page: Page) {
    super(page);

    this.sickLeaveList = page.locator('[class*="sick-leave-list"], table, main').first();
    this.sickLeaveItems = this.sickLeaveList.locator('tr, [class*="sick-leave-item"]');
    this.emptyState = page.locator(`[class*="empty"], text=/${t('msg.noSickLeaves')}/i, text=/${t('msg.noData')}/i`).first();

    this.createButton = page.getByRole('button', { name: new RegExp(t('btn.create'), 'i') }).first();
    this.modal = page.locator('.modal__wrapper, .modal, [role="dialog"]').first();
    this.dateStartInput = this.modal.locator('input[type="date"], input[class*="start"]').first();
    this.dateEndInput = this.modal.locator('input[type="date"], input[class*="end"]').last();
    this.commentInput = this.modal.locator(`textarea, input[placeholder*="${t('placeholder.comment')}" i]`).first();
    this.fileUploadInput = this.modal.locator('input[type="file"]').first();
    this.submitButton = this.modal.locator(`button:has-text("${t('btn.save')}"), button:has-text("${t('btn.create')}"), button[type="submit"]`).first();
    this.cancelButton = this.modal.locator(`button:has-text("${t('btn.cancel')}"), button:has-text("${t('btn.close')}")`).first();

    this.closeButton = page.getByRole('button', { name: new RegExp(t('btn.closeSickLeave'), 'i') }).first();
    this.deleteButton = page.getByRole('button', { name: new RegExp(t('btn.delete'), 'i') }).first();
    this.editButton = page.getByRole('button', { name: new RegExp(t('btn.edit'), 'i') }).first();
    this.addCommentButton = page.getByRole('button', { name: new RegExp(t('btn.comment'), 'i') }).first();

    this.statusBadge = page.locator('[class*="status"], [class*="badge"]').first();

    this.alertContainer = page.locator('.popup.popup_show, [role="alert"], .rc-notification').first();
  }

  get url() { return '/sick-leave/my'; }

  async getSickLeaveCount(): Promise<number> {
    return await this.sickLeaveItems.count();
  }

  async openCreateForm() {
    await this.createButton.click();
    await this.page.waitForTimeout(300);
  }

  async clickSickLeave(index: number) {
    await this.sickLeaveItems.nth(index).click();
    await this.page.waitForTimeout(300);
  }
}
