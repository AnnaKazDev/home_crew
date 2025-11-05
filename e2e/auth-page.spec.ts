import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Note: These tests require a running dev server
// To run: npm run dev (in separate terminal) then npm run test:e2e

// Helper functions for commonly used locators
const signInButton = (page: Page) => page.locator('button').filter({ hasText: 'Sign in' });
const signUpButton = (page: Page) => page.locator('button').filter({ hasText: 'Sign up' });
const emailInput = (page: Page) => page.locator('input[type="email"]');
const passwordInput = (page: Page) => page.locator('input[type="password"]').first();
const forgotPasswordLink = (page: Page) => page.locator('button').filter({ hasText: 'Forgot password?' });
const backToSignInLink = (page: Page) => page.locator('button').filter({ hasText: 'Back to sign in' });
const sendResetEmailButton = (page: Page) => page.locator('button').filter({ hasText: 'Send reset email' });
const submitSignInButton = (page: Page) => page.locator('button').filter({ hasText: 'Sign in' }).last();
const submitSignUpButton = (page: Page) => page.locator('button').filter({ hasText: 'Sign up' }).last();
const mainHeading = (page: Page) => page.locator('h1').filter({ hasText: 'Welcome to Home Crew!' });
const subtitle = (page: Page) => page.locator('p').filter({ hasText: /manage household chores/ });

// Registration form fields
const nameInput = (page: Page) => page.locator('input[placeholder*="John Doe"]');
const regPasswordInput = (page: Page) => page.locator('input[placeholder*="Minimum 8 characters"]');
const confirmPasswordInput = (page: Page) => page.locator('input[placeholder*="Repeat your password"]');
const householdNameInput = (page: Page) => page.locator('input[placeholder*="Smith Family"]');
const pinInput = (page: Page) => page.locator('input[placeholder*="6-digit PIN code"]');
const roleSelector = (page: Page) => page.locator('[role="combobox"]').first();

