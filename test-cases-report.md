# TTT P0+P1 Test Cases Report

> Generated: 2026-03-23
> Total: ~60 test cases across 11 modules
> Priority: P0 (Critical) + P1 (High)

---

## AUTH Module

### TC-AUTH-010 | P0 | Login via form
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: User not authenticated, VPN connected
- **Steps**:
  1. Navigate to TTT base URL
  2. Enter valid username (pvaynmaster) in login field
  3. Click LOGIN button
  4. Wait for redirect
- **Expected**: User lands on /report page, TTT title visible
- **Role**: Any

### TC-AUTH-011 | P0 | Logout with verification
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: User authenticated as pvaynmaster
- **Steps**:
  1. Click user menu button
  2. Click "Logout" link
  3. Wait for redirect
- **Expected**: User redirected to login/CAS page, no authenticated content visible
- **Role**: chief_officer

### TC-AUTH-012 | P0 | Employee cannot access /admin
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as employee (abaymaganov)
- **Steps**:
  1. Navigate directly to /admin
  2. Check page content
- **Expected**: Admin page not accessible — redirect or no admin content visible
- **Role**: employee

### TC-AUTH-013 | P0 | Admin can access /admin
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as admin (slebedev)
- **Steps**:
  1. Navigate to /admin
  2. Check page content
- **Expected**: Admin page loads with tables/settings visible
- **Role**: admin

### TC-AUTH-014 | P0 | Contractor has limited access
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as contractor (aleksey.pushkarev)
- **Steps**:
  1. Check navigation bar items
  2. Verify restricted sections not visible
- **Expected**: Admin/Accounting buttons not visible in navigation
- **Role**: contractor

### TC-AUTH-015 | P0 | Invalid login rejected
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: User not authenticated
- **Steps**:
  1. Navigate to TTT base URL
  2. Enter invalid username
  3. Attempt login
- **Expected**: Login fails, stays on login page or shows error
- **Role**: N/A

### TC-AUTH-020 | P1 | API token generation workflow
- **Module**: Auth/Admin
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer, on /admin/api page
- **Steps**:
  1. Navigate to Admin > API
  2. Click "Create token" button
  3. Enter token name
  4. Submit form
- **Expected**: Token created, visible in token list
- **Role**: chief_officer

### TC-AUTH-021 | P1 | Revoke API token
- **Module**: Auth/Admin
- **Depth**: E2E
- **Preconditions**: Token exists in /admin/api
- **Steps**:
  1. Navigate to Admin > API
  2. Find existing token row
  3. Click delete/revoke button
  4. Confirm deletion
- **Expected**: Token removed from list
- **Role**: chief_officer

### TC-AUTH-022 | P1 | 403 forbidden page
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as employee
- **Steps**:
  1. Navigate to restricted URL (/admin)
  2. Check page response
- **Expected**: Access denied indicator — redirect, empty content, or error message
- **Role**: employee

### TC-AUTH-023 | P1 | Language persists after re-login
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer
- **Steps**:
  1. Switch language via language switcher
  2. Note current language
  3. Logout
  4. Login again
  5. Check language
- **Expected**: Language setting persists (stored in user preferences)
- **Role**: chief_officer

### TC-AUTH-024 | P1 | DM access to subordinates
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as department_manager (nshumakov)
- **Steps**:
  1. Navigate to approval page
  2. Check employee list visibility
- **Expected**: Approval page loads with subordinate data
- **Role**: department_manager

### TC-AUTH-025 | P1 | View All — read-only access
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as view_all (adanilevskaya)
- **Steps**:
  1. Navigate to /report
  2. Check for edit/approve buttons
- **Expected**: Report page loads, but no approve/edit action buttons visible
- **Role**: view_all

### TC-AUTH-026 | P1 | Tech Lead access to planner
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as tech_lead (ailin)
- **Steps**:
  1. Navigate to /planner
  2. Check page loads
- **Expected**: Planner page accessible with content visible
- **Role**: tech_lead

### TC-AUTH-027 | P1 | Chief Accountant access to accounting
- **Module**: Auth
- **Depth**: E2E
- **Preconditions**: Logged in as chief_accountant (perekrest)
- **Steps**:
  1. Navigate to accounting section
  2. Check page content
- **Expected**: Accounting pages load with data visible
- **Role**: chief_accountant

---

## REPORT Module

### TC-RPT-001 | P0 | Report hours CRUD workflow
- **Module**: Report
- **Depth**: E2E
- **Preconditions**: Authenticated as chief_officer, on /report
- **Steps**:
  1. Navigate to report page
  2. Find an active task
  3. Enter hours in a day cell
  4. Verify hours saved (cell value updated)
  5. Clear hours
- **Expected**: Hours can be entered, displayed, and cleared
- **Role**: chief_officer

