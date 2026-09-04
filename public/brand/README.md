# Brand assets

The mark itself lives in `app/MindLoftMark.jsx` and is drawn, never pasted. These
are the places that need a baked PNG instead.

| File | Where it goes |
|---|---|
| `../../app/icon.png` (512) | the browser tab on every page, via `metadata.icons.icon` |
| `../../app/apple-icon.png` (180) | iOS home screen for the site itself |
| `../../app/favicon.ico` (16/32/48/64) | the legacy fallback |
| `x-banner.png` (1500x500) | the X profile header |
| `x-avatar.png` (400x400) | the X profile photo |

## Rules

**The brain is `#7dd3fc`**, which is `--stg-brand` on the dark register: what
the mark actually wears on every dark page. It was `#60a5fa`, half a step
darker, which muddied at 16px on a dark tab bar.

**The tile ground is `#0b0f1a`**, the site's own dark ground, not the near-black
`#0b0c0e` these used to carry.

**The avatar is padded further in than the favicon** (0.86 of the tile against
0.92). X crops a profile photo to a circle, and the floor line is the widest
thing in the mark while sitting 85% of the way down, where the circle has
already narrowed. At 0.92 it clips.

**The banner's bottom-left is deliberately empty.** X overlays the profile photo
there, covering roughly the left quarter of the bottom third.

## Regenerating

```
npm i --no-save playwright && npx playwright install chromium
node scripts/build-brand.mjs
python3 -c "from PIL import Image; Image.open('app/icon.png').save('app/favicon.ico', sizes=[(16,16),(32,32),(48,48),(64,64)])"
```

It renders the real `MindLoftMark` geometry through headless Chromium, with
Manrope and DM Mono read out of `node_modules`, so it needs no network. Run it
after any change to the mark or to `--stg-brand`, and commit what it writes.

Playwright is deliberately not a dependency: Vercel installs devDependencies
during a build, and a headless browser is a few hundred megabytes to carry for a
script that runs twice a year.
