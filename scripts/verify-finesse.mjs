// Independent verification of the Finesse bank.
//
//   node scripts/verify-finesse.mjs
//
// WHY A SECOND SOLVER. lib/finesse-core.js is fast because of two tricks that
// are easy to get subtly wrong: it collapses touching cards in one hand into a
// single move, and it orders moves so alpha-beta cuts early. Neither may change
// a value. So this file re-solves every banked deal with a solver that has
// NEITHER — plain minimax over every legal card, its own transposition table,
// its own trick-winner — and on the small decks it also runs a THIRD pass with
// no memo and no pruning at all. A bank is only proved when the answers agree.
//
// It also checks the things a generator can silently get wrong: that the deck
// is complete and evenly dealt, that the day's deck size and trumps match the
// weekday ramp, that the dates and numbers run without a gap, and that the
// recorded `sep` and `uniq` are what the deal actually measures.
import { PUZZLES } from '../app/finesse/puzzles.js';
import {
  SUITS, RANK_NAMES, makeDeck, bits, suitOf, rankOf, isNS, parseHand, cardName, analyse, makeSolver,
} from '../lib/finesse-core.js';

let fails = 0, checks = 0;
const bad = (msg) => { fails++; console.log('✗ ' + msg); };
const ok = () => { checks++; };

