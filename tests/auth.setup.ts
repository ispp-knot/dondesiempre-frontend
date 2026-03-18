import { DEFAULT_MAP_LOCATION } from '@/lib/mapUtils';
import { test, expect } from '@playwright/test';

const authClientFile = 'test-public/auth.client.json';

test.beforeEach(async ({ context }) => {
  // Bloquea el registro del Service Worker antes de cargar la página

  await context.grantPermissions(['geolocation']);

  // 3. (Opcional) Forzamos la posición inicial para que el mapa no flote
  await context.setGeolocation({
    latitude: DEFAULT_MAP_LOCATION.lat,
    longitude: DEFAULT_MAP_LOCATION.lng,
  });
});

test.describe.serial('client auth setup', () => {

  test('register of a client successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('cliente@ejemplo.com');
    await page.getByRole('textbox', { name: 'Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).press('Tab');
    await page.getByRole('textbox', { name: 'Confirmar contraseña' }).fill('Password123!');
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('textbox', { name: 'Nombre' }).click();
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Jose');
    await page.getByRole('textbox', { name: 'Nombre' }).press('Tab');
    await page.getByRole('textbox', { name: 'Apellido' }).fill('Cliente');
    await page.getByRole('textbox', { name: 'Apellido' }).press('Tab');
    await page.getByRole('textbox', { name: 'Teléfono' }).fill('123456789');
    await page.getByRole('textbox', { name: 'Teléfono' }).press('Tab');
    await page.getByRole('textbox', { name: 'Dirección' }).fill('Avenida del cliente 2');
    await page.getByRole('button', { name: 'Registrarse' }).click();

    const toast = page.getByText('DondeSiempre¡Registro exitoso');
    await expect(toast).toBeVisible();

    await page.getByRole('link', { name: 'Ir a iniciar sesión' }).click();

    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('test', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('cliente@ejemplo.com');
    await page.getByRole('textbox', { name: 'Contraseña' }).click();
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('Password123!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

    await page.context().storageState({ path: authClientFile });
  });

});