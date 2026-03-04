import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CasLoginPage extends BasePage {
  readonly loginInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly togglePasswordButton: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.loginInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    this.togglePasswordButton = page.getByRole('button', { name: 'Toggle Password' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot your password?' });
  }

  get url() { return 'https://cas-demo.noveogroup.com/login'; }

  async login(login: string, password: string) {
    await this.loginInput.fill(login);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async isVisible(): Promise<boolean> {
    return this.page.url().includes('cas');
  }
}
