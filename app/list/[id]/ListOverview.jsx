'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Globe, Camera, ArrowRight, ArrowLeft, Eye, PenLine, Share2, ShoppingBag, ExternalLink } from 'lucide-react';
import { COLORS } from '@/lib/data';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { HERO_IMAGES } from '@/lib/hero-images';
import { getSources, buildItemLink } from '@/lib/helpers';

// Splits "Name (Locality)" into { displayName, locality }.
function parseItem(fullName) {
  const m = fullName.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (m) return { displayName: m[1].trim(), locality: m[2].trim() };
  return { displayName: fullName, locality: null };
}

// Categories that are generic labels, not real place names.
const GENERIC_CATEGORIES = new Set([
  'travel', 'tech', 'product', 'products', 'entertainment',
  'other', 'food', 'food-drink', 'stores', 'nightlife', 'bars', 'luxury',
]);

// Build Map / Website / Yelp / Google-pics / TripAdvisor links for one item.
// Mirrors buildAuxLinks in DetailClient: Yelp/TripAdvisor only when a real
// business-page URL is stored; Google is always an image search (picsTerm-aware).
function buildLinks(name, list) {
  const m = name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  const base = m ? m[1].trim() : name;
  const locality = m ? m[2].trim() : '';
  const cat = (list.category || '').trim();
  const anchor = cat && !GENERIC_CATEGORIES.has(cat.toLowerCase()) ? cat : '';
  let loc = locality;
  if (anchor) {
    if (!loc) loc = anchor;
    else if (!loc.toLowerCase().includes(anchor.toLowerCase())) loc = `${loc}, ${anchor}`;
  }
  const picsTerm = (list.picsTerm || '').trim();
  const gq = encodeURIComponent((base + ' ' + loc + ' ' + picsTerm).replace(/\s+/g, ' ').trim());
  const pick = (map) => (map && (map[name] || map[base])) || null;
  return {
    map: buildItemLink(name, list),
    website: pick(list.itemLinks),
    yelp: pick(list.itemYelp),
    google: `https://www.google.com/search?q=${gq}&tbm=isch`,
    tripadvisor: pick(list.itemTripadvisor),
  };
}

// Per-category "pics" convention — mirrors entryPicsConfig in DetailClient.
function picsConfig(list) {
  const tags = list.tags || [];
  const type = list.type || '';
  // Breweries are drink-first: plain "Pics:", never "Food Pics:".
  const isBrewery = `${list.title || ''} ${list.id || ''}`.toLowerCase().includes('brewer');
  if (isBrewery) return { label: 'Pics:', links: [['yelp', 'Yelp'], ['google', 'Google']] };
  const isFood = type === 'food' || tags.includes('food') || tags.includes('food-drink');
  const isBar = tags.includes('bars') || tags.includes('nightlife');
  const isHotel = !isFood && !isBar && (type === 'travel' || tags.includes('travel') || tags.includes('luxury'));
  if (isFood) return { label: 'Food Pics:', links: [['yelp', 'Yelp'], ['google', 'Google']] };
  if (isBar) return { label: 'Pics:', links: [['yelp', 'Yelp'], ['google', 'Google']] };
  if (isHotel) return { label: 'Pics:', links: [['tripadvisor', 'TripAdvisor'], ['google', 'Google']] };
  return { label: 'Food Pics:', links: [['yelp', 'Yelp'], ['google', 'Google']] };
}

// Derive top-10 consensus items depending on list mode.
function getItems(list, voteData, extras) {
  const mode = list.mode || 'both';
  if (mode === 'facts' || mode === 'scores' || mode === 'unranked') {
    return (list.sources?.ai?.items || []).slice(0, 10);
  }
  if (mode === 'votes') {
    return (list.vote?.items || []).slice(0, 10);
  }
  const sources = getSources(list, voteData, extras);
  const consensus = sources.find((s) => s.id === 'consensus');
  return (consensus?.items || list.sources?.ai?.items || []).slice(0, 10);
}

const MEDAL_COLORS = [
  { bg: '#c9a227', text: '#f4ede0' },
  { bg: '#9ca3a8', text: '#f4ede0' },
  { bg: '#a9743f', text: '#f4ede0' },
];

// Shared link button style.
function linkBtn(primary) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontFamily: 'DM Mono, monospace',
    fontSize: 8,
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
    padding: '5px 10px',
    border: `1px solid ${COLORS.ink}`,
    background: primary ? COLORS.ink : 'transparent',
    color: primary ? COLORS.cream : COLORS.ink,
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}

