import { type Page, type Locator, expect } from '@playwright/test';

export class StudioAppsPage {
    readonly page: Page;
    
    // Navigation elements
    readonly myAppsLink: Locator;
    readonly appDataLink: Locator;
    readonly fileManagerLink: Locator;
    readonly adminLink: Locator;
    
    // Main content elements
    readonly newAppButton: Locator;
    readonly allAppsTab: Locator;
    readonly archivedAppsTab: Locator;
    readonly organizationDashboardLink: Locator;
    
    // App card elements (for each app)
    readonly appCards: Locator;
    
    // App actions (for each app)
    readonly editLink: Locator;
    readonly analyticsLink: Locator;
    readonly notificationsLink: Locator;
    readonly moreButton: Locator;
    readonly appUsageLink: Locator;
    readonly renameAppLink: Locator;
    readonly previewAppLink: Locator;
    readonly settingsLink: Locator;
    readonly duplicateAppLink: Locator;
    readonly manageUsersLink: Locator;
    readonly auditLogLink: Locator;
    readonly manageQueueLink: Locator;
    readonly archiveAppLink: Locator;
    
    // User menu elements
    readonly userMenuButton: Locator;
    readonly accountSettingsLink: Locator;
    readonly manageOrganizationLink: Locator;
    readonly logOutLink: Locator;
    
    // Notification elements
    readonly notificationIcon: Locator;
    readonly helpButton: Locator;
    
    // App creation overlay elements
    readonly useTemplateButton: Locator;
    readonly appNameInput: Locator;
    readonly createAppButton: Locator;

    constructor(page: Page) {
        this.page = page;
        
        // Navigation elements
        this.myAppsLink = page.getByRole('link', { name: 'My apps' });
        this.appDataLink = page.getByRole('link', { name: 'App data' });
        this.fileManagerLink = page.getByRole('link', { name: 'File manager' });
        this.adminLink = page.getByRole('button', { name: 'Admin' });
        
        // Main content elements
        this.newAppButton = page.getByText('New app');
        this.allAppsTab = page.getByRole('link', { name: 'All' });
        this.archivedAppsTab = page.getByRole('link', { name: 'Archived' });
        this.organizationDashboardLink = page.getByRole('link', { name: 'Organization dashboard' });
        
        // App cards
        this.appCards = page.locator('.app-card, [href*="/apps/"]');
        
        // App actions (generic locators)
        this.editLink = page.getByRole('link', { name: 'Edit' });
        this.analyticsLink = page.getByRole('link', { name: 'Analytics' });
        this.notificationsLink = page.getByRole('link', { name: 'Notifications' });
        this.moreButton = page.getByRole('button', { name: 'More' });
        this.appUsageLink = page.getByRole('link', { name: 'App usage' });
        this.renameAppLink = page.getByRole('link', { name: 'Rename app' });
        this.previewAppLink = page.getByRole('link', { name: 'Preview app' });
        this.settingsLink = page.getByRole('link', { name: 'Settings' });
        this.duplicateAppLink = page.getByRole('link', { name: 'Duplicate app' });
        this.manageUsersLink = page.getByRole('link', { name: 'Manage users' });
        this.auditLogLink = page.getByRole('link', { name: 'Audit log' });
        this.manageQueueLink = page.getByRole('link', { name: 'Manage queue' });
        this.archiveAppLink = page.getByRole('link', { name: 'Archive app' });
        
        // User menu elements
        this.userMenuButton = page.getByRole('button', { name: /ikolosov@fliplet\.com/ });
        this.accountSettingsLink = page.getByRole('link', { name: 'Account settings' });
        this.manageOrganizationLink = page.getByRole('link', { name: 'Manage organization' });
        this.logOutLink = page.getByRole('link', { name: 'Log out' });
        
        // Notification elements
        this.notificationIcon = page.getByRole('button', { name: '4' });
        this.helpButton = page.getByRole('button', { name: 'Help' });
        
        // App creation overlay elements
        this.useTemplateButton = page.getByText('Use template');
        this.appNameInput = page.locator('input[type="text"]').first();
        this.createAppButton = page.getByRole('button', { name: 'Create app' });
    }

    /**
     * Navigate to the Studio Apps page
     */
    async goto() {
        await this.page.goto('https://staging.studio.fliplet.com/apps');
        await this.expectToBeOnAppsPage();
    }

    /**
     * Verify user is on the Apps page
     */
    async expectToBeOnAppsPage() {
        await expect(this.page).toHaveURL(/.*\/apps$/);
        await expect(this.page).toHaveTitle(/My apps/);
        
        // Wait for the page to load
        await this.page.waitForLoadState('networkidle');
        
        // Check for elements that are always present on the apps page
        // Either the "New app" button should be visible
        await this.newAppButton.waitFor({ state: 'visible' });
        
        console.log('✅ Successfully verified we are on the apps page');
    }

