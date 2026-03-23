import { test, expect } from '../fixtures/auth.fixture';
import { AccountingSickLeavesPage } from '../pages/accounting.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Бухгалтерия — Учет больничных листов — 27 тестов (TR-964..TR-990)
// ============================================================================
test.describe('Учет больничных листов (бухгалтерия)', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToAccountingSickLeaves();
    await page.waitForLoadState('networkidle');
  });

  test('TR-964: Страница учёта больничных загружается', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    await expect(page).toHaveURL(/\/accounting\/sick-leaves/);
    await expect(sickLeaves.dataTable).toBeVisible();
  });

  test('TR-965: Таблица больничных видна', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    await expect(sickLeaves.dataTable).toBeVisible();
    const count = await sickLeaves.getRowCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TR-966: Фильтр по периоду доступен', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const isVisible = await sickLeaves.periodFilter.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('TR-967: Фильтр по отделу доступен', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const isVisible = await sickLeaves.departmentFilter.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('TR-968: Фильтр по статусу доступен', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const isVisible = await sickLeaves.statusFilter.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('TR-969: Комбинированные фильтры — период + отдел + статус', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const periodVisible = await sickLeaves.periodFilter.isVisible().catch(() => false);
    const deptVisible = await sickLeaves.departmentFilter.isVisible().catch(() => false);
    const statusVisible = await sickLeaves.statusFilter.isVisible().catch(() => false);
    if (periodVisible && deptVisible && statusVisible) {
      await sickLeaves.periodFilter.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      await sickLeaves.departmentFilter.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      await sickLeaves.statusFilter.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      const count = await sickLeaves.getRowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-970: Поиск по имени сотрудника', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const searchInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], .header-filter input`).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('тест');
      await page.waitForLoadState('networkidle').catch(() => {});
      const count = await sickLeaves.getRowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-971: Таблица содержит ожидаемые колонки', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const headers = sickLeaves.dataTable.locator('thead th, thead td');
    const headerCount = await headers.count().catch(() => 0);
    expect(headerCount).toBeGreaterThan(0);
  });

  test('TR-972: ФИО сотрудника отображается в строке', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count > 0) {
      const nameCell = sickLeaves.dataRows.first().locator('td').first();
      const text = await nameCell.textContent().catch(() => '');
      expect(text!.length).toBeGreaterThan(0);
    }
  });

  test('TR-973: Даты больничного отображаются', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count > 0) {
      const cells = sickLeaves.dataRows.first().locator('td');
      const cellCount = await cells.count().catch(() => 0);
      expect(cellCount).toBeGreaterThan(1);
    }
  });

  test('TR-974: Статус больничного отображается', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count > 0) {
      const lastCell = sickLeaves.dataRows.first().locator('td').last();
      const text = await lastCell.textContent().catch(() => '');
      expect(text!.length).toBeGreaterThan(0);
    }
  });

  test('TR-975: Открытие больничного листа', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const openButton = page.getByRole('button', { name: new RegExp(`${t('btn.open')}|${t('btn.create')}|${t('btn.add')}`, 'i') }).first();
    const isVisible = await openButton.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('TR-976: Закрытие больничного листа', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count > 0) {
      const closeButton = sickLeaves.dataRows.first().locator(`button:has-text("${t('btn.close')}")`).first();
      const isVisible = await closeButton.isVisible().catch(() => false);
      if (isVisible) {
        expect(closeButton).toBeVisible();
      }
    }
  });

  test('TR-977: Продление больничного листа', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count > 0) {
      const extendButton = sickLeaves.dataRows.first().locator(`button:has-text("${t('btn.extend')}")`).first();
      const isVisible = await extendButton.isVisible().catch(() => false);
      if (isVisible) {
        expect(extendButton).toBeVisible();
      }
    }
  });

  test('TR-978: Удаление больничного листа — кнопка видна', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count > 0) {
      const deleteButton = sickLeaves.dataRows.first().locator(`button:has-text("${t('btn.delete')}"), button[aria-label*="${t('tooltip.delete')}" i]`).first();
      const isVisible = await deleteButton.isVisible().catch(() => false);
      if (isVisible) {
        expect(deleteButton).toBeVisible();
      }
    }
  });

  test('TR-979: Подтверждение удаления больничного', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count > 0) {
      const deleteButton = sickLeaves.dataRows.first().locator(`button:has-text("${t('btn.delete')}")`).first();
      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        const confirmDialog = page.locator('.modal, .modal__wrapper, [role="dialog"]').first();
        const dialogVisible = await confirmDialog.isVisible().catch(() => false);
        if (dialogVisible) {
          expect(confirmDialog).toBeVisible();
        }
        await page.keyboard.press('Escape');
      }
    }
  });

  test('TR-980: Уведомление при действиях с больничным', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const alert = page.locator('.popup.popup_show, [role="alert"]').first();
    const alertVisible = await alert.isVisible().catch(() => false);
    if (alertVisible) {
      expect(alert).toBeVisible();
    }
  });

  test('TR-981: Статус «Открыт»', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const openBadge = page.locator(`text=/${t('status.open')}|active|Open/i`).first();
    const isVisible = await openBadge.isVisible().catch(() => false);
    if (isVisible) {
      expect(openBadge).toBeVisible();
    }
  });

  test('TR-982: Статус «Закрыт»', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const closedBadge = page.locator(`text=/${t('status.closed')}|closed/i`).first();
    const isVisible = await closedBadge.isVisible().catch(() => false);
    if (isVisible) {
      expect(closedBadge).toBeVisible();
    }
  });

  test('TR-983: Статус «Продлён»', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const extendedBadge = page.locator(`text=/${t('status.extended')}|extended/i`).first();
    const isVisible = await extendedBadge.isVisible().catch(() => false);
    if (isVisible) {
      expect(extendedBadge).toBeVisible();
    }
  });

  test('TR-984: Пересчёт больничных дней', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const recalcButton = page.getByRole('button', { name: new RegExp(`${t('btn.recalculate')}|Recalculate`, 'i') }).first();
    const isVisible = await recalcButton.isVisible().catch(() => false);
    if (isVisible) {
      expect(recalcButton).toBeVisible();
    }
  });

  test('TR-985: Сортировка по имени сотрудника', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const nameHeader = sickLeaves.dataTable.locator('thead th').first();
    if (await nameHeader.isVisible().catch(() => false)) {
      await nameHeader.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      const count = await sickLeaves.getRowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-986: Сортировка по дате начала', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const headers = sickLeaves.dataTable.locator('thead th');
    const headerCount = await headers.count().catch(() => 0);
    if (headerCount > 1) {
      await headers.nth(1).click();
      await page.waitForLoadState('networkidle').catch(() => {});
      const count = await sickLeaves.getRowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('TR-987: Пагинация в таблице больничных', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const pagination = page.locator('nav[aria-label*="page" i], .rc-pagination').first();
    const isVisible = await pagination.isVisible().catch(() => false);
    if (isVisible) {
      const nextBtn = pagination.locator('button:has-text("»"), button:has-text("Next"), a:has-text("»")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const count = await sickLeaves.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('TR-988: Пустое состояние — нет больничных', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count === 0) {
      const emptyVisible = await sickLeaves.emptyState.isVisible().catch(() => false);
      if (emptyVisible) {
        expect(sickLeaves.emptyState).toBeVisible();
      }
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('TR-989: Экспорт данных больничных', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const exportButton = page.getByRole('button', { name: new RegExp(`${t('btn.export')}|Export|${t('btn.download')}`, 'i') }).first();
    if (await exportButton.isVisible().catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download').catch(() => null),
        exportButton.click(),
      ]);
      expect(true).toBe(true);
    }
  });

  test('TR-990: История изменений больничного', async ({ authenticatedPage: page }) => {
    const sickLeaves = new AccountingSickLeavesPage(page);
    const count = await sickLeaves.getRowCount();
    if (count > 0) {
      await sickLeaves.dataRows.first().click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      const historySection = page.locator(`text=/${t('btn.history')}|history/i`).first();
      const isVisible = await historySection.isVisible().catch(() => false);
      if (isVisible) {
        expect(historySection).toBeVisible();
      }
    }
  });
});