// ---- the independent solver: no equivalence reduction, no move ordering ----
function slowSolve(R, trump, hands, leader, useMemo) {
  const memo = new Map();
  function win(cards) {
    let b = cards[0];
    for (let i = 1; i < 4; i++) {
      const c = cards[i], cs = suitOf(c.card, R), bs = suitOf(b.card, R);
      if (cs === bs) { if (rankOf(c.card, R) > rankOf(b.card, R)) b = c; }
      else if (trump >= 0 && cs === trump && bs !== trump) b = c;
    }
    return b.seat;
  }
  function bd(m, ld) {
    if (!(m[0] | m[1] | m[2] | m[3])) return 0;
    if (useMemo) {
      const k = m.join(',') + '|' + ld;
      if (memo.has(k)) return memo.get(k);
      const v = nd(m, ld, [], -1, -99, 99);
      memo.set(k, v);
      return v;
    }
    return nd(m, ld, [], -1, -99, 99);
  }
  function nd(m, seat, played, led, alpha, beta) {
    if (played.length === 4) { const w = win(played); return (isNS(w) ? 1 : 0) + bd(m, w); }
    let cand = bits(m[seat]);
    if (led >= 0) { const f = cand.filter((c) => suitOf(c, R) === led); if (f.length) cand = f; }
    const mx = isNS(seat);
    let best = mx ? -99 : 99;
    for (const c of cand) {
      const nm = m.slice(); nm[seat] &= ~(1 << c);
      const v = nd(nm, (seat + 1) % 4, played.concat([{ seat, card: c }]), played.length ? led : suitOf(c, R), alpha, beta);
      if (mx) { if (v > best) best = v; if (useMemo && best > alpha) alpha = best; }
      else { if (v < best) best = v; if (useMemo && best < beta) beta = best; }
      if (useMemo && alpha >= beta) break;
    }
    return best;
  }
  return bd(hands, leader);
}
function slowLeadValues(R, trump, hands) {
  const out = [];
  for (const c of bits(hands[2])) {
    const nm = hands.slice(); nm[2] &= ~(1 << c);
    // one card is on the table, so this is a mid-trick node: play it out.
    out.push({ card: c, v: slowTrick(R, trump, nm, [{ seat: 2, card: c }], suitOf(c, R)) });
  }
  return out;
}
function slowTrick(R, trump, m, played, led) {
  const memo = new Map();
  function win(cards) {
    let b = cards[0];
    for (let i = 1; i < 4; i++) {
      const c = cards[i], cs = suitOf(c.card, R), bs = suitOf(b.card, R);
      if (cs === bs) { if (rankOf(c.card, R) > rankOf(b.card, R)) b = c; }
      else if (trump >= 0 && cs === trump && bs !== trump) b = c;
    }
    return b.seat;
  }
  function bd(mm, ld) {
    if (!(mm[0] | mm[1] | mm[2] | mm[3])) return 0;
    const k = mm.join(',') + '|' + ld;
    if (memo.has(k)) return memo.get(k);
    const v = nd(mm, ld, [], -1, -99, 99);
    memo.set(k, v);
    return v;
  }
  function nd(mm, seat, pl, ld, alpha, beta) {
    if (pl.length === 4) { const w = win(pl); return (isNS(w) ? 1 : 0) + bd(mm, w); }
    let cand = bits(mm[seat]);
    if (ld >= 0) { const f = cand.filter((c) => suitOf(c, R) === ld); if (f.length) cand = f; }
    const mx = isNS(seat);
    let best = mx ? -99 : 99;
    for (const c of cand) {
      const nm = mm.slice(); nm[seat] &= ~(1 << c);
      const v = nd(nm, (seat + 1) % 4, pl.concat([{ seat, card: c }]), pl.length ? ld : suitOf(c, R), alpha, beta);
      if (mx) { if (v > best) best = v; if (best > alpha) alpha = best; }
      else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }
  return nd(m, (played[played.length - 1].seat + 1) % 4, played, led, -99, 99);
}

// weekday -> expected deck size and whether trumps are named. 0 is Sunday.
const RAMP = { 1: [4, false], 2: [5, false], 3: [5, true], 4: [6, true], 5: [6, true], 6: [7, true], 0: [8, true] };

console.log(`Finesse: ${PUZZLES.length} deals, ${PUZZLES[0].live} to ${PUZZLES[PUZZLES.length - 1].live}`);

let prevDate = null;
for (const p of PUZZLES) {
  const tag = `#${p.num} ${p.live}`;
  const R = p.ranks;
  const trump = p.trump ? SUITS.indexOf(p.trump) : -1;
  if (p.trump && trump < 0) { bad(`${tag}: trump ${p.trump} is not a suit`); continue; }

  // sequence
  if (p.num !== PUZZLES.indexOf(p) + 1) bad(`${tag}: num out of sequence`); else ok();
  if (prevDate) {
    const gap = (new Date(p.live + 'T12:00:00Z') - new Date(prevDate + 'T12:00:00Z')) / 86400000;
    if (gap !== 1) bad(`${tag}: ${gap} day gap after ${prevDate}`); else ok();
  }
  prevDate = p.live;

  // the deck is complete and evenly dealt
  const hands = [p.north, p.east, p.south, p.west].map((h) => parseHand(h, R));
  const counts = hands.map((m) => bits(m).length);
  if (counts.some((c) => c !== R)) bad(`${tag}: hands are ${counts.join('/')}, want ${R} each`); else ok();
  // Checked by NAME, not by mask. A 32-card Sunday fills bit 31, and every JS
  // bitwise operator is 32-bit SIGNED, so a full deck comes out as -1 and any
  // comparison against a positive literal fails. The solver is fine with that
  // (it only ever tests and clears bits) but a completeness check must not go
  // anywhere near it.
  const named = [p.north, p.east, p.south, p.west].join(' ').split(/ +/);
  const want = makeDeck(R).map((c) => cardName(c, R));
  const missing = want.filter((n) => !named.includes(n));
  if (missing.length) bad(`${tag}: not dealt out, missing ${missing.join(' ')}`); else ok();
  if (new Set(named).size !== named.length) bad(`${tag}: a card appears twice`); else ok();
  if (named.length !== 4 * R) bad(`${tag}: ${named.length} cards named, want ${4 * R}`); else ok();

  // the weekday ramp
  const dow = new Date(p.live + 'T12:00:00Z').getUTCDay();
  const [wantR, wantTrumps] = RAMP[dow];
  if (R !== wantR) bad(`${tag}: deck is ${R}, the ramp says ${wantR}`); else ok();
  if (!!p.trump !== wantTrumps) bad(`${tag}: trumps ${p.trump || 'none'} against the ramp`); else ok();
  if (!!p.sunday !== (dow === 0)) bad(`${tag}: sunday flag is ${p.sunday}`); else ok();

  // THE CONTRACT, re-solved by the independent solver
  const slow = slowSolve(R, trump, hands, 2, true);
  if (slow !== p.target) { bad(`${tag}: independent solver says ${slow}, bank says ${p.target}`); continue; }
  ok();

  // and on the small decks, again with nothing switched on at all
  if (R <= 5) {
    const raw = slowSolve(R, trump, hands, 2, false);
    if (raw !== p.target) bad(`${tag}: unpruned minimax says ${raw}`); else ok();
  }

  // EXACTLY ONE OPENING CHOICE MAKES IT — counted in equivalence classes, not
  // in cards. Leading the eight or the nine from a bare 8-9 is one decision and
  // not two, and the promise the bank makes is about decisions. The classes are
  // rebuilt here from scratch (same suit, same hand, nothing live in between)
  // rather than borrowed from the solver, and every card in a class is then
  // required to score the same, which is what proves the reduction the fast
  // solver leans on is sound on this deal.
  const leads = slowLeadValues(R, trump, hands);
  const live = hands.reduce((a, b) => a | b, 0);
  const classOf = (card) => {
    let top = card;
    for (let r = rankOf(card, R) + 1; r < R; r++) {
      const up = suitOf(card, R) * R + r;
      if (!(live & (1 << up))) continue;
      if (hands[2] & (1 << up)) { top = up; continue; }
      break;
    }
    return top;
  };
  const classes = new Map();
  for (const x of leads) {
    const k = classOf(x.card);
    if (!classes.has(k)) classes.set(k, []);
    classes.get(k).push(x);
  }
  for (const group of classes.values()) {
    if (new Set(group.map((x) => x.v)).size !== 1) {
      bad(`${tag}: ${group.map((x) => cardName(x.card, R) + '=' + x.v).join(' ')} are equivalent but score differently`);
    } else ok();
  }
  const winners = [...classes.values()].filter((group) => group[0].v >= p.target);
  if (winners.length !== 1) {
    bad(`${tag}: ${winners.length} opening choices make ${p.target} (${winners.map((gp) => cardName(gp[0].card, R)).join(' ')})`);
  } else ok();
  if (classes.size < (R <= 4 ? 3 : 4)) bad(`${tag}: only ${classes.size} choices at trick one`); else ok();
  if (bits(hands[2]).length !== R) bad(`${tag}: South holds the wrong number of cards`); else ok();

  // the measured fields are what the deal measures
  const a = analyse(R, trump, hands, p.target);
  if (a.ns !== p.target) bad(`${tag}: the line only reaches ${a.ns}`); else ok();
  if (a.sep !== p.sep) bad(`${tag}: sep is ${a.sep}, bank says ${p.sep}`); else ok();
  if (a.uniq !== p.uniq) bad(`${tag}: uniq is ${a.uniq}, bank says ${p.uniq}`); else ok();
  if (a.uniq < 2) bad(`${tag}: only ${a.uniq} decision points have one answer`); else ok();
}

console.log(`${checks} checks passed, ${fails} failed`);
if (fails) process.exit(1);
