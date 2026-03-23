# QA Report: Модуль VACATION (Отпуска)

**Дата**: 2026-03-22
**Модуль**: Отпуска, больничные, отгулы, график отсутствий
**Источники**: Кодовая база, БД, E2E тесты (394 теста)

---

## 1. Краткая сводка

| Источник | Статус | Детали |
|----------|--------|--------|
| Кодовая база | Проанализирован | 26 endpoints, 6 контроллеров, 6 подстраниц |
| E2E тесты | 394 теста | 7 spec-файлов |

---

## 2. Архитектура модуля

### Подстраницы
| Страница | Route | Тесты |
|----------|-------|-------|
| Мои отпуска | /vacation/my | 203 |
| График доступности | /vacation/chart | 10 |
| Заявки на отпуск (менеджер) | /vacation/request | 74 |
| Дни отпуска | /vacation/vacation-days | в составе deep |
| Оплата отпусков | /vacation/payment | в составе accounting |
| Корректировка дней | /vacation/days-correction | 26 |
| Больничные | /vacation/sick-leaves | 27 (в accounting) |
| Пересчёт календаря | — | 13 |
| Deep интеграция | — | 12 |

### Vacation States
NEW → PENDING → APPROVED / REJECTED / CANCELLED → PAID

### Permissions
| Permission | Операции | Роли |
|-----------|---------|------|
| VACATIONS_VIEW | Просмотр | Employee, Manager, Admin |
| VACATIONS_CREATE | Создание | Employee |
| VACATIONS_EDIT | Редактирование/отмена | Employee |
| VACATIONS_APPROVE | Утверждение/отклонение | Manager, Admin |
| VACATIONS_DELETE | Удаление | Admin |
| VACATIONS_PAY | Пометка "оплачено" | Accountant, Admin |

---

## 3. Оценка качества тестов

### Распределение: 394 теста

| Spec-файл | Тестов | Shallow | Medium | Deep |
|-----------|--------|---------|--------|------|
| vacation-employee.spec.ts | 203 | 45 (22%) | 88 (43%) | 70 (35%) |
| vacation-manager.spec.ts | 74 | 15 (20%) | 30 (41%) | 29 (39%) |
| vacation-requests.spec.ts | 30 | 5 (17%) | 12 (40%) | 13 (43%) |
| vacation.spec.ts | 36 | 12 (33%) | 16 (44%) | 8 (22%) |
| vacation-calendar-recalc.spec.ts | 13 | 3 (23%) | 5 (38%) | 5 (38%) |
| vacation-deep.spec.ts | 12 | 0 (0%) | 2 (17%) | 10 (83%) |
| accounting-vacation-correction.spec.ts | 26 | 6 (23%) | 10 (38%) | 10 (38%) |
| **ИТОГО** | **394** | **86 (22%)** | **163 (41%)** | **145 (37%)** |

### Метрика качества

```
Качество = (163 × 0.5 + 145 × 1.0) / 394 × 100%
         = (81.5 + 145) / 394 × 100%
         = 57%
```

**Рейтинг: B (50-69%) — хорошее покрытие**

### Сильные стороны
- **vacation-deep.spec.ts**: 83% deep — реальные workflow с данными
- **vacation-requests.spec.ts**: 43% deep — фильтрация, bulk, export
- Полное покрытие CRUD операций
- Approval/rejection workflow протестирован

### Слабые стороны
- vacation.spec.ts: 33% shallow — базовые UI тесты
- Нет тестов на concurrent approvals
- Нет тестов на email notifications

---

## 4. Перекрёстный анализ

| # | Серьёзность | Описание | Рекомендация |
|---|-------------|----------|-------------|
| 1 | **Major** | 0 тестов на role-based access (employee vs manager view) | Логин под employee → нет кнопки approve |
| 2 | **Major** | 0 тестов на VACATIONS_PAY permission | Логин accountant → пометить "оплачено" |
| 3 | **Medium** | Нет тестов на concurrent approval race condition | Два менеджера → одновременное утверждение |
| 4 | **Medium** | Нет тестов на leap year/timezone edge cases | 29 февраля, переход через часовые пояса |
| 5 | **Medium** | Нет тестов на email notifications при approve/reject | Проверить отправку уведомлений |
| 6 | **Minor** | File upload — нет тестов на большие файлы и форматы | Загрузить 10MB PDF, невалидный формат |

---

## 5. Сгенерированные тест-кейсы

### P0

| ID | Тест-кейс | Глубина |
|----|-----------|---------|
| TC-VAC-100 | Full vacation lifecycle: create → approve → pay → verify days balance | Deep |
| TC-VAC-101 | Reject workflow: create → reject with comment → employee sees comment → resubmit | Deep |
| TC-VAC-102 | Employee role — no approve button visible | Deep |

### P1

| ID | Тест-кейс | Глубина |
|----|-----------|---------|
| TC-VAC-110 | Accountant marks vacation as paid | Deep |
| TC-VAC-111 | Sick leave CRUD with date validation | Deep |
| TC-VAC-112 | Day-off transfer workflow | Deep |
| TC-VAC-113 | Availability chart — correct color coding | Deep |

---

## 6. Рекомендации

### Приоритет 1
1. Добавить role-based тесты (employee vs manager vs accountant)
2. Добавить payment workflow тест

### Приоритет 2
3. Добавить concurrent approval тесты
4. Расширить calendar recalc тесты

### Статистика
- **Текущее покрытие**: 57% (рейтинг B)
- **Целевое покрытие**: ≥ 65%

---

**Следующий шаг**: Запустить `/generate-tests vacation` для P0/P1.