### TC-RPT-004 | P0 | Closed period — read-only verification
- **Module**: Report
- **Depth**: E2E
- **Preconditions**: Authenticated, navigate to a closed period week
- **Steps**:
  1. Navigate to a past closed period
  2. Try to edit hours cells
  3. Check for "period closed" indicator
- **Expected**: Cells are not editable, closed period message visible
- **Role**: chief_officer

### TC-RPT-005 | P0 | Validation >36 hours per day
- **Module**: Report
- **Depth**: E2E
- **Preconditions**: Authenticated, on /report
- **Steps**:
  1. Navigate to report page
  2. Enter >36 hours for one day across tasks
  3. Check validation
- **Expected**: Validation error/warning about exceeding maximum hours
- **Role**: chief_officer

### TC-RPT-010 | P1 | Monthly summary correctness
- **Module**: Report
- **Depth**: E2E
- **Preconditions**: Authenticated, on /report
- **Steps**:
  1. Navigate to report page
  2. Check monthly summary display
  3. Verify summary shows hours data
- **Expected**: Monthly summary visible with hour values
- **Role**: chief_officer

### TC-RPT-011 | P1 | View-all role — read-only mode
- **Module**: Report
- **Depth**: E2E
- **Preconditions**: Logged in as view_all (adanilevskaya)
- **Steps**:
  1. Navigate to /report
  2. Check for input fields / edit controls
- **Expected**: Report loads but editing controls absent or disabled
- **Role**: view_all

### TC-RPT-013 | P1 | Week navigation + data persistence
- **Module**: Report
- **Depth**: E2E
- **Preconditions**: Authenticated, on /report
- **Steps**:
  1. Note current week data
  2. Navigate to next week
  3. Navigate back
  4. Verify data unchanged
- **Expected**: Data persists across week navigation
- **Role**: chief_officer

---

## ADMIN Module

### TC-ADM-051 | P0 | Admin settings page
- **Module**: Admin
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer, on /admin
- **Steps**:
  1. Navigate to admin settings
  2. Check for settings section
  3. Verify form elements visible
- **Expected**: Admin settings page loads with form elements
- **Role**: chief_officer

### TC-ADM-052 | P0 | Employee list visibility
- **Module**: Admin
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer, on /admin/employees
- **Steps**:
  1. Navigate to Admin > Employees
  2. Check table loads
  3. Verify employee rows visible
- **Expected**: Employee table with rows, search input available
- **Role**: chief_officer

### TC-ADM-060 | P1 | Export data page
- **Module**: Admin
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer
- **Steps**:
  1. Navigate to Admin > Export
  2. Check page loads
- **Expected**: Export page loads with controls
- **Role**: chief_officer

### TC-ADM-061 | P1 | Employee role display in list
- **Module**: Admin
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer, on /admin/employees
- **Steps**:
  1. Navigate to Admin > Employees
  2. Check table columns
  3. Look for role information in rows
- **Expected**: Employee rows contain role/position information
- **Role**: chief_officer

### TC-ADM-062 | P1 | Feature toggle section
- **Module**: Admin
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer, on /admin
- **Steps**:
  1. Navigate to admin settings
  2. Look for feature toggle controls
- **Expected**: Toggle switches or checkboxes visible
- **Role**: chief_officer

### TC-ADM-063 | P1 | Calendar page
- **Module**: Admin
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer
- **Steps**:
  1. Navigate to Admin > Calendars
  2. Check page loads with calendar controls
- **Expected**: Calendar page loads with year selector and day grid
- **Role**: chief_officer

### TC-ADM-064 | P1 | Salary page loading
- **Module**: Admin
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer
- **Steps**:
  1. Navigate to Accounting > Salary
  2. Check page loads
- **Expected**: Salary page loads with table or data section
- **Role**: chief_officer

---

## VACATION Module

### TC-VAC-100 | P0 | Vacation list visibility
- **Module**: Vacation
- **Depth**: E2E
- **Preconditions**: Authenticated as chief_officer
- **Steps**:
  1. Navigate to My Vacations
  2. Check vacation list/table loads
  3. Verify create button visible
- **Expected**: Vacation page loads, create button available
- **Role**: chief_officer

### TC-VAC-102 | P0 | Employee role — no approve button
- **Module**: Vacation
- **Depth**: E2E
- **Preconditions**: Logged in as employee (abaymaganov)
- **Steps**:
  1. Navigate to vacation requests page
  2. Check for approve/reject buttons
- **Expected**: No approve/reject buttons visible for employee role
- **Role**: employee

### TC-VAC-110 | P1 | Accountant access to payment section
- **Module**: Vacation
- **Depth**: E2E
- **Preconditions**: Logged in as chief_accountant (perekrest)
- **Steps**:
  1. Navigate to Accounting > Vacation Payment
  2. Check page loads
