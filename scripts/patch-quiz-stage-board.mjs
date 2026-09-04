// THE BOARD PASS for a quiz client, in the one shape that is safe to automate.
//
//   node scripts/patch-quiz-stage-board.mjs "app/quiz/[id]/TimedMcqClient.jsx"
//   node scripts/patch-quiz-stage-board.mjs --audit "app/quiz/[id]/*.jsx"
//
// EVERY REPLACEMENT KEEPS THE ORIGINAL EXPRESSION AS THE FALLBACK, written
// var(--stg-x, <the original>). That is not a style choice, it is what makes
// this pass safe to run on eleven files at once:
//
//   * off the stage nothing is merely equivalent, it is BYTE-IDENTICAL after
//     the browser resolves it, because --stg-* is defined only inside
//     .stage-page. `?stage=0` and an unconverted quiz cannot regress.
//   * a custom property is resolved by the BROWSER against the element the
//     style lands on, so it needs no lexical scope. That is why this pass,
//     unlike the chrome converter's INK/FADED rewrite, can touch a module-level
//     style object at the foot of the file without a ReferenceError -- and all
//     eleven of these clients declare StatBox, ghostBtn, labelStyle and
//     fieldStyle down there, which is the exact shape that 500'd every quiz
//     page once.
//
// WHAT IT DELIBERATELY DOES NOT TOUCH, because each needs a human to look:
//
//   1. A MEANING TINT AND ITS INK. `#eef3e6` says "you got this one right" and
//      `#f7e7e3` says you did not. They are pale fills carrying DARK text, so
//      they are self-consistent on any ground and they stay. Converting them
//      would delete the meaning to fix a contrast problem they do not have.
//   2. AN ASSIGNMENT PALETTE. Four of the eleven build a button's colours as
//      `let bg = T.white, border = COLORS.ink, fg = COLORS.ink` and then
//      reassign them per state. Converting the fill there without its ink is
//      the ternary-arm bug that shipped ten white answer slots carrying
//      near-white text: unreadable in both directions at once, and invisible to
//      any scan that reads the page at rest, because those states do not exist
//      until somebody presses Start. --audit lists them; a person converts them.
//   3. A NEAR-BLACK FILL WITH NO INK BESIDE IT on the same line. The pair is
//      converted together below; a lone one is reported instead of guessed at,
//      because whether it is a chip, a rule or a shadow decides the token.
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const AUDIT = args.includes('--audit');
// --accent-only exists for QuizClient, the pilot, which went onto the stage
// before the navy accent was understood as a TEXT problem. Its fills were
// converted by hand a fortnight ago in another spelling, so the fill rules here
// would find nothing and the shared shapes would find nothing; running the
// whole pass over it to reach the one thing it is missing is how a converter
// starts quietly editing work that was already right.
const ACCENT_ONLY = args.includes('--accent-only');
// --child is for the nine boards and the dozen panels that a converted client
// RENDERS but does not contain. They have no QSTAGE flag of their own and they
// must not grow one: BankQuizBoard is mounted by QuizClient, which knows
// whether it is on the stage, and threading a flag through nine children is
// nine more places for the two halves of one page to disagree.
//
// They do not need one. var(--stg-x, <the original>) is resolved by the BROWSER
// against the element the style lands on, so a child inherits the register from
// whatever page it is standing on, with no flag, no prop and no import -- and
// off the stage the property is undefined and the fallback is the original, so
// an unconverted quiz is byte-identical. This mode adds the TEXT rules the
// clients get as INK/FADED consts, which a child cannot have.
const CHILD = args.includes('--child');
const paths = args.filter((a) => !a.startsWith('--'));
if (!paths.length) throw new Error('usage: patch-quiz-stage-board.mjs [--audit] <QuizClient.jsx>...');

// ── THE MAP ─────────────────────────────────────────────────────────────────
// ROLES, NOT HUES. --stg-surf is a raised surface (a card, a panel), --stg-surf2
// a tray or a pressed key, --stg-raise an opaque lifted surface (which is what a
// near-black chip becomes, and it is WHITE on the light register, which is why
// its ink has to travel with it), --stg-line a hairline, --stg-line2 a rule.
//
// BOTH SPELLINGS OF EVERY PAIR. COLORS is an alias layer over T (`cream` is
// T.surface, `paper` is T.paper), so one client mixes both inside a single
// value; a map holding only one of them converts one arm of a ternary and
// leaves the other, which is the half-conversion that is worse than none.
//
// ⚠️ AND THERE ARE THREE SPELLINGS, NOT TWO. Nine of the shared children --
// QuizLeaderboard, QuizDoneRecap, QuizStandings, LeaderboardStrip and the rest
// -- declare their OWN local alias at the top of the file:
//
//     const C = { cream: T.surface, paper: T.paper, ink: T.ink, ember: T.accent, ... }
//
// A pass that knows COLORS and T walks past every one of them IN SILENCE and
// reports "+0 edits", which reads exactly like a file that had nothing to do.
// That is what the first run of this script reported for all nine.
const ALIAS = '(?:COLORS|C)';
//
// ⚠️ THE FALLBACK IS THE ORIGINAL EXPRESSION, NEVER A TRANSCRIBED HEX. Writing
// var(--stg-surf,#ffffff) is the same colour today and it is wrong twice over:
// a transcription can be wrong where `${T.white}` cannot, and it moves a brand
// colour back out of the token table, which is precisely what
// scripts/check-theme.mjs exists to stop. The first version of this pass
// emitted literals and took that checker from 456 findings to 684 in one run,
// which is how a standing red stops being a signal at all.
const FILLS = [
  ['COLORS.cream', '--stg-surf'],
  ['C.cream', '--stg-surf'],
  ['T.surface', '--stg-surf'],
  ['T.white', '--stg-surf'],
  ['COLORS.paper', '--stg-surf2'],
  ['C.paper', '--stg-surf2'],
  ['T.paper', '--stg-surf2'],
];

