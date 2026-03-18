import { test, expect } from '@playwright/test';

const authClientFile = 'test-public/auth.client.json';


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

  await page.context().storageState({ path: authClientFile });
});