import { defineConfig, devices } from '@playwright/test';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const AUTH_STATE_PATH = path.resolve(__dirname, '.auth/state.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html'],
    ['./tests/reporters/markdown-reporter.ts'],
    ['./tests/reporters/history-reporter.ts'],
  ],
  timeout: 60000,
  expect: { timeout: 10000 },
  use: {
    baseURL: process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com',
    navigationTimeout: 60000,
    actionTimeout: 15000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Pass LOCALE to browser context so workers inherit it
    locale: process.env.LOCALE === 'en' ? 'en-US' : 'ru-RU',
  },

  projects: [
    // Auth setup — runs CAS login once and saves state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Auth tests — no dependency on setup (test login flow itself)
    {
      name: 'auth',
      testDir: './tests/e2e',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Main E2E tests — depend on auth setup
    {
      name: 'e2e',
      testDir: './tests/e2e',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /auth\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
    },

    // API tests — depend on auth setup for session cookies
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: /.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
    },
  ],
});
