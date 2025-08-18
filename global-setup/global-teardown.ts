// import * as fs from 'fs/promises';
// import * as path from 'path';
// import { chromium } from '@playwright/test';

// // This script runs once after all tests have completed to clean up artifacts
// // like authentication state files and browser data. This ensures each full test execution is independent.

// async function globalTeardown() {
//   console.log('--- Running Global Teardown ---');
  
//   // Clean up authentication state file
//   const studioStateFile = path.resolve(__dirname, '..', 'storage-state/studioUser.json');

//   try {
//     await fs.rm(studioStateFile, { force: true });
//     console.log('✅ Studio authentication state file deleted.');
//   } catch (error) {
//     console.error('Error deleting auth state:', error);
//   }

//   // Clear browser data for clean state next run
//   try {
//     console.log('🧹 Clearing browser data for next test run...');
    
//     const browser = await chromium.launch();
//     const context = await browser.newContext();
//     const page = await context.newPage();
    
//     // Navigate to a basic page to access storage APIs
//     await page.goto('about:blank');
    
//     // Clear all storage
//     await page.evaluate(() => {
//       try {
//         // Clear storages
//         localStorage.clear();
//         sessionStorage.clear();
        
//         // Clear IndexedDB
//         if ('indexedDB' in window) {
//           indexedDB.databases().then(databases => {
//             databases.forEach(db => {
//               if (db.name) {
//                 indexedDB.deleteDatabase(db.name);
//               }
//             });
//           }).catch(() => {});
//         }
        
//         // Clear caches
//         if ('caches' in window) {
//           caches.keys().then(names => {
//             names.forEach(name => {
//               caches.delete(name);
//             });
//           }).catch(() => {});
//         }
//       } catch (error) {
//         console.log('Storage clearing completed with minor errors (expected)');
//       }
//     });
    
//     // Clear cookies and permissions
//     await context.clearCookies();
//     await context.clearPermissions();
    
//     await browser.close();
//     console.log('✅ Browser data cleared successfully.');
    
//   } catch (error) {
//     console.error('Error clearing browser data:', error);
//   }
  
//   console.log('--- Global Teardown Complete ---');
// }

// export default globalTeardown; 