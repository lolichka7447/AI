import type { Locale } from '../i18n';

/** TTT user roles for role-based testing */
export type TTTRole =
  | 'employee'
  | 'contractor'
  | 'project_manager'
  | 'department_manager'
  | 'tech_lead'
  | 'chief_accountant'
  | 'accountant'
  | 'office_hr'
  | 'admin'
  | 'view_all'
  | 'chief_officer';

/**
 * Real active users per role (from ttt_backend DB).
 * Auth: login only (no password needed on QA env).
 * pvaynmaster = DM with all major roles (primary test user).
 */
export const TEST_USERS: Record<TTTRole, { login: string; name: string }> = {
  employee:           { login: 'abaymaganov',  name: 'Anatols Baymaganov' },
  contractor:         { login: 'aleksey.pushkarev', name: 'Pushkarev Aleksey' },
  project_manager:    { login: 'aglushko',     name: 'Artem Glushko' },
  department_manager: { login: 'nshumakov',     name: 'Nikolay Shumakov' },
  tech_lead:          { login: 'ailin',         name: 'Alexander Ilin' },
  chief_accountant:   { login: 'perekrest',     name: 'Galina Perekrest' },
  accountant:         { login: 'lprokhorova',   name: 'Liliya Prokhorova' },
  office_hr:          { login: 'ekile',         name: 'Egor Kile' },
  admin:              { login: 'slebedev',      name: 'Sergey Lebedev' },
  view_all:           { login: 'adanilevskaya', name: 'Anastasia Danilevskaya' },
  chief_officer:      { login: 'pvaynmaster',   name: 'Pavel Weinmeister' },
};

export const ENV = {
  baseUrl: process.env.BASE_URL || 'https://ttt-qa-2.noveogroup.com',
  casUrl: 'https://cas-demo.noveogroup.com',
  locale: (process.env.LOCALE || 'ru') as Locale,
  testUser: {
    login: process.env.TEST_USER_LOGIN || 'pvaynmaster',
    password: process.env.TEST_USER_PASSWORD || 'pvaynmaster',
  },
} as const;
