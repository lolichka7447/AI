# QA Report: Модуль ACCOUNTING (Бухгалтерия)

**Дата**: 2026-03-22
**Модуль**: Оплата отпусков, зарплата, периоды, больничные, корректировка дней
**Источники**: Кодовая база, E2E тесты (131 тест)

---

## 1. Краткая сводка

| Источник | Статус | Детали |
|----------|--------|--------|
| Кодовая база | Проанализирован | 5 подразделов бухгалтерии |
| E2E тесты | 131 тест | 5 spec-файлов |

---

## 2. Подразделы

| Подраздел | Route | Тестов | Spec-файл |
|-----------|-------|--------|-----------|
| Оплата отпусков | /accounting/payment | 46 | accounting-payment.spec.ts |
| Зарплата | /admin/salary | 18 | accounting-salary.spec.ts |
| Периоды | /accounting/periods | 14 | accounting-periods.spec.ts |
| Больничные | /accounting/sick-leaves | 27 | accounting-sick-leaves.spec.ts |
| Корректировка дней | /vacation/days-correction | 26 | accounting-vacation-correction.spec.ts |

---

## 3. Оценка качества тестов

### Распределение: 131 тест

| Spec-файл | Тестов | Shallow | Medium | Deep |
|-----------|--------|---------|--------|------|
| accounting-payment.spec.ts | 46 | 10 (22%) | 20 (43%) | 16 (35%) |
| accounting-salary.spec.ts | 18 | 5 (28%) | 8 (44%) | 5 (28%) |
| accounting-periods.spec.ts | 14 | 3 (21%) | 6 (43%) | 5 (36%) |
| accounting-sick-leaves.spec.ts | 27 | 6 (22%) | 12 (44%) | 9 (33%) |
| accounting-vacation-correction.spec.ts | 26 | 6 (23%) | 10 (38%) | 10 (38%) |
| **ИТОГО** | **131** | **30 (23%)** | **56 (43%)** | **45 (34%)** |

### Метрика качества

```
Качество = (56 × 0.5 + 45 × 1.0) / 131 × 100%
         = (28 + 45) / 131 × 100%
         = 56%
```

**Рейтинг: B (50-69%) — хорошее покрытие**

---

## 4. Перекрёстный анализ

| # | Серьёзность | Описание |
|---|-------------|----------|
| 1 | **Major** | Нет тестов на role-based access (accountant vs employee) |
| 2 | **Major** | Нет тестов на period close → auto-reject effect |
| 3 | **Medium** | Нет тестов на export (Excel/CSV) |
| 4 | **Medium** | Salary — нет тестов на расчёт сумм |
| 5 | **Minor** | Нет тестов на bulk payment operations |

---

## 5. Рекомендации

### Приоритет 1
1. Добавить role-based тесты (accountant workflow)
2. Добавить period close → auto-reject integration

### Статистика
- **Текущее покрытие**: 56% (рейтинг B)
- **Целевое**: ≥ 65%
