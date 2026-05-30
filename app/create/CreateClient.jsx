'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X, Download, Plus } from 'lucide-react';
import { COLORS } from '@/lib/data';

// Same gold/silver/bronze medal accents the homepage tiles use.
const RANK_MEDALS = [
  { fill: '#c9a227', num: '#8a6d12' },
  { fill: '#9ca3a8', num: '#6b7278' },
  { fill: '#a9743f', num: '#7a4f2b' },
];

const FORMATS = [
  { key: '2 × 2', cols: 2, rows: 2 },
  { key: '2 × 3', cols: 2, rows: 3 },
  { key: '3 × 2', cols: 3, rows: 2 },
  { key: '3 × 3', cols: 3, rows: 3 },
  { key: '3 × 4', cols: 3, rows: 4 },
  { key: '4 × 3', cols: 4, rows: 3 },
];

export default function CreateClient({ lists }) {
  const [format, setFormat] = useState(FORMATS[0]);
  const [tiles, setTiles] = useState(() => Array(4).fill(null));
  const [title, setTitle] = useState('');
  const [pickIndex, setPickIndex] = useState(null);
  const [query, setQuery] = useState('');
  const [downloading, setDownloading] = useState(false);
  const boardRef = useRef(null);

  function chooseFormat(f) {
    setFormat(f);
    setTiles((prev) => {
      const next = Array(f.cols * f.rows).fill(null);
      for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i] = prev[i];
      return next;
    });
  }

  function openPicker(i) {
    setPickIndex(i);
    setQuery('');
  }

  function pick(list) {
    setTiles((prev) => {
      const n = [...prev];
      n[pickIndex] = list;
      return n;
    });
    setPickIndex(null);
  }

  function clearTile() {
    setTiles((prev) => {
      const n = [...prev];
      n[pickIndex] = null;
      return n;
    });
    setPickIndex(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lists;
    return lists.filter((l) => `${l.title} ${l.category}`.toLowerCase().includes(q));
  }, [query, lists]);

  async function download() {
    if (!boardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(boardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: COLORS.cream,
      });
      const link = document.createElement('a');
      link.download = 'consensus-gurus-grid.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Download failed', e);
      alert('Could not generate image. Try a different browser or take a screenshot instead.');
    }
    setDownloading(false);
  }

  const filledCount = tiles.filter(Boolean).length;

  return (
    <div style={{ position: 'relative', zIndex: 2, maxWidth: 1040, margin: '0 auto', padding: '28px 16px 80px' }}>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: COLORS.faded,
          textDecoration: 'none',
          marginBottom: 18,
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.5} /> All lists
      </Link>

      <h1
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 900,
          fontSize: 40,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
          fontVariationSettings: '"SOFT" 100',
        }}
      >
        Create Your Own Grid
      </h1>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: COLORS.faded, margin: '0 0 28px', maxWidth: 560 }}>
        Pick a format, tap a tile to drop in a list, add a title if you like, then download a clean image to share.
      </p>

      {/* Format chips */}
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 8 }}>
        Format
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {FORMATS.map((f) => {
          const active = f.key === format.key;
          return (
            <button
              key={f.key}
              onClick={() => chooseFormat(f)}
              style={{
                cursor: 'pointer',
                fontFamily: 'DM Mono, monospace',
                fontSize: 13,
                letterSpacing: '0.12em',
                padding: '10px 18px',
                border: `1.5px solid ${COLORS.ink}`,
                background: active ? COLORS.ink : 'transparent',
                color: active ? COLORS.cream : COLORS.ink,
                transition: 'all 0.15s ease',
              }}
            >
              {f.key}
            </button>
          );
        })}
      </div>

      {/* Optional title */}
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 8 }}>
        Title (optional)
      </div>
      <input
        type="text"
        value={title}
        maxLength={60}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. My Perfect Weekend"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '14px 16px',
          background: COLORS.paper,
          border: `1.5px solid ${COLORS.ink}`,
          fontFamily: 'Fraunces, serif',
          fontSize: 18,
          color: COLORS.ink,
          outline: 'none',
          marginBottom: 28,
          fontVariationSettings: '"SOFT" 100',
        }}
      />

      {/* The board (exported) — subtle header, homepage-style tiles */}
      <div ref={boardRef} style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, padding: 26, marginBottom: 22 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'baseline',
            gap: 12,
            borderBottom: `1.5px solid ${COLORS.ink}`,
            paddingBottom: 12,
            marginBottom: 18,
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: COLORS.faded,
          }}
        >
          <span style={{ textAlign: 'left' }}>Consensus Gurus</span>
          <span
            style={{
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontFamily: 'Fraunces, serif',
              fontWeight: 900,
              fontSize: 20,
              lineHeight: 1,
              letterSpacing: '-0.01em',
              textTransform: 'none',
              color: COLORS.ink,
              fontVariationSettings: '"SOFT" 100',
            }}
          >
            {title.trim()}
          </span>
          <span style={{ textAlign: 'right' }}>Where Experts Agree</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${format.cols}, minmax(0, 1fr))`, gap: 16, alignItems: 'stretch' }}>
          {tiles.map((t, i) => (
            <button
              key={i}
              onClick={() => openPicker(i)}
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                height: '100%',
                minWidth: 0,
                minHeight: 196,
                background: t ? COLORS.paper : 'transparent',
                color: COLORS.ink,
                border: t ? `1.5px solid ${COLORS.ink}` : `1.5px dashed ${COLORS.faded}`,
                padding: 20,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: t ? 'flex-start' : 'center',
                alignItems: t ? 'stretch' : 'center',
              }}
            >
              {t ? (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.75 }}>{t.category}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 24, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 14px', fontVariationSettings: '"SOFT" 100' }}>{t.title}</h3>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>{t.label || 'Current Consensus'}</div>
                  <ol style={{ margin: 0, padding: 0, listStyle: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
                    {t.items.map((it, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: idx < 2 ? `1px dashed ${COLORS.faded}` : 'none' }}>
                        {idx < 3 ? (
                          <span style={{ position: 'relative', width: 22, height: 22, flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: RANK_MEDALS[idx].fill, opacity: 0.3 }} />
                            <span style={{ position: 'relative', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 13, color: RANK_MEDALS[idx].num }}>{idx + 1}</span>
                          </span>
                        ) : (
                          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, width: 16, color: COLORS.faded }}>{idx + 1}</span>
                        )}
                        <span style={{ flex: 1, minWidth: 0 }}>{it}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: COLORS.faded, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  <Plus size={20} strokeWidth={2} />
                  Add list
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.faded }}>
          consensusgurus.com
        </div>
      </div>

      {/* Download */}
      <button
        onClick={download}
        disabled={downloading || filledCount === 0}
        style={{
          cursor: filledCount === 0 ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'DM Mono, monospace',
          fontSize: 13,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '15px 26px',
          border: `1.5px solid ${COLORS.ink}`,
          background: filledCount === 0 ? 'transparent' : COLORS.ink,
          color: filledCount === 0 ? COLORS.faded : COLORS.cream,
          opacity: downloading ? 0.6 : 1,
        }}
      >
        <Download size={16} strokeWidth={2.5} />
        {downloading ? 'Generating…' : 'Download image'}
      </button>
      <span style={{ marginLeft: 14, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: COLORS.faded }}>
        {filledCount} of {tiles.length} tiles filled
      </span>

      {/* Picker overlay */}
      {pickIndex !== null && (
        <div
          onClick={() => setPickIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(26,22,17,0.55)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '6vh 16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 560,
              maxHeight: '84vh',
              display: 'flex',
              flexDirection: 'column',
              background: COLORS.cream,
              border: `2px solid ${COLORS.ink}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1.5px solid ${COLORS.ink}` }}>
              <Search size={16} strokeWidth={2.5} style={{ color: COLORS.faded }} />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lists…"
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: COLORS.ink }}
              />
              <button onClick={() => setPickIndex(null)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: COLORS.ink, display: 'flex' }}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div style={{ overflowY: 'auto' }}>
              {tiles[pickIndex] && (
                <button
                  onClick={clearTile}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px dashed ${COLORS.faded}`,
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: COLORS.ember,
                  }}
                >
                  Remove from grid
                </button>
              )}
              {filtered.map((l) => (
                <button
                  key={l.id}
                  onClick={() => pick(l)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid rgba(122,111,94,0.2)`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.faded }}>{l.category}</span>
                  <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 17, fontVariationSettings: '"SOFT" 100' }}>{l.title}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '24px 16px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.faded }}>
                  No lists match “{query}”.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
