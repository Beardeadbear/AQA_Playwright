import { test, expect } from '@playwright/test';
import { StudioAppsPage } from '../../page-objects/apps/studio-apps.page';
import { enhancedDragAndDrop } from '../../core/drag-and-drop';
import { WIDGETS } from '../../constants/widgets';

test.describe('AI Feature Component - Generated Directory Tests', () => {
    let studioAppsPage: StudioAppsPage;

    test.beforeEach(async ({ page }) => {
        studioAppsPage = new StudioAppsPage(page);
        await studioAppsPage.goto();
        
        const appLink = page.getByRole('link', { name: /AI-Test-App/ });
        await appLink.waitFor({ state: 'visible' });
        await appLink.click();
        
        await page.waitForSelector('#preview');
        
        // Add AI component for all tests
        await enhancedDragAndDrop(page, WIDGETS.AI_FEATURE.package, {
            usePackageSelection: true,
            verbose: false
        });
    });

    test('Generate directory listing', async ({ page }) => {
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing for employees with name, department, and email');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        // Wait for generation to complete
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Verify directory structure is generated
        const directoryContainer = page.locator('.directory-listing');
        await expect(directoryContainer).toBeVisible();
        
        // Verify table headers
        const nameHeader = page.getByRole('columnheader', { name: /Name/i });
        await expect(nameHeader).toBeVisible();
        
        const departmentHeader = page.getByRole('columnheader', { name: /Department/i });
        await expect(departmentHeader).toBeVisible();
        
        const emailHeader = page.getByRole('columnheader', { name: /Email/i });
        await expect(emailHeader).toBeVisible();
    });

    test('Display data from DS', async ({ page }) => {
        // Generate directory listing
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing that displays employee data from a data source');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Verify data is loaded from data source
        const dataRows = page.locator('.directory-listing tbody tr');
        await expect(dataRows).toHaveCount(5); // Assuming 5 test records
        
        // Verify first row has data
        const firstRow = dataRows.first();
        await expect(firstRow).toContainText('John Doe');
        await expect(firstRow).toContainText('Engineering');
    });

    test('Filter by department', async ({ page }) => {
        // Generate directory with filtering
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing with department filter dropdown');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Select department filter
        const departmentFilter = page.getByLabel(/Filter by Department/i);
        await departmentFilter.selectOption('Engineering');
        
        // Verify only engineering employees are shown
        const filteredRows = page.locator('.directory-listing tbody tr');
        await expect(filteredRows).toHaveCount(2); // Assuming 2 engineering employees
        
        // Verify all visible rows are from engineering
        for (let i = 0; i < 2; i++) {
            const row = filteredRows.nth(i);
            await expect(row).toContainText('Engineering');
        }
    });

    test('Search by name', async ({ page }) => {
        // Generate directory with search
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing with search functionality');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Search for a specific name
        const searchInput = page.getByPlaceholder(/Search by name/i);
        await searchInput.fill('Jane');
        
        // Verify search results
        const searchResults = page.locator('.directory-listing tbody tr');
        await expect(searchResults).toHaveCount(1);
        await expect(searchResults.first()).toContainText('Jane Smith');
    });

    test('Empty search state', async ({ page }) => {
        // Generate directory with search
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing with search and empty state');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Search for non-existent name
        const searchInput = page.getByPlaceholder(/Search by name/i);
        await searchInput.fill('NonExistentPerson');
        
        // Verify empty state message
        const emptyState = page.getByText(/No results found/i);
        await expect(emptyState).toBeVisible();
        
        // Verify no rows are displayed
        const dataRows = page.locator('.directory-listing tbody tr');
        await expect(dataRows).toHaveCount(0);
    });

    test('Scroll/pagination for large data', async ({ page }) => {
        // Generate directory with pagination
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing with pagination for large datasets');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Verify pagination controls
        const paginationContainer = page.locator('.pagination');
        await expect(paginationContainer).toBeVisible();
        
        // Verify page numbers
        const pageNumbers = page.locator('.pagination .page-number');
        await expect(pageNumbers).toHaveCount(3); // Assuming 3 pages
        
        // Navigate to next page
        const nextButton = page.getByRole('button', { name: /Next/i });
        await nextButton.click();
        
        // Verify page 2 is active
        const page2Button = page.getByRole('button', { name: /2/i });
        await expect(page2Button).toHaveClass(/active/);
    });

    test('Click item → detail view', async ({ page }) => {
        // Generate directory with detail view
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing where clicking an employee shows their details');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Click on first employee row
        const firstEmployeeRow = page.locator('.directory-listing tbody tr').first();
        await firstEmployeeRow.click();
        
        // Verify detail modal opens
        const detailModal = page.locator('.employee-detail-modal');
        await expect(detailModal).toBeVisible();
        
        // Verify employee details are displayed
        const employeeName = detailModal.getByText(/John Doe/i);
        await expect(employeeName).toBeVisible();
        
        const employeeEmail = detailModal.getByText(/john.doe@company.com/i);
        await expect(employeeEmail).toBeVisible();
        
        const employeeDepartment = detailModal.getByText(/Engineering/i);
        await expect(employeeDepartment).toBeVisible();
    });

    test('Responsive layout check', async ({ page }) => {
        // Generate responsive directory
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a responsive directory listing that works on mobile devices');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Verify directory adapts to mobile
        const directoryContainer = page.locator('.directory-listing');
        await expect(directoryContainer).toBeVisible();
        
        // Verify search is still accessible
        const searchInput = page.getByPlaceholder(/Search by name/i);
        await expect(searchInput).toBeVisible();
        
        // Verify table becomes scrollable on mobile
        const tableContainer = page.locator('.directory-listing .table-container');
        await expect(tableContainer).toHaveCSS('overflow-x', 'auto');
    });

    test('Sorting options', async ({ page }) => {
        // Generate directory with sorting
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing with sortable columns');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Click on name column header to sort
        const nameHeader = page.getByRole('columnheader', { name: /Name/i });
        await nameHeader.click();
        
        // Verify sort indicator appears
        const sortIndicator = nameHeader.locator('.sort-indicator');
        await expect(sortIndicator).toBeVisible();
        
        // Verify data is sorted alphabetically
        const firstRow = page.locator('.directory-listing tbody tr').first();
        await expect(firstRow).toContainText('Alice Johnson');
        
        // Click again to reverse sort
        await nameHeader.click();
        
        // Verify reverse sort
        const newFirstRow = page.locator('.directory-listing tbody tr').first();
        await expect(newFirstRow).toContainText('Zoe Wilson');
    });

    test('Font Awesome fallback image', async ({ page }) => {
        // Generate directory with profile images
        const promptInput = page.getByPlaceholder(/Enter your prompt/i);
        await promptInput.fill('Create a directory listing with profile images and Font Awesome fallbacks');
        
        const saveGenerateButton = page.getByRole('button', { name: /Save & Generate/i });
        await saveGenerateButton.click();
        
        await page.waitForSelector('.generated-code', { state: 'visible' });
        
        // Switch to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        await previewTab.click();
        
        // Verify profile images are displayed
        const profileImages = page.locator('.directory-listing .profile-image');
        await expect(profileImages).toHaveCount(5);
        
        // Verify Font Awesome fallback for missing images
        const fallbackIcons = page.locator('.directory-listing .fa-user');
        await expect(fallbackIcons).toBeVisible();
        
        // Verify fallback icon has proper styling
        await expect(fallbackIcons.first()).toHaveCSS('color', 'rgb(128, 128, 128)');
    });
}); 