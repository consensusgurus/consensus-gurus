#!/usr/bin/env node
// The light switch, and where it had to go.
//
// The stage draws its own one-line cap and no site header, so a header toggle
// cannot be REACHED from a game page. It is a glyph in the cap, beside Home,
// because the cap holds one line and a labelled button would spend a third of
// it saying what a sun says. Backed by lib/stage-theme.js, which is a store
// rather than a prop precisely so no client's call site has to move for it.
//
// The four clients lose their private ?theme= effect and read the shared store
// instead, so the value the cap toggles and the value the root paints are the
// same value.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-stage-toggle.mjs <repo-root>'); process.exit(1); }

let TOTAL = 0;
const PENDING = new Map();
const rd = (p) => (PENDING.has(p) ? PENDING.get(p) : fs.readFileSync(path.join(ROOT, p), 'utf8'));
const wr = (p, s) => { PENDING.set(p, s); };
function one(src, find, repl, label) {
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: anchor matched ${n} times, expected 1`);
  TOTAL++;
  return src.replace(find, repl);
}

// ------------------------------------------------------------- StageChrome
{
  const p = 'app/StageChrome.jsx';
  let s = rd(p);

  s = one(s, `  const [panel, setPanel] = useState(false);`,
    `  const [panel, setPanel] = useState(false);
  // The switch reads the SAME store the page root reads, so the glyph and the
  // ground can never disagree about which register is showing.
  const [theme, setTheme] = useStageTheme();`, 'stagechrome theme state');

  // The import goes beside the others. useState is already imported here.
  s = one(s, `import { Home } from 'lucide-react';`,
    `import { Home } from 'lucide-react';
import { useStageTheme } from '@/lib/stage-theme';`, 'stagechrome import');

  s = one(s, `        <a className="stg-cx stg-home" href={homeHref} aria-label="Home" title="Home">`,
    `        <button
          type="button"
          className="stg-cx stg-theme"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
          title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
        >
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
            </svg>
          )}
        </button>
        <a className="stg-cx stg-home" href={homeHref} aria-label="Home" title="Home">`, 'stagechrome switch');

  s = one(s, `.stg-home{padding:5px 8px;}`,
    `.stg-home{padding:5px 8px;}
.stg-theme{padding:5px 8px;}`, 'stagechrome switch css');

  wr(p, s);
}

// ------------------------------------------------- the four stage clients
for (const [p, key] of [
  ['app/crux/CruxClient.jsx', 'crux'],
  ['app/suds/SudsClient.jsx', 'suds'],
  ['app/mate/MateClient.jsx', 'mate'],
  ['app/anon/AnonClient.jsx', 'anon'],
]) {
  let s = rd(p);
  s = one(s, `  // ?theme=light, read in an EFFECT for the same reason every other query
  // read on this page is: the server has none, so deciding during render
  // makes the first client paint disagree with the server's.
  const [stageTheme, setStageTheme] = useState('dark');
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('theme');
      if (q === 'light' || q === 'dark') setStageTheme(q);
    } catch (e) {}
  }, []);`,
  `  // The register comes from the shared store, not from a private effect, so
  // the switch in the cap repaints this root without a prop between them.
  // Still resolved in an effect: the server cannot know what is stored.
  const [stageTheme] = useStageTheme();`, `${key} theme state`);

  // Import beside the stage's other lib imports.
  const impAnchor = `import { isStage } from '@/lib/stage';`;
  if (!s.includes(impAnchor)) throw new Error(`${key}: no isStage import to anchor on`);
  s = one(s, impAnchor, `${impAnchor}\nimport { useStageTheme } from '@/lib/stage-theme';`, `${key} import`);
  wr(p, s);
}

for (const [p, s] of PENDING) fs.writeFileSync(path.join(ROOT, p), s);
console.log(`patch-stage-toggle: ${TOTAL} edits across ${PENDING.size} files`);
