# TTT Sprint Tickets (13-15)

Source: [Google Spreadsheet](https://docs.google.com/spreadsheets/d/15g1NrKHk2R1To3FFps69DGRPjhwKtxhxa9cFCnGSD8U/edit?gid=807595221)

## Sprint 13

| Ticket | Description |
|--------|-------------|
| #2435 | [Больничные] Отображать информацию о больничных в Статистике |
| #2604 | [Локализация] Для новых сотрудников язык по умолчанию брать из CS |
| #2978 | [Мои задачи] [Планировщик] Уведомление о предстоящем отсутствии за неделю |
| #3074 | Migrate modules/vacation/ducks/tables/myVacations to TS |
| #3128 | [Frontend] Переписать vacationValidationForm на yup + .ts + тесты |
| #3178 | [Vacations:Backend] Кэш репортов сотрудников по проектам в Vacations |
| #3188 | [Vacations] Административные заявки PAID → статус "Завершена" |
| #3189 | [Days off] [РЦ] [Мои задачи] Корректно указывать общую норму за месяц |
| #3190 | [Vacations] [График доступности] Показывать все события непрерывного отсутствия |
| #3193 | [Vacations] [Больничные] [Декрет] Проверить совместимость больничного и декрета |
| #3195 | [Статистика] Страница "Репорты сотрудников" с % перерепортов и недорепортов |
| #3196 | [Bug] [API] [Vacations] Исключить из reservedDays дни неподтвержденных админ.заявок |
| #3197 | [Bug] [Vacations] [Digest] Check sending and receiving of the Digest |
| #3208 | [DevOps] Add preprod env to stage pipeline |
| #3211 | [График доступности] [Backend] Оптимизации формирования Графика доступности |
| #3218 | DB Migration with ignore creating indexes and foreign keys |
| #3227 | [Vacations] [График доступности] Неконсистентная верстка |
| #3232 | [Bug] [Calendar] Нет сообщения валидации при дублировании события календаря |
| #3239 | [Autotests] Автотесты производственных календарей > Календари для РЦ |
| #3240 | [Bug] [Vacations] Incorrect handling of overlapping vacations |
| #3241 | [Bug] [Integration] No record in ttt_backend for new salary office from CS |
| #3245 | [Autotests] Автотесты страницы Мои задачи - Part I |
| #3246 | [Autotests] Автотесты страницы Мои задачи - Part II |
| #3247 | HR managers review statistics of their employees |
| #3248 | Availability chart: copy absence |
| #3249 | Availability chart: multiselect values |
| #3250 | [Vacations] [График доступности] Проверить переводы |
| #3251 | [Bug] [UI] [Vacations] Верстка попапа Создания-Редактирования заявки на отпуск |
| #3252 | [Email-нотификации] Stop sending duplicate email notifications |
| #3257 | [Bug] [Sick leave] Not displayed in table and "My Sick Leaves" page |
| #3260 | [Autotests] Бухгалтерия: Периоды репорта и подтверждения - Расчетные центры |
| #3262 | [TTT Vacation] Improvement for Employee Project synchronization |
| #3263 | [Bug] 404 page on QA-1 environment |
| #3268 | [Bug] [My Tasks] Не показывается плашка об отклоненных часах |
| #3271 | [Emails] Consider 8h & 7h days in Production calendar for notifications |
| #3272 | [Bug] [Planner] Неполный список задач проекта при открытии на редактирование |
| #3275 | [Bug] [Planner] Не добавляется задача из трекера в Проектном Планировщике |
| #3278 | [Bug] [Переименование] Ошибка 400 при редактировании имени задачи |
| #3280 | [Bug] Не сохраняется выбор языковой версии при релогине |
| #3285 | [Bug] [Confirmation] Spontaneous rejection of reports when closing report period |
| #3292 | [Bug] [Availability chart] Production calendar events not displayed before 2024 |
| #3300 | [Bug] [Days off] Production calendar change in SO from next year applied immediately |

## Sprint 14

| Ticket | Description |
|--------|-------------|
| #3367 | [Bug] [Confirmation] Unable to confirm/edit autorejected reports after period reopening |
| #3358 | [Vacations] [Days off] Check days for users changing SO since 2026 |
| #3357 | [Bug] [Vacation] EV=False. Incorrect current balance days for next year vacation |
| #3355 | [Bug] [Vacation] System incorrectly adds balance days to user on maternity leave |
| #3350 | [Accounting] [Changing periods] Do not backdate approval period >1 month |
| #3344 | [Bug] [Vacations] Vacation events feed: Russian messages in English version |
| #3339 | [Bug] [Vacation] AV=False. Available/balance days recalculation incorrect on day-off delete/transfer |
| #3338 | [Bug] [Vacation] AV=False. Incorrect conversion of several vacations after calendar change |
| #3334 | [Bug] [Confirmation] [Planner] Incorrect hours/confirmation when manager confirms employee hours |
| #3333 | [Grafana] Fix broken metrics |
| #3327 | [Optimization] Reduce TTT service calls for vacation reminder notification |
| #3324 | [Bug] [My task] Calendar doesn't show finished administrative vacations |
| #3321 | [Bug] [Notification] No notification for rejected hours when report month closed but confirmation open |
| #3320 | [Bug] [Statistics] Employee reports includes future employees with false underreports |
| #3318 | [Statistics] [General statistics] Update chevrons |
| #3313 | [Bug] [Availability chart] Calendar displays event timestamps |
| #3310 | [Bug] [Vacations] Incorrect admin vacation assignment when changing payment month |
| #3309 | [Statistics] [Employee reports] Add fields DM and Comment |
| #3308 | [Bug] [Planner] Manual drag-and-drop order resets the next day |
| #3305 | [Bug] [Notifications] 500 Error when submitting 'Create notification' form |
| #3301 | [Vacations] [Days off] [Calendar] [AV=false] Update vacation days balance validation logic |
| #3283 | [Vacations] [Accounting] [Correction] New logic for correction depending on CS setting |
| #3282 | [Bug] [Days off] Twice transferred day-off not removed after production calendar deletion |
| #3281 | [Emails] [Bug] Check that email ID_85 reaches the receiver |
| #3269 | [Мои задачи] [Планировщик] Уведомление сотруднику о перерепорте |
| #3266 | [Critical] Планировщик не подтверждает часы |
| #3258 | [UX] [Планировщик] Скопировать поведение при добавлении новой задачи из Моих задач |
| #3244 | [Bug] [Cats] Иконка "Котики" не отображается на тестовых окружениях |
| #3207 | [Bug] [Планировщик] В попапе "История изменений" съехала таблица |
| #3204 | [Bug] [Vacations] Incorrect vacation days calculation per year (correction due to undertime) |
| #3194 | [Статистика] Добавить информацию об отпусках и больничных в группировку по сотруднику |
| #3092 | [Vacations] [Интеграция] [CS] [РЦ] Возможность взять отпускные авансом по настройке CS |
| #3056 | [Tech] Перевести Redux в модуле budgetNotifications на ts |
| #3055 | [Tech] Перевести Redux в модуле approve на ts |
| #2995 | [UI] Во всем интерфейсе при отображении диапазона дат использовать N-dash |
| #2932 | [Подтверждение] [Админка] Нотификация о перерепорте/недорепорте при подтверждении |
| #2736 | [Производственный календарь] [Days off] Формулировки для Ленты отпускных событий |

## Sprint 15

| Ticket | Description |
|--------|-------------|
| #3299 | [Autotests] Генерация тестовых данных майнингом БД |
| #3276 | [Autotests] Переход на TypeScript и Playwright |
| #3397 | [Admin] [Projects] Error 500 on attempt to create project |
| #3104 | [Vacations] [Лента] Расхождение в ленте отпускных событий у сотрудников |
| #3416 | Синхронизация с ПМ тул не возможна из-за ошибки аутентификации |
| #3412 | PM tool: Изменить параметры запроса |
| #3407 | [Bug] [Confirmation] Page fails to load with "No panic!" error |
| #3404 | [Days off] Allow moving days off to earlier dates within open month |
| #3401 | [Админка] [Проекты] Create Ratelimit for PM tool client |
| #3400 | [Статистика] Выгрузить норму по индивидуальному календарю |
| #3399 | [Админка] [Проекты] Ratelimit на стороне PM tool |
| #3396 | [CI/CD] Docker tagging strategy for rollback deployment |
| #3389 | [Админка] [Проекты] Skip an employee with the sales type |
| #3387 | [Админка] [Проекты] Add PM Tool internal project ID (pmtId) to integration response |
| #3386 | [Bug] [Planner] Deleted tasks remain when using "Copy the table" function |
| #3384 | [Админка] [Проекты] Unable to locate employee by provided ID in database |
| #3383 | [Админка] [Проекты] PM Tool API error with id parameter despite documentation |
| #3382 | [Админка] [Проекты] Change PM tool integration API |
| #3380 | [Bug] [My tasks] Vacations don't affect employee personal monthly norm |
| #3375 | [UX] [Planner] [Projects] Update members order in project planner |
| #3374 | [Bug] [Vacation] Last_date field not updated during CS sync |
| #3371 | Setup CI/CD support for release preparation |
| #3369 | [Bug] [Vacation] Backend allows creating vacations in past without deducting from balance |
| #3368 | [Bug] [Confirmation] No over/under report notification on "By Employee" tab |
| #3365 | [Bug] [Accounting] [Changing periods] Месяц предшествующий подтверждению не задизейблен |
| #3364 | [Bug] [Notifications] Frontend validation missing for mandatory "Employee" field |
| #3361 | [Bug] [Vacations] AV=True. Incorrect multi-year balance distribution |
| #3353 | [My tasks] [User reports] [Individual norm] Exclude periods before/after working dates |
| #3352 | [Bug] [Vacation] Incorrect available days recalculation after adding maternity leave |
| #3347 | [Vacations] [CS] [SO] [AV=true] Corner cases for next year vacation consuming current year days |
| #3346 | [Optimization] Execute Statistic Report initial sync only once via java_migration |
| #3345 | [Optimization] Implement sync to populate ttt_backend.statistic_report |
| #3341 | [Bug] [Trackers] Не добавляются задачи одного из спейсов в ClickUp |
| #3337 | [Optimization] Performance enhancement for Statistic Employee Report page |
| #3332 | [Bug] [Planner] Tasks duplicated after reordering |
| #3303 | Sync Procedure On Application StartUp |
| #3205 | [Bug] [Days off] Не обновляется подтверждающий менеджер после перенаправления заявки |
| #3150 | [Bug] Ошибка и бесконечный спиннер на странице репорта подрядчика |
| #3083 | [Админка] [Проекты] Изменения в связи с переносом функционала в PM Tool |
| #2724 | [CRITICAL] [Планировщик] [Проекты] Выбор лейблов для автоматического закрытия задач |
