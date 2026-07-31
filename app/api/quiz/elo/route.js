// Legacy alias: Elo was retired 2026-07-08 in favor of additive XP. This path
// keeps pre-deploy client bundles working; new code calls /api/quiz/xp.
export { GET } from '../xp/route';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
