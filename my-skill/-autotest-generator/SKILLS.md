---
name: qa-autotest-generator
description: >
  Генерация автотестов Playwright на основе тестовой документации.
  Используй этот скилл когда нужно превратить тест-кейсы в
  автоматические тесты, сгенерировать e2e-тесты, написать
  Playwright-скрипты. Триггерится на: "сгенерируй автотесты",
  "напиши playwright тест", "автоматизируй тест-кейс",
  "создай e2e тест", "напиши тест для страницы",
  "автоматизируй сценарий". Также используй при любом упоминании
  автоматизации тестирования, Playwright, end-to-end тестов,
  или когда пользователь хочет превратить ручные тесты в автоматические.
---

# QA Autotest Generator

Ты — опытный автоматизатор тестирования. Твоя задача — превращать
тестовую документацию в **глубокие, содержательные** Playwright-тесты,
следуя лучшим практикам и паттерну Page Object Model.

**Главный принцип**: тест должен проверять ЛОГИКУ приложения, а не просто
видимость элементов. Тест `toBeVisible()` без проверки данных — бесполезен.

## КРИТИЧЕСКИ ВАЖНО: i18n

ВСЕ текстовые селекторы ОБЯЗАНЫ использовать i18n систему из `tests/i18n/`:

```typescript
import { t } from '../i18n';  // в page objects: '../i18n' или '../../i18n'

// ✅ ПРАВИЛЬНО:
page.getByRole('button', { name: new RegExp(t('btn.add'), 'i') })
page.locator(`button:has-text("${t('btn.save')}")`)
page.locator('.main-tabs__item').filter({ hasText: new RegExp(t('tab.projects'), 'i') })

// ❌ ЗАПРЕЩЕНО — хардкод русского/английского текста:
page.getByRole('button', { name: /Добавить/i })
page.locator('button:has-text("Сохранить")')
```

Если ключа нет в `tests/i18n/ru.ts` / `tests/i18n/en.ts` — добавь его в ОБА файла.

## ЗАПРЕЩЁННЫЕ АНТИ-ПАТТЕРНЫ

Никогда не генерируй тесты с этими паттернами:

```typescript
// ❌ АНТИ-ПАТТЕРН 1: typeof проверка — ВСЕГДА true, бесполезно
const count = await rows.count();
expect(typeof count).toBe('number');

// ❌ АНТИ-ПАТТЕРН 2: boolean typeof — ВСЕГДА true
const isVisible = await element.isVisible();
expect(typeof isVisible).toBe('boolean');

// ❌ АНТИ-ПАТТЕРН 3: Только видимость без данных
test('Страница загружается', async ({ page }) => {
  await page.goto('/report');
  await expect(page.locator('.content')).toBeVisible();
  // Что проверили? Ничего. Любая страница "загружается".
});

// ❌ АНТИ-ПАТТЕРН 4: Только навигация
test('Переход', async ({ page }) => {
  await page.goto('/planner');
  await expect(page).toHaveURL(/planner/);
  // Где проверка что данные отображаются?
});
```

## TTT-специфичные DOM-паттерны

| Элемент | Селектор |
|---------|----------|
| Табы страницы | `.main-tabs__theme-main .main-tabs__item` + `.filter({ hasText })` |
| Админ-навигация | `getByRole('link', { name })` (dropdown links, НЕ табы!) |
| Таблицы данных | `page.locator('table:visible').first()` (ЕСТЬ скрытые таблицы!) |
| Модальные окна | `.modal__wrapper, .modal, [role="dialog"]` |
| Недельный переключатель | `.week-switcher__button-switch_prev/next` |
| Языковой переключатель | `.language-switcher` → `.drop-down-menu__option` |

**Админ-навигация**: используй `page.goto('/admin/projects')` вместо кликов — надёжнее.
**Workers**: используй `workers: 2` — сервер TTT не выдерживает больше.

## Обязательное распределение глубины тестов

Каждый spec-файл ДОЛЖЕН содержать:
- **Shallow** (toBeVisible/toHaveURL): НЕ БОЛЕЕ 20%
- **Medium** (клик + проверка): 30-40%
- **Deep** (workflow/данные/фильтры/негативные): 40-50%

## Шаг 1: Получение тестовой документации

Определи источник тест-кейсов (в порядке приоритета):

1. **Файл `_qa-report-*.md` существует** — используй тест-кейсы оттуда
2. **Пользователь передал файл или текст** — используй напрямую
3. **Confluence MCP подключён** — найди тест-кейсы для указанного модуля
4. **Тест-кейсов нет** — предложи сначала запустить `/analyze-module [module]`

Для каждого тест-кейса определи тип:

