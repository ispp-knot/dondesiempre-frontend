import { test, expect } from '@playwright/test';

test.describe.serial('search page', () => {
  test('search in the search bar for a store', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const searchBar = await page.getByRole('textbox', { name: 'Buscar tienda por nombre...' });
    await expect(searchBar).toBeVisible();
    await searchBar.fill('Un nombre');

    const storeLink = await page.getByRole('link', { name: 'Un nombre de tienda Lun-Vier' }).first();
    await expect(storeLink).toBeVisible();
  });

  test('going to a store through search', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const searchBar = await page.getByRole('textbox', { name: 'Buscar tienda por nombre...' });
    await expect(searchBar).toBeVisible();

    const storeLink = await page.getByRole('link', { name: 'Un nombre de tienda Lun-Vier' }).first();
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);

    const storeName = await page.getByText('Un nombre de tienda');
    const storeAddress = await page.getByText('Una dirección de una tienda');
    const storeHours = await page.getByText('Lun-Vier 8:00 a 20:');
    await expect(storeName).toBeVisible();
    await expect(storeAddress).toBeVisible();
    await expect(storeHours).toBeVisible();
  });
});
