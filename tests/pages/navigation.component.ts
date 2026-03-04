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
}