- **UI-тест**: взаимодействие с элементами страницы → `tests/e2e/`
- **API-тест**: прямые HTTP-запросы к эндпоинтам → `tests/api/`
- **DB-тест**: проверка данных в базе после действий → `tests/db/`

## Шаг 2: Настройка окружения

### 2.1 Auth Fixture (ОБЯЗАТЕЛЬНО для проектов с авторизацией)

Создай фикстуру авторизации в `tests/fixtures/auth.fixture.ts`:

```typescript
import { test as base, expect } from '@playwright/test';

// Типы для конфигурации авторизации
interface AuthConfig {
  baseUrl: string;
  jwtEndpoint: string;       // POST endpoint для получения JWT
  jwtHeader: string;          // Имя заголовка для JWT (например, 'Authorization-JWT-Token')
  apiTokenHeader?: string;    // Имя заголовка для API Token (если есть)
}

interface UserCredentials {
  login: string;
  password: string;
  role: string;               // Для логирования и отладки
}

// Конфигурация — адаптируй под целевой проект
const AUTH_CONFIG: AuthConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:9583',
  jwtEndpoint: '/api/ttt/v1/authentication',
  jwtHeader: 'Authorization-JWT-Token',
  apiTokenHeader: 'Authorization-API-Token',
};

// Тестовые пользователи — адаптируй под целевой проект
export const TEST_USERS: Record<string, UserCredentials> = {
  admin: {
    login: process.env.TEST_ADMIN_LOGIN || 'admin',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    role: 'ADMIN',
  },
  manager: {
    login: process.env.TEST_MANAGER_LOGIN || 'manager',
    password: process.env.TEST_MANAGER_PASSWORD || 'manager123',
    role: 'PROJECT_MANAGER',
  },
  employee: {
    login: process.env.TEST_EMPLOYEE_LOGIN || 'employee',
    password: process.env.TEST_EMPLOYEE_PASSWORD || 'employee123',
    role: 'EMPLOYEE',
  },
};

// Кэш токенов — получаем один раз за прогон
const tokenCache = new Map<string, string>();

async function getJwtToken(
  request: any,
  user: UserCredentials
): Promise<string> {
  const cacheKey = user.login;
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey)!;
  }

  const response = await request.post(
    `${AUTH_CONFIG.baseUrl}${AUTH_CONFIG.jwtEndpoint}`,
    {
      data: { login: user.login, password: user.password },
    }
  );

  if (response.status() !== 200) {
    throw new Error(
      `Auth failed for ${user.login} (${user.role}): ${response.status()}`
    );
  }

  const body = await response.json();
  const token = body.token || body.accessToken || body;
  tokenCache.set(cacheKey, token);
  return token;
}

// Расширяем базовый test с авторизованными fixtures
type AuthFixtures = {
  adminToken: string;
  managerToken: string;
  employeeToken: string;
  authHeaders: (role?: string) => Promise<Record<string, string>>;
};

export const test = base.extend<AuthFixtures>({
  adminToken: async ({ request }, use) => {
    const token = await getJwtToken(request, TEST_USERS.admin);
    await use(token);
  },
  managerToken: async ({ request }, use) => {
    const token = await getJwtToken(request, TEST_USERS.manager);
    await use(token);
  },
  employeeToken: async ({ request }, use) => {
    const token = await getJwtToken(request, TEST_USERS.employee);
    await use(token);
  },
  authHeaders: async ({ request }, use) => {
    const getHeaders = async (role = 'admin') => {
      const user = TEST_USERS[role] || TEST_USERS.admin;
      const token = await getJwtToken(request, user);
      return { [AUTH_CONFIG.jwtHeader]: token };
    };
    await use(getHeaders);
  },
});

export { expect } from '@playwright/test';
```

### 2.2 Environment Config

Создай `tests/fixtures/env.config.ts`:

```typescript
export const ENV = {
  baseUrl: process.env.BASE_URL || 'http://localhost:9583',
  apiPrefix: process.env.API_PREFIX || '/api/ttt',
  dbHost: process.env.POSTGRES_HOST || 'localhost',
  dbPort: parseInt(process.env.POSTGRES_PORT || '5433'),
  dbName: process.env.POSTGRES_DB || 'ttt',
  dbUser: process.env.POSTGRES_USER || 'ttt',
  dbPassword: process.env.POSTGRES_PASSWORD || '123456',
} as const;
```

### 2.3 DB Helper (для DB-тестов)

Создай `tests/fixtures/db.helper.ts`:

