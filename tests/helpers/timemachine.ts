import { APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';

/**
 * Set server time via TTT Swagger Clock API.
 * Endpoint: PATCH /api/ttt/test-api/clock
 *
 * IMPORTANT: Always reset time in afterAll to avoid affecting other tests.
 */
export async function setServerTime(
  request: APIRequestContext,
  dateISO: string,
): Promise<void> {
  const response = await request.patch(`${BASE_URL}/api/ttt/test-api/clock`, {
    data: { dateTime: dateISO },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok()) {
    throw new Error(`Failed to set server time: ${response.status()} ${response.statusText()}`);
  }
}

/**
 * Reset server time to real current time.
 */
export async function resetServerTime(
  request: APIRequestContext,
): Promise<void> {
  const response = await request.delete(`${BASE_URL}/api/ttt/test-api/clock`);
  if (!response.ok()) {
    throw new Error(`Failed to reset server time: ${response.status()} ${response.statusText()}`);
  }
}

/**
 * Get the current server time (real or overridden).
 */
export async function getServerTime(
  request: APIRequestContext,
): Promise<string> {
  const response = await request.get(`${BASE_URL}/api/ttt/test-api/clock`);
  if (!response.ok()) {
    throw new Error(`Failed to get server time: ${response.status()} ${response.statusText()}`);
  }
  const data = await response.json();
  return data.dateTime || data.toString();
}
