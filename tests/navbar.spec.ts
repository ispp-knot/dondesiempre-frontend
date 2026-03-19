import { DEFAULT_MAP_LOCATION } from '@/lib/mapUtils';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // Bloquea el registro del Service Worker antes de cargar la página

  await context.grantPermissions(['geolocation']);

  // 3. (Opcional) Forzamos la posición inicial para que el mapa no flote
  await context.setGeolocation({
    latitude: DEFAULT_MAP_LOCATION.lat,
    longitude: DEFAULT_MAP_LOCATION.lng,
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

    /*
    const profileName = await page.locator('#radix-_r_1_').getByText('Jose');
    await expect(profileName).toBeVisible();
    */
    await page.getByRole('button', { name: 'Mi perfil' }).click();

    await expect(page).toHaveURL('http://localhost:3000/profile');
    /*
    const profileTest = await page.getByText(`Jose${clientName.split('@')[0]}@ejemplo.`);
    await expect(profileTest).toBeVisible();
    */
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
