# Consensus Gurus — working instructions

This repo is the **single source of truth** for consensusgurus.com. When creating or editing
lists, always follow the conventions in the rules doc below. It is auto-loaded with this file,
so there is no need for the user to paste it into chat.

@CONSENSUS_GURUS_LIST_CREATION_RULES.md

## The essentials (full detail in the rules doc)

- **Edit the live data file:** `lib/data.js` in THIS repo. That is the only file that deploys.
- **Deploy via GitHub Desktop:** after editing `lib/data.js`, the user commits to `main` and
  pushes; Vercel auto-deploys in ~1 minute. Do not hand over `git commit`/`git push` terminal
  commands unless the user explicitly asks.
- **Consensus is Borda-scored** across the expert `sources`; the `ai` seed and `vote.items` are
  display seeds and should be re-seeded to the computed top 10 after building sources.
- **Validate before deploy:** `node --check` the assembled `lib/data.js` (or `npm run build`).

## Single folder now (supersedes the old "two folders" guidance)

Everything lives in this repo. The rules doc still contains a "Two folders, one source of truth"
section describing an older setup where the rules lived in a separate OneDrive `Projects` folder
and `data.js` had stale copies there. **That section is historical** — the rules doc and the live
`data.js` now live together here, and the stale `Projects` copies have been retired. Trust this
file over that section if they disagree.

## These rules are a living document

The conventions have changed over time and will keep changing. Treat
`CONSENSUS_GURUS_LIST_CREATION_RULES.md` in this repo as the current master and **update it in
place** whenever a convention is added or revised, so future sessions inherit the latest version
automatically.