- **Expected**: Payment page accessible with content
- **Role**: chief_accountant

### TC-VAC-111 | P1 | Sick leave page access
- **Module**: Vacation
- **Depth**: E2E
- **Preconditions**: Authenticated as chief_officer
- **Steps**:
  1. Navigate to My Sick Leaves
  2. Check page loads
  3. Verify list or empty state visible
- **Expected**: Sick leaves page loads with list or "no sick leaves" message
- **Role**: chief_officer

---

## APPROVAL Module

### TC-APR-050 | P0 | Employee — approve buttons hidden
- **Module**: Approval
- **Depth**: E2E
- **Preconditions**: Logged in as employee (abaymaganov)
- **Steps**:
  1. Navigate to /approval
  2. Check for approve/reject action buttons
- **Expected**: No bulk approve/reject buttons visible
- **Role**: employee

### TC-APR-051 | P0 | Approval page loads with tabs
- **Module**: Approval
- **Depth**: E2E
- **Preconditions**: Authenticated as chief_officer
- **Steps**:
  1. Navigate to approval page
  2. Check "By Employee" and "By Project" tabs
  3. Switch between tabs
- **Expected**: Both tabs accessible, content loads on switch
- **Role**: chief_officer

### TC-APR-061 | P1 | Notification count matches pending
- **Module**: Approval
- **Depth**: E2E
- **Preconditions**: Authenticated as chief_officer
- **Steps**:
  1. Check notification badge count
  2. Navigate to approval page
  3. Compare counts
- **Expected**: Notification indicator reflects pending items (non-negative number)
- **Role**: chief_officer

---

## PLANNER Module

### TC-PLN-050 | P0 | Planner page loads
- **Module**: Planner
- **Depth**: E2E
- **Preconditions**: Authenticated as chief_officer
- **Steps**:
  1. Navigate to /planner
  2. Check tabs visible (Projects/Tasks/Tickets)
  3. Verify content loads
- **Expected**: Planner page loads with tab navigation
- **Role**: chief_officer

### TC-PLN-051 | P0 | Planner tab switching
- **Module**: Planner
- **Depth**: E2E
- **Preconditions**: Authenticated, on /planner
- **Steps**:
  1. Click each planner tab
  2. Verify content changes
- **Expected**: Each tab displays different content
- **Role**: chief_officer

### TC-PLN-060 | P1 | Tech lead access to planner
- **Module**: Planner
- **Depth**: E2E
- **Preconditions**: Logged in as tech_lead (ailin)
- **Steps**:
  1. Navigate to /planner
  2. Check page loads with content
- **Expected**: Planner accessible for tech lead role
- **Role**: tech_lead

---

## ACCOUNTING Module

### TC-ACC-050 | P0 | Accountant access to accounting
- **Module**: Accounting
- **Depth**: E2E
- **Preconditions**: Logged in as chief_accountant (perekrest)
- **Steps**:
  1. Check navigation has Accounting button
  2. Navigate to Accounting > Salary
  3. Verify page loads
- **Expected**: Accounting section accessible with data
- **Role**: chief_accountant

### TC-ACC-051 | P0 | Employee cannot access accounting
- **Module**: Accounting
- **Depth**: E2E
- **Preconditions**: Logged in as employee (abaymaganov)
- **Steps**:
  1. Check navigation for Accounting button
  2. Try to navigate to /admin/salary directly
- **Expected**: Accounting button not in nav, direct URL shows no accounting content
- **Role**: employee

### TC-ACC-060 | P1 | Period table display
- **Module**: Accounting
- **Depth**: E2E
- **Preconditions**: Logged in as chief_officer
- **Steps**:
  1. Navigate to Accounting > Periods Change
  2. Check table loads
  3. Verify period rows visible
- **Expected**: Periods table loads with data rows
- **Role**: chief_officer

---

## STATISTICS Module

### TC-STAT-001 | P0 | All 4 tabs switching
- **Module**: Statistics
- **Depth**: E2E
- **Preconditions**: Authenticated, on /statistics
- **Steps**:
  1. Navigate to General Statistics
  2. Click Departments tab — verify content
  3. Click Employees tab — verify content
  4. Click Projects tab — verify content
  5. Click Tasks tab — verify content
- **Expected**: All 4 tabs switch content, no errors
- **Role**: chief_officer

### TC-STAT-002 | P0 | Filter by department
- **Module**: Statistics
- **Depth**: E2E
- **Preconditions**: Authenticated, on /statistics/general, Departments tab
- **Steps**:
  1. Locate department filter
  2. Select a department
  3. Verify table data changes
- **Expected**: Table filters to show only selected department data
- **Role**: chief_officer

### TC-STAT-003 | P0 | Export button functionality
- **Module**: Statistics
- **Depth**: E2E
- **Preconditions**: Authenticated, on /statistics/general
- **Steps**:
  1. Click Export button
  2. Wait for download
