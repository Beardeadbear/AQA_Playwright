// global-setup/auth.setup.ts
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { SignInPage } from '../page-objects/auth/sign-in.page';
import { extendPage } from '../core/page-extensions';

const STUDIO_STORAGE_STATE = 'storage-state/studioUser.json';

const globalSetup = async () => {
  const browser: Browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();
  
  try {
    // Extend page with custom methods
    extendPage(page);
    
    const signInPage = new SignInPage(page);
    const result = await signInPage.loginWithEnvCredentials();
    
    if (!result.success) {
      throw new Error(`Login failed: ${result.error}`);
    }
    
    await context.storageState({ path: STUDIO_STORAGE_STATE });
    console.log('✅ Studio authentication state saved');
  } finally {
    await browser.close();
  }
};

export default globalSetup;  
