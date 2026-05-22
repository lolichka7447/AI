import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { t } from '../i18n';

/**
 * Page Object for /vacation/my — Мои отпуска и выходные
 *
 * Real DOM structure (from snapshot):
 * - Table headers: Даты отпуска | Очередных дней | Административных дней | Тип отпуска | Подтверждает | Статус заявки | Месяц выплаты | Действия
 * - Empty state: row "Нет данных" in tbody
 * - Create button: "Создать заявку"
 * - Modal: dialog role with date textboxes (placeholder "ДД.ММ.ГГГГ")
 * - Unpaid checkbox: checkbox role "Без оплаты, административная заявка"
 * - Payment month: textbox after "Выдать отпускные с зарплатой за"
 * - Submit: "Сохранить", Cancel: "Отмена"
 * - Filters: buttons "Открытые" / "Закрытые" / "Все" (NOT <select>)
 * - Available days: "Доступно отпускных дней:" + "34 за 2026"
 * - Event feed: "Лента отпускных событий" button
 */
export class MyVacationsPage extends BasePage {
  // Vacation table
  readonly vacationTable: Locator;
  readonly vacationItems: Locator;
  readonly emptyState: Locator;
  readonly totalRow: Locator;

  // Create vacation
  readonly createVacationButton: Locator;
  readonly vacationModal: Locator;
  readonly dateStartInput: Locator;
  readonly dateEndInput: Locator;
  readonly commentInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Business fields in form
  readonly unpaidCheckbox: Locator;
  readonly paymentMonthInput: Locator;
  readonly requestedDaysInfo: Locator;
  readonly approverInfo: Locator;
  readonly daysLimitationWarning: Locator;

  // Page-level info
  readonly availableDaysText: Locator;
  readonly eventFeedButton: Locator;
  readonly eventFeed: Locator;

  // Tab filters (buttons, not select)
  readonly filterOpen: Locator;
  readonly filterClosed: Locator;
  readonly filterAll: Locator;
  readonly tabVacations: Locator;
  readonly tabDayoffs: Locator;

  // Transfer day-off
  readonly transferDayOffButton: Locator;
  readonly transferModal: Locator;
  readonly transferFromDate: Locator;
  readonly transferToDate: Locator;
  readonly transferSubmitButton: Locator;

  // Row actions
  readonly deleteButton: Locator;
  readonly editButton: Locator;

  // Alerts
  readonly alertContainer: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Table
    this.vacationTable = page.locator('table:visible').first();
    // tbody tr — data rows (exclude header rowgroup and footer/total rowgroup)
    this.vacationItems = this.vacationTable.locator('tbody').first().locator('tr');
    this.emptyState = page.locator('td:has-text("Нет данных"), td:has-text("No data")').first();
    this.totalRow = this.vacationTable.locator('tr:has-text("Всего"), tr:has-text("Total")').first();

    // Create button: "Создать заявку" / "Create request"
    this.createVacationButton = page.getByRole('button', { name: /Создать|Create/i }).first();

    // Modal (dialog role)
    this.vacationModal = page.getByRole('dialog').first();

    // Date inputs in modal — readonly date-picker inputs
    // The inputs are readonly, so we must click to open calendar and pick dates
    this.dateStartInput = this.vacationModal.locator('input.date-picker__input').first();
    this.dateEndInput = this.vacationModal.locator('input.date-picker__input').nth(1);

    // Comment textbox (last textbox in form, after "Комментарий" label)
    this.commentInput = this.vacationModal.locator('textbox, textarea').last()
      .or(this.vacationModal.getByRole('textbox').last());

    // Submit / Cancel
    this.submitButton = this.vacationModal.getByRole('button', { name: new RegExp(`${t('btn.save')}|${t('btn.send')}`, 'i') }).first();
    this.cancelButton = this.vacationModal.getByRole('button', { name: new RegExp(`${t('btn.cancel')}`, 'i') }).first();

    // Unpaid checkbox: "Без оплаты, административная заявка"
    this.unpaidCheckbox = this.vacationModal.getByRole('checkbox', { name: /Без оплаты|Unpaid|administrative/i });

