// The ROOT web app manifest, served at /manifest.webmanifest.
//
// Every daily game had its own manifest in public/ (crux.webmanifest, feud.webmanifest, and
// twenty-odd more) while the site itself had none, so installing Mind Loft from the homepage
// produced an unnamed shortcut with a shrunken icon and no theme colour. Game pages set
// `metadata.manifest` themselves, which overrides this one inside their own scope, so this
// file governs the homepage, lists, quizzes and everything else.
//
// The maskable entry is the one Android actually crops to its adaptive-icon shape. Without a
// `purpose: 'maskable'` icon Android letterboxes the plain icon inside a white circle, which
// is what made the installed app look second-hand next to the games.

import { T } from '@/lib/theme';

export default function manifest() {
  return {
    id: '/',
    name: 'Mind Loft',
    short_name: 'Mind Loft',
    description:
      'Daily word, number and logic puzzles, 1,000+ timed quizzes, and consensus Top 10 Lists built from expert and reader sources.',
    start_url: '/?src=pwa',
    scope: '/',
    display: 'standalone',
    background_color: T.surface,
    // Matches `viewport.themeColor` in app/layout.js. If these two ever disagree the browser
    // chrome and the installed app tint differently, which is the tell of a stale manifest.
    theme_color: T.accent,
    icons: [
      { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/web-app-manifest-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
