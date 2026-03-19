import { test, expect } from '@playwright/test';

test.describe('error tests for search', () => {
  test('test', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const searchBar = await page.getByRole('textbox', { name: 'Buscar tienda por nombre...' });
    await expect(searchBar).toBeVisible();

    await page.getByRole('textbox', { name: 'Buscar tienda por nombre...' }).click();
    await page
      .getByRole('textbox', { name: 'Buscar tienda por nombre...' })
      .fill('Tienda que no existe');

    await expect(await page.getByRole('link', { name: 'Una tienda falsa' })).not.toBeVisible();
  });
});
