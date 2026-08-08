#!/usr/bin/env bash
# Vercel Ignored Build Step. Wired up via "ignoreCommand" in vercel.json.
#
# ⚠️ THE CONTRACT IS INVERTED AND EASY TO GET BACKWARDS:
#     exit 0 = SKIP the build
#     exit 1 = RUN the build
# Every uncertain path below exits 1. The failure mode is therefore a wasted
# build, never a change that silently never ships.
#
# WHY THIS EXISTS (2026-08-08 cost + latency audit):
#   - 181 production deploys in 4.3 days made Build CPU the single biggest line
#     on the Vercel bill: $6.12 of $15.04, 41%, at roughly 3.4 cents a deploy.
#   - Every deploy ALSO empties the CDN cache. Measured the same day: a warm
#     homepage load is ~1.7s with most API calls served in 54-97ms, but minutes
#     after a deploy those same calls are cache misses at 1.4-4.4s and the page
#     takes 3-4s. At ~42 deploys a day the cache is cold roughly every half
#     hour, so a real share of visitors always gets the slow version.
# A commit that only edits documentation cannot change the built output, so it
# should pay neither cost.
#
# DELIBERATELY NARROW: markdown only. Nothing under app/, lib/, public/,
# scripts/, and no config file is ever skipped. Verified 2026-08-08 that no .md
# is imported or read by app/ or lib/ at build time (the repo has 5 .md files
# and all of them are notes: CLAUDE.md, CLAUDE-QUIZZES.md, README.md,
# scripts/gen-shards/README.md, sushi-tokyo-research-notes.md).
#
# If you ever widen this list, re-run that check first. A file that LOOKS inert
# but is read by next.config.js, a route, or generateStaticParams will silently
# stop deploying.

set -u

build() { echo "IGNORE-STEP: building ($1)"; exit 1; }

# No parent to diff against (first commit, or a clone too shallow to see one).
git rev-parse --verify HEAD^ >/dev/null 2>&1 || build "no parent commit"

# A merge commit hides changes behind its second parent.
git rev-parse --verify HEAD^2 >/dev/null 2>&1 && build "merge commit"

changed=$(git diff --name-only HEAD^ HEAD) || build "git diff failed"
[ -z "$changed" ] && build "empty diff"

# Build the moment ANY changed path is not markdown.
if printf '%s\n' "$changed" | grep -qvE '\.md$'; then
  echo "IGNORE-STEP: building, code changed:"
  printf '%s\n' "$changed" | head -30
  exit 1
fi

echo "IGNORE-STEP: documentation only, skipping build:"
printf '%s\n' "$changed"
exit 0
