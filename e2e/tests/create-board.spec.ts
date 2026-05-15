import { test, expect } from "@playwright/test";

test("create retrospective and change steps", async ({ page }) => {
  await page.goto("/");

  // Auth pre-loaded via storageState — verify user is shown in navbar
  await expect(page.getByText("Nico")).toBeVisible({ timeout: 5000 });

  await page.getByRole("button", { name: "Create retrospective" }).click();
  // setup page: user already logged in, clicking "Create Retrospective" goes straight to retro
  await page.getByRole("button", { name: "Create Retrospective" }).click();
  // Write step: description text confirms we're in Write step
  await expect(page.getByText("Write down your thoughts")).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("button", { name: "I'm ready!" })).toBeVisible();

  await page.getByRole("button", { name: "Next step" }).click();
  // Present step: description changes, no "I'm ready!" button
  await expect(page.getByText("Present your cards to the team")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: "I'm ready!" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Next step" })).toBeVisible();

  await page.getByRole("button", { name: "Next step" }).click();
  // Vote step: "I'm ready!" button is shown again
  await expect(page.getByText("Vote on the most important")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: "I'm ready!" })).toBeVisible();

  await page.getByRole("button", { name: "Next step" }).click();
  // Discuss step: no "I'm ready!" button
  await expect(page.getByText("Discuss the top voted")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: "I'm ready!" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Next step" })).toBeVisible();

  const prevStepBtn = page.locator("#steps").getByRole("button").filter({ hasText: /^$/ });

  // Go back: Discuss -> Vote
  await prevStepBtn.click();
  await expect(page.getByText("Vote on the most important")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: "I'm ready!" })).toBeVisible();

  // Go back: Vote -> Present
  await prevStepBtn.click();
  await expect(page.getByText("Present your cards to the team")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: "I'm ready!" })).toBeHidden();

  // Go back: Present -> Write
  await prevStepBtn.click();
  await expect(page.getByText("Write down your thoughts")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: "I'm ready!" })).toBeVisible();

  await page.getByRole("link", { name: "Logout" }).click();
});
