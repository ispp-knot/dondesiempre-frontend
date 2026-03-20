import { TEST_MAP_LOCATION } from '@/lib/mapUtils';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // Bloquea el registro del Service Worker antes de cargar la página

  await context.grantPermissions(['geolocation']);

  // 3. (Opcional) Forzamos la posición inicial para que el mapa no flote
  await context.setGeolocation({
    latitude: TEST_MAP_LOCATION.lat,
    longitude: TEST_MAP_LOCATION.lng,
  });
});

test.describe('Map tests', () => {
  test('go to a store from map', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

    await page.getByTestId('store-pin').first().click();

    const store = await page.getByRole('link', { name: 'Un nombre de tienda Lun-Vier' });
    await expect(store).toBeVisible();

    await page.getByRole('link', { name: 'Un nombre de tienda Lun-Vier' }).click();

    await page.waitForURL(/stores\/.*/);

    const storeName = await page.getByText('Un nombre de tienda');
    const storeAddress = await page.getByText('Una dirección de una tienda');
    const storeHours = await page.getByText('Lun-Vier 8:00 a 20:');
    await expect(storeName).toBeVisible();
    await expect(storeAddress).toBeVisible();
    await expect(storeHours).toBeVisible();
  });
});