// A near-black FILL and the light ink that rides on it, ON THE SAME LINE. They
// convert TOGETHER or not at all: --stg-raise is #0e131f on the dark register
// and #ffffff on the light one, so a chip whose fill follows the register while
// its ink stays cream is legible in exactly one of the two.
const PAIRS = [
  [new RegExp(`background: (${ALIAS})\\.ink, color: (${ALIAS})\\.cream\\b`, 'g'),
    'background: `var(--stg-raise,${$1.ink})`, color: `var(--stg-ink,${$2.cream})`'],
  [new RegExp(`background: (${ALIAS})\\.ink, color: T\\.white\\b`, 'g'),
    'background: `var(--stg-raise,${$1.ink})`, color: `var(--stg-ink,${T.white})`'],
];

// A hairline and a rule. THE LOOKBEHIND ON `color:` IS LOAD-BEARING elsewhere;
// here the risk is the mirror image, so borders are matched by their OWN
// literal shape (`<n>px solid ${...}`) and never by a bare colour token.
const BORDERS = [
  [new RegExp('`(1px|1\\.5px|2px) (solid|dotted) \\$\\{(' + ALIAS + ')\\.faded\\}(22|33|44|55|66|88)`', 'g'),
    '`$1 $2 var(--stg-line,${$3.faded}$4)`'],
  [new RegExp('`(1\\.5px|2px) solid \\$\\{(' + ALIAS + ')\\.ink\\}`', 'g'),
    '`$1 solid var(--stg-line2,${$2.ink})`'],
  [new RegExp('`1px solid \\$\\{(' + ALIAS + ')\\.ink\\}`', 'g'),
    '`1px solid var(--stg-line,${$1.ink})`'],
];

// The warm near-black chosen for a cream page, ten times across the eleven, on
// prose. It is 1.4:1 on this ground and INVISIBLE TO EVERY SWEEP THAT MATCHES A
// NAME, which is why it is written out here as the literal it is.
const HEXES = [
  [/color: '#4a4339'/g, "color: 'var(--stg-ink2,#4a4339)'"],
];

// ── THE ACCENT AS TEXT IS NOT THE ACCENT AS A FILL ──────────────────────────
//
// COLORS.ember is #233a63, a NAVY, and it is this surface's accent on every
// eyebrow, every back link, every rank number and every secondary button's
// label -- 86 sites across the eleven. On a cream page it is a strong accent.
// On #0b0f1a it is 1.6:1, which is not "a bit dark", it is text nobody can see,
// and it is the single most common ink on these boards.
//
// It cannot become the accent FILL either: --stg-acc is a pale slate on the
// dark register and a deep one on the light, so as a fill under this ink it
// would be the accent on itself. --stg-acc-ink is the same colour in its TEXT
// role, defaulting to the fill where a surface has no separate one, which is
// correct here in both registers (11.06:1 dark, 7.00:1 light -- measured in
// lib/quiz-stage.js and held there by scripts/verify-quiz-stage.mjs).
//
// The BORDER spelling travels with it: a navy hairline is the same colour
// making the same disappearance, one property along.
const ACCENT = [
  [new RegExp(`(?<![-\\w])color: (${ALIAS})\\.ember\\b`, 'g'), 'color: `var(--stg-acc-ink,${$1.ember})`'],
  [new RegExp(`(?<![-\\w])color:\\$\\{(${ALIAS})\\.ember\\}`, 'g'), 'color:var(--stg-acc-ink,${$1.ember})'],
  [new RegExp('`(1px|1\\.5px|2px) solid \\$\\{(' + ALIAS + ')\\.ember\\}`', 'g'), '`$1 solid var(--stg-acc,${$2.ember})`'],
];

