import { test, expect } from "@playwright/test";

const url = "https://microretro.nicosauvage.fr";

test("create retrospective and change steps", async ({ page }) => {
  await page.goto(url);

  await page.getByRole("button", { name: "Create retrospective" }).click();
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("Nico");
  await page.getByRole("button", { name: "Submit" }).click();
  // wait for popup to close
  await expect(page.getByRole("button", { name: "Submit" })).toBeHidden();

  await page.context().storageState({ path: ".auth/nico-auth.json" });

  await page.getByRole("button", { name: "Create retrospective" }).click();
  await expect(page.getByRole("heading", { name: "Write" })).toBeVisible();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByRole("heading", { name: "Present" })).toBeVisible();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByRole("heading", { name: "Vote" })).toBeVisible();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByRole("heading", { name: "Discuss" })).toBeVisible();
  await page.getByRole("button").filter({ hasText: /^$/ }).click();
  await expect(page.getByRole("heading", { name: "Vote" })).toBeVisible();
  await page.getByRole("button").filter({ hasText: /^$/ }).click();
  await expect(page.getByRole("heading", { name: "Present" })).toBeVisible();
  await page.getByRole("button").filter({ hasText: /^$/ }).click();
  await expect(page.getByRole("heading", { name: "Write" })).toBeVisible();
  await page.getByRole("link", { name: "Logout" }).click();
});
