Протестируй задачу из GitLab: $ARGUMENTS

Ты — автономный QA-агент. Твоя цель: взять задачу из GitLab, полностью протестировать её (автотесты + ручная проверка через браузер) и сгенерировать отчёт.

---

## Входные данные

- **Число** (например `42`): тестируй issue #42 из проекта `noveo-internal-tools/ttt-spring`
- **URL** (например `https://gitlab.noveogroup.com/.../issues/42`): извлеки ID из URL
- **"all"**: найди все issues с label `Ready to Test` и протестируй каждый
- **"sprint"**: найди issues текущего milestone с label `Ready to Test`

---

## Шаг 1: Получение задачи из GitLab

Используй **GitLab MCP** для получения данных об issue.

### Для одного issue:
- Получи: заголовок, описание, labels, assignee, milestone
- Получи linked Merge Requests (если есть)
- Прочитай комментарии (могут содержать уточнения к задаче)

### Для "all":
- Найди все open issues с labels: `Ready to Test`
- Для каждого выполни шаги 2-6
- В конце создай сводный отчёт `reports/test-task-summary.md`

### Для "sprint":
- Определи текущий активный milestone
- Найди issues этого milestone с label `Ready to Test`

---

## Шаг 2: Определение затронутых модулей

### 2.1 По labels issue
Ищи labels с паттерном:
- `module:vacation`, `module:admin`, `module:report` и т.д.
- Или просто: `vacation`, `report`, `admin`, `planner`, `approval`, `accounting`, `statistics`, `employee-tasks`, `notifications`, `faq`, `auth`

### 2.2 По MR diff (если есть linked MR)
Получи список изменённых файлов через GitLab MCP. Маппинг:

| Путь в MR | Модуль |
|-----------|--------|
| `**/controller/Report*`, `**/service/Report*` | report |
| `**/controller/Vacation*`, `**/service/Vacation*` | vacation |
| `**/controller/Admin*`, `**/service/Admin*` | admin |
| `**/controller/Approval*`, `**/service/Approval*` | approval |
| `**/controller/Planner*`, `**/service/Planner*` | planner |
| `**/controller/Accounting*`, `**/service/Accounting*` | accounting |
| `**/controller/Statistic*` | statistics |
| `**/controller/Task*`, `**/controller/EmployeeTask*` | employee-tasks |
| `**/controller/Notification*` | notifications |
| `**/controller/Faq*` | faq |
| `**/security/**`, `**/auth/**`, `**/cas/**` | auth |
| `**/templates/admin*` | admin |
| `**/templates/vacation*` | vacation |
| `**/templates/report*` | report |

### 2.3 По тексту описания (fallback)
Анализируй текст issue. Ключевые слова:
- "отпуск", "vacation", "отгул" → vacation
- "табель", "report", "отчёт" → report
- "админ", "admin", "настройки" → admin
- "план", "planner" → planner
- "утверждение", "approval", "согласование" → approval
- "бухгалтерия", "accounting", "зарплата", "salary" → accounting
- "статистика", "statistics" → statistics
- "задачи сотрудника", "employee tasks" → employee-tasks
- "уведомления", "notifications" → notifications
- "FAQ", "вопросы" → faq

### 2.4 Маппинг модулей → spec-файлы

| Модуль | Spec-файлы |
|--------|-----------|
| auth | `auth.spec.ts` |
| report | `report.spec.ts` |
| admin | `admin.spec.ts`, `admin-projects.spec.ts`, `admin-employees.spec.ts`, `admin-params.spec.ts`, `admin-calendar.spec.ts`, `admin-api.spec.ts` |
| vacation | `vacation-employee.spec.ts`, `vacation-manager.spec.ts`, `vacation-requests.spec.ts`, `vacation-deep.spec.ts` |
| approval | `approval-by-employee.spec.ts`, `approval-by-project.spec.ts` |
| planner | `planner-projects.spec.ts`, `planner-tasks.spec.ts`, `planner-tickets.spec.ts` |
| accounting | `accounting-payment.spec.ts`, `accounting-salary.spec.ts`, `accounting-periods.spec.ts`, `accounting-sick-leaves.spec.ts`, `accounting-vacation-correction.spec.ts` |
| statistics | `statistics-subpages.spec.ts` |
| employee-tasks | `employee-tasks.spec.ts` |
| notifications | `notifications.spec.ts` |
| faq | `faq.spec.ts` |

---

## Шаг 3: Извлечение сценариев для проверки

Из описания issue извлеки:

