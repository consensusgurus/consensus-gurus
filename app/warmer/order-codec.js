// Warmer's `order` codec — how a day's 32,300-word similarity ranking is stored.
//
// WHY THIS EXISTS. A Warmer board is a full permutation of the VOCAB index
// space: 32,300 integers per day. Written as a JavaScript array literal that is
// 32,300 numeric AST nodes per board, and at 136 boards the bank was 4.4 MILLION
// literal nodes in one module — about 25MB of source. Five other modules import
// that bank just to read `live` and `num` (the daily-game, daily-unplayed and
// sunday-slate routes, /daily, and lib/daily-slate), so every one of them paid
// to parse it. `next build` died with
//     Next.js build worker exited with code: null and signal: SIGKILL
// and that takes the whole site's deploy down, not just Warmer.
//
// THE FIX. Each board stores `o`: one string, three base64 characters per vocab
// index, big-endian, no separators. 64^3 = 262,144, comfortably above the
// 32,300 the vocabulary needs, and fixed width means decoding is a straight
// walk with no scanning or splitting. That is 96,900 characters a board against
// roughly 183,000 before, and — the part that actually mattered — ONE string
// literal per board instead of 32,300 numeric nodes, so the whole bank is 136
// AST nodes and the parser walks the payload linearly.
//
// THE STORED BYTES CHANGED; THE DATA DID NOT. `decodeOrder(o)` returns exactly
// the array that used to be written out, element for element, for every board
// including the 74 frozen ones. scripts/verify-warmer.mjs re-proves that the
// decoded order is a complete permutation on every run, and the re-encoding was
// checked index-by-index against the previous file before it shipped.
//
// `board()` wraps each entry in app/warmer/puzzles.js. It leaves `o` as the
// only stored form and hangs a lazy, cached, NON-ENUMERABLE `order` off the
// object, so:
//   - server code and scripts can keep saying `p.order` and get an array;
//   - nothing decodes a board nobody asked about;
//   - `order` is invisible to Object.keys and to React's prop serialization, so
//     app/warmer/page.js hands the client the compact `o` for the ONE live day
//     and cannot leak a future day's ranking by accident.
// The client decodes with the same `decodeOrder` (see WarmerClient), which is
// why this module is deliberately tiny and free of imports: it is the only
// piece of the bank that ships to the browser.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const VALUE = /* #__PURE__ */ (() => {
  const t = new Int16Array(128).fill(-1);
  for (let i = 0; i < ALPHABET.length; i++) t[ALPHABET.charCodeAt(i)] = i;
  return t;
})();

/** Pack an array of vocab indices into the stored string. Used by scripts/gen-warmer.mjs. */
export function encodeOrder(order) {
  let out = '';
  for (let i = 0; i < order.length; i++) {
    const v = order[i];
    if (!Number.isInteger(v) || v < 0 || v >= 262144) throw new Error(`index ${v} is not encodable`);
    out += ALPHABET[(v >> 12) & 63] + ALPHABET[(v >> 6) & 63] + ALPHABET[v & 63];
  }
  return out;
}

/** Unpack a stored string back into the array of vocab indices. */
export function decodeOrder(o) {
  if (typeof o !== 'string' || o.length % 3 !== 0) throw new Error('malformed Warmer order string');
  const n = o.length / 3;
  const out = new Array(n);
  for (let i = 0, k = 0; i < n; i++, k += 3) {
    const a = VALUE[o.charCodeAt(k)], b = VALUE[o.charCodeAt(k + 1)], c = VALUE[o.charCodeAt(k + 2)];
    if (a < 0 || b < 0 || c < 0) throw new Error(`bad character at ${k} in Warmer order string`);
    out[i] = (a << 12) | (b << 6) | c;
  }
  return out;
}

/** Wrap a stored board: `o` stays the data, `order` becomes a lazy cached view of it. */
export function board(b) {
  let cached = null;
  Object.defineProperty(b, 'order', {
    enumerable: false,
    configurable: true,
    get() { return (cached || (cached = decodeOrder(b.o))); },
  });
  return b;
}
