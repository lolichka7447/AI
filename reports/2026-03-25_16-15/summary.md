# Vacation Module — Full Test Suite Report (with Timemachine)

**Date**: 2026-03-25 16:15
**Branch**: feature/vacation-deep-tests
**Workers**: 2 (main) + 1 (timemachine separate)

## Results

| Status | Count |
|--------|-------|
| Passed | 89 |
| Failed | 0 |
| Skipped | 18 |
| **Total** | **107** |

**Pass rate**: 100% (of non-skipped: 89/89)

## Test Files (12 spec files)

| File | Tests | Passed | Skipped | Failed |
|------|-------|--------|---------|--------|
| vacation.spec.ts (smoke) | 9 | 9 | 0 | 0 |
| vacation-deep.spec.ts | 10 | 9 | 1 | 0 |
| vacation-my.spec.ts | 21 | 16 | 5 | 0 |
| vacation-approval.spec.ts | 10 | 5 | 5 | 0 |
| vacation-chart.spec.ts | 10 | 7 | 3 | 0 |
| vacation-days.spec.ts | 8 | 8 | 0 | 0 |
| vacation-accrued-days.spec.ts | 9 | 7 | 2 | 0 |
| vacation-notifications.spec.ts | 4 | 4 | 0 | 0 |
| vacation-timemachine.spec.ts | 7 | 7 | 0 | 0 |
| vacation-calendar.spec.ts | 5 | 4 | 1 | 0 |
| vacation-roles.spec.ts | 4 | 4 | 0 | 0 |
| vacation-roles-extended.spec.ts | 10 | 9 | 1 | 0 |

## Key Improvements from Previous Run

- **Timemachine tests now PASS** (was 1/7, now 7/7)
  - Fixed Clock API: correct URL `/api/ttt/v1/test/clock` with `API_SECRET_TOKEN` header
  - Fixed reset endpoint: `POST /api/ttt/v1/test/clock/reset`
  - Added `reLoginAfterTimeChange()` — clears cookies, re-authenticates after time change
  - Added `createTimemachineContext()` for standalone API context
- **Pagination handling** — tests handle 20-item page limit
- **Hidden table fix** — `table:visible` selector avoids DOM hidden tables
- **Date validation** — handles disabled submit button (not just error messages)

## Skip Categories

| Reason | Count |
|--------|-------|
| Approval page crashes on QA (build 2.1.26) | 5 |
| No available vacation days (0 за 2026) | 5 |
| Filter/button not visible on QA | 3 |
| No approved vacations found | 1 |
| Vacation-days "Нет данных" | 1 |
| Other conditional skips | 3 |

## Important: Running Timemachine Tests

Timemachine tests change server time, which invalidates ALL sessions:
```bash
# Run timemachine separately with 1 worker:
npx playwright test tests/e2e/vacation-timemachine.spec.ts --project=e2e --workers=1

# Run all other tests with 2 workers:
npx playwright test tests/e2e/vacation*.spec.ts --project=e2e --workers=2 --grep-invert="Timemachine"
```

## Known Bugs Confirmed

- **#3344**: Russian UI text in EN mode (event feed, labels)
- **#3344**: Language switch does not change button text
