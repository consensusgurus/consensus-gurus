'use client';

// ──────────────────────────────────────────────────────────────────────────
// LSAT practice quiz — "Where Will You Get In?"  (hidden /lsat preview)
//
// Ten hard, original LSAT-style logical-reasoning questions, five choices each,
// 35 seconds per question. The visual language matches the live timed-mcq board
// (Manrope, blue accent, paper/cream surfaces) but this page makes NO calls to
// the /api/quiz/* endpoints — no view tracking, no result posting, no
// leaderboard. It is not registered in lib/quizzes.js, so nothing links to it.
//
// Scoring is local only and used for flavor: full 35 points for a fast right
// answer, decaying to 1 at the buzzer, 0 for a wrong answer or a timeout. The
// real payoff is a shortlist of law schools (U.S. News 2025–26) matched to how
// many questions you got right.
// ──────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Check, X, Zap, Flag, Share2, RotateCcw, GraduationCap, ChevronRight } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  rust: '#c0392b',
  forest: '#10b981',
  faded: '#6b7280',
};
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const PER_SEC = 75;
const PER_MS = PER_SEC * 1000;
const MAX_PER = 35;
const GRACE_MS = 3000;
const TICK_MS = 80;

// ── Ten hard LSAT-style logical-reasoning questions ──
const QUESTIONS = [
  {
    type: 'Necessary assumption',
    q: 'Critic: The newly restored film cannot be considered the director’s authentic vision. The restoration team recolored several scenes that the director, working with the technology of his era, had deliberately left in black and white. A restoration that alters an artist’s deliberate choices fails to preserve the work’s authenticity.',
    prompt: 'The critic’s argument depends on assuming which one of the following?',
    choices: [
      'The director would have preferred color in those scenes had the technology been available to him.',
      'Authenticity is the most important criterion for evaluating any film restoration.',
      'No restoration that preserves a work’s authenticity alters any feature of the original whatsoever.',
      'The recoloring was not a change the director had himself sanctioned for a later restoration.',
      'The technology of the director’s era was incapable of producing color images.',
    ],
    correct: 3,
    note: 'If the director had authorized the recoloring for a future restoration, altering the black-and-white scenes would not betray his choices, and the argument collapses. (C) is far too strong, and (B) about importance is beside the point of whether THIS restoration is authentic.',
  },
  {
    type: 'Parallel flaw',
    q: 'Everyone who has mastered calculus has first mastered algebra. Priya has not mastered calculus. So Priya must not have mastered algebra.',
    prompt: 'The flawed reasoning above is most similar to that in which one of the following?',
    choices: [
      'Every accredited hospital employs at least one anesthesiologist. The clinic on Fifth Street is not accredited, so it employs no anesthesiologist.',
      'All published novelists have completed a manuscript. Tomas has completed a manuscript, so he is a published novelist.',
      'No reptile is warm-blooded. The platypus is warm-blooded, so the platypus is not a reptile.',
      'Most experienced pilots have flown at night. Dana is an experienced pilot, so Dana has very likely flown at night.',
      'If a bill has majority support, it will pass. This bill passed, so it had majority support.',
    ],
    correct: 0,
    note: 'The original treats a necessary condition as sufficient: mastering algebra is necessary for calculus, yet lacking calculus is wrongly taken to mean lacking algebra (denying the antecedent). Only (A) repeats that exact error. (B) and (E) affirm the consequent; (C) is a valid contrapositive.',
  },
  {
    type: 'Strengthen',
    q: 'In a large company, employees who took the optional midday exercise class later used fewer sick days than employees who did not take it. The company concluded that the class reduces illness and is weighing whether to make it mandatory.',
    prompt: 'Which one of the following, if true, most strengthens the company’s conclusion?',
    choices: [
      'The class was taught by a certified fitness instructor.',
      'Sick-day use across the whole company declined during the year the class was introduced.',
      'Some employees who took the class reported that they enjoyed it.',
      'Employees who already used many sick days were less likely to enroll in the class.',
      'Employees who exercise regularly outside of work were no more likely to enroll in the class than other employees.',
    ],
    correct: 4,
    note: 'The threat to the causal claim is self-selection: if already-healthy, exercise-prone people chose the class, their fewer sick days prove nothing about the class. (E) closes that gap. (D) actually deepens the selection problem rather than ruling it out.',
  },
  {
    type: 'Flaw',
    q: 'Spokesperson: Our critics claim our factory pollutes the river. But these same critics never acknowledge the hundreds of jobs the factory brings to this community. Until they give us credit for the good we do, their accusations about pollution deserve no response.',
    prompt: 'The reasoning is most vulnerable to criticism on the grounds that it',
    choices: [
      'treats the critics’ failure to disprove a claim as establishing that claim',
      'presumes, without warrant, that an organization providing benefits cannot also cause harm',
      'rejects a claim merely because of a perceived shortcoming in those who advance it',
      'relies on the testimony of people who are not experts about pollution',
      'draws a conclusion about one factory from a generalization about factories',
    ],
    correct: 2,
    note: 'The spokesperson refuses to engage the pollution claim because the critics are ungrateful — dismissing the argument by faulting its source. (B) is the trap, but the argument never asserts that benefits rule out harm; it simply declines to respond.',
  },
  {
    type: 'Inference',
    q: 'Every council member who voted for the zoning change also voted for the tax levy. No council member who attended the budget workshop voted for the tax levy. Some council members who attended the budget workshop are first-term members.',
    prompt: 'If the statements above are true, which one of the following must also be true?',
    choices: [
      'No first-term council member voted for the zoning change.',
      'Some first-term council members did not vote for the zoning change.',
      'Every council member who voted for the tax levy voted for the zoning change.',
      'No first-term council member attended the budget workshop.',
      'Some council members who voted for the zoning change attended the budget workshop.',
    ],
    correct: 1,
    note: 'Workshop attendees did not vote for the levy, so (zoning → levy) they did not vote for the zoning change either. Since some first-termers attended the workshop, those first-termers did not vote for the zoning change. (A) overreaches to ALL first-termers; (E) is impossible.',
  },
  {
    type: 'Sufficient assumption',
    q: 'If a scientific theory is genuinely explanatory, it rules out at least some conceivable observations. The theory of “universal vital energy” is compatible with every conceivable observation. Therefore, the theory of universal vital energy is not science.',
    prompt: 'The conclusion follows logically if which one of the following is assumed?',
    choices: [
      'Any theory that is genuinely explanatory is a science.',
      'A theory is a science only if it is widely accepted by experts.',
      'Some sciences rule out at least some conceivable observations.',
      'Only genuinely explanatory theories are sciences.',
      'No theory that is compatible with every observation is widely accepted.',
    ],
    correct: 3,
    note: 'The premises already make vital-energy theory non-explanatory. To reach “not science,” you need science to require being explanatory — that is, “only explanatory theories are science” (D). (A) runs the conditional the wrong way.',
  },
  {
    type: 'Resolve the paradox',
    q: 'A coastal town imposed a strict limit on the daily catch allowed per fishing boat, intending to let fish populations recover. Five years later, the total weight of fish caught per year in the town’s waters had actually increased, though the number of fishing boats was unchanged.',
    prompt: 'Which one of the following, if true, most helps to resolve the apparent discrepancy?',
    choices: [
      'Neighboring towns adopted similar catch limits over the same five years.',
      'The market price of fish rose sharply during the five-year period.',
      'The recovering fish population let boats reach their daily limit on far more days than they used to.',
      'Several boat owners retired and sold their boats to newcomers during the period.',
      'Some of the fish caught after the limit took effect were substantially larger than those caught before it.',
    ],
    correct: 2,
    note: 'A per-boat daily cap can still yield more total fish if a rebounding population lets every boat hit its cap on many more days than before. (E) is tempting, but a strict daily limit would still cap each day’s output and does not by itself explain a yearly rise.',
  },
  {
    type: 'Principle (application)',
    q: 'Principle: A person is morally responsible for a harmful outcome only if that person could have reasonably foreseen the outcome and could have acted otherwise.',
    prompt: 'Which one of the following judgments conforms most closely to the principle?',
    choices: [
      'Mara is responsible for a guest’s allergic reaction, though she had no way of knowing of the allergy, because she cooked the meal.',
      'Owen is responsible for the data loss because its consequences were severe, whether or not he could have prevented it.',
      'Lena is not responsible for missing the clearly marked deadline she chose to ignore, because the project was difficult.',
      'Priya is responsible for the traffic delay merely because she was present when it occurred.',
      'Devin could have foreseen that the worn ladder might break, but since no safer ladder was available and he had to reach the roof, he is not responsible for his fall.',
    ],
    correct: 4,
    note: 'The principle makes responsibility require BOTH foreseeability AND the ability to act otherwise. (E) tracks it exactly: Devin foresaw the risk but had no reasonable alternative, so the verdict that he is not responsible fits. (A), (B), and (D) call people responsible while a required condition is missing.',
  },
  {
    type: 'Role of a claim',
    q: 'Historian: It is often said that the printing press caused the rapid spread of literacy in early modern Europe. But in several regions literacy rates had already begun climbing decades before printed books became widely available there. The press surely accelerated a trend, but a trend cannot have been caused by something that postdates its beginning.',
    prompt: 'The claim that literacy rates had begun climbing before printed books became widely available plays which one of the following roles in the argument?',
    choices: [
      'It is evidence offered against the claim that the printing press was the original cause of rising literacy.',
      'It is the main conclusion the historian’s argument is designed to establish.',
      'It is a general principle from which the historian’s conclusion is deduced.',
      'It is an example illustrating how the historian defines literacy.',
      'It is a concession that, if true, would undermine the historian’s own position.',
    ],
    correct: 0,
    note: 'The timing fact is the evidence that the press could not be the original cause (a cause cannot postdate the trend). The conclusion is the final claim about causation; the timing point supports it rather than stating it.',
  },
  {
    type: 'Weaken',
    q: 'Nutritionist: A recent study found that people who regularly eat breakfast weigh less, on average, than people who skip it. Clearly, eating breakfast helps keep weight down, so anyone trying to lose weight should be sure to eat it.',
    prompt: 'Which one of the following, if true, most undermines the nutritionist’s recommendation?',
    choices: [
      'The study’s participants ranged widely in age.',
      'Among people actively trying to lose weight, those who added breakfast to their usual diet ate more total daily calories and gained weight.',
      'The study did not record what the participants actually ate for breakfast.',
      'Many people who eat breakfast also exercise in the morning.',
      'People who skip breakfast tend to eat substantially more later in the day.',
    ],
    correct: 1,
    note: 'The advice targets people trying to lose weight, and (B) shows that for exactly that group adding breakfast backfired. (D) weakens the general causal claim, but (B) strikes the actual recommendation for the relevant population far more directly.',
  },
];

