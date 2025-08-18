/**
 * AI Prompts Fixtures
 * Centralized storage for AI Feature component test prompts
 */

export interface AIPrompt {
    id: string;
    description: string;
    prompt: string;
    expectedOutcome?: string;
    category?: 'basic' | 'complex' | 'error' | 'validation';
}

export interface EnhancedPromptData {
    coreGoal: string;
    context: string;
    targetAudience?: string;
    tone?: string;
    style?: string;
}

export interface AIPromptFixture {
    basicPrompts: AIPrompt[];
    complexPrompts: AIPrompt[];
    errorPrompts: AIPrompt[];
    validationPrompts: AIPrompt[];
    enhancedPrompts: EnhancedPromptData[];
    formPrompts: AIPrompt[];
    directoryPrompts: AIPrompt[];
}

/**
 * Structured examples for the "Enhance Prompt" output, based on the test plan's Section 7
 * These capture the target categories: Core Goal, Functional Requirements, UI & UX Guidelines, Accessibility
 */
export interface EnhancedPromptExample {
    userInput: string;
    ideal: {
        coreGoal: string;
        functionalRequirements: string[];
        uiUxGuidelines: string[];
        accessibility: string[];
        context?: string;
    };
}

/**
 * Basic prompts for simple AI interactions
 */
export const basicPrompts: AIPrompt[] = [
    {
        id: 'welcome-message',
        description: 'Simple welcome message with bold text',
        prompt: 'Create a simple welcome message with bold text.',
        expectedOutcome: 'Welcome message with HTML bold tags',
        category: 'basic'
    },
    {
        id: 'greeting',
        description: 'Basic greeting message',
        prompt: 'Generate a friendly greeting message.',
        expectedOutcome: 'Friendly greeting text',
        category: 'basic'
    },
    {
        id: 'button-text',
        description: 'Button text generation',
        prompt: 'Create text for a "Submit" button.',
        expectedOutcome: 'Submit button text',
        category: 'basic'
    }
];

/**
 * Complex prompts for advanced AI interactions
 */
export const complexPrompts: AIPrompt[] = [
    {
        id: 'multi-section-content',
        description: 'Complex content with multiple sections',
        prompt: 'Create a landing page with header, main content, and footer sections. Include navigation menu and call-to-action buttons.',
        expectedOutcome: 'Structured HTML with multiple sections',
        category: 'complex'
    },
    {
        id: 'interactive-form',
        description: 'Interactive form with validation',
        prompt: 'Generate a contact form with name, email, phone, and message fields. Include client-side validation and submit button.',
        expectedOutcome: 'Form with validation and styling',
        category: 'complex'
    },
    {
        id: 'data-table',
        description: 'Data table with sorting',
        prompt: 'Create a responsive data table with columns for ID, Name, Email, and Status. Include sorting functionality.',
        expectedOutcome: 'Interactive data table',
        category: 'complex'
    }
];

/**
 * Error-inducing prompts for testing error handling
 */
export const errorPrompts: AIPrompt[] = [
    {
        id: 'empty-prompt',
        description: 'Empty prompt to test validation',
        prompt: '',
        expectedOutcome: 'Validation error message',
        category: 'error'
    },
    {
        id: 'invalid-request',
        description: 'Invalid or malformed request',
        prompt: 'Generate content with invalid syntax: <script>alert("test")</script>',
        expectedOutcome: 'Error handling for invalid input',
        category: 'error'
    },
    {
        id: 'unsupported-feature',
        description: 'Request for unsupported feature',
        prompt: 'Create a 3D holographic interface with quantum computing integration.',
        expectedOutcome: 'Error message about unsupported features',
        category: 'error'
    }
];

/**
 * Validation prompts for testing input validation
 */
export const validationPrompts: AIPrompt[] = [
    {
        id: 'min-length',
        description: 'Prompt below minimum length',
        prompt: 'Hi',
        expectedOutcome: 'Minimum length validation error',
        category: 'validation'
    },
    {
        id: 'max-length',
        description: 'Prompt exceeding maximum length',
        prompt: 'A'.repeat(10000), // Very long prompt
        expectedOutcome: 'Maximum length validation error',
        category: 'validation'
    },
    {
        id: 'special-characters',
        description: 'Prompt with special characters',
        prompt: 'Create content with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        expectedOutcome: 'Proper handling of special characters',
        category: 'validation'
    }
];

/**
 * Enhanced prompt data for testing the "Enhance Prompt" feature
 */
