import { DEFAULT_MAP_LOCATION } from '@/lib/mapUtils';
import { test, expect } from '@playwright/test';
import { time } from 'console';

test.beforeEach(async ({ context }) => {
  // Bloquea el registro del Service Worker antes de cargar la página

  await context.grantPermissions(['geolocation']);

  // 3. (Opcional) Forzamos la posición inicial para que el mapa no flote
  await context.setGeolocation({
    latitude: DEFAULT_MAP_LOCATION.lat,
    longitude: DEFAULT_MAP_LOCATION.lng,
  });
});

test.describe.serial('follow store from map', () => {
  test.use({ storageState: 'test-public/auth.client.json' });
  test('follow store from map', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 30000 });
    await page
      .locator('div')
      .filter({ hasText: /^Roire$/ })
      .first()
      .click();

    const store = await page.getByRole('link', { name: 'Roire Roire Lun-Vie 10:00-13:' });
    await expect(store).toBeVisible();

    await page.getByRole('button', { name: 'Seguir' }).click();
    await page.getByRole('img').nth(1).click();
    await expect(page).toHaveURL('http://localhost:3000/following');
  });

  test('following site is updated when following a store from the map', async ({ page }) => {
    await page.goto('http://localhost:3000/following');

    const followedStoreName = await page.getByText('Roire📍 C. San Sebastián, 15');
    const followedStoreAddress = await page.getByText('📍 C. San Sebastián, 15,');
    const followedStoreHours = await page.getByText('Horario: Lun-Vie 10:00-13:45');
    const followedStoreEmail = await page.getByText('Email: demo@roire.es');
    await expect(followedStoreName).toBeVisible();
    await expect(followedStoreAddress).toBeVisible();
    await expect(followedStoreHours).toBeVisible();
    await expect(followedStoreEmail).toBeVisible();
  });

  test('go to a store from following page', async ({ page }) => {
    await page.goto('http://localhost:3000/following');

    await page.getByRole('button', { name: 'Ir a la tienda' }).click();
    await page.waitForURL(/stores\/.*/);

    const storeName = await page.getByText('Roire');
    await expect(storeName).toBeVisible({ timeout: 10000 });
  });

  test('unfollow store and empty following page', async ({ page }) => {
    await page.goto('http://localhost:3000/following');

    await page.getByRole('button', { name: 'Dejar de seguir' }).click({ timeout: 10000 });

    page.reload();
    await page.waitForURL(/following/);

    const notFollowingStores = await page.getByText('¡Vaya!No hay tiendas que');
    await expect(notFollowingStores).toBeVisible();
  });
});
