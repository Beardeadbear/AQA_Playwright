import { test, expect } from '@playwright/test';
import { StudioAppsPage } from '../../page-objects/apps/studio-apps.page';
import { enhancedDragAndDrop } from '../../core/drag-and-drop';
import { WIDGETS } from '../../constants/widgets';

test.describe('AI Feature Component - Code Generation Tests', () => {
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

    test('Valid prompt → code generation', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a simple contact form with name, email, and message fields');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await expect(saveGenerateButton).toBeEnabled();
        
        await saveGenerateButton.click();
        
        // Wait for generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Verify code was generated
        const generatedCode = page.locator('.generated-code');
        await expect(generatedCode).toBeVisible();
        
        // Verify the generated content contains expected elements
        const codeContent = await generatedCode.textContent();
        expect(codeContent).toContain('form');
        expect(codeContent).toContain('input');
    });

    test('Empty prompt → error toast', async ({ page }) => {
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        const errorMessage = page.getByText(/Please enter a prompt/i);
        await expect(errorMessage).toBeVisible();
    });

    test('Invalid prompt → fallback message', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Invalid prompt that should not generate anything');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for generation attempt
        await page.waitForTimeout(2000);
        
        // Verify fallback message appears
        const fallbackMessage = page.getByText(/Unable to generate code for this prompt/i);
        await expect(fallbackMessage).toBeVisible();
    });

    test('Preview output of generated code', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a simple button with "Click me" text');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Check preview tab
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Verify preview content is visible
        const previewContent = page.locator('.preview-content');
        await expect(previewContent).toBeVisible();
        
        // Verify the preview shows the generated button
        const generatedButton = previewContent.getByRole('button', { name: /Click me/i });
        await expect(generatedButton).toBeVisible();
    });

    test('Code view panel shows code', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a simple div with "Hello World" text');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Check code tab
        const codeTab = page.getByRole('tab', { name: /Code/i });
        await codeTab.click();
        
        // Verify code panel is visible
        const codePanel = page.locator('.code-panel');
        await expect(codePanel).toBeVisible();
        
        // Verify code content is displayed
        const codeContent = await codePanel.textContent();
        expect(codeContent).toContain('<div>');
        expect(codeContent).toContain('Hello World');
    });

    test('Re-generate after editing prompt', async ({ page }) => {
        // First generation
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a simple paragraph');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for first generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Edit the prompt
        await promptInput.clear();
        await promptInput.fill('Create a heading with "Updated Title"');
        
        // Re-generate
        await saveGenerateButton.click();
        
        // Wait for second generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Verify new code was generated
        const generatedCode = page.locator('.generated-code');
        const codeContent = await generatedCode.textContent();
        expect(codeContent).toContain('Updated Title');
        expect(codeContent).toContain('<h');
    });
}); 