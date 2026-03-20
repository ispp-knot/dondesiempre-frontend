import { TEST_MAP_LOCATION } from '@/lib/mapUtils';
import { clientName, storeName } from '@/test-public/generator';
import { test, expect } from '@playwright/test';

const authClientFile = 'test-public/auth.client.json';
const authStoreFile = 'test-public/auth.store.json';

test.beforeEach(async ({ context }) => {
  // Bloquea el registro del Service Worker antes de cargar la página

  await context.grantPermissions(['geolocation']);

  // 3. (Opcional) Forzamos la posición inicial para que el mapa no flote
  await context.setGeolocation({
    latitude: TEST_MAP_LOCATION.lat,
    longitude: TEST_MAP_LOCATION.lng,
  });
});

test.describe.serial('client auth setup', () => {
  test('register of a client successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill("client@example.com");
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

  test('login as a client successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill("client@example.com");
    await page.getByRole('textbox', { name: 'Contraseña' }).click();
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('Password123!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

    await page.context().storageState({ path: authClientFile });
  });
});

test.describe.serial('store auth setup', () => {
  test('register of a store successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('button', { name: 'Soy tienda' }).click();
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill("store@example.com");
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).click();
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirmar contraseña' }).click();
    await page.getByRole('textbox', { name: 'Confirmar contraseña' }).fill('Password123!');
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');

    await page.getByRole('textbox', { name: 'Nombre de la tienda' }).click();
    await page.getByRole('textbox', { name: 'Nombre de la tienda' }).fill('Un nombre de tienda');
    await page.getByRole('textbox', { name: 'Dirección' }).click();
    await page.getByRole('textbox', { name: 'Dirección' }).fill('Una dirección de una tienda');
    await page.getByRole('textbox', { name: 'Horario de apertura' }).click();
    await page.getByRole('textbox', { name: 'Horario de apertura' }).fill('Lun-Vier 8:00 a 20:00');
    await page.getByRole('textbox', { name: 'Teléfono' }).click();
    await page.getByRole('textbox', { name: 'Teléfono' }).fill('123456789');
    await page.getByRole('textbox', { name: 'Sobre nosotros' }).click();
    await page.getByRole('textbox', { name: 'Sobre nosotros' }).fill('Somos una tienda de testing');
    await page.getByRole('switch', { name: 'Acepta envíos' }).click();
    await page.getByRole('textbox', { name: 'Color primario' }).click();
    await page.getByRole('textbox', { name: 'Color primario' }).fill('#532508');
    await page.getByRole('textbox', { name: 'Color secundario' }).click();
    await page.getByRole('textbox', { name: 'Color secundario' }).fill('#124568');
    await page.getByRole('button', { name: 'Registrarse' }).click();

    const toast = page.getByText('DondeSiempre¡Registro exitoso');
    await expect(toast).toBeVisible();

    await page.getByRole('link', { name: 'Ir a iniciar sesión' }).click();

    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('login as a store successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill("store@example.com");
    await page.getByRole('textbox', { name: 'Contraseña' }).click();
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('Password123!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });

    await page.context().storageState({ path: authStoreFile });
  });
});
