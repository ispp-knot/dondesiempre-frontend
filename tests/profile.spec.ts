import { test, expect } from '@playwright/test';
test.describe.serial('profile tests', () => {
  test.use({ storageState: './tests/scripts/auth.store.json' });
  test('go to store from profile', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');
    await page.getByRole('button', { name: 'Mi tienda' }).click();

    await page.waitForURL(/stores\/.*/);

    await expect(page.url()).toMatch(/stores\/.*/);
  });

  test('go to store from navbar', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');
    await page.getByRole('button', { name: 'Usuario' }).click();
    await page.getByRole('link', { name: 'Mi tienda' }).click();
    await page.waitForURL(/stores\/.*/);
    await expect(page.url()).toMatch(/stores\/.*/);
  });
  test('go to pricing from profile', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');
    await page.getByRole('button', { name: 'Planes y precios' }).click();
    await page.waitForURL('http://localhost:3000/pricing');
  });
  test('change password from profile', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');
    await page.getByRole('button', { name: 'Cambiar contraseña' }).click();

    await expect(page.getByRole('dialog', { name: 'Cambiar contraseña' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('dialog', { name: 'Cambiar contraseña' })).not.toBeVisible();
    await page.getByRole('button', { name: 'Cambiar contraseña' }).click();

    await page.getByRole('textbox', { name: 'Contraseña actual' }).click();
    await page.getByRole('textbox', { name: 'Contraseña actual' }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Nueva contraseña', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Nueva contraseña', exact: true })
      .fill('NuevaPassword123!');
    await page.getByRole('textbox', { name: 'Repite la nueva contraseña' }).click();
    await page
      .getByRole('textbox', { name: 'Repite la nueva contraseña' })
      .fill('NuevaPassword123!');
    await page.getByRole('button', { name: 'Actualizar' }).click();
    await expect(page.getByRole('dialog', { name: 'Cambiar contraseña' })).not.toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.waitForURL('http://localhost:3000/login');

    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('store@example.com');
    await page.getByRole('textbox', { name: 'Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('Password123!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText('Credenciales incorrectos.')).toBeVisible();
    await page.getByRole('textbox', { name: 'Contraseña' }).click();
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('NuevaPassword123!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await page.context().grantPermissions(['geolocation']);

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 10000 });
  });
});
