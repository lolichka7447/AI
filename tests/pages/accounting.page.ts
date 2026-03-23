import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

/**
 * Page Object for /accounting/salary — Заработная плата
 */
export class SalaryPage extends BasePage {
  readonly dataTable: Locator;
  readonly dataRows: Locator;
  readonly periodFilter: Locator;
  readonly departmentFilter: Locator;
  readonly searchInput: Locator;
  readonly totalRow: Locator;
  readonly emptyState: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    super(page);

    this.dataTable = page.locator('table:visible').first();
    this.dataRows = this.dataTable.locator('tbody tr');
    this.periodFilter = page.locator('[class*="period"], [class*="date-range"], select[class*="period"]').first();
    this.departmentFilter = page.locator(`[class*="department-filter"], select:has-text("${t('filter.department')}")`).first();
    this.searchInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], input[class*="search"]`).first();
    this.totalRow = this.dataTable.locator(`tr:has-text("${t('label.totalAlt')}"), tfoot tr`).last();
    this.emptyState = page.locator(`[class*="empty"], text=/${t('msg.noData')}/i`).first();
    this.exportButton = page.getByRole('button', { name: new RegExp(t('btn.export'), 'i') }).first();
  }

  get url() { return '/admin/salary'; }

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }
}

/**
 * Page Object for /accounting/periods — Изменение периодов
 */
export class PeriodsPage extends BasePage {
  readonly officeTabs: Locator;
  readonly periodForm: Locator;
  readonly periodTable: Locator;
  readonly periodRows: Locator;
  readonly saveButton: Locator;
  readonly officeSelect: Locator;

  constructor(page: Page) {
    super(page);

    this.officeTabs = page.locator('[class*="tabs"], [role="tablist"]').first();
    this.periodForm = page.locator('[class*="period-form"], form, [class*="modal"]').first();
    this.periodTable = page.locator('table:visible').first();
    this.periodRows = this.periodTable.locator('tbody tr');
    this.saveButton = page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).first();
    this.officeSelect = page.locator('select[class*="office"], [class*="office-select"]').first();
  }

  get url() { return '/admin/offices'; }

  async getRowCount(): Promise<number> {
    return await this.periodRows.count();
  }
}

/**
 * Page Object for /accounting/sick-leaves — Учет больничных листов
 */
export class AccountingSickLeavesPage extends BasePage {
  readonly dataTable: Locator;
  readonly dataRows: Locator;
  readonly periodFilter: Locator;
  readonly departmentFilter: Locator;
  readonly statusFilter: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);

    this.dataTable = page.locator('table:visible').first();
    this.dataRows = this.dataTable.locator('tbody tr');
    this.periodFilter = page.locator('[class*="period"], select[class*="period"]').first();
    this.departmentFilter = page.locator(`[class*="department-filter"], select:has-text("${t('filter.department')}")`).first();
    this.statusFilter = page.locator(`[class*="status-filter"], select:has-text("${t('filter.status')}")`).first();
    this.emptyState = page.locator(`[class*="empty"], text=/${t('msg.noData')}/i`).first();
  }

  get url() { return '/accounting/sick-leaves'; }

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }
}
