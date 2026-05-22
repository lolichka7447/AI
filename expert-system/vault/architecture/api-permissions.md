# TTT API Permissions Matrix

Source: [Google Spreadsheet](https://docs.google.com/spreadsheets/d/15g1NrKHk2R1To3FFps69DGRPjhwKtxhxa9cFCnGSD8U/edit?gid=807595221)

## Roles (computed on backend)

| Role | Rule |
|------|------|
| EMPLOYEE | Any employee (base role for all) |
| CONTRACTOR | CS.user.Contractor = true |
| PROJECT_MANAGER | CS.user.Position in (Project Manager, Senior PM) OR TTT.user in (TTT.Project.Manager) |
| PROJECT_SENIOR_MANAGER | TTT.user in (TTT.Project.SeniorManager) — inherits PROJECT_MANAGER |
| PROJECT_OBSERVER | TTT.user in (TTT.Project.Observers) |
| PROJECT_OWNER | (defined in project settings) |
| DEPARTMENT_MANAGER | CS.user.Employees > 0 |
| OFFICE_HR | CS.user.Position in (Junior HR, HR department manager, HR-manager, Lead HR manager) |
| OFFICE_ACCOUNTANT | TTT.user in (CS.salaryOffices.accountants) |
| CHIEF_ACCOUNTANT | CS.user.Position = Chief Financial Officer |
| OFFICE_DIRECTOR | TTT.user in (CS.salaryOffices.managers) |
| VIEW_ALL | Set in TTT DB |
| ADMIN | Set in TTT config |

## API Endpoints by Permission

### Budget Notifications
- `GET /v1/notifications` — NOTIFICATIONS=VIEW. PM: own notifications; DM: own; DIRECTOR: own; ADMIN: own
- `POST /v1/notifications` — PM: own projects; DM: own employees; DIRECTOR: office employees; ADMIN: any
- `DELETE /v1/notifications/{id}` — own notifications only (PM, DM, DIRECTOR, ADMIN)

### Employees
- `GET /v1/employees` — EMPLOYEES=VIEW. EMPLOYEE: no; CONTRACTOR: no; PM: yes; DM: yes; HR: yes; ACCOUNTANT: own office; ADMIN: yes
- `GET /v1/employees/{login}` — any employee can view themselves
- `GET /v1/employees/current` — any employee (not for tokens)
- `GET /v1/employees/current/settings` — any employee
- `PATCH /v1/employees/current/settings` — any employee
- `GET /v1/employees/current/permissions` — any employee

### Offices
- `GET /v1/offices` — OFFICES=VIEW. EMPLOYEE: yes; ACCOUNTANT: yes; CHIEF_ACCOUNTANT: yes; ADMIN: yes
- `GET /v1/offices/{officeId}` — OFFICES=VIEW. EMPLOYEE: no; ACCOUNTANT: yes; CHIEF_ACCOUNTANT: yes; ADMIN: yes
- `GET /v1/offices/{officeId}/periods/approve` — any employee, any office
- `PATCH /v1/offices/{officeId}/periods/approve` — EDIT permission. ACCOUNTANT: own offices; CHIEF_ACCOUNTANT: any; ADMIN: any
- `GET /v1/offices/{officeId}/periods/report` — any employee, any office
- `PATCH /v1/offices/{officeId}/periods/report` — EDIT permission. ACCOUNTANT: own offices; CHIEF_ACCOUNTANT: any; ADMIN: any
- `GET /v1/periods/report/employees` — OFFICES=VIEW. ACCOUNTANT: own offices; CHIEF_ACCOUNTANT: any; DIRECTOR: yes; ADMIN: yes
- `PUT /v1/periods/report/employees/{login}` — ACCOUNTANT: own offices; CHIEF_ACCOUNTANT: any; ADMIN: any
- `DELETE /v1/periods/report/employees/{login}` — same as PUT

### Projects
- `GET /v1/projects` — PROJECTS=VIEW. EMPLOYEE: only projects where member; PM: all; SENIOR_PM: all; OWNER: all; DM: all; ADMIN: all
- `POST /v1/projects` — PROJECTS=CREATE. PM: yes; SENIOR_PM: yes; OWNER: yes; ADMIN: yes
- `GET /v1/projects/{projectId}` — PM: any; OBSERVER: any; OWNER: any; ADMIN: any
- `DELETE /v1/projects/{projectId}` — PM/SENIOR_PM: own projects if no reports; ADMIN: any if no reports
- `PATCH /v1/projects/{projectId}` — PM: own projects (all fields except model, type, seniorManager); ADMIN: any project, all fields
- `GET /v1/projects/{projectId}/members` — EMPLOYEE: own projects; PM: where manager/senior/observer; ADMIN: all
- `PUT /v1/projects/{projectId}/members/{login}` — PM: own projects; ADMIN: all
- `DELETE /v1/projects/{projectId}/members/{login}` — PM: own projects; ADMIN: all

### Settings
- `GET /v1/settings` — SETTINGS=VIEW. DIRECTOR: yes; ADMIN: yes
- `POST /v1/settings` — SETTINGS=CREATE. ADMIN only
- `DELETE /v1/settings/{id}` — ADMIN only
- `PATCH /v1/settings/{id}` — ADMIN only

### Statistics
- `GET /v1/statistic/departments` — EMPLOYEE: own hours; PM: own project hours; DM: department hours; HR: all; ACCOUNTANT: own office; CHIEF_ACCOUNTANT: all; DIRECTOR: office; ADMIN: all
- `GET /v1/statistic/employees` — external token: STATISTICS_VIEW
- `GET /v1/statistic/projects` — external token: STATISTICS_VIEW
- `GET /v1/statistic/tasks` — external token: STATISTICS_VIEW

### Suggestions
- `GET /v1/suggestions/customers` — SUGGESTIONS=VIEW_CUSTOMERS. PM: yes; OWNER: yes; HR: yes; ACCOUNTANT: yes; CHIEF_ACCOUNTANT: yes; DIRECTOR: yes; ADMIN: yes
- `GET /v1/suggestions/employees` — SUGGESTIONS=VIEW_EMPLOYEES. EMPLOYEE: yes; CONTRACTOR: no
- `GET /v1/suggestions/projects` — EMPLOYEE: yes; CONTRACTOR: own projects only
- `GET /v1/suggestions/all` — EMPLOYEE: all employees/projects/tasks (no customers); CONTRACTOR: own projects only
- `GET /v1/suggestions/tasks` — EMPLOYEE: any; CONTRACTOR: own project tasks

### Task Assignments (Planner)
- `GET /v1/assignments` — EMPLOYEE: own planner + own project members; PM: own projects all members; ADMIN: all
- `POST /v1/assignments` — external token: ASSIGNMENTS_ALL
- `PATCH /v1/assignments/{id}` — external token: ASSIGNMENTS_ALL
- `POST /v1/assignments/generate` — external token: ASSIGNMENTS_ALL

### Task Reports
- `GET /v1/reports` — EMPLOYEE: own hours; PM: all hours all projects; DM: department employee hours (no approve); ACCOUNTANT: own office (no report); ADMIN: all
- `POST /v1/reports` — PM: own project hours (report + approve + reject)
- `PATCH /v1/reports` — external token: REPORTS_EDIT + REPORTS_APPROVE
- `GET /v1/reports/summary` — PM: all reports; ADMIN: all
- `GET /v1/reports/total` — PM: own projects (approve); DM: department hours (read); ACCOUNTANT: own office (read)
- `GET /v1/reports/accounting` — ACCOUNTING=VIEW. ACCOUNTANT: own office; CHIEF_ACCOUNTANT: yes; ADMIN: yes
- `POST /v1/reports/accounting/notifications` — ACCOUNTING=NOTIFY. Same as accounting view

### Tasks
- `GET /v1/tasks` — all employees
- `POST /v1/tasks` — all employees
- `PATCH /v1/tasks` — EDIT_FOR_EXECUTOR, EDIT_FOR_ALL permissions

### Tokens
- `GET /v1/tokens` — TOKENS=VIEW
- `POST /v1/tokens` — TOKENS=CREATE
- `DELETE /v1/tokens/{id}` — DELETE permission
- `PATCH /v1/tokens/{id}` — EDIT permission

### Vacations (separate service)
- `GET /v1/vacations` — VACATIONS=VIEW. EMPLOYEE: own; PM: own project employees + where approver; ACCOUNTANT: own office; ADMIN: all
- `POST /v1/vacations` — VACATIONS=CREATE
- `PUT /v1/vacations/approve/{id}` — VacationDTO.permissions=APPROVE
- `PUT /v1/vacations/reject/{id}` — VacationDTO.permissions=APPROVE
- `PUT /v1/vacations/pay/{id}` — ACCOUNTANT: own office; ADMIN: all
- `DELETE /v1/vacations/{id}` — own vacation
- `GET /v1/vacationdays` — VACATIONS=VIEW_DAYS. ACCOUNTANT: own office; ADMIN: all
- `PUT /v1/vacationdays/{csId}` — ACCOUNTANT: own office; ADMIN: all

### Calendar (separate service)
- `GET /v1/calendar` — CALENDAR=VIEW
- `PUT /v1/calendar` — CALENDAR=EDIT (ADMIN)
- `DELETE /v1/calendar/{id}` — CALENDAR=EDIT (ADMIN)

### Selections
- `GET /v1/selections` — all (token: ASSIGNMENTS_VIEW)
- `POST /v1/selections` — all (token: ASSIGNMENTS_VIEW)

## Menu Access (July 2024)

| Menu Item | Access |
|-----------|--------|
| My Tasks | All |
| Calendar / My Vacations & Days Off | All with VACATIONS=VIEW |
| Calendar / My Sick Leaves | All with sick leave access |
| Calendar / Availability Chart | All with VACATIONS=VIEW |
| Calendar / Employee Requests | VACATIONS=VIEW_APPROVES |
| Calendar / Employee Vacation Days | VACATIONS=VIEW_EMPLOYEES |
| Calendar / Employee Sick Leaves | With sick leave access |
| Confirmation | TASKS=VIEW_APPROVES |
| Planner | All |
| Statistics | Role-dependent menu from backend |
| Admin / Projects | PROJECTS=VIEW |
| Admin / Employees & Contractors | EMPLOYEES=VIEW |
| Admin / TTT Parameters | SETTINGS=VIEW |
| Admin / Production Calendars | CALENDAR=VIEW |
| Admin / API | TOKENS=VIEW |
| Admin / Export | Admin access |
| Accounting / Salary | ACCOUNTING=VIEW |
| Accounting / Changing Periods | OFFICES=VIEW |
| Accounting / Vacation Payment | VACATION=VIEW_PAYMENTS |
| Accounting / Vacation Days Correction | VACATIONS=VIEW_DAYS |
| Accounting / Sick Leave Records | With accounting access |
| Notifications | NOTIFICATIONS=VIEW |
| FAQ | All |
| Tracker Settings | Via user profile click |
