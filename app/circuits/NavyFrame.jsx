import Footer from '../Footer';

// The page frame for every navy-ground page in this area: the circuit pages and
// the run summary.
//
// IT EXISTS FOR THE FOOTER. app/Footer.jsx is shared with the LIGHT pages, so
// it paints itself transparent with near-black ink (T.ink) and inherits
// whatever surface the page gives it. But `body` is navy by design
// (globals.css, load-bearing for the iPhone dome), so a page that renders the
// footer without supplying a light surface of its own drops black text onto
// navy and the whole footer disappears. That shipped on the circuit pages
// (owner report, 2026-08-18) and had been true of /daily-five since it launched.
//
// The fix is the site's existing one, not a new one: /quizzes re-inks the
// shared footer from its own navy wrapper (`.qzloft footer` in
// QuizHomeClient.jsx). Same colours here, same !important (the footer's own
// colours are inline styles, so nothing else outranks them), just hoisted into
// a component so the circuit pages and the summary cannot drift from each other
// the way two copies of a rule would.
//
// A NEW NAVY PAGE IN THIS AREA SHOULD USE THIS rather than rendering <Footer />
// directly, or it will ship the same invisible footer.
export default function NavyFrame({ children }) {
  return (
    <div className="navy-loft">
      <style dangerouslySetInnerHTML={{ __html: `
        .navy-loft footer,.navy-loft footer div,.navy-loft footer a,.navy-loft footer span{color:#c3d4ee !important;}
        .navy-loft footer,.navy-loft footer *{border-top-color:rgba(255,255,255,0.16) !important;}
      ` }} />
      {children}
      <Footer />
    </div>
  );
}
