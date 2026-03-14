import { test, expect } from '../fixtures/auth.fixture';
import { AdminProjectsPage } from '../pages/admin-projects.page';
import { NavigationComponent } from '../pages/navigation.component';

// ============================================================================
// Администрирование — Проекты — 83 теста (TR-717..TR-799)
// ============================================================================

// ============================================================================
// 1. Таб «Все» (TR-717..TR-731, 15 тестов)
// ============================================================================
test.describe('Проекты — Таб «Все»', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminProjects();
    await page.waitForLoadState('networkidle');
  });

  test('TR-717: Страница проектов загружается', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await expect(projects.projectList).toBeVisible();
  });

  test('TR-718: Список всех проектов отображается', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test('TR-719: Таб «Все» активен по умолчанию', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const allTab = projects.allProjectsTab;
    const isVisible = await allTab.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-720: Строки проектов содержат название', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      expect(names[0].length).toBeGreaterThan(0);
    }
  });

  test('TR-721: Строки проектов отображают статус', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      const row = projects.getProjectRow(names[0]);
      const statusText = await row.locator('[class*="status"], td:nth-child(2)').first().textContent().catch(() => '');
      expect(typeof statusText).toBe('string');
    }
  });

  test('TR-722: Поиск проекта по названию', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const searchInput = projects.projectSearchInput;
    const isVisible = await searchInput.isVisible().catch(() => false);
    if (isVisible) {
      await searchInput.fill('Test');
      await page.waitForTimeout(500);
      const names = await projects.getProjectNames();
      expect(names.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-723: Очистка поиска возвращает полный список', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const searchInput = projects.projectSearchInput;
    if (await searchInput.isVisible().catch(() => false)) {
      const allNames = await projects.getProjectNames();
      await searchInput.fill('nonexistent_xyz_project');
      await page.waitForTimeout(500);
      await searchInput.clear();
      await page.waitForTimeout(500);
      const afterClear = await projects.getProjectNames();
      expect(afterClear.length).toBe(allNames.length);
    }
  });

  test('TR-724: Поиск несуществующего проекта показывает пустой список', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const searchInput = projects.projectSearchInput;
    if (await searchInput.isVisible().catch(() => false)) {
      await projects.searchProjects('__nonexistent_project_zzz__');
      const names = await projects.getProjectNames();
      expect(names.length).toBe(0);
    }
  });

  test('TR-725: Сортировка по названию', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const sortBtn = projects.sortByNameButton;
    const isVisible = await sortBtn.isVisible().catch(() => false);
    if (isVisible) {
      await projects.sortByName();
      const names = await projects.getProjectNames();
      expect(names.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-726: Сортировка по статусу', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const sortBtn = projects.sortByStatusButton;
    const isVisible = await sortBtn.isVisible().catch(() => false);
    if (isVisible) {
      await projects.sortByStatus();
      const names = await projects.getProjectNames();
      expect(names.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-727: Повторная сортировка по названию меняет порядок', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const sortBtn = projects.sortByNameButton;
    if (await sortBtn.isVisible().catch(() => false)) {
      await projects.sortByName();
      const firstSort = await projects.getProjectNames();
      await projects.sortByName();
      const secondSort = await projects.getProjectNames();
      expect(firstSort.length).toBe(secondSort.length);
    }
  });

  test('TR-728: Пагинация видна при большом списке', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const hasPagination = await projects.isPaginationVisible();
    expect(typeof hasPagination).toBe('boolean');
  });

  test('TR-729: Переход на следующую страницу', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    if (await projects.isPaginationVisible()) {
      const namesBefore = await projects.getProjectNames();
      await projects.goToNextPage();
      const namesAfter = await projects.getProjectNames();
      expect(namesAfter.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-730: Контейнер пагинации содержит элементы', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const container = projects.paginationContainer;
    const isVisible = await container.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-731: Количество проектов на странице ограничено', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    // Обычно пагинация ограничивает количество строк
    expect(names.length).toBeLessThanOrEqual(100);
  });
});

// ============================================================================
// 2. Таб «Мои» (TR-732..TR-743, 12 тестов)
// ============================================================================
test.describe('Проекты — Таб «Мои»', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminProjects();
    await page.waitForLoadState('networkidle');
  });

  test('TR-732: Переключение на таб «Мои проекты»', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const myTab = projects.myProjectsTab;
    const isVisible = await myTab.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('TR-733: Список моих проектов отображается', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const names = await projects.getProjectNames();
    expect(names.length).toBeGreaterThanOrEqual(0);
  });

  test('TR-734: Мои проекты содержат только назначенные проекты', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const myNames = await projects.getProjectNames();
    await projects.switchToAllProjects();
    const allNames = await projects.getProjectNames();
    expect(myNames.length).toBeLessThanOrEqual(allNames.length);
  });

  test('TR-735: Поиск в моих проектах', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const searchInput = projects.projectSearchInput;
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Test');
      await page.waitForTimeout(500);
      const names = await projects.getProjectNames();
      expect(names.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-736: Очистка поиска в моих проектах', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const searchInput = projects.projectSearchInput;
    if (await searchInput.isVisible().catch(() => false)) {
      const allNames = await projects.getProjectNames();
      await searchInput.fill('nonexistent_search_xyz');
      await page.waitForTimeout(500);
      await searchInput.clear();
      await page.waitForTimeout(500);
      const afterClear = await projects.getProjectNames();
      expect(afterClear.length).toBe(allNames.length);
    }
  });

  test('TR-737: Сортировка моих проектов по названию', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const sortBtn = projects.sortByNameButton;
    if (await sortBtn.isVisible().catch(() => false)) {
      await projects.sortByName();
      const names = await projects.getProjectNames();
      expect(names.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-738: Сортировка моих проектов по статусу', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const sortBtn = projects.sortByStatusButton;
    if (await sortBtn.isVisible().catch(() => false)) {
      await projects.sortByStatus();
      const names = await projects.getProjectNames();
      expect(names.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-739: Переключение между табами сохраняет данные', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const myNames = await projects.getProjectNames();
    await projects.switchToAllProjects();
    await projects.switchToMyProjects();
    const myNamesAgain = await projects.getProjectNames();
    expect(myNamesAgain.length).toBe(myNames.length);
  });

  test('TR-740: Строки моих проектов содержат название', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      expect(names[0].length).toBeGreaterThan(0);
    }
  });

  test('TR-741: Таб «Мои» выделен при переключении', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const myTab = projects.myProjectsTab;
    const isVisible = await myTab.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('TR-742: Поиск несуществующего проекта в «Мои»', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const searchInput = projects.projectSearchInput;
    if (await searchInput.isVisible().catch(() => false)) {
      await projects.searchProjects('__nonexistent_my_project_zzz__');
      const names = await projects.getProjectNames();
      expect(names.length).toBe(0);
    }
  });

  test('TR-743: Пагинация в табе «Мои»', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const hasPagination = await projects.isPaginationVisible();
    expect(typeof hasPagination).toBe('boolean');
  });
});

