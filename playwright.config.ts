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
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
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
  ],
});
