import { test, expect } from '@playwright/test';
import { StudioAppsPage } from '../../page-objects/apps/studio-apps.page';
import { EditAppPage } from '../../page-objects/apps/edit-app.page';
import { AIFeatureSettingsPage } from '../../page-objects/components/ai-feature-settings.page';
import { 
    addAIComponent, 
    verifyComponentVisible, 
    verifyComponentCount 
} from '../../core/ai-component.helpers';

test.describe('AI Feature Component - Integration Tests', () => {
    let studioAppsPage: StudioAppsPage;
    let editAppPage: EditAppPage;
    let aiFeatureSettingsPage: AIFeatureSettingsPage;

    test.beforeEach(async ({ page }) => {
        studioAppsPage = new StudioAppsPage(page);
        editAppPage = new EditAppPage(page);
        aiFeatureSettingsPage = new AIFeatureSettingsPage(page);
        
        await studioAppsPage.goto();
        
        const appLink = page.getByRole('link', { name: /AI-Test-App/ });
        await appLink.waitFor({ state: 'visible' });
        await appLink.click();
        
        await editAppPage.waitForPageLoad();
    });

    test('Component visible in component list', async ({ page }) => {
        await editAppPage.openAddComponents();
        
        const aiFeatureComponent = editAppPage.componentsSidebar
            .locator('p')
            .filter({ hasText: 'AI feature' })
            .filter({ hasNotText: 'Dev' })
            .first();
        
        await expect(aiFeatureComponent).toBeVisible();
        expect(await aiFeatureComponent.textContent()).toContain('AI feature');
        
        await editAppPage.closeSideBarOverlay();
    });

    test('Add component to screen', async ({ page }) => {
        const initialCount = await addAIComponent(page);
        await verifyComponentVisible(page, editAppPage);
        await verifyComponentCount(page, initialCount + 1);
    });

    test('Component persists after page reload', async ({ page }) => {
        const initialCount = await addAIComponent(page);
        await verifyComponentVisible(page, editAppPage);
        
        await page.reload();
        await editAppPage.waitForPageLoad();
        
        await verifyComponentVisible(page, editAppPage);
    });

    test('Delete component from screen structure', async ({ page }) => {
        const initialCount = await addAIComponent(page);
        await editAppPage.closeWidgetInterface();
        await editAppPage.closeSideBarOverlay();
        
        await editAppPage.openScreenStructure();
        await editAppPage.deleteComponentFromStructure('AI feature');
        await editAppPage.closeScreenStructure();
        
        await verifyComponentCount(page, initialCount);
    });

    test('Delete component from screen preview', async ({ page }) => {
        const initialCount = await addAIComponent(page);
        await editAppPage.closeWidgetInterface();
        
        const frame = editAppPage.getPreviewFrame();
        const aiComponent = frame.locator('[data-widget-package="com.fliplet.ai-feature"]');
        
        await aiComponent.hover();
        await page.getByTitle('Delete component').click();
        await page.getByRole('button', { name: 'Delete component' }).click();
        
        await verifyComponentCount(page, initialCount);
        await expect(aiComponent).not.toBeVisible();
    });

    test('Re-add component after deletion', async ({ page }) => {
        const initialCount = await addAIComponent(page);
        await editAppPage.closeWidgetInterface();
        await editAppPage.closeSideBarOverlay();
        
        // Delete component
        await editAppPage.openScreenStructure();
        await editAppPage.deleteComponentFromStructure('AI feature');
        await editAppPage.closeScreenStructure();
        await verifyComponentCount(page, initialCount);
        
        // Re-add component
        const newInitialCount = await addAIComponent(page);
        await verifyComponentVisible(page, editAppPage);
        await verifyComponentCount(page, newInitialCount + 1);
    });
}); 