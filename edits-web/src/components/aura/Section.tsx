"use client";

import { useEffect, useRef } from "react";

export function Section({
  index,
  title,
  value,
  open,
  onToggle,
  children,
}: {
  index: number;
  title: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open && !wasOpen.current) {
      ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    wasOpen.current = open;
  }, [open]);

  return (
    <div className={`sec${open ? " open" : ""}`} ref={ref}>
      <button className="sec-h" type="button" onClick={onToggle} aria-expanded={open}>
        <span className="num">{index}</span>
        <h3>{title}</h3>
        <span className="val">{value}</span>
        <svg className="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      </button>
      {open ? <div className="sec-b"><div className="pad">{children}</div></div> : null}
    </div>
  );
}