1. **Acceptance criteria** — ищи:
   - Чеклисты: `- [ ]`, `- [x]`
   - Нумерованные списки
   - Фразы: "должно", "необходимо", "expected", "ожидаемый результат"
   - Заголовки: "Acceptance Criteria", "AC", "Критерии приёмки"

2. **Шаги воспроизведения** (если баг):
   - "Steps to reproduce", "Шаги воспроизведения"
   - Нумерованные действия пользователя

3. **Ожидаемое поведение**:
   - "Expected behavior", "Ожидаемый результат"

4. **Затронутые URL**:
   - Прямые ссылки на страницы TTT (https://ttt-qa-2.noveogroup.com/...)
   - Названия разделов: "страница отпусков", "раздел администратора"

5. **Сопоставление с существующими тест-кейсами**:
   - Проверь `_qa-report-[module].md` — есть ли тест-кейсы покрывающие описанную функциональность
   - Определи какие из существующих автотестов наиболее релевантны

---

## Шаг 4: Запуск существующих автотестов

### 4.1 Подготовка
Убедись что auth setup выполнен:
```bash
npx playwright test --project=setup
```

### 4.2 Запуск релевантных тестов
Запусти spec-файлы затронутых модулей:
```bash
npx playwright test tests/e2e/[spec-file].spec.ts --project=e2e --workers=2 --reporter=list
```

Если модулей несколько — перечисли все файлы:
```bash
npx playwright test tests/e2e/vacation-employee.spec.ts tests/e2e/vacation-requests.spec.ts --project=e2e --workers=2 --reporter=list
```

**ВАЖНО**: ВСЕГДА используй `--workers=2` — сервер TTT не выдерживает больше!

### 4.3 Если есть конкретная функциональность в issue
Используй `--grep` для запуска только релевантных тестов:
```bash
npx playwright test tests/e2e/vacation-*.spec.ts --grep "request" --project=e2e --workers=2
```

### 4.4 Сбор результатов
Запиши:
- Общее количество тестов
- Passed / Failed / Skipped / TimedOut
- Список упавших тестов с ошибками (имя теста + сообщение об ошибке)
- Общее время выполнения

---

## Шаг 5: Ручная проверка через Playwright MCP

Используй **Playwright MCP** (browser automation tools) для интерактивной проверки.

### 5.1 Подготовка сессии
1. Навигируйся на `https://ttt-qa-2.noveogroup.com/`
2. Если требуется логин — введи username `pvaynmaster` в поле логина
3. Дождись загрузки главной страницы
4. Сделай snapshot для подтверждения авторизации

### 5.2 Проверка каждого Acceptance Criteria
Для КАЖДОГО пункта из AC:

1. **Навигация**: перейди на нужную страницу
2. **Действие**: выполни описанные шаги (клик, ввод данных, выбор из списка)
3. **Скриншот**: сделай скриншот результата
4. **Оценка**: сравни результат с ожидаемым поведением
5. **Запись**: PASS / FAIL / UNCLEAR + описание наблюдения

### 5.3 Проверка edge cases
Проверь пограничные случаи, НЕ описанные в issue:
- Пустые поля / данные
- Очень длинные строки (200+ символов)
- Специальные символы (`<>'"&`)
- Повторное выполнение действия (double-click, double-submit)
- Обновление страницы (F5) во время операции
- Навигация назад/вперёд

### 5.4 Проверка регрессии
Убедись что изменения НЕ сломали:
- Навигация по разделам работает
- Другие табы/подразделы отображаются корректно
- Данные в таблицах корректны
- Фильтры и сортировка работают

---

## Шаг 6: Генерация отчёта

Сохрани отчёт в `reports/test-task-[issueId].md`:

```markdown
# Test Report: Issue #[ID] — [Title]

**Дата**: [YYYY-MM-DD HH:MM]
**Issue**: [GitLab URL]
**Модули**: [список затронутых модулей]
**Milestone**: [если есть]
**MR**: [ссылка на MR, если есть]
**Тестировал**: QA Agent (Claude Code)

---

## 1. Описание задачи

[Краткое содержание issue — 2-3 предложения]

### Acceptance Criteria:
1. [критерий 1]
2. [критерий 2]
...

---

## 2. Автоматическое тестирование

### Запущенные spec-файлы:

| Файл | Тестов | Passed | Failed | Skipped | Время |
|------|--------|--------|--------|---------|-------|
| [spec-file] | N | N | N | N | Ns |

### Общий результат:
- **Total**: X tests
- **Passed**: Y (Z%)
- **Failed**: N
- **Skipped**: M
- **Время**: Xs

### Упавшие тесты (если есть):

| Тест | Файл:строка | Ошибка |
|------|-------------|--------|
| [название] | [файл:строка] | [краткая ошибка] |

---

## 3. Ручная проверка

### Acceptance Criteria:

| # | Критерий | Статус | Наблюдение |
|---|----------|--------|------------|
| 1 | [текст] | PASS/FAIL/UNCLEAR | [что увидели] |

### Edge Cases:

| Сценарий | Результат | Заметки |
|----------|-----------|---------|
| Пустые данные | OK/BUG | [описание] |
| Длинная строка | OK/BUG | [описание] |
| Спецсимволы | OK/BUG | [описание] |
| Double-submit | OK/BUG | [описание] |

### Регрессия:

| Проверка | Статус |
|----------|--------|
| Навигация | OK/BROKEN |
| Соседние разделы | OK/BROKEN |
| Данные в таблицах | OK/BROKEN |

---

## 4. Найденные проблемы

| # | Серьёзность | Описание | Шаги воспроизведения |
|---|-------------|----------|---------------------|
| 1 | Critical/Major/Minor/Trivial | [описание] | [шаги] |

---

## 5. Вердикт

### **[PASS / FAIL / NEEDS_ATTENTION]**

**Обоснование**: [почему именно такой вердикт]

### Рекомендации:
- [что нужно исправить / доработать]
- [нужны ли дополнительные автотесты]
- [предложение по улучшению]
```

---

## Действия по результатам

### Если вердикт PASS:
Предложи пользователю:
1. Добавить label `Tested: Passed` к issue через GitLab MCP
2. Если не хватает автотестов для новой функциональности — предложи `/generate-tests [module]`

### Если вердикт FAIL:
Предложи пользователю:
1. Добавить label `Tested: Failed` к issue через GitLab MCP
2. Оставить комментарий в issue с кратким описанием проблем
3. Создать отдельные issues для найденных багов (если они не связаны с исходной задачей)

### Если вердикт NEEDS_ATTENTION:
Предложи пользователю:
1. Добавить label `Testing in Progress` к issue
2. Описать что требует ручной проверки человеком
3. Указать конкретные сценарии для дополнительной проверки

---

## Ролевая модель TTT

При тестировании учитывай роль, от которой зависит доступ к функциональности.
Используй `TEST_USERS` из `tests/fixtures/env.config.ts` для логина под нужной ролью.

| Роль | Login | Имя | Описание |
|------|-------|-----|----------|
| Employee | abaymaganov | Anatols Baymaganov | Обычный сотрудник |
| Contractor | aleksey.pushkarev | Pushkarev Aleksey | Контрактор (ограниченный доступ) |
| Project Manager | aglushko | Artem Glushko | Менеджер проектов |
| Department Manager | nshumakov | Nikolay Shumakov | Руководитель отдела |
| Tech Lead | ailin | Alexander Ilin | Техлид |
| Chief Accountant | perekrest | Galina Perekrest | Главный бухгалтер |
| Accountant | lprokhorova | Liliya Prokhorova | Бухгалтер |
| Office HR | ekile | Egor Kile | HR офиса |
| Admin | slebedev | Sergey Lebedev | Администратор системы |
| View All | adanilevskaya | Anastasia Danilevskaya | Только просмотр |
| Chief Officer (DM) | pvaynmaster | Pavel Weinmeister | Все основные роли (основной тест-юзер) |

### Когда использовать разные роли:
- **Задача про отпуска/vacation** → проверь под employee, department_manager, chief_officer
- **Задача про admin-панель** → проверь под admin, а затем под employee (должен быть запрет)
- **Задача про бухгалтерию/accounting** → проверь под accountant, chief_accountant
- **Задача про утверждение/approval** → проверь под project_manager, department_manager
- **Задача про статистику** → проверь под admin, view_all, employee
- **Любая задача** → если есть роль-зависимый доступ, проверь минимум 2 роли (с доступом и без)

Авторизация: только login (без пароля) — `pvaynmaster` на QA-окружении.

---

## Важные ограничения

- **Workers = 2**: НИКОГДА не ставь больше 2 workers — сервер TTT не выдержит
- **VPN**: Для работы нужен VPN до ttt-qa-2.noveogroup.com
- **i18n**: Учитывай что интерфейс может быть на русском или английском
- **Не изменяй данные**: При ручной проверке старайся НЕ создавать/удалять реальные записи, если это не требуется для тестирования конкретной задачи
- **Скриншоты**: Делай скриншоты ключевых моментов — они важны для отчёта
