// Puzzle data for Hearsay, the daily epistemic deduction game. Imported ONLY
// by the server page (app/hearsay/page.js), which filters live<=today before
// passing boards to the client, so future boards never ship early.
//
// A shortlist of cards is public. Each character is privately told ONE of the
// secret card's attributes (weekdays two characters, Sundays three), then they
// speak in turn. What they say about their own ignorance is the evidence.
//
// Statement schema (who = the attribute key its speaker was told):
//   dontKnow          "I don't know which it is."
//   know              "Now I know which it is."
//   knowOtherDoesnt   "I don't know it, and I know <other> doesn't either."
//     (carries `other`, the attribute key of the character spoken about)
//
// Semantics are public-announcement logic over the live candidate set S:
//   dontKnow(x)          keep cards whose x-value is shared by >= 2 cards in S
//   know(x)              keep cards whose x-value is unique in S
//   knowOtherDoesnt(x,y) keep cards x cannot pin, where every card sharing that
//                        x-value also has a non-unique y-value
//
// LEAK GUARD: the answer is NOT stored. The client replays this same
// simulation to find the single surviving card, exactly as the generator proved
// it unique. Every board is machine-verified (scripts/verify-hearsay.mjs) to
// leave exactly one card, to narrow at every line, to stay ambiguous until the
// final line, and to be unpinnable from any single attribute at the start.
export const PUZZLES = [
  {
    num: 1, quizId: 'hearsay-7-25-26', live: '2026-07-25', dateLabel: 'July 25, 2026', sunday: false,
    noun: 'bottle', listLabel: 'the cellar list',
    attrs: ['region', 'year'],
    who: ['Odette', 'Rufus'],
    cards: [
      { a: 'Mosel', b: '2014' }, { a: 'Mosel', b: '2016' }, { a: 'Barolo', b: '2014' },
      { a: 'Barolo', b: '2019' }, { a: 'Rioja', b: '2019' }, { a: 'Chinon', b: '2019' },
      { a: 'Rioja', b: '2011' }, { a: 'Rioja', b: '2014' }, { a: 'Rioja', b: '2021' },
    ],
    script: [
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'know' },
    ],
  },
  {
    num: 2, quizId: 'hearsay-7-26-26', live: '2026-07-26', dateLabel: 'July 26, 2026', sunday: true,
    noun: 'sailing', listLabel: 'the harbour board',
    attrs: ['port', 'day', 'seal'],
    who: ['Marisol', 'Ivo', 'Ottoline'],
    cards: [
      { a: 'Cadiz', b: 'Monday', c: 'a blue seal' }, { a: 'Tangier', b: 'Tuesday', c: 'a blue seal' }, { a: 'Palermo', b: 'Thursday', c: 'a red seal' },
      { a: 'Tangier', b: 'Thursday', c: 'a red seal' }, { a: 'Tangier', b: 'Friday', c: 'a red seal' }, { a: 'Palermo', b: 'Friday', c: 'a blue seal' },
      { a: 'Tangier', b: 'Monday', c: 'a red seal' }, { a: 'Palermo', b: 'Monday', c: 'a blue seal' }, { a: 'Cadiz', b: 'Saturday', c: 'a blue seal' },
      { a: 'Palermo', b: 'Tuesday', c: 'a red seal' }, { a: 'Tangier', b: 'Saturday', c: 'a green seal' }, { a: 'Cadiz', b: 'Friday', c: 'a blue seal' },
      { a: 'Palermo', b: 'Saturday', c: 'a red seal' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'c' },
      { who: 'b', type: 'dontKnow' },
      { who: 'c', type: 'dontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 3, quizId: 'hearsay-7-27-26', live: '2026-07-27', dateLabel: 'July 27, 2026', sunday: false,
    noun: 'painting', listLabel: 'the auction catalogue',
    attrs: ['gallery', 'year'],
    who: ['Hester', 'Cato'],
    cards: [
      { a: 'Belvoir', b: '1934' }, { a: 'Belvoir', b: '1911' }, { a: 'Belvoir', b: '1903' },
      { a: 'Duxley', b: '1928' }, { a: 'Everly', b: '1911' }, { a: 'Belvoir', b: '1947' },
      { a: 'Duxley', b: '1947' }, { a: 'Everly', b: '1928' }, { a: 'Everly', b: '1903' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'know' },
      { who: 'a', type: 'know' },
    ],
  },
  {
    num: 4, quizId: 'hearsay-7-28-26', live: '2026-07-28', dateLabel: 'July 28, 2026', sunday: false,
    noun: 'train', listLabel: 'the departure board',
    attrs: ['platform', 'hour'],
    who: ['Nadia', 'Osric'],
    cards: [
      { a: 'Platform 7', b: '7:40' }, { a: 'Platform 9', b: '11:30' }, { a: 'Platform 4', b: '11:30' },
      { a: 'Platform 7', b: '11:30' }, { a: 'Platform 11', b: '9:15' }, { a: 'Platform 9', b: '13:55' },
      { a: 'Platform 7', b: '9:15' }, { a: 'Platform 7', b: '6:05' }, { a: 'Platform 9', b: '6:05' },
    ],
    script: [
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 5, quizId: 'hearsay-7-29-26', live: '2026-07-29', dateLabel: 'July 29, 2026', sunday: false,
    noun: 'birthday', listLabel: 'the shortlist',
    attrs: ['month', 'day'],
    who: ['Delphine', 'Bram'],
    cards: [
      { a: 'August', b: '23rd' }, { a: 'August', b: '14th' }, { a: 'October', b: '14th' },
      { a: 'August', b: '4th' }, { a: 'March', b: '23rd' }, { a: 'October', b: '9th' },
      { a: 'March', b: '14th' }, { a: 'December', b: '18th' }, { a: 'August', b: '18th' },
    ],
    script: [
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'know' },
    ],
  },
  {
    num: 6, quizId: 'hearsay-7-30-26', live: '2026-07-30', dateLabel: 'July 30, 2026', sunday: false,
    noun: 'room', listLabel: 'the register',
    attrs: ['floor', 'suite'],
    who: ['Simone', 'Auberon'],
    cards: [
      { a: '6th floor', b: 'Suite C' }, { a: '8th floor', b: 'Suite A' }, { a: '6th floor', b: 'Suite A' },
      { a: '3rd floor', b: 'Suite J' }, { a: '2nd floor', b: 'Suite J' }, { a: '6th floor', b: 'Suite M' },
      { a: '8th floor', b: 'Suite M' }, { a: '3rd floor', b: 'Suite C' }, { a: '6th floor', b: 'Suite J' },
    ],
    script: [
      { who: 'b', type: 'knowOtherDoesnt', other: 'a' },
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 7, quizId: 'hearsay-7-31-26', live: '2026-07-31', dateLabel: 'July 31, 2026', sunday: false,
    noun: 'lot', listLabel: 'the sale sheet',
    attrs: ['house', 'lot'],
    who: ['Perpetua', 'Casimir'],
    cards: [
      { a: 'Halloran', b: 'Lot 55' }, { a: 'Fenwick', b: 'Lot 68' }, { a: 'Fenwick', b: 'Lot 12' },
      { a: 'Ives', b: 'Lot 55' }, { a: 'Ashby', b: 'Lot 27' }, { a: 'Ashby', b: 'Lot 41' },
      { a: 'Fenwick', b: 'Lot 55' }, { a: 'Halloran', b: 'Lot 41' }, { a: 'Fenwick', b: 'Lot 41' },
    ],
    script: [
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'know' },
    ],
  },
  {
    num: 8, quizId: 'hearsay-8-1-26', live: '2026-08-01', dateLabel: 'August 1, 2026', sunday: false,
    noun: 'painting', listLabel: 'the auction catalogue',
    attrs: ['gallery', 'year'],
    who: ['Hester', 'Cato'],
    cards: [
      { a: 'Belvoir', b: '1928' }, { a: 'Corvina', b: '1928' }, { a: 'Corvina', b: '1911' },
      { a: 'Belvoir', b: '1903' }, { a: 'Ashcroft', b: '1911' }, { a: 'Duxley', b: '1903' },
      { a: 'Duxley', b: '1911' }, { a: 'Belvoir', b: '1947' }, { a: 'Belvoir', b: '1911' },
      { a: 'Corvina', b: '1934' }, { a: 'Corvina', b: '1947' },
    ],
    script: [
      { who: 'b', type: 'knowOtherDoesnt', other: 'a' },
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 9, quizId: 'hearsay-8-2-26', live: '2026-08-02', dateLabel: 'August 2, 2026', sunday: true,
    noun: 'room', listLabel: 'the register',
    attrs: ['floor', 'suite', 'seal'],
    who: ['Simone', 'Auberon', 'Ottoline'],
    cards: [
      { a: '2nd floor', b: 'Suite C', c: 'a black seal' }, { a: '5th floor', b: 'Suite A', c: 'a black seal' }, { a: '2nd floor', b: 'Suite F', c: 'a black seal' },
      { a: '3rd floor', b: 'Suite C', c: 'a black seal' }, { a: '2nd floor', b: 'Suite A', c: 'a blue seal' }, { a: '5th floor', b: 'Suite F', c: 'a red seal' },
      { a: '3rd floor', b: 'Suite A', c: 'a black seal' }, { a: '5th floor', b: 'Suite C', c: 'a blue seal' }, { a: '2nd floor', b: 'Suite J', c: 'a black seal' },
      { a: '5th floor', b: 'Suite M', c: 'a blue seal' }, { a: '5th floor', b: 'Suite J', c: 'a black seal' }, { a: '3rd floor', b: 'Suite M', c: 'a blue seal' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'c' },
      { who: 'b', type: 'dontKnow' },
      { who: 'c', type: 'dontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 10, quizId: 'hearsay-8-3-26', live: '2026-08-03', dateLabel: 'August 3, 2026', sunday: false,
    noun: 'bottle', listLabel: 'the cellar list',
    attrs: ['region', 'year'],
    who: ['Odette', 'Rufus'],
    cards: [
      { a: 'Douro', b: '2021' }, { a: 'Mosel', b: '2021' }, { a: 'Douro', b: '2016' },
      { a: 'Rioja', b: '2016' }, { a: 'Chinon', b: '2021' }, { a: 'Mosel', b: '2019' },
      { a: 'Chinon', b: '2011' }, { a: 'Mosel', b: '2016' }, { a: 'Mosel', b: '2014' },
    ],
    script: [
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'know' },
    ],
  },
  {
    num: 11, quizId: 'hearsay-8-4-26', live: '2026-08-04', dateLabel: 'August 4, 2026', sunday: false,
    noun: 'train', listLabel: 'the departure board',
    attrs: ['platform', 'hour'],
    who: ['Nadia', 'Osric'],
    cards: [
      { a: 'Platform 11', b: '9:15' }, { a: 'Platform 2', b: '7:40' }, { a: 'Platform 7', b: '7:40' },
      { a: 'Platform 4', b: '7:40' }, { a: 'Platform 2', b: '6:05' }, { a: 'Platform 2', b: '11:30' },
      { a: 'Platform 4', b: '13:55' }, { a: 'Platform 7', b: '6:05' }, { a: 'Platform 4', b: '9:15' },
    ],
    script: [
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 12, quizId: 'hearsay-8-5-26', live: '2026-08-05', dateLabel: 'August 5, 2026', sunday: false,
    noun: 'lot', listLabel: 'the sale sheet',
    attrs: ['house', 'lot'],
    who: ['Perpetua', 'Casimir'],
    cards: [
      { a: 'Fenwick', b: 'Lot 12' }, { a: 'Grimaldi', b: 'Lot 41' }, { a: 'Halloran', b: 'Lot 55' },
      { a: 'Grimaldi', b: 'Lot 55' }, { a: 'Fenwick', b: 'Lot 41' }, { a: 'Halloran', b: 'Lot 68' },
      { a: 'Grimaldi', b: 'Lot 12' }, { a: 'Fenwick', b: 'Lot 27' }, { a: 'Fenwick', b: 'Lot 68' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'know' },
      { who: 'a', type: 'know' },
    ],
  },
  {
    num: 13, quizId: 'hearsay-8-6-26', live: '2026-08-06', dateLabel: 'August 6, 2026', sunday: false,
    noun: 'sailing', listLabel: 'the harbour board',
    attrs: ['port', 'day'],
    who: ['Marisol', 'Ivo'],
    cards: [
      { a: 'Bergen', b: 'Tuesday' }, { a: 'Bergen', b: 'Saturday' }, { a: 'Bergen', b: 'Friday' },
      { a: 'Tangier', b: 'Saturday' }, { a: 'Cadiz', b: 'Thursday' }, { a: 'Cadiz', b: 'Monday' },
      { a: 'Tangier', b: 'Tuesday' }, { a: 'Split', b: 'Monday' }, { a: 'Cadiz', b: 'Saturday' },
    ],
    script: [
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'know' },
    ],
  },
  {
    num: 14, quizId: 'hearsay-8-7-26', live: '2026-08-07', dateLabel: 'August 7, 2026', sunday: false,
    noun: 'birthday', listLabel: 'the shortlist',
    attrs: ['month', 'day'],
    who: ['Delphine', 'Bram'],
    cards: [
      { a: 'March', b: '18th' }, { a: 'March', b: '23rd' }, { a: 'March', b: '14th' },
      { a: 'October', b: '9th' }, { a: 'October', b: '18th' }, { a: 'December', b: '18th' },
      { a: 'June', b: '14th' }, { a: 'December', b: '23rd' }, { a: 'June', b: '4th' },
    ],
    script: [
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
];
