# QA Report: Модуль STATISTICS (Статистика)

**Дата**: 2026-03-22
**Модуль**: Статистика по сотрудникам, проектам, задачам
**Источники**: Кодовая база, E2E тесты (10 тестов)

---

## 1. Краткая сводка

| Источник | Статус | Детали |
|----------|--------|--------|
| Кодовая база | Проанализирован | StatisticReportController, 4 подстраницы |
| E2E тесты | **10 тестов** | 1 spec-файл — КРИТИЧЕСКИ МАЛО |

---

## 2. Архитектура

### Подстраницы
- Общая статистика (departments, employees, projects, tasks tabs)
- Репорты сотрудников

### Доступ
Расширенный доступ: ROLE_ADMIN, ROLE_CHIEF_ACCOUNTANT, ROLE_OFFICE_DIRECTOR, ROLE_OFFICE_HR, ROLE_DEPARTMENT_MANAGER, ROLE_TECH_LEAD

---

## 3. Оценка качества

### Распределение: 10 тестов

| Группа | Тестов | Shallow | Medium | Deep |
|--------|--------|---------|--------|------|
| Общая статистика | 5 | 3 | 2 | 0 |
| Репорты сотрудников | 5 | 3 | 2 | 0 |
| **ИТОГО** | **10** | **6 (60%)** | **4 (40%)** | **0 (0%)** |

### Метрика качества

```
Качество = (4 × 0.5 + 0 × 1.0) / 10 × 100% = 20%
```

**Рейтинг: D (< 30%) — критически низкое качество**

---

## 4. Перекрёстный анализ

| # | Серьёзность | Описание |
|---|-------------|----------|
| 1 | **Critical** | 0 deep тестов — нет проверки данных, расчётов, фильтрации |
| 2 | **Critical** | 0 тестов на export (Excel/CSV) |
| 3 | **Critical** | 0 тестов на фильтрацию по department/period/contractor |
| 4 | **Major** | 0 тестов на role-based access |
| 5 | **Major** | 0 тестов на корректность расчётов в таблицах |
| 6 | **Medium** | Нет тестов на переключение табов (departments, employees, projects, tasks) |

---

## 5. Сгенерированные тест-кейсы

### P0

| ID | Тест-кейс | Глубина |
|----|-----------|---------|
| TC-STAT-001 | Tab switching — all 4 tabs display correct content | Deep |
| TC-STAT-002 | Filter by department + period → verify table data | Deep |
| TC-STAT-003 | Export to Excel — file downloads, not empty | Deep |
| TC-STAT-004 | Employee detail — click row → detailed report | Deep |

### P1

| ID | Тест-кейс | Глубина |
|----|-----------|---------|
| TC-STAT-010 | Role-based: Employee → limited stats, Admin → full | Deep |
| TC-STAT-011 | Contractor filter toggle | Medium |
| TC-STAT-012 | Period range → table recalculates | Deep |
| TC-STAT-013 | Sort by columns (name, hours, projects) | Medium |

---

## 6. Рекомендации

### Приоритет 1 — КРИТИЧНО
1. **Увеличить тесты с 10 до 30+** — нужны deep тесты
2. Добавить tab switching тесты
3. Добавить filter + data verification тесты
4. Добавить export тесты

### Статистика
- **Текущее покрытие**: 20% (рейтинг D)
- **Целевое**: ≥ 50%
- **Для достижения**: +20 deep тестов
