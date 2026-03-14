import { Page, Locator } from '@playwright/test';

export class NavigationComponent {
  readonly page: Page;
  readonly logo: Locator;
  readonly myTasksLink: Locator;
  readonly absenceCalendarButton: Locator;
  readonly approvalLink: Locator;
  readonly plannerLink: Locator;
  readonly statisticsButton: Locator;
  readonly adminButton: Locator;
  readonly accountingButton: Locator;
  readonly notificationsLink: Locator;
  readonly userMenuButton: Locator;
  readonly languageSwitcher: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole('button', { name: 'Новео ТТТ' });
    this.myTasksLink = page.getByRole('link', { name: 'Мои задачи' });
    this.absenceCalendarButton = page.getByRole('button', { name: /Календарь отсутствий/ });
    this.approvalLink = page.getByRole('link', { name: 'Подтверждение' });
    this.plannerLink = page.getByRole('link', { name: 'Планировщик' });
    this.statisticsButton = page.getByRole('button', { name: 'Статистика' });
    this.adminButton = page.getByRole('button', { name: 'Админка' });
    this.accountingButton = page.getByRole('button', { name: 'Бухгалтерия' });
    this.notificationsLink = page.getByRole('link', { name: 'Нотификации' });
    this.userMenuButton = page.getByRole('button', { name: /Павел Вайнмастер/ });
    this.languageSwitcher = page.locator('text=RU').first();
  }

  // --- Top-level navigation ---

  async navigateToMyTasks() {
    await this.myTasksLink.click();
  }

  async navigateToApproval() {
    await this.approvalLink.click();
  }

  async navigateToPlanner() {
    await this.plannerLink.click();
  }

  async navigateToNotifications() {
    await this.notificationsLink.click();
  }

  async navigateToCalendar() {
    await this.absenceCalendarButton.click();
  }

  async navigateToStatistics() {
    await this.statisticsButton.click();
  }

  async navigateToAdmin() {
    await this.adminButton.click();
  }

  async navigateToAccounting() {
    await this.accountingButton.click();
  }

  // --- Submenu helper ---

  private async openSubmenuAndClick(menuButton: Locator, itemText: string | RegExp) {
    await menuButton.click();
    await this.page.waitForTimeout(300);
    const item = this.page.locator(`a, button, [role="menuitem"]`).filter({ hasText: itemText }).first();
    await item.click();
    await this.page.waitForTimeout(300);
  }

  // --- Календарь отсутствий submenu ---

  async navigateToMyVacations() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, /Мои отпуска и выходные/);
  }

  async navigateToMySickLeaves() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, /Мои больничные/);
  }

  async navigateToAvailabilityChart() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, /График доступности/);
  }

  async navigateToVacationRequests() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, /Заявки сотрудников/);
  }

  async navigateToEmployeeVacationDays() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, /Отпускные дни сотрудников/);
  }

  async navigateToEmployeeSickLeaves() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, /Больничные листы сотрудников/);
  }

  // --- Статистика submenu ---

  async navigateToGeneralStatistics() {
    await this.openSubmenuAndClick(this.statisticsButton, /Общая статистика/);
  }

  async navigateToEmployeeReports() {
    await this.openSubmenuAndClick(this.statisticsButton, /Репорты сотрудников/);
  }

  // --- Админка submenu ---

  async navigateToAdminProjects() {
    await this.openSubmenuAndClick(this.adminButton, /Проекты/);
  }

  async navigateToAdminEmployees() {
    await this.openSubmenuAndClick(this.adminButton, /Сотрудники и подрядчики/);
  }

  async navigateToAdminSettings() {
    await this.openSubmenuAndClick(this.adminButton, /Параметры TTT/);
  }

  async navigateToAdminCalendar() {
    await this.openSubmenuAndClick(this.adminButton, /Производственные календари/);
  }

  async navigateToAdminApi() {
    await this.openSubmenuAndClick(this.adminButton, /^API$/);
  }

  async navigateToAdminExport() {
    await this.openSubmenuAndClick(this.adminButton, /Экспорт/);
  }

  // --- Бухгалтерия submenu ---

  async navigateToSalary() {
    await this.openSubmenuAndClick(this.accountingButton, /Заработная плата/);
  }

  async navigateToPeriodsChange() {
    await this.openSubmenuAndClick(this.accountingButton, /Изменение периодов/);
  }

  async navigateToVacationPayment() {
    await this.openSubmenuAndClick(this.accountingButton, /Выплата отпускных/);
  }

  async navigateToVacationDaysCorrection() {
    await this.openSubmenuAndClick(this.accountingButton, /Корректировка отпускных дней/);
  }

  async navigateToAccountingSickLeaves() {
    await this.openSubmenuAndClick(this.accountingButton, /Учет больничных листов/);
  }

  // --- User menu ---

  async switchLanguage() {
    await this.languageSwitcher.click();
  }

  async openUserMenu() {
    await this.userMenuButton.click();
  }

  async clickLogo() {
    await this.logo.click();
  }

  async logout() {
    await this.openUserMenu();
    const logoutItem = this.page.locator('text=/Выйти|Logout|выход/i').first();
    await logoutItem.click();
  }

  async navigateToAccount() {
    await this.openUserMenu();
    await this.page.waitForTimeout(300);
    const accountItem = this.page.locator('text=/Настройки|Account|Учётная запись/i').first();
    await accountItem.click();
  }

  // --- Submenu visibility checks ---

  async isSubmenuOpen(menuButton: Locator): Promise<boolean> {
    await menuButton.click();
    await this.page.waitForTimeout(300);
    const dropdown = this.page.locator('[class*="dropdown"], [class*="submenu"], [role="menu"]').first();
    const visible = await dropdown.isVisible().catch(() => false);
    if (visible) {
      await this.page.keyboard.press('Escape');
    }
    return visible;
  }

  async getSubmenuItems(menuButton: Locator): Promise<string[]> {
    await menuButton.click();
    await this.page.waitForTimeout(300);
    const items = this.page.locator('[class*="dropdown"] a, [class*="submenu"] a, [role="menu"] a, [role="menuitem"]');
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && text.trim()) texts.push(text.trim());
    }
    await this.page.keyboard.press('Escape');
    return texts;
  }
}