    /**
     * Click New App button
     */
    async clickNewApp() {
        await this.newAppButton.click();
    }

    /**
     * Switch to All apps tab
     */
    async switchToAllApps() {
        await this.allAppsTab.click();
    }

    /**
     * Switch to Archived apps tab
     */
    async switchToArchivedApps() {
        await this.archivedAppsTab.click();
    }

    /**
     * Get app card by title
     */
    getAppCardByTitle(appTitle: string): Locator {
        return this.page.getByRole('link', { name: appTitle });
    }

    /**
     * Click on an app by title
     */
    async clickAppByTitle(appTitle: string) {
        const appCard = this.getAppCardByTitle(appTitle);
        await appCard.click();
    }

    /**
     * Edit an app by title
     */
    async editAppByTitle(appTitle: string) {
        const appCard = this.getAppCardByTitle(appTitle);
        await appCard.hover();
        await this.editLink.first().click();
    }

    /**
     * Preview an app by title
     */
    async previewAppByTitle(appTitle: string) {
        const appCard = this.getAppCardByTitle(appTitle);
        await appCard.hover();
        await this.previewAppLink.first().click();
    }

    /**
     * Open more options for an app by title
     */
    async openMoreOptionsForApp(appTitle: string) {
        const appCard = this.getAppCardByTitle(appTitle);
        await appCard.hover();
        await this.moreButton.first().click();
    }

    /**
     * Rename an app by title
     */
    async renameAppByTitle(appTitle: string) {
        await this.openMoreOptionsForApp(appTitle);
        await this.renameAppLink.first().click();
    }

    /**
     * Duplicate an app by title
     */
    async duplicateAppByTitle(appTitle: string) {
        await this.openMoreOptionsForApp(appTitle);
        await this.duplicateAppLink.first().click();
    }

    /**
     * Archive an app by title
     */
    async archiveAppByTitle(appTitle: string) {
        await this.openMoreOptionsForApp(appTitle);
        await this.archiveAppLink.first().click();
    }

    /**
     * Get all app titles
     */
    async getAppTitles(): Promise<string[]> {
        const appCards = this.page.locator('[href*="/apps/"]');
        const titles: string[] = [];
        
        for (let i = 0; i < await appCards.count(); i++) {
            const title = await appCards.nth(i).textContent();
            if (title && title.trim()) {
                titles.push(title.trim());
            }
        }
        
        return titles;
    }

    /**
     * Search for an app by title
     */
    async searchApp(appTitle: string): Promise<boolean> {
        const titles = await this.getAppTitles();
        return titles.some(title => title.includes(appTitle));
    }

    /**
     * Navigate to App Data
     */
    async navigateToAppData() {
        await this.appDataLink.click();
    }

    /**
     * Navigate to File Manager
     */
    async navigateToFileManager() {
        await this.fileManagerLink.click();
    }

    /**
     * Open Admin menu
     */
    async openAdminMenu() {
        await this.adminLink.click();
    }

    /**
     * Navigate to Organization Dashboard
     */
    async navigateToOrganizationDashboard() {
        await this.organizationDashboardLink.click();
    }

    /**
     * Open user menu
     */
    async openUserMenu() {
        await this.userMenuButton.click();
    }

    /**
     * Navigate to Account Settings
     */
    async navigateToAccountSettings() {
        await this.openUserMenu();
        await this.accountSettingsLink.click();
    }

    /**
     * Navigate to Manage Organization
     */
    async navigateToManageOrganization() {
        await this.openUserMenu();
        await this.manageOrganizationLink.click();
    }

    /**
     * Log out
     */
    async logOut() {
        await this.openUserMenu();
        await this.logOutLink.click();
    }

    /**
     * Open notifications
     */
    async openNotifications() {
        await this.notificationIcon.click();
    }

    /**
     * Open help
     */
    async openHelp() {
        await this.helpButton.click();
    }

    /**
     * Wait for apps to load
     */
    async waitForAppsToLoad() {
        // Wait for the page to be ready - either with apps or empty state
        await this.page.waitForLoadState('networkidle');
        
        // Check if we have apps or empty state
        try {
            // Try to find app cards first
            await this.page.waitForSelector('[href*="/apps/"]');
            console.log('✅ Apps found on page');
        } catch {
            // If no app cards, check for empty state message
            await expect(this.page.locator('text=You haven\'t created any apps yet.')).toBeVisible();
            console.log('✅ Empty apps state confirmed');
        }
    }

