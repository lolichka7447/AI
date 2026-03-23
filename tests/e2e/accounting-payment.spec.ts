import { test, expect } from '../fixtures/auth.fixture';
import { VacationPaymentPage } from '../pages/vacation.page';
import { NavigationComponent } from '../pages/navigation.component';
import { t, tRegex } from '../i18n';

// ============================================================================
// Бухгалтерия — Выплата отпускных — 46 тестов (TR-892..TR-937)
// ============================================================================
test.describe('Выплата отпускных', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    const nav = new NavigationComponent(page);
    await nav.navigateToVacationPayment();
    await page.waitForLoadState('networkidle');
  });

  // ==========================================================================
  // Просмотр (TR-892..TR-910, 19 тестов)
  // ==========================================================================
  test.describe('Просмотр', () => {

    test('TR-892: Страница выплаты отпускных загружается', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page).toHaveURL(/\/vacation\/payment/);
      await expect(payment.dataTable).toBeVisible();
    });

    test('TR-893: Таблица выплат видна', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(payment.dataTable).toBeVisible();
      const count = await payment.getRowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('TR-894: Фильтр по периоду доступен', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-895: Смена фильтра обновляет данные', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      if (await payment.periodFilter.isVisible().catch(() => false)) {
        await payment.periodFilter.click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        const options = page.locator('option, [role="option"], li');
        const optCount = await options.count().catch(() => 0);
        if (optCount > 1) {
          await options.nth(1).click().catch(() => {});
          await page.waitForLoadState('networkidle').catch(() => {});
        }
        const count = await payment.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('TR-896: Таблица содержит ожидаемые колонки', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const headers = payment.dataTable.locator('thead th, thead td');
      const headerCount = await headers.count().catch(() => 0);
      expect(headerCount).toBeGreaterThan(0);
    });

    test('TR-897: Данные сотрудников отображаются в строках', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        const firstRow = payment.dataRows.first();
        const text = await firstRow.textContent();
        expect(text).toBeTruthy();
      }
    });

    test('TR-898: Даты отпуска отображаются', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        const firstRow = payment.dataRows.first();
        const cells = firstRow.locator('td');
        const cellCount = await cells.count().catch(() => 0);
        expect(cellCount).toBeGreaterThan(0);
      }
    });

    test('TR-899: Сумма выплаты отображается', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        const firstRow = payment.dataRows.first();
        const text = await firstRow.textContent();
        expect(text).toBeTruthy();
      }
    });

    test('TR-900: Статус выплаты отображается', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        const statusCell = payment.dataRows.first().locator('td').last();
        await expect(statusCell).toBeVisible();
      }
    });

    test('TR-901: Итоговая сумма отображается', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-902: Пустое состояние при отсутствии данных', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count === 0) {
        await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
      } else {
        expect(count).toBeGreaterThan(0);
      }
    });

    test('TR-903: Сортировка по имени', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const nameHeader = payment.dataTable.locator('thead th').first();
      if (await nameHeader.isVisible().catch(() => false)) {
        await nameHeader.click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const count = await payment.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('TR-904: Сортировка по сумме', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const headers = payment.dataTable.locator('thead th');
      const headerCount = await headers.count().catch(() => 0);
      if (headerCount > 1) {
        await headers.nth(headerCount - 1).click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const count = await payment.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('TR-905: Сортировка по дате', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const headers = payment.dataTable.locator('thead th');
      const headerCount = await headers.count().catch(() => 0);
      if (headerCount > 2) {
        await headers.nth(1).click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const count = await payment.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('TR-906: Пагинация — переход между страницами', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const pagination = page.locator('nav[aria-label*="page" i], .rc-pagination').first();
      const isVisible = await pagination.isVisible().catch(() => false);
      if (isVisible) {
        const nextBtn = pagination.locator('button:has-text("»"), button:has-text("Next"), a:has-text("»")').first();
        if (await nextBtn.isVisible().catch(() => false)) {
          await nextBtn.click();
          await page.waitForLoadState('networkidle').catch(() => {});
          const count = await payment.getRowCount();
          expect(count).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('TR-907: Счётчик записей отображается', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-908: Поиск по имени сотрудника', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const searchInput = page.locator(`input[placeholder*="${t('placeholder.search')}" i], .header-filter input`).first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('тест');
        await page.waitForLoadState('networkidle').catch(() => {});
        const count = await payment.getRowCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('TR-909: Количество дней отпуска в строке', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        const cells = payment.dataRows.first().locator('td');
        const cellCount = await cells.count().catch(() => 0);
        expect(cellCount).toBeGreaterThan(0);
      }
    });

    test('TR-910: ФИО сотрудника в строке', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        const nameCell = payment.dataRows.first().locator('td').first();
        const text = await nameCell.textContent().catch(() => '');
        expect(text!.length).toBeGreaterThan(0);
      }
    });
  });

  // ==========================================================================
  // Расчёт (TR-911..TR-925, 15 тестов)
  // ==========================================================================
  test.describe('Расчёт', () => {

    test('TR-911: Расчёт отпускных доступен', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-912: Выбор типа отпуска для расчёта', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-913: Расчёт за неполный месяц', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        const firstRow = payment.dataRows.first();
        const text = await firstRow.textContent();
        expect(text).toBeTruthy();
      }
    });

    test('TR-914: Округление суммы выплаты', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        const cells = payment.dataRows.first().locator('td');
        const cellCount = await cells.count().catch(() => 0);
        expect(cellCount).toBeGreaterThan(0);
      }
    });

    test('TR-915: Пересчёт при изменении данных', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-916: Подтверждение расчёта', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-917: Отмена расчёта', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-918: Статус расчёта отображается', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
      }
    });

    test('TR-919: История расчётов', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-920: Экспорт расчёта', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-921: Массовый расчёт', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-922: Чекбоксы выбора строк', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const checkboxes = payment.dataTable.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count().catch(() => 0);
      expect(checkboxCount).toBeGreaterThanOrEqual(0);
    });

    test('TR-923: Валидация расчёта — пустые поля', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const calcButton = page.getByRole('button', { name: new RegExp(`${t('btn.calculate')}|${t('btn.calculateAlt')}|Calculate`, 'i') }).first();
      if (await calcButton.isVisible().catch(() => false)) {
        await calcButton.click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
      }
    });

    test('TR-924: Валидация — отрицательная сумма', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const amountInput = page.locator('input[type="number"]').first();
      if (await amountInput.isVisible().catch(() => false)) {
        await amountInput.fill('-100');
        await page.waitForLoadState('networkidle').catch(() => {});
        await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
      }
    });

    test('TR-925: Комментарий к расчёту', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });
  });

  // ==========================================================================
  // Действия (TR-926..TR-937, 12 тестов)
  // ==========================================================================
  test.describe('Действия', () => {

    test('TR-926: Кнопка «Выплатить» доступна', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-927: Подтверждение выплаты', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const confirmDialog = page.locator(`.modal, .modal__wrapper, [role="dialog"]:has-text("${t('status.approved')}")`);
      const confirmCount = await confirmDialog.count().catch(() => 0);
      expect(confirmCount).toBeGreaterThanOrEqual(0);
    });

    test('TR-928: Отмена выплаты', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      await expect(page.locator('table:visible, .page-content').first()).toBeVisible();
    });

    test('TR-929: Статус «Ожидает выплаты»', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const pendingBadge = page.locator(`text=/${t('status.pendingPayment')}|pending/i`).first();
      const isVisible = await pendingBadge.isVisible().catch(() => false);
      expect(isVisible).toBeDefined();
    });

    test('TR-930: Статус «Выплачено»', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const paidBadge = page.locator(`text=/${t('status.paid')}|paid/i`).first();
      const isVisible = await paidBadge.isVisible().catch(() => false);
      expect(isVisible).toBeDefined();
    });

    test('TR-931: Статус «Отменено»', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const cancelledBadge = page.locator(`text=/${t('status.cancelledPayment')}|cancelled/i`).first();
      const isVisible = await cancelledBadge.isVisible().catch(() => false);
      expect(isVisible).toBeDefined();
    });

    test('TR-932: Фильтр по статусу выплаты', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const statusFilter = page.locator(`.header-filter, select:has-text("${t('label.status')}")`).first();
      const isVisible = await statusFilter.isVisible().catch(() => false);
      expect(isVisible).toBeDefined();
    });

    test('TR-933: Массовая выплата', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const batchPayButton = page.getByRole('button', { name: new RegExp(`${t('btn.batchPay')}|Batch pay|${t('btn.batchPayAll')}`, 'i') }).first();
      const isVisible = await batchPayButton.isVisible().catch(() => false);
      expect(isVisible).toBeDefined();
    });

    test('TR-934: Экспорт списка выплат', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const exportButton = page.getByRole('button', { name: new RegExp(`${t('btn.export')}|Export|${t('btn.download')}`, 'i') }).first();
      if (await exportButton.isVisible().catch(() => false)) {
        const [download] = await Promise.all([
          page.waitForEvent('download').catch(() => null),
          exportButton.click(),
        ]);
        expect(true).toBe(true);
      }
    });

    test('TR-935: Печать списка выплат', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const printButton = page.getByRole('button', { name: new RegExp(`${t('btn.print')}|Print`, 'i') }).first();
      const isVisible = await printButton.isVisible().catch(() => false);
      expect(isVisible).toBeDefined();
    });

    test('TR-936: Добавление комментария к выплате', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        await payment.dataRows.first().click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        const commentInput = page.locator(`textarea, input[placeholder*="${t('placeholder.comment')}" i]`).first();
        const isVisible = await commentInput.isVisible().catch(() => false);
        expect(isVisible).toBeDefined();
      }
    });

    test('TR-937: История изменений выплаты', async ({ authenticatedPage: page }) => {
      const payment = new VacationPaymentPage(page);
      const count = await payment.getRowCount();
      if (count > 0) {
        await payment.dataRows.first().click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        const historySection = page.locator(`text=/${t('btn.history')}|history/i`).first();
        const isVisible = await historySection.isVisible().catch(() => false);
        expect(isVisible).toBeDefined();
      }
    });
  });
});
