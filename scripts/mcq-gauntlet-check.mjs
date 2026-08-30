// Shared structural gate for the 25-question gauntlet banks (the Atlas / Sport
// / Biz shape). scripts/verify-script.mjs and scripts/verify-quotes.mjs are thin
// wrappers around it.
//
// ONE IMPLEMENTATION, NOT FOUR MIRRORS. verify-atlas, verify-sport, verify-biz
// and verify-streak are near-copies of each other, which is exactly the drift
// this file exists to stop: a check tightened in one of them is a check the
// other three quietly do not run. New games in this shape import this instead.
// (The four existing verifiers are deliberately left alone; rewriting them
// re-derives gates over banks that already shipped.)
//
// It checks only what a machine can check. The TRUTH of a fact is still a human
// job, and so is whether a tier-5 question is really hard. What this catches is
// the stuff that silently ships wrong: a question that hands over its own
// answer, a repeated question, a day whose correct answers pile into one
// column, a tier or lane ramp out of order, the same answer twice in one run,
// and (as a warning) the same FACT asked twice on different days.
//
// Question ids are 'd<day>q<slot>', the day zero padded to two digits and
// widening to three past day 99, the slot always two. Each day's qids must
// carry that day's own number as their prefix.

const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'on', 'at', 'to', 'for', 'is', 'it', 'its', 'his', 'her', 'their', 'was', 'were', 'by', 'from', 'about', 'as', 'or', 'no', 'not', 'one', 'two', 'three', 'four', 'five', 'six', 'ten']);

// Words too generic to make two questions "the same fact". Shared across banks;
// a bank adds its own domain filler through the extraTemplate option.
const TEMPLATE_BASE = ('which what who whom whose where when how many name named known called nickname year years decade century first last later early famous popular common often usually still large largest biggest small these that this from with their they there only into over under after before more most best worst other another said says say line quote spoke spoken wrote written author work title character film movie series show book novel play speech').split(' ');