    // Payment month input (textbox after "Выдать отпускные с зарплатой за" label)
    this.paymentMonthInput = this.vacationModal.locator('input.date-picker__input, [class*="date-picker"] input').nth(2)
      .or(this.vacationModal.getByRole('textbox').nth(2));

    // "Запрошено дней: N" text
    this.requestedDaysInfo = this.vacationModal.locator('text=/Запрошено дней|Requested days/i').first()
      .or(this.vacationModal.locator('strong:has-text("Запрошено")'));

    // Approver info
    this.approverInfo = this.vacationModal.locator('dt:has-text("Подтверждает"), dt:has-text("Approver")').first();

    // Days limitation warning
    this.daysLimitationWarning = this.vacationModal.locator('[class*="warning"], [class*="limitation"], [class*="alert"]').first();

    // Available days on page: "Доступно отпускных дней:" text
    this.availableDaysText = page.locator('text=/Доступно отпускных|Available vacation/i').first();

    // Event feed button and container
    this.eventFeedButton = page.getByRole('button', { name: /Лента|Event feed/i }).first();
    this.eventFeed = page.locator('[class*="event-feed"], [class*="eventFeed"], [class*="feed"]').first();

    // Tab filters (buttons)
    this.filterOpen = page.getByRole('button', { name: /Открытые|Open/i }).first();
    this.filterClosed = page.getByRole('button', { name: /Закрытые|Closed/i }).first();
    this.filterAll = page.getByRole('button', { name: /^Все$|^All$/i }).first();
    this.tabVacations = page.getByRole('button', { name: /Отпуска|Vacations/i }).first();
    this.tabDayoffs = page.getByRole('button', { name: /Выходные|Day offs/i }).first();

    // Transfer day-off
    this.transferDayOffButton = page.getByRole('button', { name: new RegExp(t('btn.transferDay'), 'i') }).first();
    this.transferModal = page.getByRole('dialog').first();
    this.transferFromDate = this.transferModal.getByRole('textbox').first();
    this.transferToDate = this.transferModal.getByRole('textbox').last();
    this.transferSubmitButton = this.transferModal.getByRole('button', { name: new RegExp(`${t('btn.save')}|${t('btn.transferDayAlt')}`, 'i') }).first();

    // Row actions
    this.deleteButton = page.getByRole('button', { name: new RegExp(t('btn.delete'), 'i') }).first();
    this.editButton = page.getByRole('button', { name: new RegExp(t('btn.edit'), 'i') }).first();

