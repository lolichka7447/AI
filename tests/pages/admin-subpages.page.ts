import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

/**
 * Page Object for /admin/calendar — Производственные календари
 */
export class AdminCalendarPage extends BasePage {
  readonly calendarGrid: Locator;
  readonly yearSelector: Locator;
  readonly countrySelector: Locator;
  readonly monthHeaders: Locator;
  readonly dayCells: Locator;
  readonly saveButton: Locator;
  readonly editButton: Locator;

  constructor(page: Page) {
    super(page);

    this.calendarGrid = page.locator('table:visible, [class*="calendar"]').first();
    this.yearSelector = page.locator('select[class*="year"], [class*="year-select"]').first();
    this.countrySelector = page.locator('select[class*="country"], [class*="country-select"]').first();
    this.monthHeaders = this.calendarGrid.locator('th, [class*="month-header"]');
    this.dayCells = this.calendarGrid.locator('td, [class*="day-cell"]');
    this.saveButton = page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).first();
    this.editButton = page.getByRole('button', { name: new RegExp(t('btn.edit'), 'i') }).first();
  }

  get url() { return '/admin/calendar'; }
}

/**
 * Page Object for /admin/export — Экспорт
 */
export class AdminExportPage extends BasePage {
  readonly exportForm: Locator;
  readonly periodStartInput: Locator;
  readonly periodEndInput: Locator;
  readonly formatSelect: Locator;
  readonly exportButton: Locator;
  readonly departmentFilter: Locator;
  readonly projectFilter: Locator;

  constructor(page: Page) {
    super(page);

    this.exportForm = page.locator('form, [class*="export-form"], main').first();
    this.periodStartInput = page.locator('input[class*="start"], input[placeholder*="с" i], input[type="date"]').first();
    this.periodEndInput = page.locator('input[class*="end"], input[placeholder*="по" i], input[type="date"]').last();
    this.formatSelect = page.locator('select[class*="format"], [class*="format-select"]').first();
    this.exportButton = page.getByRole('button', { name: new RegExp(t('btn.export'), 'i') }).first();
    this.departmentFilter = page.locator(`[class*="department-filter"], select:has-text("${t('filter.department')}")`).first();
    this.projectFilter = page.locator(`[class*="project-filter"], select:has-text("${t('label.project')}")`).first();
  }

  get url() { return '/admin/export'; }
}

/**
 * Page Object for /admin/account — Учётная запись / Настройки пользователя
 */
export class AccountSettingsPage extends BasePage {
  readonly settingsForm: Locator;
  readonly trackerTable: Locator;
  readonly trackerRows: Locator;
  readonly addTrackerButton: Locator;
  readonly trackerSearchInput: Locator;
  readonly saveButton: Locator;
  readonly timesheetDayInput: Locator;
  readonly manualTestingToggle: Locator;

  // Tracker modal
  readonly trackerModal: Locator;
  readonly trackerUrlInput: Locator;
  readonly trackerLoginInput: Locator;
  readonly trackerPasswordInput: Locator;
  readonly trackerSaveButton: Locator;
  readonly trackerDeleteButton: Locator;

  constructor(page: Page) {
    super(page);

    this.settingsForm = page.locator('form, [class*="settings"], [class*="account"]').first();
    this.trackerTable = page.locator('table:visible').first();
    this.trackerRows = this.trackerTable.locator('tbody tr');
    this.addTrackerButton = page.getByRole('button', { name: new RegExp(t('btn.add'), 'i') }).first();
    this.trackerSearchInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], input[class*="search"]`).first();
    this.saveButton = page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).first();
    this.timesheetDayInput = page.locator('input[type="number"], input[class*="timesheet"]').first();
    this.manualTestingToggle = page.locator('[class*="toggle"], input[type="checkbox"]').first();

    this.trackerModal = page.locator('.modal__wrapper, .modal, [role="dialog"]').first();
    this.trackerUrlInput = this.trackerModal.locator('input[placeholder*="URL" i], input[class*="url"]').first();
    this.trackerLoginInput = this.trackerModal.locator(`input[placeholder*="${t('placeholder.login')}" i], input[class*="login"]`).first();
    this.trackerPasswordInput = this.trackerModal.locator('input[type="password"]').first();
    this.trackerSaveButton = this.trackerModal.locator(`button:has-text("${t('btn.save')}"), button[type="submit"]`).first();
    this.trackerDeleteButton = page.getByRole('button', { name: new RegExp(t('btn.delete'), 'i') }).first();
  }

  get url() { return '/admin/account'; }

  async getTrackerCount(): Promise<number> {
    return await this.trackerRows.count();
  }
}
