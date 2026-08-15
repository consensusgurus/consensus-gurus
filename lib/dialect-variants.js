// British/American spelling equivalence, for grading a typed answer.
//
// Owner ruling 2026-08-15, after an English player wrote in: "Playing the games
// in England, it's unfortunate when you use American terms." A player who
// supplies the RIGHT word must never be marked down for spelling it in their
// own dialect, so `sameWord('colour', 'color')` is true and either scores.
//
// This is the grading half of the rule already written into the header of
// app/stet/puzzles.js: no puzzle error may turn on the dialect axis, and BOTH
// forms are accepted. Puzzle data does not need per-item `alts` for spelling
// variants any more; `alts` is for genuinely different words.
//
// WHAT IS DELIBERATELY NOT HERE, and must stay out: pairs whose two spellings
// are different WORDS with different senses, where accepting both would credit
// a wrong answer.
//   · kerb / curb   — a kerb is the edge of a pavement; to curb is to restrain,
//                     and Britain spells the verb "curb" too. Not a variant.
//   · cheque / check, tyre / tire, storey / story, draught / draft — same
//                     problem: one member carries a sense the other does not.
//   · gotten / got  — an aspect difference, not a spelling one.
// Adding a pair here means asserting the two spellings mean the SAME thing in
// every sense. When in doubt, leave it out and give the item an explicit `alts`.

// Two-way pairs. Order within a pair is irrelevant.
const PAIRS = [
  // -our / -or
  ['colour', 'color'], ['colours', 'colors'], ['coloured', 'colored'],
  ['flavour', 'flavor'], ['flavours', 'flavors'], ['flavoured', 'flavored'],
  ['honour', 'honor'], ['honours', 'honors'], ['honoured', 'honored'],
  ['labour', 'labor'], ['laboured', 'labored'],
  ['neighbour', 'neighbor'], ['neighbours', 'neighbors'],
  ['behaviour', 'behavior'], ['behaviours', 'behaviors'],
  ['harbour', 'harbor'], ['harbours', 'harbors'], ['harboured', 'harbored'],
  ['rumour', 'rumor'], ['rumours', 'rumors'],
  ['savour', 'savor'], ['savoury', 'savory'],
  ['vigour', 'vigor'], ['valour', 'valor'], ['odour', 'odor'], ['ardour', 'ardor'],
  ['clamour', 'clamor'], ['candour', 'candor'], ['demeanour', 'demeanor'],
  ['endeavour', 'endeavor'], ['fervour', 'fervor'], ['humour', 'humor'],
  ['parlour', 'parlor'], ['rigour', 'rigor'], ['splendour', 'splendor'],
  ['tumour', 'tumor'], ['armour', 'armor'], ['moulding', 'molding'],
  ['mould', 'mold'], ['moult', 'molt'], ['smoulder', 'smolder'],
  // -re / -er
  ['centre', 'center'], ['centres', 'centers'], ['centred', 'centered'],
  ['theatre', 'theater'], ['theatres', 'theaters'],
  ['metre', 'meter'], ['metres', 'meters'],
  ['litre', 'liter'], ['litres', 'liters'],
  ['fibre', 'fiber'], ['fibres', 'fibers'],
  ['sombre', 'somber'], ['calibre', 'caliber'], ['spectre', 'specter'],
  ['lustre', 'luster'], ['sceptre', 'scepter'], ['manoeuvre', 'maneuver'],
  ['reconnoitre', 'reconnoiter'], ['sepulchre', 'sepulcher'],
  // -ce / -se
  ['defence', 'defense'], ['offence', 'offense'], ['pretence', 'pretense'],
  ['licence', 'license'], ['practise', 'practice'], ['practised', 'practiced'],
  ['practising', 'practicing'],
  // doubled consonant in inflections
  ['travelled', 'traveled'], ['travelling', 'traveling'], ['traveller', 'traveler'],
  ['cancelled', 'canceled'], ['cancelling', 'canceling'],
  ['modelled', 'modeled'], ['modelling', 'modeling'],
  ['labelled', 'labeled'], ['labelling', 'labeling'],
  ['fuelled', 'fueled'], ['fuelling', 'fueling'],
  ['levelled', 'leveled'], ['marvelled', 'marveled'], ['marvellous', 'marvelous'],
  ['counsellor', 'counselor'], ['jeweller', 'jeweler'], ['jewellery', 'jewelry'],
  ['signalled', 'signaled'], ['totalled', 'totaled'], ['worshipped', 'worshiped'],
  ['skilful', 'skillful'], ['fulfil', 'fulfill'], ['instalment', 'installment'],
  ['enrol', 'enroll'], ['appal', 'appall'], ['distil', 'distill'],
  // ae / oe
  ['encyclopaedia', 'encyclopedia'], ['foetus', 'fetus'], ['oestrogen', 'estrogen'],
  ['anaemia', 'anemia'], ['anaesthetic', 'anesthetic'], ['archaeology', 'archeology'],
  ['diarrhoea', 'diarrhea'], ['mediaeval', 'medieval'], ['palaeolithic', 'paleolithic'],
  // one-offs
  ['grey', 'gray'], ['greyer', 'grayer'], ['greyish', 'grayish'],
  ['plough', 'plow'], ['ploughed', 'plowed'],
  ['aluminium', 'aluminum'], ['aeroplane', 'airplane'], ['axe', 'ax'],
  ['gaol', 'jail'], ['moustache', 'mustache'], ['pyjamas', 'pajamas'],
  ['judgement', 'judgment'], ['ageing', 'aging'], ['programme', 'program'],
  ['catalogue', 'catalog'], ['dialogue', 'dialog'], ['analogue', 'analog'],
  ['omelette', 'omelet'], ['sceptic', 'skeptic'], ['sceptical', 'skeptical'],
  ['sulphur', 'sulfur'], ['speciality', 'specialty'], ['cosy', 'cozy'],
  ['kerbstone', 'curbstone'], ['woollen', 'woolen'], ['gramme', 'gram'],
  ['artefact', 'artifact'], ['annexe', 'annex'], ['carburettor', 'carburetor'],
  ['draughtsman', 'draftsman'], ['furore', 'furor'], ['mollusc', 'mollusk'],
  ['pernickety', 'persnickety'], ['cypher', 'cipher'],
  // preference forms both dialects accept
  ['toward', 'towards'], ['among', 'amongst'], ['while', 'whilst'],
  ['learnt', 'learned'], ['spelt', 'spelled'], ['burnt', 'burned'],
  ['dreamt', 'dreamed'], ['leapt', 'leaped'], ['spoilt', 'spoiled'],
  ['knelt', 'kneeled'], ['smelt', 'smelled'], ['dived', 'dove'],
];

