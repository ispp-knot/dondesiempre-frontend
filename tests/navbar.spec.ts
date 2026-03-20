import { test, expect } from '@playwright/test';
import { TEST_MAP_LOCATION } from './scripts/generator';

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['geolocation']);

  await context.setGeolocation({
    latitude: TEST_MAP_LOCATION.lat,
    longitude: TEST_MAP_LOCATION.lng,
  });
});

test.describe.serial('public navbar', () => {
  test('navbar to search page', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');
    await page.getByRole('link', { name: 'Tiendas' }).click();

    await expect(page).toHaveURL('http://localhost:3000/search');
  });

  test('navbar to map page', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const searchBar = await page.getByRole('textbox', { name: 'Buscar tienda por nombre...' });
    await expect(searchBar).toBeVisible();

    await page.getByRole('link', { name: 'Mapa' }).click();
    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

    await expect(page).toHaveURL('http://localhost:3000/stores');
  });
});

test.describe.serial('private navbar', () => {
  test.use({ storageState: 'test-public/auth.client.json' });

  test('navbar to followed stores page', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');
    await page.getByRole('img').nth(1).click();

    await expect(page).toHaveURL('http://localhost:3000/following');
  });

  test('navbar to deliveries page', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');
    await page.getByRole('img').nth(2).click();

    await expect(page).toHaveURL('http://localhost:3000/orders');
  });

  test('navbar to profile page', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');
    await page.getByRole('button', { name: 'Usuario' }).click();

    await page.getByRole('button', { name: 'Mi perfil' }).click();

    await expect(page).toHaveURL('http://localhost:3000/profile');
  });

  test('logout', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Usuario' }).click();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL('http://localhost:3000/login');
  });
});
