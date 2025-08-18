import { type Page, type Locator, expect } from '@playwright/test';

/**
 * SIMPLIFIED EditAppPage - Only Methods Actually Being Used
 * 
 * This simplified version follows the KISS principle:
 * - Keep only methods that are actually used in tests
 * - Focus on AI Feature component testing
 * - Easy to understand and remember
 * - No over-engineering
 */
export class EditAppPage {
  readonly page: Page;
  
  // Only the locators we actually need
  readonly componentsSidebar: Locator;
  readonly addComponentsTab: Locator;
  readonly screenStructureTab: Locator;
  readonly screenStructurePanel: Locator;
  readonly screenStructureItems: Locator;
  readonly widgetInterface: Locator;
  readonly previewIframe: any; // FrameLocator type

  constructor(page: Page) {
    this.page = page;

    // Only essential locators that are actually used
    this.componentsSidebar = page.locator('.app-side-view .side-content');
    this.addComponentsTab = page.locator('.side-nav .btn:has(img[src*="add-component"])');
    this.screenStructureTab = page.locator('.side-nav .btn:has(img[src*="parent-file"])');
    this.screenStructurePanel = page.locator('.side-view.app-page-structure');
    this.screenStructureItems = page.locator('.side-view.app-page-structure .dom-tree .draggable-item');
    this.widgetInterface = page.locator('.widget-interface');
    this.previewIframe = page.frameLocator('#preview');
  }

  /**
   * Wait for the edit page to fully load
   * Uses explicit waits instead of hardcoded timeouts
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForSelector('#preview');
    await expect(this.componentsSidebar).toBeVisible();
  }

  /**
   * Open the Screen Structure panel
   * Uses explicit waits and proper error handling
   */
  async openScreenStructure(): Promise<void> {
    // Close any open component settings overlay first
    const widgetInterface = this.page.locator('.widget-interface');
    if (await widgetInterface.isVisible()) {
      const closeButton = widgetInterface.locator('footer .btn-secondary');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        // Wait for overlay to close using explicit wait
        await expect(widgetInterface).not.toBeVisible();
      }
    }
    
    // Close any other open side views
    const openSideViews = this.page.locator('.side-view:not(.app-page-structure)');
    if (await openSideViews.count() > 0) {
      const closeButtons = openSideViews.locator('.closeSideView');
      for (let i = 0; i < await closeButtons.count(); i++) {
        const button = closeButtons.nth(i);
        if (await button.isVisible()) {
          await button.click();
          // Wait for each overlay to close before proceeding
          await expect(openSideViews.nth(i)).not.toBeVisible();
        }
      }
    }
    
