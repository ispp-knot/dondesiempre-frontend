import { test, expect } from '@playwright/test';
import { TEST_MAP_LOCATION } from './scripts/utils';

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['geolocation']);

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
