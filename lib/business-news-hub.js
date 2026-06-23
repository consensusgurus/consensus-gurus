// Single source of truth for "is this quiz part of the Business News quiz hub?"
//
// The hub at app/quizzes/business-news surfaces four kinds of quiz: the daily
// market-news / daily- and weekly-business / earnings-reporter recaps (NEWS_RE),
// company earnings + lightning quizzes (anything in COMPANY_META or matching the
// -NqNN-earnings-quiz id pattern), and the thematic sector updates (SECTOR_META).
//
// The quizzes home (app/quizzes/QuizHomeClient.jsx) uses isBusinessNewsHubQuiz()
// to keep the WHOLE hub out of the "Newest" column and out of the Business
// tile's 6-row preview. They still appear under "Business > View all". Keeping
// the predicate here (rather than in the client component) lets both the hub and
// the home page share one definition so the two can never drift apart.
import { COMPANY_META } from '@/lib/company-quiz-meta';

export const BN_NEWS_RE = /^(daily-market-news|daily-business|weekly-business|earnings-reporter)/;
export const BN_EARN_RE = /-\dq\d\d-earnings-quiz$/i;

// Thematic (sector) quizzes shown in the hub's right-hand column. Display
// metadata lives here so the hub and the home-page predicate share one list.
export const SECTOR_META = {
  'restaurant-sector-update': { name: 'Restaurants', emoji: '🍽️', sub: 'Earnings, closures & consumer trends', date: 'June 2026' },
  'saas-sector-update': { name: 'Software', emoji: '☁️', sub: 'The software selloff & AI disruption', date: 'June 2026' },
  'housing-sector-update': { name: 'Housing', emoji: '🏠', sub: 'Starts, rates & homebuilder pain', date: 'June 2026' },
  'quantum-sector-update': { name: 'Quantum Computing', emoji: '⚛️', sub: 'Quantum stocks, milestones & hype', date: 'June 2026' },
};

export function isBusinessNewsHubQuiz(id) {
  if (!id) return false;
  return BN_NEWS_RE.test(id) || BN_EARN_RE.test(id) || !!SECTOR_META[id] || !!COMPANY_META[id];
}
