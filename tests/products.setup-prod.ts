import { test, expect } from '@playwright/test';

let storeUrl: string;
let productUrl: string;

test.describe.serial('test products', () => {
  test.describe.serial('test products as a store', () => {
    test.use({ storageState: './tests/scripts/auth.store.json' });
    test('going to the product creation page', async ({ page }) => {
      await page.goto('http://localhost:3000/search');

      const storeLink = await page
        .getByRole('link', { name: 'Un nombre de tienda Lun-Vier' })
        .first();
      await storeLink.click();

      await page.waitForURL(/stores\/.*/);
      storeUrl = page.url();

      const createProductButton = await page.getByTestId('create-product-button');
      await expect(createProductButton).toBeVisible();

      await createProductButton.click();

      await page.waitForURL(storeUrl + '/create-product');

      const productName = await page.getByTestId('product-name-input');
      const productDescription = await page.getByTestId('product-description-input');
      const productImage = await page.getByTestId('product-image-input');
      const productPrice = await page.getByTestId('product-price-input');
      const productCategory = await page.getByTestId('product-cat-input');
      const productSubmitButton = await page.getByTestId('product-submit-button');

      await expect(productName).toBeVisible();
      await expect(productDescription).toBeVisible();
      await expect(productImage).toBeVisible();
      await expect(productPrice).toBeVisible();
      await expect(productCategory).toBeVisible();
      await expect(productSubmitButton).toBeVisible();
    });
    test('create products', async ({ page }) => {
      await page.goto(storeUrl + '/create-product');

      await page.waitForURL(storeUrl + '/create-product');
      await page.getByTestId('product-name-input').click();
      await page.getByTestId('product-name-input').fill('Producto 1');
      await page.getByTestId('product-description-input').click();
      await page.getByTestId('product-description-input').fill('Descripción');
      await page.getByTestId('product-price-input').click();
      await page.getByTestId('product-price-input').fill('10.0');
      await page
        .getByTestId('product-image-input')
        .locator('input[type="file"]')
        .setInputFiles('tests/scripts/foto-pantalon.jpg');
      await page.getByTestId('product-cat-input').selectOption({ label: 'Pantalón' });
      await page.getByTestId('product-submit-button').click();

      await page.waitForURL(storeUrl);

      const productCard1 = await page.getByTestId('product-card').first();
      await expect(productCard1).toBeVisible();

      await page.getByRole('link', { name: 'Crear producto' }).click();

      await page.getByTestId('product-name-input').click();
      await page.getByTestId('product-name-input').fill('Producto 2');
      await page.getByTestId('product-description-input').click();
      await page.getByTestId('product-description-input').fill('Segunda Descripción');
      await page.getByTestId('product-price-input').click();
      await page.getByTestId('product-price-input').fill('20.5');
      await page.getByTestId('product-cat-input').selectOption({ label: 'Camiseta' });
      await page.getByTestId('product-submit-button').click();

      await page.waitForURL(storeUrl);

      const productCard2 = await page.getByTestId('product-card').nth(1);
      await expect(productCard2).toBeVisible();

      await page.getByRole('link', { name: 'Crear producto' }).click();

      await page.waitForURL(storeUrl + '/create-product');
      await page.getByTestId('product-name-input').click();
      await page.getByTestId('product-name-input').fill('Producto 3');
      await page.getByTestId('product-description-input').click();
      await page.getByTestId('product-description-input').fill('Tercera Descripción');
      await page.getByTestId('product-price-input').click();
      await page.getByTestId('product-price-input').fill('30.0');
      await page
        .getByTestId('product-image-input')
        .locator('input[type="file"]')
        .setInputFiles('tests/scripts/foto-pantalon.jpg');
      await page.getByTestId('product-cat-input').selectOption({ label: 'Pantalón' });
      await page.getByTestId('product-submit-button').click();

      await page.waitForURL(storeUrl);

      await page.getByRole('link', { name: 'Crear producto' }).click();

      await page.waitForURL(storeUrl + '/create-product');
      await page.getByTestId('product-name-input').click();
      await page.getByTestId('product-name-input').fill('Producto 4');
      await page.getByTestId('product-description-input').click();
      await page.getByTestId('product-description-input').fill('Cuarta Descripción');
      await page.getByTestId('product-price-input').click();
      await page.getByTestId('product-price-input').fill('25.2');
      await page
        .getByTestId('product-image-input')
        .locator('input[type="file"]')
        .setInputFiles('tests/scripts/foto-zapatos.jpg');
      await page.getByTestId('product-cat-input').selectOption({ label: 'Zapatos' });
      await page.getByTestId('product-submit-button').click();

      await page.waitForURL(storeUrl);
    });

    test('test seen info of a product', async ({ page }) => {
      await page.goto(storeUrl);
      await page.getByTestId('product-card').nth(1).click();

      await page.waitForURL(/products\/.*/);

      productUrl = page.url();

      const productName = await page.getByTestId('product-desktop-name');
      const productPrice = await page.getByTestId('product-price');
      const productDescription = await page.getByTestId('product-description');
      const productImage = await page.getByTestId('product-image');
      const productVariantManagement = await page.getByTestId('product-variants-list');

      await expect(productName).toBeVisible();
      await expect(productPrice).toBeVisible();
      await expect(productDescription).toBeVisible();
      await expect(productImage).toBeVisible();
      await expect(productVariantManagement).toBeVisible();
    });

    test('Create variants of a product', async ({ page }) => {
      await page.goto(productUrl);

      const createVariant = await page.getByTestId('create-variant');
      await expect(createVariant).toBeVisible();

      createVariant.click();
      const dialogCreateVariant = await page.getByTestId('dialog-variant');
      await expect(dialogCreateVariant).toBeVisible();

      const dialogTitle = await page.getByTestId('title-new-variant');
      const sizeList = await page.getByTestId('size-list');

      const sizeXS = await page.getByTestId('size-XS');
      const sizeS = await page.getByTestId('size-S');
      const sizeM = await page.getByTestId('size-M');
      const sizeL = await page.getByTestId('size-L');
      const sizeXL = await page.getByTestId('size-XL');
      const sizeXXL = await page.getByTestId('size-XXL');

      const colorList = await page.getByTestId('color-list');
      const colorBlack = await page.getByTestId('color-Negro');
      const colorWhite = await page.getByTestId('color-Blanco');
      const colorRed = await page.getByTestId('color-Rojo');
      const colorBlue = await page.getByTestId('color-Azul');
      const colorGreen = await page.getByTestId('color-Verde');
      const colorPink = await page.getByTestId('color-Rosa');
      const colorGrey = await page.getByTestId('color-Gris');
      const colorBeige = await page.getByTestId('color-Beige');

      const availability = await page.getByTestId('data-disp');

      const cancelButton = await page.getByTestId('cancel-button');
      const submitButton = await page.getByTestId('submit-button');

      await expect(dialogTitle).toBeVisible();

      await expect(sizeList).toBeVisible();
      await expect(sizeXS).toBeVisible();
      await expect(sizeS).toBeVisible();
      await expect(sizeM).toBeVisible();
      await expect(sizeL).toBeVisible();
      await expect(sizeXL).toBeVisible();
      await expect(sizeXXL).toBeVisible();

      await expect(colorList).toBeVisible();
      await expect(colorBlack).toBeVisible();
      await expect(colorWhite).toBeVisible();
      await expect(colorRed).toBeVisible();
      await expect(colorBlue).toBeVisible();
      await expect(colorGreen).toBeVisible();
      await expect(colorPink).toBeVisible();
      await expect(colorGrey).toBeVisible();
      await expect(colorBeige).toBeVisible();

      await expect(availability).toBeVisible();

      await expect(cancelButton).toBeVisible();
      await expect(submitButton).toBeVisible();

      await page.getByTestId('size-S').click();
      await page.getByTestId('color-Rojo').click();

      await submitButton.click();

      await expect(dialogCreateVariant).not.toBeVisible();

      createVariant.click();

      await page.getByTestId('size-S').click();
      await page.getByTestId('color-Blanco').click();

      await submitButton.click();

      const productVariant = await page.getByTestId('product-variants');
      await expect(productVariant).toBeVisible();

      await expect(
        page.getByTestId('product-size').getByRole('button', { name: 'S' })
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Rojo' })).toBeVisible();

      await page.getByTestId('product-size').getByRole('button', { name: 'S' }).click();
      await page.getByRole('button', { name: 'Rojo' }).click();
    });

    test('manage availability of a variant', async ({ page }) => {
      await page.goto(productUrl);
      const manageVariantButton = await page.getByTestId('allow-variant');
      await expect(manageVariantButton).toBeVisible();

      await manageVariantButton.click();

      const availabilityDialog = await page.getByTestId('availability-dialog');
      await expect(availabilityDialog).toBeVisible();

      const updateButton = await page.getByTestId('update-button');
      const cancelButton = await page.getByTestId('cancel-button');

      await expect(updateButton).toBeVisible();
      await expect(cancelButton).toBeVisible();

      await expect(page.getByRole('switch').first()).toBeVisible();
      await page.getByRole('switch').first().click();

      await updateButton.click();
      await expect(availabilityDialog).not.toBeVisible();
    });

    test('deleting a variant', async ({ page }) => {
      await page.goto(productUrl);
      const deleteVariantsButton = await page.getByTestId('delete-variants');
      const manageVariantsButton = await page.getByTestId('allow-variant');

      await expect(deleteVariantsButton).toBeVisible();
      await expect(manageVariantsButton).toBeVisible();

      await deleteVariantsButton.click();
      const deleteDialog = await page.getByTestId('delete-dialog');

      await expect(deleteDialog).toBeVisible();

      const selectAllDelete = await page.getByTestId('select-all');
      await expect(selectAllDelete).toBeVisible();

      await expect(
        page.locator('label').filter({ hasText: 'Talla: S · Color:' }).first()
      ).toBeVisible();
      await page.locator('label').filter({ hasText: 'Talla: S · Color:' }).first().click();

      const cancelButton = await page.getByTestId('cancel-button');
      const deleteButton = await page.getByTestId('delete-button');

      await expect(cancelButton).toBeVisible();
      await expect(deleteButton).toBeVisible();

      await deleteButton.click();
      await expect(deleteDialog).not.toBeVisible();
    });
    test('editing product', async ({ page }) => {
      await page.goto(productUrl);

      await page.getByTestId('product-edit-button').click();

      await page.waitForURL(productUrl + '/edit');

      await page.getByTestId('product-edit-name-input').click();
      await page.getByRole('textbox', { name: 'Nombre' }).fill('Producto 2 Actualizado');
      await page.getByTestId('product-edit-description-input').click();
      await page
        .getByRole('textbox', { name: 'Descripción' })
        .fill('Segunda Descripción Actualizada');
      await page
        .getByTestId('product-edit-image-input')
        .locator('input[type="file"]')
        .setInputFiles('tests/scripts/foto-camiseta.jpg');
      await page.getByTestId('product-edit-price-input').click();
      await page.getByTestId('product-edit-price-input').click();
      await page.getByTestId('product-edit-price-input').fill('15.0');
      await page.getByTestId('product-edit-cat-input').selectOption({ label: 'Camiseta' });
      await page.getByTestId('product-edit-discount-input').click();
      await page.getByTestId('product-edit-discount-input').fill('2');
      await page.getByTestId('product-edit-submit-button').click();

      await page.waitForURL(productUrl);
    });
    test('deleting product', async ({ page }) => {
      await page.goto(storeUrl);

      await page.waitForURL(storeUrl);

      await page.getByTestId('product-card').nth(1).click();

      await page.waitForURL(/products\/.*/);
      const deleteButton = await page.getByTestId('product-delete-button');
      await expect(deleteButton).toBeVisible();

      await page.getByTestId('product-delete-button').click();

      await page.waitForURL(storeUrl);

      const deletedProduct = await page.getByTestId('product-card').nth(3);
      await expect(deletedProduct).not.toBeVisible();
    });
  });

  test.describe.serial('test products as a client', () => {
    test.use({ storageState: './tests/scripts/auth.client.json' });
    test('seeing products of a store', async ({ page }) => {
      await page.goto('http://localhost:3000/search');

      const storeLink = await page.getByTestId('store-card').first();
      await storeLink.getByRole('button', { name: 'Ir a la tienda' }).click();

      await page.waitForURL(/stores\/.*/);
      storeUrl = page.url();

      const productCard1 = await page.getByRole('img', { name: 'Producto 1' });
      const productCard2 = await page.getByTestId('product-card').nth(1);

      await expect(productCard1).toBeVisible();
      await expect(productCard2).toBeVisible();
    });
    test('seeing the info of a product', async ({ page }) => {
      await page.goto(storeUrl);

      const productCard1 = await page.getByTestId('product-card').nth(2);
      await productCard1.click();

      await page.waitForURL(/products\/.*/);

      const productName = await page.getByTestId('product-desktop-name');
      const productPrice = await page.getByTestId('product-price');
      const productDescription = await page.getByTestId('product-description');
      const productImage = await page.getByTestId('product-image');

      await expect(productName).toBeVisible();
      await expect(productPrice).toBeVisible();
      await expect(productDescription).toBeVisible();
      await expect(productImage).toBeVisible();
    });

    test('seeing the variants of a product', async ({ page }) => {
      await page.goto(storeUrl);

      const productCard1 = await page.getByTestId('product-card').nth(2);
      await productCard1.click();

      await page.waitForURL(/products\/.*/);

      const productVariant = await page.getByTestId('product-variants');
      await expect(productVariant).toBeVisible();

      await expect(
        page.getByTestId('product-size').getByRole('button', { name: 'S' })
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Blanco' })).toBeVisible();
    });
  });
});
