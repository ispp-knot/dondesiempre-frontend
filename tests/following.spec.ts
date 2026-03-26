import { test, expect } from '@playwright/test';
import { TEST_MAP_LOCATION } from './scripts/utils';

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['geolocation']);

  await context.setGeolocation({
    latitude: TEST_MAP_LOCATION.lat,
    longitude: TEST_MAP_LOCATION.lng,
  });
});

test.describe.serial('follow store from map', () => {
  test.use({ storageState: './tests/scripts/auth.client.json' });
  test('follow store from map', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 30000 });
    await page.getByTestId('store-pin').first().click();

    const store = await page.getByRole('link', { name: 'Un nombre de tienda Lun-Vier' });
    await expect(store).toBeVisible();

    await page.getByRole('button', { name: 'Seguir' }).click();
    await page.getByRole('img').nth(1).click();
    await expect(page).toHaveURL('http://localhost:3000/following');
  });

  test('following site is updated when following a store from the map', async ({ page }) => {
    await page.goto('http://localhost:3000/following');

    const followedStoreName = await page.getByRole('heading', { name: 'Un nombre de tienda' });
    const followedStoreAddress = await page.getByText('Una dirección de una tienda');
    const followedStoreHours = await page.getByText('Lun-Vier 8:00 a 20:');
    await expect(followedStoreName).toBeVisible();
    await expect(followedStoreAddress).toBeVisible();
    await expect(followedStoreHours).toBeVisible();
  });

  test('go to a store from following page', async ({ page }) => {
    await page.goto('http://localhost:3000/following');

    await page.getByRole('button', { name: 'Ir a la tienda' }).click();
    await page.waitForURL(/stores\/.*/);

    const storeName = await page.getByText('Un nombre de tienda');
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
