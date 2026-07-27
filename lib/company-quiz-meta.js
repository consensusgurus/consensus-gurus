// Shared registry for company-specific (earnings) business-news quizzes. Used by
// the Business News hub (favicon + ticker chip) AND the share-image routes (the
// favicon baked into a company quiz's share card). Add a company here to wire
// both at once; the domain powers the Google favicon, the ticker is the chip.
export const COMPANY_META = {
  'micron-lightning-50': { ticker: 'MU', name: 'Micron', domain: 'micron.com' },
  'fedex-2q26-earnings-quiz': { ticker: 'FDX', name: 'FedEx', domain: 'fedex.com' },
  'tripcom-2q26-earnings-quiz': { ticker: 'TCOM', name: 'Trip.com', domain: 'trip.com' },
  'blackberry-2q26-earnings-quiz': { ticker: 'BB', name: 'BlackBerry', domain: 'blackberry.com' },
  'darden-2q26-earnings-quiz': { ticker: 'DRI', name: 'Darden', domain: 'darden.com' },
  'winnebago-2q26-earnings-quiz': { ticker: 'WGO', name: 'Winnebago', domain: 'winnebago.com' },
  'kbhome-2q26-earnings-quiz': { ticker: 'KBH', name: 'KB Home', domain: 'kbhome.com' },
  'nike-2q26-earnings-quiz': { ticker: 'NKE', name: 'Nike', domain: 'nike.com' },
  'delta-2q26-earnings-quiz': { ticker: 'DAL', name: 'Delta', domain: 'delta.com' },
  'netflix-2q26-earnings-quiz': { ticker: 'NFLX', name: 'Netflix', domain: 'netflix.com' },
  'tesla-2q26-earnings-quiz': { ticker: 'TSLA', name: 'Tesla', domain: 'tesla.com' },
  'alphabet-2q26-earnings-quiz': { ticker: 'GOOGL', name: 'Alphabet', domain: 'abc.xyz' },
  'intel-2q26-earnings-quiz': { ticker: 'INTC', name: 'Intel', domain: 'intel.com' },
  'paypal-2q26-earnings-quiz': { ticker: 'PYPL', name: 'PayPal', domain: 'paypal.com' },
};

// Favicon domain for a company quiz id, or null if it is not a registered company quiz.
export function companyDomainForQuiz(id) {
  const m = COMPANY_META[id];
  return m ? m.domain : null;
}
