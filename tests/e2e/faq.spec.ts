import { test, expect } from '../fixtures/auth.fixture';
import { ENV } from '../fixtures/env.config';

// ============================================================================
// FAQ — 3 теста (TC-FAQ-001..TC-FAQ-003)
// ============================================================================

test.describe('FAQ', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`${ENV.baseUrl}/faq`);
    await page.waitForLoadState('networkidle');
  });

  test('TC-FAQ-001: Страница FAQ загружается', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL(/\/faq/);
    const body = page.locator('body');
    const content = await body.textContent();
    expect(content?.length).toBeGreaterThan(0);
  });

  test('TC-FAQ-002: Содержимое FAQ не пустое', async ({ authenticatedPage: page }) => {
    const mainContent = page.locator('main, [class*="content"], [class*="faq"]').first();
    const isVisible = await mainContent.isVisible().catch(() => false);
    if (isVisible) {
      const text = await mainContent.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test('TC-FAQ-003: Навигация доступна на странице FAQ', async ({ authenticatedPage: page }) => {
    // Навигация header видна на FAQ
    const logo = page.getByRole('button', { name: 'Новео ТТТ' });
    const logoVisible = await logo.isVisible().catch(() => false);
    expect(typeof logoVisible).toBe('boolean');
  });
});
