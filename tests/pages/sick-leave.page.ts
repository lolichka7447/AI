import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

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
    this.emptyState = page.locator('[class*="empty"], text=/нет больничных/i, text=/нет данных/i').first();

    this.createButton = page.getByRole('button', { name: /Создать|Добавить|Открыть больничный/i }).first();
    this.modal = page.locator('[class*="modal"], [role="dialog"]').first();
    this.dateStartInput = this.modal.locator('input[type="date"], input[class*="start"]').first();
    this.dateEndInput = this.modal.locator('input[type="date"], input[class*="end"]').last();
    this.commentInput = this.modal.locator('textarea, input[placeholder*="коммент" i]').first();
    this.fileUploadInput = this.modal.locator('input[type="file"]').first();
    this.submitButton = this.modal.locator('button:has-text("Сохранить"), button:has-text("Создать"), button[type="submit"]').first();
    this.cancelButton = this.modal.locator('button:has-text("Отмена"), button:has-text("Закрыть")').first();

    this.closeButton = page.getByRole('button', { name: /Закрыть больничный|Close/i }).first();
    this.deleteButton = page.getByRole('button', { name: /Удалить|Delete/i }).first();
    this.editButton = page.getByRole('button', { name: /Редактировать|Edit/i }).first();
    this.addCommentButton = page.getByRole('button', { name: /Комментарий|Comment/i }).first();

    this.statusBadge = page.locator('[class*="status"], [class*="badge"]').first();

    this.alertContainer = page.locator('[class*="alert"], [class*="toast"], [role="alert"]').first();
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
