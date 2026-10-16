export function AuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-editorial" aria-hidden="true">
        <div className="wordmark light">LOOKBOOK</div>
        <div>
          <p className="eyebrow light">Edits · The web companion</p>
          <p className="auth-quote">Your wardrobe,<br />with room to breathe.</p>
        </div>
        <p className="auth-footnote">Browse what you own, what you wore, and what’s next.</p>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="wordmark mobile-wordmark">LOOKBOOK</div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {children}
        </div>
      </section>
    </main>
  );
}
