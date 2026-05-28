# Bug Reporter

Create bug reports in GitLab following the project's standard format.

## Trigger
Use when: "report a bug", "file a bug", "create a bug", "сдай баг", "заведи баг", "создай баг", "report issue", or any task involving creating a bug report in GitLab.

## Title Format

**MANDATORY**: `[Bug][PageName] Short description in English`

- PageName = the TTT module/page where the bug occurs
- Description = concise, in English (international team)

### Page Name Reference

| Page | Tag |
|------|-----|
| Confirmation / Подтверждение | `Confirmation` |
| Vacation / Отпуска | `Vacation` |
| Sick Leave / Больничные | `SickLeave` |
| Statistics / Статистика | `Statistics` |
| Planner / Планировщик | `Planner` |
| Time Report / Таймрепорт | `TimeReport` |
| Projects / Проекты | `Projects` |
| Admin / Администрирование | `Admin` |
| Settings / Настройки | `Settings` |
| Notifications / Уведомления | `Notifications` |
| Login / Авторизация | `Login` |
| API | `API` |

If the page is not listed, use the closest English name.

### Title Examples

- `[Bug][Confirmation] 403 Forbidden on GET settings?name=notification.reporting.over`
- `[Bug][Vacation] Employee cannot see remaining vacation days`
- `[Bug][Statistics] NaN% displayed in overtime banner for department managers`
- `[Bug][API] PUT /api/ttt/v1/sick-leave returns 500 for family member type`

## Description Template

Write the description in **English** (international team). Use this structure:

```markdown
## TL;DR

One-paragraph summary: what is broken, what is the impact.

## Steps to reproduce

1. Step 1
2. Step 2
3. Step 3

## Expected

What should happen.

## Actual

What happens instead.

## Impact

Who is affected and how. What functionality is broken.
```

### Optional Sections (add when relevant)

- **Root cause** — if you identified why the bug occurs
- **Suggested fix** — proposed solution
- **Workaround** — temporary fix if available
- **Related** — link related issues, mentions from team
- **URL** — for API bugs, include the full endpoint
- **Screenshot** — attach if available
- **Environment** — if bug is environment-specific (QA-2, Stage, Preprod)

## GitLab API

Project ID: `1288`
Base URL: `https://gitlab.noveogroup.com`
Token env var: `GITLAB_PERSONAL_ACCESS_TOKEN`

### Create Issue

```javascript
const https = require('https');
const data = JSON.stringify({
  title: '[Bug][PageName] English title here',
  description: 'Markdown description here',
  labels: 'Bug'
});
const options = {
  hostname: 'gitlab.noveogroup.com',
  path: '/api/v4/projects/1288/issues',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': process.env.GITLAB_PERSONAL_ACCESS_TOKEN || 'token-from-env',
    'Content-Length': Buffer.byteLength(data)
  }
};
```

## Example: Full Bug Report

**Title**: `[Bug][Confirmation] 403 Forbidden on GET settings?name=notification.reporting.over for non-admin users`

**Labels**: `Backend,Sprint 16`

**Description**:
```
## TL;DR

The `GET /api/ttt/v1/settings?name=notification.reporting.over` endpoint returns 403 Forbidden for users who have access to the Confirmation page but lack admin privileges. This setting controls overtime/undertime display and is required for the Confirmation page to render correctly.

## Steps to reproduce

1. Log in as a user with access to the Confirmation page (non-admin role)
2. Open the Confirmation page
3. Observe the `GET /api/ttt/v1/settings?name=notification.reporting.over` request in DevTools

## Expected

Request returns 200 OK with the `notification.reporting.over` setting value.

## Actual

Request returns **403 Forbidden**.

## Impact

The Confirmation page cannot display overtime/undertime information for employees, preventing managers from reviewing this data during the approval process.

## Suggested fix

Grant read access to the `notification.reporting.over` setting for all roles that have access to the Confirmation page.
```

## Labels

Every bug MUST have these labels:

| Label | Value | Notes |
|-------|-------|-------|
| `Backend` or `Frontend` | **required** | Where the bug is. Use `Backend` for API/server issues, `Frontend` for UI issues |
| `Sprint N` | current sprint | Ask user if unsure. Current: `Sprint 16` |

### How to choose Backend vs Frontend

| Symptom | Label |
|---------|-------|
| API returns wrong status code (403, 500, etc.) | `Backend` |
| Wrong data in API response | `Backend` |
| Permission/access denied on API level | `Backend` |
| UI element missing, misaligned, wrong text | `Frontend` |
| JS error in console, broken rendering | `Frontend` |
| Wrong API call from frontend (wrong params) | `Frontend` |
| Data displayed incorrectly despite correct API response | `Frontend` |

Additional labels to consider (add when relevant):
- `HotFix Sprint N` — for critical bugs that need immediate fix
- `Ready to Test` — when fix is deployed and needs verification

### Setting Labels in API

```javascript
labels: 'Backend,Sprint 16'  // comma-separated string
```

## Rules

- Title ALWAYS in format `[Bug][PageName] English description`
- Description in English (international team), detailed and structured
- Always add labels: (`Backend` or `Frontend`) + current sprint (e.g. `Sprint 16`)
- Do NOT add a `Bug` label — the `[Bug]` prefix in the title is sufficient
- Always use Node.js https module (not curl) for GitLab API calls — avoids escaping issues on Windows
- Read `GITLAB_PERSONAL_ACCESS_TOKEN` from `.env` file
- After creating, output the issue number and URL
