"use client";

import { useState } from "react";
import type { WardrobeCard } from "@/types/api";
import { paletteNamesFor, swatchColors } from "./palette";

const MAX_NAME = 18;

export function PaletteSection({
  items,
  palName,
  onChange,
  onToast,
}: {
  items: WardrobeCard[];
  palName: string;
  onChange: (name: string) => void;
  onToast: (message: string) => void;
}) {
  const [own, setOwn] = useState("");
  const swatches = swatchColors(items);
  const suggested = paletteNamesFor(items);
  const names = suggested.includes(palName) ? suggested : [palName, ...suggested];

  function applyOwn() {
    const value = own.trim().toUpperCase();
    if (!value) {
      onToast("Name it first");
      return;
    }
    onChange(value);
    setOwn("");
    onToast("Palette renamed");
  }

  return (
    <>
      <div className="swrow">
        {swatches.map((color, index) => (
          <i key={`${color}-${index}`} style={{ background: color }} />
        ))}
      </div>
      <p className="pal-note">Pulled from the pieces on the card. Pick a name or write one.</p>

      <div className="namegrid">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            className={`nameopt${name === palName ? " on" : ""}`}
            onClick={() => onChange(name)}
          >
            {`“${name}”`}
          </button>
        ))}
      </div>

      <div className="own" style={{ marginTop: "14px" }}>
        <input
          value={own}
          maxLength={MAX_NAME}
          placeholder="Name it yourself…"
          aria-label="Name the palette"
          style={{ fontStyle: "italic", letterSpacing: ".1em" }}
          onChange={(event) => setOwn(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyOwn();
            }
          }}
        />
        <button className="btn btn-brass" type="button" style={{ padding: "10px 18px", fontSize: "13px" }} onClick={applyOwn}>
          Use it
        </button>
      </div>
    </>
  );
}
