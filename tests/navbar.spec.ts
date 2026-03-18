import { test, expect } from '@playwright/test';

test('navbar to search page', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');
    await page.getByRole('link', { name: 'Búsqueda' }).click();

    await expect(page).toHaveURL('http://localhost:3000/search');
});

test('navbar to map page', async ({ page }) => {
    await page.goto('http://localhost:3000/search');
    await page.getByRole('link', { name: 'Mapa' }).click();

    await expect(page).toHaveURL('http://localhost:3000/stores');
});

test('navbar to followed stores page', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');
    await page.getByRole('img').nth(1).click();

    await expect(page).toHaveURL('http://localhost:3000/following');
});

test('navbar to deliveries page', async ({ page }) => {
    await page.goto('http://localhost:3000/stores');
    await page.getByRole('img').nth(2).click();

    await expect(page).toHaveURL('http://localhost:3000/deliveries');
});

test('redirect to map page', async ({ page }) => {
    await page.goto('http://localhost:3000/search');

    await page.goto('http://localhost:3000/');

    await expect(page).toHaveURL('http://localhost:3000/stores');
});