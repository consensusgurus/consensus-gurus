import HomeClient from './HomeClient';
import { LISTS } from '@/lib/data';

// Server-rendered homepage content (SEO / crawler layer).
//
// HomeClient is a 'use client' component, so the HTML a crawler receives for
// "/" was previously just the "seeking truths..." loading shell with no real
// content. That let server-rendered static pages (privacy, terms) outrank the
// homepage for the brand name. This block renders real, crawlable content in
// the initial server HTML: the brand H1, a description of the site, and a link
// to every list page. It is styled as a full-screen branded loading screen and
// is removed by HomeClient the moment the live app is ready (see the effect in
// HomeClient.jsx keyed on `loaded`), so a human visitor never sees it as a
// separate state. To roll this back, restore the original two-line component.

const CREAM = '#f4ede0';
const INK = '#2b2b2b';
const FADED = '#6f6657';
const RED = '#c0392b';

const TYPE_SECTIONS = [
  { type: 'food', label: 'Food & Drink' },
  { type: 'travel', label: 'Travel & Hotels' },
  { type: 'entertainment', label: 'Entertainment' },
  { type: 'product', label: 'Products & Tech' },
  { type: 'stores', label: 'Places & Shops' },
  { type: 'other', label: 'More Lists' },
];

export default function HomePage() {
  const byType = (t) =>
    LISTS.filter((l) => l.type === t).sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );

  return (
    <>
      <div
        id="home-seo-fallback"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          overflowY: 'auto',
          background: CREAM,
          color: INK,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          style={{
            maxWidth: 920,
            margin: '0 auto',
            padding: '56px 24px 80px',
          }}
        >
          <p
            style={{
              fontFamily: 'DM Mono, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontSize: 12,
              color: RED,
              margin: '0 0 14px',
            }}
          >
            Source of Truths
          </p>
          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 900,
              fontSize: 'clamp(34px, 6vw, 56px)',
              lineHeight: 1.05,
              margin: '0 0 18px',
            }}
          >
            Source of Truths
          </h1>
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 2.4vw, 22px)',
              lineHeight: 1.4,
              color: FADED,
              margin: '0 0 22px',
            }}
          >
            For all the important aspects of life.
          </p>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 17,
              lineHeight: 1.6,
              maxWidth: 680,
              margin: '0 0 14px',
            }}
          >
            Source of Truths is a collection of curated top-ten lists ranked by
            expert consensus and reader votes. Each list blends rankings from
            authoritative publications using Borda consensus scoring, then layers
            live reader voting on top, so you can see what we all actually agree
            on, from the best dive bars and pizza to luxury resorts, films,
            books, and products.
          </p>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 17,
              lineHeight: 1.6,
              maxWidth: 680,
              margin: '0 0 36px',
            }}
          >
            Browse every list below, or explore by category on the homepage.
          </p>

          {TYPE_SECTIONS.map(({ type, label }) => {
            const lists = byType(type);
            if (lists.length === 0) return null;
            return (
              <section key={type} style={{ margin: '0 0 34px' }}>
                <h2
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 700,
                    fontSize: 22,
                    margin: '0 0 12px',
                    borderBottom: `2px solid ${RED}`,
                    paddingBottom: 6,
                  }}
                >
                  {label}
                </h2>
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    columns: '2 280px',
                    columnGap: 28,
                  }}
                >
                  {lists.map((l) => (
                    <li
                      key={l.id}
                      style={{
                        breakInside: 'avoid',
                        margin: '0 0 7px',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 15,
                        lineHeight: 1.4,
                      }}
                    >
                      <a
                        href={`/list/${l.id}`}
                        style={{ color: INK, textDecoration: 'none' }}
                      >
                        {l.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
      <HomeClient />
    </>
  );
}