// Homepage-style tile chrome: own border, paper background, small gaps between.
const tileChrome = {
  background: COLORS.paper,
  border: `1.5px solid ${COLORS.ink}`,
};

// Map(or Shop) / Website / pics chip row shared by all tile sizes. Location
// lists get Map + pics; product and other non-place lists get a single
// Shop/View link with no map and no pics.
function LinkRow({ links, pics, websiteLabel, list }) {
  const isPlace = (list.linkType || 'mapsCity') === 'mapsCity';
  const primaryLabel = isPlace ? 'Map' : list.linkType === 'amazon' ? 'Purchase' : 'View';
  const PrimaryIcon = isPlace ? MapPin : list.linkType === 'amazon' ? ShoppingBag : ExternalLink;
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
      <a href={links.map} target="_blank" rel={isPlace ? 'noopener noreferrer' : 'noopener noreferrer sponsored'} style={linkBtn(true)}>
        <PrimaryIcon size={9} strokeWidth={2} /> {primaryLabel}
      </a>
      {links.website && (
        <a href={links.website} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
          <Globe size={9} strokeWidth={2} /> {websiteLabel}
        </a>
      )}
      {/* Pics only make sense for places. Label + its chips wrap together as
          one unit so the association survives line breaks on mobile. */}
      {isPlace && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginLeft: 4, whiteSpace: 'nowrap' }}>
          <span
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 8,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: COLORS.faded,
            }}
          >
            {pics.label}
          </span>
          {pics.links.map(([key, label]) =>
            links[key] ? (
              <a key={key} href={links[key]} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
                {label}
              </a>
            ) : null
          )}
        </span>
      )}
    </div>
  );
}

// Photo placeholder (shown until real heroImages are wired up).
// Optimized hero photo. Lazy-loaded, async-decoded WebP: the browser only
// fetches and decodes it when the tile nears the viewport, so memory and
// bandwidth cost stay minimal. Falls back to PhotoBox if the file 404s.
function HeroPhoto({ photo, alt }) {
  const [failed, setFailed] = useState(false);
  const src = typeof photo === 'string' ? photo : photo?.src;
  const credit = photo && typeof photo === 'object' ? photo.credit : null;
  const creditUrl = photo && typeof photo === 'object' ? photo.creditUrl : null;
  if (!src || failed) return <PhotoBox />;
  return (
    <div style={{ position: 'relative', minHeight: 200, flexShrink: 0, overflow: 'hidden' }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 700px) 100vw, 240px"
        onError={() => setFailed(true)}
        style={{ objectFit: 'cover' }}
      />
      {credit && (
        <a
          href={creditUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            zIndex: 1,
            fontFamily: 'DM Mono, monospace',
            fontSize: 7,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(244,237,224,0.92)',
            background: 'rgba(26,22,17,0.55)',
            padding: '3px 7px',
            textDecoration: 'none',
            pointerEvents: creditUrl ? 'auto' : 'none',
          }}
        >
          Photo: {credit}
        </a>
      )}
    </div>
  );
}

function PhotoBox({ style }) {
  return (
    <div
      style={{
        background: '#d4c9b3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200,
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(154,142,122,0.18) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(154,142,122,0.18) 1px, transparent 1px)',
          backgroundSize: '25% 25%',
        }}
      />
      <Camera size={26} color="#9a8e7a" style={{ position: 'relative', zIndex: 1 }} strokeWidth={1.5} />
      <span
        style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 8,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#9a8e7a',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '0 12px',
        }}
      >
        Curating a Fancy Photo
      </span>
    </div>
  );
}

// Full-width hero tile (used for ranks 1, 2, 3).
function HeroTile({ item, rank, list, desc, pics }) {
  const { displayName, locality } = parseItem(item);
  const links = buildLinks(item, list);
  const medal = MEDAL_COLORS[rank - 1];
  const heroSrc = (HERO_IMAGES[list.id] || {})[item];

  return (
    <div
      className="lov-hero"
      style={{
        gridColumn: 'span 2',
        display: 'grid',
        gridTemplateColumns: 'clamp(160px, 30%, 240px) 1fr',
        ...tileChrome,
      }}
    >
      {heroSrc ? <HeroPhoto photo={heroSrc} alt={displayName} /> : <PhotoBox />}
      <div
        style={{
          padding: '20px 22px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: medal.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 11,
                  fontWeight: 600,
                  color: medal.text,
                }}
              >
                {rank}
              </span>
            </div>
            {locality && (
              <span
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: COLORS.faded,
                }}
              >
                {locality}
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.15,
              margin: '0 0 8px',
              fontVariationSettings: '"SOFT" 100',
              color: COLORS.ink,
            }}
          >
            {displayName}
          </p>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14,
              color: desc ? '#5a5045' : COLORS.faded,
              fontStyle: desc ? 'normal' : 'italic',
              lineHeight: 1.55,
              margin: '0 0 4px',
            }}
          >
            {desc || 'Wordsmithing a perfect description'}
          </p>
        </div>
        <LinkRow links={links} pics={pics} websiteLabel="Website" list={list} />
      </div>
    </div>
  );
}

