import { test, expect } from '@playwright/test';

let storeUrl: string;

test.describe.serial('search page', () => {
  test.use({ storageState: './tests/scripts/auth.store.json' });
  test('display store from search', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const storeLink = await page
      .getByRole('link', { name: 'Un nombre de tienda Lun-Vier' })
      .first();
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);
    storeUrl = page.url();
  });

  test('the store displays name and principal information', async ({ page }) => {
    await page.goto(storeUrl);

    const storeImage = await page.locator('img').nth(1);
    const storeName = await page.getByText('Un nombre de tienda');
    const storeAddress = await page.getByText('Una dirección de una tienda');
    const storeHours = await page.getByText('Lun-Vier 8:00 a 20:');
    await expect(storeImage).toBeVisible();
    await expect(storeName).toBeVisible();
    await expect(storeAddress).toBeVisible();
    await expect(storeHours).toBeVisible();
  });

  test('the store displays options of the store', async ({ page }) => {
    await page.goto(storeUrl);

    const storeButton = await page.getByText('CatálogoSobre nosotrosOpciones');
    const storeCatalog = await page.getByRole('button', { name: 'Catálogo' });
    const storeAboutUs = await page.getByRole('button', { name: 'Sobre nosotros' });
    const storeOptions = await page.getByRole('button', { name: 'Opciones' });

    await expect(storeButton).toBeVisible();
    await expect(storeOptions).toBeVisible();
    await expect(storeCatalog).toBeVisible();
    await expect(storeAboutUs).toBeVisible();
  });
  test('update a store info', async ({ page }) => {
    await page.goto(storeUrl);

    await expect(page.getByRole('button', { name: 'Editar tienda' })).toBeVisible();

    await page.getByRole('button', { name: 'Editar tienda' }).click();

    await page.getByRole('textbox', { name: 'Dirección' }).click();
    await page
      .getByRole('textbox', { name: 'Dirección' })
      .fill('Una dirección de una tienda actualizado');
    await page.getByRole('textbox', { name: 'Sobre nosotros' }).click();
    await page
      .getByRole('textbox', { name: 'Sobre nosotros' })
      .fill('Somos una tienda de testing actualizada');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
  });
  test('add social media links to store', async ({ page }) => {
    await page.goto(storeUrl);

    await expect(page.getByRole('button', { name: 'Editar redes' })).toBeVisible();
    await page.getByRole('button', { name: 'Editar redes' }).click();

    await expect(page.getByRole('dialog', { name: 'Redes sociales' })).toBeVisible();
    await page.getByRole('combobox').selectOption('Facebook');
    await page.getByRole('textbox', { name: 'Enlace o teléfono' }).fill('https://www.facebook.com');
    await page.getByTestId('add-social-media').click();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog', { name: 'Redes sociales' })).not.toBeVisible();

    await expect(page.getByRole('link', { name: 'Facebook' })).toBeVisible();
  });
});
