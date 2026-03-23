import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

/**
 * Page Object for /vacation/my — Мои отпуска и выходные
 */
export class MyVacationsPage extends BasePage {
  // Vacation list
  readonly vacationList: Locator;
  readonly vacationItems: Locator;
  readonly emptyState: Locator;

  // Create vacation
  readonly createVacationButton: Locator;
  readonly vacationModal: Locator;
  readonly vacationTypeSelect: Locator;
  readonly dateStartInput: Locator;
  readonly dateEndInput: Locator;
  readonly commentInput: Locator;
  readonly fileUploadInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Transfer day-off
  readonly transferDayOffButton: Locator;
  readonly transferModal: Locator;
  readonly transferFromDate: Locator;
  readonly transferToDate: Locator;
  readonly transferSubmitButton: Locator;

  // Vacation details
  readonly detailPanel: Locator;
  readonly statusBadge: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;

  // Alerts
  readonly alertContainer: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.vacationList = page.locator('[class*="vacation-list"], [class*="absence-list"], table, main').first();
    this.vacationItems = this.vacationList.locator('tr, [class*="vacation-item"], [class*="absence-item"]');
    this.emptyState = page.locator(`[class*="empty"], text=/${t('msg.noVacations')}/i, text=/${t('msg.noData')}/i`).first();

    this.createVacationButton = page.getByRole('button', { name: new RegExp(t('btn.create'), 'i') }).first();
    this.vacationModal = page.locator('.modal__wrapper, .modal, [role="dialog"]').first();
    this.vacationTypeSelect = this.vacationModal.locator('label.uikit-checkbox, [class*="uikit-checkbox"], select, [class*="type-select"]').first();
    this.dateStartInput = this.vacationModal.locator('input.date-picker__input').first();
    this.dateEndInput = this.vacationModal.locator('input.date-picker__input').nth(1);
    this.commentInput = this.vacationModal.locator(`textarea, input[placeholder*="${t('placeholder.comment')}" i]`).first();
    this.fileUploadInput = this.vacationModal.locator('input[type="file"]').first();
    this.submitButton = this.vacationModal.locator(`button:has-text("${t('btn.send')}"), button:has-text("${t('btn.save')}"), button:has-text("${t('btn.create')}"), button[type="submit"]`).first();
    this.cancelButton = this.vacationModal.locator(`button:has-text("${t('btn.cancel')}"), button:has-text("${t('btn.close')}")`).first();

    this.transferDayOffButton = page.getByRole('button', { name: new RegExp(t('btn.transferDay'), 'i') }).first();
    this.transferModal = page.locator(`.modal:has-text("${t('btn.transferDay')}"), [role="dialog"]:has-text("${t('btn.transferDay')}")`);
    this.transferFromDate = this.transferModal.locator('input').first();
    this.transferToDate = this.transferModal.locator('input').last();
    this.transferSubmitButton = this.transferModal.locator(`button:has-text("${t('btn.save')}"), button:has-text("${t('btn.transferDayAlt')}")`).first();

    this.detailPanel = page.locator('[class*="detail"], [class*="sidebar"], [class*="drawer"]').first();
    this.statusBadge = page.locator('[class*="status"], [class*="badge"]').first();
    this.deleteButton = page.getByRole('button', { name: new RegExp(t('btn.delete'), 'i') }).first();
    this.editButton = page.getByRole('button', { name: new RegExp(t('btn.edit'), 'i') }).first();

    this.alertContainer = page.locator('.popup.popup_show, [role="alert"], .rc-notification').first();
    this.errorMessage = this.vacationModal.locator('[class*="error"], [class*="validation"]').first();
  }

  get url() { return '/vacation/my'; }

  async getVacationCount(): Promise<number> {
    return await this.vacationItems.count();
  }

  async openCreateForm() {
    await this.createVacationButton.click();
    await this.page.waitForTimeout(300);
  }

  async createVacation(startDate: string, endDate: string, comment?: string) {
    await this.openCreateForm();
    await this.dateStartInput.fill(startDate);
    await this.dateEndInput.fill(endDate);
    if (comment) {
      await this.commentInput.fill(comment);
    }
    await this.submitButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickVacation(index: number) {
    await this.vacationItems.nth(index).click();
    await this.page.waitForTimeout(300);
  }

  async isAlertVisible(): Promise<boolean> {
    return await this.alertContainer.isVisible().catch(() => false);
  }
}

