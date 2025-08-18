/**
 * Widget package constants for Fliplet Studio
 * Categories extracted from actual Studio interface
 */

export interface WidgetConfig {
  readonly package: string;
  readonly displayName: string;
  readonly category: 'text' | 'layout' | 'images' | 'media' | 'lists' | 'grid' | 'slider' | 'buttons' | 'data-capture' | 'news' | 'data-visualization' | 'security' | 'portal' | 'data-management' | 'data-features' | 'others' | 'ai';
}

export const WIDGETS: Record<string, WidgetConfig> = {
  // Text Components
  TEXT: {
    package: 'com.fliplet.text',
    displayName: 'Text',
    category: 'text'
  },
  INLINE_LINK: {
    package: 'com.fliplet.inline-link',
    displayName: 'Inline Link',
    category: 'text'
  },

  // Layout Components
  CONTAINER: {
    package: 'com.fliplet.container',
    displayName: 'Container',
    category: 'layout'
  },
  INTERACTIVE_GRAPHICS: {
    package: 'com.fliplet.interactive-map',
    displayName: 'Interactive graphics',
    category: 'layout'
  },

  // Images Components
  IMAGE: {
    package: 'com.fliplet.image',
    displayName: 'Image',
    category: 'images'
  },
  GALLERY: {
    package: 'masonry-image-gallery',
    displayName: 'Gallery',
    category: 'images'
  },

  // Media Components
  OFFLINE_VIDEO: {
    package: 'com.fliplet.online-offline',
    displayName: 'Offline Video',
    category: 'media'
  },
  ONLINE_VIDEO: {
    package: 'com.fliplet.online-video',
    displayName: 'Online Video',
    category: 'media'
  },
  AUDIO_PLAYER: {
    package: 'com.fliplet.audio-player',
    displayName: 'Audio Player',
    category: 'media'
  },

  // Lists Components
  LIST_NO_IMAGES: {
    package: 'com.fliplet.simple-list',
    displayName: 'List (no images)',
    category: 'lists'
  },
  LIST_SMALL_THUMBNAILS: {
    package: 'com.fliplet.list-small-thumbs',
    displayName: 'List (small thumbnails)',
    category: 'lists'
  },
  LIST_LARGE_THUMBNAILS: {
    package: 'com.fliplet.list-large-thumbs',
    displayName: 'List (large thumbnails)',
    category: 'lists'
  },
  LIST_PANELS: {
    package: 'com.fliplet.panels',
    displayName: 'List (panels)',
    category: 'lists'
  },
  LIST_FROM_DATA_SOURCE: {
    package: 'com.fliplet.dynamic-lists',
    displayName: 'List (from data source)',
    category: 'lists'
  },

  // Grid Component
  GRID: {
    package: 'com.fliplet.metro',
    displayName: 'Grid',
    category: 'grid'
  },

  // Slider Component
  SLIDER: {
    package: 'com.fliplet.slider',
    displayName: 'Slider',
    category: 'slider'
  },

  // Buttons Components
  PRIMARY_BUTTON: {
    package: 'com.fliplet.primary-button',
    displayName: 'Primary Button',
    category: 'buttons'
  },
  SECONDARY_BUTTON: {
    package: 'com.fliplet.secondary-button',
    displayName: 'Secondary Button',
    category: 'buttons'
  },

  // Data Capture Components
  FORM_BUILDER: {
    package: 'com.fliplet.form-builder',
    displayName: 'Form',
    category: 'data-capture'
  },
  VERIFICATION_EMAIL: {
    package: 'com.fliplet.email-validation',
    displayName: 'Verification: Email',
    category: 'data-capture'
  },
  VERIFICATION_SMS: {
    package: 'com.fliplet.sms-verfication',
    displayName: 'Verification: SMS',
    category: 'data-capture'
  },

  // News Components
  RSS_FEED: {
    package: 'com.fliplet.rss',
    displayName: 'RSS Feed',
    category: 'news'
  },

  // Data Visualization Components
  CHART_COLUMN: {
    package: 'com.fliplet.chart.column',
    displayName: 'Chart: Column',
    category: 'data-visualization'
  },
  CHART_BAR: {
    package: 'com.fliplet.chart.bar',
    displayName: 'Chart: Bar',
    category: 'data-visualization'
  },
  CHART_PIE: {
    package: 'com.fliplet.chart.pie',
    displayName: 'Chart: Pie',
    category: 'data-visualization'
  },
  CHART_DONUT: {
    package: 'com.fliplet.chart.donut',
    displayName: 'Chart: Donut',
    category: 'data-visualization'
  },
  CHART_LINE: {
    package: 'com.fliplet.chart.line',
    displayName: 'Chart: Line',
    category: 'data-visualization'
  },
  CHART_SCATTER: {
    package: 'com.fliplet.chart.scatter',
    displayName: 'Chart: Scatter',
    category: 'data-visualization'
  },

  // Security Components
  LOCK: {
    package: 'com.fliplet.lock',
    displayName: 'Lock',
    category: 'security'
  },
  FLIPLET_LOGIN: {
    package: 'com.fliplet.login',
    displayName: 'Fliplet Login',
    category: 'security'
  },
  LOGIN: {
    package: 'com.fliplet.login-data-source',
    displayName: 'Login',
    category: 'security'
  },
  LOGIN_SAML2: {
    package: 'com.fliplet.login.saml2',
    displayName: 'SAML2 Login',
    category: 'security'
  },

  // Portal Components
  APP_LIST: {
    package: 'app-list',
    displayName: 'App List',
    category: 'portal'
  },

  // Data Management Components
  DATA_CONTAINER: {
    package: 'com.fliplet.data-container',
    displayName: 'Data container',
    category: 'data-management'
  },
  DATA_LIST: {
    package: 'com.fliplet.data-list',
    displayName: 'Data list',
    category: 'data-management'
  },
  SINGLE_DATA_RECORD: {
    package: 'com.fliplet.single-data-record',
    displayName: 'Single data record',
    category: 'data-management'
  },

  // Data Features Components
  DATA_TEXT: {
    package: 'com.fliplet.data-text',
    displayName: 'Data text',
    category: 'data-features'
  },
  DATA_IMAGE: {
    package: 'com.fliplet.data-image',
    displayName: 'Data image',
    category: 'data-features'
  },
  NOTIFICATIONS_BOX: {
    package: 'com.fliplet.notificationinbox',
    displayName: 'Notification inbox',
    category: 'data-features'
  },

  // Others Components
  ACCORDION_HEADING: {
    package: 'com.fliplet.accordionstart',
    displayName: 'Accordion Heading',
    category: 'others'
  },
  ACCORDION_END: {
    package: 'com.fliplet.accordionend',
    displayName: 'End of Accordion Group',
    category: 'others'
  },
  ONBOARDING: {
    package: 'com.fliplet.onboarding',
    displayName: 'Onboarding',
    category: 'others'
  },
  CHAT: {
    package: 'com.fliplet.chat',
    displayName: 'Chat',
    category: 'others'
  },

  // AI Components
  AI_FEATURE: {
    package: 'com.fliplet.ai-feature',
    displayName: 'AI feature',
    category: 'ai'
  }
} as const;

// Type-safe widget package names
export type WidgetPackage = typeof WIDGETS[keyof typeof WIDGETS]['package'];

// Helper functions
export function getWidgetByPackage(packageName: string): WidgetConfig | undefined {
  return Object.values(WIDGETS).find(widget => widget.package === packageName);
}

export function getWidgetsByCategory(category: WidgetConfig['category']): WidgetConfig[] {
  return Object.values(WIDGETS).filter(widget => widget.category === category);
}

export function getWidgetDisplayName(packageName: string): string | undefined {
  return getWidgetByPackage(packageName)?.displayName;
}

// Legacy compatibility (for migration)
export const WIDGET_PACKAGES = Object.fromEntries(
  Object.entries(WIDGETS).map(([key, config]) => [key, config.package])
) as Record<keyof typeof WIDGETS, string>; 