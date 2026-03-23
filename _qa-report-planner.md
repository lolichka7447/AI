# QA Report: Модуль PLANNER (Планировщик)

**Дата**: 2026-03-22
**Модуль**: Планирование задач и назначений
**Источники**: Кодовая база, E2E тесты (99 тестов)

---

## 1. Краткая сводка

| Источник | Статус | Детали |
|----------|--------|--------|
| Кодовая база | Проанализирован | 41 endpoint, 10+ контроллеров |
| E2E тесты | 99 тестов | 3 spec-файла |

---

## 2. Архитектура модуля

### Контроллеры
- TaskController (7 endpoints): CRUD задач
- TaskAssignmentController (5 endpoints): назначения
- TaskPinController (4): закрепление задач
- TaskTemplateController (4): шаблоны задач
- LockController (3): блокировка
- + 5 вспомогательных

### Ключевые endpoints
| Endpoint | Метод | Описание |
|----------|-------|----------|
| /v1/tasks | POST | Создание задачи |
| /v1/tasks | GET | Поиск задач |
| /v1/tasks/refresh | POST | Sync с трекером |
| /v1/assignments | GET | Список назначений |
| /v1/assignments/generate | POST | Генерация назначений |
| /v1/assignments/{id} | PATCH | Обновление назначения |

---

## 3. Оценка качества тестов

### Распределение: 99 тестов

| Spec-файл | Тестов | Shallow | Medium | Deep |
|-----------|--------|---------|--------|------|
| planner-tasks.spec.ts | 40 | 8 (20%) | 18 (45%) | 14 (35%) |
| planner-projects.spec.ts | 55 | 12 (22%) | 23 (42%) | 20 (36%) |
| planner-tickets.spec.ts | 4 | 2 (50%) | 2 (50%) | 0 (0%) |
| **ИТОГО** | **99** | **22 (22%)** | **43 (43%)** | **34 (34%)** |

### Метрика качества

```
Качество = (43 × 0.5 + 34 × 1.0) / 99 × 100%
         = (21.5 + 34) / 99 × 100%
         = 56%
```

**Рейтинг: B (50-69%) — хорошее покрытие**

---

## 4. Перекрёстный анализ

| # | Серьёзность | Описание |
|---|-------------|----------|
| 1 | **Critical** | Task Templates (4 endpoints) — 0 тестов |
| 2 | **Critical** | Lock API (3 endpoints, 423 ответ) — 0 тестов concurrent access |
| 3 | **Major** | Tracker sync — только 4 теста (visibility), нет тестов real sync |
| 4 | **Major** | Assignment generation — success/failure flow не полностью тестирован |
| 5 | **Medium** | Task rename (PATCH /v1/tasks) — не протестирован в planner |
| 6 | **Medium** | History/audit — endpoint есть, тестов нет |
| 7 | **Minor** | Pagination, large datasets (100+ задач) — нет тестов |

---

## 5. Сгенерированные тест-кейсы

### P0

| ID | Тест-кейс | Глубина |
|----|-----------|---------|
| TC-PLN-050 | Task CRUD: create → assign → edit hours → delete | Deep |
| TC-PLN-051 | Assignment generation: trigger → verify → edit | Deep |
| TC-PLN-052 | Concurrent lock: user A edits → user B gets 423 | Deep |

### P1

| ID | Тест-кейс | Глубина |
|----|-----------|---------|
| TC-PLN-060 | Task template: create → use → verify | Deep |
| TC-PLN-061 | Tracker sync: configure → sync → verify tasks | Deep |
| TC-PLN-062 | Assignment history: create → edit → check log | Deep |

---

## 6. Рекомендации

### Приоритет 1
1. Добавить Task Template тесты (0 покрытие)
2. Добавить Lock/concurrent access тесты
3. Расширить tracker sync до реальных проверок

### Статистика
- **Текущее покрытие**: 56% (рейтинг B)
- **Целевое**: ≥ 65%
