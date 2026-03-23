import { test, expect } from '../fixtures/auth.fixture';
import { test as base } from '@playwright/test';
import { PlannerPage } from '../pages/planner.page';
import { NavigationComponent } from '../pages/navigation.component';
import { ENV, TEST_USERS } from '../fixtures/env.config';
import { loginAsUser } from '../fixtures/auth.fixture';
import { t, tRegex } from '../i18n';

// ============================================================================
// Planner Deep Tests — 3 tests (TC-PLN-050..TC-PLN-060)
// ============================================================================

test.describe('TC-PLN: Planner Deep Tests (chief_officer)', () => {

  test('TC-PLN-050: Planner page loads with tabs', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToPlanner();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/planner/);

    // Check planner tabs (Projects / Tasks / Tickets)
    const projectsTab = page.locator('.main-tabs__item').filter({ hasText: tRegex('tab.projects') }).first();
    const tasksTab = page.locator('.main-tabs__item').filter({ hasText: tRegex('tab.tasks') }).first();

    const hasProjTab = await projectsTab.isVisible().catch(() => false);
    const hasTasksTab = await tasksTab.isVisible().catch(() => false);

    expect(hasProjTab || hasTasksTab).toBe(true);
  });

  test('TC-PLN-051: Planner tab switching', async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToPlanner();
    await page.waitForLoadState('networkidle');

    // Try switching tabs
    const tabs = page.locator('.main-tabs__item');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Click each tab
    for (let i = 0; i < Math.min(tabCount, 3); i++) {
      await tabs.nth(i).click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(500);
    }

    // Page should still be planner
    await expect(page).toHaveURL(/\/planner/);
  });
});

base.describe('TC-PLN: Role-Based Planner Access', () => {

  base('TC-PLN-060: Tech Lead access to planner', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.tech_lead.login);
    await page.waitForLoadState('networkidle');

    const nav = new NavigationComponent(page);
    const plannerVisible = await nav.plannerLink.isVisible().catch(() => false);
    expect(plannerVisible).toBe(true);

    if (plannerVisible) {
      await nav.navigateToPlanner();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/planner/);

      // Content should load
      const pageContent = page.locator('.page-content, main, table:visible, [class*="planner"]').first();
      await expect(pageContent).toBeVisible({ timeout: 10000 });
    }
  });
});
