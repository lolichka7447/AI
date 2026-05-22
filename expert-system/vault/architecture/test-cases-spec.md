# TTT Test Cases (from specification)

Source: [Google Spreadsheet](https://docs.google.com/spreadsheets/d/15g1NrKHk2R1To3FFps69DGRPjhwKtxhxa9cFCnGSD8U/edit?gid=807595221)

## Report Hours — Access Control Test Cases

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Employee reports own hours | Allowed |
| 2 | Employee reports for another employee | Denied |
| 3 | Manager reports for any employee in own project | Allowed |
| 4 | Senior Manager reports for any employee in own project | Allowed |
| 5 | Department Manager reports for department employee in any project | Allowed |
| 6 | Admin reports for any employee in any project | Allowed |
| 7 | Report hours in closed period | Denied |
| 8 | Report negative hours | Denied |
| 9 | Report hours to closed project after project end date | Denied |
| 10 | Task doesn't match project template → permissions.EDIT=false | Report denied |

## Report Approval — Access Control Test Cases

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Manager approves hours in own project | Allowed |
| 2 | Manager approves hours in other project | Denied |
| 3 | Senior Manager approves in own project | Allowed |
| 4 | Admin approves any hours | Allowed |
| 5 | Employee tries to approve | Denied |
| 6 | Department Manager sees hours but cannot approve | Read-only |

## Sprint Backlog Tasks (historical, v2.1.x)

### Key resolved bugs
- #1605: Vacation message ">=5 days" displayed incorrectly when days > 5
- #1604: Vacation ">=5 days" not shown when start_date = end_date
- #1614: Sum of hours doesn't match
- #1680: Planner Total row doesn't round hours
- #1556: Reports not displayed after navigating from Planner to Confirmation
- #1645: "No panic!" page when reporting hours + adding comment + pressing Enter
- #1626: Planner select and lock by dates — no proper date validation

### Key historical technical debt
- #1435: Delete unused frontend components
- #1324: Migrate from MomentJs
- #586: Refactor sagas, actions, table rendering
- #1695: Migrate from querydsl to jooq
- #1691: Encrypt tracker credentials in DB (currently stored as plain text!)
- #1694: Add CI for unit tests, React tests, QA tests + test coverage report
