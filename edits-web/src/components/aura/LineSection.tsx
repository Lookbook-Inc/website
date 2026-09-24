"use client";

import { useState } from "react";
import type { Line } from "./banks";

const MAX_LINE = 46;

export function LineSection({
  lines,
  line,
  onChange,
}: {
  lines: Line[];
  line: string;
  onChange: (line: string) => void;
}) {
  const [own, setOwn] = useState("");

  return (
    <>
      <p className="hint">Pick a line. It goes at the top of the card.</p>

      <div className="lines">
        {lines.length ? null : <div className="empty-note">No lines in the bank yet.</div>}
        {lines.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`lineopt${entry.aura_text === line ? " on" : ""}`}
            aria-pressed={entry.aura_text === line}
            onClick={() => onChange(entry.aura_text)}
          >
            <span>{entry.aura_text}</span>
            <span className="tick">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 13l4.5 4.5L19 7" /></svg>
            </span>
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="own-line">Or write your own</label>
      <div className="own">
        <input
          id="own-line"
          value={own}
          maxLength={MAX_LINE}
          placeholder="Type a line — it goes straight on the card"
          aria-label="Write your own line"
          onChange={(event) => {
            // Applies as you type; clearing the box keeps the last line on the card.
            setOwn(event.target.value);
            if (event.target.value.trim()) onChange(event.target.value.trim());
          }}
        />
      </div>
      <div className="counter">{own.length}/{MAX_LINE}</div>
    </>
  );
}
