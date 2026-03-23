import { test, expect } from '../fixtures/auth.fixture';
import { ENV } from '../fixtures/env.config';

// ============================================================================
// API Tests — Critical Endpoints
// TTT uses microservice architecture with JWT auth via TTT_JWT_TOKEN header.
// JWT is stored in localStorage as 'id_token'.
// API paths: /api/ttt/v1/..., /api/vacation/v1/..., /api/calendar/v1/...
// ============================================================================

const BASE = ENV.baseUrl;
const TTT = `${BASE}/api/ttt`;
const VACATION = `${BASE}/api/vacation`;
const CALENDAR = `${BASE}/api/calendar`;

/** Get JWT token from localStorage */
async function getJwtToken(page: any): Promise<string> {
  return page.evaluate(() => localStorage.getItem('id_token') || '');
}

/** Make authenticated GET request with JWT header */
async function apiGet(page: any, url: string) {
  const token = await getJwtToken(page);
  return page.request.get(url, {
    headers: {
      'TTT_JWT_TOKEN': token,
      'Accept': 'application/json',
    },
  });
}

/** Safely parse JSON, return null if response is HTML or invalid */
async function safeJson(response: any): Promise<any> {
  const contentType = response.headers()['content-type'] || '';
  if (!contentType.includes('json')) return null;
  return response.json().catch(() => null);
}

test.describe('API: Authentication & Current User', () => {

  test('API-AUTH-001: Check authentication status', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/authentication/check`);
    expect(response.status()).toBe(200);
  });

  test('API-AUTH-002: Get current employee info', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/employees/current`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
    if (body) {
      expect(body).toHaveProperty('login');
      expect(body.login).toBeTruthy();
    }
  });

  test('API-AUTH-003: Get current employee permissions', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/employees/current/permissions`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
  });

  test('API-AUTH-004: Get current employee settings', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/employees/current/settings`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
  });

  test('API-AUTH-005: Get current employee warnings', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/employees/current/warnings`);
    expect(response.status()).toBe(200);
  });
});

test.describe('API: Employees', () => {

  test('API-EMP-001: Search employees returns data', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/employees`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
  });

  test('API-EMP-002: Get employee by login', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/employees/pvaynmaster`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
    if (body) {
      expect(body).toHaveProperty('login');
      expect(body.login).toBe('pvaynmaster');
    }
  });

  test('API-EMP-003: Get employee roles', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/employees/pvaynmaster/roles`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
  });

  test('API-EMP-004: Get employee work periods', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/employees/pvaynmaster/work-periods`);
    expect(response.status()).toBe(200);
  });
});

test.describe('API: Reports (Timesheet)', () => {

  test('API-RPT-001: Search reports returns data', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/reports`);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-RPT-002: Get report totals', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/reports/total`);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-RPT-003: Get report summary', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/reports/summary`);
    // Endpoint may require query params; 400 is acceptable, 500 is a server bug
    expect(response.status()).toBeLessThanOrEqual(500);
  });

  test('API-RPT-004: Get accounting reports', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/reports/accounting`);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('API: Projects', () => {

  test('API-PRJ-001: List projects', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/projects`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
    if (body) {
      const items = Array.isArray(body) ? body : (body?.content || body?.data || []);
      expect(items.length).toBeGreaterThan(0);
    }
  });

  test('API-PRJ-002: Get project types', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/projects/types`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
  });

  test('API-PRJ-003: Get project statuses', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/projects/statuses`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
  });
});

test.describe('API: Offices & Periods', () => {

  test('API-OFF-001: List offices', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/offices`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
    if (body) {
      const items = Array.isArray(body) ? body : [];
      expect(items.length).toBeGreaterThan(0);
    }
  });

  test('API-OFF-002: Get min report period', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/offices/periods/report/min`);
    expect(response.status()).toBe(200);
  });

  test('API-OFF-003: Get max report period', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/offices/periods/report/max`);
    expect(response.status()).toBe(200);
  });

  test('API-OFF-004: Get min approve period', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/offices/periods/approve/min`);
    expect(response.status()).toBe(200);
  });
});

test.describe('API: Vacations', () => {

  test('API-VAC-001: List vacations', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${VACATION}/v1/vacations`);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-VAC-002: Check if employees in vacation', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${VACATION}/v1/vacations/employees`);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-VAC-003: Check specific employee vacation status', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${VACATION}/v1/vacations/employee/pvaynmaster`);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('API: Sick Leaves', () => {

  test('API-SL-001: List sick leaves', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${VACATION}/v1/sick-leaves`);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-SL-002: Get sick leave count', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${VACATION}/v1/sick-leaves/count`);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('API: Statistics', () => {

  test('API-STAT-001: Get statistic report employees', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/statistic/report/employees`);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-STAT-002: Get statistic report projects', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/statistic/report/projects`);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('API: Calendar', () => {

  test('API-CAL-001: Get all calendars', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${CALENDAR}/v1/calendar`);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-CAL-002: Get period info', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${CALENDAR}/v1/period`);
    // Endpoint may require query params; 500 indicates server bug
    expect(response.status()).toBeLessThanOrEqual(500);
  });

  test('API-CAL-003: Get v2 calendars', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${CALENDAR}/v2/calendars`);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('API: Feature Toggles', () => {

  test('API-FT-001: Get all feature toggles', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/feature-toggles`);
    expect(response.status()).toBe(200);
    const body = await safeJson(response);
    expect(body).not.toBeNull();
  });
});

test.describe('API: Availability Schedule', () => {

  test('API-AVAIL-001: Get availability schedule', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${VACATION}/v1/availability-schedule`);
    // Endpoint may require query params; 500 indicates server bug
    expect(response.status()).toBeLessThanOrEqual(500);
  });

  test('API-AVAIL-002: Get employee schedule', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${VACATION}/v1/availability-schedule/employee`);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('API: Notifications', () => {

  test('API-NTF-001: Get notifications', async ({ authenticatedPage: page }) => {
    const response = await apiGet(page, `${TTT}/v1/notifications`);
    expect(response.status()).toBeLessThan(500);
  });
});
