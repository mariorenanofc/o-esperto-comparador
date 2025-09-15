import { test, expect } from '@playwright/test';

test.describe('Price Contribution Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contribute');
  });

  test('should display contribution form', async ({ page }) => {
    await expect(page.getByText(/compartilhar preço/i)).toBeVisible();
    await expect(page.getByText(/ajude nossa comunidade/i)).toBeVisible();
  });

  test('should show geolocation detection message', async ({ page }) => {
    // Mock geolocation as loading
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success: any) => {
            // Simulate loading state
            setTimeout(() => {
              success({
                coords: {
                  latitude: -23.5505,
                  longitude: -46.6333
                }
              });
            }, 1000);
          }
        }
      });
    });

    await page.reload();
    await expect(page.getByText(/detectando sua localização/i)).toBeVisible();
  });

  test('should require authentication for contribution', async ({ page }) => {
    // Fill form
    await page.fill('input[placeholder*="produto"]', 'Leite Integral');
    await page.fill('input[placeholder*="preço"]', '4.99');
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    
    // Try to submit
    await page.getByRole('button', { name: /compartilhar/i }).click();
    
    // Should redirect to login or show auth error
    await expect(page.locator('text=Login necessário')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /compartilhar/i }).click();
    
    // Should show validation errors
    await expect(page.locator('text=Nome do produto é obrigatório')).toBeVisible();
  });

  test('should validate price format', async ({ page }) => {
    await page.fill('input[placeholder*="produto"]', 'Leite');
    await page.fill('input[placeholder*="preço"]', 'abc');
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    
    await page.getByRole('button', { name: /compartilhar/i }).click();
    
    await expect(page.locator('text=Preço deve ser um número válido')).toBeVisible();
  });

  test('should show success message after valid submission', async ({ page }) => {
    // Mock successful authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.fill('input[placeholder*="produto"]', 'Leite Integral');
    await page.fill('input[placeholder*="preço"]', '4.99');
    await page.fill('input[placeholder*="mercado"]', 'Extra');
    
    // Mock location data
    await page.evaluate(() => {
      window.localStorage.setItem('user-location', JSON.stringify({
        city: 'São Paulo',
        state: 'SP'
      }));
    });

    await page.getByRole('button', { name: /compartilhar/i }).click();
    
    // Should show success message (even if API call fails in test environment)
    await expect(page.locator('text=Contribuição enviada')).toBeVisible();
  });

  test('should cancel and close form', async ({ page }) => {
    await page.getByRole('button', { name: /cancelar/i }).click();
    
    // Should close the form modal/page
    await expect(page).toHaveURL('/');
  });

  test('should show rate limit message', async ({ page }) => {
    // Mock multiple rapid submissions
    for (let i = 0; i < 6; i++) {
      await page.fill('input[placeholder*="produto"]', `Produto ${i}`);
      await page.fill('input[placeholder*="preço"]', '1.99');
      await page.fill('input[placeholder*="mercado"]', 'Extra');
      
      await page.getByRole('button', { name: /compartilhar/i }).click();
      
      if (i === 5) {
        await expect(page.locator('text=Muitas tentativas')).toBeVisible();
        break;
      }
      
      await page.waitForTimeout(100);
    }
  });
});