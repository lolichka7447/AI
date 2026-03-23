import { test, expect } from '@playwright/test';
import { CasLoginPage } from '../pages/cas-login.page';
import { ENV } from '../fixtures/env.config';

test.describe('TC-AUTH: Авторизация через CAS', () => {

  test('TC-AUTH-001: Успешный вход с валидными данными', async ({ page }) => {
    await page.goto(ENV.baseUrl);
    const casLogin = new CasLoginPage(page);

    await casLogin.login(ENV.testUser.login, ENV.testUser.password);
    await page.waitForURL('**/report**', { timeout: 15000 });

    await expect(page).toHaveTitle(/TTT/);
    await expect(page).toHaveURL(/\/report/);
  });

  test('TC-AUTH-002: Редирект на CAS при неавторизованном доступе', async ({ page }) => {
    await page.goto(ENV.baseUrl);

    await expect(page).toHaveURL(/cas/);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('TC-AUTH-003: Ошибка при неверных учётных данных', async ({ page }) => {
    await page.goto(ENV.baseUrl);
    const casLogin = new CasLoginPage(page);

    await casLogin.login('invalid_user', 'wrong_password');

    // Should stay on CAS login page with error
    await expect(page).toHaveURL(/cas/);
    await expect(page.locator('.alert, .error, .errors, #msg, .login-error').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-004: Поле пароля маскировано по умолчанию', async ({ page }) => {
    await page.goto(ENV.baseUrl);

    const passwordField = page.locator('#password');
    await expect(passwordField).toBeVisible();
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('TC-AUTH-005: Кнопка показа пароля работает', async ({ page }) => {
    await page.goto(ENV.baseUrl);

    const passwordField = page.locator('#password');
    await expect(passwordField).toBeVisible();

    // Toggle password button — matches both English and Russian CAS
    const toggleButton = page.getByRole('button', { name: /Toggle Password/i });

    await expect(passwordField).toHaveAttribute('type', 'password');
    await toggleButton.click();
    await expect(passwordField).toHaveAttribute('type', 'text');
  });
});
