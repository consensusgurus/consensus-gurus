'use client';
import React from 'react';
import { getSources } from '@/lib/helpers';
import { T } from '@/lib/theme';

const C = { ink: T.ink, muted: T.muted, soft: T.muted, line: 'rgba(20,22,28,0.30)', accent: T.accent, bg: T.white, live: T.success };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const CROWD = /yelp|google|tripadvisor|amazon|beeradvocate|untappd|tabelog|openrice|naver|wongnai|zomato|foody|yandex|thefork|goodreads|imdb|rotten/i;
function isCrowd(p) { return CROWD.test(p.id || '') || CROWD.test(p.label || ''); }
function srcType(p) {
  if (isCrowd(p)) return 'Crowd · rating';
  if (p.unordered) return 'Expert · unordered';
  if (p.decisiveExpert) return 'Expert · decisive';
  if (p.trueExpert) return 'Expert · anchor';
  return 'Expert · ordered';
}

function consensusData(list, extras) {
  const sources = getSources(list, {}, extras, { limit: Infinity });
  const consensus = sources.find((s) => s.id === 'consensus');
  const publications = sources.filter((s) => s.id !== 'consensus');
  const items = (consensus && consensus.items) || [];
  return { publications, items };
}

export function SourcesPanel({ list, extras }) {
  const { publications, items } = consensusData(list, extras);
  const total = items.length || 1;
  const crowd = publications.filter(isCrowd).length;
  const expert = publications.length - crowd;
  const coverage = (p) => {
    const keys = new Set((p.items || []).map((i) => i.toLowerCase().trim()));
    return items.filter((it) => keys.has(it.toLowerCase().trim())).length;
  };
  const Metric = ({ label, value }) => (
    <div style={{ background: C.bg, borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.muted }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 800, marginTop: 2 }}>{value}</div>
    </div>
  );
  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        <Metric label="Sources weighed" value={publications.length} />
        <Metric label="Expert sources" value={expert} />
        <Metric label="Crowd sources" value={crowd} />
        <Metric label="Ranked entries" value={items.length} />
      </div>
      <div style={{ background: T.white, border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, padding: '9px 14px', borderBottom: `1px solid ${C.line}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.muted }}>
          <span>Source</span><span>Type</span><span style={{ textAlign: 'right' }}>Coverage</span>
        </div>
        {publications.map((p) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, padding: '10px 14px', borderTop: `1px solid ${C.line}`, fontSize: 12.5, alignItems: 'center' }}>
            <span style={{ fontWeight: 600, minWidth: 0 }}>{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: C.ink, textDecoration: 'none', borderBottom: `1px solid ${C.line}` }}>{p.label}</a> : p.label}</span>
            <span style={{ color: C.muted }}>{srcType(p)}</span>
            <span style={{ textAlign: 'right', color: C.accent, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{coverage(p)} of {total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MethodologyPanel({ list, extras }) {
  const { publications, items } = consensusData(list, extras);
  const Rule = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderTop: `1px solid ${C.line}`, fontSize: 13, lineHeight: 1.5 }}>
      <span style={{ color: C.live, fontWeight: 800, flex: 'none' }}>✓</span><span>{children}</span>
    </div>
  );
  const card = { background: T.white, border: `1px solid ${C.line}`, borderRadius: 12, padding: '15px 17px' };
  return (
    <div style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>How the ranking is built</div>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 12px' }}>
          Every source that ranks this category casts a weighted ballot. Each ballot is converted to Borda points — 10 for a source's #1, 9 for #2, down to 1 for #10 — then scaled by the source's weight before everything is summed per entry and sorted. The displayed 0–100 figure is each entry's total relative to the field leader.
        </p>
        <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: '13px 15px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13, lineHeight: 1.9 }}>
          pts = 11 − rank&nbsp;&nbsp;(rank 1–10; 0 otherwise)<br />
          Score = Σ ( weight × pts )
        </div>
      </div>
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Weighting &amp; rules</div>
        <Rule>A <b>decisive expert</b> (e.g. Michelin stars) outweighs the rest of the field combined; a <b>true-expert anchor</b> counts for about half the field.</Rule>
        <Rule>Ordered expert guides beat <b>unordered roundups</b>, which contribute equal flat points to every entry they list.</Rule>
        <Rule>Crowd rating platforms (Yelp, Google, TripAdvisor) are folded in and break ties by rating, then review count.</Rule>
        <Rule>Sources with fewer than three picks are dropped; the consensus is re-scored whenever a source is added or refreshed.</Rule>
      </div>
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>This list</div>
        <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.7, margin: 0 }}>
          {items.length} entries ranked across {publications.length} weighted sources{publications.length ? ` — ${publications.slice(0, 4).map((p) => p.label).join(', ')}${publications.length > 4 ? ', and more' : ''}` : ''}.
        </p>
      </div>
    </div>
  );
}
