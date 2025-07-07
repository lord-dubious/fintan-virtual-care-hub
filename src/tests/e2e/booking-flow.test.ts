import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('Booking Flow E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  const baseURL = process.env.VITE_APP_URL || 'http://localhost:10000';
  const apiURL = process.env.VITE_API_URL || 'http://localhost:3000';

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: process.env.CI === 'true',
    });
    page = await browser.newPage();
    
    // Set up API mocking
    await page.route(`${apiURL}/api/**`, async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Mock authentication
      if (url.includes('/api/auth/login') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              user: {
                id: 'user-1',
                email: 'patient@test.com',
                name: 'Test Patient',
                role: 'PATIENT',
              },
              token: 'mock-jwt-token',
            },
          }),
        });
        return;
      }
      
      // Mock provider availability
      if (url.includes('/api/providers') && url.includes('/availability')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              availability: [
                {
                  date: '2025-07-08',
                  timeSlots: [
                    { time: '09:00', available: true },
                    { time: '10:00', available: true },
                    { time: '11:00', available: false },
                    { time: '14:00', available: true },
                  ],
                },
              ],
            },
          }),
        });
        return;
      }
      
      // Mock appointment creation
      if (url.includes('/api/appointments') && method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              appointment: {
                id: 'apt-new',
                appointmentDate: '2025-07-08T10:00:00.000Z',
                status: 'SCHEDULED',
                provider: {
                  user: { name: 'Dr. Test Provider' },
                },
              },
            },
          }),
        });
        return;
      }
      
      // Default to continue for unmocked routes
      await route.continue();
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Anonymous User Booking Flow', () => {
    it('should allow anonymous user to book appointment', async () => {
      // Navigate to booking page
      await page.goto(`${baseURL}/booking`);
      
      // Check if booking page loads
      await expect(page.locator('h1')).toContainText('Book Your Appointment');
      
      // Switch to new booking system
      const newBookingButton = page.locator('button:has-text("Switch to New Booking")');
      if (await newBookingButton.isVisible()) {
        await newBookingButton.click();
      }
      
      // Select a provider (assuming provider selection is available)
      const providerCard = page.locator('[data-testid="provider-card"]').first();
      if (await providerCard.isVisible()) {
        await providerCard.click();
      }
      
      // Select a date
      const dateButton = page.locator('[data-testid="date-button"]:has-text("8")').first();
      await dateButton.click();
      
      // Wait for time slots to load
      await page.waitForSelector('[data-testid="time-slot"]');
      
      // Select an available time slot
      const timeSlot = page.locator('[data-testid="time-slot"]:has-text("10:00 AM")').first();
      await timeSlot.click();
      
      // Click book appointment button
      const bookButton = page.locator('button:has-text("Book Appointment")');
      await bookButton.click();
      
      // Should redirect to login or show auth modal
      await expect(page.locator('text=Authentication Required')).toBeVisible();
    });
  });

  describe('Authenticated User Booking Flow', () => {
    beforeEach(async () => {
      // Mock authentication state
      await page.addInitScript(() => {
        localStorage.setItem('auth-token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify({
          id: 'user-1',
          email: 'patient@test.com',
          name: 'Test Patient',
          role: 'PATIENT',
        }));
      });
    });

    it('should complete full booking flow for authenticated user', async () => {
      await page.goto(`${baseURL}/booking`);
      
      // Switch to new booking system if available
      const newBookingButton = page.locator('button:has-text("Switch to New Booking")');
      if (await newBookingButton.isVisible()) {
        await newBookingButton.click();
      }
      
      // Wait for calendar to load
      await page.waitForSelector('[data-testid="booking-calendar"]');
      
      // Select a date
      const dateButton = page.locator('[data-testid="date-button"]:has-text("8")').first();
      await dateButton.click();
      
      // Wait for time slots
      await page.waitForSelector('[data-testid="time-slot"]');
      
      // Select time slot
      const timeSlot = page.locator('[data-testid="time-slot"]:has-text("10:00 AM")').first();
      await timeSlot.click();
      
      // Book appointment
      const bookButton = page.locator('button:has-text("Book Appointment")');
      await bookButton.click();
      
      // Wait for success message
      await expect(page.locator('text=Appointment booked successfully')).toBeVisible();
      
      // Should redirect to dashboard
      await page.waitForURL('**/dashboard');
      await expect(page.locator('h1')).toContainText('Welcome back');
    });

    it('should handle time slot conflicts', async () => {
      // Mock conflict response
      await page.route(`${apiURL}/api/appointments`, async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Time slot is not available',
            }),
          });
        }
      });

      await page.goto(`${baseURL}/booking`);
      
      // Go through booking flow
      const dateButton = page.locator('[data-testid="date-button"]:has-text("8")').first();
      await dateButton.click();
      
      const timeSlot = page.locator('[data-testid="time-slot"]:has-text("10:00 AM")').first();
      await timeSlot.click();
      
      const bookButton = page.locator('button:has-text("Book Appointment")');
      await bookButton.click();
      
      // Should show error message
      await expect(page.locator('text=Time slot is not available')).toBeVisible();
    });
  });

  describe('Responsive Booking Flow', () => {
    it('should work on mobile devices', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${baseURL}/booking`);
      
      // Check mobile-specific elements
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
      }
      
      // Booking flow should work on mobile
      const dateButton = page.locator('[data-testid="date-button"]').first();
      await dateButton.click();
      
      const timeSlot = page.locator('[data-testid="time-slot"]').first();
      await timeSlot.click();
      
      // Mobile booking should work
      await expect(page.locator('button:has-text("Book Appointment")')).toBeVisible();
    });

    it('should work on tablet devices', async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto(`${baseURL}/booking`);
      
      // Tablet layout should be functional
      await expect(page.locator('[data-testid="booking-calendar"]')).toBeVisible();
    });
  });

  describe('Accessibility in Booking Flow', () => {
    it('should be keyboard navigable', async () => {
      await page.goto(`${baseURL}/booking`);
      
      // Tab through the interface
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to select date with keyboard
      await page.keyboard.press('Enter');
      
      // Tab to time slots
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should be able to book with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
    });

    it('should have proper ARIA labels', async () => {
      await page.goto(`${baseURL}/booking`);
      
      // Check for ARIA labels
      const calendar = page.locator('[role="grid"]');
      await expect(calendar).toHaveAttribute('aria-label');
      
      const timeSlots = page.locator('[role="button"][aria-label*="time slot"]');
      await expect(timeSlots.first()).toHaveAttribute('aria-label');
    });
  });

  describe('Error Handling in Booking', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      await page.route(`${apiURL}/api/**`, async (route) => {
        await route.abort('failed');
      });

      await page.goto(`${baseURL}/booking`);
      
      // Should show error state
      await expect(page.locator('text=Unable to load')).toBeVisible();
      
      // Should have retry button
      const retryButton = page.locator('button:has-text("Retry")');
      await expect(retryButton).toBeVisible();
    });

    it('should handle server errors', async () => {
      await page.route(`${apiURL}/api/**`, async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Internal server error',
          }),
        });
      });

      await page.goto(`${baseURL}/booking`);
      
      await expect(page.locator('text=Something went wrong')).toBeVisible();
    });
  });
});
