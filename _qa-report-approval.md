# QA Report: Модуль APPROVAL (Подтверждение)

**Дата**: 2026-03-22
**Модуль**: Подтверждение отчётов (по сотрудникам и проектам)
**Источники**: Кодовая база, E2E тесты (156 тестов)

---

## 1. Краткая сводка

| Источник | Статус | Детали |
|----------|--------|--------|
| Кодовая база | Проанализирован | PATCH /v1/reports, bulk approve/reject |
| E2E тесты | 156 тестов | 2 spec-файла |

---

## 2. Архитектура модуля

### Approval States
WAITING_APPROVAL → APPROVED / REJECTED / NOTHING_APPROVE

### Два представления
1. **По сотрудникам** — 88 тестов (TR-462..TR-549)
2. **По проектам** — 68 тестов (TR-550..TR-617)

### Ключевые endpoints
- `PATCH /v1/reports/{id}` — single approval/rejection
- `PATCH /v1/reports` — batch approval/rejection
- `GET /v1/reports` — search with approval status filter

---

## 3. Оценка качества тестов

### Распределение: 156 тестов

| Spec-файл | Тестов | Shallow | Medium | Deep |
|-----------|--------|---------|--------|------|
| approval-by-employee.spec.ts | 88 | 18 (20%) | 38 (43%) | 32 (36%) |
| approval-by-project.spec.ts | 68 | 14 (21%) | 28 (41%) | 26 (38%) |
| **ИТОГО** | **156** | **32 (21%)** | **66 (42%)** | **58 (37%)** |

### Метрика качества

```
Качество = (66 × 0.5 + 58 × 1.0) / 156 × 100%
         = (33 + 58) / 156 × 100%
         = 58%
```

**Рейтинг: B (50-69%) — хорошее покрытие**

### Покрытые области (90%+)
- Tab switching, dropdown filtering, multi-filter combinations
- Approval/Rejection workflows, comment CRUD
- Color coding (12+ индикаторов), week navigation, batch operations

### Непокрытые области (<50%)
- Permission-based visibility (тесты только под manager)
- Concurrent approvals
- Auto-rejection triggers
- Excel export
- Notification badge accuracy

---

## 4. Перекрёстный анализ

| # | Серьёзность | Описание |
|---|-------------|----------|
| 1 | **Major** | Нет тестов permission denial — employee не видит approve кнопки |
| 2 | **Major** | Нет тестов auto-reject при закрытии периода |
| 3 | **Medium** | Loose assertions: `toBeTruthy()`, `toBeGreaterThanOrEqual(0)` |
| 4 | **Medium** | Нет проверки persistence после approve (refresh → статус сохранён) |
| 5 | **Minor** | Нет тестов concurrent approvals (2 менеджера одновременно) |

---

## 5. Сгенерированные тест-кейсы

### P0

| ID | Тест-кейс | Глубина |
|----|-----------|---------|
| TC-APR-050 | Employee role — approve buttons hidden | Deep |
| TC-APR-051 | Approve → refresh → status persisted | Deep |
| TC-APR-052 | Batch reject with comment → all change to REJECTED | Deep |

### P1

| ID | Тест-кейс | Глубина |
|----|-----------|---------|
| TC-APR-060 | Auto-reject on period close | Deep |
| TC-APR-061 | Notification count matches pending approvals | Deep |

---

## 6. Рекомендации

### Приоритет 1
1. Добавить permission-based тесты
2. Добавить persistence verification (approve → refresh → check)

### Статистика
- **Текущее покрытие**: 58% (рейтинг B)
- **Целевое**: ≥ 65%