// ── Law schools, U.S. News 2025–26 order (top 50) ──
const SCHOOLS = [
  'Stanford University',
  'Yale University',
  'University of Chicago',
  'University of Virginia',
  'University of Pennsylvania (Carey)',
  'Duke University',
  'Harvard University',
  'New York University',
  'University of Michigan (Ann Arbor)',
  'Northwestern University (Pritzker)',
  'Columbia University',
  'University of California, Berkeley',
  'UCLA',
  'Cornell University',
  'University of Texas at Austin',
  'Washington University in St. Louis',
  'Georgetown University',
  'Vanderbilt University',
  'University of North Carolina (Chapel Hill)',
  'University of Notre Dame',
  'University of Minnesota',
  'Boston University',
  'Boston College',
  'Texas A&M University',
  'University of Georgia',
  'University of Southern California (Gould)',
  'Wake Forest University',
  'Ohio State University (Moritz)',
  'Brigham Young University (Clark)',
  'University of Wisconsin–Madison',
  'George Washington University',
  'William & Mary',
  'University of Alabama',
  'George Mason University (Scalia)',
  'University of Utah (Quinney)',
  'University of Iowa',
  'Washington and Lee University',
  'Florida State University',
  'Emory University',
  'University of California, Irvine',
  'Fordham University',
  'University of Florida (Levin)',
  'Baylor University',
  'Southern Methodist University (Dedman)',
  'Arizona State University (O’Connor)',
  'University of Colorado–Boulder',
  'Indiana University–Bloomington (Maurer)',
  'Villanova University',
  'University of Illinois Urbana-Champaign',
  'University of California, Davis',
];

