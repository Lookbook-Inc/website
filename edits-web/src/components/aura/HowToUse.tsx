"use client";

export function HowToUse() {
  return (
    <div className="toolwrap narrow">
      <header className="tp-head">
        <p className="eyebrow">Cheat sheet</p>
        <h1>How to use it</h1>
        <p>Six moves. The card on the left updates the moment you change anything.</p>
      </header>

      <div className="ccard">
        <ol className="doit">
          <li>
            <span className="dn">1</span>
            <div>
              <b>Sign in</b>
              <p>Today&rsquo;s card is already made from your wardrobe. You&rsquo;re editing it, not building one.</p>
            </div>
          </li>
          <li>
            <span className="dn">2</span>
            <div>
              <b><span className="ui">1 · The fit</span> — what&rsquo;s on the card</b>
              <p>
                Hit <span className="ui">+</span> to pick pieces (six max), or open{" "}
                <span className="ui">From your Collection</span> and tap a fit pic to pull its pieces out.
              </p>
            </div>
          </li>
          <li>
            <span className="dn">3</span>
            <div>
              <b><span className="ui">2 · The line</span> — the line up top</b>
              <p>Tap one from the bank, or type your own in the box underneath.</p>
            </div>
          </li>
          <li>
            <span className="dn">4</span>
            <div>
              <b><span className="ui">3 · The palette</span> — name the colours</b>
              <p>The five circles come off your pieces&rsquo; real shades. You only pick the name.</p>
            </div>
          </li>
          <li>
            <span className="dn">5</span>
            <div>
              <b><span className="ui">4 · Soundtrack</span> and <span className="ui">5 · Place</span></b>
              <p>Search, tap. It lands on the card straight away.</p>
            </div>
          </li>
          <li>
            <span className="dn">6</span>
            <div>
              <b><span className="ui">Download image</span> and <span className="ui">See final aura card</span></b>
              <p>Download saves the card as a PNG. The full view puts it alone on screen for a clean screenshot.</p>
            </div>
          </li>
        </ol>
      </div>

      <div className="ccard">
        <h3>Also worth knowing</h3>
        <div className="short">
          <div>
            <strong>Drag</strong>
            <span>
              Move pieces right on the card, or on the dotted canvas.{" "}
              <em style={{ fontStyle: "normal" }}>Reset card layout</em> puts them back.
            </span>
          </div>
          <div>
            <strong>Resize</strong>
            <span>
              Hover a piece on the card and drag its corner, or use the sliders under{" "}
              <span className="ui">1 · The fit</span>.
            </span>
          </div>
          <div>
            <strong>Tonight</strong>
            <span>Click the dark strip at the bottom of the card to switch to tonight&rsquo;s edit — a dark card you change the same way.</span>
          </div>
          <div>
            <strong>Shuffle</strong>
            <span>The icon beside Download redrafts the whole card at once.</span>
          </div>
          <div>
            <strong>Your Lookbook</strong>
            <span>The second rail icon browses everything you own — wardrobe, fit pics, outfits and your latest edit.</span>
          </div>
          <div>
            <strong>Esc</strong>
            <span>Closes the picker, a detail panel, or the full-card view.</span>
          </div>
          <div>
            <strong>Heads up</strong>
            <span>Cards aren&rsquo;t saved yet — refresh and you&rsquo;re back to today&rsquo;s default.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
