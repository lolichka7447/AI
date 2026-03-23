import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { getLocale } from './i18n';

const AUTH_STATE_PATH = path.resolve(__dirname, '../.auth/state.json');
const BASE_URL = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';
const TARGET_LOCALE = getLocale(); // 'ru' | 'en'

setup('authenticate via CAS', async ({ page }) => {
  setup.setTimeout(120000);
  await page.goto(BASE_URL, { timeout: 60000, waitUntil: 'networkidle' });

  // TTT login page — enter username and click LOGIN
  const loginInput = page.locator('#username, .login-page input').first();
  if (await loginInput.isVisible({ timeout: 10000 })) {
    await loginInput.fill(process.env.TEST_USER_LOGIN || 'pvaynmaster');

    // Password field may or may not exist
    const passwordField = page.locator('#password');
    if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordField.fill(process.env.TEST_USER_PASSWORD || 'pvaynmaster');
    }

    await page.locator('button:has-text("LOGIN"), button[type="submit"]').first().click();

    // Wait for CAS redirect chain to complete
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // If on CAS page, authenticate there too
  if (page.url().includes('cas')) {
    await page.locator('#username').fill(process.env.TEST_USER_LOGIN || 'pvaynmaster');
    await page.locator('#password').fill(process.env.TEST_USER_PASSWORD || 'pvaynmaster');
    await page.locator('button[type="submit"], input[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // Verify the app loaded
  await page.locator('nav, .navbar, .page-header').first().waitFor({ state: 'visible', timeout: 15000 });

  // Switch language to match LOCALE env var
  const targetLang = TARGET_LOCALE.toUpperCase(); // 'RU' or 'EN'
  const langSwitcher = page.locator('.language-switcher').first();
  const langText = (await langSwitcher.textContent().catch(() => '')).trim();
  console.log('Language switcher text:', langText, '| target:', targetLang);

  // Switcher shows current UI language — if it doesn't match target, switch
  if (langText && langText !== targetLang) {
    await langSwitcher.click();
    await page.waitForTimeout(500);
    // Dropdown: <li class="drop-down-menu__option">RU</li>
    const targetOption = page.locator(`li.drop-down-menu__option >> text="${targetLang}"`).first();
    if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetOption.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      console.log('Switched language to', targetLang);
    } else {
      console.log('Target language option not found in dropdown');
    }
  } else {
    console.log('Language already matches target, no switch needed');
  }

  console.log('Auth setup done, URL:', page.url());
  // Log navbar text to verify language
  const navText = await page.locator('.navbar').first().textContent().catch(() => '');
  console.log('Navbar text:', navText?.substring(0, 200));

  // Save auth state
  const dir = path.dirname(AUTH_STATE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
