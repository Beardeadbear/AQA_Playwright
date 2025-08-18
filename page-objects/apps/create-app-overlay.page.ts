/**
 * Create App Overlay Page Object
 * Migrated from fliplet-e2e-tests-development/page-objects/createAppOverlay.js
 */

import { type Page, type Locator, expect } from '@playwright/test';

export interface CreateAppOptions {
    appName: string;
    useTemplate?: boolean;
    templateName?: string;
}

export class CreateAppOverlayPage {
    readonly page: Page;
    
    // Overlay elements
    readonly overlay: Locator;
    readonly overlayTitle: Locator;
    readonly closeButton: Locator;
    
    // Template selection
    readonly useTemplateButton: Locator;
    readonly templateOptions: Locator;
    readonly blankAppButton: Locator;
    
    // App configuration
    readonly appNameInput: Locator;
    readonly appNameLabel: Locator;
    readonly appDescriptionInput: Locator;
    readonly appDescriptionLabel: Locator;
    
    // Action buttons
    readonly createAppButton: Locator;
    readonly cancelButton: Locator;
    
    // Loading states
    readonly spinner: Locator;
    readonly loadingText: Locator;

    constructor(page: Page) {
        this.page = page;
        
        // Overlay elements
        this.overlay = page.locator('[role="dialog"], .modal, .overlay');
        this.overlayTitle = page.getByText(/Create.*app|New.*app/i);
        this.closeButton = page.getByRole('button', { name: /Close|×|Cancel/i });
        
        // Template selection
        this.useTemplateButton = page.getByText('Use template');
        this.templateOptions = page.locator('.template-option, [data-template]');
        this.blankAppButton = page.getByText('Blank app');
        
        // App configuration
        this.appNameInput = page.locator('input[type="text"], input[name*="name"], input[placeholder*="name"]').first();
        this.appNameLabel = page.getByText(/App name|Name/i);
        this.appDescriptionInput = page.locator('textarea, input[name*="description"], input[placeholder*="description"]');
        this.appDescriptionLabel = page.getByText(/Description/i);
        
        // Action buttons
        this.createAppButton = page.getByRole('button', { name: /Create.*app|Create/i });
        this.cancelButton = page.getByRole('button', { name: /Cancel/i });
        
        // Loading states
        this.spinner = page.locator('.spinner, .loading, [aria-busy="true"]');
        this.loadingText = page.getByText(/Creating|Loading/i);
    }

    /**
     * Wait for the create app overlay to be visible
     */
    async waitForOverlay(): Promise<void> {
        await this.overlay.waitFor({ state: 'visible', timeout: 10000 });
        await this.overlayTitle.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Create app overlay is visible');
    }

