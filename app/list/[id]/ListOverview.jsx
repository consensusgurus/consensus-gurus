'use client';
import React from 'react';
import { MapPin, Globe, Camera, ChevronDown, ArrowLeft } from 'lucide-react';
import { COLORS } from '@/lib/data';
import { DESCRIPTIONS } from '@/lib/descriptions';
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

// Build Map / Website / Yelp / TripAdvisor links for one item.
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
  const pick = (map) => (map && (map[name] || map[base])) || null;
  return {
    map: buildItemLink(name, list),
    website: pick(list.itemLinks),
    yelp: pick(list.itemYelp),
    tripadvisor: pick(list.itemTripadvisor),
  };
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

// Photo placeholder (shown until real heroImages are wired up).
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
        }}
      >
        Photo
      </span>
    </div>
  );
}

// Full-width hero tile (used for ranks 1, 2, 3).
function HeroTile({ item, rank, list, desc, first }) {
  const { displayName, locality } = parseItem(item);
  const links = buildLinks(item, list);
  const medal = MEDAL_COLORS[rank - 1];

  return (
    <div
      className="lov-hero"
      style={{
        gridColumn: 'span 2',
        display: 'grid',
        gridTemplateColumns: 'clamp(160px, 30%, 240px) 1fr',
        border: `1.5px solid ${COLORS.ink}`,
        borderTop: first ? `1.5px solid ${COLORS.ink}` : 'none',
        background: '#ebe2d0',
      }}
    >
      <PhotoBox />
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
          {desc && (
            <p
              style={{
                fontSize: 12,
                color: '#5a5045',
                lineHeight: 1.55,
                margin: '0 0 4px',
              }}
            >
              {desc}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href={links.map} target="_blank" rel="noopener noreferrer" style={linkBtn(true)}>
            <MapPin size={9} strokeWidth={2} /> Map
          </a>
          {links.website && (
            <a href={links.website} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
              <Globe size={9} strokeWidth={2} /> Website
            </a>
          )}
          {links.yelp && (
            <a href={links.yelp} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
              Yelp
            </a>
          )}
          {links.tripadvisor && (
            <a href={links.tripadvisor} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
              TripAdvisor
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Small tile used for ranks 4-9.
function SmallTile({ item, rank, list, desc, rightCol }) {
  const { displayName, locality } = parseItem(item);
  const links = buildLinks(item, list);

  return (
    <div
      style={{
        background: '#ebe2d0',
        border: `1.5px solid ${COLORS.ink}`,
        borderTop: 'none',
        borderLeft: rightCol ? 'none' : `1.5px solid ${COLORS.ink}`,
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
      {desc && (
        <p
          style={{
            fontSize: 11,
            color: '#5a5045',
            lineHeight: 1.5,
            margin: '0 0 10px',
            flex: 1,
          }}
        >
          {desc}
        </p>
      )}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 10 }}>
        <a href={links.map} target="_blank" rel="noopener noreferrer" style={linkBtn(true)}>
          <MapPin size={9} strokeWidth={2} /> Map
        </a>
        {links.website && (
          <a href={links.website} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
            <Globe size={9} strokeWidth={2} /> Site
          </a>
        )}
        {links.yelp && (
          <a href={links.yelp} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
            Yelp
          </a>
        )}
        {links.tripadvisor && (
          <a href={links.tripadvisor} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
            TripAdvisor
          </a>
        )}
      </div>
    </div>
  );
}

// Compact single-row bar used for rank 10.
function CompactTile({ item, rank, list }) {
  const { displayName, locality } = parseItem(item);
  const links = buildLinks(item, list);

  return (
    <div
      style={{
        gridColumn: 'span 2',
        background: '#ebe2d0',
        border: `1.5px solid ${COLORS.ink}`,
        borderTop: 'none',
        padding: '13px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 10, fontWeight: 600, color: COLORS.faded }}>
            {rank}
          </span>
        </div>
        <span
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 16,
            fontWeight: 700,
            fontVariationSettings: '"SOFT" 100',
            color: COLORS.ink,
          }}
        >
          {displayName}
        </span>
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
      <div style={{ display: 'flex', gap: 7 }}>
        <a href={links.map} target="_blank" rel="noopener noreferrer" style={linkBtn(true)}>
          <MapPin size={9} strokeWidth={2} /> Map
        </a>
        {links.website && (
          <a href={links.website} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
            <Globe size={9} strokeWidth={2} /> Site
          </a>
        )}
        {links.yelp && (
          <a href={links.yelp} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
            Yelp
          </a>
        )}
        {links.tripadvisor && (
          <a href={links.tripadvisor} target="_blank" rel="noopener noreferrer" style={linkBtn(false)}>
            TripAdvisor
          </a>
        )}
      </div>
    </div>
  );
}

export default function ListOverview({ list, voteData, extras, onBack }) {
  const items = getItems(list, voteData, extras);
  const descs = DESCRIPTIONS[list.id] || {};

  if (!items.length) return null;

  const heroItems = items.slice(0, 3);
  const gridItems = items.slice(3, 9);
  const tenthItem = items[9];

  function scrollToRankings() {
    document.getElementById('lov-rankings')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div style={{ position: 'relative', zIndex: 2, background: COLORS.cream }}>
      <style>{`
        .lov-grid{display:grid;grid-template-columns:1fr 1fr;}
        @media(max-width:700px){
          .lov-grid{grid-template-columns:1fr;}
          .lov-grid>div{grid-column:auto !important;border-left:1.5px solid ${COLORS.ink} !important;}
          .lov-hero{grid-template-columns:1fr !important;}
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 0' }}>
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
              fontSize: 'clamp(30px, 5vw, 54px)',
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

        {/* 2-column grid container */}
        <div className="lov-grid" style={{ marginTop: 26 }}>
        {/* Ranks 1-3: full-width hero tiles */}
        {heroItems.map((item, i) => (
          <HeroTile
            key={item}
            item={item}
            rank={i + 1}
            list={list}
            desc={descs[item]}
            first={i === 0}
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
            rightCol={i % 2 === 1}
          />
        ))}

        {/* Rank 10: compact bar */}
        {tenthItem && (
          <CompactTile item={tenthItem} rank={10} list={list} />
        )}
      </div>

      {/* CTA */}
      <div
        style={{
          padding: '26px 0 34px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={scrollToRankings}
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
          Full Rankings, Source Detail &amp; Voting
          <ChevronDown size={13} strokeWidth={2.5} />
        </button>
      </div>
      </div>
    </div>
  );
}
