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

// The host readers SHARE and see printed on Mind Loft share cards. The public face of the
// rebrand moved ahead of the SEO cutover: mindloftdaily.com already serves the app and every
// daily game's share text points at it, so referral links, campaign links, and the quiz /
// player card footers use this while SITE_URL above stays canonical until the redirect exists.
// At cutover the two become the same value and this one can be collapsed into SITE_URL.
// NOT for the Source of Truths list posters, which keep the old host with the old brand.
export const SHARE_URL = 'https://mindloftdaily.com';
export const SHARE_HOST = SHARE_URL.replace(/^https?:\/\//, '');
