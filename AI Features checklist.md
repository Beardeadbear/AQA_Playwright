Check
1. Component Integration
AI-TC-001: Verify that the AI Feature component can be dragged and dropped onto a screen.
AI-TC-002: Verify that the AI Feature component is visible in the components list.
AI-TC-003: Verify the "Enhance Prompt" button is visible and new prompt categories are displayed.
AI-TC-004: Verify all prompt categories are editable and persist changes.
AI-TC-005: Verify the "Save & Generate" button is visible and active when a prompt is entered.

2. Data Source Selection
AI-TC-006: Verify that the user can select an existing data source from the dropdown.
AI-TC-007: Verify that the user can create a new data source.
AI-TC-008: Verify that the user can view all available data sources.
AI-TC-009: Verify an appropriate toast message is displayed when a generated feature attempts to save data to a data source without necessary security rules.
AI-TC-010: Verify behavior when no data source is selected for a feature requiring data storage.

3. Code Generation Process
AI-TC-011: Verify that the AI generates code based on a valid prompt.
AI-TC-012: Verify AI provides a clear error message (toast) for an invalid prompt during code generation.
AI-TC-013: Verify generated code is displayed on the screen for review after successful generation.
AI-TC-014: Verify that generated features adhere to general UI/UX guidelines (e.g., responsiveness).
AI-TC-015: Verify an error toast message is shown if the code generation process fails unexpectedly.
AI-TC-016: Verify that generated features correctly apply Font Awesome icons.
AI-TC-017: Verify generating code with an empty prompt results in a warning or error message.
AI-TC-018: Verify AI correctly interprets and applies instructions provided within specific "Enhanced Prompt" categories during code generation.

4. Generated Feature Functionality (AI-Querying)
AI-TC-019: User can generate a button that, upon click, queries an AI service and displays dynamic content (e.g., a poem) using the Enhanced Prompt categories.
AI-TC-020: Verify successful display of AI-generated dynamic content after the feature's AI query is triggered.
AI-TC-021: Verify a loading indicator is displayed while the AI-querying feature is generating content.
AI-TC-022: Verify an appropriate toast message is displayed if the AI query from a generated feature fails.
AI-TC-023: Verify consecutive AI queries from a generated feature function correctly and update content appropriately.
AI-TC-024: Verify AI-generated dynamic content respects specified character limits or display constraints within the component.
AI-TC-025: Verify the generated AI-querying feature maintains its UI and functionality after multiple interactions.
AI-TC-026: Verify appropriate error handling and message display if the AI service returns malformed or unexpected data to the generated feature.

5. Generated Feature Functionality (Forms & Validation)
AI-TC-027: User can Enhance Prompt and successfully generate a custom registration or data collection form.
AI-TC-028: A generated form saves data to the specified data source upon submission.
AI-TC-029: A generated form displays validation messages for required fields.
AI-TC-030: Verify a generated registration form's password field enforces minimum length.
AI-TC-031: Verify a generated registration form's 'Confirm Password' field correctly validates against the 'Password' field.
AI-TC-032: Verify a generated form's email address field validates for correct email format.
AI-TC-033: Verify a generated form's phone number field validates for valid phone number patterns.
AI-TC-034: Verify a generated form's date of birth field validates for a valid date and appropriate age (e.g., >13 years).
AI-TC-035: Verify real-time inline validation feedback (e.g., green checkmark for valid, red border/warning for invalid) appears on input fields.
AI-TC-036: Verify a success toast message is displayed upon successful form submission.
AI-TC-037: Verify the form fields are cleared or reset to their initial state after successful submission.
AI-TC-038: Verify an appropriate error message (toast or inline) is displayed if any request fails. e.g:  if the form's data source fails to load or is unavailable when the form is rendered or when attempts to save data to a data source without necessary security rules.

6. Generated Feature Functionality (Directory Listing)
AI-TC-039: User can Enhance Prompt and successfully generate a directory listing.
AI-TC-040: The directory listing displays data from the specified data source.
AI-TC-041: The directory listing can be filtered by department.
AI-TC-042: The directory listing can be searched by name.
AI-TC-043: Verify directory listing correctly displays a message when no search results match the criteria.
AI-TC-044: Verify directory listing handles large datasets by displaying a scrollbar or pagination.
AI-TC-045: Verify clicking on a directory item displays its full details.
AI-TC-046: Verify the directory listing maintains responsive layout across different device previews (mobile, tablet, desktop).
AI-TC-047: Verify sorting options (e.g., by name, department) function correctly on the directory listing.
AI-TC-048: Verify the directory listing displays user images from the data source or Font Awesome fallback.
AI-TC-049: Verify an appropriate error message is displayed if the directory listing's data source fails to load or is unavailable.