const fs = require('fs');
const os = require('os');
const path = require('path');
const tmp = os.tmpdir();

const src = fs.readFileSync('./lib/data.js', 'utf8');
const mod = src.replace(
  'export { LISTS, TYPES, COLORS, AMAZON_AFFILIATE_TAG, BOOKING_AFFILIATE_AID, TRIPADVISOR_PARTNER };',
  'module.exports = { LISTS };'
);
const dataPath = path.join(tmp, 'cg_data.js');
fs.writeFileSync(dataPath, mod);
const { LISTS } = require(dataPath);

console.log('LISTS type:', typeof LISTS, 'isArray:', Array.isArray(LISTS), 'length:', LISTS?.length);

LISTS.forEach((list, i) => {
  try {
    const items = list.sources?.ai?.items || list.vote?.items || [];
    if (!Array.isArray(items)) throw new Error('items not array: ' + typeof items);
    items.slice(0, 10).map((item) => typeof item === 'string' ? item : item?.name || '');
    Object.keys(list.sources || {}).filter((k) => k !== 'ai');
    LISTS.map((l) => ({ id: l.id }));
  } catch(e) {
    console.error('CRASH at index', i, 'list:', list.id, '\nERROR:', e.message);
    process.exit(1);
  }
});
console.log('All', LISTS.length, 'lists passed page.js logic.');

const helpersSrc = fs.readFileSync('./lib/helpers.js', 'utf8');
const helpersMod = helpersSrc
  .replace("import { AMAZON_AFFILIATE_TAG, BOOKING_AFFILIATE_AID, TRIPADVISOR_PARTNER } from './data';",
    "const AMAZON_AFFILIATE_TAG='cgurus-20', BOOKING_AFFILIATE_AID='', TRIPADVISOR_PARTNER='';")
  .replace('export { buildItemLink, getSources, voteKey, dedupeByName };',
    'module.exports = { getSources };');
const helpersPath = path.join(tmp, 'cg_helpers.js');
fs.writeFileSync(helpersPath, helpersMod);
const { getSources } = require(helpersPath);

LISTS.forEach((list, i) => {
  try {
    getSources(list, null, []);
  } catch(e) {
    console.error('getSources CRASH at index', i, 'list:', list.id, '\nERROR:', e.message);
    process.exit(1);
  }
});
console.log('All getSources calls passed.');
