// Docket theme skins. A theme supplies ONLY prose: the setup template and the
// nouns/prepositions the rule renderer needs. It never touches logic, so a
// theme can be swapped onto any spec of its archetype without changing a single
// answer. Placeholders: {N} entity count as a word, {n} as a digit, {L} the
// letters, {K} the chosen count, {G} the group list, {A0}/{A1} the attributes.
//
// befWord/aftWord/immWord exist because a SPATIAL game has to read "somewhere to
// the left of" where a TEMPORAL one reads "at some time before". A spatial theme
// wearing temporal wording is the tell that these sentences are generated.

export const THEMES = {
  seq: [
    { id: 'docket', title: 'The Docket', verb: 'heard', singular: 'case', plural: 'cases', slot: 'session', slots: 'sessions',
      setupTpl: 'A judge hears exactly {N} cases ({L}) over {N} consecutive sessions numbered 1 through {n}, one case per session. Each case is heard in exactly one session. The docket must meet all of the following conditions:' },
    { id: 'gallery', title: 'The Gallery Wall', verb: 'hung', singular: 'painting', plural: 'paintings', slot: 'position', slots: 'positions',
      befWord: 'somewhere to the left of', aftWord: 'somewhere to the right of', immWord: 'immediately to the left of',
      setupTpl: 'A curator hangs exactly {N} paintings ({L}) in a single row of {N} positions numbered 1 through {n}, with position 1 at the far left and position {n} at the far right. Each painting hangs in exactly one position. The arrangement must meet all of the following conditions:' },
    { id: 'recital', title: 'The Recital', verb: 'performed', singular: 'piece', plural: 'pieces', slot: 'slot', slots: 'slots',
      setupTpl: 'A recital programs exactly {N} pieces ({L}) to be performed one at a time in {N} consecutive slots numbered 1 through {n}. Each piece is performed exactly once. The program must meet all of the following conditions:' },
    { id: 'flight', title: 'The Tasting Flight', verb: 'poured', singular: 'wine', plural: 'wines', slot: 'slot', slots: 'slots',
      setupTpl: 'A sommelier pours exactly {N} wines ({L}) to be tasted one at a time in {N} slots numbered 1 through {n}. Each wine is poured exactly once. The flight must meet all of the following conditions:' },
    { id: 'shift', title: 'The Closing Shift', verb: 'completed', singular: 'task', plural: 'tasks', slot: 'slot', slots: 'slots',
      setupTpl: 'A closing crew completes exactly {N} tasks ({L}) one at a time in {N} slots numbered 1 through {n}. Each task is completed exactly once. The shift must meet all of the following conditions:' },
    { id: 'screening', title: 'The Festival Program', verb: 'screened', singular: 'film', plural: 'films', slot: 'evening', slots: 'evenings',
      setupTpl: 'A festival screens exactly {N} films ({L}) over {N} consecutive evenings numbered 1 through {n}, one film per evening. Each film is screened on exactly one evening. The program must meet all of the following conditions:' },
    { id: 'auction', title: 'The Auction', verb: 'sold', singular: 'lot', plural: 'lots', slot: 'position', slots: 'positions',
      setupTpl: 'An auctioneer sells exactly {N} lots ({L}) one at a time in {N} positions numbered 1 through {n}. Each lot is sold exactly once. The sale must meet all of the following conditions:' },
    { id: 'witness', title: 'The Witness List', verb: 'called', singular: 'witness', plural: 'witnesses', slot: 'position', slots: 'positions',
      setupTpl: 'Counsel calls exactly {N} witnesses ({L}) one at a time in {N} positions numbered 1 through {n}. Each witness is called exactly once. The order must meet all of the following conditions:' },
    { id: 'shelf', title: 'The Shelf', verb: 'shelved', singular: 'book', plural: 'books', slot: 'position', slots: 'positions',
      befWord: 'somewhere to the left of', aftWord: 'somewhere to the right of', immWord: 'immediately to the left of',
      setupTpl: 'A librarian shelves exactly {N} books ({L}) in a single row of {N} positions numbered 1 through {n}, with position 1 at the far left. Each book is shelved in exactly one position. The arrangement must meet all of the following conditions:' },
    { id: 'service', title: 'The Service Bay', verb: 'serviced', singular: 'car', plural: 'cars', slot: 'day', slots: 'days',
      setupTpl: 'A garage services exactly {N} cars ({L}) over {N} consecutive days numbered 1 through {n}, one car per day. Each car is serviced on exactly one day. The schedule must meet all of the following conditions:' },
    { id: 'summit', title: 'The Conference Slate', verb: 'delivered', singular: 'address', plural: 'addresses', slot: 'slot', slots: 'slots',
      setupTpl: 'A conference schedules exactly {N} addresses ({L}) to be delivered one at a time in {N} slots numbered 1 through {n}. Each address is delivered exactly once. The slate must meet all of the following conditions:' },
    { id: 'kiln', title: 'The Kiln', verb: 'fired', singular: 'batch', plural: 'batches', slot: 'firing', slots: 'firings',
      setupTpl: 'A potter fires exactly {N} batches ({L}) in {N} consecutive firings numbered 1 through {n}, one batch per firing. Each batch is fired exactly once. The schedule must meet all of the following conditions:' },
  ],

  sel: [
    { id: 'panel', title: 'The Expert Panel', verb: 'chosen', singular: 'expert', plural: 'experts',
      setupTpl: 'An organizer chooses exactly {K} of {N} experts ({L}) for a panel. The selection must meet all of the following conditions:' },
    { id: 'bed', title: 'The Raised Bed', verb: 'planted', singular: 'plant', plural: 'plants',
      setupTpl: 'A gardener plants exactly {K} of {N} available plants ({L}) in a raised bed. The planting must meet all of the following conditions:' },
    { id: 'headliners', title: 'The Headliners', verb: 'booked', singular: 'act', plural: 'acts',
      setupTpl: 'A festival books exactly {K} of {N} candidate acts ({L}) for its main stage. The lineup must meet all of the following conditions:' },
    { id: 'grants', title: 'The Grant Committee', verb: 'funded', singular: 'proposal', plural: 'proposals',
      setupTpl: 'A committee funds exactly {K} of {N} proposals ({L}). The award must meet all of the following conditions:' },
    { id: 'jury', title: 'The Jury Box', verb: 'seated', singular: 'juror', plural: 'jurors',
      setupTpl: 'A court seats exactly {K} of {N} remaining jurors ({L}). The panel must meet all of the following conditions:' },
    { id: 'rope', title: 'The Summit Team', verb: 'selected', singular: 'climber', plural: 'climbers',
      setupTpl: 'An expedition selects exactly {K} of {N} climbers ({L}) for the summit team. The team must meet all of the following conditions:' },
    { id: 'tasting', title: 'The Tasting Menu', verb: 'served', singular: 'dish', plural: 'dishes',
      setupTpl: 'A chef serves exactly {K} of {N} candidate dishes ({L}) on the tasting menu. The menu must meet all of the following conditions:' },
    { id: 'payload', title: 'The Payload', verb: 'carried', singular: 'instrument', plural: 'instruments',
      setupTpl: 'A probe carries exactly {K} of {N} proposed instruments ({L}). The payload must meet all of the following conditions:' },
    { id: 'anthology', title: 'The Anthology', verb: 'included', singular: 'story', plural: 'stories',
      setupTpl: 'An editor includes exactly {K} of {N} submitted stories ({L}) in an anthology. The table of contents must meet all of the following conditions:' },
  ],

  match: [
    { id: 'interns', title: 'The Placements', verb: 'assigned', prep: 'to', singular: 'intern', plural: 'interns',
      groupNoun: 'department', groupNouns: 'departments', groups: ['Audit', 'Payroll', 'Research'], groupsShort: ['Audit', 'Payroll', 'Research'],
      setupTpl: 'A firm assigns each of {N} interns ({L}) to exactly one of three departments: {G}. More than one intern may be assigned to the same department. The placements must meet all of the following conditions:' },
    { id: 'shelves', title: 'The Reshelving', verb: 'shelved', prep: 'on', singular: 'book', plural: 'books',
      groupNoun: 'shelf', groupNouns: 'shelves', groups: ['the top shelf', 'the middle shelf', 'the bottom shelf'], groupsShort: ['top', 'middle', 'bottom'],
      setupTpl: 'A librarian shelves each of {N} books ({L}) on exactly one of three shelves: {G}. More than one book may go on the same shelf. The arrangement must meet all of the following conditions:' },
    { id: 'galleries', title: 'The Hang', verb: 'displayed', prep: 'in', singular: 'exhibit', plural: 'exhibits',
      groupNoun: 'gallery', groupNouns: 'galleries', groups: ['the East Gallery', 'the North Gallery', 'the West Gallery'], groupsShort: ['East', 'North', 'West'],
      setupTpl: 'A museum displays each of {N} exhibits ({L}) in exactly one of three galleries: {G}. More than one exhibit may be displayed in the same gallery. The hang must meet all of the following conditions:' },
    { id: 'stations', title: 'The Line', verb: 'posted', prep: 'to', singular: 'cook', plural: 'cooks',
      groupNoun: 'station', groupNouns: 'stations', groups: ['grill', 'pastry', 'garde manger'], groupsShort: ['grill', 'pastry', 'garde'],
      setupTpl: 'A kitchen posts each of {N} cooks ({L}) to exactly one of three stations: {G}. More than one cook may be posted to the same station. The line must meet all of the following conditions:' },
    { id: 'rings', title: 'The Dog Show', verb: 'entered', prep: 'in', singular: 'dog', plural: 'dogs',
      groupNoun: 'ring', groupNouns: 'rings', groups: ['Ring 1', 'Ring 2', 'Ring 3'], groupsShort: ['R1', 'R2', 'R3'],
      setupTpl: 'A show enters each of {N} dogs ({L}) in exactly one of three rings: {G}. More than one dog may be entered in the same ring. The draw must meet all of the following conditions:' },
    { id: 'cabinets', title: 'The Filing', verb: 'filed', prep: 'in', singular: 'file', plural: 'files',
      groupNoun: 'cabinet', groupNouns: 'cabinets', groups: ['Cabinet A', 'Cabinet B', 'Cabinet C'], groupsShort: ['A', 'B', 'C'],
      setupTpl: 'A clerk files each of {N} files ({L}) in exactly one of three cabinets: {G}. More than one file may go in the same cabinet. The filing must meet all of the following conditions:' },
    { id: 'sections', title: 'The Choir', verb: 'placed', prep: 'in', singular: 'singer', plural: 'singers',
      groupNoun: 'section', groupNouns: 'sections', groups: ['soprano', 'alto', 'tenor'], groupsShort: ['soprano', 'alto', 'tenor'],
      setupTpl: 'A director places each of {N} singers ({L}) in exactly one of three sections: {G}. More than one singer may be placed in the same section. The choir must meet all of the following conditions:' },
    { id: 'trucks', title: 'The Loading Dock', verb: 'loaded', prep: 'onto', singular: 'package', plural: 'packages',
      groupNoun: 'truck', groupNouns: 'trucks', groups: ['the north truck', 'the river truck', 'the ridge truck'], groupsShort: ['north', 'river', 'ridge'],
      setupTpl: 'A depot loads each of {N} packages ({L}) onto exactly one of three trucks: {G}. More than one package may be loaded onto the same truck. The load must meet all of the following conditions:' },
    { id: 'wards', title: 'The Rounds', verb: 'rotated', prep: 'to', singular: 'resident', plural: 'residents',
      groupNoun: 'ward', groupNouns: 'wards', groups: ['cardiology', 'neurology', 'oncology'], groupsShort: ['cardio', 'neuro', 'onco'],
      setupTpl: 'A hospital rotates each of {N} residents ({L}) to exactly one of three wards: {G}. More than one resident may be rotated to the same ward. The rota must meet all of the following conditions:' },
  ],

  hyb: [
    { id: 'hearings', title: 'The Hearing Calendar', verb: 'heard', singular: 'case', plural: 'cases', slot: 'session', slots: 'sessions',
      attrs: ['heard in the morning', 'heard in the afternoon'], attrShort: 'morning',
      setupTpl: 'A judge hears exactly {N} cases ({L}) over {N} consecutive sessions numbered 1 through {n}, one case per session. Each case is also either {A0} or {A1}. The calendar must meet all of the following conditions:' },
    { id: 'talks', title: 'The Two Rooms', verb: 'given', singular: 'talk', plural: 'talks', slot: 'slot', slots: 'slots',
      attrs: ['given in the main hall', 'given in the annex'], attrShort: 'main hall',
      setupTpl: 'A conference gives exactly {N} talks ({L}) one at a time in {N} slots numbered 1 through {n}. Each talk is also either {A0} or {A1}. The program must meet all of the following conditions:' },
    { id: 'lots', title: 'The Saleroom', verb: 'sold', singular: 'lot', plural: 'lots', slot: 'position', slots: 'positions',
      attrs: ['sold to a dealer', 'sold to a private buyer'], attrShort: 'dealer',
      setupTpl: 'An auctioneer sells exactly {N} lots ({L}) one at a time in {N} positions numbered 1 through {n}. Each lot is also either {A0} or {A1}. The sale must meet all of the following conditions:' },
    { id: 'stage', title: 'The Bill', verb: 'staged', singular: 'act', plural: 'acts', slot: 'slot', slots: 'slots',
      attrs: ['staged with a live band', 'staged with a recording'], attrShort: 'live band',
      setupTpl: 'A theater stages exactly {N} acts ({L}) one at a time in {N} slots numbered 1 through {n}. Each act is also either {A0} or {A1}. The bill must meet all of the following conditions:' },
    { id: 'magnums', title: 'The Cellar Flight', verb: 'poured', singular: 'wine', plural: 'wines', slot: 'slot', slots: 'slots',
      attrs: ['poured from a magnum', 'poured from a standard bottle'], attrShort: 'magnum',
      setupTpl: 'A sommelier pours exactly {N} wines ({L}) one at a time in {N} slots numbered 1 through {n}. Each wine is also either {A0} or {A1}. The flight must meet all of the following conditions:' },
    { id: 'inspections', title: 'The Inspection Round', verb: 'inspected', singular: 'site', plural: 'sites', slot: 'day', slots: 'days',
      attrs: ['inspected on site', 'inspected remotely'], attrShort: 'on site',
      setupTpl: 'An inspector visits exactly {N} sites ({L}) over {N} consecutive days numbered 1 through {n}, one site per day. Each site is also either {A0} or {A1}. The round must meet all of the following conditions:' },
    { id: 'oaths', title: 'The Oath Book', verb: 'called', singular: 'witness', plural: 'witnesses', slot: 'position', slots: 'positions',
      attrs: ['sworn', 'affirmed'], attrShort: 'sworn',
      setupTpl: 'Counsel calls exactly {N} witnesses ({L}) one at a time in {N} positions numbered 1 through {n}. Each witness is also either {A0} or {A1}. The order must meet all of the following conditions:' },
    { id: 'prints', title: 'The Repertory', verb: 'screened', singular: 'film', plural: 'films', slot: 'evening', slots: 'evenings',
      attrs: ['screened on film', 'screened digitally'], attrShort: 'on film',
      setupTpl: 'A repertory house screens exactly {N} films ({L}) over {N} consecutive evenings numbered 1 through {n}, one film per evening. Each film is also either {A0} or {A1}. The season must meet all of the following conditions:' },
    { id: 'benches', title: 'The Two Benches', verb: 'listed', singular: 'appeal', plural: 'appeals', slot: 'slot', slots: 'slots',
      attrs: ['listed before the full bench', 'listed before a single judge'], attrShort: 'full bench',
      setupTpl: 'A registrar lists exactly {N} appeals ({L}) one at a time in {N} slots numbered 1 through {n}. Each appeal is also either {A0} or {A1}. The list must meet all of the following conditions:' },
  ],
};

// LSAT games label entities with letters, and the letter set itself varies from
// game to game. Drawing a contiguous run from a rotating start keeps that feel
// without ever producing a confusable pair (no I, O, or Q).
export const LETTER_POOL = 'ABCDEFGHJKLMNPRSTUVWXYZ'.split('');
export function letterRun(start, n) {
  return Array.from({ length: n }, (_, i) => LETTER_POOL[(start + i) % LETTER_POOL.length]).sort();
}