export const enhancedPrompts: EnhancedPromptData[] = [
    {
        coreGoal: 'Create a user registration form',
        context: 'Mobile app for event management',
        targetAudience: 'Event organizers and attendees',
        tone: 'Professional and welcoming',
        style: 'Modern and clean'
    },
    {
        coreGoal: 'Build a product catalog',
        context: 'E-commerce website',
        targetAudience: 'Online shoppers',
        tone: 'Informative and persuasive',
        style: 'Professional with clear CTAs'
    },
    {
        coreGoal: 'Design a dashboard',
        context: 'Analytics platform',
        targetAudience: 'Business analysts',
        tone: 'Data-driven and analytical',
        style: 'Clean and data-focused'
    }
];

/**
 * Enhance Prompt output examples from the test plan (curated and structured)
 */
export const enhancedPromptFormExamples: EnhancedPromptExample[] = [
  {
    userInput: 'Create a form that collects user data and stores it in a data source called “test users”',
    ideal: {
      coreGoal: 'Create a user data collection form that captures necessary fields and submits them to the “test users” data source.',
      functionalRequirements: [
        'Input fields for first name, last name, email address, phone number, and optional notes',
        'Submit button that triggers form validation and data submission',
        'Reset button to clear all input fields',
        'Inline validation for required fields and proper email/phone formats',
        'Success message on successful submission and error message on failure',
        'Disabled submit button while submission is in progress',
        'Responsive layout that adapts to mobile and desktop screens'
      ],
      uiUxGuidelines: [
        'Place form title at top; group related fields; position submit/reset buttons at the bottom',
        'Label each input clearly above the field, with placeholder text for guidance',
        'Use consistent spacing and alignment for form fields',
        'Highlight focused input with a subtle border or shadow',
        'Display inline validation messages directly beneath invalid fields',
        'Show global feedback (success or error) in a banner after submission',
        'Distinct styles for primary (submit) and secondary (reset) buttons',
        'Design empty and error states with clear messaging',
        'Maintain consistency with app design tokens'
      ],
      accessibility: [
        'Use semantic form, label, and button elements with proper for/id associations',
        'Provide ARIA-live region for submission feedback messages',
        'Ensure keyboard focus order and focus indicators; Enter submits when valid',
        'Maintain contrast ratios of at least 4.5:1 for text and interactive elements',
        'Use aria-invalid on invalid fields and aria-describedby to link validation messages',
        'Announce error and success states to screen readers via ARIA alerts'
      ]
    }
  }
];

export const enhancedPromptDashboardExamples: EnhancedPromptExample[] = [
  {
    userInput: 'Create a data dashboard that shows a pie chart for users. You can get the data from "test users". Show a pie chart of the breakdown of title and Department',
    ideal: {
      coreGoal: 'Create a clean, interactive data dashboard that displays a pie chart breaking down users by title and by department.',
      functionalRequirements: [
        'Pie chart showing two breakdown modes: Title and Department',
        'Toggle control or tabs to switch between Title and Department views',
        'Legend indicating each slice’s label and color',
        'Hover state tooltips with category name, count, and percentage',
        'Clickable slices for drill-down or filtering placeholders',
        'Loading state while fetching data from “test users” and error state with retry',
        'Responsive layout for desktop and tablet breakpoints',
        'Export or download button for chart as image or CSV'
      ],
      uiUxGuidelines: [
        'Page header “User Breakdown Dashboard,” followed by toggle control, then chart and legend',
        'Consistent color palette with accessible contrast; distinct colors for each slice',
        'Smooth micro-interactions for hover and transitions',
        'Clear navigation flow: toggle → chart update → optional drill-down',
        'Accessible, readable tooltip design with padding and formatted text',
        'Empty-state illustration or message when no user data is available'
      ],
      accessibility: [
        'Provide an ARIA region with descriptive label for the chart',
        'Chart slices have aria-labels describing category, percent, and count',
        'Keyboard navigation to toggle and controls; focus indicators on interactive elements',
        'Tooltips accessible via keyboard focus and screen readers',
        'Provide text alternatives: hidden table with the same breakdown data',
        'Ensure export/download button has an aria-label describing its function'
      ]
    }
  }
];

