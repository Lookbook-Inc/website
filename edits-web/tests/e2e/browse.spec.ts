import { expect, test } from "@playwright/test";

test("existing-user login and all read-only surfaces", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByLabel("Email").fill("preview@lookbook.inc");
  await page.getByLabel("Password").fill("fixture-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Good to see you/ })).toBeVisible();

  for (const [path, heading] of [
    ["/wardrobe", "Wardrobe"],
    ["/fit-pics", "Fit pics"],
    ["/outfits", "Outfits"],
    ["/banks", "Banks"],
    ["/recommendations", "The latest edit"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
});

test("creative banks can be searched and switched", async ({ page }) => {
  await page.goto("/banks");
  await expect(page.getByRole("heading", { name: "Banks", exact: true })).toBeVisible();
  await expect(page.getByRole("tabpanel", { name: /Songs/ })).toBeVisible();

  await page.getByRole("searchbox", { name: "Search songs or artists" }).fill("Billie");
  await expect(page.getByRole("heading", { name: "Wildflower" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lose Control" })).toHaveCount(0);

  await page.getByRole("tab", { name: /Edit Lines/ }).click();
  await page.getByRole("searchbox", { name: "Search edit lines" }).fill("moon");
  await expect(page.getByText("the moon saved you a seat.")).toBeVisible();
  await expect(page.getByText("velvet skies ahead.")).toHaveCount(0);
});

test("wardrobe filtering and detail relationships", async ({ page }) => {
  await page.goto("/wardrobe");
  await page.getByPlaceholder("Search name or brand").fill("shirt");
  await page.getByLabel("Filter by garment type").selectOption("Tops");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("link", { name: /Soft poplin shirt/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ink chore coat/ })).toHaveCount(0);
  await page.getByRole("link", { name: /Soft poplin shirt/ }).click();
  await expect(page.getByRole("heading", { name: "Soft poplin shirt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Worn with this piece" })).toBeVisible();
});

test("outfit folders and latest recommendations are browse-only", async ({ page }) => {
  await page.goto("/outfits");
  await page.getByLabel("Folder").selectOption({ label: "Everyday (12)" });
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("link", { name: /Quiet structure/ })).toBeVisible();

  await page.goto("/recommendations");
  await expect(page.getByText(/won’t mark it as viewed/)).toBeVisible();
  await expect(page.getByRole("button", { name: /save|delete|archive|generate|mark.*viewed/i })).toHaveCount(0);
});