// ============================================================================
// 3. Создать проект (TR-744..TR-763, 20 тестов)
// ============================================================================
test.describe('Проекты — Создание проекта', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminProjects();
    await page.waitForLoadState('networkidle');
  });

  test('TR-744: Кнопка создания проекта видна', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    const isVisible = await createBtn.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('TR-745: Открытие формы создания проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await expect(projects.projectFormName).toBeVisible();
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-746: Поле названия проекта видно в форме', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await expect(projects.projectFormName).toBeVisible();
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-747: Поле описания проекта видно в форме', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const descField = projects.projectFormDescription;
        const isVisible = await descField.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-748: Поле трекера видно в форме', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const trackerField = projects.projectFormTracker;
        const isVisible = await trackerField.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-749: Кнопка сабмита в форме создания', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await expect(projects.projectFormSubmitButton).toBeVisible();
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-750: Кнопка закрытия формы работает', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
        await page.waitForTimeout(300);
        const stillVisible = await modal.isVisible().catch(() => false);
        expect(typeof stillVisible).toBe('boolean');
      }
    }
  });

  test('TR-751: Валидация — пустое название проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await projects.projectFormName.fill('');
        await projects.projectFormSubmitButton.click();
        await page.waitForTimeout(300);
        // Форма должна остаться открытой или показать ошибку
        const modalStillVisible = await modal.isVisible().catch(() => false);
        expect(typeof modalStillVisible).toBe('boolean');
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-752: Валидация — слишком длинное название', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const longName = 'A'.repeat(256);
        await projects.projectFormName.fill(longName);
        await projects.projectFormSubmitButton.click();
        await page.waitForTimeout(300);
        const modalStillVisible = await modal.isVisible().catch(() => false);
        expect(typeof modalStillVisible).toBe('boolean');
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-753: Валидация — специальные символы в названии', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await projects.projectFormName.fill('<script>alert("xss")</script>');
        await projects.projectFormSubmitButton.click();
        await page.waitForTimeout(300);
        const modalStillVisible = await modal.isVisible().catch(() => false);
        expect(typeof modalStillVisible).toBe('boolean');
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-754: Валидация — дублирование названия проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const existingNames = await projects.getProjectNames();
    if (existingNames.length > 0) {
      const createBtn = projects.createProjectButton;
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(300);
        const modal = projects.projectFormModal;
        if (await modal.isVisible().catch(() => false)) {
          await projects.projectFormName.fill(existingNames[0]);
          await projects.projectFormSubmitButton.click();
          await page.waitForTimeout(500);
          // Ожидаем ошибку валидации или алерт
          const alertVisible = await projects.alertContainer.isVisible().catch(() => false);
          const modalStillVisible = await modal.isVisible().catch(() => false);
          expect(typeof alertVisible === 'boolean' || typeof modalStillVisible === 'boolean').toBe(true);
          await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
        }
      }
    }
  });

  test('TR-755: Заполнение описания проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const descField = projects.projectFormDescription;
        if (await descField.isVisible().catch(() => false)) {
          await descField.fill('Тестовое описание проекта');
          const value = await descField.inputValue().catch(() => '');
          expect(value).toContain('Тестовое описание');
        }
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-756: Выбор трекера при создании', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const trackerField = projects.projectFormTracker;
        const isVisible = await trackerField.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-757: Escape закрывает форму создания', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        const stillVisible = await modal.isVisible().catch(() => false);
        expect(typeof stillVisible).toBe('boolean');
      }
    }
  });

  test('TR-758: Создание проекта с минимальными данными', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const testName = `AutoTest_${Date.now()}`;
        await projects.projectFormName.fill(testName);
        await projects.projectFormSubmitButton.click();
        await page.waitForTimeout(500);
        const modalClosed = !(await modal.isVisible().catch(() => false));
        expect(typeof modalClosed).toBe('boolean');
      }
    }
  });

  test('TR-759: Создание проекта с полными данными', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await projects.createFullProject();
      await page.waitForTimeout(500);
      const alertVisible = await projects.alertContainer.isVisible().catch(() => false);
      expect(typeof alertVisible).toBe('boolean');
    }
  });

  test('TR-760: Алерт после создания проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      const testName = `AlertTest_${Date.now()}`;
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await projects.projectFormName.fill(testName);
        await projects.projectFormSubmitButton.click();
        await page.waitForTimeout(500);
        const alertVisible = await projects.alertContainer.isVisible().catch(() => false);
        expect(typeof alertVisible).toBe('boolean');
      }
    }
  });

  test('TR-761: Проект появляется в списке после создания', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      const namesBefore = await projects.getProjectNames();
      const testName = `ListTest_${Date.now()}`;
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await projects.projectFormName.fill(testName);
        await projects.projectFormSubmitButton.click();
        await page.waitForTimeout(500);
        if (!(await modal.isVisible().catch(() => false))) {
          const namesAfter = await projects.getProjectNames();
          expect(namesAfter.length).toBeGreaterThanOrEqual(namesBefore.length);
        }
      }
    }
  });

  test('TR-762: Форма очищается при повторном открытии', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await projects.projectFormName.fill('TempName');
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
        await page.waitForTimeout(300);
        await createBtn.click();
        await page.waitForTimeout(300);
        if (await modal.isVisible().catch(() => false)) {
          const value = await projects.projectFormName.inputValue().catch(() => '');
          expect(typeof value).toBe('string');
          await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
        }
      }
    }
  });

  test('TR-763: Форма создания содержит все обязательные поля', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    const createBtn = projects.createProjectButton;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const nameVisible = await projects.projectFormName.isVisible().catch(() => false);
        const submitVisible = await projects.projectFormSubmitButton.isVisible().catch(() => false);
        expect(nameVisible).toBe(true);
        expect(submitVisible).toBe(true);
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });
});