export function checkBank({ QUESTIONS, QUESTION_MAP, PUZZLES, key, LANES, inherent = [], extraTemplate = [] }) {
  const errs = [];
  const warns = [];
  const fail = (m) => errs.push(m);
  const warn = (m) => warns.push(m);

  // Ids where the answer is unavoidably in the wording. Keep this list empty if
  // you can: every giveaway the check finds is usually a real bug and wants a
  // rewrite. Add an id only when the thing asked about is literally named after
  // the answer, never to silence a leak.
  const INHERENT = new Set(inherent);
  const PER_TIER = LANES.length;
  const TOTAL_Q = PER_TIER * 5;
  const RAMP = [];
  for (let t = 1; t <= 5; t++) for (let s = 0; s < PER_TIER; s++) RAMP.push(t);

  // ---- bank-level ---------------------------------------------------------
  const ids = new Set();
  for (const q of QUESTIONS) {
    if (ids.has(q.id)) fail(`duplicate question id ${q.id}`);
    ids.add(q.id);
    if (!/^d\d{2,3}q\d\d$/.test(q.id)) fail(`${q.id}: id is not d<NN>q<NN> or d<NNN>q<NN>`);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) fail(`${q.id}: needs exactly 4 choices`);
    else if (new Set(q.choices.map(norm)).size !== 4) fail(`${q.id}: choices are not all distinct`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) fail(`${q.id}: correct index out of range`);
    if (![1, 2, 3, 4, 5].includes(q.tier)) fail(`${q.id}: tier must be 1..5`);
    if (!LANES.includes(q.cat)) fail(`${q.id}: cat "${q.cat}" is not one of the five lanes`);
    if (!q.q || !q.q.trim().endsWith('?')) warn(`${q.id}: question does not end in a question mark`);
    // The site's writing rules ban the em dash in anything a reader sees, and
    // curly punctuation is folded at generation time, so either one here means
    // the generated file was hand-edited.
    for (const s of [q.q, ...q.choices]) {
      if (String(s).includes('—')) fail(`${q.id}: em dash in copy`);
      if (/[‘’“”]/.test(String(s))) fail(`${q.id}: curly quote in copy, rebuild from source`);
    }

    // The giveaway check: a question may never contain its own answer, whole or
    // in all of its distinctive words.
    const ans = q.choices[q.correct] || '';
    const qn = ` ${norm(q.q)} `;
    const an = norm(ans);
    if (an && qn.includes(` ${an} `)) fail(`${q.id}: question contains its own answer ("${ans}")`);
    const words = an.split(' ').filter((w) => w.length > 2 && !STOP.has(w));
    if (words.length && !INHERENT.has(q.id) && words.every((w) => qn.includes(` ${w} `))) fail(`${q.id}: question contains every distinctive word of its answer ("${ans}")`);
  }

  const seenText = new Map();
  for (const q of QUESTIONS) {
    const k = norm(q.q);
    if (seenText.has(k)) fail(`${q.id}: repeats the question text of ${seenText.get(k)}`);
    seenText.set(k, q.id);
  }

  // The same fact asked twice, in two lanes, on two days. Two questions that
  // share an ANSWER and a distinctive word are the shape of it. A warning
  // rather than a failure: one director or one president is the fair answer to
  // many genuinely different questions, so a human decides. Read all of it.
  const TEMPLATE = new Set([...TEMPLATE_BASE, ...extraTemplate]);
  const distinct = (s) => new Set(norm(s).split(' ').filter((w) => w.length > 3 && !TEMPLATE.has(w)));
  const byAnswer = new Map();
  for (const q of QUESTIONS) {
    const k = norm(q.choices[q.correct]).replace(/^the /, '');
    if (!byAnswer.has(k)) byAnswer.set(k, []);
    byAnswer.get(k).push(q);
  }
  for (const [, group] of byAnswer) {
    for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
      const b = distinct(group[j].q);
      const shared = [...distinct(group[i].q)].filter((w) => b.has(w));
      if (shared.length) warn(`${group[i].id} and ${group[j].id} share an answer and the word(s) ${shared.join(', ')}, check they are not the same fact twice`);
    }
  }

  // ---- day-level ----------------------------------------------------------
  const usedQids = new Map();
  const dates = [];

  for (const p of PUZZLES) {
    const tag = `day ${p.num}`;
    if (dates.includes(p.live)) fail(`${tag}: duplicate live date ${p.live}`);
    dates.push(p.live);
    if (p.quizId !== `${key}-${Number(p.live.slice(5, 7))}-${Number(p.live.slice(8, 10))}-${p.live.slice(2, 4)}`) fail(`${tag}: quizId ${p.quizId} does not match live date ${p.live}`);
    if (p.sunday) fail(`${tag}: this game runs no Sunday Edition, so no day may be flagged sunday`);
    if (!Array.isArray(p.qids) || p.qids.length !== TOTAL_Q) { fail(`${tag}: needs exactly ${TOTAL_Q} qids`); continue; }

    const qs = [];
    const wantPrefix = `d${String(p.num).padStart(2, '0')}q`;
    for (const id of p.qids) {
      if (!id.startsWith(wantPrefix)) fail(`${tag}: qid ${id} does not carry this day's prefix ${wantPrefix}`);
      if (usedQids.has(id)) fail(`${tag}: qid ${id} already used on day ${usedQids.get(id)}`);
      usedQids.set(id, p.num);
      const q = QUESTION_MAP[id];
      if (!q) { fail(`${tag}: qid ${id} is not in the bank`); continue; }
      qs.push(q);
    }
    if (qs.length !== TOTAL_Q) continue;

    qs.forEach((q, i) => {
      if (q.tier !== RAMP[i]) fail(`${tag}: slot ${i + 1} is tier ${q.tier}, the ramp wants ${RAMP[i]}`);
      const want = LANES[i % PER_TIER];
      if (q.cat !== want) fail(`${tag}: slot ${i + 1} is ${q.cat}, the lane cycle wants ${want}`);
    });

    // Correct-answer column spread: 25 questions over 4 columns, so every column
    // carries at least 5 and no column repeats three times running.
    const pos = qs.map((q) => q.correct);
    for (let k = 0; k < 4; k++) {
      const n = pos.filter((x) => x === k).length;
      if (n < 5) fail(`${tag}: column ${String.fromCharCode(65 + k)} is correct only ${n} times`);
    }
    for (let i = 2; i < pos.length; i++) if (pos[i] === pos[i - 1] && pos[i] === pos[i - 2]) fail(`${tag}: three correct answers in a row in column ${String.fromCharCode(65 + pos[i])}`);

    // The same answer twice in one day makes the second one guessable.
    const answers = new Map();
    qs.forEach((q) => {
      const a = norm(q.choices[q.correct]);
      if (answers.has(a)) fail(`${tag}: "${q.choices[q.correct]}" is the answer to both ${answers.get(a)} and ${q.id}`);
      answers.set(a, q.id);
    });
  }

  // The bank drops one day at a time, so the dates must be contiguous.
  for (let i = 1; i < dates.length; i++) {
    const prev = Date.parse(`${dates[i - 1]}T00:00:00Z`);
    const cur = Date.parse(`${dates[i]}T00:00:00Z`);
    if (cur - prev !== 86400000) fail(`day ${PUZZLES[i].num}: ${dates[i]} does not follow ${dates[i - 1]} by one day`);
  }

  const orphans = QUESTIONS.filter((q) => !usedQids.has(q.id));
  if (orphans.length) warn(`${orphans.length} questions in the bank are used by no day (${orphans.slice(0, 5).map((q) => q.id).join(', ')}...)`);

  return { errs, warns, dates };
}

export function report({ errs, warns, dates }, QUESTIONS, PUZZLES) {
  for (const w of warns) console.warn(`warn  ${w}`);
  if (errs.length) {
    for (const e of errs) console.error(`FAIL  ${e}`);
    console.error(`\n${errs.length} problem${errs.length === 1 ? '' : 's'} in ${QUESTIONS.length} questions across ${PUZZLES.length} days.`);
    process.exit(1);
  }
  console.log(`ok: ${QUESTIONS.length} questions, ${PUZZLES.length} days, ${dates[0]} to ${dates[dates.length - 1]}, ${warns.length} warning${warns.length === 1 ? '' : 's'}.`);
}
