import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sign in button when not authenticated', async ({ page }) => {
    await expect(page.getByRole('link', { name: /entrar/i })).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.getByRole('link', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/.*\/signin/);
    await expect(page.getByText(/fazer login/i)).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.getByRole('link', { name: /entrar/i }).click();
    await page.getByRole('link', { name: /criar conta/i }).click();
    await expect(page).toHaveURL(/.*\/signup/);
    await expect(page.getByText(/criar conta/i)).toBeVisible();
  });

  test('should display social login buttons', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/signin');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Should show validation errors
    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/signin');
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });
});