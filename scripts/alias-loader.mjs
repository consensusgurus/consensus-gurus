// Lets a plain-node script import the app's ESM modules (owner tooling, 2026-08-12).
//
// The scoring modules are ordinary ESM and a verifier can import them directly,
// except for two things Next resolves and node does not: the '@/...' path alias
// (lib/quiz-xp reaches for '@/lib/theme') and extensionless relative imports
// (lib/daily-combined imports './daily-games'). Between them, one alias and one
// missing '.js' put the whole comparator out of a checker's reach, which is why
// the End Game board check could not simply import the code it certifies.
//
// Resolution is decided by looking on disk rather than by trying and catching,
// so the hook stays synchronous and deterministic.
//
// Usage, from a verifier. The hook has to be installed BEFORE the import is
// resolved, so the import must be dynamic:
//
//   import { register } from 'node:module';
//   register('./alias-loader.mjs', import.meta.url);
//   const { scoreGame } = await import('../lib/daily-combined.js');
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hasExt = (p) => /\.[a-z]+$/i.test(p);
const withJs = (p) => (hasExt(p) ? p : p + '.js');

export function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    return next(pathToFileURL(withJs(join(root, specifier.slice(2)))).href, context);
  }
  if (/^\.\.?\//.test(specifier) && !hasExt(specifier) && context.parentURL) {
    const guess = withJs(join(dirname(fileURLToPath(context.parentURL)), specifier));
    if (existsSync(guess)) return next(pathToFileURL(guess).href, context);
  }
  // A SUBPATH OF A PACKAGE THAT PUBLISHES NO EXPORTS MAP (added 2026-09-03).
  // next@14 ships next/og.js as a plain file with no './og' entry in its
  // exports, so bundlers resolve `next/og` and plain node does not. Only
  // reached for a bare specifier that node itself could not resolve to a
  // directory, so a package with a real exports map is never intercepted.
  if (!/^[./]/.test(specifier) && !hasExt(specifier) && specifier.includes('/')) {
    const guess = withJs(join(root, 'node_modules', specifier));
    if (existsSync(guess)) return next(pathToFileURL(guess).href, context);
  }
  return next(specifier, context);
}