```typescript
import { Client } from 'pg';
import { ENV } from './env.config';

export async function queryDb<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = new Client({
    host: ENV.dbHost,
    port: ENV.dbPort,
    database: ENV.dbName,
    user: ENV.dbUser,
    password: ENV.dbPassword,
  });
  await client.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    await client.end();
  }
}
```

## Шаг 3: Генерация Page Object (для UI-тестов)

Перед написанием тестов создай Page Object для каждой страницы:

```typescript
// tests/pages/login.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Приоритет селекторов: data-testid > role > text > css
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByRole('button', { name: 'Войти' });
    this.errorMessage = page.getByTestId('error-message');
  }

  get url() { return '/login'; }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### Правила для Page Object:

- Один файл на одну страницу/компонент
- Наследуй от `BasePage` (уже создан в `tests/pages/base.page.ts`)
- Все селекторы — в конструкторе
- Приоритет селекторов: `data-testid` > `getByRole` > `getByText` > CSS
- Методы возвращают `Promise<void>` или данные, никогда не делают assertions
- Если подключён Playwright MCP — **обязательно** проверь селекторы на реальной странице

## Шаг 4: Генерация тестов

### UI-тесты (E2E)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';

test.describe('Авторизация', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-AUTH-001: Успешный вход', async ({ page }) => {
    await loginPage.login('user@example.com', 'ValidPass123');
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### API-тесты

```typescript
// tests/api/tasks.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { ENV } from '../fixtures/env.config';

const API = `${ENV.baseUrl}${ENV.apiPrefix}`;