    /**
     * Get app count
     */
    async getAppCount(): Promise<number> {
        const appCards = this.page.locator('[href*="/apps/"]');
        return await appCards.count();
    }
    
    /**
     * Create a new app with the specified name
     * @param appName Name for the new app
     * @param useTemplate Whether to use a template (default: true)
     */
    async createNewApp(appName: string, useTemplate: boolean = true): Promise<void> {
        console.log(`🔨 Creating new app: ${appName}`);
        
        // Step 1: Click New App button
        await this.newAppButton.waitFor({ state: 'visible' });
        await this.newAppButton.click();
        console.log('✅ Clicked New app button');
        
        // Step 2: Click "Use template" button (if using template)
        if (useTemplate) {
            await this.useTemplateButton.waitFor({ state: 'visible' });
            await this.useTemplateButton.click();
            console.log('✅ Clicked Use template button');
        }
        
        // Step 3: Wait for app name input to be visible and fill it
        await this.appNameInput.waitFor({ state: 'visible' });
        await this.appNameInput.clear();
        await this.appNameInput.fill(appName);
        console.log(`✅ Filled app name: ${appName}`);
        
        // Step 4: Click Create app button
        await this.createAppButton.waitFor({ state: 'visible' });
        await this.createAppButton.click();
        console.log('✅ Clicked Create app button');
        
        // Step 5: Wait for app creation process to complete
        try {
            // Wait for either the app builder URL or stay on apps page
            await Promise.race([
                            this.page.waitForURL('**/apps/**/screens/**'),
            this.page.waitForURL('**/apps/**')
            ]);
            
            // Check if we successfully navigated to app builder
            const currentUrl = this.page.url();
            if (currentUrl.includes('/screens/')) {
                console.log(`✅ App "${appName}" created successfully and opened in builder`);
            } else {
                console.log(`⚠️ App creation may have failed - still on apps page`);
                // Check for any error dialogs
                const errorDialog = this.page.locator('text=Limit reached').or(this.page.locator('[role="dialog"]'));
                if (await errorDialog.isVisible()) {
                    throw new Error('App creation failed due to account limits or other restrictions');
                }
            }
        } catch (error) {
            console.error(`❌ App creation failed: ${error}`);
            throw error;
        }
    }
    
    /**
     * Verify that an app was created successfully by checking the URL and page content
     * @param appName Expected app name to verify
     */
    async verifyAppCreated(appName: string): Promise<void> {
        // Check URL contains app identifier
        await expect(this.page).toHaveURL(/.*\/apps\/.*\/screens.*/);
        
        // Check that we're in the app builder interface
        await expect(this.page.locator('body')).toContainText(appName);
        
        console.log(`✅ Verified app "${appName}" was created and is accessible`);
    }
    
    /**
     * Get the current app ID from the URL
     * @returns App ID string or null if not found
     */
    async getCurrentAppId(): Promise<string | null> {
        const url = this.page.url();
        const match = url.match(/\/apps\/(\d+)/);
        return match ? match[1] : null;
    }
    
    /**
     * Switch to Edit mode for the current app
     * This navigates from preview mode to edit mode
     */
    async switchToEditMode(): Promise<void> {
        const currentUrl = this.page.url();
        console.log(`🔄 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/preview')) {
            // We're in preview mode, need to switch to edit mode
            const appId = await this.getCurrentAppId();
            if (appId) {
                const editUrl = `https://staging.studio.fliplet.com/apps/${appId}/screens/`;
                console.log(`🔄 Switching to edit mode: ${editUrl}`);
                await this.page.goto(editUrl);
                await this.page.waitForLoadState('networkidle');
                console.log('✅ Switched to edit mode');
            }
        } else if (currentUrl.includes('/screens/')) {
            console.log('✅ Already in edit mode');
        } else {
            console.log('⚠️ Unknown app mode, trying to navigate to edit mode');
            const appId = await this.getCurrentAppId();
            if (appId) {
                const editUrl = `https://staging.studio.fliplet.com/apps/${appId}/screens/`;
                await this.page.goto(editUrl);
                await this.page.waitForLoadState('networkidle');
            }
        }
    }
    
    /**
     * Verify that we're in edit mode for the app
     * @param appName Expected app name to verify
     */
    async verifyInEditMode(appName: string): Promise<void> {
        // Check URL contains screens (edit mode)
        await expect(this.page).toHaveURL(/.*\/apps\/.*\/screens.*/);
        
        // Check that we're in the app builder interface
        await expect(this.page.locator('body')).toContainText(appName);
        
        console.log(`✅ Verified app "${appName}" is in edit mode`);
    }
} 