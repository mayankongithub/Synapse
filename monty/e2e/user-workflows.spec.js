/**
 * End-to-End Tests - User Workflows
 * Tests complete user workflows using Playwright
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3001';

test.describe('User Workflows E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('First Visit Experience', () => {
    test('should show welcome screen on first visit', async ({ page, context }) => {
      // Clear storage to simulate first visit
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      
      await page.reload();

      // All panels should be closed
      await expect(page.locator('[data-testid="file-explorer"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="terminal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="chat-panel"]')).not.toBeVisible();

      // Welcome screen should be visible
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should open panels when buttons are clicked', async ({ page }) => {
      // Click file explorer button
      await page.click('[title*="File Explorer"]');
      await expect(page.locator('[data-testid="file-explorer"]')).toBeVisible();

      // Click terminal button
      await page.click('[title*="Terminal"]');
      await expect(page.locator('[data-testid="terminal"]')).toBeVisible();

      // Click chat button
      await page.click('[title*="Chat"]');
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
    });
  });

  test.describe('File Management Workflow', () => {
    test('should create and open a file', async ({ page }) => {
      // Open file explorer
      await page.click('[title*="File Explorer"]');

      // Click create file button
      await page.click('[title="New File"]');

      // Enter file name
      await page.fill('input[placeholder*="file name"]', 'test-e2e.js');

      // Submit
      await page.click('button:has-text("Create")');

      // File should appear in file list
      await expect(page.locator('text=test-e2e.js')).toBeVisible();

      // Click on file to open it
      await page.click('text=test-e2e.js');

      // Editor should show the file
      await expect(page.locator('.monaco-editor')).toBeVisible();
    });

    test('should open multiple files and switch between them', async ({ page }) => {
      // Open file explorer
      await page.click('[title*="File Explorer"]');

      // Create first file
      await page.click('[title="New File"]');
      await page.fill('input[placeholder*="file name"]', 'file1.js');
      await page.click('button:has-text("Create")');

      // Create second file
      await page.click('[title="New File"]');
      await page.fill('input[placeholder*="file name"]', 'file2.py');
      await page.click('button:has-text("Create")');

      // Open both files
      await page.click('text=file1.js');
      await page.click('text=file2.py');

      // Both tabs should be visible
      await expect(page.locator('[data-testid="tab-file1.js"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-file2.py"]')).toBeVisible();

      // Click on first tab
      await page.click('[data-testid="tab-file1.js"]');

      // First file should be active
      await expect(page.locator('[data-testid="tab-file1.js"]')).toHaveClass(/active/);
    });

    test('should close file and show welcome screen when all files closed', async ({ page }) => {
      // Open file explorer and create a file
      await page.click('[title*="File Explorer"]');
      await page.click('[title="New File"]');
      await page.fill('input[placeholder*="file name"]', 'temp.js');
      await page.click('button:has-text("Create")');
      await page.click('text=temp.js');

      // Close the file
      await page.click('[data-testid="tab-temp.js"] button[title="Close file"]');

      // Welcome screen should appear
      await expect(page.locator('text=Welcome')).toBeVisible();
    });
  });

  test.describe('Code Execution Workflow', () => {
    test('should write and execute code', async ({ page }) => {
      // Open file explorer and create a file
      await page.click('[title*="File Explorer"]');
      await page.click('[title="New File"]');
      await page.fill('input[placeholder*="file name"]', 'hello.js');
      await page.click('button:has-text("Create")');
      await page.click('text=hello.js');

      // Wait for Monaco editor to load
      await page.waitForSelector('.monaco-editor');

      // Type code in editor
      await page.click('.monaco-editor');
      await page.keyboard.type('console.log("Hello E2E Test");');

      // Click run button
      await page.click('button:has-text("Run")');

      // Open terminal to see output
      await page.click('[title*="Terminal"]');

      // Terminal should show output
      await expect(page.locator('text=Hello E2E Test')).toBeVisible();
    });
  });

  test.describe('Terminal Workflow', () => {
    test('should toggle terminal with keyboard shortcut', async ({ page }) => {
      // Terminal should be closed initially
      await expect(page.locator('[data-testid="terminal"]')).not.toBeVisible();

      // Press Ctrl + `
      await page.keyboard.press('Control+`');

      // Terminal should be visible
      await expect(page.locator('[data-testid="terminal"]')).toBeVisible();

      // Press Ctrl + ` again
      await page.keyboard.press('Control+`');

      // Terminal should be hidden
      await expect(page.locator('[data-testid="terminal"]')).not.toBeVisible();
    });

    test('should close terminal with X button', async ({ page }) => {
      // Open terminal
      await page.click('[title*="Terminal"]');
      await expect(page.locator('[data-testid="terminal"]')).toBeVisible();

      // Click X button
      await page.click('[data-testid="terminal"] button[title*="Close"]');

      // Terminal should be hidden
      await expect(page.locator('[data-testid="terminal"]')).not.toBeVisible();
    });
  });

  test.describe('Theme Switching Workflow', () => {
    test('should switch between dark and light themes', async ({ page }) => {
      // Check initial theme (should be dark)
      const body = page.locator('body');
      await expect(body).toHaveClass(/dark/);

      // Click theme toggle button
      await page.click('[title*="light mode"]');

      // Theme should change to light
      await expect(body).toHaveClass(/light/);

      // Click theme toggle button again
      await page.click('[title*="dark mode"]');

      // Theme should change back to dark
      await expect(body).toHaveClass(/dark/);
    });
  });

  test.describe('Folder Selection Workflow', () => {
    test('should show folder picker button', async ({ page }) => {
      // Open file explorer
      await page.click('[title*="File Explorer"]');

      // Folder picker button should be visible
      await expect(page.locator('button:has-text("Open Folder")')).toBeVisible();
    });
  });

  test.describe('State Persistence Workflow', () => {
    test('should persist panel states across page refresh', async ({ page }) => {
      // Open all panels
      await page.click('[title*="File Explorer"]');
      await page.click('[title*="Terminal"]');
      await page.click('[title*="Chat"]');

      // Verify all panels are open
      await expect(page.locator('[data-testid="file-explorer"]')).toBeVisible();
      await expect(page.locator('[data-testid="terminal"]')).toBeVisible();
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();

      // Refresh page
      await page.reload();

      // All panels should still be open
      await expect(page.locator('[data-testid="file-explorer"]')).toBeVisible();
      await expect(page.locator('[data-testid="terminal"]')).toBeVisible();
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
    });
  });
});

