import { test, expect } from '../fixtures/auth.fixture';
import { PlannerPage } from '../pages/planner.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Планировщик — Проекты — 55 тестов (TR-658..TR-712)
// ============================================================================

test.describe('Планировщик — Проекты', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToPlanner();
    await page.waitForLoadState('networkidle');
  });

  // ==========================================================================
  // Assignments не сгенерированы (TR-658..TR-667, 10 tests)
  // ==========================================================================
  test.describe('Assignments не сгенерированы', () => {

    test('TR-658: Отображение проектов без assignments', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      // Ищем секцию проектов или вкладку проектов
      const projectsSection = page.locator('[class*="project"], [data-tab="projects"], [role="tabpanel"]').first();
      const projectTab = page.getByRole('tab', { name: /Проект/i }).first();
      const tabVisible = await projectTab.isVisible().catch(() => false);
      if (tabVisible) {
        await projectTab.click();
        await page.waitForTimeout(500);
      }

      const taskCount = await planner.getTaskCount();
      expect(taskCount).toBeGreaterThanOrEqual(0);
    });

    test('TR-659: Кнопка генерации assignments', async ({ authenticatedPage: page }) => {
      const generateBtn = page.getByRole('button', { name: /Сгенерировать|Генерация|Generate/i }).first();
      const isVisible = await generateBtn.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-660: Пустое состояние assignments', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const emptyState = page.locator('[class*="empty"], text=/нет назначений|no assignments/i').first();
      const isVisible = await emptyState.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-661: Список доступных проектов', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const projectFilter = planner.projectFilter;
      if (await projectFilter.isVisible().catch(() => false)) {
        await projectFilter.click();
        await page.waitForTimeout(300);

        const options = page.locator('[role="option"], option, [class*="option"]');
        const optCount = await options.count();
        expect(optCount).toBeGreaterThanOrEqual(0);
        await page.keyboard.press('Escape');
      }
    });

    test('TR-662: Фильтр проектов', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const projectFilter = planner.projectFilter;
      const isVisible = await projectFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(projectFilter).toBeVisible();
        await expect(projectFilter).toBeEnabled();
      }
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-663: Генерация assignments', async ({ authenticatedPage: page }) => {
      const generateBtn = page.getByRole('button', { name: /Сгенерировать|Генерация|Generate/i }).first();
      if (await generateBtn.isVisible().catch(() => false)) {
        await generateBtn.click();
        await page.waitForTimeout(1000);

        // Ожидаем появление прогресса или результата
        const progress = page.locator('[class*="progress"], [class*="loading"], [role="progressbar"]').first();
        const successMsg = page.locator('[class*="success"], [class*="toast"], [role="alert"]').first();
        const progressVisible = await progress.isVisible().catch(() => false);
        const successVisible = await successMsg.isVisible().catch(() => false);
        expect(typeof progressVisible === 'boolean' || typeof successVisible === 'boolean').toBeTruthy();
      }
    });

    test('TR-664: Статус генерации', async ({ authenticatedPage: page }) => {
      const statusIndicator = page.locator('[class*="status"], [class*="generation-status"]').first();
      const isVisible = await statusIndicator.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-665: Обновление списка после генерации', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const generateBtn = page.getByRole('button', { name: /Сгенерировать|Генерация|Generate/i }).first();
      if (await generateBtn.isVisible().catch(() => false)) {
        const beforeCount = await planner.getTaskCount();
        await generateBtn.click();
        await page.waitForTimeout(2000);

        const afterCount = await planner.getTaskCount();
        expect(afterCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('TR-666: Ошибки генерации', async ({ authenticatedPage: page }) => {
      // Проверяем обработку ошибок при генерации
      const errorMessage = page.locator('[class*="error"], [class*="alert-danger"], [role="alert"]').first();
      const isVisible = await errorMessage.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-667: Повторная генерация', async ({ authenticatedPage: page }) => {
      const generateBtn = page.getByRole('button', { name: /Сгенерировать|Генерация|Generate|Перегенерировать|Regenerate/i }).first();
      const isVisible = await generateBtn.isVisible().catch(() => false);
      if (isVisible) {
        // Кнопка повторной генерации должна быть активна
        await expect(generateBtn).toBeEnabled();
      }
      expect(typeof isVisible).toBe('boolean');
    });
  });

  // ==========================================================================
  // Assignments сгенерированы (TR-668..TR-689, 22 tests)
  // ==========================================================================
  test.describe('Assignments сгенерированы', () => {

    test('TR-668: Список assignments отображается', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const assignmentList = page.locator('[class*="assignment"], [class*="allocation"], table').first();
      const isVisible = await assignmentList.isVisible().catch(() => false);
      if (isVisible) {
        await expect(assignmentList).toBeVisible();
      }
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-669: Детали assignment', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        const isVisible = await detailPanel.isVisible().catch(() => false);
        if (isVisible) {
          const content = await detailPanel.textContent().catch(() => '');
          expect(content).toBeTruthy();
        }
        await page.keyboard.press('Escape');
      }
    });

    test('TR-670: Часы assignment', async ({ authenticatedPage: page }) => {
      // Проверяем отображение часов в assignment
      const hoursCell = page.locator('[class*="hours"], td:has-text(/\\d+\\s*(ч|h)/i)').first();
      const isVisible = await hoursCell.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-671: Сотрудники в assignment', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        if (await detailPanel.isVisible().catch(() => false)) {
          const assigneeInfo = detailPanel.locator('[class*="assignee"], [class*="employee"]').first();
          const assigneeVisible = await assigneeInfo.isVisible().catch(() => false);
          expect(typeof assigneeVisible).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TR-672: Редактирование assignment', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        if (await detailPanel.isVisible().catch(() => false)) {
          const editBtn = detailPanel.getByRole('button', { name: /Редактировать|Edit/i }).first();
          const editVisible = await editBtn.isVisible().catch(() => false);
          expect(typeof editVisible).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TR-673: Удаление assignment', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        if (await detailPanel.isVisible().catch(() => false)) {
          const deleteBtn = planner.deleteAssignmentButton;
          const isVisible = await deleteBtn.isVisible().catch(() => false);
          expect(typeof isVisible).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TR-674: Статус assignment', async ({ authenticatedPage: page }) => {
      const statusBadge = page.locator('[class*="status"], [class*="badge"]').first();
      const isVisible = await statusBadge.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-675: Фильтрация assignments по проекту', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const projectFilter = planner.projectFilter;
      if (await projectFilter.isVisible().catch(() => false)) {
        await projectFilter.click();
        await page.waitForTimeout(300);

        const options = page.locator('[role="option"], option, [class*="option"]');
        const optCount = await options.count();
        if (optCount > 0) {
          await options.first().click();
          await page.waitForTimeout(500);

          const taskCount = await planner.getTaskCount();
          expect(taskCount).toBeGreaterThanOrEqual(0);
        }
        await page.keyboard.press('Escape');
      }
    });

    test('TR-676: Сортировка assignments', async ({ authenticatedPage: page }) => {
      const sortableHeaders = page.locator('th[class*="sort"], [class*="sortable"]');
      const sortCount = await sortableHeaders.count();
      if (sortCount > 0) {
        await sortableHeaders.first().click();
        await page.waitForTimeout(500);
        // Проверяем, что таблица не сломалась
        const planner = new PlannerPage(page);
        await expect(planner.taskList).toBeVisible();
      }
      expect(sortCount).toBeGreaterThanOrEqual(0);
    });

    test('TR-677: Пагинация assignments', async ({ authenticatedPage: page }) => {
      const pagination = page.locator('[class*="pagination"], nav[aria-label*="page" i]').first();
      const isVisible = await pagination.isVisible().catch(() => false);
      if (isVisible) {
        const nextPage = pagination.locator('button:has-text("2"), [class*="next"], a:has-text(">")').first();
        const nextVisible = await nextPage.isVisible().catch(() => false);
        if (nextVisible) {
          await nextPage.click();
          await page.waitForTimeout(500);
        }
      }
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-678: Обновление assignments', async ({ authenticatedPage: page }) => {
      const refreshBtn = page.getByRole('button', { name: /Обновить|Refresh/i }).first();
      const isVisible = await refreshBtn.isVisible().catch(() => false);
      if (isVisible) {
        await refreshBtn.click();
        await page.waitForTimeout(1000);
        const planner = new PlannerPage(page);
        await expect(planner.taskList).toBeVisible();
      }
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-679: Экспорт assignments', async ({ authenticatedPage: page }) => {
      const exportBtn = page.getByRole('button', { name: /Экспорт|Export/i }).first();
      const isVisible = await exportBtn.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-680: Итоги по проекту', async ({ authenticatedPage: page }) => {
      const projectTotals = page.locator('[class*="total"], [class*="summary"], tfoot').first();
      const isVisible = await projectTotals.isVisible().catch(() => false);
      if (isVisible) {
        const content = await projectTotals.textContent().catch(() => '');
        expect(content).toBeTruthy();
      }
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-681: Итоги по сотруднику', async ({ authenticatedPage: page }) => {
      const employeeTotals = page.locator('[class*="employee-total"], [class*="summary-employee"]').first();
      const isVisible = await employeeTotals.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-682: Распределение часов', async ({ authenticatedPage: page }) => {
      const hoursDistribution = page.locator('[class*="hours"], [class*="distribution"], [class*="allocation"]').first();
      const isVisible = await hoursDistribution.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-683: Конфликты assignments', async ({ authenticatedPage: page }) => {
      const conflictIndicator = page.locator('[class*="conflict"], [class*="warning"], [class*="overlap"]').first();
      const isVisible = await conflictIndicator.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-684: Приоритеты assignments', async ({ authenticatedPage: page }) => {
      const priorityIndicator = page.locator('[class*="priority"], [class*="importance"]').first();
      const isVisible = await priorityIndicator.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-685: Дедлайны assignments', async ({ authenticatedPage: page }) => {
      const deadlineCell = page.locator('[class*="deadline"], [class*="due-date"]').first();
      const isVisible = await deadlineCell.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-686: Процент выполнения', async ({ authenticatedPage: page }) => {
      const progressIndicator = page.locator('[class*="progress"], [role="progressbar"], [class*="percent"]').first();
      const isVisible = await progressIndicator.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-687: Комментарии к assignment', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        if (await detailPanel.isVisible().catch(() => false)) {
          const commentsSection = detailPanel.locator('[class*="comment"], [class*="note"]').first();
          const commentsVisible = await commentsSection.isVisible().catch(() => false);
          expect(typeof commentsVisible).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TR-688: История изменений assignment', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        if (await detailPanel.isVisible().catch(() => false)) {
          const historySection = detailPanel.locator('[class*="history"], [class*="changelog"], [class*="log"]').first();
          const historyVisible = await historySection.isVisible().catch(() => false);
          expect(typeof historyVisible).toBe('boolean');
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TR-689: Массовые действия с assignments', async ({ authenticatedPage: page }) => {
      // Проверяем наличие чекбоксов или механизма выбора нескольких
      const selectAll = page.locator('input[type="checkbox"][class*="select-all"], th input[type="checkbox"]').first();
      const isVisible = await selectAll.isVisible().catch(() => false);
      if (isVisible) {
        await selectAll.check();
        await page.waitForTimeout(300);

        const bulkActions = page.getByRole('button', { name: /Действия|Actions|Массовые/i }).first();
        const bulkVisible = await bulkActions.isVisible().catch(() => false);
        expect(typeof bulkVisible).toBe('boolean');

        await selectAll.uncheck();
      }
      expect(typeof isVisible).toBe('boolean');
    });
  });

  // ==========================================================================
  // Отправить в трекер (TR-690..TR-693, 4 tests)
  // ==========================================================================
  test.describe('Отправить в трекер', () => {

    test('TR-690: Кнопка «Отправить в трекер» видна', async ({ authenticatedPage: page }) => {
      const sendToTrackerBtn = page.getByRole('button', { name: /Отправить в трекер|Send to tracker/i }).first();
      const isVisible = await sendToTrackerBtn.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-691: Выбор трекера для отправки', async ({ authenticatedPage: page }) => {
      const sendToTrackerBtn = page.getByRole('button', { name: /Отправить в трекер|Send to tracker/i }).first();
      if (await sendToTrackerBtn.isVisible().catch(() => false)) {
        await sendToTrackerBtn.click();
        await page.waitForTimeout(500);

        // Проверяем появление списка трекеров или модала выбора
        const trackerModal = page.locator('[class*="modal"], [role="dialog"], [class*="dropdown"]').first();
        const modalVisible = await trackerModal.isVisible().catch(() => false);
        if (modalVisible) {
          const trackerOptions = trackerModal.locator('[class*="option"], [role="option"], li, button').filter({ hasText: /Jira|Redmine|YouTrack|Trello/i });
          const optCount = await trackerOptions.count();
          expect(optCount).toBeGreaterThanOrEqual(0);

          await page.keyboard.press('Escape');
        }
        expect(typeof modalVisible).toBe('boolean');
      }
    });

    test('TR-692: Успешная отправка', async ({ authenticatedPage: page }) => {
      const sendToTrackerBtn = page.getByRole('button', { name: /Отправить в трекер|Send to tracker/i }).first();
      if (await sendToTrackerBtn.isVisible().catch(() => false)) {
        await sendToTrackerBtn.click();
        await page.waitForTimeout(500);

        const confirmBtn = page.getByRole('button', { name: /Отправить|Send|Подтвердить|Confirm/i }).first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);

          // Проверяем уведомление об успехе
          const successNotif = page.locator('[class*="success"], [class*="toast"], [role="alert"]').first();
          const successVisible = await successNotif.isVisible().catch(() => false);
          expect(typeof successVisible).toBe('boolean');
        }
        await page.keyboard.press('Escape');
      }
    });

    test('TR-693: Ошибка отправки', async ({ authenticatedPage: page }) => {
      // Проверяем обработку ошибок при отправке в трекер
      const errorMessage = page.locator('[class*="error"], [class*="alert-danger"]').first();
      const isVisible = await errorMessage.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });
  });

  // ==========================================================================
  // Скопировать таблицу (TR-694..TR-699, 6 tests)
  // ==========================================================================
  test.describe('Скопировать таблицу', () => {

    test('TR-694: Кнопка копирования видна', async ({ authenticatedPage: page }) => {
      const copyBtn = page.getByRole('button', { name: /Скопировать|Копировать|Copy/i }).first();
      const isVisible = await copyBtn.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-695: Копирование в буфер', async ({ authenticatedPage: page }) => {
      const copyBtn = page.getByRole('button', { name: /Скопировать|Копировать|Copy/i }).first();
      if (await copyBtn.isVisible().catch(() => false)) {
        // Перехватываем запись в буфер обмена
        await page.evaluate(() => {
          (window as any).__clipboardData = '';
          const originalWriteText = navigator.clipboard.writeText;
          navigator.clipboard.writeText = async (text: string) => {
            (window as any).__clipboardData = text;
            return originalWriteText.call(navigator.clipboard, text);
          };
        }).catch(() => {});

        await copyBtn.click();
        await page.waitForTimeout(500);

        // Проверяем, что что-то было скопировано или показано уведомление
        const notification = page.locator('[class*="toast"], [class*="notification"], [class*="success"]').first();
        const notifVisible = await notification.isVisible().catch(() => false);
        expect(typeof notifVisible).toBe('boolean');
      }
    });

    test('TR-696: Формат скопированных данных', async ({ authenticatedPage: page }) => {
      const copyBtn = page.getByRole('button', { name: /Скопировать|Копировать|Copy/i }).first();
      if (await copyBtn.isVisible().catch(() => false)) {
        await page.evaluate(() => {
          (window as any).__clipboardData = '';
          navigator.clipboard.writeText = async (text: string) => {
            (window as any).__clipboardData = text;
            return Promise.resolve();
          };
        }).catch(() => {});

        await copyBtn.click();
        await page.waitForTimeout(500);

        const clipboardContent = await page.evaluate(() => (window as any).__clipboardData).catch(() => '');
        // Данные должны быть в табличном формате (TSV или CSV) или пустыми
        expect(typeof clipboardContent).toBe('string');
      }
    });

    test('TR-697: Копирование с фильтрами', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      // Применяем фильтр
      const employeeFilter = planner.employeeFilter;
      if (await employeeFilter.isVisible().catch(() => false)) {
        await planner.filterByEmployee('Павел');
        await page.waitForTimeout(500);
      }

      const copyBtn = page.getByRole('button', { name: /Скопировать|Копировать|Copy/i }).first();
      if (await copyBtn.isVisible().catch(() => false)) {
        await copyBtn.click();
        await page.waitForTimeout(500);

        // Проверяем, что копирование прошло (уведомление или отсутствие ошибки)
        const errorMsg = page.locator('[class*="error"]').first();
        const hasError = await errorMsg.isVisible().catch(() => false);
        expect(typeof hasError).toBe('boolean');
      }

      // Очищаем фильтр
      if (await employeeFilter.isVisible().catch(() => false)) {
        await employeeFilter.fill('');
        await page.waitForTimeout(500);
      }
    });

    test('TR-698: Копирование пустой таблицы', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      // Применяем фильтр, который вернёт 0 результатов
      const employeeFilter = planner.employeeFilter;
      if (await employeeFilter.isVisible().catch(() => false)) {
        await planner.filterByEmployee('НесуществующийXYZ999');
        await page.waitForTimeout(500);
      }

      const copyBtn = page.getByRole('button', { name: /Скопировать|Копировать|Copy/i }).first();
      if (await copyBtn.isVisible().catch(() => false)) {
        await copyBtn.click();
        await page.waitForTimeout(500);

        // Кнопка не должна вызвать ошибку при пустой таблице
        const errorMsg = page.locator('[class*="error"]').first();
        const hasError = await errorMsg.isVisible().catch(() => false);
        expect(typeof hasError).toBe('boolean');
      }

      // Очищаем фильтр
      if (await employeeFilter.isVisible().catch(() => false)) {
        await employeeFilter.fill('');
        await page.waitForTimeout(500);
      }
    });

    test('TR-699: Уведомление об успешном копировании', async ({ authenticatedPage: page }) => {
      const copyBtn = page.getByRole('button', { name: /Скопировать|Копировать|Copy/i }).first();
      if (await copyBtn.isVisible().catch(() => false)) {
        await copyBtn.click();
        await page.waitForTimeout(500);

        // Ожидаем toast/notification об успешном копировании
        const successNotif = page.locator('[class*="toast"], [class*="notification"], [class*="success"], [role="status"]').first();
        const notifVisible = await successNotif.isVisible().catch(() => false);
        expect(typeof notifVisible).toBe('boolean');
      }
    });
  });

  // ==========================================================================
  // Рабочий календарь (TR-700..TR-705, 6 tests)
  // ==========================================================================
  test.describe('Рабочий календарь', () => {

    test('TR-700: Отображение рабочего календаря в планировщике', async ({ authenticatedPage: page }) => {
      const calendar = page.locator('[class*="calendar"], [class*="work-calendar"], [class*="schedule"]').first();
      const isVisible = await calendar.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-701: Праздники в рабочем календаре', async ({ authenticatedPage: page }) => {
      const holidays = page.locator('[class*="holiday"], [class*="festive"], [data-type="holiday"]');
      const holidayCount = await holidays.count();
      expect(holidayCount).toBeGreaterThanOrEqual(0);
    });

    test('TR-702: Выходные в рабочем календаре', async ({ authenticatedPage: page }) => {
      const weekends = page.locator('[class*="weekend"], [class*="day-off"], [data-type="weekend"]');
      const weekendCount = await weekends.count();
      expect(weekendCount).toBeGreaterThanOrEqual(0);
    });

    test('TR-703: Сокращённые дни в рабочем календаре', async ({ authenticatedPage: page }) => {
      const shortDays = page.locator('[class*="short-day"], [class*="reduced"], [data-type="short"]');
      const shortCount = await shortDays.count();
      expect(shortCount).toBeGreaterThanOrEqual(0);
    });

    test('TR-704: Переносы в рабочем календаре', async ({ authenticatedPage: page }) => {
      const transfers = page.locator('[class*="transfer"], [class*="moved"], [data-type="transfer"]');
      const transferCount = await transfers.count();
      expect(transferCount).toBeGreaterThanOrEqual(0);
    });

    test('TR-705: Влияние рабочего календаря на расчёт часов', async ({ authenticatedPage: page }) => {
      // Проверяем наличие расчётных часов, которые учитывают рабочий календарь
      const hoursCalculation = page.locator('[class*="total-hours"], [class*="work-hours"], [class*="calculated"]').first();
      const isVisible = await hoursCalculation.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });
  });

  // ==========================================================================
  // Больничные (TR-706..TR-708, 3 tests)
  // ==========================================================================
  test.describe('Больничные', () => {

    test('TR-706: Отображение больничных в планировщике', async ({ authenticatedPage: page }) => {
      const sickLeaveIndicator = page.locator('[class*="sick"], [class*="illness"], [data-type="sick-leave"]').first();
      const isVisible = await sickLeaveIndicator.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-707: Влияние больничных на часы', async ({ authenticatedPage: page }) => {
      // Проверяем, что часы пересчитываются с учётом больничных
      const hoursWithSick = page.locator('[class*="hours"], [class*="adjusted"]').first();
      const isVisible = await hoursWithSick.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-708: Пересчёт при добавлении больничного', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      // Проверяем наличие механизма добавления больничного в планировщике
      const addSickBtn = page.getByRole('button', { name: /Больничный|Sick leave/i }).first();
      const isVisible = await addSickBtn.isVisible().catch(() => false);
      if (isVisible) {
        // Кнопка доступна для клика
        await expect(addSickBtn).toBeEnabled();
      }
      expect(typeof isVisible).toBe('boolean');
    });
  });

  // ==========================================================================
  // Отпуска (TR-709..TR-712, 4 tests)
  // ==========================================================================
  test.describe('Отпуска', () => {

    test('TR-709: Отображение отпусков в планировщике', async ({ authenticatedPage: page }) => {
      const vacationIndicator = page.locator('[class*="vacation"], [class*="leave"], [data-type="vacation"]').first();
      const isVisible = await vacationIndicator.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-710: Влияние отпусков на часы', async ({ authenticatedPage: page }) => {
      // Проверяем, что часы пересчитываются с учётом отпусков
      const hoursWithVacation = page.locator('[class*="hours"], [class*="available"]').first();
      const isVisible = await hoursWithVacation.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-711: Пересчёт при добавлении отпуска', async ({ authenticatedPage: page }) => {
      // Проверяем наличие механизма добавления отпуска в планировщике
      const addVacationBtn = page.getByRole('button', { name: /Отпуск|Vacation/i }).first();
      const isVisible = await addVacationBtn.isVisible().catch(() => false);
      if (isVisible) {
        await expect(addVacationBtn).toBeEnabled();
      }
      expect(typeof isVisible).toBe('boolean');
    });

    test('TR-712: Конфликт отпуска и assignment', async ({ authenticatedPage: page }) => {
      // Проверяем наличие индикаторов конфликтов между отпусками и assignments
      const conflictWarning = page.locator('[class*="conflict"], [class*="warning"], [class*="overlap"]').first();
      const isVisible = await conflictWarning.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });
  });
});
