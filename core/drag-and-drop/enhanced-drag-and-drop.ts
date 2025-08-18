/**
 * Enhanced drag and drop utility for Fliplet Studio components
 * Provides robust component placement with multiple fallback strategies
 */

import { Page, Locator, FrameLocator } from '@playwright/test';
import { WIDGETS, WidgetPackage, getWidgetByPackage } from '../../constants/widgets';

export interface DragAndDropOptions {
  /** Use package-based component selection instead of text matching */
  usePackageSelection?: boolean;
  /** Fire Fliplet events after drop (fallback mechanism) */
  fireFlipletEvents?: boolean;
  /** Use direct DOM manipulation as fallback */
  useDirectDOM?: boolean;
  /** Wait time between steps (ms) */
  stepDelay?: number;
  /** Target drop zone selector */
  dropZoneSelector?: string;
  /** Log detailed information */
  verbose?: boolean;
}

export interface ComponentData {
  widgetId: string;
  package: string;
  displayType: string;
  placeholderId: number;
}

/**
 * Performs enhanced drag and drop operation for Fliplet Studio components
 * @param page - Playwright page object
 * @param componentIdentifier - Component package name or widget identifier
 * @param options - Configuration options for the drag and drop operation
 * @returns Promise<boolean> - True if operation was successful
 */
export async function enhancedDragAndDrop(
  page: Page,
  componentIdentifier: string | WidgetPackage,
  options: DragAndDropOptions = {}
): Promise<boolean> {
  const {
    usePackageSelection = true,
    fireFlipletEvents = true,
    useDirectDOM = false,
    stepDelay = 500,
    dropZoneSelector = 'main[data-fl-drop-zone]',
    verbose = false
  } = options;

  const frame = page.frameLocator('#preview');
  
  try {
    if (verbose) {
      console.log(`🎯 Starting enhanced drag and drop for: ${componentIdentifier}`);
    }

    // Check if page is still open
    if (page.isClosed()) {
      throw new Error('Page has been closed');
    }

    // Step 0: Close any widget interfaces that might block interactions
    await closeWidgetInterfaces(page, verbose);
    
    // Step 0.5: Retry closing widget interfaces if they're still visible
    await page.waitForTimeout(1000);
    await closeWidgetInterfaces(page, verbose);

    // Step 1: Find the component to drag
    const componentLocator = await findComponent(page, componentIdentifier, usePackageSelection);
    if (!componentLocator) {
      throw new Error(`Component not found: ${componentIdentifier}`);
    }

    // Step 2: Get component data for Fliplet events
    const componentData = await extractComponentData(page, componentIdentifier, usePackageSelection);
    
    // Step 3: Activate drop zone
    await activateDropZone(page, frame, stepDelay, verbose);
    
    // Step 4: Perform drag and drop
    if (useDirectDOM && componentData) {
      // Use direct DOM manipulation (old framework approach)
      return await performDirectDOMDrop(frame, componentData, dropZoneSelector, fireFlipletEvents, verbose);
    } else {
      // Use mouse simulation (our current approach)
      return await performMouseSimulationDrop(page, frame, componentLocator, dropZoneSelector, stepDelay, verbose);
    }
  } catch (error) {
    console.error('❌ Enhanced drag and drop failed:', error);
    return false;
  }
}

/**
 * Find component by package name or text content
 */
async function findComponent(
  page: Page, 
  identifier: string | WidgetPackage, 
  usePackageSelection: boolean
): Promise<Locator | null> {
  if (usePackageSelection) {
    // Use package-based selection (more reliable)
    const packageName = typeof identifier === 'string' ? identifier : identifier;
    const component = page.locator(`div[data-package="${packageName}"]`).first();
    
    try {
      await component.waitFor({ state: 'visible', timeout: 10000 });
      return component;
    } catch {
      console.warn(`⚠️ Component with package "${packageName}" not found, falling back to text matching`);
      return findComponentByText(page, identifier);
    }
  } else {
    // Use text-based selection (current approach)
    return findComponentByText(page, identifier);
  }
}

/**
 * Find component by text content (current approach)
 */
