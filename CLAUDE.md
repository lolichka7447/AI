# TTT QA Automation — Project Rules

## Test Run Reports
- All test run reports and analysis must be saved in `reports/` directory
- Each run gets its own folder: `reports/YYYY-MM-DD_HH-mm/`
- Folder contents:
  - `summary.md` — overall results (passed/failed/skipped, pass rate)
  - `failures-by-module.md` — failures grouped by spec file
  - `bugs-found.md` — application bugs discovered during the run
  - Screenshots and traces from test-results/ may be copied if relevant
- One run = one folder. Never mix reports from different runs.

## Git Workflow
- Commit changes to GitHub after completing meaningful work
- Use clear commit messages in English describing what was done
- Do NOT commit: `.env`, `auth-state.json`, `.auth/`, `test-results/`, `node_modules/`
- Always `git add` specific files, never `git add -A`

## Language
- Code and commit messages: English
- Communication with user: Russian (unless asked otherwise)
- i18n: always use `t()` / `tRegex()` for localized text in tests

## Test Development
- POM pattern: `tests/pages/*.page.ts`, `tests/pages/*.component.ts`
- E2E tests: `tests/e2e/*.spec.ts`
- Workers: max 2 (server overloads with more)
- Auth fixture: `tests/fixtures/auth.fixture.ts`
- Always validate selectors against real DOM before writing tests
