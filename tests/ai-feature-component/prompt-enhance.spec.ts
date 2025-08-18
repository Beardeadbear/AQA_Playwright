import { test, expect } from '@playwright/test';
import { StudioAppsPage } from '../../page-objects/apps/studio-apps.page';
import { enhancedDragAndDrop } from '../../core/drag-and-drop';
import { WIDGETS } from '../../constants/widgets';

test.describe('AI Feature Component - Prompt Enhancement Tests', () => {
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

    test('"Enhance Prompt" button is visible', async ({ page }) => {
        const enhancePromptButton = page.getByRole('button', { name: /Enhance Prompt/i });
        await expect(enhancePromptButton).toBeVisible();
    });

    test('Prompt fields: Core Goal, Context, etc.', async ({ page }) => {
        const enhancePromptButton = page.getByRole('button', { name: /Enhance Prompt/i });
        await enhancePromptButton.click();
        
        const categories = [
            'Core Goal',
            'Context', 
            'Functional Requirements',
            'UI & UX Guidelines',
            'Accessibility'
        ];
        
        for (const category of categories) {
            const categoryElement = page.getByText(category, { exact: false });
            await expect(categoryElement).toBeVisible();
        }
    });

    test('Edit + persist enhanced prompt sections', async ({ page }) => {
        const enhancePromptButton = page.getByRole('button', { name: /Enhance Prompt/i });
        await enhancePromptButton.click();
        
        // Fill in enhanced prompt sections
        const coreGoalInput = page.getByLabel(/Core Goal/i);
        await coreGoalInput.fill('Create a user registration form');
        
        const contextInput = page.getByLabel(/Context/i);
        await contextInput.fill('For a mobile app with user authentication');
        
        const functionalRequirementsInput = page.getByLabel(/Functional Requirements/i);
        await functionalRequirementsInput.fill('Email, password, confirm password fields with validation');
        
        const uiGuidelinesInput = page.getByLabel(/UI & UX Guidelines/i);
        await uiGuidelinesInput.fill('Clean, modern design with clear error messages');
        
        const accessibilityInput = page.getByLabel(/Accessibility/i);
        await accessibilityInput.fill('ARIA labels and keyboard navigation support');
        
        // Save the enhanced prompt
        const saveButton = page.getByRole('button', { name: /Save/i });
        await saveButton.click();
        
        // Verify the enhanced prompt is persisted
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await expect(promptInput).toHaveValue(/Create a user registration form.*mobile app.*authentication.*validation.*modern design.*ARIA labels/i);
    });

    test('Warning on missing required fields', async ({ page }) => {
        const enhancePromptButton = page.getByRole('button', { name: /Enhance Prompt/i });
        await enhancePromptButton.click();
        
        // Try to save without filling required fields
        const saveButton = page.getByRole('button', { name: /Save/i });
        await saveButton.click();
        
        // Verify warning message appears
        const warningMessage = page.getByText(/Please fill in all required fields/i);
        await expect(warningMessage).toBeVisible();
    });

    test('Edit prompt after generation and re-save', async ({ page }) => {
        // First generate some code
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a simple contact form');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Now edit the prompt using enhance prompt
        const enhancePromptButton = page.getByRole('button', { name: /Enhance Prompt/i });
        await enhancePromptButton.click();
        
        // Modify the enhanced prompt
        const coreGoalInput = page.getByLabel(/Core Goal/i);
        await coreGoalInput.fill('Create an advanced contact form with file upload');
        
        // Save the modified prompt
        const saveButton = page.getByRole('button', { name: /Save/i });
        await saveButton.click();
        
        // Verify the prompt was updated
        await expect(promptInput).toHaveValue(/advanced contact form.*file upload/i);
        
        // Re-generate with the new prompt
        await saveGenerateButton.click();
        
        // Verify new generation completed
        await page.waitForSelector('.generated-code', { state: 'visible' });
    });
}); 