import { test, expect } from '@playwright/test';

/*
test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.context().grantPermissions(['geolocation']);
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
*/
test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/stores');
  await page.context().grantPermissions(['geolocation']);

  await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Map marker' }).nth(4).click();
  await page.getByRole('heading', { name: 'Moda Urbana Sevilla' }).click();
});
