// ?boards=1 — the two boards on demand.
//
// WHY THIS EXISTS. The doorway's two boards are gated on a cross-day arrival:
// playedToday false, and a last day out at least a day back. That gate is
// correct and it is also the reason the screen cannot be looked at on purpose,
// because the moment you play today you are no longer in its audience.
// `?welcome=1` already forces the SCREEN open for the owner; this forces the
// CASE, so the boards can be reviewed without waiting for tomorrow morning and
// getting exactly one attempt at it.
//
// WHAT IT FAKES, AND WHAT IT DOES NOT. One thing only: the date the left column
// asks for. Live that is `data.lastPlayed`; under the preview it is yesterday in
// ET, because a reader who has played today has lastPlayed === today and both
// columns would ask for the same board and print it beside itself. Both columns
// are still live reads off /api/quiz/daily-combined, the queue is the real
// queue, and the render path is the one that ships. With ?boards=1 absent,
// `preview` is false and every expression this touches reduces to the original.
//
// Anchored, not line-numbered: every anchor must match EXACTLY ONCE or the run
// aborts. Origin moves under this repo constantly, and it moved twice while the
// two boards themselves were being written.
//
//   node scripts/patch-boards-preview.mjs           # hash the blob, print its sha
//   node scripts/patch-boards-preview.mjs --write   # write the working tree
//
// BASE=<rev> selects what it reads (default FETCH_HEAD).

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'FETCH_HEAD';
const PATH = 'app/StageWelcome.jsx';
const WRITE = process.argv.includes('--write');

const sh = (...a) => execFileSync(a[0], a.slice(1), { maxBuffer: 1 << 28 });

function read(path) {
  const raw = sh('git', 'show', `${BASE}:${path}`);
  const want = Number(String(sh('git', 'cat-file', '-s', `${BASE}:${path}`)).trim());
  if (raw.length !== want) throw new Error(`${path}: read ${raw.length} bytes, object is ${want}`);
  return raw.toString('utf8');
}

function sub(text, old, next, label) {
  const n = text.split(old).length - 1;
  if (n !== 1) throw new Error(`${label}: anchor matched ${n} times`);
  return text.replace(old, next);
}

let src = read(PATH);

// ── 1. the helper ────────────────────────────────────────────────────────────
src = sub(src, `  const d = Math.round((now - then) / 86400000);
  return d >= 0 && d < 3650 ? d : null;
}
`, `  const d = Math.round((now - then) / 86400000);
  return d >= 0 && d < 3650 ? d : null;
}

// YESTERDAY IN ET, AS "M-D-YY". PREVIEW ONLY. The route's \`date\` parameter
// speaks M-D-YY (see its header), which is also the shape \`lastPlayed\` arrives
// in, so this has to match that and not etToday()'s YYYY-MM-DD. Built off
// etToday() rather than a local clock so it is the ET day before the ET day,
// not the day before wherever the reader happens to be standing.
function etPrevMdy() {
  try {
    const [Y, M, D] = etToday().split('-').map(Number);
    const d = new Date(Date.UTC(Y, M - 1, D) - 86400000);
    return \`\${d.getUTCMonth() + 1}-\${d.getUTCDate()}-\${String(d.getUTCFullYear()).slice(2)}\`;
  } catch (e) { return null; }
}
`, '1 etPrevMdy');

// ── 2. the state, and the day the left column reads ──────────────────────────
src = sub(src, `  const [cold, setCold] = useState(false);  // no name: the mark and the three lines
`, `  const [cold, setCold] = useState(false);  // no name: the mark and the three lines
  // THE BOARDS ON DEMAND (?boards=1). The two boards are gated on a cross-day
  // arrival, which by definition excludes anyone who has already played today,
  // so without this there is no way to look at the screen on purpose: you wait
  // until tomorrow morning and you get one attempt. It forces the screen open
  // as well, so ?boards=1 is enough on its own and does not need ?welcome=1.
  const [preview, setPreview] = useState(false);
  // THE DAY THE LEFT COLUMN READS. Live, the reader's own last day out. Under
  // the preview, yesterday: the only reader who ever asks for this screen on
  // purpose is one who has played today, and their last day out IS today, so
  // both columns would ask for the same board and print it beside itself.
  // This is the ONLY thing the preview fakes. Both columns are live reads.
  const lastDay = preview ? etPrevMdy() : ((data && data.lastPlayed) || null);
`, '2 state + lastDay');

