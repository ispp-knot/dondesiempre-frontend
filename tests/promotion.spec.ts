import { test, expect } from '@playwright/test';

let storeUrl: string;

test.describe.serial('promotion management', () => {
  test.use({ storageState: './tests/scripts/auth.store.json' });
  test('going to the promotion creation page', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const storeLink = await page
      .getByRole('link', { name: 'Un nombre de tienda Lun-Vier' })
      .first();
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);
    storeUrl = page.url();

    const createPromotionBanner = await page.locator('.absolute.inset-0.bg-gradient-to-br');
    await expect(createPromotionBanner).toBeVisible();

    await page.getByRole('button', { name: 'Crear Nueva Promoción' }).click();

    await page.waitForURL(/stores\/.*\/promotions/);

    const promotionNameInput = await page.getByTestId('promotion-name-input');
    const discountPercentageInput = await page.getByTestId('promotion-discount-input');
    const promotionDurationInput = await page.getByTestId('promotion-duration-input');
    const promotionDescriptionInput = await page.getByTestId('promotion-description-input');
    const addProductsButton = await page.getByRole('button', { name: 'Añadir artículos' });
    const addImageButton = await page.getByTestId('promotion-image-input');
    const launchPromotion = await page.getByTestId('promotion-confirm-input');
    await expect(promotionNameInput).toBeVisible();
    await expect(discountPercentageInput).toBeVisible();
    await expect(promotionDurationInput).toBeVisible();
    await expect(promotionDescriptionInput).toBeVisible();
    await expect(addProductsButton).toBeVisible();
    await expect(addImageButton).toBeVisible();
    await expect(launchPromotion).toBeVisible();
  });

  /* TODO: Si no se pueden crear productos desde la interfaz, esto no se puede hacer.
    test('create promotion', async ({ page }) => {
        await page.goto('storeUrl/promotions');

        await page.getByRole('textbox', { name: 'Ej. Rebajas de Verano' }).click();
        await page.getByRole('textbox', { name: 'Ej. Rebajas de Verano' }).fill('Rebajas');
        await page.getByRole('spinbutton').dblclick();
        await page.getByRole('spinbutton').fill('30');
        await page.getByRole('button', { name: 'Selecciona el rango de fechas' }).click();
        await page.getByRole('button', { name: 'Tuesday, April 14th,' }).click();
        await page.getByRole('button', { name: 'Tuesday, April 21st,' }).click();
        await page.getByRole('textbox', { name: 'Escribe una descripción...' }).click();
        await page.getByRole('textbox', { name: 'Escribe una descripción...' }).fill('Descripción');
        await page.getByRole('button', { name: 'Añadir artículos' }).click();
        await page.getByRole('button', { name: 'Vestido Blanco Vestido Blanco' }).click();
        await page.getByRole('button', { name: 'Botas Negras Botas Negras' }).click();
        await page.getByRole('button', { name: 'Lanzar promoción' }).click();

        await page.waitForURL(/stores\/.{aqui va un *}/);

        const promotionName = await page.getByRole('heading', { name: 'Rebajas' });
        await expect(promotionName).toBeVisible();
    });

    test('edit promotion', async ({ page }) => {
        await page.goto('storeUrl');

        await page.waitForURL(/stores\/.{aqui va un *}/);

        await page.getByRole('button', { name: 'Editar promoción' }).click();

        await page.waitForURL(/stores\/.*\/promotions/);
        
        await page.getByRole('textbox', { name: 'Ej. Rebajas de Verano' }).click();
        await page.getByRole('textbox', { name: 'Ej. Rebajas de Verano' }).fill('Rebajas Actualizada');
        await page.getByRole('spinbutton').click();
        await page.getByRole('spinbutton').fill('40');
        await page.getByRole('button', { name: '/04/2026 - 20/04/2026' }).click();
        await page.getByRole('button', { name: 'Sunday, April 19th, 2026,' }).click();
        await page.getByRole('textbox', { name: 'Escribe una descripción...' }).click();
        await page.getByRole('textbox', { name: 'Escribe una descripción...' }).fill('Descripción Cambiada');
        await page.getByRole('button').nth(4).click();
        await page.getByRole('button', { name: 'Guardar cambios' }).click();

        await page.waitForURL(/stores\/.{aqui va un *}/);

        const promotionName = await page.getByRole('heading', { name: 'Rebajas Actualizada' });
        await expect(promotionName).toBeVisible();
    });
    test('get promotion products and share promotion', async ({ page }) => {
        await page.goto('storeUrl');

        await page.waitForURL(/stores\/.{aqui va un *}/);
        
        const promotionProducts = await page.getByRole('button', { name: 'Ver productos' });
        await expect(promotionProducts).toBeVisible();
        
        await page.locator('div').filter({ hasText: /^Vestido Blanco29\.99€49\.99€$/ }).nth(1).click();
        
        await page.getByRole('button', { name: 'Volver a la tienda' }).click();
        
        await page.getByRole('button', { name: 'Compartir descuento' }).click();
        const shareLink = await page.getByText('Vista previa de publicaciónEnlace a la tienda:http://localhost:3000/stores/');
        await expect(shareLink).toBeVisible();

        await page.getByRole('button', { name: 'Close' }).click();
    });

    test('delete promotion', async ({ page }) => {
        await page.goto('storeUrl');

        await page.waitForURL(/stores\/.{aqui va un *}/);

        await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
        await page.getByRole('button').nth(4).click();
        await page.getByRole('button', { name: 'Editar promoción' }).click();
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => {});
        });
        await page.getByRole('button', { name: 'Eliminar Promoción' }).click();

        await page.waitForURL(/stores\/.{aqui va un *}/);

        const createPromotionBanner = await page.locator('.absolute.inset-0.bg-gradient-to-br');
        await expect(createPromotionBanner).toBeVisible();

    });
    */
});
