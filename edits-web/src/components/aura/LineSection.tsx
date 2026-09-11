"use client";

import { useState } from "react";
import { LINES, MOODS } from "./placeholders";

const MAX_LINE = 46;

export function LineSection({
  line,
  onChange,
  onToast,
}: {
  line: string;
  onChange: (line: string) => void;
  onToast: (message: string) => void;
}) {
  const [mood, setMood] = useState<string>("All");
  const [own, setOwn] = useState("");

  const list = LINES.filter((entry) => mood === "All" || entry.mood === mood);

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
      <div className="moods">
        {MOODS.map((entry) => (
          <button
            key={entry}
            type="button"
            className={`mchip${mood === entry ? " on" : ""}`}
            onClick={() => setMood(entry)}
          >
            {entry}
          </button>
        ))}
      </div>

      <div className="lines">
        {list.map((entry) => (
          <button
            key={entry.text}
            type="button"
            className={`lineopt${entry.text === line ? " on" : ""}`}
            onClick={() => onChange(entry.text)}
          >
            <span>{`“${entry.text}”`}</span>
            <span className="tick">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 13l4.5 4.5L19 7" /></svg>
            </span>
          </button>
        ))}
      </div>

      <div className="own">
        <input
          value={own}
          maxLength={MAX_LINE}
          placeholder="Write your own…"
          aria-label="Write your own line"
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
      <div className="counter">{own.length}/{MAX_LINE} · shows on the top of the card</div>
    </>
  );
}