test.describe('Authentication Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth', { timeout: 5000 });
  });

  test('should load auth page with proper structure', async ({ page }) => {
    await expect(page).toHaveURL(/\/auth/);

    // Check main heading
    await expect(mainHeading(page)).toBeVisible();

    // Check subtitle
    await expect(subtitle(page)).toBeVisible();

    // Check toggle buttons (Sign in / Sign up)
    await expect(signInButton(page)).toBeVisible();
    await expect(signUpButton(page)).toBeVisible();
  });

  test('should start in login mode by default', async ({ page }) => {
    // Sign in button should be active (default variant)
    await expect(signInButton(page)).toHaveClass(/bg-primary/);

    // Sign up button should be inactive
    await expect(signUpButton(page)).toHaveClass(/bg-transparent/);

    // Login form elements should be visible
    await expect(emailInput(page)).toBeVisible();
    await expect(passwordInput(page)).toBeVisible();
    await expect(submitSignInButton(page)).toBeVisible();

    // Registration-only fields should not be visible
    await expect(nameInput(page)).not.toBeVisible();
    await expect(confirmPasswordInput(page)).not.toBeVisible();
  });

  test('should toggle between login and register modes', async ({ page }) => {
    // Start in login mode
    await expect(signInButton(page)).toHaveClass(/bg-primary/);

    // Click Sign up button
    await signUpButton(page).click();

    // Should now be in register mode
    await expect(signUpButton(page)).toHaveClass(/bg-primary/);
    await expect(signInButton(page)).toHaveClass(/bg-transparent/);

    // Registration form elements should be visible
    await expect(nameInput(page)).toBeVisible();
    await expect(confirmPasswordInput(page)).toBeVisible();
    await expect(submitSignUpButton(page)).toBeVisible();

    // Toggle back to login
    await signInButton(page).click();

    // Should be back in login mode
    await expect(signInButton(page)).toHaveClass(/bg-primary/);
    await expect(nameInput(page)).not.toBeVisible();
  });

  test('should show forgot password link in login mode', async ({ page }) => {
    // Ensure we're in login mode
    await signInButton(page).click();

    // Forgot password link should be visible
    await expect(forgotPasswordLink(page)).toBeVisible();

    // Click forgot password to switch to reset mode
    await forgotPasswordLink(page).click();

    // Should show reset password form
    await expect(emailInput(page)).toBeVisible();
    await expect(sendResetEmailButton(page)).toBeVisible();

    // Back to sign in link should be visible
    await expect(backToSignInLink(page)).toBeVisible();
  });

  test('should validate login form - empty fields', async ({ page }) => {
    // Ensure we're in login mode
    await signInButton(page).click();

    // Click sign in button without filling fields
    await submitSignInButton(page).click();

    // Should show validation errors
    await expect(page.locator('text=/Invalid email address/')).toBeVisible();
    await expect(page.locator('text=/Password must be at least 6 characters/')).toBeVisible();
  });

  test('should validate login form - invalid email', async ({ page }) => {
    // Ensure we're in login mode
    await signInButton(page).click();

    // Fill invalid email
    await emailInput(page).fill('invalid-email');
    await passwordInput(page).fill('123456');

    await submitSignInButton(page).click();

    // Should show email validation error
    await expect(page.locator('text=/Invalid email address/')).toBeVisible();
  });

  test('should validate login form - short password', async ({ page }) => {
    // Ensure we're in login mode
    await signInButton(page).click();

    // Fill valid email but short password
    await emailInput(page).fill('test@example.com');
    await passwordInput(page).fill('123');

    await submitSignInButton(page).click();

    // Should show password validation error
    await expect(page.locator('text=/Password must be at least 6 characters/')).toBeVisible();
  });

  test('should handle login failure with invalid credentials', async ({ page }) => {
    // Ensure we're in login mode
    await signInButton(page).click();

    // Fill valid-looking but incorrect credentials
    await emailInput(page).fill('nonexistent@example.com');
    await passwordInput(page).fill('wrongpassword');

    await submitSignInButton(page).click();

    // Should show error message (this might vary based on actual API response)
    // Wait for either error message or loading to finish
    await page.waitForTimeout(2000);

    // Check if we're still on auth page (login failed)
    await expect(page).toHaveURL(/\/auth/);

    // Check for error display (might be in a toast or error component)
    const errorElements = page.locator('[class*="error"], [class*="destructive"]');
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
    }
  });

  test('should show registration form with all required fields', async ({ page }) => {
    // Switch to register mode
    await signUpButton(page).click();

    // Check all basic required fields
    await expect(nameInput(page)).toBeVisible(); // Name
    await expect(emailInput(page)).toBeVisible(); // Email
    await expect(regPasswordInput(page)).toBeVisible(); // Password
    await expect(confirmPasswordInput(page)).toBeVisible(); // Confirm password

    // Check role selector
    await expect(roleSelector(page)).toBeVisible();
  });

  test('should show admin-specific fields when admin role selected', async ({ page }) => {
    // Switch to register mode
    await signUpButton(page).click();

    // Select admin role
    await roleSelector(page).click();
    await page.locator('[role="option"]').filter({ hasText: 'Administrator' }).click();

    // Household name field should appear
    await expect(householdNameInput(page)).toBeVisible();

    // PIN field should not be visible
    await expect(pinInput(page)).not.toBeVisible();
  });

  test('should show member-specific fields when member role selected', async ({ page }) => {
    // Switch to register mode
    await signUpButton(page).click();

    // Select member role
    await roleSelector(page).click();
    await page.locator('[role="option"]').filter({ hasText: 'Family member' }).click();

    // PIN field should appear
    await expect(pinInput(page)).toBeVisible();

    // Household name field should not be visible
    await expect(householdNameInput(page)).not.toBeVisible();
  });

  test('should validate registration form - empty required fields', async ({ page }) => {
    // Switch to register mode and select admin
    await signUpButton(page).click();
    await roleSelector(page).click();
    await page.locator('[role="option"]').filter({ hasText: 'Administrator' }).click();

    // Click sign up without filling fields
    await submitSignUpButton(page).click();

    // Should show validation errors
    await expect(page.locator('text=/Name must be at least 2 characters/')).toBeVisible();
    await expect(page.locator('text=/Invalid email address/')).toBeVisible();
    await expect(page.locator('text=/Password must be at least 8 characters/')).toBeVisible();
    await expect(page.locator('text=/Household name must be between 2 and 100 characters/')).toBeVisible();
  });

  test('should validate registration form - password mismatch', async ({ page }) => {
    // Switch to register mode and select admin
    await signUpButton(page).click();
    await roleSelector(page).click();
    await page.locator('[role="option"]').filter({ hasText: 'Administrator' }).click();

    // Fill form with mismatched passwords
    await nameInput(page).fill('John Doe');
    await emailInput(page).fill('john@example.com');
    await regPasswordInput(page).fill('password123');
    await confirmPasswordInput(page).fill('differentpassword');
    await householdNameInput(page).fill('Test Family');

    await submitSignUpButton(page).click();

    // Should show password mismatch error
    await expect(page.locator('text=/Passwords do not match/')).toBeVisible();
  });

  test('should validate member registration - invalid PIN format', async ({ page }) => {
    // Switch to register mode and select member
    await signUpButton(page).click();
    await roleSelector(page).click();
    await page.locator('[role="option"]').filter({ hasText: 'Family member' }).click();

    // Fill form with invalid PIN
    await nameInput(page).fill('Jane Doe');
    await emailInput(page).fill('jane@example.com');
    await regPasswordInput(page).fill('password123');
    await confirmPasswordInput(page).fill('password123');
    await pinInput(page).fill('12345'); // Too short

    await submitSignUpButton(page).click();

    // Should show PIN validation error
    await expect(page.locator('text=/PIN must be 6 digits/')).toBeVisible();
  });

  test('should show loading states during form submission', async ({ page }) => {
    // Switch to login mode
    await signInButton(page).click();

    // Fill valid form data
    await emailInput(page).fill('test@example.com');
    await passwordInput(page).fill('password123');

    // Start submission
    const submitButton = submitSignInButton(page);
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toHaveText('Signing in...');
    await expect(submitButton).toBeDisabled();

    // Form inputs should be disabled during loading
    await expect(emailInput(page)).toBeDisabled();
    await expect(passwordInput(page)).toBeDisabled();
  });

  test('should handle registration loading states', async ({ page }) => {
    // Switch to register mode
    await signUpButton(page).click();

    // Select admin role
    await roleSelector(page).click();
    await page.locator('[role="option"]').filter({ hasText: 'Administrator' }).click();

    // Fill form
    await nameInput(page).fill('John Doe');
    await emailInput(page).fill('john@example.com');
    await regPasswordInput(page).fill('password123');
    await confirmPasswordInput(page).fill('password123');
    await householdNameInput(page).fill('Test Family');

    // Start submission
    const submitButton = submitSignUpButton(page);
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toHaveText('Registering...');
    await expect(submitButton).toBeDisabled();
  });

  test('should show reset password form', async ({ page }) => {
    // Switch to login mode first
    await signInButton(page).click();

    // Click forgot password
    await forgotPasswordLink(page).click();

    // Should show reset password form
    await expect(emailInput(page)).toBeVisible();
    await expect(sendResetEmailButton(page)).toBeVisible();

    // Toggle buttons should be hidden
    await expect(signInButton(page)).not.toBeVisible();
    await expect(signUpButton(page)).not.toBeVisible();

    // Back button should be visible
    await expect(backToSignInLink(page)).toBeVisible();
  });

  test('should navigate back from reset password to login', async ({ page }) => {
    // Navigate to reset password
    await signInButton(page).click();
    await forgotPasswordLink(page).click();

    // Click back button
    await backToSignInLink(page).click();

    // Should be back in login mode
    await expect(signInButton(page)).toHaveClass(/bg-primary/);
    await expect(passwordInput(page)).toBeVisible();
  });

  test('should validate reset password email', async ({ page }) => {
    // Navigate to reset password
    await signInButton(page).click();
    await forgotPasswordLink(page).click();

    // Try to submit without email
    await sendResetEmailButton(page).click();

    // Should show email validation error
    await expect(page.locator('text=/Invalid email address/')).toBeVisible();

    // Fill invalid email
    await emailInput(page).fill('invalid-email');
    await sendResetEmailButton(page).click();

    // Should still show email validation error
    await expect(page.locator('text=/Invalid email address/')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check form labels and inputs have proper associations
    const emailInputEl = emailInput(page);
    const emailLabel = page.locator('label[for="email"]');

    await expect(emailInputEl).toHaveAttribute('id', 'email');
    await expect(emailLabel).toHaveAttribute('for', 'email');

    // Check ARIA labels where appropriate
    const copyButtons = page.locator('button[aria-label]');
    // Note: aria-label might not be present until copy button is shown in success state
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through login form
    await signInButton(page).click();

    // Focus should move through form elements with Tab
    await page.keyboard.press('Tab'); // Focus email input
    await expect(emailInput(page)).toBeFocused();

    await page.keyboard.press('Tab'); // Focus password input
    await expect(passwordInput(page)).toBeFocused();

    await page.keyboard.press('Tab'); // Focus forgot password link
    await expect(forgotPasswordLink(page)).toBeFocused();

    await page.keyboard.press('Tab'); // Focus sign in button
    await expect(submitSignInButton(page)).toBeFocused();
  });

  test('should prevent form submission with Enter key during validation', async ({ page }) => {
    // Switch to login mode
    await signInButton(page).click();

    // Fill only email, leave password empty
    await emailInput(page).fill('test@example.com');

    // Press Enter in email field
    await emailInput(page).press('Enter');

    // Should show validation error and stay on page
    await expect(page.locator('text=/Password must be at least 6 characters/')).toBeVisible();
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should clear errors when switching modes', async ({ page }) => {
    // Switch to login mode and trigger validation error
    await signInButton(page).click();
    await submitSignInButton(page).click();

    // Error should be visible
    await expect(page.locator('text=/Invalid email address/')).toBeVisible();

    // Switch to register mode
    await signUpButton(page).click();

    // Error should be cleared
    await expect(page.locator('text=/Invalid email address/')).not.toBeVisible();
  });

  test('should show theme-aware styling', async ({ page }) => {
    // Check that page has theme-aware elements
    const mainContainer = page.locator('[class*="min-h-screen"]').first();

    // Should have theme classes applied
    await expect(mainContainer).toHaveClass(/bg-black|bg-gradient-to-br/);
  });
});
