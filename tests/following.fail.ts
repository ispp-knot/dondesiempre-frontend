import { test, expect } from '@playwright/test';
import { TEST_MAP_LOCATION } from './scripts/utils';

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['geolocation']);

  await context.setGeolocation({
    latitude: TEST_MAP_LOCATION.lat,
    longitude: TEST_MAP_LOCATION.lng,
  });
});

test.describe.serial('failures store logged in', () => {
  test.use({ storageState: './tests/scripts/auth.store.json' });
  test('Fail going to following page', async ({ page }) => {
    await page.goto('http://localhost:3000/following');

    await expect(page).toHaveURL('http://localhost:3000/stores');
  });

  test('Follow button not visible in map', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 30000 });

    await page.getByTestId('store-pin').first().click();

    // const store = await page.getByRole('link', { name: 'Un nombre de tienda Lun-Vier' });
    // await expect(store).toBeVisible({ timeout: 1000 });

    const followButton = await page.getByTestId('follow-button');
    await expect(followButton).toBeHidden();
  });

  test('Follow button not visible in store page', async ({ page }) => {
    await page.goto('http://localhost:3000/search');
    const storeLink = await page
      .getByRole('link', { name: 'Un nombre de tienda Lun-Vier' })
      .first();
    await expect(storeLink).toBeVisible();
    await storeLink.click();
    await page.waitForURL(/stores\/.*/);
    const followButton = await page.getByRole('button', { name: 'Seguir' });
    await expect(followButton).toBeHidden();
  });
});

test.describe.serial('failures as not logged in', () => {
  test('Fail going to following page', async ({ page }) => {
    await page.goto('http://localhost:3000/following');

    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('Follow button not visible in map', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 30000 });

    await page.getByTestId('store-pin').first().click();

    // const store = await page.getByRole('link', { name: 'Un nombre de tienda Lun-Vier' });
    // await expect(store).toBeVisible({ timeout: 1000 });

    const followButton = await page.getByRole('button', { name: 'Dejar de seguir' });
    await expect(followButton).toBeHidden();
  });

  test('Follow button not visible in store page', async ({ page }) => {
    await page.goto('http://localhost:3000/search');
    const storeLink = await page
      .getByRole('link', { name: 'Un nombre de tienda Lun-Vier' })
      .first();
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);
    const followButton = await page.getByRole('button', { name: 'Seguir' });
    await expect(followButton).toBeHidden();
  });
});
