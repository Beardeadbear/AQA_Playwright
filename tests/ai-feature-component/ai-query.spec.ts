import { test, expect } from '@playwright/test';
import { StudioAppsPage } from '../../page-objects/apps/studio-apps.page';
import { enhancedDragAndDrop } from '../../core/drag-and-drop';
import { WIDGETS } from '../../constants/widgets';

test.describe('AI Feature Component - AI Query Tests', () => {
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

    test('Generate AI-query button via prompt', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a button that generates AI content when clicked');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Verify AI query button is generated
        const aiQueryButton = page.getByRole('button', { name: /Generate AI Content/i });
        await expect(aiQueryButton).toBeVisible();
    });

    test('Trigger AI query → content appears', async ({ page }) => {
        // Generate AI query functionality
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a button that generates a random quote when clicked');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Click the AI query button
        const aiQueryButton = page.getByRole('button', { name: /Generate Quote/i });
        await aiQueryButton.click();
        
        // Wait for AI content to appear
        await page.waitForSelector('.ai-generated-content', { state: 'visible' });
        
        // Verify content is displayed
        const generatedContent = page.locator('.ai-generated-content');
        await expect(generatedContent).toBeVisible();
        
        // Verify content contains a quote
        const contentText = await generatedContent.textContent();
        expect(contentText).toMatch(/["'].*["']/); // Contains quotes
    });

    test('Show loading indicator', async ({ page }) => {
        // Generate AI query functionality
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a button that generates content with loading state');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Click the AI query button
        const aiQueryButton = page.getByRole('button', { name: /Generate Content/i });
        await aiQueryButton.click();
        
        // Verify loading indicator appears
        const loadingIndicator = page.locator('.loading-spinner');
        await expect(loadingIndicator).toBeVisible();
        
        // Verify button is disabled during loading
        await expect(aiQueryButton).toBeDisabled();
        
        // Wait for loading to complete
        await page.waitForSelector('.ai-generated-content', { state: 'visible' });
        
        // Verify loading indicator disappears
        await expect(loadingIndicator).not.toBeVisible();
        
        // Verify button is enabled again
        await expect(aiQueryButton).toBeEnabled();
    });

    test('Handle query failure (toast)', async ({ page }) => {
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
        
        // Wait for error toast to appear
        const errorToast = page.getByText(/Failed to generate content. Please try again./i);
        await expect(errorToast).toBeVisible();
        
        // Verify button is enabled after failure
        await expect(aiQueryButton).toBeEnabled();
    });

    test('Multiple queries → multiple responses', async ({ page }) => {
        // Generate AI query functionality
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a button that generates multiple AI responses');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Click the AI query button multiple times
        const aiQueryButton = page.getByRole('button', { name: /Generate Content/i });
        
        // First click
        await aiQueryButton.click();
        await page.waitForSelector('.ai-generated-content', { state: 'visible' });
        
        // Second click
        await aiQueryButton.click();
        await page.waitForSelector('.ai-generated-content:nth-child(2)', { state: 'visible' });
        
        // Third click
        await aiQueryButton.click();
        await page.waitForSelector('.ai-generated-content:nth-child(3)', { state: 'visible' });
        
        // Verify multiple responses are displayed
        const allResponses = page.locator('.ai-generated-content');
        await expect(allResponses).toHaveCount(3);
    });

    test('Character limit respected', async ({ page }) => {
        // Generate AI query functionality with character limit
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a button that generates content with a 100 character limit');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Click the AI query button
        const aiQueryButton = page.getByRole('button', { name: /Generate Content/i });
        await aiQueryButton.click();
        
        // Wait for content to appear
        await page.waitForSelector('.ai-generated-content', { state: 'visible' });
        
        // Verify content respects character limit
        const generatedContent = page.locator('.ai-generated-content');
        const contentText = await generatedContent.textContent();
        expect(contentText).toBeTruthy();
        expect(contentText!.length).toBeLessThanOrEqual(100);
    });

    test('UI stable after multiple uses', async ({ page }) => {
        // Generate AI query functionality
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a button that maintains UI stability during multiple AI queries');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Perform multiple rapid clicks
        const aiQueryButton = page.getByRole('button', { name: /Generate Content/i });
        
        for (let i = 0; i < 5; i++) {
            await aiQueryButton.click();
            await page.waitForTimeout(500); // Small delay between clicks
        }
        
        // Wait for all content to load
        await page.waitForTimeout(2000);
        
        // Verify UI is still stable
        await expect(aiQueryButton).toBeVisible();
        await expect(aiQueryButton).toBeEnabled();
        
        // Verify no duplicate content or UI glitches
        const contentElements = page.locator('.ai-generated-content');
        const count = await contentElements.count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(5); // Should not exceed 5
    });

    test('Fallback on malformed AI response', async ({ page }) => {
        // Generate AI query functionality
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a button that handles malformed AI responses gracefully');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Click the AI query button
        const aiQueryButton = page.getByRole('button', { name: /Generate Content/i });
        await aiQueryButton.click();
        
        // Wait for fallback content to appear
        await page.waitForSelector('.fallback-content', { state: 'visible' });
        
        // Verify fallback message is displayed
        const fallbackMessage = page.getByText(/Unable to process AI response. Showing fallback content./i);
        await expect(fallbackMessage).toBeVisible();
        
        // Verify fallback content is displayed
        const fallbackContent = page.locator('.fallback-content');
        await expect(fallbackContent).toBeVisible();
    });
}); 