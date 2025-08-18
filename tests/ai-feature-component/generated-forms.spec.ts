import { test, expect } from '@playwright/test';
import { StudioAppsPage } from '../../page-objects/apps/studio-apps.page';
import { enhancedDragAndDrop } from '../../core/drag-and-drop';
import { WIDGETS } from '../../constants/widgets';

test.describe('AI Feature Component - Generated Forms Tests', () => {
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

    test('Generate form from prompt', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a user registration form with name, email, password, and confirm password fields');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview to see the generated form
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Verify form elements are present
        const nameInput = page.getByLabel(/Name/i);
        await expect(nameInput).toBeVisible();
        
        const emailInput = page.getByLabel(/Email/i);
        await expect(emailInput).toBeVisible();
        
        const passwordInput = page.getByLabel(/Password/i);
        await expect(passwordInput).toBeVisible();
        
        const confirmPasswordInput = page.getByLabel(/Confirm Password/i);
        await expect(confirmPasswordInput).toBeVisible();
        
        const submitButton = page.getByRole('button', { name: /Submit/i });
        await expect(submitButton).toBeVisible();
    });

    test('Required field validation', async ({ page }) => {
        // Generate a form with required fields
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a contact form with required name and email fields');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Try to submit without filling required fields
        const submitButton = page.getByRole('button', { name: /Submit/i });
        await submitButton.click();
        
        // Verify validation messages appear
        const nameError = page.getByText(/Name is required/i);
        await expect(nameError).toBeVisible();
        
        const emailError = page.getByText(/Email is required/i);
        await expect(emailError).toBeVisible();
    });

    test('Password / Confirm match', async ({ page }) => {
        // Generate a form with password confirmation
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a registration form with password and confirm password fields');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Fill password fields with different values
        const passwordInput = page.getByLabel(/Password/i);
        await passwordInput.fill('password123');
        
        const confirmPasswordInput = page.getByLabel(/Confirm Password/i);
        await confirmPasswordInput.fill('password456');
        
        // Try to submit
        const submitButton = page.getByRole('button', { name: /Submit/i });
        await submitButton.click();
        
        // Verify password mismatch error
        const passwordError = page.getByText(/Passwords do not match/i);
        await expect(passwordError).toBeVisible();
    });

    test('Email / phone / DoB validation', async ({ page }) => {
        // Generate a form with various validation fields
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a profile form with email, phone, and date of birth fields with validation');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Test invalid email
        const emailInput = page.getByLabel(/Email/i);
        await emailInput.fill('invalid-email');
        await emailInput.blur();
        
        const emailError = page.getByText(/Please enter a valid email address/i);
        await expect(emailError).toBeVisible();
        
        // Test invalid phone
        const phoneInput = page.getByLabel(/Phone/i);
        await phoneInput.fill('123');
        await phoneInput.blur();
        
        const phoneError = page.getByText(/Please enter a valid phone number/i);
        await expect(phoneError).toBeVisible();
        
        // Test invalid date of birth (too young)
        const dobInput = page.getByLabel(/Date of Birth/i);
        await dobInput.fill('2020-01-01');
        await dobInput.blur();
        
        const dobError = page.getByText(/You must be at least 18 years old/i);
        await expect(dobError).toBeVisible();
    });

    test('Inline validation feedback', async ({ page }) => {
        // Generate a form
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a form with real-time validation feedback');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Test real-time validation
        const emailInput = page.getByLabel(/Email/i);
        await emailInput.fill('test');
        
        // Verify immediate feedback
        const emailError = page.getByText(/Please enter a valid email address/i);
        await expect(emailError).toBeVisible();
        
        // Fix the email
        await emailInput.clear();
        await emailInput.fill('test@example.com');
        
        // Verify error disappears
        await expect(emailError).not.toBeVisible();
    });

    test('Success toast on submit', async ({ page }) => {
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
        
        // Verify success toast
        const successToast = page.getByText(/Form submitted successfully/i);
        await expect(successToast).toBeVisible();
    });

    test('Form resets after submit', async ({ page }) => {
        // Generate a form
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a contact form that resets after submission');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Fill the form
        const nameInput = page.getByLabel(/Name/i);
        await nameInput.fill('Jane Doe');
        
        const emailInput = page.getByLabel(/Email/i);
        await emailInput.fill('jane@example.com');
        
        // Submit the form
        const submitButton = page.getByRole('button', { name: /Submit/i });
        await submitButton.click();
        
        // Verify form fields are reset
        await expect(nameInput).toHaveValue('');
        await expect(emailInput).toHaveValue('');
    });

    test('Form error on DS failure', async ({ page }) => {
        // Generate a form that saves to data source
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a form that saves data to a data source');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Fill and submit form
        const nameInput = page.getByLabel(/Name/i);
        await nameInput.fill('Test User');
        
        const submitButton = page.getByRole('button', { name: /Submit/i });
        await submitButton.click();
        
        // Simulate data source failure (this would be handled by the component)
        // Verify error toast appears
        const errorToast = page.getByText(/Failed to save data. Please try again./i);
        await expect(errorToast).toBeVisible();
    });
}); 