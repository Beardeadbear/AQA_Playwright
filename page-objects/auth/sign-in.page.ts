/**
 * Sign In Page Object
 * Comprehensive authentication page object for Fliplet Studio
 */

import { Page, Locator, expect } from '@playwright/test';

export interface SignInOptions {
  email: string;
  password: string;
}

export interface SignInResult {
  success: boolean;
  error?: string;
}

export class SignInPage {
  readonly page: Page;
  
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;
  readonly signInButton: Locator;
  readonly alert: Locator;
  readonly forgotPasswordLink: Locator;
  readonly useDifferentEmailLink: Locator;
  readonly signUpLink: Locator;
  readonly navbarTopHolder: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators using modern Playwright practices
    this.emailInput = page.getByRole('textbox');
    this.passwordInput = page.getByRole('textbox', { name: /password/i }).or(page.locator('input[type="password"]'));
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.alert = page.locator('[role="alert"]');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.useDifferentEmailLink = page.getByRole('link', { name: 'Use a different email' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up for free' });
    this.navbarTopHolder = page.locator('.navbar-top-holder');
  }

  /**
   * Navigate to sign-in page
   */
  async goto(): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'https://staging.studio.fliplet.com/';
    await this.page.goto(`${baseUrl}signin`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Complete sign-in process with environment credentials
   */
  async loginWithEnvCredentials(): Promise<SignInResult> {
    if (!process.env.STUDIO_EMAIL || !process.env.STUDIO_PASSWORD) {
      throw new Error('STUDIO_EMAIL and STUDIO_PASSWORD must be set in environment variables');
    }

    return await this.signIn({
      email: process.env.STUDIO_EMAIL,
      password: process.env.STUDIO_PASSWORD
    });
  }

  /**
   * Complete sign-in process
   */
  async signIn(options: SignInOptions): Promise<SignInResult> {
    const { email, password } = options;

    try {
      console.log('🔐 Starting login process...');
      
      await this.goto();
      
      // Step 1: Enter email
      console.log('📧 Entering email...');
      await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.emailInput.fill(email);
      
      // Check for rate limiting before clicking continue
      const rateLimitText = this.page.getByText('You\'ve made too many attempts');
      const isRateLimited = await rateLimitText.count() > 0;
      
      if (isRateLimited) {
        console.log('❌ Rate limiting detected during login');
        return { success: false, error: 'Rate limiting is active. Please wait and try again.' };
      }
      
      console.log('➡️ Clicking Continue...');
      await this.continueButton.click();
      
      // Step 2: Wait for password field
      console.log('🔍 Waiting for password field...');
      try {
        await this.passwordInput.waitFor({ state: 'visible', timeout: 15000 });
        console.log('✅ Password field appeared');
      } catch (error) {
        console.log('❌ Password field did not appear. Checking page state...');
        
        // Check for common error messages
        const errorMessages = [
          'You\'ve made too many attempts',
          'Invalid email',
          'Something went wrong'
        ];
        
        for (const errorMsg of errorMessages) {
          const hasError = await this.page.getByText(errorMsg).count() > 0;
          if (hasError) {
            console.log(`❌ Found error message: ${errorMsg}`);
            return { success: false, error: `Login failed: ${errorMsg}` };
          }
        }
        
        return { success: false, error: 'Password field did not appear after 15 seconds. Page may not have transitioned properly.' };
      }
      
      // Step 3: Enter password
      console.log('🔑 Entering password...');
      await this.passwordInput.fill(password);
      
      console.log('🚀 Clicking Sign in...');
      await this.signInButton.click();
      
      // Step 4: Wait for successful navigation
      console.log('⏳ Waiting for navigation to apps page...');
      await this.page.waitForURL('**/apps**', { timeout: 15000 });
      console.log('✅ Login successful!');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Check if user is logged in and handle re-authentication if needed
   */
  async checkIfUserLoggedIn(options: SignInOptions): Promise<void> {
    const { email, password } = options;

    try {
      // Check if navigation bar is present (indicates logged in)
      await this.navbarTopHolder.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ User is already logged in');
    } catch {
      // Navigation bar not present, need to sign in
      console.log('🔄 User not logged in, attempting sign in...');
      
      const result = await this.signIn({ email, password });
      if (!result.success) {
        throw new Error(result.error || 'Failed to sign in');
      }
    }
  }

  /**
   * Assert email error alert is present
   */
  async assertEmailErrorAlert(): Promise<void> {
    await this.alert.waitFor({ state: 'visible', timeout: 15000 });
    await expect(this.alert).toContainText('Email address not found');
  }

  /**
   * Assert email/password combination error alert is present
   */
  async assertEmailPasswordCombinationErrorAlert(): Promise<void> {
    await this.alert.waitFor({ state: 'visible', timeout: 15000 });
    await expect(this.alert).toContainText('Email/password combination does not match');
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.forgotPasswordLink.click();
  }

  /**
   * Wait for sign-in page to be loaded
   */
  async waitForPageLoaded(): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.continueButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if we're on the sign-in page
   */
  async isOnSignInPage(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('/signin');
  }
} 