#!/usr/bin/env node
// PARSE EVERY CLIENT. The most common way this repo breaks its own build is a
// BACKTICK INSIDE A CSS COMMENT.
//
// Every client carries its stylesheet as a JS template literal. A comment
// written inside that CSS is inside the literal, so a backtick in it CLOSES THE
// LITERAL and the rest of the stylesheet is parsed as JavaScript. The reported
// error points at whatever word followed the backtick, which reads as a
// nonsense syntax error a long way from the mistake. It is an easy trap because
// backticks are how you quote a property name everywhere else in this codebase;
// it was hit twice in one session on 2026-08-31 (a specificity note quoting
// `.sty-figs b i`, and a note quoting `height`).
//
// ⚠️ DO NOT "IMPROVE" THIS BY WRITING A PARSER. The first version of this file
// walked each template literal to find its comments — and could not see the bug
// at all, because the stray backtick ENDS the literal, so the comment it lives
// in is no longer inside one. Any checker that models the literal the way the
// compiler does is fooled by exactly the input it exists to catch. The only
// reliable detector is a real parse, so this shells out to esbuild, which is
// already a dependency and parses the whole tree in about a second.
//
// It catches every other syntax error too, which is the point: `node --check`
// is a no-op on an ESM file (see CLAUDE.md), so this is the cheapest real
// syntax gate the repo has.
//
// Usage: node scripts/verify-css-comments.mjs

import { execFileSync } from 'node:child_process';
import { globSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const files = globSync('{app,lib,components,scripts}/**/*.{js,jsx,mjs}', { cwd: process.cwd() })
  .filter((f) => !f.includes('node_modules'));

if (!files.length) {
  console.error('FAIL: no source files found — run this from the repo root.');
  process.exit(1);
}

// esbuild insists on a real output directory even when the output is thrown
// away, so it gets a temp one (/dev/null is a file, not a directory, and it
// fails on every input). --log-level=error drops the tree's ~150 pre-existing
// duplicate-key warnings, which are not what this gate is for.
const out = mkdtempSync(join(tmpdir(), 'parse-'));
try {
  execFileSync(
    'npx',
    ['--yes', 'esbuild', '--loader:.jsx=jsx', '--loader:.js=jsx',
     '--log-level=error', `--outdir=${out}`, ...files],
    { stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8' },
  );
} catch (err) {
  const out = String(err.stderr || err.stdout || err.message);
  console.error('FAIL: the tree does not parse.\n');
  console.error(out.trim());
  if (/Expected ";" but found/.test(out) || /Unterminated/.test(out)) {
    console.error(
      '\nHINT: an error like this inside a stylesheet is almost always a BACKTICK\n' +
      'in a CSS comment, which closes the template literal. Quote the property\n' +
      'plainly (height: rather than a backticked height) and re-run.',
    );
  }
  process.exit(1);
} finally {
  rmSync(out, { recursive: true, force: true });
}

console.log(`clean: ${files.length} files parse`);
