import { Page, Locator } from '@playwright/test';
import { t } from '../i18n';

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

    // Logo — top-left link/image
    this.logo = page.locator('a.navbar__logo, .navbar__logo, a[href="/"]').first();

    // Top-level nav links (NavLink renders <a class="navbar__link">)
    this.myTasksLink = page.locator('a.navbar__link, a.navbar__link--page-open').filter({ hasText: new RegExp(t('nav.myTasks'), 'i') }).first()
      .or(page.getByRole('link', { name: new RegExp(t('nav.myTasks'), 'i') }));

    this.approvalLink = page.locator('a.navbar__link, a.navbar__link--page-open').filter({ hasText: new RegExp(t('nav.approval'), 'i') }).first()
      .or(page.getByRole('link', { name: new RegExp(t('nav.approval'), 'i') }));

    this.plannerLink = page.locator('a.navbar__link, a.navbar__link--page-open').filter({ hasText: new RegExp(t('nav.planner'), 'i') }).first()
      .or(page.getByRole('link', { name: new RegExp(t('nav.planner'), 'i') }));

    this.notificationsLink = page.locator('a.navbar__link, a.navbar__link--page-open').filter({ hasText: new RegExp(t('nav.notifications'), 'i') }).first()
      .or(page.getByRole('link', { name: new RegExp(t('nav.notifications'), 'i') }));

    // Dropdown parent buttons (<button class="navbar__item">)
    this.absenceCalendarButton = page.locator('button.navbar__item').filter({ hasText: new RegExp(t('nav.absenceCalendar'), 'i') }).first()
      .or(page.getByRole('button', { name: new RegExp(t('nav.absenceCalendar')) }));

    this.statisticsButton = page.locator('button.navbar__item').filter({ hasText: new RegExp(t('nav.statistics'), 'i') }).first()
      .or(page.getByRole('button', { name: new RegExp(t('nav.statistics')) }));

    this.adminButton = page.locator('button.navbar__item').filter({ hasText: new RegExp(t('nav.admin'), 'i') }).first()
      .or(page.getByRole('button', { name: new RegExp(t('nav.admin')) }));

    this.accountingButton = page.locator('button.navbar__item').filter({ hasText: new RegExp(t('nav.accounting'), 'i') }).first()
      .or(page.getByRole('button', { name: new RegExp(t('nav.accounting')) }));

    // User block — button with user photo and name
    this.userMenuButton = page.locator('button.navbar__user, button.navbar__item').filter({ has: page.locator('.navbar__user-name') }).first()
      .or(page.locator('.navbar__user-info button').first());

    // Language switcher — span.navbar__link inside LanguageSwitcher
    this.languageSwitcher = page.locator('.navbar__info span.navbar__link').first()
      .or(page.locator('text=RU').first());
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
    // Wait for dropdown to appear (BEM: navbar__list-drop inside navbar__list-drop--open)
    const dropdown = this.page.locator('.navbar__list-drop').first();
    await dropdown.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    // Find item by text in dropdown link text spans
    const item = this.page.locator('.navbar__list-drop-link-text, .navbar__list-drop-link, a.navbar__link')
      .filter({ hasText: itemText }).first();
    await item.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Календарь отсутствий submenu ---

  async navigateToMyVacations() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, new RegExp(t('nav.myVacations')));
  }

  async navigateToMySickLeaves() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, new RegExp(t('nav.mySickLeaves')));
  }

  async navigateToAvailabilityChart() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, new RegExp(t('nav.availabilityChart')));
  }

  async navigateToVacationRequests() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, new RegExp(t('nav.vacationRequests')));
  }

  async navigateToEmployeeVacationDays() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, new RegExp(t('nav.employeeVacationDays')));
  }

  async navigateToEmployeeSickLeaves() {
    await this.openSubmenuAndClick(this.absenceCalendarButton, new RegExp(t('nav.employeeSickLeaves')));
  }

  // --- Статистика submenu ---

  async navigateToGeneralStatistics() {
    await this.openSubmenuAndClick(this.statisticsButton, new RegExp(t('nav.generalStatistics')));
  }

  async navigateToEmployeeReports() {
    await this.openSubmenuAndClick(this.statisticsButton, new RegExp(t('nav.employeeReports')));
  }

  // --- Админка submenu ---

  async navigateToAdminProjects() {
    await this.openSubmenuAndClick(this.adminButton, new RegExp(t('nav.adminProjects')));
  }

  async navigateToAdminEmployees() {
    await this.openSubmenuAndClick(this.adminButton, new RegExp(t('nav.adminEmployees')));
  }

  async navigateToAdminSettings() {
    await this.openSubmenuAndClick(this.adminButton, new RegExp(t('nav.adminSettings')));
  }

  async navigateToAdminCalendar() {
    await this.openSubmenuAndClick(this.adminButton, new RegExp(t('nav.adminCalendar')));
  }

  async navigateToAdminApi() {
    await this.openSubmenuAndClick(this.adminButton, /^API$/);
  }

  async navigateToAdminExport() {
    await this.openSubmenuAndClick(this.adminButton, new RegExp(t('nav.adminExport')));
  }

  // --- Бухгалтерия submenu ---

  async navigateToSalary() {
    await this.openSubmenuAndClick(this.accountingButton, new RegExp(t('nav.salary')));
  }

  async navigateToPeriodsChange() {
    await this.openSubmenuAndClick(this.accountingButton, new RegExp(t('nav.periodsChange')));
  }

  async navigateToVacationPayment() {
    await this.openSubmenuAndClick(this.accountingButton, new RegExp(t('nav.vacationPayment')));
  }

  async navigateToVacationDaysCorrection() {
    await this.openSubmenuAndClick(this.accountingButton, new RegExp(t('nav.vacationDaysCorrection')));
  }

  async navigateToAccountingSickLeaves() {
    await this.openSubmenuAndClick(this.accountingButton, new RegExp(t('nav.accountingSickLeaves')));
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
    // User dropdown: ul.navbar__list-drop.navbar__list-exit > li > a
    const logoutItem = this.page.locator('.navbar__list-exit .navbar__list-drop-link-text, .navbar__list-exit a')
      .filter({ hasText: new RegExp(t('nav.logout'), 'i') }).first()
      .or(this.page.locator('text=' + new RegExp(t('nav.logout'), 'i')).first());
    await logoutItem.click();
  }

  async navigateToAccount() {
    // Account link is directly in navbar: a[href="/admin/account"]
    const accountLink = this.page.locator('a[href="/admin/account"]').first();
    if (await accountLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await accountLink.click();
    } else {
      // Fallback: try user menu dropdown
      await this.openUserMenu();
      await this.page.waitForTimeout(300);
      const accountItem = this.page.locator('a[href*="account"], .navbar__list-drop a')
        .filter({ hasText: new RegExp(t('nav.account') + '|' + t('nav.accountAlt'), 'i') }).first();
      await accountItem.click();
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Submenu visibility checks ---

  async isSubmenuOpen(menuButton: Locator): Promise<boolean> {
    await menuButton.click();
    await this.page.waitForTimeout(300);
    // Check if parent li has navbar__list-drop--open class
    const openDropdown = this.page.locator('.navbar__list-drop--open .navbar__list-drop').first()
      .or(this.page.locator('[role="menu"]').first());
    const visible = await openDropdown.isVisible().catch(() => false);
    if (visible) {
      await this.page.keyboard.press('Escape');
    }
    return visible;
  }

  async getSubmenuItems(menuButton: Locator): Promise<string[]> {
    await menuButton.click();
    await this.page.waitForTimeout(300);
    const items = this.page.locator('.navbar__list-drop--open .navbar__list-drop-link-text')
      .or(this.page.locator('.navbar__list-drop--open a'));
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
