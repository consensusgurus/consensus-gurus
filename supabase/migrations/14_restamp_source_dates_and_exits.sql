-- 14: Activity ledger fixes. Run in the Supabase SQL Editor.
--
-- (a) Restamp list_sources_seen.first_seen_at for sources that were added
-- well after launch but got launch-anchored by the stamping feature's first
-- run (June 7 2026 backfill artifact: caa9bd0 shipped after these sources
-- were deployed, so its first sighting anchored them to each list's publish
-- date). Timestamps below are the real deploy commit times, so the feed can
-- attribute the ranking changes these sources caused.
--
-- (b) Widen the consensus_alerts change_type check to allow exit events
-- (exited_top10 / exited_top3), recorded by the cron from this deploy on.

-- (a) restamps ---------------------------------------------------------------

-- 12-batch rating backfill (June 6)
update list_sources_seen set first_seen_at = '2026-06-06T16:41:35Z' where list_id='pizza-new-haven' and source_id in ('portnoy','yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T17:01:02Z' where list_id='pizza-chicago' and source_id in ('portnoy','yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T17:27:05Z' where list_id='hot-dogs-chicago' and source_id in ('yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T17:34:50Z' where list_id='italian-beef-chicago' and source_id in ('yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T17:43:24Z' where list_id='cheesesteaks-philadelphia' and source_id in ('yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T17:50:19Z' where list_id='bbq-austin' and source_id in ('yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T18:01:31Z' where list_id='bbq-texas' and source_id in ('yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T18:07:50Z' where list_id='po-boys-new-orleans' and source_id in ('yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T18:17:38Z' where list_id='dive-bars-new-orleans' and source_id in ('yelp','google');
update list_sources_seen set first_seen_at = '2026-06-06T18:59:56Z' where list_id='beach-clubs-greece' and source_id = 'google';
update list_sources_seen set first_seen_at = '2026-06-06T23:08:55Z' where list_id='beach-clubs-greece' and source_id = 'tripadvisor';

-- caesar-wraps rebuilds + hamptons breakfast rebuild
update list_sources_seen set first_seen_at = '2026-06-06T12:02:32Z' where list_id='caesar-wraps-chicago' and source_id = 'google';
update list_sources_seen set first_seen_at = '2026-06-06T12:18:39Z' where list_id='caesar-wraps-nyc' and source_id = 'google';
update list_sources_seen set first_seen_at = '2026-06-05T19:00:32Z' where list_id='breakfast-sandwiches-hamptons' and source_id = 'google';

-- historical fiction editorial+Amazon additions (June 6, 04:49 UTC)
update list_sources_seen set first_seen_at = '2026-06-06T04:49:44Z' where list_id='historical-fiction-female-protagonist' and source_id in ('readersdigest');
update list_sources_seen set first_seen_at = '2026-06-06T04:49:44Z' where list_id='historical-fiction-pre-internet' and source_id in ('greatestbooks','readersdigest');
update list_sources_seen set first_seen_at = '2026-06-06T04:49:44Z' where list_id='historical-fiction-1980s' and source_id in ('greatestbooks','amazonreviews');
update list_sources_seen set first_seen_at = '2026-06-06T04:49:44Z' where list_id='historical-fiction-1990s' and source_id in ('greatestbooks','readersdigest','amazonreviews');
update list_sources_seen set first_seen_at = '2026-06-06T04:49:44Z' where list_id='historical-fiction-2000s' and source_id in ('greatestbooks','readersdigest','amazonreviews');
update list_sources_seen set first_seen_at = '2026-06-06T04:49:44Z' where list_id='historical-fiction-2010s' and source_id in ('greatestbooks','readersdigest','amazonreviews');

-- brewery TripAdvisor/Google backfills + Boston bars (June 7, 00:58-03:21 UTC)
update list_sources_seen set first_seen_at = '2026-06-07T00:58:13Z' where list_id='best-breweries-atlanta' and source_id = 'tripadvisor';
update list_sources_seen set first_seen_at = '2026-06-07T01:08:40Z' where list_id='best-breweries-austin' and source_id in ('google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T01:19:27Z' where list_id='best-breweries-miami' and source_id in ('google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T01:46:44Z' where list_id='best-breweries-dallas' and source_id in ('google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T01:53:26Z' where list_id='breweries-denver' and source_id in ('google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T02:02:58Z' where list_id='breweries-chicago' and source_id in ('google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T02:09:47Z' where list_id='breweries-charlotte' and source_id in ('google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T02:18:30Z' where list_id='breweries-orlando' and source_id in ('google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T02:24:34Z' where list_id='breweries-washington-dc' and source_id in ('google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T03:00:05Z' where list_id='best-breweries-nyc-subway' and source_id in ('yelp','google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T03:11:10Z' where list_id='breweries-day-trip-boston' and source_id in ('yelp','google','tripadvisor');
update list_sources_seen set first_seen_at = '2026-06-07T03:21:33Z' where list_id='cocktail-bars-boston' and source_id in ('yelp','google');

-- (b) allow exit events ------------------------------------------------------

alter table consensus_alerts drop constraint if exists consensus_alerts_change_type_check;
alter table consensus_alerts add constraint consensus_alerts_change_type_check
  check (change_type in ('entered_top10','entered_top3','exited_top10','exited_top3'));