// correct count (0..10) -> 0-based start index of the 5-school reach window
const REACH_START = [46, 45, 39, 31, 24, 18, 13, 9, 5, 2, 0];

function verdictFor(correct) {
  if (correct <= 2) return 'A tough section to start from. These are realistic schools to build toward as your score climbs.';
  if (correct <= 4) return 'Solid fundamentals. Keep drilling the logic and the range opens up quickly.';
  if (correct <= 6) return 'Strong logical reasoning. Competitive, realistic targets are within reach.';
  if (correct <= 8) return 'Excellent control of the section. Aim high on this list.';
  return 'Elite performance. The very top of the rankings is genuinely in play.';
}

function ptsFrac(rem) {
  const elapsed = PER_MS - Math.max(0, Math.min(PER_MS, rem));
  if (elapsed <= GRACE_MS) return 1;
  const span = PER_MS - GRACE_MS;
  return span > 0 ? Math.max(0, (PER_MS - elapsed) / span) : 0;
}

export default function LsatQuizClient() {
  const total = QUESTIONS.length;
  const maxPoints = total * MAX_PER;

  const [phase, setPhase] = useState('idle'); // idle | playing | reveal | done
  const [qIndex, setQIndex] = useState(0);
  const [remaining, setRemaining] = useState(PER_MS);
  const [picked, setPicked] = useState(null);
  const [results, setResults] = useState([]); // [{ pts, correct, choice }]
  const [copied, setCopied] = useState(false);

  const timerRef = useRef(null);
  const deadlineRef = useRef(0);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const points = results.reduce((s, r) => s + (r.pts || 0), 0);
  const correctCount = results.filter((r) => r.correct).length;
  const q = QUESTIONS[qIndex];

  function stopTimer() { clearInterval(timerRef.current); timerRef.current = null; }

  function beginQuestion(i) {
    setQIndex(i);
    setPicked(null);
    setPhase('playing');
    setRemaining(PER_MS);
    deadlineRef.current = Date.now() + PER_MS;
    stopTimer();
    timerRef.current = setInterval(() => {
      const left = deadlineRef.current - Date.now();
      if (left <= 0) { stopTimer(); setRemaining(0); settle(null); }
      else setRemaining(left);
    }, TICK_MS);
  }

  function startGame() {
    setResults([]);
    beginQuestion(0);
  }

  function settle(choiceIndex) {
    stopTimer();
    const cur = QUESTIONS[qIndex];
    const left = Math.max(0, deadlineRef.current - Date.now());
    const correct = choiceIndex != null && choiceIndex === cur.correct;
    const pts = correct ? Math.max(1, Math.round(MAX_PER * ptsFrac(left))) : 0;
    setPicked(choiceIndex);
    setPhase('reveal');
    setResults((prev) => [...prev, { pts, correct, choice: choiceIndex }]);
  }

  function pick(i) { if (phase === 'playing') settle(i); }

  function next() {
    if (qIndex + 1 < total) beginQuestion(qIndex + 1);
    else { stopTimer(); setPhase('done'); }
  }

  function giveUp() { stopTimer(); setPhase('done'); }

  function restart() {
    stopTimer();
    setResults([]);
    setPicked(null);
    setQIndex(0);
    setRemaining(PER_MS);
    setPhase('idle');
  }

  function share() {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://sourceoftruths.com/lsat';
    const text = phase === 'done'
      ? `I got ${correctCount}/${total} on the LSAT practice quiz. Where will you get in?`
      : 'LSAT practice: 10 hard logical-reasoning questions. Where will you get in?';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'LSAT Practice', text, url }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {});
    }
  }

  const frac = Math.max(0, Math.min(1, remaining / PER_MS));
  const liveValue = Math.max(0, Math.round(MAX_PER * ptsFrac(remaining)));
  const lowClock = phase === 'playing' && remaining <= 8000;
  const lastResult = results[results.length - 1];

  // Reach window for the results screen
  const reachStart = Math.min(REACH_START[correctCount] ?? 45, SCHOOLS.length - 5);
  const reachWindow = SCHOOLS.slice(reachStart, reachStart + 5);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip', fontFamily: FONT }}>
      <Grain />
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');"}</style>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: '22px 22px 80px' }}>
        {/* Header */}
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', color: COLORS.ember, fontFamily: FONT, fontSize: 12.5, fontWeight: 600, marginBottom: 18 }}>
          <ArrowLeft size={13} strokeWidth={2.5} /> Source of Truths
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <GraduationCap size={28} strokeWidth={2} style={{ color: COLORS.ember, flex: 'none' }} />
          <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(28px, 4.5vw, 44px)', lineHeight: 1.04, letterSpacing: '-0.025em', margin: 0, color: COLORS.ink }}>
            Where Will You Get In?
          </h1>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15.5, lineHeight: 1.55, margin: '12px 0 0', color: COLORS.faded, maxWidth: 640 }}>
          Ten hard LSAT-style logical reasoning questions, 75 seconds each. We’ll match your score to a shortlist of law schools.
        </p>

        <div style={{ marginTop: 22 }} />

        {/* Scoreboard (during play) */}
        {phase !== 'idle' && phase !== 'done' && (
          <div style={{ position: 'sticky', top: 0, zIndex: 20, background: COLORS.cream, paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: COLORS.paper, borderRadius: 12, border: `1px solid ${COLORS.faded}33`, padding: '14px 20px' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1 }}>{points}<span style={{ fontSize: 18, color: COLORS.faded }}>/{maxPoints}</span></div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, fontWeight: 600 }}>Points</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: `1px solid ${COLORS.faded}33`, borderRight: `1px solid ${COLORS.faded}33`, padding: '0 22px' }}>
                <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1, color: COLORS.forest }}>{correctCount}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, fontWeight: 600 }}>Correct</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.ink }}>Q {Math.min(qIndex + 1, total)}/{total}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, fontWeight: 600 }}>Question</div>
              </div>
            </div>
            {/* Timer bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
              <div style={{ flex: 1, height: 12, background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}44`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${frac * 100}%`, background: lowClock ? COLORS.rust : COLORS.forest, transition: phase === 'playing' ? `width ${TICK_MS}ms linear` : 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 96, justifyContent: 'flex-end' }}>
                <Zap size={15} strokeWidth={2.5} style={{ color: phase === 'reveal' ? COLORS.faded : (lowClock ? COLORS.rust : COLORS.ember) }} />
                <span style={{ fontSize: 22, fontWeight: 600, color: phase === 'reveal' ? COLORS.faded : COLORS.ink }}>
                  {phase === 'reveal' ? '+' + (lastResult?.pts ?? 0) : liveValue}
                </span>
                <span style={{ fontSize: 11, color: COLORS.faded }}>pts</span>
              </div>
            </div>
          </div>
        )}

        {/* IDLE */}
        {phase === 'idle' && (
          <div style={{ textAlign: 'center', padding: '30px 24px 34px', borderRadius: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper }}>
            <Zap size={26} strokeWidth={2.2} style={{ color: COLORS.ember }} />
            <h2 style={{ fontWeight: 800, fontSize: 26, margin: '8px 0 8px' }}>Sharpen your reasoning.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: '#41454d', maxWidth: 480, margin: '0 auto 6px' }}>
              {total} questions, five choices each. You get {PER_SEC} seconds per question, and the points for a right answer fall as the clock ticks. Answer within about {Math.round(GRACE_MS / 1000)} seconds for the full {MAX_PER}; a wrong answer or a timeout scores zero.
            </p>
            <p style={{ fontSize: 12, letterSpacing: '0.06em', color: COLORS.faded, margin: '0 0 22px', fontWeight: 600 }}>
              Your number correct decides which law schools land in reach.
            </p>
            <button onClick={startGame} style={{ fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '0 44px', lineHeight: '52px', border: 'none', borderRadius: 10, background: COLORS.ember, color: '#fff', cursor: 'pointer' }}>
              Begin
            </button>
          </div>
        )}

        {/* PLAYING / REVEAL */}
        {(phase === 'playing' || phase === 'reveal') && q && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.ember, fontWeight: 700, margin: '2px 0 8px' }}>{q.type}</div>
            <div style={{ fontWeight: 600, fontSize: 'clamp(16px, 2.4vw, 19px)', lineHeight: 1.5, margin: '0 0 8px', color: '#2b2f37' }}>{q.q}</div>
            <div style={{ fontWeight: 700, fontSize: 'clamp(17px, 2.6vw, 21px)', lineHeight: 1.3, margin: '0 0 16px' }}>{q.prompt}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 9 }}>
              {q.choices.map((c, ci) => {
                const revealing = phase === 'reveal';
                const isCorrect = ci === q.correct;
                const isPicked = ci === picked;
                let bg = '#fff', border = COLORS.ink, fg = COLORS.ink, mark = null;
                if (revealing) {
                  if (isCorrect) { bg = '#e7f3ec'; border = COLORS.forest; mark = <Check size={18} strokeWidth={3} style={{ color: COLORS.forest }} />; }
                  else if (isPicked) { bg = '#f7e7e3'; border = COLORS.rust; fg = COLORS.rust; mark = <X size={18} strokeWidth={3} style={{ color: COLORS.rust }} />; }
                  else { bg = COLORS.paper; border = COLORS.faded + '33'; fg = COLORS.faded; }
                }
                return (
                  <button
                    key={ci}
                    onClick={() => pick(ci)}
                    disabled={revealing}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 13, textAlign: 'left', padding: '13px 16px', borderRadius: 10, background: bg, border: `1.5px solid ${border}`, color: fg, cursor: revealing ? 'default' : 'pointer', fontFamily: FONT, fontSize: 15.5, lineHeight: 1.4, transition: 'background .15s, border-color .15s' }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: revealing && !isCorrect && !isPicked ? COLORS.faded : COLORS.ember, width: 16, flex: 'none', marginTop: 1 }}>{String.fromCharCode(65 + ci)}</span>
                    <span style={{ flex: 1 }}>{c}</span>
                    <span style={{ width: 20, flex: 'none' }}>{mark}</span>
                  </button>
                );
              })}
            </div>

            {phase === 'reveal' && (
              <div style={{ marginTop: 14, padding: '13px 16px', borderRadius: 8, background: COLORS.paper, borderLeft: `3px solid ${lastResult?.correct ? COLORS.forest : COLORS.rust}` }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: lastResult?.correct ? COLORS.forest : COLORS.rust, marginBottom: 6 }}>
                  {lastResult?.correct ? `Correct  ·  +${lastResult?.pts} pts` : (picked == null ? 'Out of time' : 'Not quite')}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: '#41454d' }}>{q.note}</div>
              </div>
            )}

            {/* progress dots */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 22 }}>
              {QUESTIONS.map((_, i) => {
                const done = i < results.length;
                const cur = i === qIndex;
                const good = done && results[i]?.correct;
                return <span key={i} style={{ width: cur ? 22 : 9, height: 9, borderRadius: 5, background: done ? (good ? COLORS.forest : COLORS.rust) : (cur ? COLORS.ember : COLORS.faded + '44'), transition: 'all .2s' }} />;
              })}
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {phase === 'reveal' && (
                <button onClick={next} style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 32px', lineHeight: '48px', border: 'none', borderRadius: 10, background: COLORS.ink, color: COLORS.cream, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {qIndex + 1 < total ? 'Next question' : 'See my shortlist'} <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              )}
              <button onClick={giveUp} style={ghostBtn}>
                <Flag size={12} strokeWidth={2.5} /> End now
              </button>
            </div>
          </div>
        )}

        {/* DONE — shortlist payoff */}
        {phase === 'done' && (
          <div>
            <div style={{ padding: '24px', borderRadius: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, textAlign: 'center' }}>
              <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 8, fontWeight: 700 }}>Your result</div>
              <div style={{ fontWeight: 800, fontSize: 44, lineHeight: 1, marginBottom: 6 }}>{correctCount}<span style={{ fontSize: 24, color: COLORS.faded }}>/{total}</span></div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{points} points · {correctCount} of {total} correct</div>
              <p style={{ fontSize: 15, lineHeight: 1.5, color: '#41454d', maxWidth: 480, margin: '0 auto' }}>{verdictFor(correctCount)}</p>
            </div>

            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, fontWeight: 700, margin: '26px 0 12px' }}>Schools in reach</div>
            <div>
              {reachWindow.map((s, i) => {
                const rank = reachStart + i + 1;
                const isReach = i === 0;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', marginBottom: 8, borderRadius: 10, background: isReach ? '#e7f3ec' : '#fff', border: `1.5px solid ${isReach ? COLORS.forest : COLORS.faded + '33'}` }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.faded, minWidth: 30 }}>#{rank}</span>
                    <span style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>{s}</span>
                    {isReach && <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: COLORS.forest }}>Target reach</span>}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, margin: '10px 0 0', lineHeight: 1.45 }}>
              Ranked by 2025–26 U.S. News standing. For fun only, not admissions advice.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
              <button onClick={restart} style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 28px', lineHeight: '48px', border: 'none', borderRadius: 10, background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <RotateCcw size={14} strokeWidth={2.5} /> Take it again
              </button>
              <button onClick={share} style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 28px', lineHeight: '48px', border: `1.5px solid ${COLORS.ink}`, borderRadius: 10, background: COLORS.cream, color: COLORS.ink, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            {/* Answer recap */}
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.faded, fontWeight: 700, margin: '32px 0 12px' }}>The reasoning behind each answer</div>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {QUESTIONS.map((qq, i) => {
                const r = results[i];
                const good = r && r.correct;
                return (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '13px 16px', borderRadius: 10, border: `1px solid ${good ? COLORS.forest : COLORS.faded + '33'}`, marginBottom: 8, background: good ? '#fff' : COLORS.paper }}>
                    <span style={{ width: 20, flex: 'none', color: good ? COLORS.forest : COLORS.rust, marginTop: 2 }}>{good ? <Check size={17} strokeWidth={3} /> : <X size={17} strokeWidth={3} />}</span>
                    <span style={{ flex: 1, fontSize: 14, lineHeight: 1.45 }}>
                      <span style={{ color: '#2b2f37', fontWeight: 600 }}>{qq.prompt}</span>
                      <span style={{ display: 'block', fontSize: 12.5, color: COLORS.faded, marginTop: 4, fontWeight: 600 }}>
                        Answer: <span style={{ color: COLORS.ink }}>{String.fromCharCode(65 + qq.correct)}. {qq.choices[qq.correct]}</span>
                      </span>
                      <span style={{ display: 'block', fontSize: 13.5, color: '#41454d', marginTop: 6, lineHeight: 1.5 }}>{qq.note}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 18, borderTop: `1px solid ${COLORS.faded}33`, fontSize: 11, letterSpacing: '0.04em', color: COLORS.faded, lineHeight: 1.6 }}>
          Questions are original, LSAT-style logical reasoning. School ranking: U.S. News &amp; World Report Best Law Schools, 2025–26.
        </div>
      </div>

      <Footer />
    </div>
  );
}

const ghostBtn = { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, padding: '0 20px', lineHeight: '48px', background: 'transparent', color: COLORS.faded, borderRadius: 10, border: `1px solid ${COLORS.faded}55`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT };
