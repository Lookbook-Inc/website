import { expect, test } from "@playwright/test";

test("existing-user login lands on today's editable card", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByLabel("Email").fill("preview@lookbook.inc");
  await page.getByLabel("Password").fill("fixture-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Edit today's card" })).toBeVisible();
  await expect(page.locator(".phone .quote")).toBeVisible();
  await expect(page.locator(".collage .pc")).not.toHaveCount(0);
  // Five swatches always render, padded with a neutral when pieces are few.
  await expect(page.locator(".card-swatches i")).toHaveCount(5);
  // No action bar under the sheet.
  await expect(page.getByText("I fw this")).toHaveCount(0);
});

test("changing the line updates the card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Vibe", exact: true }).click();
  await page.getByRole("group", { name: "Vibe" }).getByRole("button", { name: "Line" }).click();

  // Every line in the bank is offered, nothing else.
  await expect(page.locator(".lineopt")).toHaveCount(6);

  const option = page.locator(".lineopt").filter({ hasText: "overdressed for a tuesday." });
  await option.click();
  await expect(page.locator(".phone .quote")).toHaveText("overdressed for a tuesday.");

  await page.getByLabel("Write your own line").fill("Dressed for the group chat");
  await page.getByRole("button", { name: "Use it" }).first().click();
  await expect(page.locator(".phone .quote")).toHaveText("Dressed for the group chat");
});

test("the wardrobe in Outfit adds and removes pieces straight away", async ({ page }) => {
  await page.goto("/");
  const chosen = page.locator(".collage .pc");
  const wardrobe = page.locator(".wardrobe");
  await expect(wardrobe.getByText(/of 6 pieces on the card/)).toBeVisible();
  const before = await chosen.count();

  // Retried: a click that lands before hydration does nothing.
  await expect(async () => {
    await wardrobe.locator(".item.sel").first().click();
    await expect(chosen).toHaveCount(before - 1, { timeout: 1_000 });
  }).toPass();
});

test("Library and the Outfit wardrobe reuse the wardrobe loaded with the editor", async ({ page }) => {
  const wardrobeRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/wardrobe") wardrobeRequests.push(url.search);
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Your Lookbook" }).click();
  await expect(page.locator(".lib-card")).toHaveCount(10);

  await page.getByPlaceholder("Search name or brand").fill("shirt");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.locator(".lib-card")).toHaveCount(1);
  expect(wardrobeRequests.length).toBeGreaterThan(0);
  expect(wardrobeRequests.every((search) => search.includes("query=shirt"))).toBe(true);
  const requestCountAfterSearch = wardrobeRequests.length;

  await page.getByRole("button", { name: "Edit card" }).click();
  await expect(page.locator(".wardrobe .item").first()).toBeVisible();
  expect(wardrobeRequests).toHaveLength(requestCountAfterSearch);
});

test("the palette names come off the pieces on the card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Vibe", exact: true }).click();
  await page.getByRole("group", { name: "Vibe" }).getByRole("button", { name: "Palette" }).click();
  await expect(page.locator(".swrow i")).toHaveCount(5);

  const name = page.locator(".nameopt").first();
  const label = (await name.textContent()) ?? "";
  await name.click();
  await expect(page.locator(".palette-name")).toHaveText(`“${label}”`);
});

test("song bank and place search filter and apply to the card", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("tab", { name: "Vibe", exact: true }).click();
  await page.getByRole("group", { name: "Vibe" }).getByRole("button", { name: "Song" }).click();
  // The whole song bank is listed, in curated order.
  await expect(page.locator(".ritem")).toHaveCount(5);
  await expect(page.locator(".ritem").first()).toContainText("Wildflower");
  await page.getByLabel("Search a song or artist").fill("Solange");
  await expect(page.locator(".ritem")).toHaveCount(1);
  await page.locator(".ritem").click();
  await expect(page.locator(".duo .col").first().locator(".t1")).toHaveText("Cranes in the Sky");
  await expect(page.locator(".duo .col").first().locator(".t2")).toHaveText("Solange");

  await page.getByRole("tab", { name: "Vibe", exact: true }).click();
  await page.getByRole("group", { name: "Vibe" }).getByRole("button", { name: "Place" }).click();
  await expect(page.locator(".ritem")).toHaveCount(9);
  await expect(page.locator(".ritem").first()).toContainText("Four Barrel Coffee");
  await page.getByLabel("Search a place").fill("Dolores");
  await expect(page.locator(".ritem")).toHaveCount(1);
  await page.locator(".ritem").click();
  await expect(page.locator(".duo .col").last().locator(".t1")).toHaveText("Dolores Park");
  await expect(page.locator(".duo .col").last().locator(".art img")).toHaveAttribute("src", /^data:image\/svg\+xml/);

  await page.getByLabel("Search a place").fill("Ritual");
  await page.locator(".ritem").click();
  await expect(page.locator(".duo .col").last().locator(".t1")).toHaveText("Ritual Coffee Roasters");
  await expect(page.locator(".duo .col").last().locator(".art canvas")).toBeVisible();

  await page.getByLabel("Search a place").fill("not a place");
  await expect(page.getByText("No place matches “not a place”.")).toBeVisible();
});

