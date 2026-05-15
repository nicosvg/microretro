import { chromium } from "@playwright/test";

const authFile = ".auth/localhost-auth.json";

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: "Create retrospective" }).click();
  await page.getByRole("button", { name: "Create Retrospective" }).click();

  const nameInput = page.getByPlaceholder("Your name");
  await nameInput.waitFor({ state: "visible", timeout: 10000 });
  await nameInput.fill("Nico");
  await page.getByRole("button", { name: "Create User" }).click();
  await page.getByRole("button", { name: "Create User" }).waitFor({ state: "hidden" });

  await page.context().storageState({ path: authFile });
  await browser.close();
}

export default globalSetup;
