// Hint gate — one free hint, first play only.
//
// A player gets the single free hint on their very first encounter with a given
// daily game and never again: not on a later day, not on a replay of that same
// first board. Eligibility is read off the game's own local stats record (the
// per-puzzle `rec` map each daily client already keeps, which the server-history
// merge back-fills for signed-in players across devices), plus a persisted
// "spent" flag written the moment the hint is actually used, so reloading or
// resetting the first board cannot hand out a second one.
//
// Signed in or anonymous makes no difference. Play history is the only test.

export function hintSpentKey(game) {
  return `sot_hint_spent_${game}`;
}

export function hintSpent(game) {
  try {
    return localStorage.getItem(hintSpentKey(game)) === '1';
  } catch (e) {
    return false;
  }
}

export function spendHint(game) {
  try {
    localStorage.setItem(hintSpentKey(game), '1');
  } catch (e) {}
}

// True only while the player has no recorded play of this game at all.
export function firstEverPlay(stats) {
  const rec = stats && stats.rec ? stats.rec : null;
  if (!rec) return false;
  return Object.keys(rec).length === 0;
}

export function hintAllowed(game, stats) {
  return firstEverPlay(stats) && !hintSpent(game);
}
