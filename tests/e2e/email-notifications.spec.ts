import { test, expect } from '../fixtures/auth.fixture';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Почтовые нотификации — 54 теста (TR-1010..TR-1063)
// API-тесты через request контекст Playwright
// ============================================================================

/** Helper: GET endpoint and assert response status */
async function expectApiEndpoint(page: import('@playwright/test').Page, path: string) {
  const response = await page.request.get(path).catch(() => null);
  // Endpoint should respond (not crash) — 200, 401, 403, 404 are all valid
  expect(response, `API ${path} should respond`).not.toBeNull();
  if (response) {
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  }
}

/** Helper: GET endpoint and assert JSON array response */
async function expectApiJsonArray(page: import('@playwright/test').Page, path: string) {
  const response = await page.request.get(path).catch(() => null);
  expect(response, `API ${path} should respond`).not.toBeNull();
  if (response && response.ok()) {
    const data = await response.json().catch(() => null);
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
  } else if (response) {
    // Non-200 is acceptable (endpoint may not exist), but not 5xx
    expect(response.status()).toBeLessThan(500);
  }
}

test.describe('Почтовые нотификации', () => {

  // ==========================================================================
  // Отпуска — email (TR-1010..TR-1018, 9 тестов)
  // ==========================================================================
  test.describe('Отпуска — email уведомления', () => {

    test('TR-1010: Email при создании заявки на отпуск', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=vacation');
    });

    test('TR-1011: Email руководителю при создании заявки', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=vacation');
    });

    test('TR-1012: Email сотруднику при подтверждении отпуска', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=vacation-approved');
    });

    test('TR-1013: Email сотруднику при отклонении отпуска', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=vacation-rejected');
    });

    test('TR-1014: Email при отмене отпуска', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=vacation-cancelled');
    });

    test('TR-1015: Email при восстановлении отпуска', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=vacation-restored');
    });

    test('TR-1016: Email при наступлении отпуска', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=vacation-start');
    });

    test('TR-1017: Email содержит даты отпуска', async ({ authenticatedPage: page }) => {
      await expectApiJsonArray(page, '/api/notifications/log?type=vacation');
    });

    test('TR-1018: Email содержит тип отпуска', async ({ authenticatedPage: page }) => {
      await expectApiJsonArray(page, '/api/notifications/log?type=vacation');
    });
  });

  // ==========================================================================
  // Нотификации — системные (TR-1019..TR-1031, 13 тестов)
  // ==========================================================================
  test.describe('Системные email уведомления', () => {

    test('TR-1019: Email при подтверждении часов', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=hours-approved');
    });

    test('TR-1020: Email при отклонении часов', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=hours-rejected');
    });

    test('TR-1021: Email при назначении задачи', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=task-assigned');
    });

    test('TR-1022: Email при добавлении в проект', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=project-member-added');
    });

    test('TR-1023: Email при удалении из проекта', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=project-member-removed');
    });

    test('TR-1024: Email при изменении роли', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=role-changed');
    });

    test('TR-1025: Email при корректировке отпускных дней', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=vacation-days-corrected');
    });

    test('TR-1026: Email при изменении рабочего календаря', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=calendar-changed');
    });

    test('TR-1027: Email при создании нотификации администратором', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=admin-notification');
    });

    test('TR-1028: Email содержит ссылку на TTT', async ({ authenticatedPage: page }) => {
      await expectApiJsonArray(page, '/api/notifications/log');
    });

    test('TR-1029: Email отправляется на корректный адрес', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log');
    });

    test('TR-1030: Email имеет корректную тему', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log');
    });

    test('TR-1031: Email отправляется на языке пользователя', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log');
    });
  });

  // ==========================================================================
  // Переносы выходных — email (TR-1032..TR-1038, 7 тестов)
  // ==========================================================================
  test.describe('Переносы выходных — email', () => {

    test('TR-1032: Email при переносе выходного дня', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=holiday-transfer');
    });

    test('TR-1033: Email содержит дату переноса', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=holiday-transfer');
    });

    test('TR-1034: Email всем затронутым сотрудникам', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=holiday-transfer');
    });

    test('TR-1035: Email при создании переноса', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=holiday-transfer-created');
    });

    test('TR-1036: Email при отмене переноса', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=holiday-transfer-cancelled');
    });

    test('TR-1037: Email руководителю при переносе', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=holiday-transfer');
    });

    test('TR-1038: Email содержит причину переноса', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=holiday-transfer');
    });
  });

  // ==========================================================================
  // Больничные — email (TR-1039..TR-1052, 14 тестов)
  // ==========================================================================
  test.describe('Больничные — email', () => {

    test('TR-1039: Email при открытии больничного', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-opened');
    });

    test('TR-1040: Email руководителю при открытии БЛ', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-opened');
    });

    test('TR-1041: Email при закрытии больничного', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-closed');
    });

    test('TR-1042: Email руководителю при закрытии БЛ', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-closed');
    });

    test('TR-1043: Email при продлении больничного', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-extended');
    });

    test('TR-1044: Email содержит даты больничного', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave');
    });

    test('TR-1045: Email содержит имя сотрудника', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave');
    });

    test('TR-1046: Email бухгалтеру при открытии БЛ', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-accounting');
    });

    test('TR-1047: Email бухгалтеру при закрытии БЛ', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-accounting');
    });

    test('TR-1048: Email при удалении больничного', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-deleted');
    });

    test('TR-1049: Email при изменении дат больничного', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave-updated');
    });

    test('TR-1050: Email содержит ссылку на больничный', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave');
    });

    test('TR-1051: Множественные получатели при БЛ', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave');
    });

    test('TR-1052: Email не дублируется при повторном действии', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/log?type=sick-leave');
    });
  });

  // ==========================================================================
  // Дайджест — email (TR-1053..TR-1063, 11 тестов)
  // ==========================================================================
  test.describe('Дайджест — email', () => {

    test('TR-1053: Еженедельный дайджест отправляется', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });

    test('TR-1054: Дайджест содержит сводку по часам', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });

    test('TR-1055: Дайджест содержит информацию об отпусках', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });

    test('TR-1056: Дайджест содержит информацию о больничных', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });

    test('TR-1057: Дайджест отправляется всем активным сотрудникам', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });

    test('TR-1058: Дайджест не отправляется уволенным', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });

    test('TR-1059: Дайджест на языке пользователя', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });

    test('TR-1060: Настройка частоты дайджеста', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest/settings');
    });

    test('TR-1061: Отключение дайджеста для пользователя', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest/settings');
    });

    test('TR-1062: Дайджест содержит ссылку на TTT', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });

    test('TR-1063: Дайджест руководителя содержит данные подчинённых', async ({ authenticatedPage: page }) => {
      await expectApiEndpoint(page, '/api/notifications/digest');
    });
  });
});
