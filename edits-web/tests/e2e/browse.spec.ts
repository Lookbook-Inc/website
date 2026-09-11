import { expect, test } from "@playwright/test";

test("existing-user login lands on today's editable card", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByLabel("Email").fill("preview@lookbook.inc");
  await page.getByLabel("Password").fill("fixture-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Generate your own edit." })).toBeVisible();
  await expect(page.locator(".phone .quote")).toBeVisible();
  await expect(page.locator(".collage .pc")).not.toHaveCount(0);
  // Five swatches always render, padded with a neutral when pieces are few.
  await expect(page.locator(".card-swatches i")).toHaveCount(5);
});

test("changing the line updates the card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /The line/ }).click();

  const option = page.locator(".lineopt").filter({ hasText: "Overdressed for a Tuesday" });
  await option.click();
  await expect(page.locator(".phone .quote")).toHaveText("“Overdressed for a Tuesday.”");

  await page.getByLabel("Write your own line").fill("Dressed for the group chat");
  await page.getByRole("button", { name: "Use it" }).first().click();
  await expect(page.locator(".phone .quote")).toHaveText("“Dressed for the group chat”");
});

test("the picker adds and removes pieces, capped at six", async ({ page }) => {
  await page.goto("/");
  const chosen = page.locator(".chosen .ct");
  const before = await chosen.count();

  await page.getByRole("button", { name: "Add clothing items" }).click();
  const sheet = page.getByRole("dialog", { name: "Add clothing items" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText(/of 6 pieces selected/)).toBeVisible();

  // Deselect the first selected piece, then commit.
  await sheet.locator(".item.sel").first().click();
  await sheet.getByRole("button", { name: "Put on the card" }).click();
  await expect(sheet).toBeHidden();
  await expect(chosen).toHaveCount(before - 1);
});

test("Escape closes the picker", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add clothing items" }).click();
  const sheet = page.getByRole("dialog", { name: "Add clothing items" });
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("the palette names come off the pieces on the card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /The palette/ }).click();
  await expect(page.locator(".swrow i")).toHaveCount(5);

  const name = page.locator(".nameopt").first();
  const label = (await name.textContent())?.replace(/[“”]/g, "") ?? "";
  await name.click();
  await expect(page.locator(".palette-name")).toHaveText(`“${label}”`);
});

test("soundtrack and place search filter and apply to the card", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Your soundtrack/ }).click();
  await page.getByLabel("Search a song or artist").fill("Solange");
  await expect(page.locator(".ritem")).toHaveCount(1);
  await page.locator(".ritem").click();
  await expect(page.locator(".duo .col").first().locator(".t2")).toHaveText("Solange");

  await page.getByRole("button", { name: /Your place/ }).click();
  await page.getByLabel("Search a place").fill("Dolores");
  await expect(page.locator(".ritem")).toHaveCount(1);
  await page.locator(".ritem").click();
  await expect(page.locator(".duo .col").last().locator(".t1")).toHaveText("Dolores Park");
});

const NIGHT_SHEET = "rgb(23, 23, 26)";

test("the peek strip switches to tonight's dark card and back", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cardpane-head .eyebrow")).toHaveText("Today's card");

  // Today's card prints on white; the strip previewing tonight's card is dark.
  const sheet = page.locator(".sheetcard");
  const bar = page.locator(".actbar");
  const peek = page.locator(".peek");
  await expect(sheet).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(peek).toHaveCSS("background-color", NIGHT_SHEET);
  const dayBar = await bar.evaluate((el) => getComputedStyle(el).backgroundColor);

  await peek.click();
  await expect(page.locator(".cardpane-head .eyebrow")).toHaveText("Tonight's card");
  await expect(sheet).toHaveCSS("background-color", NIGHT_SHEET);
  // Now the strip previews today's card, in today's accent.
  await expect(peek).toHaveCSS("background-color", dayBar);
  await expect(bar).not.toHaveCSS("background-color", dayBar);
});

test("the backdrop colour is editable and drives the action bar", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /The day/ }).click();
  await page.getByRole("button", { name: "Sage", exact: true }).click();

  const sage = "rgb(187, 208, 180)";
  await expect(page.locator(".collage .blob path")).toHaveCSS("fill", sage);
  await expect(page.locator(".actbar")).toHaveCSS("background-color", sage);
});

