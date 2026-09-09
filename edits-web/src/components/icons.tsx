export function Arrow({ direction = "right" }: { direction?: "left" | "right" }) {
  return <span aria-hidden="true">{direction === "right" ? "↗" : "←"}</span>;
}

export function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    Home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/></>,
    Wardrobe: <><path d="m8 5 4-2 4 2 5 3-3 5-2-1v9H8v-9l-2 1-3-5 5-3Z"/><path d="M10 6c.7 1.2 3.3 1.2 4 0"/></>,
    "Fit Pics": <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-4-4L6 20"/></>,
    Outfits: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h8M8 17h5"/></>,
    Recommendations: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{paths[name]}</svg>;
}
