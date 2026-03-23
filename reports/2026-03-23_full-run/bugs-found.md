# Application Bugs Found — 2026-03-23

## BUG-001: Approval page crashes (CRITICAL)
- **URL**: https://ttt-qa-2.noveogroup.com/approve/employees
- **Build**: 2.1.26-SNAPSHOT.LOCAL (23.03.2026)
- **Error**: "Без паники! Что-то пошло не так, и страница не загрузилась."
- **Impact**: ~135 test failures, ALL approval functionality inaccessible
- **Steps to reproduce**:
  1. Login as pvaynmaster
  2. Click "Подтверждение" in navbar
  3. Page shows error instead of approval table
- **Priority**: P0 — core approval workflow blocked
- **Affected tests**: approval-by-project.spec.ts, approval-by-employee.spec.ts, approval.spec.ts, approval-roles.spec.ts

## BUG-002: Direct URL navigation fails for some routes
- **Affected routes**: `/approval`, `/statistics`, `/calendar` — all redirect to `/report`
- **Workaround**: Navigate via navbar links (click-based navigation works)
- **Impact**: Minor — React Router client-side routing may not handle direct URL access without proper auth token
