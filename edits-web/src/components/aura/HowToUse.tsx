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
              Click <span className="ui">Add or change pieces</span> to choose up to six pieces, or switch to{" "}
              <span className="ui">Use a fit pic</span> to pull the pieces from a photo.
            </p>
          </li>
          <li>
            <b>Line</b>
            <p>Pick a bank, then click a line. You can also type your own.</p>
          </li>
          <li>
            <b>Palette</b>
            <p>The colours come from your pieces. Just pick a name.</p>
          </li>
          <li>
            <b>Song and Place</b>
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
            <span>Drag pieces on the card. Drag a piece&rsquo;s corner to resize it, or use the sliders in Outfit.</span>
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
