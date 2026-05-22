/**
 * Additional test cases based on QA report gaps analysis
 * These extend the base module definitions with P0/P1 critical gaps
 */

export const ADDITIONAL_SUITES = {
  auth: [
    {
      id: 'TS-Auth-Session',
      name: 'Session Management',
      description: 'Session persistence, timeout, concurrent sessions',
      tests: [
        { id: 'TC-AUTH-050', title: 'Session timeout handling', preconditions: 'Logged in, session about to expire', steps: '1. Login\n2. Wait for session timeout (or set short TTL)\n3. Try to access protected page', expected: 'Redirect to login page\nSession expired message\nNo stale data accessible', priority: 'High', type: 'Security', ref: '', component: 'AuthFilter, Session', notes: 'Timeout value from server config' },
        { id: 'TC-AUTH-051', title: 'Concurrent sessions', preconditions: 'Login as same user in 2 browsers', steps: '1. Login in browser A\n2. Login in browser B\n3. Verify both sessions active', expected: 'Both sessions work independently\nOr: last session invalidates previous', priority: 'Medium', type: 'Security', ref: '', component: 'Session', notes: '' },
        { id: 'TC-AUTH-052', title: 'Direct URL access without auth', preconditions: 'Not logged in', steps: '1. Open /report directly\n2. Open /admin directly\n3. Open /admin/account directly', expected: 'All redirect to login page\nNo partial page content visible\nNo data leakage', priority: 'Critical', type: 'Security', ref: '', component: 'AuthFilter', notes: '' },
      ]
    },
    {
      id: 'TS-Auth-Settings',
      name: 'User Settings (Account Page)',
      description: '/admin/account — profile, trackers, export tabs',
      tests: [
        { id: 'TC-AUTH-060', title: 'Account page — General tab content', preconditions: 'On /admin/account', steps: '1. Verify General tab is active\n2. Check profile section\n3. Check settings fields', expected: 'Username displayed\nSave settings button visible\nDays transfer spinbutton visible', priority: 'High', type: 'Functional', ref: 'user-settings.spec.ts:TR-992', component: 'UserSettingsPage', notes: 'Tabs are <button> elements' },
        { id: 'TC-AUTH-061', title: 'Account page — Trackers tab', preconditions: 'On /admin/account', steps: '1. Click Trackers tab\n2. Verify tracker list\n3. Check Add tracker button', expected: 'Tracker list displayed (table)\nAdd tracker button visible\nExisting trackers show edit/delete', priority: 'High', type: 'Functional', ref: 'user-settings.spec.ts:TR-1001', component: 'UserSettingsPage', notes: '' },
        { id: 'TC-AUTH-062', title: 'Account page — Add tracker form', preconditions: 'On Trackers tab', steps: '1. Click Add tracker button\n2. Verify modal form\n3. Check required fields', expected: 'Modal with name, URL, token fields\nProject select available\nSave button in modal', priority: 'Medium', type: 'Functional', ref: 'user-settings.spec.ts:TR-1004', component: 'UserSettingsPage', notes: '' },
        { id: 'TC-AUTH-063', title: 'Account page — Export tab', preconditions: 'On /admin/account', steps: '1. Click Export tab\n2. Verify export section', expected: 'Export section visible\nExport button available\nFormat options shown', priority: 'Medium', type: 'Functional', ref: 'user-settings.spec.ts:TR-1008', component: 'UserSettingsPage', notes: '' },
        { id: 'TC-AUTH-064', title: 'Save profile settings', preconditions: 'On General tab', steps: '1. Modify a setting value\n2. Click Save settings button\n3. Verify save success', expected: 'Settings saved\nSuccess notification shown\nValues persist after page reload', priority: 'High', type: 'Functional', ref: 'user-settings.spec.ts:TR-999', component: 'UserSettingsPage', notes: 'Button: Сохранить настройки / Save settings' },
      ]
    },
  ],

  report: [
    {
      id: 'TS-Rpt-Colors',
      name: 'Color Indicators & Visual Feedback',
      description: 'Color coding for hours, warnings, status indicators',
      tests: [
        { id: 'TC-RPT-050', title: 'Zero hours — red indicator', preconditions: 'Task row with 0 hours for a day', steps: '1. Check cell with 0 hours\n2. Verify CSS class/color', expected: 'Cell has red/warning color\nVisual distinction from normal hours', priority: 'Medium', type: 'Functional', ref: 'report.spec.ts:TR-56', component: 'ReportPage, CSS', notes: '' },
        { id: 'TC-RPT-051', title: 'Normal hours (8h) — green indicator', preconditions: 'Task row with 8 hours', steps: '1. Enter 8 hours\n2. Check cell color', expected: 'Cell has green/normal color\nNo warning indicators', priority: 'Medium', type: 'Functional', ref: 'report.spec.ts:TR-58', component: 'ReportPage, CSS', notes: '' },
        { id: 'TC-RPT-052', title: 'Overtime (>8h) — warning indicator', preconditions: 'Task row with 10+ hours', steps: '1. Enter 10 hours for a day\n2. Check visual indicators', expected: 'Cell has orange/warning color\nOvertime indication visible', priority: 'Medium', type: 'Functional', ref: 'report.spec.ts:TR-60', component: 'ReportPage, CSS', notes: '' },
        { id: 'TC-RPT-053', title: 'Over 36h/day total — error', preconditions: 'Multiple tasks for same day', steps: '1. Enter hours totaling >36 for one day\n2. Check validation message', expected: 'Error/warning about exceeding daily limit\nVisual indicator on total row', priority: 'High', type: 'Negative', ref: '', component: 'ReportPage', notes: 'Figma: max 36h/day' },
      ]
    },
    {
      id: 'TS-Rpt-Comments',
      name: 'Task Comments',
      description: 'Comment CRUD on report tasks',
      tests: [
        { id: 'TC-RPT-060', title: 'Add comment to task', preconditions: 'Task row exists', steps: '1. Click comment icon/button on task row\n2. Enter comment text\n3. Save comment', expected: 'Comment saved\nComment text visible\nComment count updates', priority: 'High', type: 'Functional', ref: 'report.spec.ts:TR-28', component: 'ReportPage', notes: '' },
        { id: 'TC-RPT-061', title: 'Edit existing comment', preconditions: 'Task has a comment', steps: '1. Click edit on existing comment\n2. Modify text\n3. Save', expected: 'Comment updated\nNew text visible\nTimestamp updated', priority: 'Medium', type: 'Functional', ref: 'report.spec.ts:TR-30', component: 'ReportPage', notes: '' },
        { id: 'TC-RPT-062', title: 'Delete comment', preconditions: 'Task has a comment', steps: '1. Click delete on comment\n2. Confirm deletion', expected: 'Comment removed\nComment count decrements\nNo orphan data', priority: 'Medium', type: 'Functional', ref: '', component: 'ReportPage', notes: '' },
      ]
    },
    {
      id: 'TS-Rpt-Rename',
      name: 'Task Rename',
      description: 'Renaming tasks in report',
      tests: [
        { id: 'TC-RPT-070', title: 'Rename task', preconditions: 'Task row exists', steps: '1. Double-click or click rename on task name\n2. Enter new name\n3. Save', expected: 'Task renamed\nNew name persists after reload\nProject assignment unchanged', priority: 'High', type: 'Functional', ref: 'report.spec.ts:TR-37', component: 'ReportPage', notes: '' },
        { id: 'TC-RPT-071', title: 'Rename with empty name', preconditions: 'Task row exists', steps: '1. Start rename\n2. Clear name field\n3. Try to save', expected: 'Validation error\nOriginal name preserved\nNo empty task name allowed', priority: 'Medium', type: 'Negative', ref: '', component: 'ReportPage', notes: '' },
      ]
    },
  ],

  admin: [
    {
      id: 'TS-Adm-Offices',
      name: 'Office Management',
      description: '/admin/offices — CRUD for offices (CURRENTLY 0 TESTS)',
      tests: [
        { id: 'TC-ADM-050', title: 'Offices page loads', preconditions: 'Logged in as admin', steps: '1. Navigate to /admin/offices\n2. Verify page content', expected: 'Office list displayed\nAdd office button visible\nExisting offices with edit/delete', priority: 'Critical', type: 'Functional', ref: '', component: 'AdminSubpagesPage', notes: 'CRITICAL GAP: 0 tests for this page' },
        { id: 'TC-ADM-051', title: 'Office details display', preconditions: 'On offices page', steps: '1. Click on office row\n2. Verify details', expected: 'Office details shown\nCalendar type, country, timezone visible', priority: 'High', type: 'Functional', ref: '', component: 'AdminSubpagesPage', notes: '' },
        { id: 'TC-ADM-052', title: 'Add office form', preconditions: 'On offices page', steps: '1. Click Add office button\n2. Verify form fields', expected: 'Form with: name, country, calendar type, timezone\nSave/Cancel buttons', priority: 'High', type: 'Functional', ref: '', component: 'AdminSubpagesPage', notes: '' },
      ]
    },
    {
      id: 'TS-Adm-Salary',
      name: 'Admin Salary Settings',
      description: '/admin/salary — salary configuration (CURRENTLY 0 TESTS)',
      tests: [
        { id: 'TC-ADM-060', title: 'Admin salary page loads', preconditions: 'Logged in as admin', steps: '1. Navigate to /admin/salary\n2. Verify page content', expected: 'Salary settings page displayed\nConfiguration options visible', priority: 'Critical', type: 'Functional', ref: '', component: 'AdminSubpagesPage', notes: 'CRITICAL GAP: 0 tests for this page' },
        { id: 'TC-ADM-061', title: 'Salary rate display', preconditions: 'On admin salary page', steps: '1. Check salary rate table/list\n2. Verify data format', expected: 'Salary rates displayed\nCurrency format correct\nFilter/sort available', priority: 'High', type: 'Functional', ref: '', component: 'AdminSubpagesPage', notes: '' },
      ]
    },
    {
      id: 'TS-Adm-Export',
      name: 'Admin Export',
      description: '/admin/export — data export (CURRENTLY 0 TESTS)',
      tests: [
        { id: 'TC-ADM-070', title: 'Admin export page loads', preconditions: 'Logged in as admin', steps: '1. Navigate to Admin > Export\n2. Verify page content', expected: 'Export page displayed\nFormat selection available\nDate range selectors visible', priority: 'Critical', type: 'Functional', ref: '', component: 'AdminSubpagesPage', notes: 'CRITICAL GAP: 0 tests for this page' },
        { id: 'TC-ADM-071', title: 'Export format options', preconditions: 'On admin export page', steps: '1. Check format dropdown\n2. Verify available formats', expected: 'CSV, Excel formats available\nFormat selection works', priority: 'High', type: 'Functional', ref: '', component: 'AdminSubpagesPage', notes: '' },
        { id: 'TC-ADM-072', title: 'Export with date range', preconditions: 'On admin export page', steps: '1. Set date range\n2. Click export button\n3. Verify download', expected: 'File download starts\nFile contains data for selected period\nFormat matches selection', priority: 'High', type: 'Functional', ref: '', component: 'AdminSubpagesPage', notes: '' },
      ]
    },
    {
      id: 'TS-Adm-RoleAccess',
      name: 'Admin Role-Based Access',
      description: 'Access control for admin pages',
      tests: [
        { id: 'TC-ADM-080', title: 'Employee → /admin → no access', preconditions: 'Logged in as abaymaganov (EMPLOYEE)', steps: '1. Login as employee\n2. Navigate to /admin\n3. Check access', expected: 'Admin page not accessible\nRedirect to main page or 403\nNo admin menu in navbar', priority: 'Critical', type: 'Security', ref: '', component: 'AdminPage, RoleService', notes: 'CRITICAL GAP: 0 role-based tests' },
        { id: 'TC-ADM-081', title: 'Admin navbar visibility per role', preconditions: 'Different user roles', steps: '1. Login as EMPLOYEE\n2. Check navbar for admin button\n3. Login as ADMIN\n4. Check navbar', expected: 'EMPLOYEE: no admin button in navbar\nADMIN: admin button visible', priority: 'High', type: 'Security', ref: '', component: 'NavigationComponent', notes: '' },
      ]
    },
  ],

  vacation: [
    {
      id: 'TS-Vac-Lifecycle',
      name: 'Vacation Full Lifecycle',
      description: 'End-to-end vacation workflow: create → approve → pay',
      tests: [
        { id: 'TC-VAC-050', title: 'Create vacation request (happy path)', preconditions: 'Logged in, on My Vacations page', steps: '1. Click Create vacation\n2. Select type: Regular\n3. Set dates (5+ days in future)\n4. Submit', expected: 'Vacation created with status NEW\nAppears in list\nAvailable days decreased', priority: 'Critical', type: 'Functional', ref: '', component: 'VacationPage', notes: 'P0 gap from QA report' },
        { id: 'TC-VAC-051', title: 'Vacation status changes visible', preconditions: 'Vacation exists in system', steps: '1. Find vacation in list\n2. Check status column\n3. Verify status badge color', expected: 'Status displayed (NEW/PENDING/APPROVED/REJECTED)\nColor coding correct\nStatus filters work', priority: 'High', type: 'Functional', ref: '', component: 'VacationPage', notes: '' },
        { id: 'TC-VAC-052', title: 'Cancel own vacation', preconditions: 'Vacation in NEW/PENDING status', steps: '1. Find own vacation\n2. Click cancel button\n3. Confirm cancellation', expected: 'Status changes to CANCELED\nAvailable days restored\nApproval queue updated', priority: 'High', type: 'Functional', ref: '', component: 'VacationPage', notes: '' },
      ]
    },
    {
      id: 'TS-Vac-RoleAccess',
      name: 'Vacation Role-Based Access',
      description: 'Access control per role for vacation features',
      tests: [
        { id: 'TC-VAC-060', title: 'Employee — own vacations only', preconditions: 'Logged in as employee (abaymaganov)', steps: '1. Login as employee\n2. Check vacation menu\n3. Verify available pages', expected: 'Can see own vacations only\nNo manager view\nNo approve buttons', priority: 'Critical', type: 'Security', ref: '', component: 'VacationPage, RoleService', notes: 'P0 gap: 0 role tests' },
        { id: 'TC-VAC-061', title: 'Manager — employee vacation view', preconditions: 'Logged in as DM', steps: '1. Login as DM\n2. Navigate to Employee Days\n3. Verify subordinate list', expected: 'All subordinates listed\nVacation days per employee\nFilter by department', priority: 'High', type: 'Functional', ref: '', component: 'VacationPage', notes: '' },
        { id: 'TC-VAC-062', title: 'Accountant — payment section access', preconditions: 'Logged in as accountant', steps: '1. Login as accountant\n2. Check Vacation Payment menu\n3. Verify access', expected: 'Vacation Payment page accessible\nPayment data visible\nPayment actions available', priority: 'High', type: 'Functional', ref: '', component: 'VacationPage, AccountingPage', notes: '' },
      ]
    },
  ],

  approval: [
    {
      id: 'TS-Apr-Actions',
      name: 'Approval Actions',
      description: 'Approve, reject, approval workflow verification',
      tests: [
        { id: 'TC-APR-020', title: 'Approve button visibility (manager)', preconditions: 'Logged in as DM, pending reports exist', steps: '1. Navigate to approval page\n2. Find pending report\n3. Check for approve button', expected: 'Approve button visible for pending reports\nReject button also visible\nButtons not visible for already approved', priority: 'Critical', type: 'Functional', ref: 'approval-by-employee.spec.ts', component: 'ApprovalPage', notes: '' },
        { id: 'TC-APR-021', title: 'Employee cannot approve', preconditions: 'Logged in as employee (abaymaganov)', steps: '1. Login as employee\n2. Navigate to /approve/employees\n3. Check for approve buttons', expected: 'No approve/reject buttons visible\nOr: page not accessible for employee role', priority: 'Critical', type: 'Security', ref: '', component: 'ApprovalPage, RoleService', notes: 'P0 gap: 0 permission tests' },
        { id: 'TC-APR-022', title: 'Approval persists after refresh', preconditions: 'Report has been approved', steps: '1. Approve a report\n2. Refresh page\n3. Check approval status', expected: 'Approval status persists\nGreen checkmark still visible\nNo rollback on refresh', priority: 'High', type: 'Functional', ref: '', component: 'ApprovalPage', notes: 'P0 gap from QA report' },
      ]
    },
    {
      id: 'TS-Apr-Filters',
      name: 'Approval Filters & Export',
      description: 'Date range, status filters, Excel export',
      tests: [
        { id: 'TC-APR-030', title: 'Filter by approval status', preconditions: 'On approval page', steps: '1. Select status filter (All/Approved/Pending)\n2. Verify table updates', expected: 'Table filtered by selected status\nCount matches filter\nClear filter restores all', priority: 'High', type: 'Functional', ref: 'approval-by-employee.spec.ts', component: 'ApprovalPage', notes: '' },
        { id: 'TC-APR-031', title: 'Date range filtering', preconditions: 'On approval page', steps: '1. Change date range via approve-tab\n2. Verify data updates', expected: 'Data shows selected period\nWeekly tabs update\nHours recalculated', priority: 'High', type: 'Functional', ref: 'approval-by-employee.spec.ts', component: 'ApprovalPage', notes: '.approve-tab = date range tabs' },
        { id: 'TC-APR-032', title: 'Export to Excel', preconditions: 'On approval page with data', steps: '1. Click export button\n2. Verify download', expected: 'Excel file downloaded\nFile contains approval data\nFormat is valid xlsx', priority: 'Medium', type: 'Functional', ref: '', component: 'ApprovalPage', notes: 'P1 gap: 0 export tests' },
      ]
    },
  ],

  planner: [
    {
      id: 'TS-Pln-Workflow',
      name: 'Planner Workflow',
      description: 'Task assignment, generation, locking',
      tests: [
        { id: 'TC-PLN-030', title: 'Assignment generation', preconditions: 'Project with employees assigned', steps: '1. Select project in planner\n2. Click Generate assignments\n3. Verify created tasks', expected: 'Tasks generated for assigned employees\nTask list populated\nGeneration status shown', priority: 'High', type: 'Functional', ref: 'planner-tasks.spec.ts', component: 'PlannerPage', notes: '' },
        { id: 'TC-PLN-031', title: 'Task editing', preconditions: 'Task exists in planner', steps: '1. Click edit on task\n2. Modify task details\n3. Save changes', expected: 'Task updated\nChanges visible in list\nHistory entry created', priority: 'High', type: 'Functional', ref: 'planner-tasks.spec.ts', component: 'PlannerPage', notes: '' },
        { id: 'TC-PLN-032', title: 'Task template usage', preconditions: 'Templates configured', steps: '1. Click create from template\n2. Select template\n3. Verify populated fields', expected: 'Task created with template values\nFields pre-filled\nCan be customized before saving', priority: 'High', type: 'Functional', ref: '', component: 'PlannerPage', notes: 'P0 gap: 0 template tests' },
        { id: 'TC-PLN-033', title: 'Concurrent edit locking (423 response)', preconditions: 'Task being edited by another user', steps: '1. User A opens task for edit\n2. User B tries to edit same task\n3. Check lock behavior', expected: 'User B sees lock indicator\nOr: 423 Locked response from API\nConflict resolved cleanly', priority: 'High', type: 'Negative', ref: '', component: 'PlannerPage, API', notes: 'P0 gap: 0 lock tests' },
      ]
    },
    {
      id: 'TS-Pln-Trackers',
      name: 'Tracker Integration',
      description: 'GitLab, Jira, Redmine tracker sync',
      tests: [
        { id: 'TC-PLN-040', title: 'Tracker sync display', preconditions: 'Tracker configured for project', steps: '1. Open project in planner\n2. Check tracker sync status\n3. Verify linked tickets', expected: 'Sync status shown\nLinked tickets visible\nLast sync timestamp displayed', priority: 'Medium', type: 'Functional', ref: 'planner-tickets.spec.ts', component: 'PlannerPage', notes: '' },
        { id: 'TC-PLN-041', title: 'Manual sync trigger', preconditions: 'Tracker configured', steps: '1. Click sync/refresh button\n2. Wait for sync\n3. Verify updated tickets', expected: 'Sync initiated\nNew tickets imported\nSync timestamp updated', priority: 'Medium', type: 'Functional', ref: '', component: 'PlannerPage', notes: '' },
      ]
    },
  ],

  accounting: [
    {
      id: 'TS-Acc-RoleAccess',
      name: 'Accounting Role-Based Access',
      description: 'Access control for accounting features',
      tests: [
        { id: 'TC-ACC-050', title: 'Accountant — full accounting access', preconditions: 'Logged in as lprokhorova (ACCOUNTANT)', steps: '1. Login as accountant\n2. Check accounting menu\n3. Navigate to each subpage', expected: 'Accounting menu visible\nAll subpages accessible\nCRUD operations available', priority: 'Critical', type: 'Functional', ref: '', component: 'AccountingPage, RoleService', notes: 'P0 gap: 0 role tests' },
        { id: 'TC-ACC-051', title: 'Employee — no accounting access', preconditions: 'Logged in as abaymaganov (EMPLOYEE)', steps: '1. Login as employee\n2. Check for accounting menu\n3. Try direct URL /admin/salary', expected: 'No accounting menu in navbar\nDirect URL redirects or shows 403\nNo financial data visible', priority: 'Critical', type: 'Security', ref: '', component: 'AccountingPage, RoleService', notes: 'P0 gap: 0 role tests' },
      ]
    },
    {
      id: 'TS-Acc-PeriodClose',
      name: 'Period Close Effects',
      description: 'Effects of closing a period on reports and approvals',
      tests: [
        { id: 'TC-ACC-060', title: 'Closed period indicator', preconditions: 'Periods page with closed and open periods', steps: '1. Navigate to Periods page\n2. Identify closed vs open periods\n3. Check visual indicators', expected: 'Closed periods clearly marked\nOpen periods have close button\nDates and status correct', priority: 'High', type: 'Functional', ref: 'accounting-periods.spec.ts', component: 'AccountingPage', notes: '' },
        { id: 'TC-ACC-061', title: 'Period close effects on reports (read-only)', preconditions: 'Period just closed', steps: '1. Close a period (or verify already closed)\n2. Go to report for that period\n3. Try to edit', expected: 'Report is read-only\nNo edit controls available\nClear "period closed" indicator', priority: 'Critical', type: 'Functional', ref: '', component: 'ReportPage, PeriodService', notes: 'P0 gap: cross-module effect' },
      ]
    },
    {
      id: 'TS-Acc-Calculations',
      name: 'Accounting Calculations',
      description: 'Salary calculation, payment verification',
      tests: [
        { id: 'TC-ACC-070', title: 'Salary totals match expectations', preconditions: 'Salary page with known data', steps: '1. Navigate to salary page\n2. Select known employee\n3. Verify salary calculation', expected: 'Salary total matches expected formula\nAll components displayed\nNo rounding errors', priority: 'High', type: 'Functional', ref: '', component: 'AccountingPage', notes: 'P1 gap: 0 calculation tests' },
        { id: 'TC-ACC-071', title: 'Office filter on salary page', preconditions: 'Multiple offices exist', steps: '1. Select specific office\n2. Verify filtered results', expected: 'Only employees from selected office shown\nTotals recalculated for office\nFilter indicator visible', priority: 'Medium', type: 'Functional', ref: '', component: 'AccountingPage', notes: '' },
      ]
    },
  ],

  statistics: [
    {
      id: 'TS-Stat-Tabs',
      name: 'Statistics Tab Navigation',
      description: 'All statistics tabs and content verification',
      tests: [
        { id: 'TC-STAT-030', title: 'General statistics tab — data display', preconditions: 'On statistics page, General tab', steps: '1. Select General tab\n2. Verify data table\n3. Check column values', expected: 'Data table with employee statistics\nHours, projects, utilization columns\nNumbers are realistic (not 0)', priority: 'Critical', type: 'Functional', ref: 'statistics.spec.ts', component: 'StatisticsPage', notes: 'P0 gap: 0 deep tests in entire module' },
        { id: 'TC-STAT-031', title: 'Employee reports tab — data display', preconditions: 'On statistics page', steps: '1. Switch to Employee Reports tab\n2. Verify content\n3. Check employee list', expected: 'Employee report table displayed\nReports per employee shown\nClick on employee opens detail', priority: 'Critical', type: 'Functional', ref: 'statistics-subpages.spec.ts', component: 'StatisticsPage', notes: '' },
        { id: 'TC-STAT-032', title: 'Projects tab — data display', preconditions: 'On statistics page', steps: '1. Switch to Projects tab\n2. Verify project list\n3. Check hours/budget data', expected: 'Projects listed with statistics\nHours, team size, utilization shown\nSort by columns works', priority: 'High', type: 'Functional', ref: '', component: 'StatisticsPage', notes: '' },
        { id: 'TC-STAT-033', title: 'Tasks tab — data display', preconditions: 'On statistics page', steps: '1. Switch to Tasks tab\n2. Verify task list', expected: 'Task statistics displayed\nTask types breakdown\nProject grouping available', priority: 'High', type: 'Functional', ref: '', component: 'StatisticsPage', notes: '' },
      ]
    },
    {
      id: 'TS-Stat-Data',
      name: 'Statistics Data Verification',
      description: 'Deep verification of statistics calculations',
      tests: [
        { id: 'TC-STAT-040', title: 'Sort by column', preconditions: 'On statistics page with data', steps: '1. Click column header to sort\n2. Verify sort order\n3. Click again for reverse', expected: 'Data sorted ascending\nSecond click sorts descending\nSort indicator visible', priority: 'High', type: 'Functional', ref: '', component: 'StatisticsPage', notes: 'P1 gap' },
        { id: 'TC-STAT-041', title: 'Employee detail drill-down', preconditions: 'Employee listed in statistics', steps: '1. Click on employee name\n2. Verify detail view opens\n3. Check detailed data', expected: 'Detail view with full report\nWeekly/monthly breakdown\nProject-level hours', priority: 'High', type: 'Functional', ref: '', component: 'StatisticsPage', notes: '' },
        { id: 'TC-STAT-042', title: 'Period range changes data', preconditions: 'On statistics page', steps: '1. Change date range\n2. Verify data recalculates\n3. Check totals changed', expected: 'All data recalculated for new range\nTotals differ from previous range\nLoading indicator during update', priority: 'High', type: 'Functional', ref: '', component: 'StatisticsPage', notes: 'P1 gap' },
        { id: 'TC-STAT-043', title: 'Export statistics to Excel', preconditions: 'On statistics page with data', steps: '1. Click export/WSR button\n2. Verify download starts\n3. Check file format', expected: 'Excel file downloaded\nContains current statistics data\nFormat matches expected columns', priority: 'High', type: 'Functional', ref: '', component: 'StatisticsPage', notes: 'P0 gap: 0 export tests' },
      ]
    },
  ],

  'employee-tasks': [
    {
      id: 'TS-ET-Admin',
      name: 'Admin Employee Task View',
      description: 'Admin view of employee tasks, cross-project access',
      tests: [
        { id: 'TC-ET-010', title: 'PM report — full access', preconditions: 'Logged in as PM (aglushko)', steps: '1. Login as PM\n2. Navigate to employee tasks\n3. Verify subordinate tasks', expected: 'Can see tasks for managed project employees\nHours per employee visible\nProject filter works', priority: 'High', type: 'Functional', ref: 'employee-tasks.spec.ts:TR-91', component: 'EmployeeTasksPage', notes: '' },
        { id: 'TC-ET-011', title: 'Admin report — all employees', preconditions: 'Logged in as admin (slebedev)', steps: '1. Login as admin\n2. Navigate to employee tasks\n3. Check visibility scope', expected: 'All employees visible (not just subordinates)\nCross-department access\nFull hours data', priority: 'High', type: 'Functional', ref: 'employee-tasks.spec.ts:TR-113', component: 'EmployeeTasksPage', notes: 'P0 gap: only 2 admin tests' },
        { id: 'TC-ET-012', title: 'Employee — cannot see others tasks', preconditions: 'Logged in as employee (abaymaganov)', steps: '1. Login as employee\n2. Check what tasks are visible\n3. Try to access other employees', expected: 'Can only see own tasks\nNo other employee data visible\nManager view not accessible', priority: 'High', type: 'Security', ref: '', component: 'EmployeeTasksPage, RoleService', notes: 'P0 gap: 0 permission tests' },
      ]
    },
  ],

  notifications: [
    {
      id: 'TS-Ntf-Actions',
      name: 'Notification Actions',
      description: 'Mark as read, delete, filter, mark all',
      tests: [
        { id: 'TC-NTF-020', title: 'Mark all as read', preconditions: 'Multiple unread notifications', steps: '1. Click "Mark all as read"\n2. Verify all marked\n3. Check counter', expected: 'All notifications marked as read\nCounter drops to 0\nVisual distinction removed', priority: 'High', type: 'Functional', ref: '', component: 'NotificationsPage', notes: 'P1 gap' },
        { id: 'TC-NTF-021', title: 'Delete notification', preconditions: 'Notification exists', steps: '1. Click delete on notification\n2. Confirm if asked\n3. Verify removal', expected: 'Notification removed from list\nCounter updates if was unread\nNo undo needed', priority: 'Medium', type: 'Functional', ref: '', component: 'NotificationsPage', notes: '' },
        { id: 'TC-NTF-022', title: 'Filter by notification type', preconditions: 'Mixed notification types exist', steps: '1. Select type filter\n2. Verify filtered list\n3. Check matching types', expected: 'Only selected type shown\nClear filter shows all\nCount per type displayed', priority: 'Medium', type: 'Functional', ref: '', component: 'NotificationsPage', notes: 'P1 gap' },
      ]
    },
  ],

  faq: [
    {
      id: 'TS-FAQ-Access',
      name: 'FAQ Access & Navigation',
      description: 'FAQ page accessibility and content structure',
      tests: [
        { id: 'TC-FAQ-010', title: 'FAQ link in navigation', preconditions: 'Logged in', steps: '1. Check footer or help menu for FAQ link\n2. Click link\n3. Verify page loads', expected: 'FAQ link visible\nPage loads without errors\nContent structure visible', priority: 'Medium', type: 'Functional', ref: '', component: 'NavigationComponent, FAQPage', notes: 'Note: FAQ may be a stub page' },
        { id: 'TC-FAQ-011', title: 'FAQ content not empty', preconditions: 'On FAQ page', steps: '1. Check for actual content\n2. Verify not a TODO stub', expected: 'Real FAQ content displayed\nOr: clearly marked as "Coming Soon"\nNot an empty/broken page', priority: 'High', type: 'Functional', ref: '', component: 'FAQPage', notes: 'Known: page may show TODO:FAQ stub' },
      ]
    },
  ],
};

export default ADDITIONAL_SUITES;
