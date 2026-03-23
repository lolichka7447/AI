Сгенерируй Playwright-тесты для модуля $ARGUMENTS:

## 1. Получи тест-кейсы

**Источники (в порядке приоритета):**

- Файл `_qa-report-$ARGUMENTS.md` — возьми P0 и P1 тест-кейсы
- Пользователь передал текст/файл — используй напрямую
- Qase MCP → найди тест-кейсы для модуля
- Если ничего нет — предложи `/analyze-module $ARGUMENTS`

## 2. Подготовь окружение

Проверь наличие обязательных файлов (создай если нет):

- `tests/fixtures/auth.fixture.ts` — CAS авторизация с кэшированием состояния
- `tests/fixtures/env.config.ts` — переменные окружения из `.env`
- `tests/fixtures/db.helper.ts` — хелпер для PostgreSQL (если нужны DB-тесты)
- `tests/fixtures/test-data.ts` — константы тестовых данных
- `tests/pages/base.page.ts` — базовый Page Object
- `tests/i18n/index.ts` — i18n система (функции `t()`, `tRegex()`)

## 3. Проверь i18n

**ВСЕ текстовые селекторы** ОБЯЗАНЫ использовать i18n:

```typescript
import { t } from '../i18n';

// ПРАВИЛЬНО:
page.getByRole('button', { name: new RegExp(t('btn.add'), 'i') });
page.locator(`button:has-text("${t('btn.save')}")`);

// НЕПРАВИЛЬНО — ЗАПРЕЩЕНО:
page.getByRole('button', { name: /Добавить/i });
page.locator('button:has-text("Сохранить")');
```

Если нужного ключа нет в `tests/i18n/ru.ts` / `tests/i18n/en.ts` — добавь его.

## 4. TTT-специфичные DOM-паттерны

При написании Page Objects используй эти проверенные селекторы:

| Элемент                | Селектор                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- |
| Табы страницы          | `.main-tabs__theme-main .main-tabs__item` + `.filter({ hasText: ... })`      |
| Админ-навигация        | `getByRole('link', { name: ... })` (не табы!)                                |
| Таблицы данных         | `page.locator('table:visible').first()` (НЕ `table.first()` — есть скрытые!) |
| Модальные окна         | `.modal__wrapper, .modal, [role="dialog"]`                                   |
| Переключатель недели   | `.week-switcher__button-switch_prev`, `.week-switcher__button-switch_next`   |
| Языковой переключатель | `.language-switcher` → `.drop-down-menu__option`                             |

**Навигация в admin:** используй `page.goto('/admin/projects')` вместо кликов по ссылкам — надёжнее.

## 5. Сгенерируй тесты — ПРАВИЛА ГЛУБИНЫ

### ЗАПРЕЩЁННЫЕ АНТИ-ПАТТЕРНЫ (не генерируй такие тесты):

```typescript
// ❌ АНТИ-ПАТТЕРН 1: Только видимость — ничего не проверяет
test('Страница загружается', async ({ page }) => {
  await page.goto('/report');
  await expect(page.locator('.content')).toBeVisible();
});

// ❌ АНТИ-ПАТТЕРН 2: typeof проверка — ВСЕГДА true
const count = await rows.count();
expect(typeof count).toBe('number'); // бессмысленно

// ❌ АНТИ-ПАТТЕРН 3: Проверка boolean типа — ВСЕГДА true
const isVisible = await element.isVisible();
expect(typeof isVisible).toBe('boolean'); // бессмысленно

// ❌ АНТИ-ПАТТЕРН 4: Только навигация без проверки содержимого
test('Переход на страницу', async ({ page }) => {
  await page.goto('/planner');
  await expect(page).toHaveURL(/planner/);
  // и всё? Где проверка данных?
});
```

### ОБЯЗАТЕЛЬНЫЕ ТИПЫ ТЕСТОВ (для каждого модуля):

**A) Тесты данных (минимум 30% от всех тестов):**

```typescript
// ✅ Проверка реальных данных в таблице
const rows = await table.locator('tbody tr').all();
expect(rows.length).toBeGreaterThan(0);
for (const row of rows.slice(0, 3)) {
  const cells = await row.locator('td').allTextContents();
  expect(cells[0]).toBeTruthy(); // имя не пустое
  expect(cells[1]).toMatch(/\d+/); // числовое значение
}

// ✅ Проверка суммы/итогов
const total = await page.locator('tfoot td:nth-child(3)').textContent();
expect(parseFloat(total!.replace(/[^\d.,]/g, ''))).toBeGreaterThan(0);
```

**B) Тесты workflow (минимум 20%):**