/**
 * Page Object for /vacation/chart — График доступности
 */
export class AvailabilityChartPage extends BasePage {
  readonly chartGrid: Locator;
  readonly monthHeaders: Locator;
  readonly dayHeaders: Locator;
  readonly employeeRows: Locator;
  readonly eventSquares: Locator;

  // Navigation
  readonly prevPeriodButton: Locator;
  readonly nextPeriodButton: Locator;
  readonly periodLabel: Locator;

  // Filters
  readonly departmentFilter: Locator;
  readonly employeeFilter: Locator;

  // Legend
  readonly legend: Locator;
  readonly legendItems: Locator;

  // Tooltips
  readonly tooltip: Locator;

  // Copy
  readonly copyButton: Locator;

  constructor(page: Page) {
    super(page);

    this.chartGrid = page.locator('[class*="chart"], [class*="availability"], table:visible').first();
    this.monthHeaders = this.chartGrid.locator('[class*="month-header"], th[colspan]');
    this.dayHeaders = this.chartGrid.locator('[class*="day-header"], th:not([colspan])');
    this.employeeRows = this.chartGrid.locator('tr[class*="employee"], tbody tr');
    this.eventSquares = this.chartGrid.locator('[class*="event"], [class*="square"], td[class*="absence"]');

    this.prevPeriodButton = page.locator('button:has(svg), button[class*="prev"]').first();
    this.nextPeriodButton = page.locator('button:has(svg), button[class*="next"]').last();
    this.periodLabel = page.locator('[class*="period-label"], h2, h3').first();

    this.departmentFilter = page.locator(`[class*="department-filter"], select:has-text("${t('filter.department')}")`).first();
    this.employeeFilter = page.locator(`[class*="employee-filter"], input[placeholder*="${t('placeholder.employee')}" i]`).first();

    this.legend = page.locator('[class*="legend"]').first();
    this.legendItems = this.legend.locator('[class*="legend-item"], li, span');

    this.tooltip = page.locator('[class*="tooltip"], [role="tooltip"]').first();

    this.copyButton = page.getByRole('button', { name: new RegExp(t('btn.copy'), 'i') }).first();
  }

  get url() { return '/vacation/chart'; }

  async getEmployeeCount(): Promise<number> {
    return await this.employeeRows.count();
  }

  async getEventCount(): Promise<number> {
    return await this.eventSquares.count();
  }

  async hoverEvent(index: number) {
    await this.eventSquares.nth(index).hover();
    await this.page.waitForTimeout(300);
  }

  async getTooltipText(): Promise<string> {
    return (await this.tooltip.textContent())?.trim() || '';
  }

  async getLegendTexts(): Promise<string[]> {
    const items = this.legendItems;
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) texts.push(text.trim());
    }
    return texts;
  }
}

/**
 * Page Object for /vacation/request — Заявки сотрудников
 */
export class VacationRequestsPage extends BasePage {
  readonly requestList: Locator;
  readonly requestItems: Locator;
  readonly emptyState: Locator;

  // Approval actions
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly approvalBar: Locator;

  // Filters
  readonly statusFilter: Locator;
  readonly departmentFilter: Locator;