export const enhancedPromptMobileListExamples: EnhancedPromptExample[] = [
  {
    userInput: 'Create a mobile optimised list that shows data from the test user data source. I want the email, first name, last name and title shown on the cards',
    ideal: {
      coreGoal: 'Display a mobile-optimized vertical list of user cards showing email, first name, last name, and title from the test user data source.',
      functionalRequirements: [
        'Card layout with full name emphasized, followed by title and email',
        'Scrollable list optimized for touch interaction on mobile devices',
        'Loading state (spinner or skeleton cards) while fetching data',
        'Empty state with message and icon when no users are available',
        'Error state with retry action',
        'Tap state feedback (ripple or highlight)',
        'Responsive padding and margins for mobile screens',
        'Optional pull-to-refresh to reload data'
      ],
      uiUxGuidelines: [
        'Emphasize full name in bold, title in medium, email in smaller muted text',
        'Rounded card design with subtle shadow and consistent spacing',
        'Legible font sizes (e.g., 16px name, 14px title, 12px email)',
        'High-contrast text on light background; accent color for interactive states',
        'Smooth micro-interactions for scrolling and card elevation on touch',
        'Consistent spacing, font, and color tokens with the app'
      ],
      accessibility: [
        'Use semantic list and listitem roles for the list and cards',
        'Cards focusable with tabindex="0" and clear focus indicator',
        'Maintain contrast ratio of at least 4.5:1 for text',
        'Screen-reader support via aria-labelledby on each card (name, title, email)',
        'Announce loading and error states via aria-live="polite"'
      ]
    }
  }
];

// Combined export for convenience and DRY imports in tests
export const enhancedPromptExamples: EnhancedPromptExample[] = [
  ...enhancedPromptFormExamples,
  ...enhancedPromptDashboardExamples,
  ...enhancedPromptMobileListExamples
];

/**
 * Form-specific prompts for testing form generation
 */
export const formPrompts: AIPrompt[] = [
    {
        id: 'registration-form',
        description: 'User registration form with validation',
        prompt: 'Create a user registration form with fields for name, email, password, and confirm password. Include validation for required fields, email format, and password matching.',
        expectedOutcome: 'Form with validation rules',
        category: 'complex'
    },
    {
        id: 'contact-form',
        description: 'Contact form with multiple fields',
        prompt: 'Generate a contact form with name, email, subject, and message fields. Include proper labels and validation.',
        expectedOutcome: 'Contact form with validation',
        category: 'complex'
    },
    {
        id: 'survey-form',
        description: 'Survey form with different input types',
        prompt: 'Create a survey form with text inputs, radio buttons, checkboxes, and a textarea for comments.',
        expectedOutcome: 'Survey form with various input types',
        category: 'complex'
    }
];

/**
 * Directory listing prompts for testing directory functionality
 */
export const directoryPrompts: AIPrompt[] = [
    {
        id: 'file-directory',
        description: 'File directory listing',
        prompt: 'Create a directory listing component that displays files and folders with icons, names, sizes, and modification dates.',
        expectedOutcome: 'Directory listing component',
        category: 'complex'
    },
    {
        id: 'user-directory',
        description: 'User directory with search',
        prompt: 'Generate a user directory with search functionality, displaying user avatars, names, roles, and contact information.',
        expectedOutcome: 'Searchable user directory',
        category: 'complex'
    },
    {
        id: 'product-directory',
        description: 'Product catalog directory',
        prompt: 'Create a product directory with filtering options, displaying product images, names, prices, and categories.',
        expectedOutcome: 'Filterable product directory',
        category: 'complex'
    }
];

/**
 * Complete AI prompts fixture
 */
export const aiPromptsFixture: AIPromptFixture = {
    basicPrompts,
    complexPrompts,
    errorPrompts,
    validationPrompts,
    enhancedPrompts,
    formPrompts,
    directoryPrompts
};

/**
 * Helper function to get a prompt by ID
 */
export function getPromptById(id: string): AIPrompt | undefined {
    const allPrompts = [
        ...basicPrompts,
        ...complexPrompts,
        ...errorPrompts,
        ...validationPrompts,
        ...formPrompts,
        ...directoryPrompts
    ];
    return allPrompts.find(prompt => prompt.id === id);
}

/**
 * Helper function to get prompts by category
 */
export function getPromptsByCategory(category: AIPrompt['category']): AIPrompt[] {
    const allPrompts = [
        ...basicPrompts,
        ...complexPrompts,
        ...errorPrompts,
        ...validationPrompts,
        ...formPrompts,
        ...directoryPrompts
    ];
    return allPrompts.filter(prompt => prompt.category === category);
}

/**
 * Helper function to get random prompt
 */
export function getRandomPrompt(category?: AIPrompt['category']): AIPrompt {
    const prompts = category ? getPromptsByCategory(category) : [
        ...basicPrompts,
        ...complexPrompts,
        ...formPrompts,
        ...directoryPrompts
    ];
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
}

/**
 * Helper function to get random enhanced prompt data
 */
export function getRandomEnhancedPrompt(): EnhancedPromptData {
    const randomIndex = Math.floor(Math.random() * enhancedPrompts.length);
    return enhancedPrompts[randomIndex];
} 