// ── THE SHAPES THAT ARE SHARED WORD FOR WORD ────────────────────────────────
//
// Each of these appears in several of the eleven byte-identically, because they
// were copied between the clients rather than shared as a component. Converting
// them here rather than in each file is not a shortcut: a rule written eleven
// times drifts, and a rule written once cannot.
const SHAPES = [
  // YOUR OWN ROW ON THE LEADERBOARD is the one surface on that board meant to
  // be picked out, so it takes --stg-acc-tint and the accent's own hairline.
  // NOT --stg-chip: a chip is a meaning giving its colour UP, the opposite job,
  // and at 8% neutral your row sat three points of alpha from everyone else's,
  // which is exactly what "the colours are not bright enough" meant last time.
  ['your leaderboard row',
    "background: mine ? T.white : COLORS.paper, borderRadius: 10, border: `1px solid ${mine ? COLORS.ember : COLORS.faded + '22'}`",
    "background: mine ? `var(--stg-acc-tint,${T.white})` : `var(--stg-surf,${COLORS.paper})`, borderRadius: 10, border: `1px solid ${mine ? `var(--stg-acc,${COLORS.ember})` : `var(--stg-line,${COLORS.faded + '22'})`}`"],
  // THE TAB PILL, in three of the eleven. The selected tab is a lifted surface
  // and its label is the page's ink; converting the fill alone leaves near-black
  // text on a near-black pill, which is the ternary-arm bug in miniature.
  // ── A MEANING COLOUR AS INK IS NOT CONVERTED IN BULK, AND THIS IS WHY ────
  // COLORS.forest is T.success #10b981, which is 2.24:1 on the LIGHT stage
  // ground: as prose sitting on the page it has to become --stg-good, which is
  // the deep #047857 there. But the SAME token is the tick on a pale mint
  // "you got this right" tint, and --stg-good on the DARK register is a pale
  // #6ee7b7, so a blanket rewrite would put a near-white tick on a near-white
  // tint and delete the one thing the tint is for. The ground decides, and a
  // text-scanner cannot see the ground. So each site that sits on the PAGE is
  // named here, and the live sweep is what finds them: it measured every ink
  // on every board in both registers and reported exactly one.
  // Anchored on the ORIGINAL text, because the shapes run BEFORE the ternary
  // scanner: anchoring on a half-converted line would have matched nothing,
  // silently, which is exactly what the first version of this entry did.
  ['grid-fill hint line',
    'color: hintBad ? COLORS.ember : COLORS.forest }}>{hint}',
    'color: hintBad ? `var(--stg-acc-ink,${COLORS.ember})` : `var(--stg-good,${COLORS.forest})` }}>{hint}'],
  // THE CLOCK BAR, in five of the eleven. A meaning that stops meaning anything
  // is not a meaning worth keeping: COLORS.ember is a NAVY, so the "your clock
  // is running out" fill was a bar of near-black on a near-black ground and the
  // one moment it exists to shout about was the one it went silent for. The
  // stage has these two exact meanings as tokens, in both registers.
  ['clock bar (ember/forest)',
    'background: lowClock ? COLORS.ember : COLORS.forest',
    'background: lowClock ? `var(--stg-bad,${COLORS.ember})` : `var(--stg-good,${COLORS.forest})`'],
  ['clock bar (rust/forest)',
    'background: lowClock ? COLORS.rust : COLORS.forest',
    'background: lowClock ? `var(--stg-bad,${COLORS.rust})` : `var(--stg-good,${COLORS.forest})`'],
  // THE PROGRESS DOTS, same three meanings plus "you are here". The dot you are
  // on takes the accent rather than a third meaning colour, because where you
  // are is not a verdict.
  ['progress dots (cur)',
    "background: done ? (good ? COLORS.forest : COLORS.ember) : (cur ? COLORS.rust : COLORS.faded + '44')",
    "background: done ? (good ? `var(--stg-good,${COLORS.forest})` : `var(--stg-bad,${COLORS.ember})`) : (cur ? `var(--stg-acc,${COLORS.rust})` : `var(--stg-line,${COLORS.faded + '44'})`)"],
  ['progress dots (curi)',
    "background: done ? COLORS.forest : (curi ? COLORS.ember : COLORS.faded + '44')",
    "background: done ? `var(--stg-good,${COLORS.forest})` : (curi ? `var(--stg-acc,${COLORS.ember})` : `var(--stg-line,${COLORS.faded + '44'})`)"],
  // A SELECTED TILE IS THE ACCENT, NOT A DARK CHIP. Reading it as "the ink
  // colour, inverted" is what the cream page meant; on the stage --stg-raise is
  // near-black on one register and WHITE on the other, so a selected tile would
  // be LIGHTER than an unselected one in light mode and the selection would
  // read backwards. The accent means the same thing in both.
  ['selected tile',
    'background: sel ? COLORS.ink : COLORS.paper, color: sel ? T.white : COLORS.ink',
    'background: sel ? `var(--stg-acc,${COLORS.ink})` : `var(--stg-surf2,${COLORS.paper})`, color: sel ? `var(--stg-onramp,${T.white})` : `var(--stg-ink,${COLORS.ink})`'],
  ...['active', 'isActive'].map((v) => [`tab pill (${v})`,
    `background: ${v} ? T.white : 'transparent', color: ${v} ? COLORS.ink : COLORS.faded`,
    `background: ${v} ? \`var(--stg-surf2,\${T.white})\` : 'transparent', color: ${v} ? \`var(--stg-ink,\${COLORS.ink})\` : \`var(--stg-mute,\${COLORS.faded})\``]),
];

