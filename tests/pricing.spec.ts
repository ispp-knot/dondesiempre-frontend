import { test, expect } from '@playwright/test';

test.describe.serial('pricing tests', () => {
  test.use({ storageState: './tests/scripts/auth.client.json' });

  test('pricing page loads all info correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');

    const pageTitle = await page.getByTestId('pricing-title');
    const basePlanCard = await page.getByTestId('plan-card-base');
    const premiumPlanCard = await page.getByTestId('plan-card-premium');
    await expect(pageTitle).toBeVisible();
    await expect(basePlanCard).toBeVisible();
    await expect(premiumPlanCard).toBeVisible();
  });

  test('pricing base plan card has correct info', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');

    const beneficiosEsperadosBase = [
      'Tienda online en dondesiempre',
      'Gestión de productos ilimitados',
      'Pasarela de pagos integrada',
      'Panel de pedidos y clientes',
      'Automatización de Redes Sociales limitada a dos publicaciones por mes',
      '5% de comisión en cada venta',
    ];

    const basePlanCard = await page.getByTestId('plan-card-base');

    const basePlanName = await basePlanCard.getByTestId('plan-name');
    const basePlanPrice = await basePlanCard.getByTestId('plan-price');
    const basePlanCommission = await basePlanCard.getByTestId('plan-commission');
    const basePlanPriceNote = await basePlanCard.getByTestId('plan-price-note');
    const basePlanFeatures = await basePlanCard.getByTestId('plan-features').locator('li');

    await expect(basePlanName).toHaveText('Base');
    await expect(basePlanPrice).toHaveText('Gratis');
    await expect(basePlanPriceNote).toHaveText('');
    await expect(basePlanCommission).toHaveText('5%');
    await expect(basePlanFeatures).toHaveText(beneficiosEsperadosBase);

    await basePlanFeatures.nth(4).hover();
    await expect(
      page.getByText(
        'Publica automáticamente en Instagram, Facebook y más.Publica automáticamente en'
      )
    ).toBeVisible({ timeout: 3000 });
    await basePlanFeatures.nth(5).hover();
    await expect(
      page.getByText(
        'Se descuenta automáticamente del importe neto de cada transacción.Se descuenta'
      )
    ).toBeVisible({ timeout: 3000 });

    //await expect(basePlanCard.getByTestId('plan-button-base-logged-in')).toBeVisible();
  });
  test('pricing premium plan card has correct info', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');

    const beneficiosEsperadosPremium = [
      'Todo lo incluido en Base',
      'Sin permanencia ni costes fijos',
      'Comisión reducida al 2%',
      'Automatización de Redes Sociales ilimitada',
      'Acceso anticipado a nuevas funciones',
    ];

    const premiumPlanCard = await page.getByTestId('plan-card-premium');

    const premiumPlanName = await premiumPlanCard.getByTestId('plan-name');
    const premiumPlanBadge = await premiumPlanCard.getByTestId('plan-badge');
    const premiumPlanPrice = await premiumPlanCard.getByTestId('plan-price');
    const premiumPlanCommission = await premiumPlanCard.getByTestId('plan-commission');
    const premiumPlanPriceNote = await premiumPlanCard.getByTestId('plan-price-note');
    const premiumPlanFeatures = await premiumPlanCard.getByTestId('plan-features').locator('li');

    await expect(premiumPlanName).toHaveText('Premium');
    await expect(premiumPlanBadge).toHaveText('Recomendado');
    await expect(premiumPlanPrice).toHaveText('30 €');
    await expect(premiumPlanPriceNote).toHaveText('/ mes');
    await expect(premiumPlanCommission).toHaveText('2%');
    await expect(premiumPlanFeatures).toHaveText(beneficiosEsperadosPremium);

    await premiumPlanFeatures.nth(3).hover();
    await expect(
      page.getByText(
        'Publica automáticamente en Instagram, Facebook y más.Publica automáticamente en'
      )
    ).toBeVisible({ timeout: 3000 });
  });

  test('premium plan cta button is visible and has correct text', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');

    const premiumPlanCard = await page.getByTestId('plan-card-premium');
    const basePlanCard = await page.getByTestId('plan-card-base');

    await expect(basePlanCard.getByTestId('plan-button-base-logged-in')).toBeVisible();
    await expect(premiumPlanCard.getByTestId('plan-button-premium')).toBeVisible();
  });

  test('Premium plan modal is visible when premium button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');

    await page.getByTestId('plan-button-premium').click();
    await expect(
      page.getByRole('button').filter({ hasText: 'Hazte PremiumPara activar el' })
    ).toBeVisible();

    const emailButton = page.getByRole('button', { name: 'dondesiempreispp+ventas@gmail' });

    await expect(emailButton).toBeVisible();
    await emailButton.click();

    await expect(page.getByRole('button', { name: '¡Copiado!' })).toBeVisible();

    const exitButton = page.getByTestId('plan-modal-close');
    await expect(exitButton).toBeVisible();
    await exitButton.click();

    await expect(
      page.getByRole('button').filter({ hasText: 'Hazte PremiumPara activar el' })
    ).not.toBeVisible();
  });
});

test('Different base button not logged in', async ({ page }) => {
  await page.goto('http://localhost:3000/pricing');

  const basePlanCard = await page.getByTestId('plan-card-base');
  await expect(basePlanCard.getByTestId('plan-button-base')).toBeVisible();
});
