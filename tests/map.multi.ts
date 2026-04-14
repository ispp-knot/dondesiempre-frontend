import { test, expect } from '@playwright/test';
import { TEST_MAP_LOCATION_2 } from './scripts/utils';

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['geolocation']);

  await context.setGeolocation({
    latitude: TEST_MAP_LOCATION_2.lat,
    longitude: TEST_MAP_LOCATION_2.lng,
  });
});

test('reduction of stores in map', async ({ page }) => {
  await page.goto('http://localhost:3000/register');
  await page.getByRole('button', { name: 'Soy tienda' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('store2@example.com');
  await page.getByRole('textbox', { name: 'Contraseña', exact: true }).click();
  await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Password123!');
  await page.getByRole('textbox', { name: 'Confirmar contraseña' }).click();
  await page.getByRole('textbox', { name: 'Confirmar contraseña' }).fill('Password123!');
  await page.getByRole('button', { name: 'Siguiente' }).click();

  page.context().grantPermissions(['geolocation']);

  await page.waitForLoadState('networkidle');

  await page.getByRole('textbox', { name: 'Nombre de la tienda' }).click();
  await page.getByRole('textbox', { name: 'Nombre de la tienda' }).fill('Tienda 2');
  await page.getByRole('textbox', { name: 'Dirección' }).click();
  await page.getByRole('textbox', { name: 'Dirección' }).fill('Avenida');
  await page.getByRole('textbox', { name: 'Horario de apertura' }).click();
  await page.getByRole('textbox', { name: 'Horario de apertura' }).fill('Lun-Viern');
  
  await page.getByRole('textbox', { name: 'Sobre nosotros' }).click();
  await page.getByRole('textbox', { name: 'Sobre nosotros' }).fill('Info');

  await page.getByRole('button', { name: 'Registrarse' }).click();

  await page.getByRole('link', { name: 'Ir a iniciar sesión' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('store2@example.com');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Password123!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await page.waitForURL('http://localhost:3000/stores');

  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

  await expect(page.getByTestId('store-pin').nth(0)).not.toBeVisible();
  await expect(page.getByTestId('store-pin').nth(1)).not.toBeVisible();

  await expect(page.getByRole('button', { name: '2' })).toBeVisible();
  await page.getByRole('button', { name: '2' }).click();

  await expect(page.getByRole('button', { name: '2' })).not.toBeVisible();
  await expect(page.getByTestId('store-pin').nth(0)).toBeVisible();
  await expect(page.getByTestId('store-pin').nth(1)).toBeVisible();
});
