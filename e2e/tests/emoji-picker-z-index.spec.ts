import { test, expect } from "@playwright/test";

/**
 * Regression test for: emoji picker rendered below a hovered card.
 *
 * Steps to reproduce:
 * 1. Create a board and add at least 2 cards in the same column.
 * 2. Advance to the "Present" step so reaction bars are visible.
 * 3. Open the emoji picker on card A.
 * 4. Hover card B (positioned below card A in the list).
 * 5. Bug: card B gets z-index: 10 on hover and renders on top of the picker,
 *    even though the picker has z-index: 1000.
 */
test("emoji picker stays above a hovered card below it", async ({ page }) => {
  await page.goto("/");

  // Auth pre-loaded via storageState — verify user is shown in navbar
  await expect(page.getByText("Nico")).toBeVisible({ timeout: 5000 });

  await page.getByRole("button", { name: "Create retrospective" }).click();
  // setup page: user already logged in, click goes straight to retro creation
  await page.getByRole("button", { name: "Create Retrospective" }).click();
  // Write step: description text confirms we're in Write step
  await expect(page.getByText("Write down your thoughts")).toBeVisible({ timeout: 30000 });

  // Add two cards to the first column so we have card A (top) and card B (below)
  const textarea = page.getByPlaceholder("Write here...");
  await textarea.fill("Card A");
  await page.getByRole("button", { name: "Add here" }).first().click();
  // Wait for Card A before adding Card B — cards arrive via websocket, order not guaranteed
  await expect(page.getByText("Card A")).toBeVisible({ timeout: 10000 });

  await textarea.fill("Card B");
  await page.getByRole("button", { name: "Add here" }).first().click();
  await expect(page.getByText("Card B")).toBeVisible({ timeout: 10000 });

  // --- Advance to Present step so reaction bars (and the emoji picker) are shown ---
  await page.getByRole("button", { name: "Next step" }).click();
  // Present step: description changes to confirm step transition
  await expect(page.getByText("Present your cards to the team")).toBeVisible({ timeout: 10000 });

  // --- Open the emoji picker on Card A ---
  const cardA = page.locator(".card", { hasText: "Card A" }).first();
  const cardB = page.locator(".card", { hasText: "Card B" }).first();

  // Hover card A to reveal the "Add reaction" button, then click it
  await cardA.hover();
  const addReactionBtn = cardA.getByRole("button", { name: "Add reaction" });
  await expect(addReactionBtn).toBeVisible();
  await addReactionBtn.click();

  // Verify the picker is open
  const picker = page.getByRole("dialog", { name: "Choose reaction" });
  await expect(picker).toBeVisible();

  // --- Simulate hovering card B by moving the mouse to its center ---
  // We use page.mouse.move() instead of cardB.hover() because the picker
  // (portaled to <body>) may be positioned over card B — which is exactly
  // the bug we are testing. cardB.hover() would wait forever for pointer
  // events to be unobstructed, so we move the mouse directly.
  const cardBBox = await cardB.boundingBox();
  if (!cardBBox) throw new Error("Could not get card B bounding box");
  await page.mouse.move(
    cardBBox.x + cardBBox.width / 2,
    cardBBox.y + cardBBox.height / 2
  );

  // The picker must still be visible — card B's hover state must not cover it.
  await expect(picker).toBeVisible();

  // Assert z-index ordering: the picker must sit above card B.
  // Bug: when card B gets `z-index: 10` on hover it can render over the picker.
  const pickerZIndex = await picker.evaluate((el) => {
    return parseInt(window.getComputedStyle(el).zIndex, 10);
  });

  const cardBZIndex = await cardB.evaluate((el) => {
    return parseInt(window.getComputedStyle(el).zIndex, 10) || 0;
  });

  expect(pickerZIndex).toBeGreaterThan(cardBZIndex);

  // --- Clean up: close picker and log out ---
  await page.keyboard.press("Escape");
  await expect(picker).toBeHidden();

  await page.getByRole("link", { name: "Logout" }).click();
});