function findComponentByText(page: Page, identifier: string): Locator | null {
  try {
    // Try to find by display name
    const widget = getWidgetByPackage(identifier);
    if (widget) {
      return page.getByRole('listitem').filter({ hasText: widget.displayName }).locator('div').nth(1);
    }
    
    // Fallback to direct text matching
    return page.getByRole('listitem').filter({ hasText: identifier }).first();
  } catch {
    return null;
  }
}

/**
 * Extract component data for Fliplet events
 */
async function extractComponentData(
  page: Page, 
  identifier: string | WidgetPackage, 
  usePackageSelection: boolean
): Promise<ComponentData | null> {
  try {
    if (usePackageSelection) {
      const packageName = typeof identifier === 'string' ? identifier : identifier;
      const component = page.locator(`div[data-package="${packageName}"]`).first();
      
      return await component.evaluate((el) => {
        const data = {
          widgetId: el.getAttribute('data-widget-id') || '',
          package: el.getAttribute('data-package') || '',
          displayType: el.getAttribute('data-display-type') || '',
          placeholderId: Date.now()
        };
        
        // Add placeholder ID to element for D&D to work
        el.setAttribute('data-placeholder-id', data.placeholderId.toString());
        
        return data;
      });
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Activate drop zone by hovering body then main
 */
async function activateDropZone(page: Page, frame: FrameLocator, stepDelay: number, verbose: boolean): Promise<void> {
  if (verbose) console.log('🔄 Activating drop zone...');
  
  try {
    // Check if page is still open
    if (page.isClosed()) {
      throw new Error('Page has been closed');
    }
    
    await frame.locator('body').hover();
    await page.waitForTimeout(stepDelay);
    
    await frame.locator('main').hover();
    await page.waitForTimeout(stepDelay);
    
    if (verbose) console.log('✅ Drop zone activated');
  } catch (error) {
    if (verbose) console.log('❌ Failed to activate drop zone:', error);
    throw error;
  }
}

/**
 * Perform drag and drop using mouse simulation
 */
async function performMouseSimulationDrop(
  page: Page,
  frame: FrameLocator,
  componentLocator: Locator,
  dropZoneSelector: string,
  stepDelay: number,
  verbose: boolean
): Promise<boolean> {
  if (verbose) console.log('🖱️ Using mouse simulation for drag and drop');
  
  // Start dragging
  await componentLocator.hover();
  await page.waitForTimeout(stepDelay);
  await page.mouse.down();
  await page.waitForTimeout(stepDelay);
  
  // Move to iframe center
  const iframeBox = await page.locator('#preview').boundingBox();
  if (iframeBox) {
    const centerX = iframeBox.x + iframeBox.width / 2;
    const centerY = iframeBox.y + iframeBox.height / 2;
    
    if (verbose) console.log(`📍 Moving mouse to iframe center: (${centerX}, ${centerY})`);
    await page.mouse.move(centerX, centerY);
    await page.waitForTimeout(stepDelay);
  }
  
  // Drop on target
  const dropTarget = frame.locator(dropZoneSelector);
  await dropTarget.hover();
  await page.waitForTimeout(stepDelay);
  await page.mouse.up();
  
  if (verbose) console.log('✅ Mouse simulation drop completed');
  return true;
}

/**
 * Perform drag and drop using direct DOM manipulation (old framework approach)
 */
async function performDirectDOMDrop(
  frame: FrameLocator,
  componentData: ComponentData,
  dropZoneSelector: string,
  fireFlipletEvents: boolean,
  verbose: boolean
): Promise<boolean> {
  if (verbose) console.log('🔧 Using direct DOM manipulation for drag and drop');
  
  try {
    // Execute DOM manipulation inside iframe with proper parameter passing
    await frame.locator('body').evaluate((body, data) => {
      // Create component HTML
      const componentHTML = `
        <div data-fl-widget-instance="true" 
             data-widget-id="${data.widgetId}"
             data-package="${data.package}"
             data-display-type="${data.displayType}"
             data-placeholder-id="${data.placeholderId}">
          <div class="widget-content">
            <p>${data.package} Component</p>
          </div>
        </div>
      `;
      
      // Parse HTML
      const doc = new DOMParser().parseFromString(componentHTML, 'text/html');
      const componentElement = doc.body.firstElementChild;
      
      if (!componentElement) {
        throw new Error('Failed to create component element');
      }
      
      // Find drop zone
      const dropzone = document.querySelector('main[data-fl-drop-zone]');
      if (!dropzone) {
        throw new Error('Drop zone not found');
      }
      
      // Insert component
      const firstComponent = dropzone.querySelectorAll('[data-name]')[0];
      if (firstComponent) {
        dropzone.insertBefore(componentElement, firstComponent);
      } else {
        dropzone.appendChild(componentElement);
      }
      
      // Fire Fliplet event if requested (using data property)
      if (data.shouldFireEvents) {
        const ev = new CustomEvent('FlStudioEvent', {
          detail: {
            type: 'widgetPlaced',
            target: dropzone,
            data: data
          }
        });
        document.dispatchEvent(ev);
      }
      
      return true;
    }, { ...componentData, shouldFireEvents: fireFlipletEvents });
    
    if (verbose) console.log('✅ Direct DOM drop completed');
    return true;
  } catch (error) {
    console.error('❌ Direct DOM drop failed:', error);
    return false;
  }
}



/**
 * Gets the current count of components on the screen
 * @param page - Playwright page object
 * @returns Promise<number> - Number of components currently on screen
 */
export async function getComponentCount(page: Page): Promise<number> {
  const frame = page.frameLocator('#preview');
  const components = frame.locator('[data-fl-widget-instance]');
  return await components.count();
}

/**
 * Closes any open widget interfaces that might block interactions
 * @param page - Playwright page object
 * @returns Promise<boolean> - True if interfaces were closed or none were found
 */
export async function closeWidgetInterfaces(page: Page, verbose: boolean): Promise<void> {
  try {
    // Check if page is still open
    if (page.isClosed()) {
      if (verbose) console.log('⚠️ Page is closed, skipping widget interface closing');
      return;
    }
    
    // Check for widget interface overlay
    const widgetInterface = page.locator('.widget-interface.show');
    const isVisible = await widgetInterface.isVisible();
    
    if (isVisible) {
      if (verbose) console.log('🔧 Closing widget interface overlay...');
      
      // Try multiple approaches to close the overlay
      try {
        // Method 1: Try to find and click the close button
        const closeButton = page.locator('.widget-interface.show .close-button, .widget-interface.show .btn-close, .widget-interface.show [data-dismiss="modal"], .widget-interface.show .close');
        
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
        } else {
          // Method 2: Try pressing Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
        
        // Method 3: Force close by hiding the overlay completely
        await page.evaluate(() => {
          const overlays = document.querySelectorAll('.widget-interface.show');
          overlays.forEach(overlay => {
            (overlay as HTMLElement).style.display = 'none';
            (overlay as HTMLElement).style.visibility = 'hidden';
            (overlay as HTMLElement).style.pointerEvents = 'none';
          });
        });
        await page.waitForTimeout(500);
        
        if (verbose) console.log('✅ Widget interface closed');
      } catch (closeError) {
        if (verbose) console.log('⚠️ Could not close widget interface with buttons, trying force close...');
        
        // Method 4: Force close by removing the overlay completely
        try {
          await page.evaluate(() => {
            const overlays = document.querySelectorAll('.widget-interface.show');
            overlays.forEach(overlay => {
              overlay.remove();
            });
          });
          await page.waitForTimeout(500);
          
          if (verbose) console.log('✅ Widget interface force closed');
        } catch (forceError) {
          if (verbose) console.log('⚠️ Could not force close widget interface:', forceError);
        }
      }
    }
  } catch (error) {
    if (verbose) console.log('⚠️ Could not close widget interface:', error);
  }
}

/**
 * Waits for a component to be added to the screen
 * @param page - Playwright page object
 * @param initialCount - Initial component count before adding new component
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise<boolean> - True if component was added within timeout
 */
export async function waitForComponentAdded(
  page: Page,
  initialCount: number,
  timeout: number = 10000
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const currentCount = await getComponentCount(page);
    if (currentCount > initialCount) {
      return true;
    }
    await page.waitForTimeout(500);
  }
  
  return false;
}

 