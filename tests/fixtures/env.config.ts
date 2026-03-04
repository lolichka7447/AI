export const ENV = {
  baseUrl: process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com',
  casUrl: 'https://cas-demo.noveogroup.com',
  testUser: {
    login: process.env.TEST_USER_LOGIN || 'pvaynmaster',
    password: process.env.TEST_USER_PASSWORD || 'pvaynmaster',
  },
} as const;
