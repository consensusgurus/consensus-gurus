'use client';
// Shared CSV export helpers for the admin Analytics tabs. Files are UTF-8 with
// a BOM so Excel renders accented values (Málaga, Besançon) correctly.
//
// The users export runs entirely in the browser from the per-player summaries
// the page already carries. The games export is one row per completed game, so
// since 2026-08-28 it takes rows fetched from /api/admin/player-plays?all=1
// rather than reading them out of the page: that detail was 72,254 objects and
// ~34MB of the admin response, and it now loads only when someone asks for it.

function csvEscape(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function csvString(head, rows) {
  return [head, ...rows].map((r) => r.map(csvEscape).join(',')).join('\r\n');
}

export function downloadCsvFile(basename, head, rows) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const csv = csvString(head, rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${basename}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const joinMany = (list) => (Array.isArray(list) && list.length ? list.join(' | ') : '');
const DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hourLabel = (h) => (h == null ? '' : `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'} ET`);

// One row per player — registered signups and anonymous browsers alike —
// mirroring the All Players table plus the expanded stats the panel shows.
export function buildUsersCsv(signups, anonPlayers) {
  const head = [
    'Player', 'Type', 'Email', 'Signed up', 'Plays', 'Sessions', 'Distinct quizzes',
    'Accuracy %', 'Best score', 'Avg time (s)', 'Perfect games', 'Active days',
    'Peak hour', 'Peak day', 'Most played', 'First seen', 'Last seen',
    'Devices', 'OSes', 'Browsers', 'Locations', 'Timezones', 'Languages', 'Referrers',
  ];
  const statRow = (name, type, email, signedUp, stats, lastAt) => {
    const st = stats || {};
    return [
      name, type, email || '', signedUp || '',
      st.plays || 0, st.sessions || 0, st.quizzes || 0,
      st.accuracy == null ? '' : st.accuracy,
      st.bestScore == null ? '' : st.bestScore,
      st.avgTime == null ? '' : st.avgTime,
      st.perfect || 0, st.activeDays || 0,
      hourLabel(st.peakHour), st.peakDow == null ? '' : DOWS[st.peakDow] || '',
      st.mostPlayed ? `${st.mostPlayed.title} ×${st.mostPlayed.count}` : '',
      st.firstSeen || '', lastAt || st.lastSeen || '',
      joinMany(st.devices), joinMany(st.oses), joinMany(st.browsers),
      joinMany(st.geos), joinMany(st.timezones), joinMany(st.languages), joinMany(st.referrers),
    ];
  };
  const rows = [];
  for (const s of signups || []) {
    // Last seen comes from the summary. It used to be read off the newest play
    // row, which is the same value by construction (playerStats derives
    // lastSeen from those rows) but required the whole play list to be present.
    rows.push(statRow(s.username || '(no name)', 'Registered', s.email, s.createdAt, s.stats, s.stats && s.stats.lastSeen));
  }
  for (const p of anonPlayers || []) {
    rows.push(statRow(p.label, 'Anonymous', '', '', p.stats, p.lastPlayed));
  }
  return { head, rows };
}

export function exportUsersCsv(signups, anonPlayers) {
  const { head, rows } = buildUsersCsv(signups, anonPlayers);
  downloadCsvFile('sot-users-detail', head, rows);
}

// One row per completed game, newest first — the same per-play detail the
// player tables show when a row is expanded. `players` is the payload of
// /api/admin/player-plays?all=1: [{ key, type, name, email, plays: [...] }].
export function buildGamesCsv(players) {
  const head = [
    'Played at', 'Player', 'Type', 'Email', 'Quiz', 'Quiz id',
    'Score', 'Max', 'Correct', 'Time (s)',
    'Device', 'OS', 'Browser', 'Location', 'Timezone', 'Language', 'Referrer',
  ];
  const playRow = (name, type, email, g) => [
    g.createdAt || '', name, type, email || '', g.title || g.quizId || '', g.quizId || '',
    g.score == null ? '' : g.score, g.total == null ? '' : g.total,
    g.correct == null ? '' : g.correct, g.timeElapsed == null ? '' : g.timeElapsed,
    g.device || '', g.os || '', g.browser || '', g.geo || '',
    g.timezone || '', g.language || '', g.referrer || '',
  ];
  const rows = [];
  for (const p of players || []) {
    for (const g of p.plays || []) {
      rows.push(playRow(p.name || '(no name)', p.type || '', p.email, g));
    }
  }
  rows.sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  return { head, rows };
}

export function exportGamesCsv(players) {
  const { head, rows } = buildGamesCsv(players);
  downloadCsvFile('sot-games-detail', head, rows);
}
