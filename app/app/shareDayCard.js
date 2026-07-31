'use client';

// Shared "Share my day" action.
//
// Fetches the viewer's 1080x1080 day card from /api/quiz/day-card (brain meter
// filled by how much of today's slate they cleared, the day's IQ Points gain,
// and their standing tiles), hands it to the native share sheet where the
// browser accepts files, downloads it everywhere else, then opens the
// share-credit pop-up so the player has their referral link to post with it.
//
// Callers own their own busy state; this throws on a failed fetch so the button
// can re-enable. Used by the daily end card (app/DailyEndCard.jsx) and the
// quizzes-home tool row (app/quizzes/QuizHomeClient.jsx).

import { notifyShareCredit } from './ShareCreditPop';

const FILE_NAME = 'source-of-truths-day.png';

export default async function shareDayCard() {
  let anonId = null, email = null;
  try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
  try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
  const qs = new URLSearchParams();
  if (anonId) qs.set('anonId', anonId);
  if (email) qs.set('email', email);

  const res = await fetch('/api/quiz/day-card?' + qs.toString());
  if (!res.ok) throw new Error('day-card ' + res.status);
  const blob = await res.blob();

  let shared = false;
  try {
    const file = new File([blob], FILE_NAME, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
      shared = true;
    }
  } catch (e) { shared = false; }
  if (!shared) {
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = FILE_NAME;
    document.body.appendChild(el); el.click(); el.remove();
    setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 4000);
  }
  // No explicit url: the pop-up derives the credit link from the current page.
  notifyShareCredit('');
  return true;
}
