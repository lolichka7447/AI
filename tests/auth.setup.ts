import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.resolve(__dirname, '../.auth/state.json');
const BASE_URL = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';

setup('authenticate via CAS', async ({ page }) => {
  await page.goto(BASE_URL);

  // CAS redirects to login page
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

  // Save auth state
  const dir = path.dirname(AUTH_STATE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