test("the backdrop blob re-forms when the pieces change", async ({ page }) => {
  await page.goto("/");
  const blob = page.locator(".collage .blob path");
  const before = (await blob.getAttribute("d")) ?? "";

  await page.getByRole("button", { name: "Add clothing items" }).click();
  const sheet = page.getByRole("dialog", { name: "Add clothing items" });
  await sheet.locator(".item.sel").first().click();
  await sheet.getByRole("button", { name: "Put on the card" }).click();

  await expect(blob).not.toHaveAttribute("d", before);
});

test("pieces resize from The fit and reset with the layout", async ({ page }) => {
  await page.goto("/");
  const slider = page.getByRole("slider").first();
  const scaled = page.locator('.collage .pc[style*="scale(1.5)"]');
  // Retried: a fill that lands before hydration is reset by React.
  await expect(async () => {
    await slider.fill("150");
    await expect(scaled).toHaveCount(1, { timeout: 1_000 });
  }).toPass();

  await page.getByRole("button", { name: "Reset card layout" }).click();
  await expect(page.locator('.collage .pc[style*="scale"]')).toHaveCount(0);
});

test("Your Lookbook browses all four sections and opens a detail panel", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Your Lookbook" }).click();
  await expect(page.getByRole("heading", { name: /Everything you own/ })).toBeVisible();

  await expect(page.locator(".lib-card")).not.toHaveCount(0);
  await page.getByPlaceholder("Search name or brand").fill("shirt");
  await page.getByLabel("Filter by garment type").selectOption("button-up-shirt");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.locator(".lib-card")).toHaveCount(1);

  await page.locator(".lib-card").first().click();
  const panel = page.getByRole("complementary", { name: "Details" });
  await expect(panel.getByRole("heading", { name: "Soft poplin shirt" })).toBeVisible();
  await expect(panel.getByText("Worn with this piece")).toBeVisible();
  await panel.getByRole("button", { name: "Close details" }).click();
  await expect(panel).toBeHidden();

  for (const [tab, expected] of [
    ["Fit Pics", "Museum afternoon"],
    ["Outfits", "Quiet structure"],
    ["Edits", "In rotation"],
  ] as const) {
    await page.getByRole("tab", { name: tab }).click();
    await expect(page.getByText(expected).first()).toBeVisible();
  }
});

test("a fit pic's pieces can be pulled onto the card", async ({ page }) => {
  await page.goto("/");
  // "The fit" is the section that starts open, so it needs no click.
  await page.getByRole("button", { name: /From your Collection/ }).click();
  await page.locator(".pg").first().click();
  // The fixture fit pic detail carries three garments.
  await expect(page.locator(".chosen .ct")).toHaveCount(3);
  await expect(page.locator(".collage .pc")).toHaveCount(3);
});

test("the card downloads as a PNG", async ({ page }) => {
  await page.goto("/");
  const download = page.waitForEvent("download", { timeout: 30_000 });
  await page.getByRole("button", { name: "Download image" }).first().click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^aura-card-\d{4}-\d{2}-\d{2}\.png$/);
});

test("the full-card view opens and closes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "See final aura card" }).first().click();
  const view = page.getByRole("dialog", { name: "Final aura card" });
  await expect(view).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(view).toBeHidden();
});

// Regression: the action bar used to be pushed off-screen on short viewports,
// because the dialog centred its content inside its own scroll container.
for (const height of [900, 700, 560]) {
  test(`"Back to editing" is reachable at ${height}px tall`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height });
    await page.goto("/");
    await page.getByRole("button", { name: "See final aura card" }).first().click();
    const view = page.getByRole("dialog", { name: "Final aura card" });
    await expect(view).toBeVisible();

    const back = view.getByRole("button", { name: "Back to editing" });
    await expect(back).toBeInViewport();
    await back.click();
    await expect(view).toBeHidden();
  });
}

test("the date and weather are editable and land on the card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /The day/ }).click();

  await page.getByLabel("Date").fill("2026-12-25");
  await expect(page.locator(".phone .meta > div").first()).toContainText("DEC 25");
  await expect(page.locator(".cardpane-date")).toHaveText("Friday, December 25");

  await page.getByRole("spinbutton", { name: "Temperature" }).fill("12");
  await page.getByRole("button", { name: "°C" }).click();
  await page.getByRole("button", { name: "SNOW", exact: true }).click();
  await expect(page.locator(".phone .meta > div").last()).toContainText("12°C");
  await expect(page.locator(".phone .meta > div").last()).toContainText("SNOW");
});

test("the app exposes no wardrobe mutation controls", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Your Lookbook" }).click();
  await expect(
    page.getByRole("button", { name: /save|delete|archive|generate|mark.*viewed/i }),
  ).toHaveCount(0);
});
