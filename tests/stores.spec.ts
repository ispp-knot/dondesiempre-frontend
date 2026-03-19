import { test, expect } from '@playwright/test';

let storeUrl: string;

test.describe.serial('search page', () => {
  test('display store from search', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const storeLink = await page.getByRole('link', { name: 'Bazar Romera Bazar Romera Lun' });
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);
    storeUrl = page.url();
  });

  test('the store displays name and principal information', async ({ page }) => {
    await page.goto(storeUrl);

    const storeImage = await page.locator('img').nth(1);
    const storeName = await page.getByText('Bazar Romera');
    const storeAddress = await page.getByText('C. Romera, 8, 41701 Dos');
    const storeHours = await page.getByText('Lun-Vie: 9:00-14:00, 17:00-21');
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
});