    // Click the Screen Structure button in the sidebar
    await this.screenStructureTab.click();
    await expect(this.screenStructurePanel).toBeVisible();
  }

  /**
   * Open the Add Components panel
   * Closes any other open side panels first to avoid conflicts
   */
  async openAddComponents(): Promise<void> {
    // Close any other open side views first
    await this.closeSideBarOverlay();
    
    // Click the Add Components tab
    await this.addComponentsTab.click();
    await expect(this.componentsSidebar).toBeVisible();
  }



  /**
   * Close any open side-bar overlay
   * Uses explicit waits instead of hardcoded timeouts
   */
  async closeSideBarOverlay(): Promise<void> {
    // First, close any open side views that have close buttons
    const openSideViews = this.page.locator('.side-view');
    if (await openSideViews.count() > 0) {
      const closeButtons = openSideViews.locator('.closeSideView, .close, [aria-label="Close"], .btn-close');
      for (let i = 0; i < await closeButtons.count(); i++) {
        const button = closeButtons.nth(i);
        if (await button.isVisible()) {
          await button.click();
          // Wait for each overlay to close before proceeding
          await expect(openSideViews.nth(i)).not.toBeVisible();
        }
      }
    }
    
    // Also close any open side panels by clicking the active tab again (toggle behavior)
    const activeTab = this.page.locator('.side-nav .btn.active');
    if (await activeTab.count() > 0) {
      await activeTab.first().click();
      // Wait for the panel to close using explicit wait
      await expect(openSideViews.first()).not.toBeVisible();
    }
  }

  /**
   * Close any open screen overlay
   * Uses explicit waits instead of hardcoded timeouts
   */
  async closeScreenOverlay(): Promise<void> {
    const openOverlays = this.page.locator('.overlay, .modal');
    if (await openOverlays.count() > 0) {
      const closeButtons = openOverlays.locator('.close, [aria-label="Close"], .btn-close');
      for (let i = 0; i < await closeButtons.count(); i++) {
        const button = closeButtons.nth(i);
        if (await button.isVisible()) {
          await button.click();
          // Wait for each overlay to close before proceeding
          await expect(openOverlays.nth(i)).not.toBeVisible();
        }
      }
    }
  }

  /**
   * Close the widget interface overlay
   */
  async closeWidgetInterface(): Promise<void> {
    const widgetInterface = this.page.locator('.widget-interface');
    
    if (await widgetInterface.isVisible()) {
      // Use the real selector discovered via MCP server
      // The Close button is an <a> tag with classes 'btn btn-secondary'
      const closeButton = widgetInterface.locator('.btn.btn-secondary:has-text("Close")');
      await closeButton.click();
      
      // Wait for overlay to close
      await expect(widgetInterface).not.toBeVisible();
    }
  }

  /**
   * Find the AI Feature component in the components sidebar
   */
  async findAIFeatureComponent(): Promise<Locator> {
    // Use the real selector discovered via MCP server
    // The AI feature component is in the page-components sidebar with data-package="com.fliplet.ai-feature"
    return this.page.locator('.side-view.page-components .icon[data-package="com.fliplet.ai-feature"]');
  }

  /**
   * Check if the AI Feature component is visible in the components sidebar
   */
  async isAIFeatureComponentVisible(): Promise<boolean> {
    const aiFeatureComponent = await this.findAIFeatureComponent();
    return await aiFeatureComponent.isVisible();
  }

  /**
   * Check which side-bar tab is currently active
   * @returns The name of the active tab or null if none
   */
  async getActiveSideBarTab(): Promise<string | null> {
    // Use more stable selector - look for active tab by role or text
    const activeTab = this.page.locator('.side-nav .btn.active').or(
      this.page.locator('.side-nav .btn[aria-pressed="true"]')
    );
    if (await activeTab.count() > 0) {
      const tabText = await activeTab.getAttribute('title') || await activeTab.textContent();
      return tabText;
    }
    return null;
  }

  /**
   * Check if a specific side-bar overlay is currently open
   * @param overlayName - The name of the overlay to check
   * @returns True if the overlay is open
   */
  async isSideBarOverlayOpen(overlayName: string): Promise<boolean> {
    // Use more stable selector - look for overlay by text content
    const overlay = this.page.getByText(overlayName, { exact: false }).or(
      this.page.locator(`.side-view:has-text("${overlayName}")`)
    );
    return await overlay.isVisible();
  }

  /**
   * Check if a specific screen overlay is currently open
   * @param overlayName - The name of the overlay to check
   * @returns True if the overlay is open
   */
  async isScreenOverlayOpen(overlayName: string): Promise<boolean> {
    // Use more stable selector - look for overlay by text content
    const overlay = this.page.getByText(overlayName, { exact: false }).or(
      this.page.locator(`.overlay:has-text("${overlayName}"), .modal:has-text("${overlayName}")`)
    );
    return await overlay.isVisible();
  }

  /**
   * Close the Screen Structure panel
   */
  async closeScreenStructure(): Promise<void> {
    // Use more stable selector for close button
    const closeButton = this.screenStructurePanel.getByRole('button', { name: /close/i }).or(
      this.screenStructurePanel.locator('.closeSideView')
    );
    await closeButton.click();
  }

  /**
   * Find a component in the Screen Structure panel
   * @param componentName - The name of the component to find
   * @returns A locator for the component
   */
  async findComponentInStructure(componentName: string): Promise<Locator> {
    // Use more stable selector with fallback
    return this.page.locator(`.side-view.app-page-structure .draggable-item:has-text("${componentName}"):first`).or(
      this.page.getByText(componentName, { exact: false }).locator('xpath=ancestor::*[contains(@class, "draggable-item")]')
    );
  }

  /**
   * Delete a component from the Screen Structure panel
   * @param componentName - The name of the component to delete
   */
  async deleteComponentFromStructure(componentName: string): Promise<void> {
    const component = await this.findComponentInStructure(componentName);
    
    // Click on the component to select it
    await component.click();
    
    // Click the delete button using more stable selectors
    const deleteButton = this.page.getByRole('button', { name: /delete/i }).or(
      this.page.getByTitle('Delete').or(
        this.page.locator(`.side-view.app-page-structure .draggable-item:has-text("${componentName}") .button-control:last-child i.icon.fl-icon-trash`)
      )
    );
    await deleteButton.click();
    
    // Confirm deletion in modal using role-based selector
    const confirmButton = this.page.getByRole('button', { name: /Delete|Confirm/i });
    await confirmButton.click();
  }

  /**
   * Get all components in the Screen Structure panel
   * @returns Array of component names
   */
  async getComponentsInStructure(): Promise<string[]> {
    const items = await this.screenStructureItems.all();
    const names: string[] = [];
    
    for (const item of items) {
      const name = await item.textContent();
      if (name) {
        names.push(name.trim());
      }
    }
    
    return names;
  }

  /**
   * Get the preview iframe for interacting with the app content
   * @returns FrameLocator for the preview iframe
   */
  getPreviewFrame() {
    return this.previewIframe;
  }

} 