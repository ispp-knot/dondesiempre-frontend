import test from '@playwright/test';

const authFile = 'test-public/auth.user.json';

test('authenticate', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('ejemplo@gmail.com');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('-Contraseña9');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  // Espera a que la app esté realmente cargada (ej. ver el dashboard)
  await page.waitForURL('http://localhost:3000/stores');

  // Guarda el estado (cookies y local storage) en un archivo
  await page.context().storageState({ path: authFile });
});