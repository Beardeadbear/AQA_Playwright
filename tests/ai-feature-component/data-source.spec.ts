import { test, expect } from '@playwright/test';
import { StudioAppsPage } from '../../page-objects/apps/studio-apps.page';
import { enhancedDragAndDrop } from '../../core/drag-and-drop';
import { WIDGETS } from '../../constants/widgets';

test.describe('AI Feature Component - Data Source Tests', () => {
    let studioAppsPage: StudioAppsPage;

    test.beforeEach(async ({ page }) => {
        studioAppsPage = new StudioAppsPage(page);
        await studioAppsPage.goto();
        
        const appLink = page.getByRole('link', { name: /AI-Test-App/ });
        await appLink.waitFor({ state: 'visible' });
        await appLink.click();
        
        await page.waitForSelector('#preview');
        
        // Add AI component for all tests
        await enhancedDragAndDrop(page, WIDGETS.AI_FEATURE.package, {
            usePackageSelection: true,
            verbose: false
        });
    });

    test('Select existing DS from dropdown', async ({ page }) => {
        const dataSourceDropdown = page.getByRole('combobox', { name: /Data Source/i });
        await expect(dataSourceDropdown).toBeVisible();
        
        await dataSourceDropdown.click();
        
        // Select an existing data source
        const existingDataSource = page.getByRole('option', { name: /Test Data Source/i });
        await existingDataSource.click();
        
        // Verify selection is reflected
        await expect(dataSourceDropdown).toHaveValue(/Test Data Source/i);
    });

    test('Create new data source', async ({ page }) => {
        const dataSourceDropdown = page.getByRole('combobox', { name: /Data Source/i });
        await dataSourceDropdown.click();
        
        // Click "Create New Data Source" option
        const createNewOption = page.getByRole('option', { name: /Create New Data Source/i });
        await createNewOption.click();
        
        // Fill in new data source details
        const dataSourceNameInput = page.getByLabel(/Data Source Name/i);
        await dataSourceNameInput.fill('AI Generated Data Source');
        
        const dataSourceTypeSelect = page.getByLabel(/Data Source Type/i);
        await dataSourceTypeSelect.selectOption('JSON');
        
        const createButton = page.getByRole('button', { name: /Create/i });
        await createButton.click();
        
        // Verify new data source was created and selected
        await expect(dataSourceDropdown).toHaveValue(/AI Generated Data Source/i);
    });

    test('DS reflects in component config', async ({ page }) => {
        // Select a data source
        const dataSourceDropdown = page.getByRole('combobox', { name: /Data Source/i });
        await dataSourceDropdown.click();
        
        const existingDataSource = page.getByRole('option', { name: /Test Data Source/i });
        await existingDataSource.click();
        
        // Verify data source is saved in component configuration
        const saveButton = page.getByRole('button', { name: /Save/i });
        await saveButton.click();
        
        // Reload the page to verify persistence
        await page.reload();
        await page.waitForSelector('#preview');
        
        // Verify data source selection is still there
        await expect(dataSourceDropdown).toHaveValue(/Test Data Source/i);
    });

    test('Toast if missing write permissions', async ({ page }) => {
        // Select a data source without write permissions
        const dataSourceDropdown = page.getByRole('combobox', { name: /Data Source/i });
        await dataSourceDropdown.click();
        
        const readOnlyDataSource = page.getByRole('option', { name: /Read-Only Data Source/i });
        await readOnlyDataSource.click();
        
        // Try to generate code that requires write access
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a form that saves data to the data source');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Verify error toast appears
        const errorToast = page.getByText(/You don't have write permissions for this data source/i);
        await expect(errorToast).toBeVisible();
    });

    test('Toast if no DS selected', async ({ page }) => {
        // Try to generate code without selecting a data source
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a form that saves data');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Verify warning toast appears
        const warningToast = page.getByText(/Please select a data source first/i);
        await expect(warningToast).toBeVisible();
    });

    test('Change DS after initial setup', async ({ page }) => {
        // Initial data source selection
        const dataSourceDropdown = page.getByRole('combobox', { name: /Data Source/i });
        await dataSourceDropdown.click();
        
        const firstDataSource = page.getByRole('option', { name: /Test Data Source/i });
        await firstDataSource.click();
        
        // Generate some code
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a simple form');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Change to a different data source
        await dataSourceDropdown.click();
        const secondDataSource = page.getByRole('option', { name: /Another Data Source/i });
        await secondDataSource.click();
        
        // Verify the change is reflected
        await expect(dataSourceDropdown).toHaveValue(/Another Data Source/i);
        
        // Verify component still works with new data source
        await promptInput.clear();
        await promptInput.fill('Create a different form');
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
    });
}); 