import { permanentRedirect } from 'next/navigation';

// The standalone rankings page was folded into the main list page: chips for
// Consensus / Consensus Sources / Activity Ledger / Vote now switch content
// in place on /list/[id]. Old /rankings links redirect there; the #sources
// and #vote hash fragments survive the redirect client-side, so deep links
// still open the right tab.
export default function ListRankingsPage({ params }) {
  permanentRedirect(`/list/${params.id}`);
}
