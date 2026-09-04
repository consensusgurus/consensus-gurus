// scripts/us-spellings.mjs — the shared US-spelling screen for reader-facing copy.
//
// CLAUDE.md, "Daily puzzle authoring standard" rule 8 and "Extending a puzzle
// bank in bulk" rule 4: a generator drawing on an off-the-shelf word list, and
// an author writing at volume, both import British forms. Crux shipped a
// `Colours` category and a `PARLOUR`; the 2026-09-04 Thread and Dating
// extensions shipped 72 more (neighbour, practise, jewellery, aeroplane,
// theatre, metre, harbour, mould, tyre, colour). Every one of those was
// mechanically checkable and nobody had written the check, which is exactly the
// failure the standard exists to stop.
//
// USE. Import `scanUS` in a game's checker and run it over every reader-facing
// string of every board at or after the game's own dated copy floor, so the
// past stays frozen (rule 6):
//
//   import { scanUS } from './us-spellings.mjs';
//   const COPY_FROM = '2026-09-30';
//   for (const p of PUZZLES) {
//     if (p.live < COPY_FROM) continue;
//     for (const hit of scanUS(text)) errs.push(`British form "${hit.found}" (US: ${hit.us})`);
//   }
//
// PROPER NOUNS ARE NOT VIOLATIONS. A real title or name keeps its own spelling:
// the film "The Favourite", "Ford's Theatre", "Encyclopaedia Britannica", the
// city "Tyre". Pass them in `allow` and they are skipped verbatim.

export const BRITISH = [
  ['colours', 'colors'], ['colour', 'color'], ['coloured', 'colored'],
  ['favourite', 'favorite'], ['favour', 'favor'], ['favoured', 'favored'],
  ['honour', 'honor'], ['honours', 'honors'], ['humour', 'humor'],
  ['labourers', 'laborers'], ['labourer', 'laborer'], ['labour', 'labor'],
  ['neighbourhood', 'neighborhood'], ['neighbouring', 'neighboring'],
  ['neighbours', 'neighbors'], ['neighbour', 'neighbor'],
  ['harbour', 'harbor'], ['armour', 'armor'], ['behaviour', 'behavior'],
  ['flavour', 'flavor'], ['parlour', 'parlor'], ['vapour', 'vapor'],
  ['rumour', 'rumor'], ['odour', 'odor'], ['splendour', 'splendor'],
  ['theatre', 'theater'], ['theatres', 'theaters'],
  ['centres', 'centers'], ['centre', 'center'],
  ['metres', 'meters'], ['metre', 'meter'], ['litres', 'liters'], ['litre', 'liter'],
  ['fibre', 'fiber'], ['calibre', 'caliber'], ['sombre', 'somber'], ['spectre', 'specter'],
  ['defence', 'defense'], ['offence', 'offense'], ['pretence', 'pretense'],
  ['practises', 'practices'], ['practised', 'practiced'], ['practise', 'practice'],
  ['organised', 'organized'], ['organisation', 'organization'], ['organise', 'organize'],
  ['realises', 'realizes'], ['realising', 'realizing'], ['realised', 'realized'], ['realise', 'realize'],
  ['recognises', 'recognizes'], ['recognised', 'recognized'], ['recognise', 'recognize'],
  ['apologise', 'apologize'], ['apologised', 'apologized'],
  ['criticised', 'criticized'], ['criticise', 'criticize'],
  ['memorised', 'memorized'], ['memorise', 'memorize'],
  ['synthesise', 'synthesize'], ['specialise', 'specialize'],
  ['analyse', 'analyze'], ['analysed', 'analyzed'], ['paralysed', 'paralyzed'],
  ['travelling', 'traveling'], ['traveller', 'traveler'], ['travelled', 'traveled'],
  ['cancelled', 'canceled'], ['labelled', 'labeled'], ['modelling', 'modeling'],
  ['marvellous', 'marvelous'], ['jewellery', 'jewelry'], ['counsellor', 'counselor'],
  ['signalled', 'signaled'], ['fuelled', 'fueled'],
  ['aluminium', 'aluminum'], ['grey', 'gray'], ['whilst', 'while'], ['amongst', 'among'],
  ['learnt', 'learned'], ['spelt', 'spelled'], ['dreamt', 'dreamed'],
  ['programme', 'program'], ['ploughing', 'plowing'], ['plough', 'plow'],
  ['moulded', 'molded'], ['mould', 'mold'], ['smoulder', 'smolder'],
  ['storeys', 'stories'], ['tyres', 'tires'], ['tyre', 'tire'], ['kerb', 'curb'],
  ['pyjamas', 'pajamas'], ['sceptic', 'skeptic'], ['sceptical', 'skeptical'],
  ['draught', 'draft'], ['moustached', 'mustached'], ['moustache', 'mustache'],
  ['aeroplanes', 'airplanes'], ['aeroplane', 'airplane'],
  ['manoeuvre', 'maneuver'], ['doughnut', 'donut'], ['encyclopaedia', 'encyclopedia'],
];

const RES = BRITISH.map(([brit, us]) => [new RegExp(`\\b${brit}\\b`, 'i'), brit, us]);

// Returns [{ found, us }] for every British form in `text`, skipping any
// `allow` phrase (a real title or name) wherever it appears.
export function scanUS(text, allow = []) {
  let s = String(text || '');
  for (const a of allow) if (a && s.includes(a)) s = s.split(a).join(' ');
  const out = [];
  for (const [re, brit, us] of RES) {
    const m = s.match(re);
    if (m) out.push({ found: m[0], us });
  }
  return out;
}
