import { test, expect } from '@playwright/test';

test.describe('Comparison Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comparison');
  });

  test('should display comparison form', async ({ page }) => {
    await expect(page.getByText(/comparação de preços/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /adicionar produto/i })).toBeVisible();
  });

  test('should allow adding a store', async ({ page }) => {
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    await page.getByRole('button', { name: /adicionar mercado/i }).click();
    
    await expect(page.getByText('Extra')).toBeVisible();
  });

  test('should prevent adding empty store name', async ({ page }) => {
    await page.getByRole('button', { name: /adicionar mercado/i }).click();
    
    // Should show error toast
    await expect(page.locator('text=O nome do mercado não pode estar vazio')).toBeVisible();
  });

  test('should prevent duplicate store names', async ({ page }) => {
    // Add first store
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    await page.getByRole('button', { name: /adicionar mercado/i }).click();
    
    // Try to add same store again
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    await page.getByRole('button', { name: /adicionar mercado/i }).click();
    
    await expect(page.locator('text=Mercado já adicionado')).toBeVisible();
  });

  test('should allow removing a store', async ({ page }) => {
    // Add a store first
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    await page.getByRole('button', { name: /adicionar mercado/i }).click();
    
    // Remove it
    await page.getByRole('button', { name: /remover/i }).first().click();
    
    await expect(page.getByText('Extra')).not.toBeVisible();
  });

  test('should open product modal when adding product', async ({ page }) => {
    await page.getByRole('button', { name: /adicionar produto/i }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/adicionar produto/i)).toBeVisible();
  });

  test('should show login prompt when trying to compare without auth', async ({ page }) => {
    // Add a product and store first
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    await page.getByRole('button', { name: /adicionar mercado/i }).click();
    
    await page.getByRole('button', { name: /adicionar produto/i }).click();
    await page.fill('input[placeholder*="produto"]', 'Leite');
    await page.fill('input[placeholder*="quantidade"]', '1');
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Try to compare
    await page.getByRole('button', { name: /fazer comparação/i }).click();
    
    await expect(page.locator('text=Login necessário')).toBeVisible();
  });

  test('should show limit message for anonymous users', async ({ page }) => {
    // Try to add more than 2 stores (limit for anonymous users)
    const stores = ['Extra', 'Carrefour', 'Pão de Açúcar'];
    
    for (let i = 0; i < stores.length; i++) {
      await page.fill('input[placeholder*="mercado"]', stores[i]);
      await page.getByRole('button', { name: /adicionar mercado/i }).click();
      
      if (i === 2) {
        // Should show limit message
        await expect(page.locator('text=Limite atingido')).toBeVisible();
        break;
      }
    }
  });

  test('should persist comparison data in localStorage', async ({ page }) => {
    // Add a store
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    await page.getByRole('button', { name: /adicionar mercado/i }).click();
    
    // Reload page
    await page.reload();
    
    // Store should still be there
    await expect(page.getByText('Extra')).toBeVisible();
  });
});