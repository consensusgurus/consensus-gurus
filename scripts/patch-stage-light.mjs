// The last piece of light mode: THE ACCENT.
//
// The token refactor re-grounded the stage's surfaces but left the category
// step as a JS value, so a light block could turn the ground pale and the
// accent stayed a pastel that only works on near-black. This publishes the
// accent as a variable too, in both registers, and adds `?theme=light` so the
// whole thing can be looked at before anyone decides where a permanent control
// lives.
//
// WHY THE ROOT PUBLISHES TWO AND THE STYLESHEET PICKS ONE. An inline style
// beats a stylesheet, so a root that sets --stg-acc directly could never be
// re-themed by CSS. It sets --stg-acc-dk and --stg-acc-lt instead, and
// globals.css maps --stg-acc to whichever the register calls for. The same
// reason the lift is a channel: one place decides, everything follows.
import { readFileSync, writeFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) throw new Error('usage: patch-stage-light.mjs <file...>');
let grand = 0;

for (const file of files) {
  let s = readFileSync(file, 'utf8');
  let n = 0;
  const edit = (name, a, b, optional = false) => {
    const hits = s.split(a).length - 1;
    if (hits === 0 && optional) return;
    if (hits !== 1) throw new Error(`${file.split('/').pop()}: "${name}" matched ${hits}`);
    s = s.replace(a, b); n += 1;
  };
  const base = file.split('/').pop();

  if (base === 'StageChrome.jsx') {
    // The cap stops declaring the accent: the client's root owns it now, so
    // there is one publisher rather than two that can disagree.
    edit('cap accent', "<div className=\"stg-top\" style={{ '--stg': colour }}>", "<div className=\"stg-top\">");
    const hits = (s.match(/var\(--stg\)/g) || []).length;
    if (hits) { s = s.replace(/var\(--stg\)/g, 'var(--stg-acc)'); n += hits; }
    // `colour` is now unused for the style but still names the game's step for
    // anything that needs the literal.
    edit('colour note', "  const colour = gameColor(gameKey);",
      "  // Kept for callers that need the literal; the CAP reads var(--stg-acc),\n"
      + "  // which the client's root publishes in both registers.\n"
      + "  const colour = gameColor(gameKey);");
  } else if (/Client\.jsx$/.test(base)) {
    // STAGE_C becomes the variable. It is only ever used as a CSS colour, so
    // every call site themes itself and none of them had to be found.
    const key = /Crux/.test(base) ? 'crux' : /Suds/.test(base) ? 'suds' : /Mate/.test(base) ? 'mate' : 'anon';
    edit('accent const',
      `  const STAGE_C = gameColor('${key}');`,
      `  // THE ACCENT AS A VARIABLE. It is only ever used as a CSS colour, so\n`
      + `  // every call site below themes itself and none of them had to be found.\n`
      + `  // The literals are published on the root element instead.\n`
      + `  const STAGE_C = STAGE ? 'var(--stg-acc)' : gameColor('${key}');\n`
      + `  const STAGE_ACC = { '--stg-acc-dk': gameColor('${key}'), '--stg-acc-lt': gameColorLight('${key}') };`);
    edit('ramp import',
      "import { gameColor, ",
      "import { gameColorLight, gameColor, ");
    // the root publishes both registers, and the review flag
    edit('root style',
      "style={{ minHeight: '100vh', background: STAGE ? STAGE_GROUND : T.surface,",
      "data-stage-theme={STAGE ? stageTheme : undefined}\n"
      + "      style={{ ...(STAGE ? STAGE_ACC : null), minHeight: '100vh', background: STAGE ? 'var(--stg-ground)' : T.surface,");
    edit('theme flag',
      "  const STAGE = isStage(",
      "  // ?theme=light, read in an EFFECT for the same reason every other query\n"
      + "  // read on this page is: the server has none, so deciding during render\n"
      + "  // makes the first client paint disagree with the server's.\n"
      + "  const [stageTheme, setStageTheme] = useState('dark');\n"
      + "  useEffect(() => {\n"
      + "    try {\n"
      + "      const q = new URLSearchParams(window.location.search).get('theme');\n"
      + "      if (q === 'light' || q === 'dark') setStageTheme(q);\n"
      + "    } catch (e) {}\n"
      + "  }, []);\n"
      + "  const STAGE = isStage(");
  }

  writeFileSync(file, s);
  console.log(`  ${base.padEnd(20)} ${n} edit(s)`);
  grand += n;
}
console.log(`${grand} total`);
