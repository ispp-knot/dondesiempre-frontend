import { test, expect } from '@playwright/test';

let storeUrl: string;
test.describe.serial('orders', () => {
  test.use({ storageState: './tests/scripts/auth.client.json' });
  test('test client making an order', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    const storeLink = await page
      .getByRole('link', { name: 'Un nombre de tienda Lun-Vier' })
      .first();
    await expect(storeLink).toBeVisible();
    await storeLink.click();

    await page.waitForURL(/stores\/.*/);
    storeUrl = page.url();

    await page.getByRole('link', { name: 'Ver más' }).click();

    await page.waitForURL(/stores\/.*\/outfits/);

    await page.getByTestId('outfit-card').first().click();
    await page.getByRole('link', { name: 'Ver más' }).click();
    await page.getByRole('button', { name: 'Hacer pedido' }).click();
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await page.getByRole('link', { name: 'Ver mis pedidos' }).click();
    await page.waitForURL(/orders/);

    const order = await page.getByText(
      '8RLK-E39W-VMVO Confecciones y Hogar San Sebastián 6/4/2026Pendiente1xAlbornoz'
    );

    await expect(order).toBeVisible();
  });
});
