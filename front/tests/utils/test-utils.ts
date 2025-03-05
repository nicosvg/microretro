import { Page, expect } from '@playwright/test';

/**
 * Creates a new retro board by clicking the create button on the homepage
 * @param page The Playwright page object
 * @returns The ID of the newly created board
 */
export async function createNewRetroBoard(page: Page): Promise<string> {
  await page.goto('/');
  await page.getByRole('button', { name: /create a new retrospective/i }).click();
  
  // Extract the board ID from the URL
  const url = page.url();
  const boardId = url.split('/').pop();
  
  return boardId || '';
}

/**
 * Sets the user name in the login popup
 * @param page The Playwright page object
 * @param name The name to set
 */
export async function setUserName(page: Page, name: string): Promise<void> {
  // Wait for the login popup to appear
  const nameInput = page.getByPlaceholder('Your name');
  await nameInput.waitFor({ state: 'visible' });
  
  // Fill in the name and submit
  await nameInput.fill(name);
  await page.getByRole('button', { name: /join/i }).click();
  
  // Verify the login popup is gone
  await expect(nameInput).toBeHidden({ timeout: 5000 });
}