    // Alerts
    this.alertContainer = page.locator('.popup.popup_show, [role="alert"], .rc-notification').first();
    this.errorMessage = page.locator('[class*="error"], [class*="validation"], .popup.popup_show').first();
  }

  get url() { return '/vacation/my'; }

  /** Count data rows in vacation table (excluding header, empty state, total) */
  async getVacationCount(): Promise<number> {
    const isEmpty = await this.emptyState.isVisible().catch(() => false);
    if (isEmpty) return 0;

    // Count rows excluding "Нет данных" and "Всего" rows
    const allRows = await this.vacationItems.count();
    let dataRows = 0;
    for (let i = 0; i < allRows; i++) {
      const text = (await this.vacationItems.nth(i).textContent()) || '';
      if (!text.includes('Нет данных') && !text.includes('No data') && !text.includes('Всего') && !text.includes('Total')) {
        dataRows++;
      }
    }
    return dataRows;
  }

  /** Check if the table has actual data (not just "Нет данных") */
  async hasVacations(): Promise<boolean> {
    const isEmpty = await this.emptyState.isVisible().catch(() => false);
    return !isEmpty;
  }

  async openCreateForm() {
    await this.createVacationButton.click();
    await this.vacationModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Fill a date input by removing readonly attribute and typing the date value.
   * The input uses react-datetime (rdtPicker) which is readonly by default.
   * Format: DD.MM.YYYY (matching the placeholder "ДД.ММ.ГГГГ")
   */
  async fillDate(input: Locator, dateISO: string) {
    const target = new Date(dateISO + 'T12:00:00');
    const day = String(target.getDate()).padStart(2, '0');
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const year = target.getFullYear();
    const formatted = `${day}.${month}.${year}`;

    // Remove readonly attribute so we can type into the input
    await input.evaluate((el: HTMLInputElement) => {
      el.removeAttribute('readonly');
    });

    // Clear and type the date
    await input.click({ clickCount: 3 }); // select all
    await input.fill(formatted);

    // Close calendar popup by clicking elsewhere in the modal (e.g. on the form title)
    const title = this.vacationModal.locator('text=/Период|Period/i').first();
    if (await title.isVisible().catch(() => false)) {
      await title.click();
    }
    await this.page.waitForTimeout(300);
  }

  async createVacation(startDate: string, endDate: string, comment?: string) {
    await this.openCreateForm();
    await this.fillDate(this.dateStartInput, startDate);
    await this.fillDate(this.dateEndInput, endDate);
    if (comment) {
      await this.commentInput.fill(comment);
    }

    // Click submit — force: true in case button is temporarily disabled
    const isDisabled = await this.submitButton.isDisabled().catch(() => false);
    if (isDisabled) {
      // Wait for button to become enabled (dates may still be processing)
      await this.page.waitForTimeout(1000);
    }
    await this.submitButton.click({ timeout: 10000 }).catch(async () => {
      // If still disabled, force click
      await this.submitButton.click({ force: true });
    });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    // If modal is still open (validation error), close it
    const modalStillOpen = await this.vacationModal.isVisible().catch(() => false);
    if (modalStillOpen) {
      await this.cancelButton.click().catch(() => this.page.keyboard.press('Escape'));
      await this.page.waitForTimeout(500);
    }
  }

  /** Create a REGULAR vacation (paid, annual leave) */
  async createRegularVacation(startDate: string, endDate: string, paymentMonth?: string, comment?: string) {
    await this.openCreateForm();
    // Ensure unpaid checkbox is NOT checked (default = regular/paid)
    const checkboxVisible = await this.unpaidCheckbox.isVisible().catch(() => false);
    if (checkboxVisible && await this.unpaidCheckbox.isChecked().catch(() => false)) {
      await this.unpaidCheckbox.click();
      await this.page.waitForTimeout(200);
    }
    await this.fillDate(this.dateStartInput, startDate);
    await this.fillDate(this.dateEndInput, endDate);
    if (comment) {
      await this.commentInput.fill(comment);
    }
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    // If modal is still open (validation error), close it
    const modalStillOpen = await this.vacationModal.isVisible().catch(() => false);
    if (modalStillOpen) {
      await this.cancelButton.click().catch(() => this.page.keyboard.press('Escape'));
      await this.page.waitForTimeout(500);
    }
  }

  /** Create an ADMINISTRATIVE (unpaid) vacation */
  async createAdministrativeVacation(startDate: string, endDate: string, comment?: string) {
    await this.openCreateForm();
    await this.page.waitForTimeout(500);

    // Check the unpaid checkbox — try multiple approaches
    const checkboxVisible = await this.unpaidCheckbox.isVisible().catch(() => false);
    if (checkboxVisible) {
      const isChecked = await this.unpaidCheckbox.isChecked().catch(() => false);
      if (!isChecked) {
        await this.unpaidCheckbox.click();
        await this.page.waitForTimeout(300);
      }
    } else {
      // Fallback: click the label text "Без оплаты"
      const label = this.vacationModal.locator('text=/Без оплаты|Unpaid/i').first();
      if (await label.isVisible().catch(() => false)) {
        await label.click();
        await this.page.waitForTimeout(300);
      }
    }
    await this.fillDate(this.dateStartInput, startDate);
    await this.fillDate(this.dateEndInput, endDate);
    if (comment) {
      await this.commentInput.fill(comment);
    }
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    // If modal is still open (validation error), close it
    const modalStillOpen = await this.vacationModal.isVisible().catch(() => false);
    if (modalStillOpen) {
      await this.cancelButton.click().catch(() => this.page.keyboard.press('Escape'));
      await this.page.waitForTimeout(500);
    }
  }

  /** Get text content of a specific cell in the vacation table */
  async getTableCellText(row: number, col: number): Promise<string> {
    const cell = this.vacationItems.nth(row).locator('td').nth(col);
    return (await cell.textContent())?.trim() || '';
  }

  /** Get all column texts for a given row as array */
  async getRowCells(row: number): Promise<string[]> {
    const cells = this.vacationItems.nth(row).locator('td');
    const count = await cells.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await cells.nth(i).textContent())?.trim() || '');
    }
    return texts;
  }

  /** Get the available days text from the page header */
  async getAvailableDaysInfo(): Promise<string> {
    return (await this.availableDaysText.textContent())?.trim() || '';
  }

  /** Get the "Запрошено дней" text from the modal */
  async getRequestedDaysText(): Promise<string> {
    return (await this.requestedDaysInfo.textContent())?.trim() || '';
  }

  async clickVacation(index: number) {
    await this.vacationItems.nth(index).locator('td').first().click();
    await this.page.waitForTimeout(300);
  }

  async deleteVacation(index: number) {
    // Click on the second action button in the row to open the detail dialog
    // First button = edit, second button = detail/view (with delete inside)
    const row = this.vacationItems.nth(index);
    const actionBtn = row.locator('button').last();
    await actionBtn.click();
    await this.page.waitForTimeout(500);

    // Detail dialog "Подробнее о заявке" opens with "Удалить" and "Редактировать" buttons
    const detailDialog = this.page.getByRole('dialog').first();
    await detailDialog.waitFor({ state: 'visible', timeout: 5000 });

    // Click "Удалить" (Delete) button inside the detail dialog
    const deleteBtn = detailDialog.getByRole('button', { name: /Удалить|Delete/i }).first();
    await deleteBtn.click();
    await this.page.waitForTimeout(500);

    // Confirmation dialog "Удалить заявку?" appears with its own "Удалить" button
    // Wait for the confirmation dialog to appear (it's a separate dialog overlay)
    await this.page.waitForTimeout(500);
    const allDialogs = this.page.getByRole('dialog');
    const dialogCount = await allDialogs.count();

    // Find the confirmation dialog — it's the last one or the one with "Удалить заявку?" text
    for (let d = dialogCount - 1; d >= 0; d--) {
      const dlg = allDialogs.nth(d);
      const text = (await dlg.textContent()) || '';
      if (text.includes('Удалить заявку') || text.includes('Delete request')) {
        const confirmBtn = dlg.getByRole('button', { name: /Удалить|Delete/i }).first();
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
          break;
        }
      }
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    // Reload page to ensure fresh data
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
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
    this.monthHeaders = this.chartGrid.locator('th[colspan]');
    this.employeeRows = this.chartGrid.locator('tbody tr');
    this.eventSquares = this.chartGrid.locator('td[class*="absence"], td[class*="event"]');

    this.prevPeriodButton = page.locator('button:has(svg)').first();
    this.nextPeriodButton = page.locator('button:has(svg)').nth(1);
    this.periodLabel = page.locator('h2, h3, [class*="period"]').first();

    this.departmentFilter = page.locator('select').first();
    this.employeeFilter = page.locator('input[type="text"], input[placeholder]').first();

    this.legend = page.locator('[class*="legend"]').first();
    this.legendItems = this.legend.locator('span, li, [class*="item"]');

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

  async getPeriodLabelText(): Promise<string> {
    return (await this.periodLabel.textContent())?.trim() || '';
  }

  async goToPrevPeriod() {
    await this.prevPeriodButton.click();
    await this.page.waitForTimeout(500);
  }

  async goToNextPeriod() {
    await this.nextPeriodButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }
}

