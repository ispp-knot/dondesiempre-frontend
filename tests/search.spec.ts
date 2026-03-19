import { test, expect } from '@playwright/test';

test.describe.serial('search page', () => {
  test('search in the search bar for a store', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const searchBar = await page.getByRole('textbox', { name: 'Buscar tienda por nombre...' });
    await expect(searchBar).toBeVisible();
    await searchBar.fill('Bazar Romera');

    const storeLink = await page.getByRole('link', { name: 'Bazar Romera Bazar Romera Lun' });
    await expect(storeLink).toBeVisible();
  });

  test('going to a store through search', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const searchBar = await page.getByRole('textbox', { name: 'Buscar tienda por nombre...' });
    await expect(searchBar).toBeVisible();

    const storeLink = await page.getByRole('link', { name: 'Bazar Romera Bazar Romera Lun' });
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);

    const storeName = await page.getByText('Bazar Romera');
    const storeAddress = await page.getByText('C. Romera, 8, 41701 Dos');
    const storeHours = await page.getByText('Lun-Vie: 9:00-14:00, 17:00-21');
    await expect(storeName).toBeVisible();
    await expect(storeAddress).toBeVisible();
    await expect(storeHours).toBeVisible();
  });
});