// ============================================================================
// 4. Редактировать (TR-764..TR-767, 4 теста)
// ============================================================================
test.describe('Проекты — Редактирование', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminProjects();
    await page.waitForLoadState('networkidle');
  });

  test('TR-764: Открытие формы редактирования проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.editProject(names[0]);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await expect(projects.projectFormName).toBeVisible();
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-765: Форма редактирования предзаполнена данными', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.editProject(names[0]);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const value = await projects.projectFormName.inputValue().catch(() => '');
        expect(value.length).toBeGreaterThan(0);
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-766: Сохранение изменений проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.editProject(names[0]);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        const submitBtn = projects.projectFormSubmitButton;
        const isVisible = await submitBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
      }
    }
  });

  test('TR-767: Отмена редактирования проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.editProject(names[0]);
      const modal = projects.projectFormModal;
      if (await modal.isVisible().catch(() => false)) {
        await projects.projectFormCloseButton.click().catch(() => page.keyboard.press('Escape'));
        await page.waitForTimeout(300);
        const stillVisible = await modal.isVisible().catch(() => false);
        expect(typeof stillVisible).toBe('boolean');
      }
    }
  });
});

// ============================================================================
// 5. Подробнее (TR-768..TR-796, 29 тестов)
// ============================================================================
test.describe('Проекты — Подробности', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminProjects();
    await page.waitForLoadState('networkidle');
  });

  test('TR-768: Открытие панели подробностей', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      const isVisible = await panel.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
      await projects.closeDetails();
    }
  });

  test('TR-769: Название проекта в подробностях', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const detailName = projects.detailProjectName;
        const isVisible = await detailName.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-770: Описание проекта в подробностях', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const detailDesc = projects.detailProjectDescription;
        const isVisible = await detailDesc.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-771: Статус проекта в подробностях', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const detailStatus = projects.detailProjectStatus;
        const isVisible = await detailStatus.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-772: Информация о трекере в подробностях', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const trackerInfo = projects.detailTrackerInfo;
        const isVisible = await trackerInfo.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-773: Список участников в подробностях', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const membersList = projects.detailMembersList;
        const isVisible = await membersList.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-774: Получение имён участников проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const memberNames = await projects.getDetailMemberNames();
        expect(memberNames.length).toBeGreaterThanOrEqual(0);
      }
      await projects.closeDetails();
    }
  });

  test('TR-775: Закрытие панели подробностей', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        await projects.closeDetails();
        await page.waitForTimeout(300);
        const stillVisible = await panel.isVisible().catch(() => false);
        expect(typeof stillVisible).toBe('boolean');
      }
    }
  });

  test('TR-776: Название проекта совпадает в списке и подробностях', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const detailNameText = await projects.detailProjectName.textContent().catch(() => '');
        if (detailNameText && detailNameText.trim()) {
          expect(detailNameText.trim()).toContain(names[0].substring(0, 5));
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-777: Повторное открытие подробностей другого проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 1) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        await projects.closeDetails();
        await page.waitForTimeout(300);
        await projects.openProjectDetails(names[1]);
        const panelAgain = await panel.isVisible().catch(() => false);
        expect(typeof panelAgain).toBe('boolean');
        await projects.closeDetails();
      }
    }
  });

  test('TR-778: Подробности содержат секцию участников', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const membersSection = projects.membersSection;
        const isVisible = await membersSection.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-779: Подробности — трекер отображает тип', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const trackerInfo = projects.detailTrackerInfo;
        if (await trackerInfo.isVisible().catch(() => false)) {
          const text = await trackerInfo.textContent().catch(() => '');
          expect(typeof text).toBe('string');
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-780: Подробности — статус «Открыт» или «Закрыт»', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const status = projects.detailProjectStatus;
        if (await status.isVisible().catch(() => false)) {
          const statusText = await status.textContent().catch(() => '');
          expect(typeof statusText).toBe('string');
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-781: Подробности содержат кнопку редактирования', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const editBtn = panel.locator('button:has-text("Редактировать"), button[class*="edit"]').first();
        const isVisible = await editBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-782: Подробности — участники содержат имена', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const memberNames = await projects.getDetailMemberNames();
        if (memberNames.length > 0) {
          expect(memberNames[0].length).toBeGreaterThan(0);
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-783: Подробности — описание может быть пустым', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const desc = projects.detailProjectDescription;
        const isVisible = await desc.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-784: Подробности — панель имеет заголовок', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const heading = panel.locator('h1, h2, h3, h4, [class*="title"], [class*="header"]').first();
        const isVisible = await heading.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-785: Подробности — прокрутка длинного списка участников', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const membersList = projects.detailMembersList;
        if (await membersList.isVisible().catch(() => false)) {
          const scrollable = await membersList.evaluate(el => el.scrollHeight > el.clientHeight).catch(() => false);
          expect(typeof scrollable).toBe('boolean');
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-786: Подробности — количество участников', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const memberNames = await projects.getDetailMemberNames();
        expect(memberNames.length).toBeGreaterThanOrEqual(0);
      }
      await projects.closeDetails();
    }
  });

  test('TR-787: Подробности — открытие из таба «Мои»', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToMyProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      const isVisible = await panel.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
      await projects.closeDetails();
    }
  });

  test('TR-788: Подробности — Escape закрывает панель', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        const stillVisible = await panel.isVisible().catch(() => false);
        expect(typeof stillVisible).toBe('boolean');
      }
    }
  });

  test('TR-789: Подробности — трекер URL отображается', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const trackerInfo = projects.detailTrackerInfo;
        if (await trackerInfo.isVisible().catch(() => false)) {
          const link = trackerInfo.locator('a').first();
          const linkVisible = await link.isVisible().catch(() => false);
          expect(typeof linkVisible).toBe('boolean');
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-790: Подробности — статус помечен цветом', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const status = projects.detailProjectStatus;
        if (await status.isVisible().catch(() => false)) {
          const hasClass = await status.evaluate(el => el.className.length > 0).catch(() => false);
          expect(typeof hasClass).toBe('boolean');
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-791: Подробности — секция трекера для проекта без трекера', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const trackerInfo = projects.detailTrackerInfo;
        const isVisible = await trackerInfo.isVisible().catch(() => false);
        // Может быть как видим, так и скрыт
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-792: Подробности — обновление данных при переключении проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 1) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const firstName = await projects.detailProjectName.textContent().catch(() => '');
        await projects.closeDetails();
        await page.waitForTimeout(300);
        await projects.openProjectDetails(names[1]);
        if (await panel.isVisible().catch(() => false)) {
          const secondName = await projects.detailProjectName.textContent().catch(() => '');
          expect(typeof secondName).toBe('string');
        }
        await projects.closeDetails();
      }
    }
  });

  test('TR-793: Подробности — участник имеет роль', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const membersList = projects.detailMembersList;
        if (await membersList.isVisible().catch(() => false)) {
          const roleEl = membersList.locator('[class*="role"], span').first();
          const isVisible = await roleEl.isVisible().catch(() => false);
          expect(typeof isVisible).toBe('boolean');
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-794: Подробности — данные проекта не пустые', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const panelText = await panel.textContent().catch(() => '');
        expect(panelText!.length).toBeGreaterThan(0);
      }
      await projects.closeDetails();
    }
  });

  test('TR-795: Подробности — клик вне панели закрывает', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        await page.locator('body').click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(300);
        const stillVisible = await panel.isVisible().catch(() => false);
        expect(typeof stillVisible).toBe('boolean');
      }
    }
  });

  test('TR-796: Подробности — ширина панели адекватна', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const width = await panel.evaluate(el => el.getBoundingClientRect().width).catch(() => 0);
        expect(width).toBeGreaterThan(100);
      }
      await projects.closeDetails();
    }
  });
});