test.describe('API: Tasks', () => {
  test('TC-TASK-001: Создание задачи', async ({ request, authHeaders }) => {
    const headers = await authHeaders('manager');

    const response = await request.post(`${API}/v1/tasks`, {
      headers,
      data: {
        projectId: 1,
        name: 'Test Task',
        ticketUrl: 'https://tracker.example.com/TASK-1',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Test Task');
  });

  test('TC-TASK-002: 401 без авторизации', async ({ request }) => {
    const response = await request.get(`${API}/v1/tasks`);
    expect(response.status()).toBe(401);
  });

  test('TC-TASK-003: 403 без прав на проект', async ({ request, authHeaders }) => {
    const headers = await authHeaders('employee');

    const response = await request.post(`${API}/v1/tasks`, {
      headers,
      data: { projectId: 999, name: 'Unauthorized Task' },
    });

    expect(response.status()).toBe(403);
  });
});
```

### DB-тесты (верификация данных)

```typescript
// tests/db/task-report.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { queryDb } from '../fixtures/db.helper';
import { ENV } from '../fixtures/env.config';

const API = `${ENV.baseUrl}${ENV.apiPrefix}`;

test.describe('DB: Task Reports', () => {
  test('TC-DB-001: Отчёт сохраняется в БД после создания через API',
    async ({ request, authHeaders }) => {
      const headers = await authHeaders('employee');

      // Создать отчёт через API
      const response = await request.post(`${API}/v1/task-reports`, {
        headers,
        data: {
          taskId: 1,
          reportDate: '2025-01-15',
          actualEfforts: 480,
          comment: 'Test report',
        },
      });
      expect(response.status()).toBe(200);
      const report = await response.json();

      // Проверить в БД
      const rows = await queryDb(
        'SELECT * FROM ttt_backend.task_report WHERE id = $1',
        [report.id]
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].actual_efforts).toBe(480);
      expect(rows[0].comment).toBe('Test report');
    }
  );
});
```

### Шаблоны глубоких тестов (ОБЯЗАТЕЛЬНО использовать)

**A) Тест данных в таблице:**
```typescript
test('TC-XXX-NNN: Таблица содержит корректные данные', async ({ page }) => {
  const table = page.locator('table:visible').first();
  const rows = table.locator('tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  // Проверяем первые 3 строки
  for (let i = 0; i < Math.min(3, count); i++) {
    const cells = await rows.nth(i).locator('td').allTextContents();
    expect(cells[0].trim()).toBeTruthy(); // имя не пустое
    expect(cells[1]).toMatch(/\d/);        // есть числовые данные
  }
});
```

**B) Тест workflow (CRUD):**
```typescript
test('TC-XXX-NNN: Создание и проверка элемента', async ({ page }) => {
  // Открыть форму
  await page.getByRole('button', { name: new RegExp(t('btn.add'), 'i') }).click();
  const modal = page.locator('.modal__wrapper').first();
  await expect(modal).toBeVisible();

  // Заполнить форму
  await modal.locator('input').first().fill('Test Item ' + Date.now());
  await modal.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).click();

  // Проверить результат
  await expect(page.locator('table:visible')).toContainText('Test Item');
});
```

**C) Тест фильтрации:**
```typescript
test('TC-XXX-NNN: Фильтр изменяет данные', async ({ page }) => {
  const rows = page.locator('table:visible tbody tr');
  const countBefore = await rows.count();

  // Применить фильтр
  await page.locator('select').first().selectOption({ index: 1 });
  await page.waitForLoadState('networkidle');

  const countAfter = await rows.count();
  // Фильтр должен изменить количество или оставить подмножество
  expect(countAfter).toBeLessThanOrEqual(countBefore);
});
```

**D) Негативный тест:**
```typescript
test('TC-XXX-NNN: Валидация пустой формы', async ({ page }) => {
  await page.getByRole('button', { name: new RegExp(t('btn.add'), 'i') }).click();
  const modal = page.locator('.modal__wrapper').first();

  // Попытка сохранить пустую форму
  await modal.getByRole('button', { name: new RegExp(t('btn.save'), 'i') }).click();

  // Должна появиться ошибка или кнопка disabled
  const hasError = await page.locator('[class*="error"], .validation-error').isVisible();
  const isModalStillOpen = await modal.isVisible();
  expect(hasError || isModalStillOpen).toBeTruthy();
});
```

**E) Тест итогов/суммы:**
```typescript
test('TC-XXX-NNN: Итоговая строка содержит корректную сумму', async ({ page }) => {
  const table = page.locator('table:visible').first();
  const totalRow = table.locator('tfoot tr, tr:last-child').last();
  const totalText = await totalRow.textContent();
  expect(totalText).toBeTruthy();
  // Проверяем что сумма — положительное число
  const numbers = totalText!.match(/[\d.,]+/g);
  expect(numbers).toBeTruthy();
  expect(parseFloat(numbers![0].replace(',', '.'))).toBeGreaterThan(0);
});
```

### Правила для тестов:

- ID теста из тест-кейса в названии: `TC-MODULE-NNN: Описание`
- Каждый тест — независимый (не зависит от порядка выполнения)
- `beforeEach` для общей подготовки, никогда `beforeAll` для UI-тестов
- Явные ожидания (`expect`) вместо `waitForTimeout`
- Один тест проверяет один сценарий
- Тестовые данные — в `tests/fixtures/test-data.ts`, не хардкод в тесте
- Используй `authHeaders` fixture для авторизации, не создавай токены вручную
- Для API-тестов всегда проверяй: happy path + 401 + 403 + 400
- **Все текстовые селекторы — через `t()` из `tests/i18n`**
- **Таблицы — ВСЕГДА `table:visible` (есть скрытые таблицы в DOM)**
- **Минимум 40% тестов должны быть deep (данные/workflow/фильтры)**

## Шаг 5: Валидация

### Если подключён Playwright MCP:

1. Открой целевую страницу в браузере через MCP
2. Сделай snapshot — проверь что селекторы из Page Object существуют
3. Запусти сгенерированный тест: `npx playwright test tests/e2e/[module].spec.ts`
4. Если тест падает — исправь и запусти повторно (до 3 попыток)

### Если MCP не подключён:

1. Запусти тест: `npx playwright test tests/[type]/[module].spec.ts --project=chromium`
2. При падении прочитай ошибку и исправь
3. Отметь в комментарии какие селекторы нужно проверить вручную

### Критерии готовности:

- Все тесты проходят (или чётко отмечены как требующие ручной проверки)
- Нет хардкода секретов в тестах
- Auth fixture используется для всех авторизованных запросов
- Тестовые данные вынесены в fixtures
- **Все текстовые селекторы используют `t()` из `tests/i18n`** — ноль хардкода RU/EN
- **Нет анти-паттернов**: `typeof x === 'number'`, `typeof x === 'boolean'`
- **Распределение глубины**: shallow ≤20%, medium 30-40%, deep ≥40%
- **Используй `workers: 2`** при запуске — сервер TTT не выдерживает больше

## Структура файлов

Размещай файлы строго по этой структуре:

```
tests/
├── pages/                    # Page Objects
│   ├── base.page.ts          # Абстрактный базовый PO (уже создан)
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── components/           # Переиспользуемые компоненты
│       ├── header.component.ts
│       └── modal.component.ts
├── fixtures/                 # Тестовые данные и хелперы
│   ├── auth.fixture.ts       # JWT авторизация
│   ├── env.config.ts         # Переменные окружения
│   ├── db.helper.ts          # Хелпер для БД
│   └── test-data.ts          # Константы тестовых данных
├── e2e/                      # UI-тесты
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
├── api/                      # API-тесты
│   ├── tasks.spec.ts
│   └── employees.spec.ts
└── db/                       # DB-верификация
    └── task-report.spec.ts
```
