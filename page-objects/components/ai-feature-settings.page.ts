import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for AI Feature Component Settings Overlay
 * Handles all interactions with the AI Feature component settings interface
 * 
 * Structure discovered via MCP:
 * - Main container: #widget-instance → contentFrame() → overlay with "AI feature" text
 * - Data source selector: iframe[name="provider-*"] → contentFrame() → [role="combobox"]
 * - Prompt input: Directly in main overlay
 * - Action buttons: "Enhance prompt", "Save and Generate"
 * - Enhanced prompt sections: Generated text sections (not form inputs)
 */
export class AIFeatureSettingsPage {
  readonly page: Page;
  
  // Main container
  readonly widgetInstance: Locator;
  
  // AI Feature overlay container (contains the main settings)
  readonly aiFeatureOverlay: Locator;
  
  // Data source selector (nested in iframe - name is dynamic)
  readonly dataSourceCombobox: Locator;
  
  // Prompt input
  readonly promptTextbox: Locator;
  
  // Action buttons
  readonly enhancePromptButton: Locator;
  readonly saveAndGenerateButton: Locator;
  
  // Enhanced prompt sections (generated text sections, not form inputs)
  readonly enhancedPromptContainer: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Main widget instance container
    this.widgetInstance = page.locator('#widget-instance');
    
    // AI Feature overlay container (the one containing "AI feature" text)
    this.aiFeatureOverlay = this.widgetInstance.contentFrame().getByText('AI feature').locator('xpath=ancestor::*[contains(@class, "overlay") or contains(@class, "modal") or contains(@class, "dialog") or contains(@class, "panel") or contains(@class, "widget") or contains(@class, "interface")]').first();
    
    // Data source combobox (in nested iframe - name is dynamic like "provider-8530041")
    // We'll find it dynamically since the name changes
    this.dataSourceCombobox = this.widgetInstance.contentFrame().locator('iframe').first().contentFrame().getByRole('combobox');
    
    // Prompt input (directly in the main overlay)
    this.promptTextbox = this.aiFeatureOverlay.locator('textarea, input[type="text"], [role="textbox"]').first();
    
    // Action buttons
    this.enhancePromptButton = this.aiFeatureOverlay.getByRole('button', { name: 'Enhance prompt' });
    this.saveAndGenerateButton = this.aiFeatureOverlay.getByRole('button', { name: 'Save and Generate' });
    
    // Enhanced prompt container (where the generated sections appear)
    this.enhancedPromptContainer = this.aiFeatureOverlay.locator('[class*="enhanced"], [class*="generated"], .enhanced-prompt, .generated-prompt').first();
  }
  
  /**
   * Wait for the AI Feature settings overlay to be fully loaded
   */
  async waitForSettingsLoaded(): Promise<void> {
    await this.widgetInstance.waitFor({ state: 'visible' });
    await this.aiFeatureOverlay.waitFor({ state: 'visible' });
    await this.promptTextbox.waitFor({ state: 'visible' });
  }
  
  /**
   * Find and interact with the data source combobox in the nested iframe
   * The iframe name is dynamic, so we find it dynamically
   */
  async findDataSourceCombobox(): Promise<Locator> {
    // Look for iframes within the widget instance
    const iframes = this.widgetInstance.contentFrame().locator('iframe');
    const iframeCount = await iframes.count();
    
    for (let i = 0; i < iframeCount; i++) {
      const iframe = iframes.nth(i);
      try {
        const combobox = iframe.contentFrame().getByRole('combobox');
        if (await combobox.isVisible()) {
          return combobox;
        }
      } catch (error) {
        // Continue to next iframe
      }
    }
    
    throw new Error('Data source combobox not found in any iframe');
  }
  
  /**
   * Select a data source from the dropdown
   */
  async selectDataSource(dataSourceId: string): Promise<void> {
    const combobox = await this.findDataSourceCombobox();
    await combobox.waitFor({ state: 'visible' });
    await combobox.selectOption(dataSourceId);
  }
  
  /**
   * Fill in the prompt text
   */
  async fillPrompt(prompt: string): Promise<void> {
    await this.promptTextbox.waitFor({ state: 'visible' });
    await this.promptTextbox.fill(prompt);
  }
  
  /**
   * Click the Enhance Prompt button
   */
  async enhancePrompt(): Promise<void> {
    await this.enhancePromptButton.waitFor({ state: 'visible' });
    await this.enhancePromptButton.click();
  }
  
  /**
   * Wait for enhanced prompt sections to be generated and visible
   */
  async waitForEnhancedPromptGenerated(): Promise<void> {
    // Wait for the enhanced prompt container to appear
    await this.enhancedPromptContainer.waitFor({ state: 'visible', timeout: 30000 });
  }
  
  /**
   * Get the generated enhanced prompt text
   */
  async getEnhancedPromptText(): Promise<string> {
    await this.waitForEnhancedPromptGenerated();
    return await this.enhancedPromptContainer.textContent() || '';
  }
  
  /**
   * Check if enhanced prompt sections are visible
   */
  async isEnhancedPromptVisible(): Promise<boolean> {
    return await this.enhancedPromptContainer.isVisible();
  }
  
  /**
   * Click Save and Generate button
   */
  async saveAndGenerate(): Promise<void> {
    await this.saveAndGenerateButton.waitFor({ state: 'visible' });
    await this.saveAndGenerateButton.click();
  }
  
  /**
   * Get the current prompt text
   */
  async getPromptText(): Promise<string> {
    return await this.promptTextbox.inputValue();
  }
  
  /**
   * Check if the save and generate button is enabled
   */
  async isSaveAndGenerateEnabled(): Promise<boolean> {
    return await this.saveAndGenerateButton.isEnabled();
  }
  
  /**
   * Get the current data source selection text
   */
  async getDataSourceSelection(): Promise<string> {
    const combobox = await this.findDataSourceCombobox();
    return await combobox.textContent() || '';
  }
  
  /**
   * Check if any data source is selected
   */
  async hasDataSourceSelected(): Promise<boolean> {
    const selection = await this.getDataSourceSelection();
    return !selection.includes('No data source found') && !selection.includes('-- Select data source');
  }
}