```typescript
// ✅ Создание → проверка → удаление
await page.getByRole('button', { name: new RegExp(t('btn.add'), 'i') }).click();
await modal.locator('input[name="name"]').fill('Test Item');
await modal.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).click();
await expect(page.locator('table:visible')).toContainText('Test Item');
// Удаление
await page.locator('tr:has-text("Test Item")').locator('[class*="delete"]').click();
await expect(page.locator('table:visible')).not.toContainText('Test Item');
```

**C) Тесты фильтрации и сортировки (минимум 15%):**

```typescript
// ✅ Фильтр меняет данные
const countBefore = await rows.count();
await filterSelect.selectOption('department-1');
await page.waitForLoadState('networkidle');
const countAfter = await rows.count();
expect(countAfter).toBeLessThanOrEqual(countBefore);
// Проверь что ВСЕ строки соответствуют фильтру
```

**D) Негативные тесты (минимум 15%):**

```typescript
// ✅ Пустая форма — кнопка disabled или валидация
await submitButton.click();
await expect(page.locator('[class*="error"], .validation-error')).toBeVisible();

// ✅ Некорректные данные
await input.fill('abc'); // где ожидается число
await expect(page.locator('[class*="error"]')).toBeVisible();
```

**E) Тесты прав доступа (минимум 10%):**

```typescript
// ✅ Сотрудник не видит кнопку admin
await expect(page.getByRole('link', { name: /admin/i })).not.toBeVisible();
```

**F) Тесты состояний (минимум 10%):**

```typescript
// ✅ Empty state при пустых данных
// ✅ Loading state во время загрузки
// ✅ Error state при сбое
```

### Распределение глубины:

- **Shallow (toBeVisible/toHaveURL)**: НЕ БОЛЕЕ 20% тестов
- **Medium (клик + проверка результата)**: 30-40%
- **Deep (workflow/данные/фильтры/негативные)**: 40-50%

## 6. Структура тестов

Для каждого тест-кейса:

**UI-тесты → `tests/e2e/$ARGUMENTS.spec.ts`:**

- Создай Page Object в `tests/pages/`
- Используй `auth.fixture.ts` для авторизации
- Используй `t()` из `tests/i18n` для ВСЕХ текстов
- Проверь селекторы через Playwright MCP (если подключён)

**API-тесты → `tests/api/$ARGUMENTS.spec.ts`:**

- Используй `authHeaders` fixture для JWT
- Тестируй: happy path + 401 + 403 + 400 (валидация)
- Проверяй response body и status code
- Сверяй данные API с тем, что отображается в UI

**DB-тесты → `tests/db/$ARGUMENTS.spec.ts`:**

- Используй `db.helper.ts` для прямых SQL-запросов
- Проверяй что данные корректно сохраняются после API-вызовов

## 7. Валидация селекторов (перед запуском)

**Если доступен Playwright MCP** (`playwright-cli` скилл):

Перед запуском тестов проверь ключевые селекторы на живой странице:

1. Открой целевую страницу модуля через Playwright MCP
2. Для каждого нового/изменённого селектора проверь:
   - Существует ли элемент на странице
   - Уникален ли селектор (нет дубликатов)
   - Видим ли элемент (не скрыт)

```
Проверяемые селекторы:
- Page Object locators (this.xxx в *.page.ts)
- Локаторы в тестах (.locator(), .getByRole(), etc.)
- i18n ключи (t('key') → реальный текст на странице)
```

3. Если селектор не найден:
   - Сделай snapshot страницы через Playwright MCP
   - Найди правильный селектор в DOM
   - Обнови Page Object и тест

**Если Playwright MCP недоступен:**
- Пропусти этот шаг
- Пометь селекторы как "не проверены" в отчёте
- Селекторы будут провалидированы при первом запуске тестов

## 8. Запусти и проверь

```bash
npx playwright test tests/e2e/$ARGUMENTS.spec.ts --project=e2e --workers=2
```

- Если тест падает — исправь и перезапусти (до 3 попыток)
- Для UI-тестов: если селектор не найден, проверь через Playwright MCP snapshot
- Для API-тестов: если 404/500, проверь endpoint в коде контроллера
- **Используй `workers: 2`** — сервер не выдерживает больше параллельных сессий

## 9. Обнови историю

После успешного прогона тестов history-reporter автоматически сохранит результаты в `reports/history.json`.
Предложи запустить `/quality-trend $ARGUMENTS` для просмотра тренда.

## 10. Отчёт

Выведи:

- Сколько тестов создано (по типам: UI / API / DB)
- **Распределение по глубине: shallow / medium / deep** (с процентами)
- Сколько прошло / упало
- Что требует ручной проверки (селекторы, тестовые данные)
- Команда для повторного запуска
