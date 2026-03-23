import { test as base, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.resolve(__dirname, '../../.auth/state.json');
const BASE_URL = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';

async function casLogin(page: Page) {
  await page.goto(BASE_URL);

  // TTT login page — enter username and click LOGIN
  const loginInput = page.locator('#username, .login-page input').first();
  if (await loginInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await loginInput.fill(process.env.TEST_USER_LOGIN || 'pvaynmaster');
    const passwordField = page.locator('#password');
    if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordField.fill(process.env.TEST_USER_PASSWORD || 'pvaynmaster');
    }
    await page.locator('button:has-text("LOGIN"), button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // If redirected to CAS, authenticate there too
  if (page.url().includes('cas')) {
    await page.locator('#username').fill(
      process.env.TEST_USER_LOGIN || 'pvaynmaster'
    );
    await page.locator('#password').fill(
      process.env.TEST_USER_PASSWORD || 'pvaynmaster'
    );
    await page.locator('button[type="submit"], input[type="submit"]').first().click();
    await page.waitForURL('**/report**', { timeout: 15000 });
  }
}

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // storageState is loaded via playwright.config.ts for 'e2e' project
    await page.goto(BASE_URL);

    // Fallback: if state expired, re-login
    if (page.url().includes('cas')) {
      await casLogin(page);
      const dir = path.dirname(AUTH_STATE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await page.context().storageState({ path: AUTH_STATE_PATH });
    }

    await use(page);
  },
});

/**
 * Login as a specific user by username.
 * TTT QA env uses login-only auth (no password).
 * Use with a fresh browser context or after logout.
 */
export async function loginAsUser(page: Page, login: string) {
  const baseUrl = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';
  await page.goto(baseUrl);

  // Wait for login form
  const loginInput = page.locator('#username, .login-page input').first();
  if (await loginInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await loginInput.fill(login);

    const passwordField = page.locator('#password');
    if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordField.fill(login);
    }

    await page.locator('button:has-text("LOGIN"), button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // Handle CAS redirect if needed
  if (page.url().includes('cas')) {
    await page.locator('#username').fill(login);
    await page.locator('#password').fill(login);
    await page.locator('button[type="submit"], input[type="submit"]').first().click();
    await page.waitForURL('**/report**', { timeout: 15000 });
  }
}

export { expect };
