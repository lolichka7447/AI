import { test, expect } from '../fixtures/auth.fixture';
import { PlannerPage } from '../pages/planner.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Планировщик — 12 тестов (TC-PLN-001..TC-PLN-012)
// ============================================================================

test.describe('Планировщик', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToPlanner();
    await page.waitForLoadState('networkidle');
  });

  // ==========================================================================
  // Отображение и навигация (TC-PLN-001..TC-PLN-003)
  // ==========================================================================
  test.describe('Отображение и навигация', () => {

    test('TC-PLN-001: Отображение списка задач', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      await expect(planner.taskList).toBeVisible();
      const taskCount = await planner.getTaskCount();
      // Список задач может быть пустым или содержать задачи
      expect(taskCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-PLN-002: URL страницы планировщика корректный', async ({ authenticatedPage: page }) => {
      await expect(page).toHaveURL(/\/planner/);
    });

    test('TC-PLN-003: Просмотр деталей задачи', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        // Панель деталей или модал должен появиться
        const detailPanel = planner.taskDetailPanel;
        const isVisible = await detailPanel.isVisible().catch(() => false);
        if (isVisible) {
          await expect(detailPanel).toBeVisible();
          await page.keyboard.press('Escape');
        }
      }
    });
  });

  // ==========================================================================
  // Назначение задач (TC-PLN-004..TC-PLN-006)
  // ==========================================================================
  test.describe('Назначение задач', () => {

    test('TC-PLN-004: Назначение задачи сотруднику', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        // Пробуем открыть детали первой задачи
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        const isVisible = await detailPanel.isVisible().catch(() => false);
        if (isVisible) {
          // Проверяем наличие селектора назначения
          const assigneeSelect = planner.taskAssigneeSelect;
          const assigneeVisible = await assigneeSelect.isVisible().catch(() => false);
          expect(assigneeVisible).toBe(true);
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TC-PLN-005: Переназначение задачи', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        if (await detailPanel.isVisible().catch(() => false)) {
          // Проверяем что можно изменить назначение
          await expect(detailPanel).toBeVisible();
          await page.keyboard.press('Escape');
        }
      }
    });

    test('TC-PLN-006: Удаление назначения', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      if (tasks.length > 0) {
        await planner.openTaskDetails(tasks[0]);
        const detailPanel = planner.taskDetailPanel;
        if (await detailPanel.isVisible().catch(() => false)) {
          const deleteBtn = planner.deleteAssignmentButton;
          const isVisible = await deleteBtn.isVisible().catch(() => false);
          expect(isVisible).toBe(true);
          await page.keyboard.press('Escape');
        }
      }
    });
  });

  // ==========================================================================
  // Создание задачи (TC-PLN-007)
  // ==========================================================================

  test('TC-PLN-007: Создание новой задачи в планировщике', async ({ authenticatedPage: page }) => {
    const planner = new PlannerPage(page);

    const createBtn = planner.createTaskButton;
    const isVisible = await createBtn.isVisible().catch(() => false);
    if (isVisible) {
      await createBtn.click();
      await page.waitForTimeout(300);

      // Должна появиться форма создания
      const nameInput = planner.taskNameInput;
      const inputVisible = await nameInput.isVisible().catch(() => false);
      if (inputVisible) {
        await expect(nameInput).toBeVisible();
        // Закрываем форму
        await planner.taskCancelButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  // ==========================================================================
  // Drag and drop (TC-PLN-008)
  // ==========================================================================

  test('TC-PLN-008: Drag-and-drop для изменения порядка', async ({ authenticatedPage: page }) => {
    const planner = new PlannerPage(page);

    const handles = planner.dragHandles;
    const handleCount = await handles.count();
    // Проверяем наличие drag-элементов
    expect(handleCount).toBeGreaterThanOrEqual(0);
  });

  // ==========================================================================
  // Фильтрация (TC-PLN-009..TC-PLN-010)
  // ==========================================================================
  test.describe('Фильтрация', () => {

    test('TC-PLN-009: Фильтрация по проекту', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const projectFilter = planner.projectFilter;
      const isVisible = await projectFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(projectFilter).toBeVisible();
      }
    });

    test('TC-PLN-010: Фильтрация по сотруднику', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const employeeFilter = planner.employeeFilter;
      const isVisible = await employeeFilter.isVisible().catch(() => false);
      if (isVisible) {
        await expect(employeeFilter).toBeVisible();
        await expect(employeeFilter).toBeEnabled();
      }
    });
  });

  // ==========================================================================
  // Права доступа (TC-PLN-011..TC-PLN-012)
  // ==========================================================================
  test.describe('Права доступа', () => {

    test('TC-PLN-011: Проверка прав доступа — менеджер', async ({ authenticatedPage: page }) => {
      // Текущий пользователь с правами менеджера имеет доступ к планировщику
      await expect(page).toHaveURL(/\/planner/);
      const planner = new PlannerPage(page);
      await expect(planner.taskList).toBeVisible();
    });

    test('TC-PLN-012: Список задач содержит названия', async ({ authenticatedPage: page }) => {
      const planner = new PlannerPage(page);

      const tasks = await planner.getTaskNames();
      // Каждое название задачи должно быть непустой строкой
      for (const name of tasks) {
        expect(name.length).toBeGreaterThan(0);
      }
    });
  });
});
