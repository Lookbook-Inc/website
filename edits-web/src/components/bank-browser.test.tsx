import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BankBrowser } from "@/components/bank-browser";
import { fixtures } from "@/lib/fixtures";

afterEach(cleanup);

describe("bank browser", () => {
  it("starts with songs and filters by title or artist", () => {
    render(<BankBrowser songs={fixtures.songs.items} editLines={fixtures.editLines.items} />);

    expect(screen.getByRole("tabpanel", { name: /Songs/ })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search songs or artists" }), {
      target: { value: "billie" },
    });
    expect(screen.getByRole("heading", { name: "Wildflower" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Lose Control" })).not.toBeInTheDocument();
  });

  it("switches to edit lines and clears the prior search", () => {
    render(<BankBrowser songs={fixtures.songs.items} editLines={fixtures.editLines.items} />);
    const songSearch = screen.getByRole("searchbox", { name: "Search songs or artists" });
    fireEvent.change(songSearch, { target: { value: "wildflower" } });

    fireEvent.click(screen.getByRole("tab", { name: /Edit Lines/ }));

    const lineSearch = screen.getByRole("searchbox", { name: "Search edit lines" });
    expect(lineSearch).toHaveValue("");
    fireEvent.change(lineSearch, { target: { value: "moon" } });
    expect(screen.getByText("the moon saved you a seat.")).toBeInTheDocument();
    expect(screen.queryByText("velvet skies ahead.")).not.toBeInTheDocument();
  });

  it("shows a useful empty search state", () => {
    render(<BankBrowser songs={fixtures.songs.items} editLines={fixtures.editLines.items} />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search songs or artists" }), {
      target: { value: "no such song" },
    });
    expect(screen.getByRole("heading", { name: "No songs found" })).toBeInTheDocument();
  });
});
