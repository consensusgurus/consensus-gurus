// Scrab is PAUSED (2026-08-02, hours after launch).
//
// The launch bag was missing the Q, and the tile tracker printed the
// opponent's rack rather than letting anyone deduce it, so the deduction the
// game is built on was ornamental. Rather than leave a broken premise up while
// it is fixed, the route serves this notice and the puzzle is withheld.
//
// It returns as /babel with the Q restored, the bag printed on the page, and no
// tracker. This file is replaced by a redirect to /babel when that ships; the
// route is kept alive so links shared on launch day still land somewhere honest.

export const metadata = {
  title: 'Scrab is moving to Babel | Source of Truths',
  description: 'The daily Scrabble endgame is off for a short rebuild and returns as Babel.',
  alternates: { canonical: '/babel' },
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

export default function ScrabPaused() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 20 }}>
          {'BABEL'.split('').map((ch, i) => (
            <div key={i} style={{ width: 42, height: 42, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 25, background: i === 0 ? '#14532d' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 25, fontWeight: 800, color: '#1c1e24', margin: '0 0 10px' }}>Scrab is becoming Babel.</h1>
        <p style={{ fontSize: 15, color: '#262b35', fontWeight: 600, lineHeight: 1.6, margin: '0 0 14px' }}>
          We shipped it this morning with the Q missing from the bag, and with a tracker that
          simply told you your opponent&rsquo;s rack instead of letting you work it out. The
          deduction is the whole game, so it is off the board until that is right.
        </p>
        <p style={{ fontSize: 15, color: '#262b35', fontWeight: 600, lineHeight: 1.6, margin: '0 0 22px' }}>
          It returns shortly as <b>Babel</b>: the Q back where it belongs, the full bag printed
          on the page, and the subtraction left to you.
        </p>
        <a href="/daily" style={{ color: '#14532d', fontWeight: 800, textDecoration: 'underline' }}>Play the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}