// ── THE ASSIGNMENT PALETTES ─────────────────────────────────────────────────
//
// Three of the eleven build an answer button's colours as `let bg = ..., border
// = ..., fg = ...` and then reassign them per state. THE ARMS DO NOT ALL MOVE,
// and which ones do is the whole judgement:
//
//   * the DEFAULT arm is a plain white slot carrying near-black text. Both move,
//     TOGETHER. Moving the fill alone is how ten white answer slots shipped
//     carrying near-white ink -- unreadable in both directions at once, and
//     invisible to any scan of the page at rest, because that state does not
//     exist until somebody presses Start.
//   * the REVEAL arms are MEANING TINTS: #eef3e6 says you got this one right
//     and #f7e7e3 says you did not. They are pale fills carrying dark ink, so
//     they are self-consistent on any ground and they STAY. Converting them
//     would delete the meaning to fix a contrast problem they do not have.
//   * the SPENT arm (revealed, not yours, not the answer) is the quietest thing
//     on the board and has to stay the quietest thing on the board, so it takes
//     the tray and the muted ink rather than the surface and the full ink.
const PALETTES = [
  ["let bg = T.white, border = COLORS.ink, fg = COLORS.ink, mark = null;",
   "let bg = `var(--stg-surf,${T.white})`, border = `var(--stg-line2,${COLORS.ink})`, fg = `var(--stg-ink,${COLORS.ink})`, mark = null;"],
  ["let bg = T.white, border = COLORS.faded + '55', fg = COLORS.ink, mark = null;",
   "let bg = `var(--stg-surf,${T.white})`, border = `var(--stg-line,${COLORS.faded + '55'})`, fg = `var(--stg-ink,${COLORS.ink})`, mark = null;"],
  ["let border = COLORS.ink, bg = T.white, badge = null;",
   "let border = `var(--stg-line2,${COLORS.ink})`, bg = `var(--stg-surf,${T.white})`, badge = null;"],
  ["else { bg = COLORS.paper; border = COLORS.faded + '33'; fg = COLORS.faded; }",
   "else { bg = `var(--stg-surf2,${COLORS.paper})`; border = `var(--stg-line,${COLORS.faded + '33'})`; fg = `var(--stg-mute,${COLORS.faded})`; }"],
  ["else { bg = COLORS.paper; border = COLORS.faded + '22'; fg = COLORS.faded; }",
   "else { bg = `var(--stg-surf2,${COLORS.paper})`; border = `var(--stg-line,${COLORS.faded + '22'})`; fg = `var(--stg-mute,${COLORS.faded})`; }"],
  ["else { border = COLORS.faded + '55'; bg = COLORS.paper; }",
   "else { border = `var(--stg-line,${COLORS.faded + '55'})`; bg = `var(--stg-surf2,${COLORS.paper})`; }"],
];