const NIGHT_SHEET = "rgb(23, 23, 26)";

test("the peek strip switches to tonight's dark card and back", async ({ page }) => {
  await page.goto("/");
  const tonight = page.getByRole("group", { name: "Which card" }).getByRole("button", { name: "Tonight" });
  await expect(tonight).toHaveAttribute("aria-pressed", "false");

  // Today's card prints on white; the strip previewing tonight's card is dark.
  const sheet = page.locator(".sheetcard");
  const blob = page.locator(".phone .collage .blob path").first();
  const peek = page.locator(".peek");
  await expect(sheet).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(peek).toHaveCSS("background-color", NIGHT_SHEET);
  const dayBlob = await blob.evaluate((el) => getComputedStyle(el).fill);

  await peek.click();
  await expect(tonight).toHaveAttribute("aria-pressed", "true");
  await expect(sheet).toHaveCSS("background-color", NIGHT_SHEET);
  // Now the strip previews today's card, in today's accent.
  await expect(peek).toHaveCSS("background-color", dayBlob);
  await expect(blob).not.toHaveCSS("fill", dayBlob);
});

test("the backdrop colour is editable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Day", exact: true }).click();
  await page.getByRole("button", { name: "Sage", exact: true }).click();

  const sage = "rgb(187, 208, 180)";
  await expect(page.locator(".collage .blob path")).toHaveCSS("fill", sage);
});

test("each card's backdrop has its own size, night starting larger", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".phone").first();
  const blob = card.locator(".collage .blob");
  await page.getByRole("tab", { name: "Day", exact: true }).click();
  const slider = page.getByLabel("Background size");

  // Today's blob starts at its natural size; the slider scales it about its centre.
  await expect(slider).toHaveValue("100");
  await expect(async () => {
    await slider.fill("130");
    await expect(blob).toHaveAttribute("style", /scale\(1\.3\)/, { timeout: 1_000 });
  }).toPass();

  // Tonight's is its own setting, and starts bigger.
  await page.getByRole("group", { name: "Which card" }).getByRole("button", { name: "Tonight" }).click();
  await expect(slider).toHaveValue("120");
  await expect(blob).toHaveAttribute("style", /scale\(1\.2\)/);
  await slider.fill("80");
  await expect(blob).toHaveAttribute("style", /scale\(0\.8\)/);
});

test("changing pieces keeps the blob and re-picks the palette name", async ({ page }) => {
  await page.goto("/");
  const blob = page.locator(".collage .blob path").first();
  const before = (await blob.getAttribute("d")) ?? "";
  const chosen = page.locator(".phone").first().locator(".collage .pc");
  const count = await chosen.count();

  // Rename the palette, then change the pieces: the name goes back to the top suggestion.
  await page.getByRole("tab", { name: "Vibe", exact: true }).click();
  await page.getByRole("group", { name: "Vibe" }).getByRole("button", { name: "Palette" }).click();
  await page.locator(".namegrid").first().locator(".nameopt").last().click();
  const renamed = (await page.locator(".palette-name").first().textContent()) ?? "";

  await page.getByRole("tab", { name: "Outfit", exact: true }).click();
  await page.locator(".wardrobe .item.sel").first().click();
  await expect(chosen).toHaveCount(count - 1);
  await expect(blob).toHaveAttribute("d", before);

  await page.getByRole("tab", { name: "Vibe", exact: true }).click();
  await page.getByRole("group", { name: "Vibe" }).getByRole("button", { name: "Palette" }).click();
  const top = (await page.locator(".namegrid .nameopt").first().textContent()) ?? "";
  await expect(page.locator(".palette-name").first()).toHaveText(`“${top}”`);
  expect(renamed).not.toBe(`“${top}”`);
});

test("pieces start at 120% and reset back to it", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".phone").first();
  const pieces = card.locator(".collage .pc");
  const atDefault = card.locator('.collage .pc[style*="scale(1.2)"]');
  await expect(atDefault).toHaveCount(await pieces.count());

  const piece = pieces.last();
  await expect(async () => {
    await piece.click();
    await expect(piece.locator(".sel-box")).toBeVisible({ timeout: 1_000 });
  }).toPass();
  const box = (await piece.locator(".rz-se").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 40, box.y + 40, { steps: 5 });
  await page.mouse.up();
  await expect(atDefault).toHaveCount((await pieces.count()) - 1);

  await page.getByRole("button", { name: "Reset card layout" }).click();
  await expect(atDefault).toHaveCount(await pieces.count());
});

