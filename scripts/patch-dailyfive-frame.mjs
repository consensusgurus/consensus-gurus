// /daily-five renders its own CircuitFrame.
//
// It did not, for one deploy, and the route went inert: React #329, "unknown
// root exit status", which is a RENDER CRASH rather than the #418/#423/#425
// hydration mismatches this site produces routinely and recovers from. The page
// stayed on its SSR markup with no effect ever running, so `day` was never set
// and it read "0 of 0 played" with no date. That is the exact signature this
// route showed at its August 2026 launch and which was never diagnosed then.
//
// THE SHAPE IS THE DIFFERENCE, and only one of the three was untested:
//   /circuits/<id>  server -> CLIENT CircuitLanding -> CircuitFrame     hydrates
//   /circuits       server -> CircuitFrame -> SERVER children           hydrates
//   /daily-five     server -> CircuitFrame -> CLIENT child as children  crashed
// Rendering the frame from inside the client component puts this route on the
// first shape, which is already proved.
//
// Idempotent: a swap whose result is already in the file is skipped, so this
// can be re-run against an origin that already carries it.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , src, out] = process.argv;
if (!src || !out) { console.error('usage: patch-dailyfive-frame.mjs <in> <out>'); process.exit(1); }
let s = readFileSync(src, 'utf8');

const ensure = (label, from, to) => {
  if (s.includes(to)) { console.log(`  skip ${label} (already present)`); return; }
  const a = s.indexOf(from);
  if (a < 0) throw new Error(`${label}: anchor not found`);
  if (s.indexOf(from, a + 1) >= 0) throw new Error(`${label}: anchor matched twice`);
  s = s.slice(0, a) + to + s.slice(a + from.length);
  console.log(`  ok   ${label}`);
};

ensure('import',
  "import CircuitScorecard from '../circuits/CircuitScorecard';",
  "import CircuitScorecard from '../circuits/CircuitScorecard';\nimport CircuitFrame from '../circuits/CircuitFrame';");

ensure('open',
  '  return (\n    <div className="d5s">',
  '  return (\n    <CircuitFrame label="Run summary">\n    <div className="d5s">');

ensure('close',
  `      </a>
    </div>
  );
}`,
  `      </a>
    </div>
    </CircuitFrame>
  );
}`);

for (const keep of ["import CircuitFrame from '../circuits/CircuitFrame';",
  '<CircuitFrame label="Run summary">', '</CircuitFrame>']) {
  if (!s.includes(keep)) throw new Error(`lost: ${keep}`);
}
if ((s.match(/<CircuitFrame/g) || []).length !== 1) throw new Error('frame opened more than once');
if ((s.match(/<\/CircuitFrame>/g) || []).length !== 1) throw new Error('frame closed more than once');

writeFileSync(out, s);
console.log(`ok  ${src} -> ${out}`);
