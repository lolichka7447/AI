export const TEST_USERS = {
  valid: {
    email: 'test@example.com',
    password: 'ValidPass123!',
  },
  invalid: {
    email: 'invalid',
    password: '',
  },
} as const;

export const TIMEOUTS = {
  short: 5_000,
  medium: 15_000,
  long: 30_000,
} as const;
