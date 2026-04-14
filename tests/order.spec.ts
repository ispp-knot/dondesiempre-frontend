import { test, expect } from '@playwright/test';

let storeUrl: string;
test.describe.serial('orders', () => {
  test.describe.serial('orders with client logged in', () => {
    test.use({ storageState: './tests/scripts/auth.client.json' });
    test('making an order with a product variant', async ({ page }) => {
      await page.goto('http://localhost:3000/search');

      await page.getByRole('button', { name: 'Ir a la tienda' }).click();
      await page.waitForURL(/stores\/.*/);
      storeUrl = page.url();

      const productCard1 = await page.getByTestId('product-card').nth(2);
      await productCard1.click();

      await page.waitForURL(/products\/.*/);

      await page.getByTestId('product-size').getByRole('button', { name: 'S' }).click();
      await page.getByRole('button', { name: 'Blanco' }).click();

      const makeOrderButton = await page.getByTestId('product-order-button');
      await expect(makeOrderButton).toBeVisible();

      await makeOrderButton.click();

      const confirmOrderModal = await page.getByTestId('confirm-order-modal');
      await expect(confirmOrderModal).toBeVisible();

      const confirmOrderButton = await page.getByTestId('confirm-order-button');
      const cancelOrderButton = await page.getByTestId('cancel-order-button');
      await expect(confirmOrderButton).toBeVisible();
      await expect(cancelOrderButton).toBeVisible();

      await confirmOrderButton.click();

      await expect(page.getByTestId('order-success-modal')).toBeVisible();

      await page.goto(storeUrl);

      await productCard1.click();

      await page.waitForURL(/products\/.*/);

      await page.getByTestId('product-size').getByRole('button', { name: 'S' }).click();
      await page.getByRole('button', { name: 'Blanco' }).click();

      await makeOrderButton.click();

      await confirmOrderButton.click();
    });
    test('testing charge the info of an order', async ({ page }) => {
      await page.goto('http://localhost:3000/orders');
      const botonTodos = await page.getByRole('button', { name: 'Todos' });
      const botonPendiente = await page.getByRole('button', { name: 'Pendiente' });
      const botonConfirmado = await page.getByRole('button', { name: 'Confirmado' });
      const botonRecogido = await page.getByRole('button', { name: 'Recogido' });
      const botonRechazado = await page.getByRole('button', { name: 'Rechazado' });

      await expect(botonTodos).toBeVisible();
      await expect(botonPendiente).toBeVisible();
      await expect(botonConfirmado).toBeVisible();
      await expect(botonRecogido).toBeVisible();
      await expect(botonRechazado).toBeVisible();

      await expect(page.getByTestId('order-card').first()).toBeVisible();
      await expect(page.getByTestId('order-card').nth(1)).toBeVisible();
    });
  });

  test.describe.serial('test orders with store logged in', () => {
    test.use({ storageState: './tests/scripts/auth.store.json' });
    test('store aprove the order', async ({ page }) => {
      await page.goto('http://localhost:3000/orders');

      await expect(page.getByRole('button', { name: 'Confirmar' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Rechazar' }).first()).toBeVisible();

      await page.getByRole('button', { name: 'Confirmar' }).first().click();
      await expect(page.getByTestId('order-card').first().getByText('Confirmado')).toBeVisible();

      await page.getByRole('button', { name: 'Rechazar' }).first().click();
      await expect(page.locator('span').filter({ hasText: 'Rechazado' })).toBeVisible();
    });
    test('go to deliver page', async ({ page }) => {
      await page.goto('http://localhost:3000/orders');
      const button = page.getByRole('button', { name: 'Entregar pedido' });
      await expect(button).toBeVisible();
      await button.click();

      await page.waitForURL('http://localhost:3000/orders/deliver');
    });
  });

  test.describe.serial('again client order test', () => {
    test.use({ storageState: './tests/scripts/auth.client.json' });
    test('client see the accepted and denied order from the store', async ({ page }) => {
      await page.goto('http://localhost:3000/orders');
      await expect(page.locator('span').filter({ hasText: 'Confirmado' })).toBeVisible();
      await expect(page.locator('span').filter({ hasText: 'Rechazado' })).toBeVisible();
    });
  });
});