// ── 3. the parameter ─────────────────────────────────────────────────────────
src = sub(src, `    let force = false, off = false;
`, `    let force = false, off = false, pv = false;
`, '3a let');

src = sub(src, `      force = q.get('welcome') === '1';   // preview, for showing the owner
      off = q.get('welcome') === '0';     // the kill switch
`, `      force = q.get('welcome') === '1';   // preview, for showing the owner
      off = q.get('welcome') === '0';     // the kill switch
      pv = q.get('boards') === '1';       // the boards, for showing the owner
      if (pv) force = true;               // it implies the screen, and the replay
`, '3b read');

src = sub(src, `    setName(who || '');
    setCold(!who);
`, `    setName(who || '');
    setCold(!who);
    setPreview(pv);
`, '3c set');

// ── 4. the recap read: the left column's date, and its gate ──────────────────
src = sub(src, `    const last = data.lastPlayed;
    const gap = daysBetween(last, etToday());
    if (data.playedToday || gap == null || gap < 1) { setRecapDone(true); return; }
`, `    const last = lastDay;
    const gap = daysBetween(last, etToday());
    // The preview skips the GATE, not the read: it still asks the live route
    // for a real day and prints whatever comes back.
    if (!last || (!preview && (data.playedToday || gap == null || gap < 1))) {
      setRecapDone(true); return;
    }
`, '4a recap gate');

src = sub(src, `      .catch(() => { if (alive) setRecapDone(true); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, data, settled]);
`, `      .catch(() => { if (alive) setRecapDone(true); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, data, settled, preview, lastDay]);
`, '4b recap deps');

// ── 5. today's board: the same gate ──────────────────────────────────────────
src = sub(src, `    const gap = daysBetween(data.lastPlayed, etToday());
    if (data.playedToday || gap == null || gap < 1) { setTodayDone(true); return; }
`, `    const gap = daysBetween(lastDay, etToday());
    if (!preview && (data.playedToday || gap == null || gap < 1)) { setTodayDone(true); return; }
`, '5a today gate');

src = sub(src, `      .catch(() => { if (alive) setTodayDone(true); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, data, settled]);
`, `      .catch(() => { if (alive) setTodayDone(true); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, data, settled, preview, lastDay]);
`, '5b today deps');

// ── 6. the case ──────────────────────────────────────────────────────────────
// The preview takes the NEW DAY branch, which is the one the boards were
// written for. Forcing the gap rather than adding a branch keeps the preview on
// the shipped path instead of giving it a fourth case of its own to drift from.
src = sub(src, `    const gap = daysBetween(data.lastPlayed, today);
    const num = (v) => (typeof v === 'number' && isFinite(v) ? v : null);
`, `    const gap = preview ? 1 : daysBetween(data.lastPlayed, today);
    const num = (v) => (typeof v === 'number' && isFinite(v) ? v : null);
`, '6a gap');

src = sub(src, `      const left = colOf('lb', 'Last time out', dayLabel(data.lastPlayed), 'Final',
        lastBoard && lastBoard.rows, name);
`, `      const left = colOf('lb', 'Last time out', dayLabel(lastDay), 'Final',
        lastBoard && lastBoard.rows, name);
`, '6b left head');

src = sub(src, `    if (data.playedToday) {
      const rank = num(data.dayRank);
`, `    if (data.playedToday && !preview) {
      const rank = num(data.dayRank);
`, '6c resume');

src = sub(src, `  }, [data, recap, cold, lastBoard, todayBoard, name]);
`, `  }, [data, recap, cold, lastBoard, todayBoard, name, preview, lastDay]);
`, '6d view deps');

const out = Buffer.from(src, 'utf8');

if (WRITE) {
  writeFileSync(PATH, out);
  console.log(`wrote ${PATH} (${out.length} bytes)`);
} else {
  const blob = String(execFileSync('git', ['hash-object', '-w', '--stdin'], { input: out })).trim();
  const back = sh('git', 'cat-file', 'blob', blob);
  if (!back.equals(out)) throw new Error('blob does not read back');
  console.log(`${PATH} ${blob} (${out.length} bytes)`);
}
