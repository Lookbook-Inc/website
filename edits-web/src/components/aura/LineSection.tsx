"use client";

import { useState } from "react";
import type { Line } from "./banks";

const MAX_LINE = 46;

export function LineSection({
  lines,
  line,
  onChange,
  onToast,
}: {
  lines: Line[];
  line: string;
  onChange: (line: string) => void;
  onToast: (message: string) => void;
}) {
  const [own, setOwn] = useState("");

  function applyOwn() {
    const value = own.trim();
    if (!value) {
      onToast("Write a line first");
      return;
    }
    onChange(value);
    setOwn("");
    onToast("Line updated");
  }

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
          placeholder="Type a line…"
          aria-label="Write your own line"
          onChange={(event) => setOwn(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyOwn();
            }
          }}
        />
        <button className="btn btn-brass" type="button" onClick={applyOwn}>
          Use it
        </button>
      </div>
      <div className="counter">{own.length}/{MAX_LINE}</div>
    </>
  );
}
