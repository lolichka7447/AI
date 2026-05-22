# TTT UI Highlighting & Sorting Rules

Source: [Google Spreadsheet](https://docs.google.com/spreadsheets/d/15g1NrKHk2R1To3FFps69DGRPjhwKtxhxa9cFCnGSD8U/edit?gid=807595221)

## Cell Highlighting Rules (by priority)

### Reports

| Condition | Period | Priority | Design | My Tasks | Employee Tasks | Confirmation |
|-----------|--------|----------|--------|----------|----------------|--------------|
| Rejected report | Open/Closed | 1 | Red bg & font | state=REJECTED | same | same |
| Approved report | Open/Closed | 1 | Green bg & font | state=APPROVED | same | same |
| Selected date | Open | 2.2 | Yellow bg, black font | Frontend-computed | — | N/A |
| Selected date | Closed | — | — | Cannot select closed | — | N/A |
| Special task reports | Open/Closed | 3 | Yellow bg, black font | task.isTaskRequest=true | same | same |
| Mouse hover | Open | 4 | Blue bg | Frontend-computed | same | same |
| Unconfirmed closed project | Open/Closed | 2.1 | Grey bg, black font | projectState=CLOSED | — | projectState=CLOSED |
| Unconfirmed closed project (employee view) | — | — | White bg, grey font | — | projectState=CLOSED | — |
| Unconfirmed/no hours | Closed | 1 | Grey bg, black font | periodState=CLOSED | same | same |
| Unconfirmed/no hours | Open | 5 | White bg, black font | permissions.EDIT=true | same | permissions.APPROVE=true |
| Task doesn't match project template | Open/Closed | 1 | Grey bg, black font | permissions.EDIT=false | — | — |
| Other project reports | Open | 5 | Grey font, white bg | N/A | permissions.EDIT=false | — |
| Other project reports | Closed | 5 | Grey font, grey bg | — | periodState=CLOSED & EDIT=false | periodState=CLOSED & APPROVE=false |

### Tasks

| Condition | Period | Priority | Design | Rule |
|-----------|--------|----------|--------|------|
| Other project tasks | Open/Closed | 1 | White bg, grey font | permissions.EDIT_FOR_EXECUTOR=false |
| Mouse hover | Open/Closed | 3 | Blue bg | Frontend-computed |
| Closed project tasks | Open/Closed | 2 | White bg, grey font | projectState=CLOSED |
| Special tasks (own projects) | Open/Closed | 1 | Yellow bg, black font | isTaskRequest=true |
| Special tasks (other projects) | Open/Closed | 1 | Yellow bg, grey font | isTaskRequest=true (other project) |
| Own open project tasks | Open/Closed | 4 | White bg, black font | Default |

### Approve/Reject Buttons

| Location | Condition | Visibility |
|----------|-----------|------------|
| Cell level | Open period | report.permissions.APPROVE=true |
| Task level | Open period | task.permissions.APPROVE=true |
| Date level | Open period | Always shown (even without reports) |

## Task Sorting Rules

### My Tasks
1. Pinned tasks — alphabetical
2. Special tasks — alphabetical
3. Unpinned tasks — alphabetical
4. New tasks added to unpinned in alphabetical order
5. Renamed tasks repositioned alphabetically
   - Pinned→pinned rename: stays pinned
   - Pinned→unpinned rename: becomes unpinned
   - Unpinned remains unpinned

### Employee Tasks
1. Pinned tasks — alphabetical (own + other mixed)
2. Special tasks — alphabetical (own + other mixed)
3. Unpinned tasks — alphabetical (own + other mixed)
4. New tasks added to unpinned alphabetically
5. Note: adding/renaming tasks in other's projects will error

### Confirmation (by employee)
1. Special tasks for current user — alphabetical
2. Own project tasks (permissions.APPROVE=true) — alphabetical, regardless of pin
3. Other project tasks (permissions.APPROVE=false) — alphabetical
4. Renamed tasks repositioned within own project tasks alphabetically

### Confirmation (by project)
- Only tasks of selected project shown

## Report Query Logic

### Main query
```
SELECT report, report.task AS task, report.executor AS employee
```

### Access rules
```
IF currentUser.role contains (PROJECT_MANAGER, ADMIN, CHIEF_ACCOUNTANT, VIEW_ALL)
    → all reports
ELSE
    currentUser = report.executor
    OR currentUser = report.task.project.manager
    OR currentUser = report.task.project.seniorManager
    OR currentUser IN report.task.project.observers
    OR currentUser = report.executor.departmentManager
    OR currentUser = report.executor.office.accountant
    OR currentUser = report.executor.office.director
```

### Parameters by screen

| Parameter | My Tasks | Employee Tasks | Confirmation by Employee | Confirmation by Project |
|-----------|----------|----------------|--------------------------|------------------------|
| executorLogin | current user | selected employee | selected employee | — |
| projectId | — | — | — | — |
| executorsProjectId | — | — | — | selected project |
| taskId | — | — | — | — |
| states | — | — | — | — |
| approverProjectRoles | — | MANAGER | MANAGER | MANAGER |
| includePinnedTasks | TRUE | TRUE | FALSE | FALSE |

### Notification about rejected hours
- Filter: `executorLogin = current, states = REJECTED`
- Shown on "My Tasks" screen
