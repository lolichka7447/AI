import { test, expect } from '../fixtures/auth.fixture';
import { ENV } from '../fixtures/env.config';
import { t, tRegex } from '../i18n';

// ============================================================================
// FAQ Deep Tests — 2 tests (TC-FAQ-010..TC-FAQ-011)
// ============================================================================

test.describe('TC-FAQ: FAQ Deep Tests', () => {

  test('TC-FAQ-010: FAQ page loads with content', async ({ authenticatedPage: page }) => {
    // Navigate to FAQ page
    await page.goto(`${ENV.baseUrl}/faq`);
    await page.waitForLoadState('networkidle');

    // Page should have content
    const pageContent = page.locator('.page-content, main, article, [class*="faq"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });

    // Should have text content (not empty)
    const text = await pageContent.textContent().catch(() => '');
    expect(text!.length).toBeGreaterThan(0);
  });

  test('TC-FAQ-011: FAQ sections or search', async ({ authenticatedPage: page }) => {
    await page.goto(`${ENV.baseUrl}/faq`);
    await page.waitForLoadState('networkidle');

    // Look for navigable sections (headings, links, accordion items)
    const sections = page.locator('h2, h3, [class*="section"], [class*="accordion"], details, summary');
    const sectionCount = await sections.count();

    // Look for search input
    const searchInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], input[type="search"]`).first();
    const hasSearch = await searchInput.isVisible().catch(() => false);

    // FAQ should have either sections or search
    expect(sectionCount > 0 || hasSearch).toBe(true);
  });
});
