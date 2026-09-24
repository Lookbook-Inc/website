"use client";

import { useState } from "react";
import type { WardrobeCard } from "@/types/api";
import { COLOR_FAMILIES, MOODS, paletteNamesFor, swatchColors } from "./palette";

const MAX_NAME = 18;

export function PaletteSection({
  items,
  palName,
  onChange,
}: {
  items: WardrobeCard[];
  palName: string;
  onChange: (name: string) => void;
}) {
  const [own, setOwn] = useState("");
  const swatches = swatchColors(items);
  const suggested = paletteNamesFor(items);
  const names = suggested.includes(palName) ? suggested : [palName, ...suggested];

  return (
    <>
      <div className="swrow">
        {swatches.map((color, index) => (
          <i key={`${color}-${index}`} style={{ background: color }} />
        ))}
      </div>
      <p className="hint">These colours come from your pieces. Pick a name for them.</p>

      <p className="field-label">Suggested for this outfit</p>
      <div className="namegrid">
        {names.map((name) => (
          <NameOption key={name} name={name} on={name === palName} onPick={onChange} />
        ))}
      </div>

      <details className="allnames">
        <summary>All names</summary>
        {[...MOODS, ...COLOR_FAMILIES].map((group) => (
          <div className="namegroup" key={group.id}>
            <span className="namegroup-label">{group.label}</span>
            <div className="namegrid">
              {group.names.map((name) => (
                <NameOption key={name} name={name} on={name === palName} onPick={onChange} />
              ))}
            </div>
          </div>
        ))}
      </details>

      <label className="field-label" htmlFor="own-palette">Or name it yourself</label>
      <div className="own">
        <input
          value={own}
          maxLength={MAX_NAME}
          id="own-palette"
          placeholder="Type a name…"
          aria-label="Name the palette"
          onChange={(event) => {
            setOwn(event.target.value);
            if (event.target.value.trim()) onChange(event.target.value.trim().toUpperCase());
          }}
        />
      </div>
    </>
  );
}

function NameOption({ name, on, onPick }: { name: string; on: boolean; onPick: (name: string) => void }) {
  return (
    <button type="button" className={`nameopt${on ? " on" : ""}`} aria-pressed={on} onClick={() => onPick(name)}>
      {name}
    </button>
  );
}
