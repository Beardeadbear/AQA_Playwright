import { test, expect } from '@playwright/test';
import { StudioAppsPage } from '../../page-objects/apps/studio-apps.page';
import { enhancedDragAndDrop } from '../../core/drag-and-drop';
import { WIDGETS } from '../../constants/widgets';

test.describe('AI Feature Component - Toast Messages Tests', () => {
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

    test('Empty prompt toast', async ({ page }) => {
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        const errorToast = page.getByText(/Please enter a prompt/i);
        await expect(errorToast).toBeVisible();
        
        // Verify toast has error styling
        await expect(errorToast).toHaveClass(/error/);
    });

    test('Invalid prompt toast', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Invalid prompt that should not generate anything');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for generation attempt
        await page.waitForTimeout(2000);
        
        const errorToast = page.getByText(/Unable to generate code for this prompt/i);
        await expect(errorToast).toBeVisible();
        
        // Verify toast has error styling
        await expect(errorToast).toHaveClass(/error/);
    });

    test('Missing DS toast', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a form that saves data');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        const warningToast = page.getByText(/Please select a data source first/i);
        await expect(warningToast).toBeVisible();
        
        // Verify toast has warning styling
        await expect(warningToast).toHaveClass(/warning/);
    });

    test('Write access error toast', async ({ page }) => {
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
        
        const errorToast = page.getByText(/You don't have write permissions for this data source/i);
        await expect(errorToast).toBeVisible();
        
        // Verify toast has error styling
        await expect(errorToast).toHaveClass(/error/);
    });

    test('AI query failure toast', async ({ page }) => {
        // Generate AI query functionality
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a button that handles AI query failures gracefully');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Click the AI query button
        const aiQueryButton = page.getByRole('button', { name: /Generate Content/i });
        await aiQueryButton.click();
        
        const errorToast = page.getByText(/Failed to generate content. Please try again./i);
        await expect(errorToast).toBeVisible();
        
        // Verify toast has error styling
        await expect(errorToast).toHaveClass(/error/);
    });

    test('Success toast (form)', async ({ page }) => {
        // Generate a form
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a simple contact form');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Fill the form
        const nameInput = page.getByLabel(/Name/i);
        await nameInput.fill('John Doe');
        
        const emailInput = page.getByLabel(/Email/i);
        await emailInput.fill('john@example.com');
        
        const messageInput = page.getByLabel(/Message/i);
        await messageInput.fill('Test message');
        
        // Submit the form
        const submitButton = page.getByRole('button', { name: /Submit/i });
        await submitButton.click();
        
        const successToast = page.getByText(/Form submitted successfully/i);
        await expect(successToast).toBeVisible();
        
        // Verify toast has success styling
        await expect(successToast).toHaveClass(/success/);
    });

    test('DS load failure toast', async ({ page }) => {
        // Generate directory listing
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing that displays employee data from a data source');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Simulate data source load failure
        // This would be handled by the component when it can't connect to the data source
        
        const errorToast = page.getByText(/Failed to load data from data source/i);
        await expect(errorToast).toBeVisible();
        
        // Verify toast has error styling
        await expect(errorToast).toHaveClass(/error/);
    });

    test('Toast auto-dismiss', async ({ page }) => {
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        const errorToast = page.getByText(/Please enter a prompt/i);
        await expect(errorToast).toBeVisible();
        
        // Wait for toast to auto-dismiss (assuming 5 seconds)
        await page.waitForTimeout(5000);
        
        // Verify toast is no longer visible
        await expect(errorToast).not.toBeVisible();
    });

    test('Multiple toasts stack properly', async ({ page }) => {
        // Trigger multiple errors quickly
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        
        // First error
        await saveGenerateButton.click();
        const firstToast = page.getByText(/Please enter a prompt/i);
        await expect(firstToast).toBeVisible();
        
        // Fill prompt and try again (should trigger different error)
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Invalid prompt');
        
        await saveGenerateButton.click();
        
        // Wait for second error
        await page.waitForTimeout(2000);
        const secondToast = page.getByText(/Unable to generate code for this prompt/i);
        await expect(secondToast).toBeVisible();
        
        // Verify both toasts are visible and stacked
        await expect(firstToast).toBeVisible();
        await expect(secondToast).toBeVisible();
        
        // Verify they have different positions (stacked)
        const firstPosition = await firstToast.boundingBox();
        const secondPosition = await secondToast.boundingBox();
        
        expect(firstPosition.y).toBeLessThan(secondPosition.y);
    });

    test('Toast accessibility', async ({ page }) => {
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        const errorToast = page.getByText(/Please enter a prompt/i);
        await expect(errorToast).toBeVisible();
        
        // Verify toast has proper ARIA attributes
        await expect(errorToast).toHaveAttribute('role', 'alert');
        await expect(errorToast).toHaveAttribute('aria-live', 'polite');
        
        // Verify close button is accessible
        const closeButton = errorToast.getByRole('button', { name: /Close/i });
        await expect(closeButton).toBeVisible();
        await expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    });
}); 