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
    num: 1, quizId: 'hearsay-7-24-26', live: '2026-07-24', dateLabel: 'July 24, 2026', sunday: false,
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
    num: 2, quizId: 'hearsay-7-25-26', live: '2026-07-25', dateLabel: 'July 25, 2026', sunday: false,
    noun: 'sailing', listLabel: 'the harbour board',
    attrs: ['port', 'day'],
    who: ['Marisol', 'Ivo'],
    cards: [
      { a: 'Palermo', b: 'Tuesday' }, { a: 'Split', b: 'Saturday' }, { a: 'Bergen', b: 'Monday' },
      { a: 'Bergen', b: 'Thursday' }, { a: 'Bergen', b: 'Friday' }, { a: 'Tangier', b: 'Tuesday' },
      { a: 'Split', b: 'Tuesday' }, { a: 'Split', b: 'Friday' }, { a: 'Split', b: 'Thursday' },
      { a: 'Tangier', b: 'Sunday' }, { a: 'Cadiz', b: 'Tuesday' },
    ],
    script: [
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 3, quizId: 'hearsay-7-26-26', live: '2026-07-26', dateLabel: 'July 26, 2026', sunday: true,
    noun: 'painting', listLabel: 'the auction catalogue',
    attrs: ['gallery', 'year', 'seal'],
    who: ['Hester', 'Cato', 'Ottoline'],
    cards: [
      { a: 'Corvina', b: '1903', c: 'a black seal' }, { a: 'Fairholme', b: '1928', c: 'a black seal' }, { a: 'Everly', b: '1911', c: 'a blue seal' },
      { a: 'Duxley', b: '1928', c: 'a red seal' }, { a: 'Corvina', b: '1947', c: 'a red seal' }, { a: 'Everly', b: '1947', c: 'a blue seal' },
      { a: 'Everly', b: '1903', c: 'a blue seal' }, { a: 'Fairholme', b: '1947', c: 'a black seal' }, { a: 'Duxley', b: '1903', c: 'a blue seal' },
      { a: 'Corvina', b: '1928', c: 'a blue seal' }, { a: 'Corvina', b: '1934', c: 'a red seal' }, { a: 'Ashcroft', b: '1934', c: 'a red seal' },
      { a: 'Corvina', b: '1952', c: 'a blue seal' }, { a: 'Everly', b: '1928', c: 'a black seal' }, { a: 'Duxley', b: '1911', c: 'a blue seal' },
      { a: 'Fairholme', b: '1911', c: 'a blue seal' }, { a: 'Ashcroft', b: '1928', c: 'a black seal' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'dontKnow' },
      { who: 'c', type: 'knowOtherDoesnt', other: 'a' },
      { who: 'a', type: 'stillDontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 4, quizId: 'hearsay-7-27-26', live: '2026-07-27', dateLabel: 'July 27, 2026', sunday: false,
    noun: 'train', listLabel: 'the departure board',
    attrs: ['platform', 'hour'],
    who: ['Nadia', 'Osric'],
    cards: [
      { a: 'Platform 9', b: '9:15' }, { a: 'Platform 11', b: '6:05' }, { a: 'Platform 7', b: '13:55' },
      { a: 'Platform 11', b: '13:55' }, { a: 'Platform 4', b: '9:15' }, { a: 'Platform 7', b: '9:15' },
      { a: 'Platform 14', b: '16:20' }, { a: 'Platform 11', b: '7:40' }, { a: 'Platform 11', b: '16:20' },
      { a: 'Platform 11', b: '11:30' }, { a: 'Platform 14', b: '11:30' }, { a: 'Platform 9', b: '16:20' },
      { a: 'Platform 4', b: '6:05' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'stillDontKnow' },
      { who: 'a', type: 'knowNowOtherStill', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 5, quizId: 'hearsay-7-28-26', live: '2026-07-28', dateLabel: 'July 28, 2026', sunday: false,
    noun: 'birthday', listLabel: 'the shortlist',
    attrs: ['month', 'day'],
    who: ['Delphine', 'Bram'],
    cards: [
      { a: 'August', b: '18th' }, { a: 'March', b: '18th' }, { a: 'April', b: '23rd' },
      { a: 'March', b: '4th' }, { a: 'December', b: '4th' }, { a: 'April', b: '27th' },
      { a: 'March', b: '27th' }, { a: 'October', b: '23rd' }, { a: 'April', b: '18th' },
      { a: 'December', b: '14th' }, { a: 'December', b: '9th' },
    ],
    script: [
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 6, quizId: 'hearsay-7-29-26', live: '2026-07-29', dateLabel: 'July 29, 2026', sunday: false,
    noun: 'room', listLabel: 'the register',
    attrs: ['floor', 'suite'],
    who: ['Simone', 'Auberon'],
    cards: [
      { a: '6th floor', b: 'Suite A' }, { a: '6th floor', b: 'Suite F' }, { a: '3rd floor', b: 'Suite R' },
      { a: '9th floor', b: 'Suite M' }, { a: '3rd floor', b: 'Suite A' }, { a: '8th floor', b: 'Suite C' },
      { a: '8th floor', b: 'Suite M' }, { a: '8th floor', b: 'Suite F' }, { a: '3rd floor', b: 'Suite J' },
      { a: '8th floor', b: 'Suite R' }, { a: '6th floor', b: 'Suite R' }, { a: '9th floor', b: 'Suite J' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'stillDontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 7, quizId: 'hearsay-7-30-26', live: '2026-07-30', dateLabel: 'July 30, 2026', sunday: false,
    noun: 'lot', listLabel: 'the sale sheet',
    attrs: ['house', 'lot'],
    who: ['Perpetua', 'Casimir'],
    cards: [
      { a: 'Ashby', b: 'Lot 27' }, { a: 'Grimaldi', b: 'Lot 74' }, { a: 'Grimaldi', b: 'Lot 27' },
      { a: 'Ives', b: 'Lot 12' }, { a: 'Grimaldi', b: 'Lot 68' }, { a: 'Ashby', b: 'Lot 41' },
      { a: 'Halloran', b: 'Lot 74' }, { a: 'Ives', b: 'Lot 41' }, { a: 'Halloran', b: 'Lot 41' },
      { a: 'Fenwick', b: 'Lot 12' }, { a: 'Fenwick', b: 'Lot 68' }, { a: 'Grimaldi', b: 'Lot 55' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'stillDontKnow' },
      { who: 'a', type: 'knowNowOtherStill', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 8, quizId: 'hearsay-7-31-26', live: '2026-07-31', dateLabel: 'July 31, 2026', sunday: false,
    noun: 'painting', listLabel: 'the auction catalogue',
    attrs: ['gallery', 'year'],
    who: ['Hester', 'Cato'],
    cards: [
      { a: 'Fairholme', b: '1911' }, { a: 'Corvina', b: '1928' }, { a: 'Fairholme', b: '1934' },
      { a: 'Everly', b: '1903' }, { a: 'Corvina', b: '1947' }, { a: 'Everly', b: '1947' },
      { a: 'Ashcroft', b: '1947' }, { a: 'Fairholme', b: '1928' }, { a: 'Corvina', b: '1911' },
      { a: 'Everly', b: '1952' }, { a: 'Belvoir', b: '1911' },
    ],
    script: [
      { who: 'a', type: 'dontKnow' },
      { who: 'b', type: 'knowOtherDoesnt', other: 'a' },
      { who: 'a', type: 'stillDontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 9, quizId: 'hearsay-8-1-26', live: '2026-08-01', dateLabel: 'August 1, 2026', sunday: false,
    noun: 'room', listLabel: 'the register',
    attrs: ['floor', 'suite'],
    who: ['Simone', 'Auberon'],
    cards: [
      { a: '6th floor', b: 'Suite J' }, { a: '3rd floor', b: 'Suite R' }, { a: '8th floor', b: 'Suite R' },
      { a: '6th floor', b: 'Suite C' }, { a: '6th floor', b: 'Suite F' }, { a: '3rd floor', b: 'Suite C' },
      { a: '9th floor', b: 'Suite A' }, { a: '6th floor', b: 'Suite A' }, { a: '8th floor', b: 'Suite M' },
      { a: '3rd floor', b: 'Suite M' }, { a: '9th floor', b: 'Suite F' }, { a: '8th floor', b: 'Suite F' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'stillDontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 10, quizId: 'hearsay-8-2-26', live: '2026-08-02', dateLabel: 'August 2, 2026', sunday: true,
    noun: 'bottle', listLabel: 'the cellar list',
    attrs: ['region', 'year', 'seal'],
    who: ['Odette', 'Rufus', 'Ottoline'],
    cards: [
      { a: 'Etna', b: '2011', c: 'a blue seal' }, { a: 'Etna', b: '2019', c: 'a green seal' }, { a: 'Douro', b: '2014', c: 'a blue seal' },
      { a: 'Douro', b: '2021', c: 'a green seal' }, { a: 'Barolo', b: '2021', c: 'a blue seal' }, { a: 'Rioja', b: '2019', c: 'a blue seal' },
      { a: 'Mosel', b: '2014', c: 'a green seal' }, { a: 'Barolo', b: '2014', c: 'a blue seal' }, { a: 'Barolo', b: '2023', c: 'a red seal' },
      { a: 'Mosel', b: '2011', c: 'a green seal' }, { a: 'Douro', b: '2016', c: 'a green seal' }, { a: 'Rioja', b: '2023', c: 'a green seal' },
      { a: 'Mosel', b: '2023', c: 'a green seal' }, { a: 'Douro', b: '2019', c: 'a red seal' }, { a: 'Etna', b: '2023', c: 'a blue seal' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'dontKnow' },
      { who: 'c', type: 'knowOtherDoesnt', other: 'a' },
      { who: 'a', type: 'stillDontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 11, quizId: 'hearsay-8-3-26', live: '2026-08-03', dateLabel: 'August 3, 2026', sunday: false,
    noun: 'train', listLabel: 'the departure board',
    attrs: ['platform', 'hour'],
    who: ['Nadia', 'Osric'],
    cards: [
      { a: 'Platform 2', b: '13:55' }, { a: 'Platform 14', b: '9:15' }, { a: 'Platform 4', b: '7:40' },
      { a: 'Platform 11', b: '6:05' }, { a: 'Platform 14', b: '16:20' }, { a: 'Platform 2', b: '16:20' },
      { a: 'Platform 11', b: '11:30' }, { a: 'Platform 4', b: '6:05' }, { a: 'Platform 11', b: '13:55' },
      { a: 'Platform 11', b: '9:15' }, { a: 'Platform 7', b: '16:20' }, { a: 'Platform 7', b: '7:40' },
      { a: 'Platform 11', b: '16:20' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'stillDontKnow' },
      { who: 'a', type: 'knowNowOtherStill', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 12, quizId: 'hearsay-8-4-26', live: '2026-08-04', dateLabel: 'August 4, 2026', sunday: false,
    noun: 'lot', listLabel: 'the sale sheet',
    attrs: ['house', 'lot'],
    who: ['Perpetua', 'Casimir'],
    cards: [
      { a: 'Ashby', b: 'Lot 74' }, { a: 'Grimaldi', b: 'Lot 41' }, { a: 'Fenwick', b: 'Lot 41' },
      { a: 'Ashby', b: 'Lot 27' }, { a: 'Halloran', b: 'Lot 12' }, { a: 'Halloran', b: 'Lot 74' },
      { a: 'Fenwick', b: 'Lot 68' }, { a: 'Grimaldi', b: 'Lot 68' }, { a: 'Ashby', b: 'Lot 55' },
      { a: 'Grimaldi', b: 'Lot 12' }, { a: 'Ives', b: 'Lot 41' }, { a: 'Fenwick', b: 'Lot 27' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'stillDontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 13, quizId: 'hearsay-8-5-26', live: '2026-08-05', dateLabel: 'August 5, 2026', sunday: false,
    noun: 'sailing', listLabel: 'the harbour board',
    attrs: ['port', 'day'],
    who: ['Marisol', 'Ivo'],
    cards: [
      { a: 'Cadiz', b: 'Thursday' }, { a: 'Palermo', b: 'Sunday' }, { a: 'Palermo', b: 'Monday' },
      { a: 'Kotor', b: 'Monday' }, { a: 'Bergen', b: 'Sunday' }, { a: 'Bergen', b: 'Friday' },
      { a: 'Tangier', b: 'Tuesday' }, { a: 'Palermo', b: 'Thursday' }, { a: 'Tangier', b: 'Sunday' },
      { a: 'Bergen', b: 'Saturday' }, { a: 'Palermo', b: 'Tuesday' }, { a: 'Cadiz', b: 'Saturday' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'dontKnow' },
      { who: 'a', type: 'stillDontKnow' },
      { who: 'b', type: 'know' },
    ],
  },
  {
    num: 14, quizId: 'hearsay-8-6-26', live: '2026-08-06', dateLabel: 'August 6, 2026', sunday: false,
    noun: 'birthday', listLabel: 'the shortlist',
    attrs: ['month', 'day'],
    who: ['Delphine', 'Bram'],
    cards: [
      { a: 'June', b: '9th' }, { a: 'August', b: '27th' }, { a: 'June', b: '4th' },
      { a: 'April', b: '18th' }, { a: 'June', b: '23rd' }, { a: 'June', b: '27th' },
      { a: 'June', b: '18th' }, { a: 'August', b: '14th' }, { a: 'March', b: '9th' },
      { a: 'April', b: '4th' }, { a: 'March', b: '14th' }, { a: 'October', b: '14th' },
      { a: 'October', b: '4th' },
    ],
    script: [
      { who: 'a', type: 'knowOtherDoesnt', other: 'b' },
      { who: 'b', type: 'stillDontKnow' },
      { who: 'a', type: 'knowNowOtherStill', other: 'b' },
      { who: 'b', type: 'know' },
    ],
  },
];
