'use client';

// The one line naming what ended the round, shown on the navy stage under the
// board for the beat the finish card is held back (app/useEndHold.js).
//
// ONLY FOR A GAME THAT DOES NOT ALREADY SAY IT. The six End Game titles print a
// verdict on the board the moment play stops, and those lines are better than
// anything a shared component could write because they carry the actual figures
// (Chain: "Boxes counted. The engine takes it 13 to 11."). They were simply
// never readable, because the card covered them in the same tick. The hold fixes
// that, so those games pass no note and this renders nothing. Babel is the
// exception: its verdict lives in the .loft-sol panel, which is held back with
// the card, so it has nothing on the board to read and gets a note instead.
//
// WHATEVER IS PASSED IS THE OPPONENT'S OWN MOVE, never the one you missed. These
// positions are replayable and the key is deliberately withheld from a player
// who did not find it, so a note naming the word, the column or the line would
// spend the puzzle that .loft-sol is careful not to.
export default function EndHoldNote({ show, note }) {
  if (!show || !note) return null;
  return (
    <div className="loft-hold" role="status" aria-live="polite">
      <span>{note}</span>
    </div>
  );
}
