"use client";

export function HowToUse() {
  return (
    <div className="toolwrap narrow">
      <div className="ccard">
        <h2>Making a card</h2>
        <ol className="doit">
          <li>
            <b>Outfit</b>
            <p>
              Click pieces in your wardrobe to put up to six on the card; click the × on one to take it off. Or
              switch to <span className="ui">Use a fit pic</span> and tap <span className="ui">Pieces</span> or{" "}
              <span className="ui">Photo</span> on any fit pic.
            </p>
          </li>
          <li>
            <b>Vibe: Line</b>
            <p>Click a line, or type your own and it goes straight on the card.</p>
          </li>
          <li>
            <b>Vibe: Palette</b>
            <p>The colours come from your pieces. Just pick a name.</p>
          </li>
          <li>
            <b>Vibe: Song and Place</b>
            <p>Search to narrow the list, then click one.</p>
          </li>
          <li>
            <b>Day</b>
            <p>Set the date, the weather and the background colour.</p>
          </li>
          <li>
            <b>Save it</b>
            <p>
              <span className="ui">Download image</span> saves a PNG. <span className="ui">Full screen</span> shows
              only the card, if you&rsquo;d rather take a screenshot.
            </p>
          </li>
        </ol>
      </div>

      <div className="ccard">
        <h2>Good to know</h2>
        <div className="short">
          <div>
            <strong>Today / Tonight</strong>
            <span>There are two cards. Switch between them above the card.</span>
          </div>
          <div>
            <strong>Move and resize</strong>
            <span>Drag pieces on the card. Drag a piece&rsquo;s corner to resize it.</span>
          </div>
          <div>
            <strong>Shuffle</strong>
            <span>Picks a random outfit, line, song and place.</span>
          </div>
          <div>
            <strong>Esc</strong>
            <span>Closes any open panel or the full-screen view.</span>
          </div>
          <div>
            <strong>Not saved</strong>
            <span>Cards aren&rsquo;t saved yet. Refreshing the page resets them.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
