import { test, expect } from '@playwright/test';

let storeUrl: string;
let managerUrl: string;

test.describe.serial('promotion management', () => {
  test.use({ storageState: './tests/scripts/auth.store.json' });
  test('going to the promotion management page', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const storeLink = await page
      .getByRole('link', { name: 'Un nombre de tienda Lun-Vier' })
      .first();
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);
    storeUrl = page.url();

    const createPromotionBanner = await page.getByTestId('create-promotion-banner').first();
    await expect(createPromotionBanner).toBeVisible();

    await page.getByTestId('create-promotion-button').click();

    await page.waitForURL(/promotions\/manage/);

    const goBackButton = await page.getByTestId('back-to-storefront');
    const emptyPromotionList = await page.getByTestId('empty-promotion-list');
    const createNewPromotionButton = await page.getByTestId('create-new-promotion-button');

    await expect(goBackButton).toBeVisible();
    await expect(emptyPromotionList).toBeVisible();
    await expect(createNewPromotionButton).toBeVisible();

    managerUrl = page.url();
  });
  test('create a promotion', async ({ page }) => {
    await page.goto(managerUrl);

    await page.getByTestId('create-new-promotion-button').click();

    const promotionNameInput = await page.getByTestId('promotion-name-input');
    const discountPercentageInput = await page.getByTestId('promotion-discount-input');
    const promotionDurationInput = await page.getByTestId('promotion-duration-input');
    const promotionDescriptionInput = await page.getByTestId('promotion-description-input');
    const addProductsButton = await page.getByRole('button', { name: 'Añadir artículos' });
    const addImageButton = await page.getByRole('button', { name: 'Añadir imagen' });
    const launchPromotion = await page.getByTestId('promotion-confirm-input');
    await expect(promotionNameInput).toBeVisible();
    await expect(discountPercentageInput).toBeVisible();
    await expect(promotionDurationInput).toBeVisible();
    await expect(promotionDescriptionInput).toBeVisible();
    await expect(addProductsButton).toBeVisible();
    await expect(addImageButton).toBeVisible();
    await expect(launchPromotion).toBeVisible();
  });

  test('create promotion', async ({ page }) => {
    await page.goto(storeUrl + '/promotions');

    await page.getByRole('textbox', { name: 'Ej. Rebajas de Verano' }).click();
    await page.getByRole('textbox', { name: 'Ej. Rebajas de Verano' }).fill('Rebajas');
    await page.getByRole('spinbutton').dblclick();
    await page.getByRole('spinbutton').fill('30');
    await page.getByRole('button', { name: 'Selecciona el rango de fechas' }).click();
    await page.getByRole('button', { name: 'Friday, April 17th,' }).click();
    await page.getByRole('button', { name: 'Tuesday, April 21st,' }).click();
    await page.getByRole('textbox', { name: 'Escribe una descripción...' }).click();
    await page.getByRole('textbox', { name: 'Escribe una descripción...' }).fill('Descripción');
    await page
      .getByRole('button', { name: 'Añadir imagen' })
      .locator('input[type="file"]')
      .setInputFiles('tests/scripts/foto-rebajas-1.jpg');
    await page.getByRole('button', { name: 'Añadir artículos' }).click();
    await page.getByRole('button', { name: 'Producto 1 Producto' }).click();
    await page.getByRole('button', { name: 'Lanzar promoción' }).click();

    await page.waitForURL(storeUrl);

    const promotionName = await page.getByRole('heading', { name: 'Rebajas' });
    await expect(promotionName).toBeVisible();
  });

  test('edit promotion', async ({ page }) => {
    await page.goto(managerUrl);

    await page.waitForURL(managerUrl);

    await page.getByTestId('edit-promotion-button').click();

    await page.waitForURL(/stores\/.*\/promotions/);

    await page.getByRole('textbox', { name: 'Ej. Rebajas de Verano' }).click();
    await page.getByRole('textbox', { name: 'Ej. Rebajas de Verano' }).fill('Rebajas Actualizada');
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('40');
    await page.getByRole('button', { name: '/04/2026 - 20/04/2026' }).click();
    await page.getByRole('button', { name: 'Sunday, April 19th, 2026,' }).click();
    await page.getByRole('textbox', { name: 'Escribe una descripción...' }).click();
    await page
      .getByRole('textbox', { name: 'Escribe una descripción...' })
      .fill('Descripción Cambiada');
    await page
      .getByRole('button', { name: 'Preview Cambiar imagen' })
      .locator('input[type="file"]')
      .setInputFiles('tests/scripts/foto-rebajas-2.png');
    await page.getByRole('button').nth(4).click();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await page.waitForURL(managerUrl);

    const promotionName = await page.getByRole('heading', { name: 'Rebajas Actualizada' });
    await expect(promotionName).toBeVisible();
  });
  test('see promotion in the manage page', async ({ page }) => {
    await page.goto(managerUrl);

    const promotion = await page.getByTestId('promotion-card').first();
    const editPromotionButton = await page.getByTestId('edit-promotion-button');
    const promotionDiscount = await page.getByTestId('promo-discount');
    await expect(promotion).toBeVisible();
    await expect(editPromotionButton).toBeVisible();

    await expect(promotionDiscount).toBeVisible();
    await expect(promotionDiscount).toContainText('-40%');

    await editPromotionButton.click();
    await page.waitForURL(/stores\/.*\/promotions/);
  });
  test('get promotion products and share promotion', async ({ page }) => {
    await page.goto(storeUrl);

    await page.waitForURL(storeUrl);

    const promotionProductsButton = await page.getByRole('button', { name: 'Ver productos' });
    await expect(promotionProductsButton).toBeVisible();
    await promotionProductsButton.click();

    const promotionProductModal = await page.getByTestId('promotion-products-modal');
    await expect(promotionProductModal).toBeVisible();

    await page
      .locator('div')
      .filter({ hasText: /^Producto 16€10€$/ })
      .nth(1)
      .click();

    await page.getByRole('button', { name: 'Volver a la tienda' }).click();
    await expect(promotionProductModal).not.toBeVisible();

    await expect(page.getByRole('button', { name: 'Compartir descuento' })).toBeVisible();

    await page.getByRole('button', { name: 'Compartir descuento' }).click();

    const shareModal = await page.getByTestId('share-promotion-modal');
    await expect(shareModal).toBeVisible();

    const shareLink = await page.getByText(
      'Vista previa de publicaciónEnlace a la tienda:http://localhost:3000/stores/'
    );
    await expect(shareLink).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();

    await expect(shareModal).not.toBeVisible();
  });

  test('delete promotion', async ({ page }) => {
    await page.goto(storeUrl);

    await page.waitForURL(storeUrl);

    await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
    await page.getByRole('button').nth(4).click();
    await page.getByRole('button', { name: 'Editar promoción' }).click();
    page.once('dialog', (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'Eliminar Promoción' }).click();

    await page.waitForURL(storeUrl);

    const createPromotionBanner = await page.getByTestId('create-promotion-banner').first();
    await expect(createPromotionBanner).toBeVisible();
  });
});
