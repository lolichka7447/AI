# Test Run Summary — 2026-03-23

## Overall Results
- **Total tests**: 1408 (E2E: 1374, API: 34)
- **Passed**: 1123 (79.8%)
- **Failed**: 285 (20.2%)
- **Duration**: ~2.8 hours
- **Workers**: 2
- **Projects**: e2e, api

## Application Info
- **Build**: 2.1.26-SNAPSHOT.LOCAL
- **Build date**: 23.03.2026
- **URL**: https://ttt-qa-2.noveogroup.com

## Critical Application Bug
The **approval page** (`/approve/employees`) crashes with error "Что-то пошло не так, и страница не загрузилась." This causes ~135 test failures and is NOT a test issue. Needs to be reported to the dev team.

## Pass Rate by Category (excluding approval app bug)
- Without approval failures: ~1123/1273 = ~88.2%
- API tests: 34/34 = 100%
