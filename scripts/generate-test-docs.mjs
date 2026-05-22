/**
 * TTT Test Documentation Generator
 * Generates xlsx test documentation for all 11 TTT modules
 * Structure matches ttt-expert-v2 example format:
 * - Plan Overview
 * - Feature Matrix
 * - Risk Assessment
 * - TS-* Test Suite sheets (10-column schema)
 * - Test Data
 */

import ExcelJS from 'exceljs';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ADDITIONAL_SUITES } from './additional-test-cases.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'test-docs-generated');

// ============================================================================
// Styling constants
// ============================================================================
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B579A' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
const SUBHEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F0' } };
const SUBHEADER_FONT = { bold: true, size: 11 };
const TITLE_FONT = { bold: true, size: 14 };
const SECTION_FONT = { bold: true, size: 12 };
const BORDER_THIN = {
  top: { style: 'thin' }, bottom: { style: 'thin' },
  left: { style: 'thin' }, right: { style: 'thin' }
};

const PRIORITY_COLORS = {
  Critical: 'FFFF0000',
  High: 'FFFF6600',
  Medium: 'FFFFC000',
  Low: 'FF92D050',
};

const TYPE_COLORS = {
  Functional: 'FF4472C4',
  Negative: 'FFE74C3C',
  Boundary: 'FFFF9800',
  Security: 'FF9B59B6',
  Performance: 'FF1ABC9C',
  Accessibility: 'FF3498DB',
};

