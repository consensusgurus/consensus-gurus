// The canonical origin, in ONE place.
//
// Three things must always agree about which host is canonical: the sitemap, robots.txt,
// and metadataBase (which every page's alternates.canonical resolves against). If they
// disagree even briefly, Google sees a site that points at two different homes and the
// Change of Address filing at cutover is undermined.
//
// During the soft launch this stays sourceoftruths.com even though mindloftdaily.com serves
// the same app and carries the share URLs. That is deliberate: pages served from the new
// host emit a canonical pointing back here, so ranking keeps consolidating on the old domain
// until the redirect actually exists.
//
// AT CUTOVER: change SITE_URL to https://mindloftdaily.com in the SAME commit that sets
// MOVE_ACTIVE=1 (see middleware.js). Canonical and redirect must move together, or for the
// window between them Google is told the canonical is a URL that 308s away.
export const SITE_URL = 'https://sourceoftruths.com';
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');