/**
 * Page Object for /vacation/request — Заявки сотрудников
 */
export class VacationRequestsPage extends BasePage {
  readonly requestTable: Locator;
  readonly requestItems: Locator;
  readonly emptyState: Locator;

  // Approval actions
  readonly approveButton: Locator;
  readonly rejectButton: Locator;

  // Reject modal
  readonly rejectModal: Locator;
  readonly rejectReasonInput: Locator;
  readonly rejectConfirmButton: Locator;

  // Checkboxes
  readonly selectAllCheckbox: Locator;
  readonly rowCheckboxes: Locator;

  // Filters
  readonly statusFilter: Locator;
  readonly departmentFilter: Locator;

  constructor(page: Page) {
    super(page);

    this.requestTable = page.locator('table:visible').first();
    this.requestItems = this.requestTable.locator('tbody tr');
    this.emptyState = page.locator('td:has-text("Нет данных"), td:has-text("No data")').first();

    this.approveButton = page.getByRole('button', { name: new RegExp(`${t('btn.approve')}|${t('btn.approveSelected')}|${t('btn.approveAll')}`, 'i') }).first();
    this.rejectButton = page.getByRole('button', { name: new RegExp(`${t('btn.reject')}|${t('btn.rejectSelected')}|${t('btn.rejectAll')}`, 'i') }).first();

    this.rejectModal = page.getByRole('dialog').first();
    this.rejectReasonInput = this.rejectModal.getByRole('textbox').first();
    this.rejectConfirmButton = this.rejectModal.getByRole('button', { name: new RegExp(`${t('btn.reject')}|${t('btn.confirm')}`, 'i') }).first();

    this.selectAllCheckbox = page.locator('thead input[type="checkbox"], th input[type="checkbox"]').first();
    this.rowCheckboxes = page.locator('tbody input[type="checkbox"], td input[type="checkbox"]');

    this.statusFilter = page.locator('select').first();
    this.departmentFilter = page.locator('select').nth(1);
  }