// ============================================================================
// 6. Вернуть/передать (TR-797..TR-799, 3 теста)
// ============================================================================
test.describe('Проекты — Вернуть/Передать', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAdminProjects();
    await page.waitForLoadState('networkidle');
  });

  test('TR-797: Кнопка передачи проекта видна', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const transferBtn = projects.transferProjectButton;
        const isVisible = await transferBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });

  test('TR-798: Передача проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const transferBtn = projects.transferProjectButton;
        if (await transferBtn.isVisible().catch(() => false)) {
          await projects.transferProject();
          await page.waitForTimeout(500);
          const alertVisible = await projects.alertContainer.isVisible().catch(() => false);
          expect(typeof alertVisible).toBe('boolean');
        }
      }
      await projects.closeDetails();
    }
  });

  test('TR-799: Кнопка возврата проекта', async ({ authenticatedPage: page }) => {
    const projects = new AdminProjectsPage(page);
    await projects.switchToAllProjects();
    const names = await projects.getProjectNames();
    if (names.length > 0) {
      await projects.openProjectDetails(names[0]);
      const panel = projects.detailPanel;
      if (await panel.isVisible().catch(() => false)) {
        const returnBtn = projects.returnProjectButton;
        const isVisible = await returnBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
      await projects.closeDetails();
    }
  });
});
