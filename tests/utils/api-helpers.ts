import { Page, APIResponse } from '@playwright/test';
import { ENV } from '../fixtures/env.config';

const BASE = ENV.baseUrl;
const TTT_API = `${BASE}/api/ttt`;
const VACATION_API = `${BASE}/api/vacation`;

/** Get JWT token from localStorage */
export async function getJwtToken(page: Page): Promise<string> {
  return page.evaluate(() => localStorage.getItem('id_token') || '');
}

/** Common headers for authenticated API requests */
async function authHeaders(page: Page): Promise<Record<string, string>> {
  const token = await getJwtToken(page);
  return {
    'TTT_JWT_TOKEN': token,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

/** Authenticated GET request */
export async function apiGet(page: Page, url: string): Promise<APIResponse> {
  const headers = await authHeaders(page);
  return page.request.get(url, { headers });
}

/** Authenticated POST request */
export async function apiPost(page: Page, url: string, data?: any): Promise<APIResponse> {
  const headers = await authHeaders(page);
  return page.request.post(url, { headers, data });
}

/** Authenticated PATCH request */
export async function apiPatch(page: Page, url: string, data?: any): Promise<APIResponse> {
  const headers = await authHeaders(page);
  return page.request.patch(url, { headers, data });
}

/** Authenticated DELETE request */
export async function apiDelete(page: Page, url: string): Promise<APIResponse> {
  const headers = await authHeaders(page);
  return page.request.delete(url, { headers });
}

/** Safely parse JSON, return null if response is HTML or invalid */
export async function safeJson(response: APIResponse): Promise<any> {
  const contentType = response.headers()['content-type'] || '';
  if (!contentType.includes('json')) return null;
  return response.json().catch(() => null);
}

// --- TTT API URL builders ---

export const urls = {
  ttt: {
    statisticReportEmployees: `${TTT_API}/v1/statistic/report/employees`,
    statisticReportProjects: `${TTT_API}/v1/statistic/report/projects`,
    employees: `${TTT_API}/v1/employees`,
    currentEmployee: `${TTT_API}/v1/employees/current`,
  },
  vacation: {
    sickLeaves: `${VACATION_API}/v1/sick-leaves`,
    sickLeave: (id: number | string) => `${VACATION_API}/v1/sick-leaves/${id}`,
  },
};

/**
 * Poll an API endpoint until a condition is met.
 * Useful for async MQ-driven updates (e.g., statistic_report recalculation).
 * @param page - Playwright page
 * @param url - API endpoint to poll
 * @param condition - function that receives parsed JSON and returns true when done
 * @param options - intervalMs (default 2000), timeoutMs (default 30000)
 */
export async function pollUntil(
  page: Page,
  url: string,
  condition: (data: any) => boolean,
  options: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<any> {
  const { intervalMs = 2000, timeoutMs = 30000 } = options;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await apiGet(page, url);
    if (response.ok()) {
      const data = await safeJson(response);
      if (data && condition(data)) {
        return data;
      }
    }
    await page.waitForTimeout(intervalMs);
  }

  // One final attempt
  const response = await apiGet(page, url);
  const data = await safeJson(response);
  return data;
}

/**
 * Get current employee's statistic report data.
 * Returns the employee entry from statistic/report/employees.
 */
export async function getEmployeeStatisticReport(page: Page, employeeLogin: string): Promise<any> {
  const response = await apiGet(page, urls.ttt.statisticReportEmployees);
  const data = await safeJson(response);
  if (!data) return null;

  const items = Array.isArray(data) ? data : (data?.content || data?.data || []);
  return items.find((item: any) => item.login === employeeLogin || item.employeeLogin === employeeLogin) || null;
}