// ============================================================================
// Module definitions
// ============================================================================
const MODULES = [
  {
    id: 'auth',
    name: 'Authentication & Authorization',
    nameRu: 'Аутентификация и авторизация',
    prefix: 'AUTH',
    specFiles: ['auth.spec.ts', 'auth-roles.spec.ts'],
    totalTests: 19,
    rating: 'D',
    effectiveCoverage: '25%',
    suites: [
      {
        id: 'TS-Auth-Login',
        name: 'Login Flow',
        description: 'CAS login, username-only login, session management',
        tests: [
          { id: 'TC-AUTH-001', title: 'Login page loads correctly', preconditions: 'User not authenticated, VPN connected', steps: '1. Navigate to TTT base URL\n2. Verify login form appears', expected: 'Login page displayed with username field\nNo password field (CAS disabled on QA)', priority: 'Critical', type: 'Functional', ref: 'auth.spec.ts:TR-850', component: 'LoginPage, CAS', notes: 'CAS disabled on QA env, login by username only' },
          { id: 'TC-AUTH-002', title: 'Successful login with valid username', preconditions: 'User pvaynmaster exists in DB', steps: '1. Navigate to login page\n2. Enter "pvaynmaster" in username field\n3. Submit form', expected: 'Redirect to /report (main page)\nUser name visible in navbar\nSession cookie set', priority: 'Critical', type: 'Functional', ref: 'auth.spec.ts:TR-851', component: 'LoginPage, AuthController', notes: 'Primary test user with all roles' },
          { id: 'TC-AUTH-003', title: 'Login with invalid username', preconditions: 'User "nonexistent_user_xyz" does not exist', steps: '1. Navigate to login page\n2. Enter "nonexistent_user_xyz"\n3. Submit form', expected: 'Error message displayed\nNo redirect to /report\nNo session created', priority: 'High', type: 'Negative', ref: '', component: 'LoginPage, AuthController', notes: 'Verify error message text matches i18n' },
          { id: 'TC-AUTH-004', title: 'Login with empty username', preconditions: 'Login page loaded', steps: '1. Leave username field empty\n2. Click submit button', expected: 'Form validation prevents submission\nOr error message about empty username', priority: 'High', type: 'Negative', ref: '', component: 'LoginPage', notes: 'HTML5 validation or JS validation' },
          { id: 'TC-AUTH-005', title: 'Session persistence after page reload', preconditions: 'User logged in as pvaynmaster', steps: '1. Login successfully\n2. Reload page (F5)\n3. Check user remains logged in', expected: 'User still logged in after reload\nNo redirect to login page\nNavbar shows username', priority: 'High', type: 'Functional', ref: '', component: 'Session, Cookies', notes: 'Verifies auth-state cookie persistence' },
        ]
      },
      {
        id: 'TS-Auth-Logout',
        name: 'Logout Flow',
        description: 'Logout functionality, session cleanup',
        tests: [
          { id: 'TC-AUTH-010', title: 'Successful logout via user menu', preconditions: 'User logged in as pvaynmaster', steps: '1. Click user menu button in navbar\n2. Click "Выход" / "Logout" link\n3. Verify redirect', expected: 'Redirect to login page\nSession cookie cleared\nNo access to protected pages', priority: 'Critical', type: 'Functional', ref: 'auth.spec.ts:TR-853', component: 'NavigationComponent, AuthController', notes: 'User menu is navbar__user button' },
          { id: 'TC-AUTH-011', title: 'Access protected page after logout', preconditions: 'User just logged out', steps: '1. Logout\n2. Navigate directly to /report\n3. Check response', expected: 'Redirect to login page\nNo access to report data', priority: 'High', type: 'Security', ref: '', component: 'AuthFilter, Session', notes: 'Verify session is fully invalidated' },
        ]
      },
      {
        id: 'TS-Auth-Roles',
        name: 'Role-Based Access Control',
        description: 'Access control per role, restricted pages, admin access',
        tests: [
          { id: 'TC-AUTH-020', title: 'Employee role — no admin access', preconditions: 'Login as abaymaganov (EMPLOYEE only)', steps: '1. Login as employee user\n2. Navigate to /admin\n3. Check page content', expected: 'Admin page not accessible or shows no admin features\nNo admin menu in navbar', priority: 'Critical', type: 'Security', ref: 'auth-roles.spec.ts', component: 'AdminPage, RoleService', notes: 'abaymaganov has only EMPLOYEE role' },
          { id: 'TC-AUTH-021', title: 'Admin role — full admin access', preconditions: 'Login as slebedev (ADMIN role)', steps: '1. Login as admin user\n2. Navigate to /admin\n3. Verify all admin sections visible', expected: 'Admin menu visible in navbar\nAll admin subpages accessible\nCRUD operations available', priority: 'Critical', type: 'Functional', ref: 'auth-roles.spec.ts', component: 'AdminPage, RoleService', notes: 'slebedev is admin user' },
          { id: 'TC-AUTH-022', title: 'Contractor — limited access', preconditions: 'Login as aleksey.pushkarev (CONTRACTOR)', steps: '1. Login as contractor\n2. Check available navigation items\n3. Try accessing admin, accounting', expected: 'Only My Tasks and basic features visible\nNo admin/accounting menu\nReport page accessible for own data', priority: 'High', type: 'Security', ref: 'auth-roles.spec.ts', component: 'NavigationComponent, RoleService', notes: '' },
          { id: 'TC-AUTH-023', title: 'DM — approval access', preconditions: 'Login as pvaynmaster (DM/Chief Officer)', steps: '1. Login as DM\n2. Check approval menu\n3. Navigate to /approve/employees', expected: 'Approval menu visible\nCan see employee reports\nApprove/reject buttons visible', priority: 'High', type: 'Functional', ref: '', component: 'ApprovalPage, RoleService', notes: 'DM has approval permissions' },
          { id: 'TC-AUTH-024', title: 'Accountant — accounting access', preconditions: 'Login as lprokhorova (ACCOUNTANT)', steps: '1. Login as accountant\n2. Check accounting menu in navbar\n3. Navigate to accounting subpages', expected: 'Accounting menu visible\nSalary, Periods, Payment pages accessible\nCan view financial data', priority: 'High', type: 'Functional', ref: '', component: 'AccountingPage, RoleService', notes: '' },
          { id: 'TC-AUTH-025', title: 'View All — read-only access', preconditions: 'Login as adanilevskaya (VIEW_ALL)', steps: '1. Login as view_all user\n2. Navigate to report, admin pages\n3. Check for edit buttons', expected: 'Can view all data\nNo edit/delete/create buttons\nAll data read-only', priority: 'Medium', type: 'Security', ref: '', component: 'RoleService, all pages', notes: 'VIEW_ALL = read-only access to everything' },
        ]
      },
      {
        id: 'TS-Auth-Token',
        name: 'API Token Management',
        description: 'Token generation, copy, revoke on /admin/account page',
        tests: [
          { id: 'TC-AUTH-030', title: 'Token section visible on account page', preconditions: 'Logged in, on /admin/account', steps: '1. Navigate to /admin/account\n2. Check for API token section (<dt>/<dd>)', expected: 'Token section visible\nToken value displayed\nCopy and revoke buttons visible', priority: 'High', type: 'Functional', ref: 'user-settings.spec.ts:TR-993', component: 'UserSettingsPage', notes: 'Uses semantic HTML: <dt> for label, <dd> for value' },
          { id: 'TC-AUTH-031', title: 'Copy token button works', preconditions: 'Token section visible', steps: '1. Click copy token button\n2. Verify clipboard content (if possible)', expected: 'Token copied to clipboard\nUI feedback shown (tooltip or notification)', priority: 'Medium', type: 'Functional', ref: 'user-settings.spec.ts:TR-995', component: 'UserSettingsPage', notes: 'Clipboard API may be restricted in headless mode' },
          { id: 'TC-AUTH-032', title: 'Revoke/regenerate token', preconditions: 'Token exists', steps: '1. Click revoke/regenerate button\n2. Confirm action if dialog appears\n3. Verify new token', expected: 'Old token invalidated\nNew token generated and displayed\nToken value changed', priority: 'High', type: 'Functional', ref: 'user-settings.spec.ts:TR-996', component: 'UserSettingsPage, TokenController', notes: 'May require confirmation dialog' },
        ]
      },
      {
        id: 'TS-Auth-Language',
        name: 'Language Settings',
        description: 'Language switching, persistence across sessions',
        tests: [
          { id: 'TC-AUTH-040', title: 'Language switcher visible', preconditions: 'Logged in, any page', steps: '1. Look for language switcher in header\n2. Verify RU/EN options', expected: 'Language switcher visible (.language-switcher)\nCurrent language displayed (RU or EN)', priority: 'Medium', type: 'Functional', ref: 'user-settings.spec.ts:TR-998', component: 'NavigationComponent', notes: '.language-switcher > click > li.drop-down-menu__option' },
          { id: 'TC-AUTH-041', title: 'Switch language RU → EN', preconditions: 'Current language is RU', steps: '1. Click language switcher\n2. Select EN\n3. Verify UI text changes', expected: 'All UI elements switch to English\nNavigation labels in English\nPage content in English', priority: 'Medium', type: 'Functional', ref: '', component: 'LanguageSwitcher, i18n', notes: 'Known issue #3280 (fixed in Sprint 13)' },
          { id: 'TC-AUTH-042', title: 'Language persists after page reload', preconditions: 'Language switched to EN', steps: '1. Switch to EN\n2. Reload page\n3. Check language', expected: 'Language remains EN after reload\nNo revert to default RU', priority: 'Medium', type: 'Functional', ref: '#3280', component: 'LanguageSwitcher, UserPreferences', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Login', risk: 'CAS authentication disabled on QA — not testing real auth flow', likelihood: 'High', impact: 'High', severity: 'Critical', mitigation: 'Test with CAS enabled on staging when available' },
      { feature: 'Role Access', risk: 'All tests run as pvaynmaster (all roles) — RBAC not verified', likelihood: 'High', impact: 'High', severity: 'Critical', mitigation: 'Add loginAsUser() fixture, test with role-specific users' },
      { feature: 'Session', risk: 'Session fixation/hijacking not tested', likelihood: 'Medium', impact: 'High', severity: 'High', mitigation: 'Add security tests for session management' },
      { feature: 'API Token', risk: 'Token security (storage, expiry) not verified', likelihood: 'Medium', impact: 'Medium', severity: 'Medium', mitigation: 'Test token revocation, check token format' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'ALL (7 roles)', useCase: 'Primary test user, admin+DM scenarios' },
      { user: 'abaymaganov', roles: 'EMPLOYEE', useCase: 'Basic employee, no admin access' },
      { user: 'aleksey.pushkarev', roles: 'CONTRACTOR', useCase: 'Restricted access testing' },
      { user: 'slebedev', roles: 'ADMIN', useCase: 'Admin-only access' },
      { user: 'lprokhorova', roles: 'ACCOUNTANT', useCase: 'Accounting access' },
      { user: 'adanilevskaya', roles: 'VIEW_ALL', useCase: 'Read-only access' },
    ],
  },
  {
    id: 'report',
    name: 'Time Report',
    nameRu: 'Отчёт по времени',
    prefix: 'RPT',
    specFiles: ['report.spec.ts', 'report-deep.spec.ts'],
    totalTests: 112,
    rating: 'B',
    effectiveCoverage: '58%',
    suites: [
      {
        id: 'TS-Rpt-Navigation',
        name: 'Report Navigation',
        description: 'Page loading, URL structure, week navigation',
        tests: [
          { id: 'TC-RPT-001', title: 'Report page loads correctly', preconditions: 'Logged in as pvaynmaster', steps: '1. Navigate to /report\n2. Verify page content', expected: 'Report page displayed\nCurrent week shown\nProject list visible', priority: 'Critical', type: 'Functional', ref: 'report.spec.ts:TR-001', component: 'ReportPage', notes: 'Main page after login' },
          { id: 'TC-RPT-002', title: 'Week navigation — next week', preconditions: 'On report page', steps: '1. Click next week arrow\n2. Verify dates change', expected: 'Week dates shift forward by 7 days\nURL or state reflects new week', priority: 'High', type: 'Functional', ref: 'report.spec.ts:TR-003', component: 'ReportPage, DatePicker', notes: '' },
          { id: 'TC-RPT-003', title: 'Week navigation — previous week', preconditions: 'On report page', steps: '1. Click previous week arrow\n2. Verify dates change', expected: 'Week dates shift backward by 7 days\nData for previous week loaded', priority: 'High', type: 'Functional', ref: 'report.spec.ts:TR-004', component: 'ReportPage, DatePicker', notes: '' },
          { id: 'TC-RPT-004', title: 'Week header shows correct date range', preconditions: 'On report page', steps: '1. Check week header text\n2. Verify date format', expected: 'Header shows Mon-Sun date range\nFormat matches locale (DD.MM.YYYY for RU)', priority: 'Medium', type: 'Functional', ref: 'report.spec.ts:TR-002', component: 'ReportPage', notes: '' },
        ]
      },
      {
        id: 'TS-Rpt-TaskEntry',
        name: 'Task Entry & Hours',
        description: 'Adding tasks, entering hours, validation',
        tests: [
          { id: 'TC-RPT-010', title: 'Add task to report', preconditions: 'On report page, projects available', steps: '1. Click "Add task" button\n2. Select project from dropdown\n3. Enter task description', expected: 'Task row added to report table\nProject name visible in row\nHours cells editable', priority: 'Critical', type: 'Functional', ref: 'report.spec.ts:TR-010', component: 'ReportPage', notes: '' },
          { id: 'TC-RPT-011', title: 'Enter hours for a day', preconditions: 'Task row exists in report', steps: '1. Click on hours cell for Monday\n2. Enter "8"\n3. Click outside cell', expected: 'Hours saved (8 displayed)\nTotal row updated\nNo error messages', priority: 'Critical', type: 'Functional', ref: 'report.spec.ts:TR-011', component: 'ReportPage', notes: '' },
          { id: 'TC-RPT-012', title: 'Validate hours > 24 for a day', preconditions: 'Task row exists', steps: '1. Enter 25 hours in a single cell\n2. Try to save', expected: 'Validation error shown\nHours not saved or warning displayed', priority: 'High', type: 'Negative', ref: '', component: 'ReportPage, Validation', notes: 'Max 24h per day validation' },
          { id: 'TC-RPT-013', title: 'Total hours calculation', preconditions: 'Multiple tasks with hours entered', steps: '1. Enter hours in multiple cells\n2. Check total row', expected: 'Total row shows sum of all hours per day\nWeekly total correct', priority: 'High', type: 'Functional', ref: 'report.spec.ts:TR-015', component: 'ReportPage', notes: '' },
          { id: 'TC-RPT-014', title: 'Delete task from report', preconditions: 'Task row exists with hours', steps: '1. Click delete button on task row\n2. Confirm deletion if asked', expected: 'Task row removed\nTotal hours recalculated\nNo orphan data', priority: 'High', type: 'Functional', ref: '', component: 'ReportPage', notes: '' },
        ]
      },
      {
        id: 'TS-Rpt-Projects',
        name: 'Project & Task Management',
        description: 'Project selection, task types, project filtering',
        tests: [
          { id: 'TC-RPT-020', title: 'Project dropdown shows assigned projects', preconditions: 'On report page', steps: '1. Click project dropdown\n2. Review list of projects', expected: 'Only projects assigned to user displayed\nProjects sorted alphabetically\nProject codes visible', priority: 'High', type: 'Functional', ref: 'report.spec.ts:TR-020', component: 'ReportPage, ProjectService', notes: '' },
          { id: 'TC-RPT-021', title: 'Search/filter projects', preconditions: 'Project dropdown open', steps: '1. Type project name in search\n2. Verify filtered results', expected: 'Projects filtered by typed text\nMatching projects shown\nNon-matching hidden', priority: 'Medium', type: 'Functional', ref: '', component: 'ReportPage', notes: '' },
          { id: 'TC-RPT-022', title: 'Task type selection', preconditions: 'Project selected', steps: '1. Open task type dropdown\n2. Select task type (Development, QA, etc.)', expected: 'Task type set for the row\nType displayed in row', priority: 'Medium', type: 'Functional', ref: '', component: 'ReportPage', notes: '' },
        ]
      },
      {
        id: 'TS-Rpt-Period',
        name: 'Period Management',
        description: 'Open/closed periods, read-only state',
        tests: [
          { id: 'TC-RPT-030', title: 'Closed period — read-only mode', preconditions: 'Navigate to a closed period week', steps: '1. Go to a week in a closed period\n2. Try to edit hours\n3. Check for edit controls', expected: 'Hours cells not editable\nNo add task button\nVisual indicator of closed period', priority: 'Critical', type: 'Functional', ref: '', component: 'ReportPage, PeriodService', notes: 'Critical for data integrity' },
          { id: 'TC-RPT-031', title: 'Open period — editable mode', preconditions: 'Navigate to current (open) period', steps: '1. Go to current week\n2. Check edit availability', expected: 'Hours cells editable\nAdd task button visible\nSave functionality works', priority: 'High', type: 'Functional', ref: '', component: 'ReportPage, PeriodService', notes: '' },
        ]
      },
      {
        id: 'TS-Rpt-Summary',
        name: 'Monthly Summary & Export',
        description: 'Monthly totals, summary view, data export',
        tests: [
          { id: 'TC-RPT-040', title: 'Monthly summary view', preconditions: 'On report page with data', steps: '1. Navigate to monthly summary tab/section\n2. Verify totals', expected: 'Monthly totals calculated correctly\nAll weeks of month included\nProject breakdown shown', priority: 'High', type: 'Functional', ref: '', component: 'ReportPage', notes: '' },
          { id: 'TC-RPT-041', title: 'Color indicators for hours', preconditions: 'Hours entered for multiple days', steps: '1. Enter 8h (normal), 0h (missing), 12h (overtime)\n2. Check cell colors', expected: 'Different colors for normal/zero/overtime hours\nColor coding consistent', priority: 'Medium', type: 'Functional', ref: '', component: 'ReportPage, CSS', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Time Entry', risk: 'No validation for total hours > 24/day or > 168/week', likelihood: 'High', impact: 'Medium', severity: 'High', mitigation: 'Add deep validation tests for edge cases' },
      { feature: 'Closed Period', risk: 'Frontend-only protection — API may still accept writes', likelihood: 'Medium', impact: 'High', severity: 'High', mitigation: 'Test API directly with closed period dates' },
      { feature: 'Data Integrity', risk: 'Concurrent edits from multiple sessions not handled', likelihood: 'Low', impact: 'High', severity: 'Medium', mitigation: 'Test with 2 browser contexts editing same report' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'DM, all roles', useCase: 'Full access to reports' },
      { user: 'abaymaganov', roles: 'EMPLOYEE', useCase: 'Own reports only' },
    ],
  },
  {
    id: 'admin',
    name: 'Administration',
    nameRu: 'Администрирование',
    prefix: 'ADM',
    specFiles: ['admin.spec.ts', 'admin-api.spec.ts', 'admin-calendar.spec.ts', 'admin-employees.spec.ts', 'admin-params.spec.ts', 'admin-projects.spec.ts', 'admin-subpages.spec.ts', 'admin-roles.spec.ts'],
    totalTests: 188,
    rating: 'B',
    effectiveCoverage: '55%',
    suites: [
      {
        id: 'TS-Adm-Projects',
        name: 'Project Management',
        description: 'CRUD for projects, project settings, employee assignment',
        tests: [
          { id: 'TC-ADM-001', title: 'Admin projects page loads', preconditions: 'Logged in as admin (pvaynmaster)', steps: '1. Navigate to Admin > Projects\n2. Verify page content', expected: 'Projects table displayed\nSearch/filter controls visible\nAdd project button available', priority: 'Critical', type: 'Functional', ref: 'admin-projects.spec.ts', component: 'AdminProjectsPage', notes: '' },
          { id: 'TC-ADM-002', title: 'Search projects by name', preconditions: 'On admin projects page', steps: '1. Enter project name in search field\n2. Verify filtered results', expected: 'Table filtered to matching projects\nNon-matching projects hidden', priority: 'High', type: 'Functional', ref: 'admin-projects.spec.ts', component: 'AdminProjectsPage', notes: '' },
          { id: 'TC-ADM-003', title: 'Project details view', preconditions: 'Projects listed', steps: '1. Click on project row\n2. Review project details', expected: 'Project details panel/page opens\nAll fields visible (name, code, employees)', priority: 'High', type: 'Functional', ref: 'admin-projects.spec.ts', component: 'AdminProjectsPage', notes: '' },
        ]
      },
      {
        id: 'TS-Adm-Employees',
        name: 'Employee Management',
        description: 'Employee list, roles, deactivation',
        tests: [
          { id: 'TC-ADM-010', title: 'Employees list displays', preconditions: 'On Admin > Employees', steps: '1. Navigate to Admin > Employees\n2. Verify table content', expected: 'Employee table with columns: name, login, roles, status\nPagination if many employees', priority: 'Critical', type: 'Functional', ref: 'admin-employees.spec.ts', component: 'AdminPage', notes: '' },
          { id: 'TC-ADM-011', title: 'Search employees', preconditions: 'On employees page', steps: '1. Enter employee name in search\n2. Verify filtered list', expected: 'Filtered to matching employees\nSearch works by name and login', priority: 'High', type: 'Functional', ref: 'admin-employees.spec.ts', component: 'AdminPage', notes: '' },
          { id: 'TC-ADM-012', title: 'Employee roles display', preconditions: 'On employees page', steps: '1. Find employee with known roles\n2. Verify role badges/labels', expected: 'All assigned roles displayed\nRole names match DB data', priority: 'High', type: 'Functional', ref: 'admin-employees.spec.ts', component: 'AdminPage', notes: '' },
        ]
      },
      {
        id: 'TS-Adm-Calendar',
        name: 'Calendar Management',
        description: 'Production calendar, holidays, workdays',
        tests: [
          { id: 'TC-ADM-020', title: 'Calendar page loads', preconditions: 'On Admin > Calendar', steps: '1. Navigate to Admin > Calendar\n2. Verify calendar display', expected: 'Calendar grid displayed\nCurrent month shown\nHolidays highlighted', priority: 'High', type: 'Functional', ref: 'admin-calendar.spec.ts', component: 'AdminCalendarPage', notes: '' },
          { id: 'TC-ADM-021', title: 'Year navigation', preconditions: 'On calendar page', steps: '1. Click next/previous year\n2. Verify year changes', expected: 'Calendar shows different year\nHolidays update for that year', priority: 'Medium', type: 'Functional', ref: 'admin-calendar.spec.ts', component: 'AdminCalendarPage', notes: '' },
          { id: 'TC-ADM-022', title: 'Office calendar selection', preconditions: 'Multiple offices exist', steps: '1. Select different office from dropdown\n2. Verify calendar updates', expected: 'Calendar reflects office-specific holidays\nDifferent offices have different calendars', priority: 'High', type: 'Functional', ref: 'admin-calendar.spec.ts', component: 'AdminCalendarPage', notes: '' },
        ]
      },
      {
        id: 'TS-Adm-Settings',
        name: 'System Settings',
        description: 'Parameters, API keys, system configuration',
        tests: [
          { id: 'TC-ADM-030', title: 'Admin settings page loads', preconditions: 'Logged in as admin', steps: '1. Navigate to Admin > Settings\n2. Verify settings form', expected: 'Settings page displayed\nConfiguration fields visible\nSave button available', priority: 'High', type: 'Functional', ref: 'admin-params.spec.ts', component: 'AdminSubpagesPage', notes: '' },
          { id: 'TC-ADM-031', title: 'API page loads', preconditions: 'Logged in as admin', steps: '1. Navigate to Admin > API\n2. Verify API info', expected: 'API documentation or endpoints displayed\nAPI token info visible', priority: 'Medium', type: 'Functional', ref: 'admin-api.spec.ts', component: 'AdminSubpagesPage', notes: '' },
        ]
      },
      {
        id: 'TS-Adm-Subpages',
        name: 'Admin Subpages',
        description: 'Export, Offices, additional admin pages',
        tests: [
          { id: 'TC-ADM-040', title: 'All admin subpages accessible', preconditions: 'Logged in as admin', steps: '1. Navigate through each admin submenu item\n2. Verify each page loads', expected: 'All subpages load without errors\nProjects, Employees, Calendar, Settings, API, Export accessible', priority: 'High', type: 'Functional', ref: 'admin-subpages.spec.ts', component: 'AdminSubpagesPage, NavigationComponent', notes: '' },
          { id: 'TC-ADM-041', title: 'Admin export page', preconditions: 'On Admin > Export', steps: '1. Navigate to Admin > Export\n2. Verify export options', expected: 'Export page displayed\nFormat selection available\nExport button visible', priority: 'Medium', type: 'Functional', ref: 'admin-subpages.spec.ts', component: 'AdminSubpagesPage', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Project CRUD', risk: 'Test creates/modifies real projects on QA server', likelihood: 'High', impact: 'Medium', severity: 'High', mitigation: 'Use read-only checks where possible, cleanup after write tests' },
      { feature: 'Employee Management', risk: 'Deactivating real users could break other tests', likelihood: 'Medium', impact: 'High', severity: 'High', mitigation: 'Never deactivate test users, only verify UI elements' },
      { feature: 'Calendar', risk: 'Modifying holidays affects day calculations globally', likelihood: 'Medium', impact: 'High', severity: 'High', mitigation: 'Test on dedicated QA env, restore original data after tests' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'ADMIN, DM', useCase: 'Full admin access' },
      { user: 'slebedev', roles: 'ADMIN', useCase: 'Admin-only user' },
      { user: 'abaymaganov', roles: 'EMPLOYEE', useCase: 'No admin access (negative test)' },
    ],
  },
  {
    id: 'vacation',
    name: 'Vacation Management',
    nameRu: 'Управление отпусками',
    prefix: 'VAC',
    specFiles: ['vacation.spec.ts', 'vacation-employee.spec.ts', 'vacation-manager.spec.ts', 'vacation-requests.spec.ts', 'vacation-deep.spec.ts', 'vacation-calendar-recalc.spec.ts', 'vacation-roles.spec.ts'],
    totalTests: 370,
    rating: 'B',
    effectiveCoverage: '55%',
    suites: [
      {
        id: 'TS-Vac-MyVacations',
        name: 'My Vacations',
        description: 'Employee vacation list, creation, status viewing',
        tests: [
          { id: 'TC-VAC-001', title: 'My vacations page loads', preconditions: 'Logged in, navigate to Vacations > My Vacations', steps: '1. Click Vacations menu\n2. Select My Vacations\n3. Verify page', expected: 'Vacations table displayed\nFilter controls visible\nCreate vacation button available', priority: 'Critical', type: 'Functional', ref: 'vacation-employee.spec.ts', component: 'VacationPage', notes: '' },
          { id: 'TC-VAC-002', title: 'Vacation request modal opens', preconditions: 'On My Vacations page', steps: '1. Click "Create vacation" button\n2. Verify modal form', expected: 'Modal with date fields, type selector\nStart/end date pickers\nSubmit button', priority: 'Critical', type: 'Functional', ref: 'vacation-employee.spec.ts', component: 'VacationPage', notes: '' },
          { id: 'TC-VAC-003', title: 'Available days counter displayed', preconditions: 'On My Vacations page', steps: '1. Check available days section\n2. Verify number displayed', expected: 'Available vacation days shown\nNumber matches DB value\nDays counter format correct', priority: 'High', type: 'Functional', ref: 'vacation-employee.spec.ts', component: 'VacationPage', notes: '' },
        ]
      },
      {
        id: 'TS-Vac-Manager',
        name: 'Manager Vacation View',
        description: 'Manager view of employee vacations, approval',
        tests: [
          { id: 'TC-VAC-010', title: 'Manager vacation list loads', preconditions: 'Logged in as DM/manager', steps: '1. Navigate to Vacations > Employee Days\n2. Verify employee list', expected: 'All subordinate employees listed\nVacation days shown per employee\nFilter by department available', priority: 'High', type: 'Functional', ref: 'vacation-manager.spec.ts', component: 'VacationPage', notes: '' },
          { id: 'TC-VAC-011', title: 'Filter by employee name', preconditions: 'On manager vacation view', steps: '1. Enter employee name in filter\n2. Verify filtered results', expected: 'Table filtered to matching employees\nFilter applies immediately', priority: 'Medium', type: 'Functional', ref: 'vacation-manager.spec.ts', component: 'VacationPage', notes: '' },
        ]
      },
      {
        id: 'TS-Vac-Requests',
        name: 'Vacation Requests',
        description: 'Request listing, status changes, approval workflow',
        tests: [
          { id: 'TC-VAC-020', title: 'Vacation requests page loads', preconditions: 'Logged in as DM', steps: '1. Navigate to Vacations > Requests\n2. Verify page content', expected: 'Requests table displayed\nStatus column visible\nPending requests highlighted', priority: 'High', type: 'Functional', ref: 'vacation-requests.spec.ts', component: 'VacationPage', notes: '' },
          { id: 'TC-VAC-021', title: 'Filter requests by status', preconditions: 'On requests page', steps: '1. Select status filter (Pending, Approved, etc.)\n2. Verify filtered list', expected: 'Only requests with selected status shown\nCount matches filter', priority: 'Medium', type: 'Functional', ref: 'vacation-requests.spec.ts', component: 'VacationPage', notes: '' },
        ]
      },
      {
        id: 'TS-Vac-Calendar',
        name: 'Vacation Calendar',
        description: 'Calendar view, recalculation, visualization',
        tests: [
          { id: 'TC-VAC-030', title: 'Calendar view loads', preconditions: 'Navigate to Vacations > Calendar', steps: '1. Navigate to calendar view\n2. Verify calendar display', expected: 'Calendar grid with employees\nVacation periods highlighted\nMonth navigation available', priority: 'High', type: 'Functional', ref: 'vacation-calendar-recalc.spec.ts', component: 'VacationPage, CalendarPage', notes: '' },
        ]
      },
      {
        id: 'TS-Vac-SickLeave',
        name: 'Sick Leave',
        description: 'Sick leave creation, viewing, management',
        tests: [
          { id: 'TC-VAC-040', title: 'Sick leave section loads', preconditions: 'Navigate to Vacations > My Sick Leaves', steps: '1. Click Vacations > My Sick Leaves\n2. Verify page', expected: 'Sick leave list displayed\nCreate button available (for managers)\nDates and status shown', priority: 'High', type: 'Functional', ref: 'sick-leave.spec.ts', component: 'SickLeavePage', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Vacation Create', risk: 'Creating vacations on QA affects other users\' approval queues', likelihood: 'High', impact: 'Medium', severity: 'High', mitigation: 'Create and immediately cancel, or test only UI form validation' },
      { feature: 'Day Calculation', risk: 'Different AV=true/false formulas produce different results', likelihood: 'High', impact: 'High', severity: 'Critical', mitigation: 'Test both calculation modes with known data' },
      { feature: 'Status Machine', risk: 'Invalid transitions could corrupt vacation state', likelihood: 'Medium', impact: 'High', severity: 'High', mitigation: 'Test all valid and invalid state transitions' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'DM, all roles', useCase: 'Manager view, full access' },
      { user: 'abaymaganov', roles: 'EMPLOYEE', useCase: 'Own vacations only' },
      { user: 'perekrest', roles: 'CHIEF_ACCOUNTANT', useCase: 'Payment view access' },
    ],
  },
  {
    id: 'approval',
    name: 'Report Approval',
    nameRu: 'Подтверждение отчётов',
    prefix: 'APR',
    specFiles: ['approval.spec.ts', 'approval-by-employee.spec.ts', 'approval-by-project.spec.ts', 'approval-roles.spec.ts'],
    totalTests: 183,
    rating: 'B',
    effectiveCoverage: '52%',
    suites: [
      {
        id: 'TS-Apr-ByEmployee',
        name: 'Approval by Employee',
        description: 'Employee-centric approval view, approve/reject workflow',
        tests: [
          { id: 'TC-APR-001', title: 'Approval page loads', preconditions: 'Logged in as DM (pvaynmaster)', steps: '1. Navigate to Approval\n2. Verify page content', expected: 'Approval page displayed\nEmployee tab active by default\nDate range selector visible', priority: 'Critical', type: 'Functional', ref: 'approval.spec.ts', component: 'ApprovalPage', notes: 'Known bug: page may crash (#3285)' },
          { id: 'TC-APR-002', title: 'Employee list displayed', preconditions: 'On approval page, by employee tab', steps: '1. Check employee list\n2. Verify employee data', expected: 'Subordinate employees listed\nHours summary visible per employee\nApproval status shown', priority: 'High', type: 'Functional', ref: 'approval-by-employee.spec.ts', component: 'ApprovalPage', notes: '' },
          { id: 'TC-APR-003', title: 'Date range filtering', preconditions: 'On approval page', steps: '1. Select custom date range\n2. Verify data updates', expected: 'Table shows data for selected range\nHours recalculated\nApproval status refreshed', priority: 'High', type: 'Functional', ref: 'approval-by-employee.spec.ts', component: 'ApprovalPage', notes: '.approve-tab is for date ranges only' },
        ]
      },
      {
        id: 'TS-Apr-ByProject',
        name: 'Approval by Project',
        description: 'Project-centric approval, project hours review',
        tests: [
          { id: 'TC-APR-010', title: 'Switch to By Project view', preconditions: 'On approval page', steps: '1. Click "By Project" tab\n2. Verify project list', expected: 'Project list displayed\nHours per project visible\nProject filter available', priority: 'High', type: 'Functional', ref: 'approval-by-project.spec.ts', component: 'ApprovalPage', notes: '' },
          { id: 'TC-APR-011', title: 'Project hours summary', preconditions: 'On By Project view', steps: '1. Select project\n2. Review hours breakdown', expected: 'Employee hours for project shown\nTotal hours calculated\nApproval status per employee', priority: 'High', type: 'Functional', ref: 'approval-by-project.spec.ts', component: 'ApprovalPage', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Approval Page', risk: 'Page crashes on load — bug #3285', likelihood: 'High', impact: 'High', severity: 'Critical', mitigation: 'Test with error handling, skip approval-specific tests if crash detected' },
      { feature: 'Approve Action', risk: 'Approving test reports affects real accounting data', likelihood: 'Medium', impact: 'High', severity: 'High', mitigation: 'Only verify button visibility, do not perform actual approvals' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'DM', useCase: 'Approval actions' },
      { user: 'abaymaganov', roles: 'EMPLOYEE', useCase: 'No approval access (negative test)' },
    ],
  },
  {
    id: 'planner',
    name: 'Planner',
    nameRu: 'Планировщик',
    prefix: 'PLN',
    specFiles: ['planner.spec.ts', 'planner-projects.spec.ts', 'planner-tasks.spec.ts', 'planner-tickets.spec.ts', 'planner-deep.spec.ts'],
    totalTests: 113,
    rating: 'B',
    effectiveCoverage: '53%',
    suites: [
      {
        id: 'TS-Pln-Projects',
        name: 'Planner Projects',
        description: 'Project list, assignment, project configuration',
        tests: [
          { id: 'TC-PLN-001', title: 'Planner page loads', preconditions: 'Logged in, navigate to Planner', steps: '1. Click Planner in nav\n2. Verify page content', expected: 'Planner page displayed\nProject list/grid visible\nTask management controls available', priority: 'Critical', type: 'Functional', ref: 'planner.spec.ts', component: 'PlannerPage', notes: '' },
          { id: 'TC-PLN-002', title: 'Project list in planner', preconditions: 'On planner page', steps: '1. Check project list\n2. Verify project details', expected: 'All assigned projects listed\nProject status visible\nTask count per project shown', priority: 'High', type: 'Functional', ref: 'planner-projects.spec.ts', component: 'PlannerPage', notes: '' },
        ]
      },
      {
        id: 'TS-Pln-Tasks',
        name: 'Planner Tasks',
        description: 'Task CRUD, task assignment, task details',
        tests: [
          { id: 'TC-PLN-010', title: 'Task list displays', preconditions: 'On planner page, project selected', steps: '1. Select a project\n2. View task list', expected: 'Tasks for selected project displayed\nTask details (name, assignee, status) visible\nSort/filter available', priority: 'High', type: 'Functional', ref: 'planner-tasks.spec.ts', component: 'PlannerPage', notes: '' },
          { id: 'TC-PLN-011', title: 'Create new task', preconditions: 'On planner tasks view', steps: '1. Click create task button\n2. Fill task form\n3. Save task', expected: 'Task created and appears in list\nTask details saved correctly', priority: 'High', type: 'Functional', ref: 'planner-tasks.spec.ts', component: 'PlannerPage', notes: '' },
        ]
      },
      {
        id: 'TS-Pln-Tickets',
        name: 'Planner Tickets',
        description: 'Ticket integration, ticket linking',
        tests: [
          { id: 'TC-PLN-020', title: 'Tickets section visible', preconditions: 'On planner page', steps: '1. Navigate to tickets section\n2. Verify content', expected: 'Tickets section displayed\nLinked tickets visible\nTicket status shown', priority: 'Medium', type: 'Functional', ref: 'planner-tickets.spec.ts', component: 'PlannerPage', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Task CRUD', risk: 'Creating tasks modifies shared project data', likelihood: 'High', impact: 'Medium', severity: 'Medium', mitigation: 'Clean up created tasks after tests' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'DM, PM', useCase: 'Full planner access' },
      { user: 'ailin', roles: 'TECH_LEAD', useCase: 'Tech lead planner access' },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    nameRu: 'Бухгалтерия',
    prefix: 'ACC',
    specFiles: ['accounting.spec.ts', 'accounting-payment.spec.ts', 'accounting-periods.spec.ts', 'accounting-salary.spec.ts', 'accounting-sick-leaves.spec.ts', 'accounting-vacation-correction.spec.ts', 'accounting-roles.spec.ts'],
    totalTests: 152,
    rating: 'B',
    effectiveCoverage: '55%',
    suites: [
      {
        id: 'TS-Acc-Salary',
        name: 'Salary Management',
        description: 'Salary page, employee salary data, filters',
        tests: [
          { id: 'TC-ACC-001', title: 'Salary page loads', preconditions: 'Logged in as accountant (pvaynmaster)', steps: '1. Navigate to Accounting > Salary\n2. Verify page content', expected: 'Salary table displayed\nEmployee list with salary data\nFilter by office/department available', priority: 'Critical', type: 'Functional', ref: 'accounting-salary.spec.ts', component: 'AccountingPage', notes: '' },
          { id: 'TC-ACC-002', title: 'Salary data correct format', preconditions: 'On salary page', steps: '1. Review salary numbers\n2. Check formatting', expected: 'Numbers formatted with currency\nDecimals consistent\nTotals calculated', priority: 'High', type: 'Functional', ref: 'accounting-salary.spec.ts', component: 'AccountingPage', notes: '' },
        ]
      },
      {
        id: 'TS-Acc-Periods',
        name: 'Period Management',
        description: 'Period open/close, period table',
        tests: [
          { id: 'TC-ACC-010', title: 'Periods page loads', preconditions: 'On Accounting > Periods', steps: '1. Navigate to Periods page\n2. Verify period list', expected: 'Periods table displayed\nOpen/closed status shown\nDate ranges visible', priority: 'High', type: 'Functional', ref: 'accounting-periods.spec.ts', component: 'AccountingPage', notes: '' },
          { id: 'TC-ACC-011', title: 'Period status indicators', preconditions: 'On periods page', steps: '1. Check period status colors\n2. Verify open vs closed', expected: 'Open periods highlighted differently from closed\nStatus clearly indicated', priority: 'Medium', type: 'Functional', ref: 'accounting-periods.spec.ts', component: 'AccountingPage', notes: '' },
        ]
      },
      {
        id: 'TS-Acc-Payment',
        name: 'Vacation Payment',
        description: 'Payment processing, payment status',
        tests: [
          { id: 'TC-ACC-020', title: 'Payment page loads', preconditions: 'On Accounting > Vacation Payment', steps: '1. Navigate to Payment page\n2. Verify content', expected: 'Payment table displayed\nEmployee vacation payment data shown\nFilter controls available', priority: 'High', type: 'Functional', ref: 'accounting-payment.spec.ts', component: 'AccountingPage', notes: '' },
        ]
      },
      {
        id: 'TS-Acc-SickLeave',
        name: 'Accounting Sick Leaves',
        description: 'Sick leave management from accounting perspective',
        tests: [
          { id: 'TC-ACC-030', title: 'Sick leaves page loads', preconditions: 'On Accounting > Sick Leaves', steps: '1. Navigate to page\n2. Verify content', expected: 'Sick leave table displayed\nEmployee sick leave data shown\nDate ranges and status visible', priority: 'High', type: 'Functional', ref: 'accounting-sick-leaves.spec.ts', component: 'AccountingPage', notes: '' },
        ]
      },
      {
        id: 'TS-Acc-VacCorrection',
        name: 'Vacation Days Correction',
        description: 'Vacation days adjustment, correction workflow',
        tests: [
          { id: 'TC-ACC-040', title: 'Vacation correction page loads', preconditions: 'On Accounting > Vacation Days Correction', steps: '1. Navigate to page\n2. Verify content', expected: 'Correction table displayed\nEmployee vacation day adjustments shown\nEdit controls available', priority: 'High', type: 'Functional', ref: 'accounting-vacation-correction.spec.ts', component: 'AccountingPage', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Period Close', risk: 'Closing period locks all employee reports — irreversible', likelihood: 'High', impact: 'Critical', severity: 'Critical', mitigation: 'NEVER close periods in tests, only verify UI' },
      { feature: 'Salary Data', risk: 'Sensitive financial data — privacy concerns', likelihood: 'Medium', impact: 'Medium', severity: 'Medium', mitigation: 'Use QA env with test data only' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'ACCOUNTANT, DM', useCase: 'Full accounting access' },
      { user: 'lprokhorova', roles: 'ACCOUNTANT', useCase: 'Accountant-only access' },
      { user: 'perekrest', roles: 'CHIEF_ACCOUNTANT', useCase: 'Chief accountant access' },
    ],
  },
  {
    id: 'statistics',
    name: 'Statistics',
    nameRu: 'Статистика',
    prefix: 'STAT',
    specFiles: ['statistics.spec.ts', 'statistics-subpages.spec.ts', 'statistics-deep.spec.ts'],
    totalTests: 27,
    rating: 'D',
    effectiveCoverage: '20%',
    suites: [
      {
        id: 'TS-Stat-Overview',
        name: 'Statistics Overview',
        description: 'Main statistics page, tabs, overall metrics',
        tests: [
          { id: 'TC-STAT-001', title: 'Statistics page loads', preconditions: 'Logged in as DM/admin', steps: '1. Navigate to Statistics\n2. Verify page content', expected: 'Statistics page displayed\nTabs visible (General, Reports)\nData tables loaded', priority: 'Critical', type: 'Functional', ref: 'statistics.spec.ts', component: 'StatisticsPage', notes: '' },
          { id: 'TC-STAT-002', title: 'Tab switching works', preconditions: 'On statistics page', steps: '1. Click each tab\n2. Verify content changes', expected: 'Content updates for each tab\nActive tab highlighted\nNo errors on switch', priority: 'High', type: 'Functional', ref: 'statistics-subpages.spec.ts', component: 'StatisticsPage', notes: '' },
        ]
      },
      {
        id: 'TS-Stat-Filters',
        name: 'Statistics Filters',
        description: 'Department, date, employee filters',
        tests: [
          { id: 'TC-STAT-010', title: 'Filter by department', preconditions: 'On statistics page', steps: '1. Select department from filter\n2. Verify table updates', expected: 'Data filtered to selected department\nTotals recalculated\nFilter indicator shown', priority: 'High', type: 'Functional', ref: 'statistics-deep.spec.ts', component: 'StatisticsPage', notes: '' },
          { id: 'TC-STAT-011', title: 'Filter by date range', preconditions: 'On statistics page', steps: '1. Set date range\n2. Verify data updates', expected: 'Data shows only selected period\nTotals match period', priority: 'High', type: 'Functional', ref: 'statistics-deep.spec.ts', component: 'StatisticsPage', notes: '' },
          { id: 'TC-STAT-012', title: 'Contractor filter toggle', preconditions: 'On statistics page', steps: '1. Toggle "Include contractors" checkbox\n2. Verify table updates', expected: 'Contractors shown/hidden based on toggle\nTotals recalculated', priority: 'Medium', type: 'Functional', ref: '', component: 'StatisticsPage', notes: '' },
        ]
      },
      {
        id: 'TS-Stat-Export',
        name: 'Statistics Export',
        description: 'Data export functionality',
        tests: [
          { id: 'TC-STAT-020', title: 'Export button visible', preconditions: 'On statistics page with data', steps: '1. Look for export button\n2. Click export', expected: 'Export button visible\nFile download initiated or export modal shown', priority: 'Medium', type: 'Functional', ref: '', component: 'StatisticsPage', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Data Volume', risk: 'Heavy queries timeout on large datasets', likelihood: 'High', impact: 'Medium', severity: 'High', mitigation: 'Use date range filters to limit data, increase timeout' },
      { feature: 'Coverage', risk: 'Only 20% effective coverage — most tests are shallow', likelihood: 'High', impact: 'Medium', severity: 'High', mitigation: 'Priority: add deep filter and calculation tests' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'DM, all roles', useCase: 'Full statistics access' },
    ],
  },
  {
    id: 'employee-tasks',
    name: 'Employee Tasks',
    nameRu: 'Задачи сотрудника',
    prefix: 'ET',
    specFiles: ['employee-tasks.spec.ts', 'employee-tasks-deep.spec.ts'],
    totalTests: 55,
    rating: 'B',
    effectiveCoverage: '50%',
    suites: [
      {
        id: 'TS-ET-Tasks',
        name: 'Task View',
        description: 'Employee task list, task details, hours tracking',
        tests: [
          { id: 'TC-ET-001', title: 'My Tasks page loads', preconditions: 'Logged in as pvaynmaster', steps: '1. Click My Tasks in nav\n2. Verify page content', expected: 'Tasks page displayed\nTask list with projects visible\nHours summary shown', priority: 'Critical', type: 'Functional', ref: 'employee-tasks.spec.ts', component: 'EmployeeTasksPage', notes: 'First link in navbar' },
          { id: 'TC-ET-002', title: 'Task details expand', preconditions: 'On My Tasks page', steps: '1. Click on task row\n2. Verify expanded details', expected: 'Task details expanded/shown\nProject name, hours, description visible', priority: 'High', type: 'Functional', ref: 'employee-tasks.spec.ts', component: 'EmployeeTasksPage', notes: '' },
          { id: 'TC-ET-003', title: 'Color indicators for hours', preconditions: 'Tasks with various hours', steps: '1. Check color coding on task cells\n2. Compare with expected colors', expected: 'Green for normal hours\nRed for missing/zero\nYellow for overtime', priority: 'Medium', type: 'Functional', ref: 'employee-tasks.spec.ts', component: 'EmployeeTasksPage, CSS', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Task Data', risk: 'Depends on report data — if reports are empty, tasks are empty', likelihood: 'Medium', impact: 'Medium', severity: 'Medium', mitigation: 'Ensure test data exists before running task tests' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'All roles', useCase: 'Full task access' },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    nameRu: 'Уведомления',
    prefix: 'NTF',
    specFiles: ['notifications.spec.ts', 'notifications-deep.spec.ts', 'email-notifications.spec.ts'],
    totalTests: 75,
    rating: 'B',
    effectiveCoverage: '50%',
    suites: [
      {
        id: 'TS-Ntf-InApp',
        name: 'In-App Notifications',
        description: 'Notification list, read/unread, deletion',
        tests: [
          { id: 'TC-NTF-001', title: 'Notifications page loads', preconditions: 'Logged in', steps: '1. Click Notifications in nav\n2. Verify page content', expected: 'Notifications list displayed\nRead/unread distinction visible\nNotification counter in navbar', priority: 'Critical', type: 'Functional', ref: 'notifications.spec.ts', component: 'NotificationsPage', notes: '' },
          { id: 'TC-NTF-002', title: 'Mark notification as read', preconditions: 'Unread notifications exist', steps: '1. Click on unread notification\n2. Verify status change', expected: 'Notification marked as read\nVisual indicator changes\nCounter decrements', priority: 'High', type: 'Functional', ref: 'notifications-deep.spec.ts', component: 'NotificationsPage', notes: '' },
          { id: 'TC-NTF-003', title: 'Notification counter in navbar', preconditions: 'Unread notifications exist', steps: '1. Check navbar notification icon\n2. Verify counter number', expected: 'Counter shows number of unread notifications\nCounter updates when notification read', priority: 'High', type: 'Functional', ref: 'notifications.spec.ts', component: 'NavigationComponent', notes: '' },
        ]
      },
      {
        id: 'TS-Ntf-Email',
        name: 'Email Notifications',
        description: 'Email notification settings, triggers',
        tests: [
          { id: 'TC-NTF-010', title: 'Email notification settings page', preconditions: 'On settings page', steps: '1. Navigate to notification settings\n2. Verify email options', expected: 'Email notification toggles visible\nCategories for notifications shown\nSave button available', priority: 'Medium', type: 'Functional', ref: 'email-notifications.spec.ts', component: 'UserSettingsPage', notes: '' },
        ]
      },
    ],
    risks: [
      { feature: 'Notifications', risk: 'Marking all as read is irreversible', likelihood: 'Medium', impact: 'Low', severity: 'Low', mitigation: 'Test with caution, verify counter changes' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'All roles', useCase: 'Receives various notification types' },
    ],
  },
  {
    id: 'faq',
    name: 'FAQ',
    nameRu: 'Часто задаваемые вопросы',
    prefix: 'FAQ',
    specFiles: ['faq.spec.ts', 'faq-deep.spec.ts'],
    totalTests: 5,
    rating: 'D',
    effectiveCoverage: '17%',
    suites: [
      {
        id: 'TS-FAQ-Content',
        name: 'FAQ Content',
        description: 'FAQ page loading, content display',
        tests: [
          { id: 'TC-FAQ-001', title: 'FAQ page loads', preconditions: 'Logged in', steps: '1. Navigate to FAQ page\n2. Verify content', expected: 'FAQ page displayed\nQuestion/answer sections visible\nNavigation or categories shown', priority: 'High', type: 'Functional', ref: 'faq.spec.ts', component: 'FAQPage', notes: 'Minimal module' },
          { id: 'TC-FAQ-002', title: 'FAQ sections expand/collapse', preconditions: 'On FAQ page', steps: '1. Click on FAQ question\n2. Verify answer expands', expected: 'Answer section expands\nAnswer text visible\nOther sections can toggle independently', priority: 'Medium', type: 'Functional', ref: 'faq-deep.spec.ts', component: 'FAQPage', notes: '' },
          { id: 'TC-FAQ-003', title: 'FAQ search (if available)', preconditions: 'On FAQ page', steps: '1. Look for search field\n2. Enter search term if available', expected: 'Search filters FAQ items\nMatching questions highlighted', priority: 'Low', type: 'Functional', ref: '', component: 'FAQPage', notes: 'Search may not exist' },
        ]
      },
    ],
    risks: [
      { feature: 'Content', risk: 'FAQ content is static — minimal test value', likelihood: 'Low', impact: 'Low', severity: 'Low', mitigation: 'Basic smoke test only' },
    ],
    testUsers: [
      { user: 'pvaynmaster', roles: 'Any', useCase: 'FAQ is public for all authenticated users' },
    ],
  },
];

// ============================================================================
// Generator functions
// ============================================================================

function addPlanOverview(wb, module) {
  const ws = wb.addWorksheet('Plan Overview');
  ws.properties.defaultColWidth = 25;

  // Title row
  ws.mergeCells('A1:J1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `${module.name} — Test Plan`;
  titleCell.font = { ...TITLE_FONT, size: 16 };
  titleCell.fill = HEADER_FILL;
  titleCell.font = { ...TITLE_FONT, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  // Metadata row
  ws.mergeCells('A2:J2');
  const metaCell = ws.getCell('A2');
  const now = new Date();
  metaCell.value = `Generated: ${now.toISOString().slice(0, 16).replace('T', ' ')} | Branch: docs/test-docs-xlsx | Module: ${module.id}`;
  metaCell.font = { italic: true, size: 10, color: { argb: 'FF666666' } };

  // Section 1: Scope
  let row = 4;
  ws.getCell(`A${row}`).value = '1. Scope & Objectives';
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;
  ws.mergeCells(`A${row}:J${row}`);
  ws.getCell(`A${row}`).value = `Comprehensive test coverage for the ${module.name} module (${module.nameRu}). Includes functional, negative, boundary, and security tests.`;
  ws.getCell(`A${row}`).alignment = { wrapText: true };
  row += 2;

  // Section 2: Environment
  ws.getCell(`A${row}`).value = '2. Environment Requirements';
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;

  const envData = [
    ['Primary Test Env', 'ttt-qa-2.noveogroup.com — QA environment (VPN required)'],
    ['Authentication', 'Username-only login (CAS disabled on QA)'],
    ['Database', 'PostgreSQL 10.0.4.222:5433, schema: ttt_backend'],
    ['Test Framework', 'Playwright + TypeScript, workers=2 max'],
    ['Test Users', module.testUsers.map(u => `${u.user} (${u.roles})`).join(', ')],
    ['Browser', 'Chromium (headless)'],
  ];

  envData.forEach(([key, val]) => {
    ws.getCell(`A${row}`).value = key;
    ws.getCell(`A${row}`).font = { bold: true };
    ws.getCell(`B${row}`).value = val;
    ws.getCell(`B${row}`).alignment = { wrapText: true };
    row++;
  });
  row++;

  // Section 3: Test Suites
  ws.getCell(`A${row}`).value = '3. Test Suites';
  ws.getCell(`A${row}`).font = SECTION_FONT;
  ws.getCell(`B${row}`).value = module.suites.length;
  row++;

  // Suite table header
  ['Suite ID', 'Suite Name', 'Cases', 'Description'].forEach((h, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.border = BORDER_THIN;
  });
  row++;

  // Suite rows with hyperlinks
  module.suites.forEach(suite => {
    ws.getCell(`A${row}`).value = { text: suite.id, hyperlink: `#'${suite.id}'!A1` };
    ws.getCell(`A${row}`).font = { color: { argb: 'FF0563C1' }, underline: true };
    ws.getCell(`B${row}`).value = suite.name;
    ws.getCell(`C${row}`).value = suite.tests.length;
    ws.getCell(`D${row}`).value = suite.description;
    ws.getCell(`D${row}`).alignment = { wrapText: true };
    for (let c = 1; c <= 4; c++) ws.getCell(row, c).border = BORDER_THIN;
    row++;
  });

  // Total row
  ws.getCell(`A${row}`).value = 'TOTAL';
  ws.getCell(`A${row}`).font = { bold: true };
  ws.getCell(`C${row}`).value = module.suites.reduce((sum, s) => sum + s.tests.length, 0);
  ws.getCell(`C${row}`).font = { bold: true };
  for (let c = 1; c <= 4; c++) ws.getCell(row, c).border = BORDER_THIN;
  row += 2;

  // Section 4: Key Metrics
  ws.getCell(`A${row}`).value = '4. Key Metrics';
  ws.getCell(`A${row}`).font = SECTION_FONT;
  row++;

  const totalCases = module.suites.reduce((sum, s) => sum + s.tests.length, 0);
  const metrics = [
    ['Total Test Cases (this doc)', totalCases],
    ['Existing Automated Tests', module.totalTests],
    ['Current Quality Rating', module.rating],
    ['Effective Coverage', module.effectiveCoverage],
    ['Risk Items', module.risks.length],
    ['Spec Files', module.specFiles.join(', ')],
  ];

  metrics.forEach(([key, val]) => {
    ws.getCell(`A${row}`).value = key;
    ws.getCell(`A${row}`).font = { bold: true };
    ws.getCell(`B${row}`).value = val;
    row++;
  });
  row++;

  // Link to Test Data
  ws.getCell(`A${row}`).value = { text: 'Test Data Reference', hyperlink: `#'Test Data'!A1` };
  ws.getCell(`A${row}`).font = { color: { argb: 'FF0563C1' }, underline: true };

  // Set column widths
  ws.getColumn(1).width = 25;
  ws.getColumn(2).width = 45;
  ws.getColumn(3).width = 10;
  ws.getColumn(4).width = 55;
}

function addFeatureMatrix(wb, module) {
  const ws = wb.addWorksheet('Feature Matrix');

  // Back link
  ws.getCell('A1').value = { text: '<- Back to Plan', hyperlink: `#'Plan Overview'!A1` };
  ws.getCell('A1').font = { color: { argb: 'FF0563C1' }, underline: true };

  // Title
  ws.mergeCells('A2:H2');
  ws.getCell('A2').value = 'Feature × Test Type Coverage Matrix';
  ws.getCell('A2').font = TITLE_FONT;

  // Header row
  const headers = ['Feature', 'Functional', 'Negative', 'Boundary', 'Security', 'Total', 'Suite Link'];
  headers.forEach((h, i) => {
    const cell = ws.getCell(4, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.border = BORDER_THIN;
  });

  let row = 5;
  let grandTotal = { Functional: 0, Negative: 0, Boundary: 0, Security: 0, total: 0 };

  module.suites.forEach(suite => {
    const counts = { Functional: 0, Negative: 0, Boundary: 0, Security: 0 };
    suite.tests.forEach(t => {
      if (counts[t.type] !== undefined) counts[t.type]++;
      else counts.Functional++; // default
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    ws.getCell(row, 1).value = suite.name;
    ws.getCell(row, 2).value = counts.Functional || '';
    ws.getCell(row, 3).value = counts.Negative || '';
    ws.getCell(row, 4).value = counts.Boundary || '';
    ws.getCell(row, 5).value = counts.Security || '';
    ws.getCell(row, 6).value = total;
    ws.getCell(row, 7).value = { text: suite.id, hyperlink: `#'${suite.id}'!A1` };
    ws.getCell(row, 7).font = { color: { argb: 'FF0563C1' }, underline: true };

    for (let c = 1; c <= 7; c++) ws.getCell(row, c).border = BORDER_THIN;

    grandTotal.Functional += counts.Functional;
    grandTotal.Negative += counts.Negative;
    grandTotal.Boundary += counts.Boundary;
    grandTotal.Security += counts.Security;
    grandTotal.total += total;
    row++;
  });

  // Total row
  ws.getCell(row, 1).value = 'TOTAL';
  ws.getCell(row, 1).font = { bold: true };
  ws.getCell(row, 2).value = grandTotal.Functional;
  ws.getCell(row, 3).value = grandTotal.Negative;
  ws.getCell(row, 4).value = grandTotal.Boundary;
  ws.getCell(row, 5).value = grandTotal.Security;
  ws.getCell(row, 6).value = grandTotal.total;
  ws.getCell(row, 6).font = { bold: true };
  for (let c = 1; c <= 7; c++) {
    ws.getCell(row, c).border = BORDER_THIN;
    ws.getCell(row, c).font = { ...ws.getCell(row, c).font, bold: true };
  }

  // Column widths
  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 12;
  ws.getColumn(3).width = 12;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 12;
  ws.getColumn(6).width = 10;
  ws.getColumn(7).width = 25;
}

function addRiskAssessment(wb, module) {
  const ws = wb.addWorksheet('Risk Assessment');

  // Back link
  ws.getCell('A1').value = { text: '<- Back to Plan', hyperlink: `#'Plan Overview'!A1` };
  ws.getCell('A1').font = { color: { argb: 'FF0563C1' }, underline: true };

  // Header
  const headers = ['Feature', 'Risk Description', 'Likelihood', 'Impact', 'Severity', 'Mitigation / Test Focus'];
  headers.forEach((h, i) => {
    const cell = ws.getCell(3, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.border = BORDER_THIN;
  });

  let row = 4;
  module.risks.forEach(risk => {
    ws.getCell(row, 1).value = risk.feature;
    ws.getCell(row, 2).value = risk.risk;
    ws.getCell(row, 2).alignment = { wrapText: true };
    ws.getCell(row, 3).value = risk.likelihood;
    ws.getCell(row, 4).value = risk.impact;
    ws.getCell(row, 5).value = risk.severity;
    ws.getCell(row, 6).value = risk.mitigation;
    ws.getCell(row, 6).alignment = { wrapText: true };

    // Color-code severity
    const sevColors = { Critical: 'FFFF0000', High: 'FFFF6600', Medium: 'FFFFC000', Low: 'FF92D050' };
    if (sevColors[risk.severity]) {
      ws.getCell(row, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sevColors[risk.severity] } };
      if (risk.severity === 'Critical' || risk.severity === 'High') {
        ws.getCell(row, 5).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    }

    for (let c = 1; c <= 6; c++) ws.getCell(row, c).border = BORDER_THIN;
    row++;
  });

  // Column widths
  ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 50;
  ws.getColumn(3).width = 12;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 12;
  ws.getColumn(6).width = 45;
}

function addTestSuite(wb, suite, module) {
  const ws = wb.addWorksheet(suite.id);

  // Back link + Suite title
  ws.getCell('A1').value = { text: '<- Back to Plan', hyperlink: `#'Plan Overview'!A1` };
  ws.getCell('A1').font = { color: { argb: 'FF0563C1' }, underline: true };
  ws.getCell('B1').value = `Suite: ${suite.name}`;
  ws.getCell('B1').font = TITLE_FONT;

  // 10-column header
  const headers = ['Test ID', 'Title', 'Preconditions', 'Steps', 'Expected Result', 'Priority', 'Type', 'Requirement Ref', 'Module/Component', 'Notes'];
  headers.forEach((h, i) => {
    const cell = ws.getCell(3, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.border = BORDER_THIN;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  ws.getRow(3).height = 25;

  // Test rows
  let row = 4;
  suite.tests.forEach(test => {
    ws.getCell(row, 1).value = test.id;
    ws.getCell(row, 1).font = { bold: true };
    ws.getCell(row, 2).value = test.title;
    ws.getCell(row, 3).value = test.preconditions;
    ws.getCell(row, 4).value = test.steps;
    ws.getCell(row, 5).value = test.expected;
    ws.getCell(row, 6).value = test.priority;
    ws.getCell(row, 7).value = test.type;
    ws.getCell(row, 8).value = test.ref;
    ws.getCell(row, 9).value = test.component;
    ws.getCell(row, 10).value = test.notes;

    // Color-code priority
    if (PRIORITY_COLORS[test.priority]) {
      ws.getCell(row, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIORITY_COLORS[test.priority] } };
      if (test.priority === 'Critical' || test.priority === 'High') {
        ws.getCell(row, 6).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    }

    // Color-code type
    if (TYPE_COLORS[test.type]) {
      ws.getCell(row, 7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TYPE_COLORS[test.type] } };
      ws.getCell(row, 7).font = { color: { argb: 'FFFFFFFF' } };
    }

    // Wrap text and borders
    for (let c = 1; c <= 10; c++) {
      ws.getCell(row, c).border = BORDER_THIN;
      ws.getCell(row, c).alignment = { ...ws.getCell(row, c).alignment, wrapText: true, vertical: 'top' };
    }

    // Alternate row colors
    if (row % 2 === 0) {
      for (let c = 1; c <= 10; c++) {
        if (c !== 6 && c !== 7) { // Don't override priority/type colors
          ws.getCell(row, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        }
      }
    }

    row++;
  });

  // Column widths
  ws.getColumn(1).width = 14;
  ws.getColumn(2).width = 35;
  ws.getColumn(3).width = 30;
  ws.getColumn(4).width = 35;
  ws.getColumn(5).width = 35;
  ws.getColumn(6).width = 10;
  ws.getColumn(7).width = 12;
  ws.getColumn(8).width = 20;
  ws.getColumn(9).width = 25;
  ws.getColumn(10).width = 30;
}

function addTestData(wb, module) {
  const ws = wb.addWorksheet('Test Data');

  // Title
  ws.mergeCells('A1:C1');
  ws.getCell('A1').value = `${module.name} Test Data`;
  ws.getCell('A1').font = TITLE_FONT;

  // Back link
  ws.getCell('A2').value = { text: '<- Back to Plan', hyperlink: `#'Plan Overview'!A1` };
  ws.getCell('A2').font = { color: { argb: 'FF0563C1' }, underline: true };

  // Section 1: Test Users
  let row = 4;
  ws.mergeCells(`A${row}:C${row}`);
  ws.getCell(`A${row}`).value = '1. Recommended Test Users (Module-Specific)';
  ws.getCell(`A${row}`).font = SECTION_FONT;
  ws.getCell(`A${row}`).fill = SUBHEADER_FILL;
  row++;

  ['User / Login', 'Roles', 'Use Case'].forEach((h, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.border = BORDER_THIN;
  });
  row++;

  module.testUsers.forEach(user => {
    ws.getCell(row, 1).value = user.user;
    ws.getCell(row, 1).font = { bold: true };
    ws.getCell(row, 2).value = user.roles;
    ws.getCell(row, 3).value = user.useCase;
    for (let c = 1; c <= 3; c++) ws.getCell(row, c).border = BORDER_THIN;
    row++;
  });

  row += 2;

  // Section 2: Common test users
  ws.mergeCells(`A${row}:C${row}`);
  ws.getCell(`A${row}`).value = '2. Common Multi-Role Test Users (All Modules)';
  ws.getCell(`A${row}`).font = SECTION_FONT;
  ws.getCell(`A${row}`).fill = SUBHEADER_FILL;
  row++;

  ['Login', 'Roles', 'Best For'].forEach((h, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.border = BORDER_THIN;
  });
  row++;

  const commonUsers = [
    { login: 'pvaynmaster', roles: 'ACCOUNTANT, ADMIN, CHIEF_OFFICER, DEPT_MGR, EMPLOYEE, HR, PM', best: 'Multi-role with CHIEF_OFFICER. Primary test user.' },
    { login: 'perekrest', roles: 'ACCOUNTANT, ADMIN, CHIEF_ACCOUNTANT, DEPT_MGR, EMPLOYEE, HR, PM', best: 'Best multi-role user (7 roles). Cross-role testing.' },
    { login: 'slebedev', roles: 'ADMIN', best: 'Admin-only. Negative tests for non-admin features.' },
    { login: 'abaymaganov', roles: 'EMPLOYEE', best: 'Employee-only. Negative tests for admin/accounting.' },
    { login: 'aleksey.pushkarev', roles: 'CONTRACTOR', best: 'Contractor. Restricted access testing.' },
    { login: 'lprokhorova', roles: 'ACCOUNTANT', best: 'Accountant-only. Accounting access testing.' },
    { login: 'adanilevskaya', roles: 'VIEW_ALL', best: 'View-all. Read-only access testing.' },
    { login: 'ailin', roles: 'TECH_LEAD', best: 'Tech lead. Planner/technical access.' },
    { login: 'nshumakov', roles: 'DEPT_MANAGER', best: 'Dept manager. Department-level access.' },
    { login: 'aglushko', roles: 'PM', best: 'Project manager. Project-level access.' },
    { login: 'ekile', roles: 'OFFICE_HR', best: 'Office HR. HR-specific features.' },
  ];

  commonUsers.forEach(u => {
    ws.getCell(row, 1).value = u.login;
    ws.getCell(row, 1).font = { bold: true };
    ws.getCell(row, 2).value = u.roles;
    ws.getCell(row, 3).value = u.best;
    for (let c = 1; c <= 3; c++) ws.getCell(row, c).border = BORDER_THIN;
    row++;
  });

  row += 2;

  // Section 3: Environment
  ws.mergeCells(`A${row}:C${row}`);
  ws.getCell(`A${row}`).value = '3. Environment Configuration';
  ws.getCell(`A${row}`).font = SECTION_FONT;
  ws.getCell(`A${row}`).fill = SUBHEADER_FILL;
  row++;

  const envConfig = [
    ['Base URL', 'https://ttt-qa-2.noveogroup.com/'],
    ['DB Host', '10.0.4.222:5433'],
    ['DB Name', 'ttt'],
    ['DB Schema', 'ttt_backend'],
    ['VPN Required', 'Yes'],
    ['Workers', '2 (max, server overloads with more)'],
    ['Timeout', '60s per test'],
    ['Browser', 'Chromium (headless)'],
  ];

  envConfig.forEach(([key, val]) => {
    ws.getCell(row, 1).value = key;
    ws.getCell(row, 1).font = { bold: true };
    ws.getCell(row, 2).value = val;
    for (let c = 1; c <= 2; c++) ws.getCell(row, c).border = BORDER_THIN;
    row++;
  });

  // Column widths
  ws.getColumn(1).width = 25;
  ws.getColumn(2).width = 55;
  ws.getColumn(3).width = 50;
}

// ============================================================================
// Main generator
// ============================================================================

async function generateModuleDoc(module) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'TTT QA Automation';
  wb.created = new Date();

  // 1. Plan Overview
  addPlanOverview(wb, module);

  // 2. Feature Matrix
  addFeatureMatrix(wb, module);

  // 3. Risk Assessment
  addRiskAssessment(wb, module);

  // 4. Test Suite sheets
  module.suites.forEach(suite => {
    addTestSuite(wb, suite, module);
  });

  // 5. Test Data
  addTestData(wb, module);

  // Write file
  const dir = join(OUTPUT_DIR, module.id);
  mkdirSync(dir, { recursive: true });
  const filepath = join(dir, `${module.id}.xlsx`);
  await wb.xlsx.writeFile(filepath);

  const totalCases = module.suites.reduce((sum, s) => sum + s.tests.length, 0);
  console.log(`  [OK] ${module.id}.xlsx — ${module.suites.length} suites, ${totalCases} test cases`);
  return filepath;
}

async function main() {
  console.log('TTT Test Documentation Generator');
  console.log('================================\n');

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Merge additional test cases into modules
  for (const module of MODULES) {
    const additional = ADDITIONAL_SUITES[module.id];
    if (additional) {
      module.suites.push(...additional);
    }
    await generateModuleDoc(module);
  }

  console.log(`\nDone! Generated ${MODULES.length} xlsx files in ${OUTPUT_DIR}`);

  // Summary
  const totalSuites = MODULES.reduce((sum, m) => sum + m.suites.length, 0);
  const totalCases = MODULES.reduce((sum, m) => sum + m.suites.reduce((s, suite) => s + suite.tests.length, 0), 0);
  console.log(`Total: ${totalSuites} suites, ${totalCases} test cases across ${MODULES.length} modules`);
}

main().catch(console.error);