// -ise/-ize (and -isation/-ization, -yse/-yze) is a productive rule rather than a
// list, but a handful of verbs are -ise in EVERY dialect and have no -ize form.
// Generating one would accept a real misspelling, so they are excluded.
const ISE_ONLY = new Set([
  'advertise', 'advise', 'arise', 'chastise', 'circumcise', 'comprise',
  'compromise', 'demise', 'despise', 'devise', 'disguise', 'enterprise',
  'excise', 'exercise', 'franchise', 'improvise', 'incise', 'merchandise',
  'premise', 'prise', 'promise', 'revise', 'rise', 'supervise', 'surmise',
  'surprise', 'televise', 'wise',
]);

const KEY = new Map();
for (const pair of PAIRS) {
  if (!Array.isArray(pair) || pair.length !== 2) continue;
  const k = pair.join('|');
  for (const w of pair) KEY.set(w, k);
}

const norm = (w) => String(w || '').trim().toLowerCase().replace(/[’]/g, "'");

// Collapse the -ise/-ize axis onto a single key. Applied only when the stem is
// long enough to be a real verb and the word is not one of the -ise-only set.
function izeKey(w) {
  const m = w.match(/^(.{4,}?)(is|iz)(e|es|ed|ing|ation|ations|ational)$/);
  if (!m) {
    const y = w.match(/^(.{3,}?)(ys|yz)(e|es|ed|ing)$/);
    return y ? `${y[1]}Y${y[3]}` : null;
  }
  if (ISE_ONLY.has(`${m[1]}ise`)) return null;
  return `${m[1]}Z${m[3]}`;
}

/** The dialect-neutral key for a word: two spellings of one word share a key. */
export function dialectKey(word) {
  const w = norm(word);
  if (!w) return '';
  return KEY.get(w) || izeKey(w) || w;
}

/** True when two answers are the same word, spelled in either dialect. */
export function sameWord(a, b) {
  const x = norm(a), y = norm(b);
  if (x === y) return true;
  if (!x || !y) return false;
  return dialectKey(x) === dialectKey(y);
}

/** True when `answer` matches any of `accepted`, in either dialect. */
export function acceptsAnswer(accepted, answer) {
  return (accepted || []).some((a) => sameWord(a, answer));
}