  constructor(page: Page) {
    super(page);

    this.requestList = page.locator('[class*="request-list"], table, main').first();
    this.requestItems = this.requestList.locator('tr, [class*="request-item"]');
    this.emptyState = page.locator(`[class*="empty"], text=/${t('msg.noRequests')}/i`).first();

    this.approveButton = page.getByRole('button', { name: new RegExp(t('btn.approve'), 'i') }).first();
    this.rejectButton = page.getByRole('button', { name: new RegExp(t('btn.reject'), 'i') }).first();
    this.approvalBar = page.locator('[class*="approval-bar"], [class*="action-bar"]').first();

    this.statusFilter = page.locator('[class*="status-filter"], select').first();
    this.departmentFilter = page.locator(`[class*="department-filter"], select:has-text("${t('filter.department')}")`).first();
  }

  get url() { return '/vacation/request'; }

  async getRequestCount(): Promise<number> {
    return await this.requestItems.count();
  }
}

/**
 * Page Object for /vacation/vacation-days — Отпускные дни сотрудников
 */
export class VacationDaysPage extends BasePage {
  readonly dataTable: Locator;
  readonly dataRows: Locator;
  readonly searchInput: Locator;
  readonly departmentFilter: Locator;
  readonly tooltip: Locator;

  constructor(page: Page) {
    super(page);

    this.dataTable = page.locator('table:visible').first();
    this.dataRows = this.dataTable.locator('tbody tr');
    this.searchInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], input[class*="search"]`).first();
    this.departmentFilter = page.locator(`[class*="department-filter"], select:has-text("${t('filter.department')}")`).first();
    this.tooltip = page.locator('[class*="tooltip"], [role="tooltip"]').first();
  }

  get url() { return '/vacation/vacation-days'; }

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }
}

/**
 * Page Object for /vacation/payment — Выплата отпускных
 */
export class VacationPaymentPage extends BasePage {
  readonly dataTable: Locator;
  readonly dataRows: Locator;
  readonly periodFilter: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);

    this.dataTable = page.locator('table:visible').first();
    this.dataRows = this.dataTable.locator('tbody tr');
    this.periodFilter = page.locator('[class*="period"], [class*="date-range"], select').first();
    this.emptyState = page.locator('[class*="empty"], text=/нет данных/i').first();
  }

  get url() { return '/vacation/payment'; }

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }
}

/**
 * Page Object for /vacation/days-correction — Корректировка отпускных дней
 */
export class VacationDaysCorrectionPage extends BasePage {
  readonly form: Locator;
  readonly employeeSelect: Locator;
  readonly daysInput: Locator;
  readonly reasonInput: Locator;
  readonly submitButton: Locator;
  readonly dataTable: Locator;
  readonly dataRows: Locator;

  constructor(page: Page) {
    super(page);

    this.form = page.locator('form, [class*="correction-form"]').first();
    this.employeeSelect = page.locator('select[class*="employee"], [class*="employee-select"]').first();
    this.daysInput = page.locator('input[type="number"], input[class*="days"]').first();
    this.reasonInput = page.locator(`textarea, input[placeholder*="${t('placeholder.reason')}" i]`).first();
    this.submitButton = page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).first();
    this.dataTable = page.locator('table:visible').first();
    this.dataRows = this.dataTable.locator('tbody tr');
  }

  get url() { return '/vacation/days-correction'; }

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }
}

/**
 * Page Object for /vacation/sick-leaves-of-employees — Больничные листы сотрудников
 */
export class EmployeeSickLeavesPage extends BasePage {
  readonly dataTable: Locator;
  readonly dataRows: Locator;
  readonly searchInput: Locator;
  readonly departmentFilter: Locator;
  readonly statusFilter: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);

    this.dataTable = page.locator('table:visible').first();
    this.dataRows = this.dataTable.locator('tbody tr');
    this.searchInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], input[class*="search"]`).first();
    this.departmentFilter = page.locator(`[class*="department-filter"], select:has-text("${t('filter.department')}")`).first();
    this.statusFilter = page.locator(`[class*="status-filter"], select:has-text("${t('filter.status')}")`).first();
    this.emptyState = page.locator(`[class*="empty"], text=/${t('msg.noData')}/i`).first();
  }

  get url() { return '/vacation/sick-leaves-of-employees'; }

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }
}
