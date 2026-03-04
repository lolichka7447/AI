import { test as base, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.resolve(__dirname, '../../.auth/state.json');
const BASE_URL = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';

async function casLogin(page: Page) {
  await page.goto(BASE_URL);
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

export { expect };
