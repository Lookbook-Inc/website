"use client";

import { useState } from "react";
import { BLOB_COLORS, CONDITIONS } from "./placeholders";

const TEMP = /^(-?\d+)\s*°?\s*([CF])?$/i;

/** Split a stored "66°F" into its parts so the inputs can round-trip it. */
export function parseTemp(value: string) {
  const match = TEMP.exec(value.trim());
  if (!match) return { degrees: 66, unit: "F" as const };
  return {
    degrees: Number(match[1]),
    unit: (match[2]?.toUpperCase() === "C" ? "C" : "F") as "C" | "F",
  };
}

/**
 * Section 6 — the date and weather printed across the top of the card.
 *
 * Both are the member's to set: the web has no weather source (the iOS app reads
 * WeatherKit on-device), and the date is worth changing when you're making a
 * card for a day that isn't today.
 */
export function DaySection({
  dateISO,
  temp,
  sky,
  blob,
  onDateChange,
  onTempChange,
  onSkyChange,
  onBlobChange,
  onToast,
}: {
  dateISO: string;
  temp: string;
  sky: string;
  blob: string;
  onDateChange: (iso: string) => void;
  onTempChange: (temp: string) => void;
  onSkyChange: (sky: string) => void;
  onBlobChange: (hex: string) => void;
  onToast: (message: string) => void;
}) {
  const { degrees, unit } = parseTemp(temp);
  const [own, setOwn] = useState("");

  function setTemp(nextDegrees: number, nextUnit: "C" | "F") {
    onTempChange(`${Math.round(nextDegrees)}°${nextUnit}`);
  }

  function applyOwn() {
    const value = own.trim().toUpperCase();
    if (!value) {
      onToast("Write a condition first");
      return;
    }
    onSkyChange(value);
    setOwn("");
    onToast("Weather updated");
  }

  return (
    <>
      <div className="day-grid">
        <label className="day-field">
          <span>Date</span>
          <input
            type="date"
            value={dateISO}
            onChange={(event) => {
              if (event.target.value) onDateChange(event.target.value);
            }}
          />
        </label>

        <label className="day-field">
          <span>Temperature</span>
          <div className="temp-row">
            <input
              type="number"
              inputMode="numeric"
              value={degrees}
              min={-100}
              max={150}
              aria-label="Temperature"
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isNaN(next)) setTemp(next, unit);
              }}
            />
            <div className="unit-toggle" role="group" aria-label="Temperature unit">
              {(["F", "C"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={unit === option ? "on" : ""}
                  aria-pressed={unit === option}
                  onClick={() => setTemp(degrees, option)}
                >
                  °{option}
                </button>
              ))}
            </div>
          </div>
        </label>
      </div>

      <p className="pal-note" style={{ marginTop: "16px" }}>
        Conditions — shown under the temperature.
      </p>
      <div className="moods">
        {CONDITIONS.map((condition) => (
          <button
            key={condition}
            type="button"
            className={`mchip${sky === condition ? " on" : ""}`}
            onClick={() => onSkyChange(condition)}
          >
            {condition}
          </button>
        ))}
      </div>

      <p className="pal-note" style={{ marginTop: "20px" }}>
        Backdrop — the shape behind the outfit, and the bar under it.
      </p>
      <div className="blob-row">
        {BLOB_COLORS.map((option) => (
          <button
            key={option.hex}
            type="button"
            title={option.name}
            aria-label={option.name}
            aria-pressed={blob.toUpperCase() === option.hex}
            className={`blob-chip${blob.toUpperCase() === option.hex ? " on" : ""}`}
            style={{ background: option.hex }}
            onClick={() => onBlobChange(option.hex)}
          />
        ))}
        <label className="blob-custom" title="Pick any colour">
          <input
            type="color"
            value={blob}
            aria-label="Custom backdrop colour"
            onChange={(event) => onBlobChange(event.target.value.toUpperCase())}
          />
          <span>Custom</span>
        </label>
      </div>

      <div className="own">
        <input
          value={own}
          maxLength={14}
          placeholder="Write your own…"
          aria-label="Write your own condition"
          style={{ fontFamily: "var(--sans)", fontSize: "14px", letterSpacing: ".08em" }}
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
