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
тестовую документацию в работающие Playwright-тесты, следуя лучшим
практикам и паттерну Page Object Model.

## Шаг 1: Получение тестовой документации

Определи источник тест-кейсов (в порядке приоритета):

1. **Пользователь передал файл или текст** — используй напрямую
2. **Confluence MCP подключён** — найди тест-кейсы для указанного модуля
3. **Тест-кейсов нет** — предложи сначала запустить скилл `qa-expert-system`

Для каждого тест-кейса определи тип:

- **UI-тест**: взаимодействие с элементами страницы
- **API-тест**: прямые HTTP-запросы к эндпоинтам
- **DB-тест**: проверка данных в базе после действий

## Шаг 2: Генерация Page Object (для UI-тестов)

Перед написанием тестов создай Page Object для каждой страницы:

```typescript
// pages/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Приоритет селекторов: data-testid > role > text > css
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByRole('button', { name: 'Войти' });
    this.errorMessage = page.getByTestId('error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### Правила для Page Object:

- Один файл на одну страницу/компонент
- Все селекторы — в конструкторе
- Приоритет селекторов: `data-testid` > `getByRole` > `getByText` > CSS
- Методы возвращают `Promise<void>` или данные, никогда не делают assertions
- Если подключён Playwright MCP — используй его для проверки реальных селекторов

## Шаг 3: Генерация тестов

Шаблон теста:

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Авторизация', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-AUTH-001: Успешный вход с валидными данными', async ({ page }) => {
    await loginPage.login('user@example.com', 'ValidPass123');
    await expect(page).toHaveURL('/dashboard');
  });

  test('TC-AUTH-002: Ошибка при неверном пароле', async ({ page }) => {
    await loginPage.login('user@example.com', 'WrongPass');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Неверный пароль');
  });

  test('TC-AUTH-003: Валидация пустого email', async ({ page }) => {
    await loginPage.login('', 'ValidPass123');
    await expect(loginPage.emailInput).toHaveAttribute('aria-invalid', 'true');
  });
});
```

### Правила для тестов:

- ID теста из тест-кейса в названии: `TC-MODULE-NNN: Описание`
- Каждый тест — независимый (не зависит от порядка выполнения)
- `beforeEach` для общей подготовки, никогда `beforeAll` для UI-тестов
- Явные ожидания (`expect`) вместо `waitForTimeout`
- Один тест проверяет один сценарий
- Тестовые данные — в константах или фикстурах, не хардкод в тесте

### Для API-тестов:

```typescript
// tests/api/users.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API: Пользователи', () => {
  test('TC-API-001: Получение профиля авторизованного пользователя', async ({ request }) => {
    const response = await request.get('/api/v1/users/me', {
      headers: { Authorization: 'Bearer ${TOKEN}' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('id');
  });

  test('TC-API-002: 401 без авторизации', async ({ request }) => {
    const response = await request.get('/api/v1/users/me');
    expect(response.status()).toBe(401);
  });
});
```

## Шаг 4: Валидация

Если подключён Playwright MCP:

1. Открой целевую страницу в браузере
2. Проверь что селекторы из Page Object реально существуют
3. Запусти сгенерированный тест
4. Если тест падает — исправь селекторы или логику и запусти повторно

Если Playwright MCP не подключён:

1. Выведи сгенерированные файлы
2. Отметь какие селекторы нужно проверить вручную
3. Предложи команду для запуска: `npx playwright test tests/module.spec.ts`

## Структура файлов

Размещай файлы по следующей структуре:

```
tests/
├── pages/                    # Page Objects
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── components/           # Переиспользуемые компоненты
│       ├── header.component.ts
│       └── modal.component.ts
├── fixtures/                 # Тестовые данные и хелперы
│   ├── test-data.ts
│   └── auth.fixture.ts
├── e2e/                      # UI-тесты
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
└── api/                      # API-тесты
    ├── users.spec.ts
    └── orders.spec.ts
```
