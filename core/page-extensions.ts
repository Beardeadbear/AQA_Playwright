import { Page } from '@playwright/test';
import { enhancedDragAndDrop, getComponentCount, waitForComponentAdded } from './drag-and-drop';
import { WIDGETS, WidgetPackage } from '../constants/widgets';

// Extend the Page interface
declare module '@playwright/test' {
  interface Page {
    dragAndDropComponent(componentIdentifier: string | WidgetPackage, options?: any): Promise<boolean>;
    getComponentCount(): Promise<number>;
    waitForComponentAdded(initialCount: number, timeout?: number): Promise<boolean>;
  }
}

// Extend Page prototype
export function extendPage(page: Page): void {
  // Add dragAndDropComponent method
  page.dragAndDropComponent = async function(componentIdentifier: string | WidgetPackage, options: any = {}) {
    return await enhancedDragAndDrop(this, componentIdentifier, options);
  };

  // Add getComponentCount method
  page.getComponentCount = async function() {
    return await getComponentCount(this);
  };

  // Add waitForComponentAdded method
  page.waitForComponentAdded = async function(initialCount: number, timeout: number = 10000) {
    return await waitForComponentAdded(this, initialCount, timeout);
  };
} 