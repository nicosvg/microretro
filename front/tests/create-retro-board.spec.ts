import { test, expect } from '@playwright/test';
import { createNewRetroBoard, setUserName } from './utils/test-utils';

test.describe('Retro Board Creation', () => {
  test('User can create a new retro board and set their name', async ({ page }) => {
    // Go to the homepage
    await page.goto('/');
    
    // Verify the page title
    await expect(page).toHaveTitle(/Retrospective/);
    
    // Create a new retro board
    const boardId = await createNewRetroBoard(page);
    
    // Verify we're on a board page
    expect(boardId).toBeTruthy();
    expect(page.url()).toContain(`/retro/${boardId}`);
    
    // Set user name when prompted
    const testUserName = 'Test User';
    await setUserName(page, testUserName);
    
    // Verify the board is loaded and user is logged in
    await expect(page.getByText(/write/i)).toBeVisible();
    
    // Verify the user's name appears somewhere on the page
    // This might need to be adjusted based on your UI
    await expect(page.getByText(testUserName, { exact: false })).toBeVisible();
  });
});