// ── WHAT IS REPORTED RATHER THAN CONVERTED ──────────────────────────────────
const REPORT = [
  [new RegExp(`^\\s*(let|const) \\w+ = (T\\.white|${ALIAS}\\.(cream|paper|ink))\\b.*$`, 'gm'), 'assignment palette'],
  [new RegExp(`background(?:Color)?: ${ALIAS}\\.ink(?!, color:)`, 'g'), 'near-black fill with no ink beside it'],
  [/background(?:Color)?: ['"]#[0-9a-fA-F]{6}['"]/g, 'raw hex fill'],
  [/background(?:Color)?: [a-zA-Z][\w.]* \? [^,\n]+ : [^,\n]+/g, 'ternary fill'],
  // A LIGHT TOKEN LEFT AS TEXT is the half of the problem no background scan
  // can see, and on these children it is the commoner half: they are mounted
  // inside a converted client, so their ink lands on the stage's ground whether
  // or not anything about them says "stage".
  [new RegExp(`(?<![-\\w])color: (${ALIAS}\\.(ink|faded|soft|ember)|T\\.muted)\\b`, 'g'), 'unconverted ink'],
];

let totalPending = 0;
for (const path of paths) {
  let s = readFileSync(path, 'utf8');
  const before = s;
  let n = 0;
  const count = (re) => (s.match(re) || []).length;

  // THE TEXT RULES, for a child only. A converted CLIENT gets these as INK and
  // FADED, declared inside its component; a child has no component of its own
  // to declare them in and no flag to switch on, so it reads the token direct.
  //
  // ONLY THE NEAR-BLACK AND THE MUTED. `color: T.white` is NOT here on purpose:
  // half of these sit on a saturated meaning fill (white on forest, white on
  // rust) where white is correct on any ground, and the other half sit on a
  // near-black chip, which the PAIRS rule above moves together with its ink.
  // A blanket rule would fix the second half by breaking the first.
  const TEXT = [
    [new RegExp(`(?<![-\\w])color: (${ALIAS})\\.ink\\b`, 'g'), 'color: `var(--stg-ink,${$1.ink})`'],
    [new RegExp(`(?<![-\\w])color: (${ALIAS})\\.(faded|soft|muted)\\b`, 'g'), 'color: `var(--stg-mute,${$1.$2})`'],
    [new RegExp(`(?<![-\\w])color: T\\.muted\\b`, 'g'), 'color: `var(--stg-mute,${T.muted})`'],
    [new RegExp(`(?<![-\\w])color:\\$\\{(${ALIAS})\\.ink\\}`, 'g'), 'color:var(--stg-ink,${$1.ink})'],
    [new RegExp(`(?<![-\\w])color:\\$\\{(${ALIAS})\\.(faded|soft|muted)\\}`, 'g'), 'color:var(--stg-mute,${$1.$2})'],
  ];

  // ── THE SHAPES THAT ONLY THE CHILDREN HAVE ────────────────────────────────
  // Same rule as the clients' shared shapes: written once here rather than
  // eleven times in nine files, because a rule written more than once drifts.
  const CHILD_SHAPES = [
    // THE RECAP ROW, in three boards word for word. `got` means you found this
    // one, and the meaning lives in the EDGE rather than the fill -- which is
    // both the board-palette rule and the only version that survives the
    // register flip, since a pale mint fill under this row's now-light ink is
    // unreadable on the dark ground and a dark fill is unreadable on the light.
    ['recap row (found/missed)',
      "border: `1px solid ${got ? COLORS.forest : COLORS.faded + '55'}`, background: got ? '#e8efdd' : '#fbf7ef'",
      "border: `1px solid ${got ? `var(--stg-good,${COLORS.forest})` : `var(--stg-line,${COLORS.faded + '55'})`}`, background: got ? `var(--stg-surf2,#e8efdd)` : `var(--stg-surf,#fbf7ef)`"],
    // The same row in the two photo boards, which carry a third state: found,
    // revealed for you, or still missing. Three fills that were three shades of
    // cream become three lifts of the ground, and the verdict stays in the edge.
    ['recap row (photo)',
      "border: `1px solid ${got ? COLORS.forest : (revealed ? COLORS.rust : COLORS.faded + '55')}`, background: got ? T.white : (revealed ? '#f6ead9' : '#fbf7ef')",
      "border: `1px solid ${got ? `var(--stg-good,${COLORS.forest})` : (revealed ? `var(--stg-warn,${COLORS.rust})` : `var(--stg-line,${COLORS.faded + '55'})`)}`, background: got ? `var(--stg-surf2,${T.white})` : `var(--stg-surf,${revealed ? '#f6ead9' : '#fbf7ef'})`"],
    // The home strip's hot row: the same "this one is yours" tint as everywhere
    // else, and a hairline that was 8% black on a cream rule.
    ['snippet hot row',
      "borderTop: `1px solid ${C.faded}14`, background: hot ? T.accentSoft : 'transparent'",
      "borderTop: `1px solid var(--stg-line,${C.faded}14)`, background: hot ? `var(--stg-acc-tint,${T.accentSoft})` : 'transparent'"],
    // A TILE'S DEFAULT FACE. Its other arms are saturated meaning fills
    // carrying cream, which read on any ground and stay.
    ['tile default face', "let bg = '#fffdf8';\n          let fg = COLORS.ink;",
      "let bg = `var(--stg-surf,#fffdf8)`;\n          let fg = `var(--stg-ink,${COLORS.ink})`;"],
    ['match card', "background: '#fffdf8',", "background: `var(--stg-surf,#fffdf8)`,"],
    ['match note', "background: '#fffdf8', borderRadius: 10", "background: `var(--stg-surf,#fffdf8)`, borderRadius: 10"],
    ['solved chip', "background: '#e7f5ef', border: `1px solid ${COLORS.forest}`",
      "background: `var(--stg-surf2,#e7f5ef)`, border: `1px solid var(--stg-good,${COLORS.forest})`"],
    ['dead pair', 'background: isDead ? COLORS.paper : T.paper,',
      'background: isDead ? `var(--stg-surf2,${COLORS.paper})` : `var(--stg-surf,${T.paper})`,'],
    // THE ORDER BANK'S DOCK. A bar that MASKS what scrolls under it cannot take
    // a lifted colour, so the live state is the opaque raise and not --stg-surf.
    ['order dock', 'background: live ? COLORS.ink : COLORS.paper,\n    color: live ? COLORS.cream : COLORS.faded,',
      'background: live ? `var(--stg-raise,${COLORS.ink})` : `var(--stg-surf2,${COLORS.paper})`,\n    color: live ? `var(--stg-ink,${COLORS.cream})` : `var(--stg-mute,${COLORS.faded})`,'],
    // THE MAP'S SIZE CONTROL. Pressed is the accent, not an inverted ink: on the
    // light register --stg-raise is WHITE, so an "inverted" pressed state would
    // be LIGHTER than the unpressed one and the selection would read backwards.
    ['map size control',
      "border: `1px solid ${on ? CTRL_INK : 'rgba(20,22,28,0.18)'}`,\n                background: on ? CTRL_INK : T.white,\n                color: on ? T.white : T.muted,",
      "border: `1px solid ${on ? `var(--stg-acc,${CTRL_INK})` : `var(--stg-line,rgba(20,22,28,0.18))`}`,\n                background: on ? `var(--stg-acc,${CTRL_INK})` : `var(--stg-surf2,${T.white})`,\n                color: on ? `var(--stg-onramp,${T.white})` : `var(--stg-mute,${T.muted})`,"],
    // The leaderboard, in the child's own spelling of the row the clients share.
    ['leaderboard row (C alias)',
      'background: mine ? C.accSoft : T.white, borderRadius: 10, border: `1px solid ${mine ? C.accBorder : C.line}`',
      'background: mine ? `var(--stg-acc-tint,${C.accSoft})` : `var(--stg-surf,${T.white})`, borderRadius: 10, border: `1px solid ${mine ? `var(--stg-acc,${C.accBorder})` : `var(--stg-line,${C.line})`}`'],
    ['leaderboard filter chip',
      "background: on ? T.white : 'transparent', color: on ? C.ink : C.soft",
      "background: on ? `var(--stg-surf2,${T.white})` : 'transparent', color: on ? `var(--stg-ink,${C.ink})` : `var(--stg-mute,${C.soft})`"],
    ['recap row (C alias)',
      "border: `1px solid ${r.good ? C.forest : C.faded + '33'}`, marginBottom: 8, background: r.good ? T.white : C.paper",
      "border: `1px solid ${r.good ? `var(--stg-good,${C.forest})` : `var(--stg-line,${C.faded + '33'})`}`, marginBottom: 8, background: r.good ? `var(--stg-surf,${T.white})` : `var(--stg-surf2,${C.paper})`"],
  ];

  if (ACCENT_ONLY) {
    for (const [re, to] of ACCENT) { n += count(re); s = s.replace(re, to); }
    if (s !== before) writeFileSync(path, s);
    console.log(`+${n} accent edits  ${path}`);
    continue;
  }

  if (!AUDIT) {
    // FILLS, in a background position only. A `color:` of the same token is a
    // TEXT decision and the chrome converter already owns it; converting it
    // here as well would turn every dark chip on the board pale, which is the
    // trap that shadowing COLORS with a restyled copy walks straight into.
    for (const [tok, v] of FILLS) {
      const esc = tok.replace(/\./g, '\\.');
      // The JSX style object: `background: T.white` / `backgroundColor: ...`.
      const jsx = new RegExp(`background(Color)?: ${esc}\\b`, 'g');
      n += count(jsx);
      s = s.replace(jsx, (m0, c) => 'background' + (c || '') + ': `var(' + v + ',${' + tok + '})`');
      // The client's own CSS template: `background:${T.white}`.
      const css = new RegExp(`background(-color)?:\\$\\{${esc}\\}`, 'g');
      n += count(css);
      s = s.replace(css, (m0, c) => `background${c || ''}:var(${v},\${${tok}})`);
    }
    for (const [re, to] of [...PAIRS, ...BORDERS, ...HEXES, ...ACCENT, ...(CHILD ? TEXT : [])]) { n += count(re); s = s.replace(re, to); }
    // The shared shapes and the assignment palettes are plain strings, so they
    // are counted rather than assumed: a shape that stops matching means the
    // client it came from has been edited, and silently converting nothing is
    // how a board ships half done.
    for (const [name, from, to] of [...SHAPES, ...(CHILD ? CHILD_SHAPES : [])]) {
      const h = s.split(from).length - 1;
      if (h) { s = s.replaceAll(from, to); n += h; console.log(`  · ${name}: ${h}`); }
    }
    for (const [from, to] of PALETTES) {
      const h = s.split(from).length - 1;
      if (h) { s = s.replaceAll(from, to); n += h; console.log(`  · palette arm: ${h}`); }
    }

    // ── THE VALUE-SEGMENT SCANNER ─────────────────────────────────────────
    //
    // ⚠️ EVERY RULE ABOVE MATCHES A TOKEN AT THE START OF A VALUE, and a board
    // keeps its states in TERNARY ARMS, so every rule above walks past every
    // state a board actually has. The live sweep is what found this, on nine of
    // the eleven clients at once and never at rest:
    //
    //   color: phase === 'idle' ? COLORS.faded : COLORS.ink       the clock
    //   color: revealing && !isCorrect ? COLORS.faded : COLORS.ember   A B C D
    //   background: sel ? COLORS.cream : 'transparent'            a picked tile
    //
    // The clock is the worst of them, because it is the one figure on the board
    // that is on screen for the whole round: 1.7:1 sitting still and 1.23:1 the
    // moment it starts counting, on eight clients.
    //
    // So: find the PROPERTY, then walk to the next comma at PAREN DEPTH ZERO,
    // because rgba(20,22,28,0.5) has three commas of its own and a naive split
    // cuts a value in half. Convert every palette token anywhere inside that
    // segment, in either arm, however deeply the ternaries nest.
    //
    // The property decides the mapping, never the token: the SAME name means
    // two different things in the two positions, which is the whole reason
    // shadowing COLORS with a restyled copy is a trap. In an ink position
    // near-black moves and a pale fill's own dark ink stays; in a fill position
    // the pale surfaces move and a near-black chip is handled by PAIRS above.
    {
      const INK_MAP = [
        [/(?<![\w$.])(COLORS|C|T)\.ink\b/g, (a) => `\`var(--stg-ink,\${${a}.ink})\``],
        [/(?<![\w$.])(COLORS|C)\.(faded|soft|muted)\b/g, (a, b) => `\`var(--stg-mute,\${${a}.${b}})\``],
        [/(?<![\w$.])T\.muted\b/g, () => '`var(--stg-mute,${T.muted})`'],
        // The accent AS TEXT, which is a navy and is 1.6:1 on this ground.
        [/(?<![\w$.])(COLORS|C)\.ember\b/g, (a) => `\`var(--stg-acc-ink,\${${a}.ember})\``],
      ];
      const FILL_MAP = [
        [/(?<![\w$.])(COLORS|C)\.cream\b/g, (a) => `\`var(--stg-surf,\${${a}.cream})\``],
        [/(?<![\w$.])(COLORS|C)\.paper\b/g, (a) => `\`var(--stg-surf2,\${${a}.paper})\``],
        [/(?<![\w$.])T\.(white|surface)\b/g, (a) => `\`var(--stg-surf,\${T.${a}})\``],
        [/(?<![\w$.])T\.paper\b/g, () => '`var(--stg-surf2,${T.paper})`'],
      ];
      // THE LOOKBEHIND ON `color:` IS LOAD-BEARING: `borderColor:` and
      // `border-color:` both end in `color:`, and a border is a fill decision
      // that this pass has no business rewriting as ink.
      const PROPS = [
        [/(?<![-\w])color:\s*/g, INK_MAP],
        [/(?<![-\w])background(?:Color)?:\s*/g, FILL_MAP],
      ];
      let h = 0;
      for (const [propRe, map] of PROPS) {
        let guard = 0;
        for (;;) {
          if (++guard > 4000) break;   // a rewrite that never converges is a bug, not a long file
          propRe.lastIndex = 0;
          let hit = null;
          for (const m of s.matchAll(propRe)) {
            const start = m.index + m[0].length;
            let d = 0, end = s.length;
            for (let i = start; i < s.length; i++) {
              const c = s[i];
              if (c === '(' || c === '[' || c === '{') d++;
              else if (c === ')' || c === ']' || c === '}') { if (d === 0) { end = i; break; } d--; }
              else if (c === ',' && d === 0) { end = i; break; }
              else if (c === '\n') { end = i; break; }
            }
            const seg = s.slice(start, end);
            // A segment already carrying a stage token is converted; a segment
            // with no ternary in it was reachable by the anchored rules above
            // and is left to them, so this pass only ever touches the arms.
            if (seg.includes('var(--stg-')) continue;
            if (!seg.includes('?')) continue;
            let next = seg;
            for (const [re, to] of map) next = next.replace(re, (m0, ...g) => to(...g.slice(0, -2)));
            if (next === seg) continue;
            hit = { start, end, next };
            break;
          }
          if (!hit) break;
          s = s.slice(0, hit.start) + hit.next + s.slice(hit.end);
          h += 1;
        }
      }
      if (h) { n += h; console.log(`  · ternary arms converted: ${h}`); }
    }

    // ── A STICKY OR FIXED BAR IS NEVER A --stg-surf ───────────────────────
    //
    // --stg-surf is TRANSLUCENT on the dark register (white at 4.5%), which is
    // the whole point of it: a card is "the ground, lifted by a", so one
    // variable re-grounds every raised surface at once. A bar that has to MASK
    // the content scrolling under it is the one job that cannot be done with a
    // lifted colour -- the board slides through it and the bar reads as behind
    // the thing it is covering. These clients freeze their score-and-clock bar
    // that way, so the state where it matters is mid-round, which is exactly
    // the state a scan of the page at rest cannot see.
    //
    // The ground, not a panel: this bar's job is to be indistinguishable from
    // the page it is masking, and --stg-raise would draw a slab across the
    // board at every scroll position.
    {
      const lines = s.split('\n');
      let h = 0;
      for (let i = 0; i < lines.length; i++) {
        if (!/position: '(sticky|fixed)'/.test(lines[i])) continue;
        const next = lines[i].replace(/'var\(--stg-surf2?,([^)]*)\)'/g, "'var(--stg-ground,$1)'");
        if (next !== lines[i]) { lines[i] = next; h++; }
      }
      if (h) { s = lines.join('\n'); n += h; console.log(`  · sticky/fixed bars re-grounded: ${h}`); }
    }

    // ── THE FOOT HELPERS ──────────────────────────────────────────────────
    //
    // All eleven declare StatBox, ghostBtn, labelStyle and fieldStyle BELOW the
    // component's closing brace, and all four render on the stage: StatBox is
    // the whole of the stats tab, labelStyle and fieldStyle are the join form.
    //
    // ⚠️ THEY CANNOT TAKE INK AND FADED. That is not a preference: those consts
    // are declared INSIDE the component, so a `color: INK` down here is not a
    // temporal dead zone, it is `ReferenceError: FADED is not defined` -- which
    // esbuild parses happily and which 500'd all ~1,200 quiz pages once, WITH
    // THE FLAG OFF, because a module-level style object is evaluated whatever
    // the flag says. scripts/verify-quiz-stage.mjs fails the build on it now.
    //
    // A CUSTOM PROPERTY IS THE ONE THING THAT CAN GO HERE, and that is the
    // whole reason this pass is written in var() rather than in consts: the
    // browser resolves it against the element the style lands on, so it needs
    // no lexical scope at all. Same technique, opposite end of the file.
    {
      const lines = s.split('\n');
      const start = lines.findIndex((l) => /^export default function [A-Za-z_$][\w$]*\(\{ quizId/.test(l));
      let end = lines.length - 1;
      if (start >= 0) for (let i = start + 1; i < lines.length; i++) { if (/^\}\s*$/.test(lines[i])) { end = i; break; } }
      let h = 0;
      for (let i = end + 1; i < lines.length; i++) {
        let next = lines[i];
        for (const [re, to] of TEXT) next = next.replace(re, to);
        if (next !== lines[i]) { lines[i] = next; h++; }
      }
      if (h) { s = lines.join('\n'); n += h; console.log(`  · foot helpers (below line ${end + 1}): ${h}`); }
    }

    if (s !== before) writeFileSync(path, s);
  }

  // The audit runs either way, and AFTER the conversion, so what it prints is
  // what is still owed rather than what was owed before the run. A filter that
  // conceals defects is worse than one that over-reports, so a line already
  // carrying a var(--stg- is the only thing skipped.
  // ── DELIBERATELY DARK IN BOTH REGISTERS ─────────────────────────────────
  // Three surfaces are pictures rather than panels, and a picture brings its
  // own ground: the letterbox behind a photo, the aerial map's water, the
  // street map's land and sea. They stay exactly as they are on the light
  // register too, because a photo on white with a white surround has no edge,
  // and because an aerial map that turns pale is a different map. Named here so
  // the audit can read zero and MEAN zero -- a checker that always reports the
  // same four lines is a checker nobody reads.
  // A PHOTO BRINGS ITS OWN GROUND, so the letterbox behind one and the box that
  // holds a marker over it stay near-black on BOTH registers: a photo on white
  // inside a white surround has no edge, and a frame that follows the register
  // would be the one surface on the board that changes when the picture does
  // not. Matched on the FILE rather than the line, because the same fill does
  // the same job in five places there and enumerating five line shapes is a
  // list that goes stale the first time one of them is reformatted.
  const PHOTO_FRAMES = /Photo(Board|MatchBoard)\.jsx$/.test(path);
  const BY_DESIGN = [
    PHOTO_FRAMES ? /background: COLORS\.ink\b/ : null,   // the photo letterbox
    /background: '#0b1a2b'/,                             // the aerial map's water
    /background: MAP\.sea/,                              // the place boards' own sea
    /const LAND = '#eef1f4', LINE = '#94a0b0', SEA = '#bcd4ec'/,  // the street map
  ].filter(Boolean);

  const pending = [];
  for (const [re, what] of REPORT) {
    for (const m of s.matchAll(re)) {
      const line = s.slice(0, m.index).split('\n').length;
      const text = s.split('\n')[line - 1];
      if (text.includes('var(--stg-')) continue;
      if (BY_DESIGN.some((d) => d.test(text))) continue;
      pending.push(`    ${path}:${line}  ${what}: ${text.trim().slice(0, 96)}`);
    }
  }
  totalPending += pending.length;
  console.log(`${AUDIT ? 'audit' : `+${n} edits`}  ${path}  ${pending.length} owed by hand`);
  for (const p of pending) console.log(p);
}
console.log(`\n${totalPending} site${totalPending === 1 ? '' : 's'} still owed a human`);
