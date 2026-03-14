import { Page, APIRequestContext } from '@playwright/test';

/**
 * Helper class for email notification verification via API/DB
 * No dedicated UI page — checks are done through API endpoints and database queries
 */
export class EmailNotificationsHelper {
  readonly page: Page;
  readonly request: APIRequestContext;
  readonly baseUrl: string;

  constructor(page: Page, request: APIRequestContext) {
    this.page = page;
    this.request = request;
    this.baseUrl = process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com';
  }

  // --- API helpers for checking email notifications ---

  async getNotificationLog(params?: {
    type?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.set('type', params.type);
    if (params?.userId) queryParams.set('userId', params.userId);
    if (params?.dateFrom) queryParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.set('dateTo', params.dateTo);

    const url = `${this.baseUrl}/api/notifications/log?${queryParams.toString()}`;
    const response = await this.request.get(url).catch(() => null);
    if (response && response.ok()) {
      return await response.json().catch(() => []);
    }
    return [];
  }

  async getEmailQueue(status?: string): Promise<any[]> {
    const queryParams = status ? `?status=${status}` : '';
    const url = `${this.baseUrl}/api/email/queue${queryParams}`;
    const response = await this.request.get(url).catch(() => null);
    if (response && response.ok()) {
      return await response.json().catch(() => []);
    }
    return [];
  }

  async getDigestStatus(): Promise<any> {
    const url = `${this.baseUrl}/api/notifications/digest`;
    const response = await this.request.get(url).catch(() => null);
    if (response && response.ok()) {
      return await response.json().catch(() => null);
    }
    return null;
  }

  // --- Notification types ---

  async checkVacationEmailSent(vacationId: string): Promise<boolean> {
    const log = await this.getNotificationLog({ type: 'vacation' });
    return log.some((entry: any) => entry.vacationId === vacationId || entry.entityId === vacationId);
  }

  async checkSickLeaveEmailSent(sickLeaveId: string): Promise<boolean> {
    const log = await this.getNotificationLog({ type: 'sick-leave' });
    return log.some((entry: any) => entry.sickLeaveId === sickLeaveId || entry.entityId === sickLeaveId);
  }

  async checkHolidayTransferEmailSent(): Promise<boolean> {
    const log = await this.getNotificationLog({ type: 'holiday-transfer' });
    return log.length > 0;
  }

  async checkDigestEmailSent(userId?: string): Promise<boolean> {
    const log = await this.getNotificationLog({ type: 'digest', userId });
    return log.length > 0;
  }

  async checkSystemNotificationSent(type: string): Promise<boolean> {
    const log = await this.getNotificationLog({ type });
    return log.length > 0;
  }

  // --- Trigger helpers ---

  async triggerDigest(): Promise<boolean> {
    const url = `${this.baseUrl}/api/notifications/digest/trigger`;
    const response = await this.request.post(url).catch(() => null);
    return response ? response.ok() : false;
  }

  // --- Wait helpers ---

  async waitForEmailInLog(type: string, entityId: string, timeoutMs = 10000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const log = await this.getNotificationLog({ type });
      if (log.some((entry: any) => entry.entityId === entityId)) {
        return true;
      }
      await this.page.waitForTimeout(1000);
    }
    return false;
  }
}