    /**
     * Check if the overlay is currently visible
     */
    async isOverlayVisible(): Promise<boolean> {
        try {
            await this.overlay.waitFor({ state: 'visible', timeout: 2000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Close the overlay
     */
    async closeOverlay(): Promise<void> {
        if (await this.isOverlayVisible()) {
            await this.closeButton.click();
            await this.overlay.waitFor({ state: 'hidden', timeout: 5000 });
            console.log('✅ Create app overlay closed');
        }
    }

    /**
     * Select template option
     */
    async selectTemplate(templateName?: string): Promise<void> {
        if (templateName) {
            // Select specific template
            const templateOption = this.page.getByText(templateName);
            await templateOption.waitFor({ state: 'visible', timeout: 5000 });
            await templateOption.click();
            console.log(`✅ Selected template: ${templateName}`);
        } else {
            // Use default template
            await this.useTemplateButton.waitFor({ state: 'visible', timeout: 5000 });
            await this.useTemplateButton.click();
            console.log('✅ Selected default template');
        }
    }

    /**
     * Create blank app (no template)
     */
    async createBlankApp(): Promise<void> {
        await this.blankAppButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.blankAppButton.click();
        console.log('✅ Selected blank app option');
    }

    /**
     * Fill app name
     */
    async fillAppName(appName: string): Promise<void> {
        await this.appNameInput.waitFor({ state: 'visible', timeout: 5000 });
        await this.appNameInput.clear();
        await this.appNameInput.fill(appName);
        console.log(`✅ Filled app name: ${appName}`);
    }

    /**
     * Fill app description
     */
    async fillAppDescription(description: string): Promise<void> {
        if (await this.appDescriptionInput.isVisible()) {
            await this.appDescriptionInput.clear();
            await this.appDescriptionInput.fill(description);
            console.log(`✅ Filled app description: ${description}`);
        }
    }

    /**
     * Get current app name value
     */
    async getAppName(): Promise<string> {
        return await this.appNameInput.inputValue();
    }

    /**
     * Get current app description value
     */
    async getAppDescription(): Promise<string> {
        if (await this.appDescriptionInput.isVisible()) {
            return await this.appDescriptionInput.inputValue();
        }
        return '';
    }

    /**
     * Click create app button
     */
    async clickCreateApp(): Promise<void> {
        await this.createAppButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.createAppButton.click();
        console.log('✅ Clicked create app button');
    }

    /**
     * Click cancel button
     */
    async clickCancel(): Promise<void> {
        await this.cancelButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.cancelButton.click();
        console.log('✅ Clicked cancel button');
    }

    /**
     * Wait for app creation to complete
     */
    async waitForCreationComplete(): Promise<void> {
        // Wait for either success (navigation) or error
        try {
            await Promise.race([
                this.page.waitForURL('**/apps/**/screens/**', { timeout: 30000 }),
                this.page.waitForURL('**/apps/**', { timeout: 30000 })
            ]);
            console.log('✅ App creation completed');
        } catch (error) {
            console.error('❌ App creation may have failed:', error);
            throw error;
        }
    }

    /**
     * Check for error messages
     */
    async checkForErrors(): Promise<string[]> {
        const errorMessages: string[] = [];
        
        // Common error selectors
        const errorSelectors = [
            '[role="alert"]',
            '.error-message',
            '.alert-danger',
            '.text-danger'
        ];
        
        for (const selector of errorSelectors) {
            const errorElements = this.page.locator(selector);
            const count = await errorElements.count();
            
            for (let i = 0; i < count; i++) {
                const text = await errorElements.nth(i).textContent();
                if (text && text.trim()) {
                    errorMessages.push(text.trim());
                }
            }
        }
        
        return errorMessages;
    }

    /**
     * Complete app creation process
     */
    async createApp(options: CreateAppOptions): Promise<void> {
        console.log(`🔨 Creating app: ${options.appName}`);
        
        // Wait for overlay
        await this.waitForOverlay();
        
        // Select template or blank app
        if (options.useTemplate !== false) {
            await this.selectTemplate(options.templateName);
        } else {
            await this.createBlankApp();
        }
        
        // Fill app details
        await this.fillAppName(options.appName);
        
        // Click create
        await this.clickCreateApp();
        
        // Wait for completion
        await this.waitForCreationComplete();
        
        console.log(`✅ App "${options.appName}" created successfully`);
    }

    /**
     * Verify app name validation
     */
    async verifyAppNameValidation(): Promise<void> {
        // Try to create with empty name
        await this.fillAppName('');
        await this.clickCreateApp();
        
        // Check for validation error
        const errors = await this.checkForErrors();
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(error => error.toLowerCase().includes('name'))).toBe(true);
        
        console.log('✅ App name validation working correctly');
    }

    /**
     * Get available template options
     */
    async getAvailableTemplates(): Promise<string[]> {
        const templates: string[] = [];
        
        if (await this.templateOptions.isVisible()) {
            const count = await this.templateOptions.count();
            
            for (let i = 0; i < count; i++) {
                const templateName = await this.templateOptions.nth(i).textContent();
                if (templateName && templateName.trim()) {
                    templates.push(templateName.trim());
                }
            }
        }
        
        return templates;
    }
} 