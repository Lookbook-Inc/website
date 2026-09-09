import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState, Media, WardrobeGrid } from "@/components/ui";
import { fixtures } from "@/lib/fixtures";

describe("read-only collection UI", () => {
  it("renders an accessible missing-media fallback", () => {
    render(<Media src={null} alt="Blue jacket" />);
    expect(screen.getByRole("img", { name: "Blue jacket image unavailable" })).toBeInTheDocument();
  });

  it("renders an actionable empty state", () => {
    render(<EmptyState title="No pieces found" copy="Try another filter." />);
    expect(screen.getByRole("heading", { name: "No pieces found" })).toBeInTheDocument();
  });

  it("links wardrobe cards to their owned-resource detail pages", () => {
    render(<WardrobeGrid items={fixtures.wardrobe.items.slice(0, 1)} />);
    expect(screen.getByRole("link", { name: /Ink chore coat/ })).toHaveAttribute(
      "href",
      `/wardrobe/${fixtures.wardrobe.items[0].id}`,
    );
  });
});
