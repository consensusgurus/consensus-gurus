'use client';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getChallenge, challengeQuizIds } from '@/lib/challenges';

// Shared Daily Challenge run support for the special-format quiz boards
// (grid-fill, timed-mcq, logic-grid, place-map, globe). These boards are
// rendered by QuizClient via an EARLY RETURN, before QuizClient's own
// challenge-run logic runs, so without this hook they never write the
// per-quiz run-state (sot_chrun_<chId>) that the /quizzes daily-challenge box
// reads to show each quiz's score badge, and they never auto-advance to the
// next quiz in the run. This hook mirrors the run-state write + auto-advance
// in QuizClient.jsx (endGame, goNextStep, the countdown effect) so the special
// boards behave identically inside a challenge. Keep the two in sync.
//
// A run is ACTIVE only when ?ch=<challengeId>&i=<stepIndex> resolves to a real
// challenge whose step `i` is exactly this quiz. Outside a run every value is
// inert (runActive false) and the board behaves exactly as it does standalone.
export function useChallengeRun(quizId) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chId = searchParams ? searchParams.get('ch') : null;
  const chIRaw = searchParams ? searchParams.get('i') : null;
  const chStepIdx = chIRaw != null && /^\d+$/.test(chIRaw) ? parseInt(chIRaw, 10) : null;
  const challenge = chId ? getChallenge(chId) : null;
  const chStepIds = useMemo(() => (challenge ? challengeQuizIds(challenge) : []), [challenge]);
  const chN = chStepIds.length;
  const runActive = !!(challenge && chStepIdx != null && chStepIdx >= 0 && chStepIdx < chN && chStepIds[chStepIdx] === quizId);
  const chNextStep = runActive ? chStepIdx + 1 : null;
  const chHasNext = runActive && chNextStep < chN;
  const chAccent = challenge ? (challenge.accent || 'Daily Challenge') : '';

  const [ended, setEnded] = useState(false);          // recordStep has fired (drives the overlay)
  const [chCountdown, setChCountdown] = useState(null); // null = not counting; else integer seconds
  const wroteRef = useRef(false);
  const timerRef = useRef(null);

  const goNextStep = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (!runActive) return;
    if (chHasNext) router.push(`/quiz/${chStepIds[chNextStep]}?ch=${encodeURIComponent(chId)}&i=${chNextStep}`);
    else router.push(`/challenge/${encodeURIComponent(chId)}?done=1`);
  }, [runActive, chHasNext, chStepIds, chNextStep, chId, router]);

  useEffect(() => {
    if (chCountdown == null || !runActive) return;
    if (chCountdown <= 0) { goNextStep(); return; }
    timerRef.current = setInterval(() => setChCountdown((c) => (c == null ? c : c - 1)), 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [chCountdown, runActive, goNextStep]);

  // Call once at game end. Writes this quiz's score into the shared run-state
  // (so the daily-challenge box shows its score/total badge) and starts the
  // auto-advance countdown. No-op outside a run, and guarded to fire once.
  const recordStep = useCallback((score, total, timeElapsed) => {
    if (!runActive || wroteRef.current) return;
    wroteRef.current = true;
    setEnded(true);
    try {
      const key = `sot_chrun_${chId}`;
      let run;
      try { run = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { run = null; }
      if (!run || typeof run !== 'object') run = { ids: chStepIds, scores: {}, startedAt: Date.now() };
      if (!run.ids || !Array.isArray(run.ids)) run.ids = chStepIds;
      if (!run.scores || typeof run.scores !== 'object') run.scores = {};
      run.scores[quizId] = { score, total, timeElapsed };
      run.updatedAt = Date.now();
      localStorage.setItem(key, JSON.stringify(run));
    } catch (e) { /* localStorage unavailable; advance still works */ }
    setChCountdown(6);
  }, [runActive, chId, chStepIds, quizId]);

  return { runActive, ended, chId, chAccent, chStepIdx, chN, chStepIds, chNextStep, chHasNext, chCountdown, recordStep, goNextStep };
}

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const EMBER = '#0e1d40';
const ACC_BORDER = '#cddffb';

// A layout-agnostic fixed bar (bottom-center) shown once the run's quiz has
// ended. Renders the challenge accent, step dots, and the auto-advancing
// Next/Results button. Position:fixed so it works identically across every
// board layout without splicing into each board's results markup.
export function ChallengeRunOverlay({ run }) {
  if (!run || !run.runActive || !run.ended) return null;
  const { chAccent, chStepIdx, chN, chHasNext, chNextStep, chCountdown, goNextStep } = run;
  const label = chHasNext
    ? (chCountdown != null && chCountdown > 0 ? `Next quiz in ${chCountdown}…` : `Next quiz (${chNextStep + 1} of ${chN}) →`)
    : (chCountdown != null && chCountdown > 0 ? `Your results in ${chCountdown}…` : 'See your results →');
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 200, display: 'flex', justifyContent: 'center', padding: '0 16px 16px', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: 420, boxSizing: 'border-box', background: '#fff', border: `1.5px solid ${ACC_BORDER}`, borderRadius: 14, boxShadow: '0 10px 30px rgba(20,22,28,0.18)', padding: '12px 14px', fontFamily: FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <span style={{ fontFamily: FONT, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800, color: EMBER }}>Daily Challenge · {chAccent}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {Array.from({ length: chN }).map((_, k) => (
              <span key={k} style={{ width: 9, height: 9, borderRadius: '50%', boxSizing: 'border-box', background: k <= chStepIdx ? EMBER : 'transparent', border: k === chStepIdx ? `2.5px solid ${EMBER}` : `1.5px solid ${ACC_BORDER}` }} />
            ))}
          </span>
        </div>
        <button onClick={goNextStep} style={{ width: '100%', boxSizing: 'border-box', fontFamily: FONT, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 800, padding: '14px 18px', borderRadius: 10, border: 'none', background: EMBER, color: '#fff', cursor: 'pointer' }}>{label}</button>
      </div>
    </div>
  );
}