- **Expected**: File download initiated
- **Role**: chief_officer

### TC-STAT-004 | P0 | Employee detail click
- **Module**: Statistics
- **Depth**: E2E
- **Preconditions**: Authenticated, on /statistics, Employees tab
- **Steps**:
  1. Switch to Employees tab
  2. Click on an employee row
  3. Check navigation
- **Expected**: Clicking employee navigates to detail view or report
- **Role**: chief_officer

### TC-STAT-010 | P1 | Role-based access
- **Module**: Statistics
- **Depth**: E2E
- **Preconditions**: Logged in as employee (abaymaganov)
- **Steps**:
  1. Check navigation for Statistics button
  2. Try to access /statistics
- **Expected**: Statistics access may be restricted for basic employee
- **Role**: employee

### TC-STAT-011 | P1 | Contractor filter toggle
- **Module**: Statistics
- **Depth**: E2E
- **Preconditions**: Authenticated, on /statistics/general
- **Steps**:
  1. Locate contractor filter
  2. Toggle contractor inclusion
  3. Check table data changes
- **Expected**: Table data updates based on contractor filter
- **Role**: chief_officer

### TC-STAT-012 | P1 | Period range recalculation
- **Module**: Statistics
- **Depth**: E2E
- **Preconditions**: Authenticated, on /statistics/general
- **Steps**:
  1. Set custom period range
  2. Verify table recalculates
- **Expected**: Table data updates for new period
- **Role**: chief_officer

### TC-STAT-013 | P1 | Sort by columns
- **Module**: Statistics
- **Depth**: E2E
- **Preconditions**: Authenticated, on /statistics/general
- **Steps**:
  1. Click a sortable column header
  2. Verify sort order changes
- **Expected**: Table rows reorder based on sort
- **Role**: chief_officer

---

## EMPLOYEE-TASKS Module

### TC-ET-050 | P1 | Full access for admin
- **Module**: Employee Tasks
- **Depth**: E2E
- **Preconditions**: Authenticated as chief_officer, on /report
- **Steps**:
  1. Navigate to report page
  2. Verify task list loads
  3. Check task controls visible
- **Expected**: Full task management UI visible
- **Role**: chief_officer

### TC-ET-051 | P1 | Employee sees own tasks only
- **Module**: Employee Tasks
- **Depth**: E2E
- **Preconditions**: Logged in as employee (abaymaganov)
- **Steps**:
  1. Navigate to /report
  2. Check task list
  3. Verify no admin-level controls
- **Expected**: Tasks visible, but no admin controls
- **Role**: employee

### TC-ET-052 | P1 | Color indicators for tasks
- **Module**: Employee Tasks
- **Depth**: E2E
- **Preconditions**: Authenticated, on /report
- **Steps**:
  1. Check task rows for color styling
  2. Verify CSS classes or background colors present
- **Expected**: Task rows have color indicators (CSS classes applied)
- **Role**: chief_officer

---

## NOTIFICATIONS Module

### TC-NTF-020 | P1 | Mark all as read
- **Module**: Notifications
- **Depth**: E2E
- **Preconditions**: Authenticated, on notifications page
- **Steps**:
  1. Navigate to notifications page
  2. Find "Mark all" button
  3. Click it
- **Expected**: Button exists, click succeeds
- **Role**: chief_officer

### TC-NTF-021 | P1 | Filter by type
- **Module**: Notifications
- **Depth**: E2E
- **Preconditions**: Authenticated, on notifications page
- **Steps**:
  1. Navigate to notifications
  2. Look for filter/tab controls
  3. Switch filter if available
- **Expected**: Notification list updates based on filter
- **Role**: chief_officer

### TC-NTF-022 | P1 | Notification counter
- **Module**: Notifications
- **Depth**: E2E
- **Preconditions**: Authenticated
- **Steps**:
  1. Check notification badge in navbar
  2. Navigate to notifications page
  3. Verify counter is a non-negative number
- **Expected**: Counter visible and shows valid count
- **Role**: chief_officer

---

## FAQ Module

### TC-FAQ-010 | P1 | FAQ content navigation
- **Module**: FAQ
- **Depth**: E2E
- **Preconditions**: Authenticated
- **Steps**:
  1. Navigate to FAQ/help page
  2. Check content loads
  3. Click on FAQ sections if available
- **Expected**: FAQ page loads with navigable content
- **Role**: chief_officer

### TC-FAQ-011 | P1 | FAQ search
- **Module**: FAQ
- **Depth**: E2E
- **Preconditions**: Authenticated, on FAQ page
- **Steps**:
  1. Look for search input
  2. Enter search term if available
- **Expected**: Search functionality exists or content is browsable
- **Role**: chief_officer
