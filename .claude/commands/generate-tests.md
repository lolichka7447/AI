Сгенерируй Playwright-тесты для модуля $ARGUMENTS:

## 1. Получи тест-кейсы

**Источники (в порядке приоритета):**
- Файл `_qa-report-$ARGUMENTS.md` — возьми P0 и P1 тест-кейсы
- Пользователь передал текст/файл — используй напрямую
- Confluence MCP → найди тест-кейсы для модуля
- Если ничего нет — предложи `/analyze-module $ARGUMENTS`

## 2. Подготовь окружение

Проверь наличие обязательных файлов (создай если нет):
- `tests/fixtures/auth.fixture.ts` — JWT авторизация с кэшированием токенов
- `tests/fixtures/env.config.ts` — переменные окружения из `.env`
- `tests/fixtures/db.helper.ts` — хелпер для PostgreSQL (если нужны DB-тесты)
- `tests/fixtures/test-data.ts` — константы тестовых данных
- `tests/pages/base.page.ts` — базовый Page Object

## 3. Сгенерируй тесты

Для каждого тест-кейса:

**UI-тесты → `tests/e2e/$ARGUMENTS.spec.ts`:**
- Создай Page Object в `tests/pages/`
- Используй `auth.fixture.ts` для авторизации
- Проверь селекторы через Playwright MCP (если подключён)

**API-тесты → `tests/api/$ARGUMENTS.spec.ts`:**
- Используй `authHeaders` fixture для JWT
- Тестируй: happy path + 401 + 403 + 400 (валидация)
- Проверяй response body и status code

**DB-тесты → `tests/db/$ARGUMENTS.spec.ts`:**
- Используй `db.helper.ts` для прямых SQL-запросов
- Проверяй что данные корректно сохраняются после API-вызовов

## 4. Запусти и проверь

```bash
npx playwright test tests/e2e/$ARGUMENTS.spec.ts --project=chromium
npx playwright test tests/api/$ARGUMENTS.spec.ts --project=chromium
```

- Если тест падает — исправь и перезапусти (до 3 попыток)
- Для UI-тестов: если селектор не найден, проверь через Playwright MCP snapshot
- Для API-тестов: если 404/500, проверь endpoint в коде контроллера

## 5. Отчёт

Выведи:
- Сколько тестов создано (по типам: UI / API / DB)
- Сколько прошло / упало
- Что требует ручной проверки (селекторы, тестовые данные)
- Команда для повторного запуска
