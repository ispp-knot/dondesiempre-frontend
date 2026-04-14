import { test, expect } from '@playwright/test';

let storeUrl: string;

test.describe.serial('outfits', () => {
  test.use({ storageState: './tests/scripts/auth.store.json' });
  test('test going to outfits page', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const storeLink = await page
      .getByRole('link', { name: 'Un nombre de tienda Lun-Vier' })
      .first();
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);
    storeUrl = page.url();

    const outfitPage = await page.getByRole('link', { name: 'Ver más' });
    await expect(outfitPage).toBeVisible();
    await outfitPage.click();
    await page.waitForURL(/stores\/.*\/outfits/);

    const createOutfitButton = await page.locator('div').filter({ hasText: /^Crear outfit$/ });
    const orderOutfitsButton = await page.locator('div').filter({ hasText: 'Ordenar' }).nth(5);
    await expect(createOutfitButton).toBeVisible();
    await expect(orderOutfitsButton).toBeVisible();
  });

  test('go to create outfit page', async ({ page }) => {
    await page.goto(storeUrl + '/outfits');
    const createOutfitButton = await page.getByTestId('create-outfit-button');
    await expect(createOutfitButton).toBeVisible();
    await createOutfitButton.click();

    await page.waitForURL(/stores\/.*\/create-outfit/);

    const outfitNameInput = await page.getByTestId('outfit-name-input');
    const discountPercentageInput = await page.getByTestId('outfit-discount-input');
    const outfitTagsInput = await page.getByTestId('outfit-tags-input');
    const outfitDescriptionInput = await page.getByTestId('outfit-description-input');
    const addImageButton = await page.getByTestId('outfit-image-input');
    const productsInput = await page.getByTestId('outfit-products-input');
    const productsList = await page.getByTestId('outfit-products-list');
    const product1 = await page.getByText('Producto 110,00€Añadir');
    const product2 = await page.getByText('Producto 425,20€Añadir');
    const product3 = await page.getByText('Producto 2 Actualizado15,00€A');
    const launchPromotion = await page.getByTestId('outfit-confirm-button');

    await expect(outfitNameInput).toBeVisible();
    await expect(discountPercentageInput).toBeVisible();
    await expect(outfitTagsInput).toBeVisible();
    await expect(outfitDescriptionInput).toBeVisible();
    await expect(addImageButton).toBeVisible();
    await expect(productsInput).toBeVisible();
    await expect(productsList).toBeVisible();
    await expect(product1).toBeVisible();
    await expect(product2).toBeVisible();
    await expect(product3).toBeVisible();
    await expect(launchPromotion).toBeVisible();
  });

  test('create outfit', async ({ page }) => {
    await page.goto(storeUrl + '/create-outfit');

    await page.getByRole('textbox', { name: 'Nombre' }).click();
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Outfit Nuevo');
    await page.getByRole('textbox', { name: 'Descripción' }).click();
    await page.getByRole('textbox', { name: 'Descripción' }).fill('Una descripción de ejemplo');
    await page
      .getByRole('button', { name: 'Añadir imagen' })
      .locator('input[type="file"]')
      .setInputFiles('tests/scripts/foto-outfit-1.jpg');
    await page.getByRole('spinbutton', { name: 'Descuento' }).click();
    await page.getByRole('spinbutton', { name: 'Descuento' }).fill('30');
    await page.getByRole('textbox', { name: 'Etiquetas' }).click();
    await page.getByRole('textbox', { name: 'Etiquetas' }).fill('Verano');
    await page.getByRole('button', { name: 'Añadir etiqueta' }).click();
    await page.getByRole('textbox', { name: 'Etiquetas' }).click();
    await page.getByRole('textbox', { name: 'Etiquetas' }).fill('Primavera');
    await page.getByRole('button', { name: 'Añadir etiqueta' }).click();

    const PrimTag = await page.getByRole('button', { name: 'Primavera' });
    const VerTag = await page.getByRole('button', { name: 'Verano' });

    await expect(PrimTag).toBeVisible();
    await expect(VerTag).toBeVisible();

    await page.getByRole('textbox', { name: 'Etiquetas' }).click();
    await page.getByRole('textbox', { name: 'Etiquetas' }).fill('Feria');
    await page.getByRole('textbox', { name: 'Etiquetas' }).press('Enter');

    const FeriaTag = await page.getByRole('button', { name: 'Feria' });
    await expect(FeriaTag).toBeVisible();

    await page.getByRole('button', { name: 'Primavera' }).click();

    await expect(PrimTag).not.toBeVisible();

    await page.getByRole('button', { name: 'Añadir' }).nth(1).click();
    await page.getByRole('button', { name: 'Añadir' }).nth(1).click();
    await page.getByRole('button', { name: 'Crear outfit' }).click();

    await page.waitForURL(/stores\/.*\/outfits/);
    const outfitName = await page.getByRole('heading', { name: 'Outfit Nuevo' });
    await expect(outfitName).toBeVisible();
  });

  test('edit outfit, only info', async ({ page }) => {
    await page.goto(storeUrl + '/outfits');

    await page.getByTestId('outfit-edit-link').click();
    await page.waitForURL(/stores\/.*\/outfits\/.*/);

    await page.getByRole('textbox', { name: 'Nombre' }).click();
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Outfit Nuevo Editado');
    await page.getByRole('textbox', { name: 'Descripción' }).click();
    await page.getByRole('textbox', { name: 'Descripción' }).fill('Descripción Editada');
    await page
      .getByRole('button', { name: 'Preview Cambiar imagen' })
      .locator('input[type="file"]')
      .setInputFiles('tests/scripts/foto-outfit-2.jpg');
    await page.getByRole('spinbutton', { name: 'Descuento' }).click();
    await page.getByRole('spinbutton', { name: 'Descuento' }).fill('39');
    await page.getByRole('button', { name: 'Confirmar cambios' }).click();

    await page.waitForURL(/stores\/.*\/outfits/);
    const editedOutfit = await page.getByTestId('outfit-card');
    const outfitName = await page.getByRole('heading', { name: 'Outfit Nuevo Editado' });
    await expect(outfitName).toBeVisible();
    await expect(editedOutfit).toBeVisible();
  });

  test('edit outfit products', async ({ page }) => {
    await page.goto(storeUrl + '/outfits');
    const outfit = await page.getByTestId('outfit-card');
    await outfit.getByTestId('outfit-products-link').click();
    await page.waitForURL(/stores\/.*\/outfits\/.*\/products/);

    await page.getByRole('button', { name: 'Añadir' }).click();
    await page.getByRole('button', { name: 'Confirmar cambios' }).click();
    await page.waitForURL(/stores\/.*\/outfits/);

    const editedOutfit = await page.getByTestId('outfit-card');
    const product = await page.getByRole('img', { name: 'Producto 2 Actualizado' });
    await expect(editedOutfit).toBeVisible();
    await expect(product).toBeVisible();
  });

  test('delete outfit', async ({ page }) => {
    await page.goto(storeUrl + '/outfits');
    const outfit = await page.getByTestId('outfit-card');
    await outfit.getByTestId('outfit-delete-button').click();

    const deletedOutfit = await page.getByTestId('outfit-card');
    await expect(deletedOutfit).not.toBeVisible();
  });

  test('sort outfits', async ({ page }) => {
    await page.goto(storeUrl + '/create-outfit');

    await page.getByRole('textbox', { name: 'Nombre' }).click();
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Segundo Outfit');
    await page.getByRole('button', { name: 'Añadir' }).nth(2).click();
    await page.getByRole('button', { name: 'Añadir' }).nth(2).click();
    await page.getByRole('button', { name: 'Crear outfit' }).click();

    await page.waitForURL(/stores\/.*\/outfits/);

    await page
      .locator('div')
      .filter({ hasText: /^Crear outfit$/ })
      .click();
    await page.waitForURL(/stores\/.*\/create-outfit/);

    await page.getByRole('textbox', { name: 'Nombre' }).click();
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Primer Outfit');
    await page.getByRole('button', { name: 'Añadir' }).nth(2).click();
    await page.getByRole('button', { name: 'Añadir' }).nth(2).click();
    await page.getByRole('button', { name: 'Crear outfit' }).click();

    await page.waitForURL(/stores\/.*\/outfits/);

    const firstOutfit = await page.getByTestId('outfit-card').first();
    const secondOutfit = await page.getByTestId('outfit-card').last();
    const firstOutfitName = await firstOutfit.getByRole('heading');
    const secondOutfitName = await secondOutfit.getByRole('heading');
    await expect(firstOutfitName).toHaveText('Segundo Outfit');
    await expect(secondOutfitName).toHaveText('Primer Outfit');

    await page.locator('div').filter({ hasText: 'Ordenar' }).nth(5).click();
    const firstOutfitSorted = await page.getByTestId('outfit-card').first();
    const secondOutfitSorted = await page.getByTestId('outfit-card').last();
    const firstOutfitNameSorted = await firstOutfitSorted.getByRole('heading');
    const secondOutfitNameSorted = await secondOutfitSorted.getByRole('heading');
    await page.locator('div').filter({ hasText: 'Guardar' }).nth(5).click();

    await expect(firstOutfitNameSorted).toHaveText('Segundo Outfit');
    await expect(secondOutfitNameSorted).toHaveText('Primer Outfit');
  });
});
