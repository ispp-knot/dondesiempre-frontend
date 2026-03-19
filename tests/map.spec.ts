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

test.describe('Map tests', () => {
  test('go to a store from map', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

    await page
      .locator('div')
      .filter({ hasText: /^Roire$/ })
      .first()
      .click();

    const store = await page.getByRole('link', { name: 'Roire Roire Lun-Vie 10:00-13:' });
    await expect(store).toBeVisible();

    await page.getByRole('link', { name: 'Roire Roire Lun-Vie 10:00-13:' }).click();

    await page.waitForURL(/stores\/.*/);

    const storeName = await page.getByText('Roire');
    const storeAddress = await page.getByText('C. San Sebastián, 15, 41701');
    const storeHours = await page.getByText('Lun-Vie 10:00-13:45, 17:30-21');
    await expect(storeName).toBeVisible();
    await expect(storeAddress).toBeVisible();
    await expect(storeHours).toBeVisible();
  });
});
