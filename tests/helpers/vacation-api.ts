import { APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';

export interface VacationDaysResponse {
  availableDays: number;
  reservedDays: number;
  normForYear: number;
  pastPeriodsAvailableDays: number;
  nextYearAvailableDays: number;
}

export interface OfficeConfig {
  id: number;
  name: string;
  advanceVacation: boolean;
  annualLeave: number;
}

export interface VacationEntry {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  paymentType: string;
  regularDays: number;
  administrativeDays: number;
  paymentDate?: string;
}

/**
 * Get vacation days balance for an employee via API
 */
export async function getVacationDays(
  request: APIRequestContext,
  employeeId: number,
  year?: number,
): Promise<VacationDaysResponse> {
  const params = new URLSearchParams();
  params.append('employeeId', String(employeeId));
  if (year) params.append('year', String(year));

  const response = await request.get(`${BASE_URL}/api/ttt/v1/vacations/days?${params}`);
  if (!response.ok()) {
    throw new Error(`Failed to get vacation days: ${response.status()} ${response.statusText()}`);
  }
  return await response.json();
}

/**
 * Get office configuration (advanceVacation flag, annual leave norm)
 */
export async function getOfficeConfig(
  request: APIRequestContext,
  officeId: number,
): Promise<OfficeConfig> {
  const response = await request.get(`${BASE_URL}/api/ttt/v1/offices/${officeId}`);
  if (!response.ok()) {
    throw new Error(`Failed to get office config: ${response.status()} ${response.statusText()}`);
  }
  return await response.json();
}

/**
 * Get list of vacations for an employee
 */
export async function getVacations(
  request: APIRequestContext,
  employeeId: number,
  year?: number,
): Promise<VacationEntry[]> {
  const params = new URLSearchParams();
  params.append('employeeId', String(employeeId));
  if (year) params.append('year', String(year));

  const response = await request.get(`${BASE_URL}/api/ttt/v1/vacations?${params}`);
  if (!response.ok()) {
    throw new Error(`Failed to get vacations: ${response.status()} ${response.statusText()}`);
  }
  return await response.json();
}

/**
 * Delete a vacation by ID via API (cleanup helper)
 */
export async function deleteVacation(
  request: APIRequestContext,
  vacationId: number,
): Promise<void> {
  const response = await request.delete(`${BASE_URL}/api/ttt/v1/vacations/${vacationId}`);
  if (!response.ok()) {
    throw new Error(`Failed to delete vacation: ${response.status()} ${response.statusText()}`);
  }
}