test("clicking a piece selects it, and a corner handle resizes it", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".phone").first();
  // The top-most piece, so nothing overlaps the click.
  const piece = card.locator(".collage .pc").last();
  // Retried: a click that lands before hydration does nothing.
  await expect(async () => {
    await piece.click();
    await expect(piece.locator(".sel-box")).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await expect(piece.locator(".rz")).toHaveCount(4);

  const handle = piece.locator(".rz-se");
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 40, box.y + 40, { steps: 5 });
  await page.mouse.up();
  await expect(piece).toHaveAttribute("style", /scale\(/);

  // Clicking away clears the selection.
  await page.getByRole("heading", { name: "Edit today's card" }).click();
  await expect(card.locator(".sel-box")).toHaveCount(0);
});

test("double-clicking a piece opens the layer menu", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".phone").first();
  const pieces = card.locator(".collage .pc");
  const count = await pieces.count();
  const last = pieces.nth(count - 1);
  const id = await last.getAttribute("data-piece");

  const menu = card.getByRole("menu");
  await expect(async () => {
    await last.dblclick({ position: { x: 6, y: 6 } });
    await expect(menu).toBeVisible({ timeout: 1_000 });
  }).toPass();
  // Already on top, so it can't come further forward.
  await expect(menu.getByRole("menuitem", { name: "Bring to front" })).toBeDisabled();
  await menu.getByRole("menuitem", { name: "Send to back" }).click();

  await expect(menu).toHaveCount(0);
  const moved = card.locator(`.collage .pc[data-piece="${id}"]`);
  await expect(moved).toHaveCSS("z-index", "1");
  await expect(card.locator(".collage .pc").first()).toHaveAttribute("data-piece", id!);
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
  // "Outfit" is the tab that starts open, so it needs no click.
  await page.getByRole("button", { name: "Use a fit pic" }).click();
  const tile = page.locator(".pg").first();
  await tile.click({ position: { x: 4, y: 4 } });
  await tile.getByRole("button", { name: /^Use pieces from/ }).click();
  // The fixture fit pic detail carries three garments.
  await expect(page.locator(".collage .pc")).toHaveCount(3);
});

test("a fit pic itself can go on the card, and pieces switch it back", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use a fit pic" }).click();
  const tile = page.locator(".pg").first();
  await tile.click({ position: { x: 4, y: 4 } });
  await tile.getByRole("button", { name: /on the card$/ }).click();

  // The photo replaces the collage and the palette.
  const card = page.locator(".phone").first();
  await expect(card.locator(".fitphoto img")).toBeVisible();
  await expect(card.locator(".collage")).toHaveCount(0);
  // The palette stays, above the soundtrack and place.
  await expect(card.locator(".card-swatches i")).toHaveCount(5);

  await page.getByRole("button", { name: "Switch back to pieces" }).click();
  await expect(card.locator(".fitphoto")).toHaveCount(0);
  await expect(card.locator(".collage .pc")).not.toHaveCount(0);

  // Pulling pieces from a fit pic also takes the photo off.
  await tile.click({ position: { x: 4, y: 4 } });
  await tile.getByRole("button", { name: /on the card$/ }).click();
  await expect(card.locator(".fitphoto img")).toBeVisible();
  await tile.click({ position: { x: 4, y: 4 } });
  await tile.getByRole("button", { name: /^Use pieces from/ }).click();
  await expect(card.locator(".fitphoto")).toHaveCount(0);
  await expect(card.locator(".collage .pc")).toHaveCount(3);
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
  await page.getByRole("button", { name: "Full screen" }).first().click();
  const view = page.getByRole("dialog", { name: "Full screen card" });
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
    await page.getByRole("button", { name: "Full screen" }).first().click();
    const view = page.getByRole("dialog", { name: "Full screen card" });
    await expect(view).toBeVisible();

    const back = view.getByRole("button", { name: "Back to editing" });
    await expect(back).toBeInViewport();
    await back.click();
    await expect(view).toBeHidden();
  });
}

test("the date and weather are editable and land on the card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Day", exact: true }).click();

  await page.getByLabel("Date").fill("2026-12-25");
  await expect(page.locator(".phone .meta > div").first()).toContainText("DEC 25");
  await expect(page.locator(".cardpane-date")).toHaveText("Friday, December 25");

  await page.getByRole("spinbutton", { name: "Temperature" }).fill("12");
  await page.getByRole("button", { name: "°C" }).click();
  await page.getByRole("button", { name: "Snow", exact: true }).click();
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