  get url() { return '/vacation/request'; }

  async getRequestCount(): Promise<number> {
    const isEmpty = await this.emptyState.isVisible().catch(() => false);
    if (isEmpty) return 0;
    return await this.requestItems.count();
  }

  /** Alias for backward compat */
  get requestList() { return this.requestTable; }

  async getRequestCellText(row: number, col: number): Promise<string> {
    const cell = this.requestItems.nth(row).locator('td').nth(col);
    return (await cell.textContent())?.trim() || '';
  }

  async getRequestRowCells(row: number): Promise<string[]> {
    const cells = this.requestItems.nth(row).locator('td');
    const count = await cells.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await cells.nth(i).textContent())?.trim() || '');
    }
    return texts;
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

    this.dataTable = page.locator('table').first();
    this.dataRows = this.dataTable.locator('tbody tr');
    this.searchInput = page.locator('input[type="text"], input[placeholder]').first();
    this.departmentFilter = page.locator('select').first();
    this.tooltip = page.locator('[class*="tooltip"], [role="tooltip"]').first();
  }

  get url() { return '/vacation/vacation-days'; }

  async getRowCount(): Promise<number> {
    await this.dataRows.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    return await this.dataRows.count();
  }

  async getCellText(row: number, col: number): Promise<string> {
    const cell = this.dataRows.nth(row).locator('td').nth(col);
    return (await cell.textContent())?.trim() || '';
  }

  async getRowCells(row: number): Promise<string[]> {
    const cells = this.dataRows.nth(row).locator('td');
    const count = await cells.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await cells.nth(i).textContent())?.trim() || '');
    }
    return texts;
  }

  async getCellNumber(row: number, col: number): Promise<number> {
    const text = await this.getCellText(row, col);
    const match = text.match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : NaN;
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
    this.periodFilter = page.locator('select').first();
    this.emptyState = page.locator('td:has-text("Нет данных"), td:has-text("No data")').first();
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

    this.form = page.locator('form').first();
    this.employeeSelect = page.locator('select').first();
    this.daysInput = page.locator('input[type="number"]').first();
    this.reasonInput = page.getByRole('textbox').first();
    this.submitButton = page.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).first();
    this.dataTable = page.locator('table:visible').first();
    this.dataRows = this.dataTable.locator('tbody tr');
  }

  get url() { return '/vacation/days-correction'; }

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }

  async getRowCells(row: number): Promise<string[]> {
    const cells = this.dataRows.nth(row).locator('td');
    const count = await cells.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await cells.nth(i).textContent())?.trim() || '');
    }
    return texts;
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
    this.searchInput = page.locator('input[type="text"], input[placeholder]').first();
    this.departmentFilter = page.locator('select').first();
    this.statusFilter = page.locator('select').nth(1);
    this.emptyState = page.locator('td:has-text("Нет данных"), td:has-text("No data")').first();
  }

  get url() { return '/vacation/sick-leaves-of-employees'; }

  async getRowCount(): Promise<number> {
    return await this.dataRows.count();
  }
}
