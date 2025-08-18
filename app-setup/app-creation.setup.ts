// app-setup/app-creation.setup.ts
import { test as setup } from '@playwright/test';

setup.describe('App Creation Setup', () => {
  
  setup('Create Test App', async ({ page }) => {
    // Generate unique app name
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const testAppName = `AI-Test-App-${timestamp}`;
    
    // Navigate and create app
    await page.goto('https://staging.studio.fliplet.com/apps');
    await page.waitForLoadState('networkidle');
    
    await page.getByText('New app').click();
    
    // Wait for template selection modal to appear
    const useTemplateButton = page.getByText('Use template');
    await useTemplateButton.waitFor({ state: 'visible' });
    await useTemplateButton.click();
    
    // Wait for app name input to appear
    const appNameInput = page.locator('input[type="text"]').first();
    await appNameInput.waitFor({ state: 'visible' });
    await appNameInput.fill(testAppName);
    
    await page.getByRole('button', { name: 'Create app' }).click();
    
    // Wait for app creation to complete by waiting for URL change
    await page.waitForURL('**/apps/**');
    
    // Extract app ID and switch to edit mode
    const currentUrl = page.url();
    const appIdMatch = currentUrl.match(/\/apps\/(\d+)/);
    const appId = appIdMatch ? appIdMatch[1] : 'existing';
    
    if (currentUrl.includes('/preview')) {
      await page.goto(`https://staging.studio.fliplet.com/apps/${appId}/screens/`);
    }
    
    // Save app info
    const fs = require('fs');
    const appInfo = {
      appId,
      appName: testAppName,
      createdAt: new Date().toISOString(),
      appUrl: `https://staging.studio.fliplet.com/apps/${appId}/screens/`,
      mode: 'edit'
    };
    
    fs.writeFileSync('app-setup/test-app-info.json', JSON.stringify(appInfo, null, 2));
    console.log(`✅ App created: ${testAppName} (ID: ${appId})`);
  });

  // Optional: Add a cleanup setup that can be run after tests
  setup('Cleanup Test App (Optional)', async ({ page }) => {
    // This test is skipped by default - can be used for cleanup if needed
    setup.skip();
    
    console.log('🧹 Cleaning up test app...');
    
    // Add cleanup logic here if needed
    // For example: navigate to apps page and delete the test app
    
    try {
      const fs = require('fs');
      const appInfoPath = 'app-setup/test-app-info.json';
      
      if (fs.existsSync(appInfoPath)) {
        const appInfo = JSON.parse(fs.readFileSync(appInfoPath, 'utf8'));
        console.log(`🗑️ Would delete app: ${appInfo.appName} (ID: ${appInfo.appId})`);
        
        // Add actual deletion logic here if Studio has delete functionality
        // await deleteApp(appInfo.appId);
        
        // Remove the app info file
        fs.unlinkSync(appInfoPath);
        console.log('✅ Cleanup completed');
      }
    } catch (error) {
      console.warn('⚠️ Cleanup failed (non-critical):', error);
    }
  });
});