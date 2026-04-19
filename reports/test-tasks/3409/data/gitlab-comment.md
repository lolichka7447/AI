**QA: BLOCKED** :construction:

**Tested on:** ttt-qa-2 | Date: 2026-04-15
**Tested by:** QA Agent (Claude Code)
**Build:** 2.1.26-SNAPSHOT.LOCAL | 22.03.2026

**Причина блокировки:** MR !5381 (Feature/#3408) ещё **не замержен** в release/2.1 → функциональность не задеплоена на QA.

<details>
<summary>Предварительная проверка (3/3 AC — не готовы к тесту)</summary>

| # | AC | Статус | Наблюдение |
|---|----|---------|-----------|
| 1 | budgetNorm расчёт обновлён | BLOCKED | MR не задеплоен |
| 2 | budgetNorm передаётся по API | BLOCKED | MR не задеплоен |
| 3 | Тултип Норма обновлён (RU/EN) | BLOCKED | Текущий тултип **не содержит** упоминания `больничных по уходу за членом семьи` / `caring for a family member sick leaves` |

</details>

<details>
<summary>Автотесты статистики (19 passed, 10 failed)</summary>

| Spec File | Tests | Passed | Failed | Time |
|-----------|-------|--------|--------|------|
| statistics-subpages.spec.ts | 10 | 10 | 0 | 97s |
| statistics.spec.ts | 10 | 4 | 6 | 146s |
| statistics-deep.spec.ts | 9 | 5 | 4 | 88s |

10 падений связаны с некорректными селекторами табов (не связано с #3409).

</details>

**Рекомендации:**
1. Замержить MR !5381 → задеплоить на QA
2. Уведомить QA о готовности к тестированию
3. После деплоя — перетестировать все 3 AC
