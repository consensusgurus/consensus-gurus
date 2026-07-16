// Resolve an Extra puzzle's hidden-word specs to headline word indices.
// Shared by the client (rendering/reveals) and the bank validator, so both
// use the identical rule: a spec matches a headline word with trailing
// punctuation stripped; 'WORD#2' picks the 2nd occurrence. Contains NO puzzle
// data — safe to import from the client bundle.
export function resolveHidden(p) {
  const words = p.head.split(/\s+/);
  const core = words.map((w) => w.replace(/[;:,.!?]+$/g, ''));
  return p.hidden.map((spec) => {
    const m = /^(.*?)(?:#(\d+))?$/.exec(spec);
    const target = m[1];
    const nth = m[2] ? Number(m[2]) : 1;
    let seen = 0;
    for (let i = 0; i < core.length; i++) {
      if (core[i] === target) {
        seen++;
        if (seen === nth) return i;
      }
    }
    throw new Error(`hidden spec "${spec}" not found in head of #${p.num}`);
  });
}
