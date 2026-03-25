import { APIRequestContext } from '@playwright/test';
import { request as playwrightRequest } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';
const API_SECRET_TOKEN = process.env.TTT_API_TOKEN || process.env.API_SECRET_TOKEN || 'fa76f791-7097-42a8-b57d-d06143c19a6f';
const CLOCK_URL = `${BASE_URL}/api/ttt/v1/test/clock`;

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'accept': 'application/json',
  'API_SECRET_TOKEN': API_SECRET_TOKEN,
};

/**
 * Set server time via TTT Clock API.
 * Endpoint: PATCH /api/ttt/v1/test/clock
 * Auth: API_SECRET_TOKEN header
 *
 * IMPORTANT: Always reset time in afterAll to avoid affecting other tests.
 */
export async function setServerTime(
  request: APIRequestContext,
  dateISO: string,
): Promise<void> {
  const response = await request.patch(CLOCK_URL, {
    data: { time: dateISO },
    headers: AUTH_HEADERS,
  });
  if (!response.ok()) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to set server time: ${response.status()} ${response.statusText()} ${body}`);
  }
}

/**
 * Reset server time to real current time.
 * Endpoint: POST /api/ttt/v1/test/clock/reset
 * MUST be called after every timemachine test to restore normal server operation.
 */
export async function resetServerTime(
  request: APIRequestContext,
): Promise<void> {
  const response = await request.post(`${CLOCK_URL}/reset`, {
    headers: AUTH_HEADERS,
  });
  if (!response.ok()) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to reset server time: ${response.status()} ${response.statusText()} ${body}`);
  }
}

/**
 * Get the current server time (real or overridden).
 */
export async function getServerTime(
  request: APIRequestContext,
): Promise<string> {
  const response = await request.get(CLOCK_URL, {
    headers: AUTH_HEADERS,
  });
  if (!response.ok()) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to get server time: ${response.status()} ${response.statusText()} ${body}`);
  }
  const data = await response.json();
  return data.time || data.dateTime || JSON.stringify(data);
}

/**
 * Create a standalone API request context for timemachine operations.
 * Use this in beforeAll/afterAll where page context may not be available.
 */
export async function createTimemachineContext(): Promise<APIRequestContext> {
  return await playwrightRequest.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: AUTH_HEADERS,
  });
}

/**
 * Re-login after time change. Changing server time invalidates the session,
 * so the user gets redirected to login page.
 */
export async function reLoginAfterTimeChange(page: import('@playwright/test').Page): Promise<void> {
  const baseUrl = BASE_URL;

  // Clear cookies so the server doesn't see stale session
  await page.context().clearCookies();
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Try multiple selectors — TTT login page may not have #username
  const loginInput = page.locator('#username').or(page.locator('.login-page input')).or(page.getByRole('textbox')).first();
  if (await loginInput.isVisible({ timeout: 10000 }).catch(() => false)) {
    await loginInput.fill(process.env.TEST_USER_LOGIN || 'pvaynmaster');
    const passwordField = page.locator('#password');
    if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordField.fill(process.env.TEST_USER_PASSWORD || 'pvaynmaster');
    }
    await page.locator('button:has-text("LOGIN"), button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // If redirected to CAS, authenticate there too
  if (page.url().includes('cas')) {
    await page.locator('#username').fill(process.env.TEST_USER_LOGIN || 'pvaynmaster');
    await page.locator('#password').fill(process.env.TEST_USER_PASSWORD || 'pvaynmaster');
    await page.locator('button[type="submit"], input[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // Verify the app loaded (navbar visible)
  await page.locator('nav, .navbar, .page-header').first().waitFor({ state: 'visible', timeout: 15000 });
}