// Small tile used for ranks 4-9.
function SmallTile({ item, rank, list, desc, pics }) {
  const { displayName, locality } = parseItem(item);
  const links = buildLinks(item, list);

  return (
    <div
      style={{
        ...tileChrome,
        padding: '16px 18px 14px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div
          style={{
            width: 22,
            height: 22,
            border: `1.5px solid ${COLORS.faded}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 10,
              fontWeight: 600,
              color: COLORS.faded,
            }}
          >
            {rank}
          </span>
        </div>
        {locality && (
          <span
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 8,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: COLORS.faded,
            }}
          >
            {locality}
          </span>
        )}
      </div>
      <p
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.2,
          margin: '0 0 6px',
          fontVariationSettings: '"SOFT" 100',
          color: COLORS.ink,
        }}
      >
        {displayName}
      </p>
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 14,
          color: desc ? '#5a5045' : COLORS.faded,
          fontStyle: desc ? 'normal' : 'italic',
          lineHeight: 1.5,
          margin: '0 0 10px',
          flex: 1,
        }}
      >
        {desc || 'Wordsmithing a perfect description'}
      </p>
      <div style={{ marginTop: 'auto', paddingTop: 10 }}>
        <LinkRow links={links} pics={pics} websiteLabel="Site" list={list} />
      </div>
    </div>
  );
}

export default function ListOverview({ list, voteData, extras, viewCount, onBack, onOpenRankings, onOpenSources, onOpenVote }) {
  const items = getItems(list, voteData, extras);
  const descs = DESCRIPTIONS[list.id] || {};
  const pics = picsConfig(list);
  const mode = list.mode || 'both';
  const showVote = mode !== 'facts' && mode !== 'scores' && mode !== 'unranked';

  // "Speak With The Manager" complaint modal (same as the rankings page).
  const [complainOpen, setComplainOpen] = useState(false);
  const [complainMsg, setComplainMsg] = useState('');
  const [complainName, setComplainName] = useState('');
  const [complainEmail, setComplainEmail] = useState('');
  const [complainSent, setComplainSent] = useState(false);
  const [complainBusy, setComplainBusy] = useState(false);

  async function submitComplaint() {
    if (complainBusy) return;
    setComplainBusy(true);
    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: list.id, listTitle: list.title, message: complainMsg.trim(), name: complainName.trim(), email: complainEmail.trim() }),
      });
    } catch (e) {
      // swallow — we still acknowledge the request to the reader
    }
    setComplainSent(true);
    setComplainBusy(false);
  }

  if (!items.length) return null;

  const heroItems = items.slice(0, 3);
  const gridItems = items.slice(3, 9);
  const tenthItem = items[9];

  return (
    <div style={{ position: 'relative', zIndex: 2, background: COLORS.cream }}>
      <style>{`
        .lov-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        @media(max-width:700px){
          .lov-grid{grid-template-columns:1fr;}
          .lov-grid>div{grid-column:auto !important;}
          .lov-hero{grid-template-columns:1fr !important;}
          .lov-tenth{width:100% !important;min-width:0 !important;}
        }
      `}</style>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 20px 0' }}>
        {/* Condensed header */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.ink,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 0 14px',
            }}
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            Back to all lists
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 28px)' }}>
          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 800,
              fontSize: 'clamp(30px, 5vw, 50px)',
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              margin: 0,
              color: COLORS.ink,
              fontVariationSettings: '"SOFT" 100',
            }}
          >
            {list.title}
          </h1>
          <div style={{ flex: 1, minWidth: 120, marginBottom: 6 }}>
            <div
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 'clamp(9px, 1.1vw, 11px)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: COLORS.ember,
                textAlign: 'right',
                marginBottom: 8,
              }}
            >
              {list.category} · Top Ten
            </div>
            <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
            <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
          </div>
        </div>
        {list.blurb && (
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 16,
              lineHeight: 1.45,
              margin: '12px 0 0',
              color: COLORS.faded,
              maxWidth: 640,
            }}
          >
            {list.blurb}
          </p>
        )}

        {/* Meta row: visitors + manager/share (matches the rankings page) */}
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.faded,
            }}
          >
            <Eye size={11} strokeWidth={2} />
            <span>{viewCount} visitors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={onOpenSources}
              style={{
                background: 'transparent',
                color: COLORS.ember,
                border: `1.5px solid ${COLORS.ember}`,
                padding: '8px 14px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Consensus Sources
            </button>
            {showVote && (
              <button
                onClick={onOpenVote}
                style={{
                  background: 'transparent',
                  color: COLORS.ember,
                  border: `1.5px solid ${COLORS.ember}`,
                  padding: '8px 14px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Vote
              </button>
            )}
            <button
              onClick={() => { setComplainSent(false); setComplainOpen(true); }}
              style={{
                background: 'transparent',
                color: COLORS.ink,
                border: `1.5px solid ${COLORS.ink}`,
                padding: '8px 14px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <PenLine size={12} strokeWidth={2.5} />
              Speak With The Manager
            </button>
            <a
              href={`/snapshot/${encodeURIComponent(list.id)}`}
              style={{
                background: 'transparent',
                color: COLORS.ink,
                border: `1.5px solid ${COLORS.ink}`,
                padding: '8px 14px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
              }}
            >
              <Share2 size={12} strokeWidth={2.5} />
              Share
            </a>
          </div>
        </div>

        {/* Tiled grid (homepage aesthetic: own borders, small gaps) */}
        <div className="lov-grid" style={{ marginTop: 26 }}>
          {/* Ranks 1-3: full-width hero tiles */}
          {heroItems.map((item, i) => (
            <HeroTile
              key={item}
              item={item}
              rank={i + 1}
              list={list}
              desc={descs[item]}
              pics={pics}
            />
          ))}

          {/* Ranks 4-9: 2-column small tiles */}
          {gridItems.map((item, i) => (
            <SmallTile
              key={item}
              item={item}
              rank={i + 4}
              list={list}
              desc={descs[item]}
              pics={pics}
            />
          ))}

          {/* Rank 10: same tile as 4-9, centered on its own row */}
          {tenthItem && (
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center' }}>
              <div className="lov-tenth" style={{ width: 'calc(50% - 7px)', minWidth: 'min(100%, 300px)' }}>
                <SmallTile item={tenthItem} rank={10} list={list} desc={descs[tenthItem]} pics={pics} />
              </div>
            </div>
          )}
        </div>

        {/* CTA to the full rankings page */}
        <div
          style={{
            padding: '26px 0 34px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onOpenRankings}
            style={{
              background: COLORS.ink,
              color: COLORS.cream,
              border: `1.5px solid ${COLORS.ink}`,
              padding: '13px 32px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: `3px 3px 0 ${COLORS.ember}`,
            }}
          >
            Source Detail &amp; Voting
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {complainOpen && (
        <div
          onClick={() => setComplainOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(26,22,17,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6vh 16px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: COLORS.cream, border: `2px solid ${COLORS.ink}`, padding: 24 }}>
            {complainSent ? (
              <>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, margin: '0 0 10px' }}>Thanks — noted.</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: COLORS.faded, margin: '0 0 20px' }}>
                  Your note went to the editors' desk. Flagged lists get re-researched.
                </p>
                <button
                  onClick={() => { setComplainOpen(false); setComplainSent(false); setComplainMsg(''); setComplainName(''); setComplainEmail(''); }}
                  style={{ cursor: 'pointer', background: COLORS.ink, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '12px 20px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>Comments? Questions?</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.faded, margin: '0 0 14px' }}>
                  Think this list is wrong or stale? Tell the editors what to re-research.
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={complainName}
                    onChange={(e) => setComplainName(e.target.value)}
                    maxLength={120}
                    placeholder="Name (optional)"
                    style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none' }}
                  />
                  <input
                    type="email"
                    value={complainEmail}
                    onChange={(e) => setComplainEmail(e.target.value)}
                    maxLength={200}
                    placeholder="Email (optional)"
                    style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none' }}
                  />
                </div>
                <textarea
                  value={complainMsg}
                  onChange={(e) => setComplainMsg(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="What's off about this list? (optional)"
                  style={{ width: '100%', boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none', resize: 'vertical', marginBottom: 16 }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setComplainOpen(false)}
                    style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '10px 18px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitComplaint}
                    disabled={complainBusy}
                    style={{ cursor: 'pointer', background: COLORS.rust, color: COLORS.cream, border: `1.5px solid ${COLORS.rust}`, padding: '10px 18px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, opacity: complainBusy ? 0.6 : 1 }}
                  >
                    {complainBusy ? 'Sending…' : 'Send to editors'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
