# Failures by Module — 2026-03-23

## APPLICATION BUG (not test issues)
| Module | Failed | Root Cause |
|--------|--------|------------|
| approval-by-project.spec.ts | ~90 | Approval page crashes (app error) |
| approval-by-employee.spec.ts | ~30 | Same app crash |
| approval.spec.ts | ~15 | Same app crash |
| approval-roles.spec.ts | ~5 | Same app crash |
| **Subtotal** | **~135** | **App bug — `/approve/employees` crashes** |

## SELECTOR ISSUES (fixable in tests)
| Module | Failed | Root Cause |
|--------|--------|------------|
| vacation-employee.spec.ts | ~12 | `.page-content, main` not found after clickVacation(); vacationTypeSelect wrong |
| vacation.spec.ts | ~10 | Modal form selectors (date-picker, type select), chart grid hidden, sick leaves nav |
| vacation-deep.spec.ts | ~7 | Date input selectors in modal |
| report.spec.ts | ~15 | Task CRUD failures, compact view button not found |
| report-deep.spec.ts | ~2 | Closed period indicator |
| statistics.spec.ts | ~8 | Tab switching (departments, tasks) |
| statistics-deep.spec.ts | ~5 | Department filter, contractor toggle |
| statistics-subpages.spec.ts | ~3 | Employee reports filter |
| admin-subpages.spec.ts | ~10 | Export form, settings selectors |
| admin.spec.ts | ~6 | Feature toggles, settings form, sort select |
| user-settings.spec.ts | ~10 | All profile/token/language selectors |
| calendar-deep.spec.ts | ~7 | Calendar grid hidden, CSS classes |
| notifications-deep.spec.ts | ~4 | Invalid regex in locator |
| planner-projects.spec.ts | ~4 | CSS selector parsing errors with regex |
| auth-roles.spec.ts | ~5 | Logout, contractor nav, dept manager |
| navigation-submenus.spec.ts | ~1 | Sick leaves nav link text |
| email-notifications.spec.ts | ~3 | Email content assertions |
| faq-deep.spec.ts | ~1 | FAQ content selector |
| Other scattered | ~12 | Various |
| **Subtotal** | **~150** | **Fixable selector issues** |

## TOTAL: ~285 failures
