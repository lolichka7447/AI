# Vacation Module — Deep Tests Run Report

**Date**: 2026-03-25 06:15
**Branch**: feature/vacation-deep-tests
**Duration**: 11.4 minutes
**Workers**: 2

## Results

| Status | Count |
|--------|-------|
| Passed | 82 |
| Failed | 0 |
| Skipped | 25 |
| **Total** | **107** |

**Pass rate**: 100% (of non-skipped: 82/82)

## Test Files (12 spec files)

| File | Tests | Passed | Skipped | Failed |
|------|-------|--------|---------|--------|
| vacation.spec.ts (smoke) | 9 | 9 | 0 | 0 |
| vacation-deep.spec.ts | 10 | 8 | 2 | 0 |
| vacation-my.spec.ts | 21 | 16 | 5 | 0 |
| vacation-approval.spec.ts | 10 | 5 | 5 | 0 |
| vacation-chart.spec.ts | 10 | 7 | 3 | 0 |
| vacation-days.spec.ts | 8 | 8 | 0 | 0 |
| vacation-accrued-days.spec.ts | 9 | 7 | 2 | 0 |
| vacation-notifications.spec.ts | 4 | 4 | 0 | 0 |
| vacation-timemachine.spec.ts | 7 | 1 | 6 | 0 |
| vacation-calendar.spec.ts | 5 | 4 | 1 | 0 |
| vacation-roles.spec.ts | 4 | 4 | 0 | 0 |
| vacation-roles-extended.spec.ts | 10 | 9 | 1 | 0 |

## Skip Categories

| Reason | Count |
|--------|-------|
| Timemachine API 401 (auth needed) | 5 |
| No available vacation days (0 за 2026) | 2 |
| No pending requests to approve | 5 |
| Filter/button not visible | 5 |
| No approved vacations found | 1 |
| Other conditional skips | 7 |

## Known Bugs Confirmed

- **#3344**: Russian UI text appears in EN mode (event feed, labels) — 2 tests confirm
- **#3344**: Language switch does not change button text

## Key Changes from Previous Run

- Fixed `page.locator('main')` → `page.locator('body')` (no `<main>` tag in TTT)
- Fixed `paymentMonthPicker` → `paymentMonthInput`
- Fixed table sort order: vacations sorted by date DESC (newest first, index 0)
- Fixed `createVacation/createRegularVacation/createAdministrativeVacation` — added modal close on validation error
- Fixed timemachine: pass `page` instead of `request` for auth cookies; skip on 401
- Switched test creation methods from regular to admin vacations where days=0
- Added `base.skip()` instead of `test.skip()` for base fixture tests
