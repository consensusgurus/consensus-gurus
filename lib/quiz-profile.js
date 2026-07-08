// Shared builder for a single player's full XP profile + activity stats.
// Used by /api/quiz/me (the current player, resolved by identity) and
// /api/quiz/player (any player, resolved by key) so both return the SAME shape.
import { rankPlayers, xpTier, displayHandle, xpForLevel } from '@/lib/quiz-xp';

export function buildProfile(players, myKey, { signed = false, username = null } = {}) {
  const ranked = rankPlayers(players, 'all');
  const total = ranked.length;

  const allPlayers = [...players.values()];
  const metricVal = {
    xp: (q) => q.xp,
    correct: (q) => q.correct,
    completed: (q) => q.completed,
    accuracy: (q) => q.accuracy,
    daysPlayed: (q) => q.daysPlayed || 0,
    played: (q) => q.played || 0,
  };
  function rankAndBase(getter, myVal) {
    const vals = allPlayers.map(getter);
    const n = vals.length || 1;
    const avg = vals.reduce((a, b) => a + (Number(b) || 0), 0) / n;
    let greater = 0;
    for (const v of vals) if ((Number(v) || 0) > (Number(myVal) || 0)) greater += 1;
    return { rank: greater + 1, base: avg };
  }

  if (!myKey || !players.has(myKey)) {
    return { found: false, signed, username, totalPlayers: total, xp: 0, level: 1 };
  }

  const p = players.get(myKey);
  const idx = ranked.findIndex((r) => r.key === myKey);
  const rank = idx >= 0 ? idx + 1 : null;
  const tier = xpTier(p.level);
  const name = (!p.isAnon && (username || p.username)) ? (username || p.username) : displayHandle(p);

  const byCategoryRanked = {};
  // Per-category standing on EVERY metric, counted among the players active in
  // that category (matches > 0). `rank` is the XP rank; the rest let each
  // column show a #rank chip.
  const CAT_METRICS = ['xp', 'correct', 'completed', 'accuracy', 'daysPlayed', 'played'];
  for (const cat of Object.keys(p.byCategory)) {
    const mine = p.byCategory[cat];
    const greater = { xp: 0, correct: 0, completed: 0, accuracy: 0, daysPlayed: 0, played: 0 };
    let catTotal = 0;
    for (const op of allPlayers) {
      const oc = op.byCategory[cat];
      if (!oc || !(oc.matches > 0)) continue;
      catTotal += 1;
      for (const m of CAT_METRICS) if ((oc[m] || 0) > (mine[m] || 0)) greater[m] += 1;
    }
    byCategoryRanked[cat] = {
      ...mine,
      rank: greater.xp + 1,
      playedRank: greater.played + 1,
      correctRank: greater.correct + 1,
      completedRank: greater.completed + 1,
      accuracyRank: greater.accuracy + 1,
      daysRank: greater.daysPlayed + 1,
      catTotal,
    };
  }

  const levelFloor = xpForLevel(p.level);
  const levelNext = xpForLevel(p.level + 1);

  return {
    found: true,
    signed: signed || !p.isAnon,
    isAnon: p.isAnon,
    name,
    userKey: myKey,
    totalPlayers: total,
    rank,
    xp: p.xp,
    level: p.level,
    tier: tier.label,
    tierBg: tier.bg,
    tierFg: tier.fg,
    // Level progress for the XP panel: XP into the current level vs the XP the
    // step to the next level costs, plus the rolling 7-day gain.
    progress: {
      level: p.level,
      xp: p.xp,
      levelFloor,
      levelNext,
      intoLevel: p.xp - levelFloor,
      stepSize: levelNext - levelFloor,
      toNext: Math.max(0, levelNext - p.xp),
      matches: p.matches,
      xp7d: p.xp7d,
    },
    activity: {
      correct: p.correct, answered: p.answered, played: p.played,
      completed: p.completed, accuracy: p.accuracy, daysPlayed: p.daysPlayed || 0,
    },
    ranks: {
      xp: rankAndBase(metricVal.xp, p.xp).rank,
      correct: rankAndBase(metricVal.correct, p.correct).rank,
      completed: rankAndBase(metricVal.completed, p.completed).rank,
      accuracy: rankAndBase(metricVal.accuracy, p.accuracy).rank,
      daysPlayed: rankAndBase(metricVal.daysPlayed, p.daysPlayed || 0).rank,
      played: rankAndBase(metricVal.played, p.played || 0).rank,
    },
    base: {
      xp: Math.round(rankAndBase(metricVal.xp, p.xp).base),
      correct: Math.round(rankAndBase(metricVal.correct, p.correct).base),
      completed: Math.round(rankAndBase(metricVal.completed, p.completed).base * 10) / 10,
      accuracy: Math.round(rankAndBase(metricVal.accuracy, p.accuracy).base * 10) / 10,
      daysPlayed: Math.round(rankAndBase(metricVal.daysPlayed, p.daysPlayed || 0).base * 10) / 10,
      played: Math.round(rankAndBase(metricVal.played, p.played || 0).base * 10) / 10,
    },
    byCategory: byCategoryRanked,
    recent: p.recent.map((m) => ({ ...m })),
    playedIds: p.playedIds || [],
    completedIds: p.completedIds || [],
  };
}
