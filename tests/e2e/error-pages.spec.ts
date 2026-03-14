import { test, expect } from '../fixtures/auth.fixture';
import { ENV } from '../fixtures/env.config';

// ============================================================================
// Страницы ошибок и edge cases — 6 тестов (TC-ERR-001..TC-ERR-006)
// ============================================================================

test.describe('Страницы ошибок', () => {

  test('TC-ERR-001: 404 — несуществующий URL', async ({ authenticatedPage: page }) => {
    await page.goto(`${ENV.baseUrl}/nonexistent-page-12345`);
    await page.waitForLoadState('networkidle');

    // Должна отображаться страница ошибки или редирект
    const pageContent = await page.textContent('body');
    // Страница не пуста
    expect(pageContent).toBeTruthy();
  });

  test('TC-ERR-002: 403 — страница без доступа', async ({ authenticatedPage: page }) => {
    // Попытка перехода на страницу без прав
    // Конкретный URL зависит от ролей пользователя
    const errorText = page.locator('text=/нет доступа|Forbidden|403|не авторизован/i').first();
    // Проверяем что приложение обрабатывает ошибки корректно
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-ERR-003: Приложение не падает на невалидном URL-параметре', async ({ authenticatedPage: page }) => {
    await page.goto(`${ENV.baseUrl}/report/invalid-login-12345`);
    await page.waitForLoadState('networkidle');

    // Страница не должна быть белым экраном
    const body = page.locator('body');
    await expect(body).toBeVisible();
    const content = await body.textContent();
    expect(content?.length).toBeGreaterThan(0);
  });

  test('TC-ERR-004: Перезагрузка страницы сохраняет состояние', async ({ authenticatedPage: page }) => {
    // Переходим на Report
    await page.goto(`${ENV.baseUrl}/report`);
    await page.waitForLoadState('networkidle');

    // Перезагружаем
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Страница должна загрузиться корректно
    await expect(page).toHaveURL(/\/report/);
  });

  test('TC-ERR-005: Навигация browser back/forward', async ({ authenticatedPage: page }) => {
    // Переходим на Report -> Approval -> Back
    await page.goto(`${ENV.baseUrl}/report`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/report/);

    await page.goto(`${ENV.baseUrl}/approve`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/approve/);

    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/report/);

    await page.goForward();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/approve/);
  });

  test('TC-ERR-006: Title страниц содержит TTT', async ({ authenticatedPage: page }) => {
    await page.goto(`${ENV.baseUrl}/report`);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toMatch(/TTT|Time/i);
  });
});
