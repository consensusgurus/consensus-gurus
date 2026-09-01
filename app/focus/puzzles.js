// Puzzle data for Focus, the daily zoomed-photo game. One photo a day: `a` is
// the answer (which must be one of its weekday subject's options, see
// subjects.js), `t` the Wikimedia Commons file title the image is fetched
// from, `lic`/`by` the licence and author printed under the reveal, and
// `fx`/`fy` the point (0..1) the first frame zooms into. Every title was
// checked against the Commons API before it went in; scripts/verify-focus.mjs
// re-checks the bank's shape and subject membership (it cannot reach the
// network). The server page strips a day before it ships, so tomorrow's
// answer and photo never reach a browser; the image route refuses any day
// that is not yet live. The shared daily consumers read only
// num/quizId/live/dateLabel/sunday and ignore the rest.
export const PUZZLES = [
  { num: 1, quizId: 'focus-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false, a: 'The Starry Night', t: 'Van Gogh - Starry Night - Google Art Project.jpg', lic: 'Public domain', by: 'Vincent van Gogh', fx: 0.5, fy: 0.4 },
  { num: 2, quizId: 'focus-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false, a: 'Vespa', t: 'Amsterdam - Vespa scooter - 0332.jpg', lic: 'CC BY-SA 3.0', by: 'Jorge Royan', fx: 0.5, fy: 0.5 },
  { num: 3, quizId: 'focus-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false, a: 'Albert Einstein', t: 'Albert Einstein Head.jpg', lic: 'Public domain', by: 'Orren Jack Turner', fx: 0.5, fy: 0.45 },
  { num: 4, quizId: 'focus-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false, a: 'Manhattan', t: 'Manhattan by Sentinel-2.jpg', lic: 'CC BY-SA 3.0 IGO', by: 'Copernicus Sentinel-2, ESA', fx: 0.5, fy: 0.5 },
  { num: 5, quizId: 'focus-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: false, a: 'Saturn', t: 'Saturn during Equinox.jpg', lic: 'Public domain', by: 'NASA / JPL / Space Science Institute', fx: 0.5, fy: 0.5 },
  { num: 6, quizId: 'focus-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false, a: 'Golden Gate Bridge', t: 'GoldenGateBridge-001.jpg', lic: 'CC BY 2.5', by: 'Rich Niewiroski Jr.', fx: 0.35, fy: 0.4 },
  { num: 7, quizId: 'focus-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false, a: 'Giraffe', t: 'GiraffePortrait.jpg', lic: 'Public domain', by: 'DkEgy', fx: 0.5, fy: 0.45 },
  { num: 8, quizId: 'focus-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false, a: 'Girl with a Pearl Earring', t: '1665 Girl with a Pearl Earring.jpg', lic: 'Public domain', by: 'Johannes Vermeer', fx: 0.5, fy: 0.4 },
  { num: 9, quizId: 'focus-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false, a: 'Volkswagen Beetle', t: 'Blue Volkswagen Beetle side view.jpg', lic: 'CC BY 4.0', by: 'Renée Kools', fx: 0.5, fy: 0.5 },
  { num: 10, quizId: 'focus-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false, a: 'Abraham Lincoln', t: 'Abraham Lincoln O-77 matte collodion print.jpg', lic: 'Public domain', by: 'Alexander Gardner', fx: 0.5, fy: 0.4 },
  { num: 11, quizId: 'focus-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false, a: 'Venice', t: 'Venice, Italy by Planet Labs.jpg', lic: 'CC BY-SA 4.0', by: 'Planet Labs, Inc.', fx: 0.5, fy: 0.5 },
  { num: 12, quizId: 'focus-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: false, a: 'Jupiter', t: 'Jupiter and its shrunken Great Red Spot.jpg', lic: 'Public domain', by: 'NASA, ESA, and A. Simon (GSFC)', fx: 0.5, fy: 0.6 },
  { num: 13, quizId: 'focus-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false, a: 'Eiffel Tower', t: 'Tour Eiffel Wikimedia Commons.jpg', lic: 'Public domain', by: 'Benh Lieu Song', fx: 0.5, fy: 0.35 },
  { num: 14, quizId: 'focus-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false, a: 'Zebra', t: '099 Plains zebra head close-up in Etosha National Park Photo by Giles Laurent.jpg', lic: 'CC BY-SA 4.0', by: 'Giles Laurent', fx: 0.5, fy: 0.5 },
  { num: 15, quizId: 'focus-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false, a: 'The Great Wave off Kanagawa', t: 'Tsunami by hokusai 19th century.jpg', lic: 'Public domain', by: 'Katsushika Hokusai', fx: 0.35, fy: 0.4 },
  { num: 16, quizId: 'focus-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false, a: 'Rubik’s Cube', t: 'Rubiks cube by keqs.jpg', lic: 'CC BY-SA 3.0', by: 'Lars Karlsson (Keqs)', fx: 0.5, fy: 0.5 },
  { num: 17, quizId: 'focus-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false, a: 'Frida Kahlo', t: 'Frida Kahlo, by Guillermo Kahlo.jpg', lic: 'Public domain', by: 'Guillermo Kahlo', fx: 0.5, fy: 0.4 },
  { num: 18, quizId: 'focus-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false, a: 'Palm Jumeirah', t: 'Palm Island Resort.jpg', lic: 'Public domain', by: 'NASA / Leroy Chiao', fx: 0.5, fy: 0.5 },
  { num: 19, quizId: 'focus-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: false, a: 'The Moon', t: 'FullMoon2010.jpg', lic: 'CC BY-SA 3.0', by: 'Gregory H. Revera', fx: 0.5, fy: 0.5 },
  { num: 20, quizId: 'focus-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false, a: 'Taj Mahal', t: 'Taj Mahal (Edited).jpeg', lic: 'CC BY-SA 4.0', by: 'Yann; edited by Jim Carter', fx: 0.5, fy: 0.45 },
  { num: 21, quizId: 'focus-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false, a: 'Flamingo', t: '001 Greater flamingo in flight in the Camargue Photo by Giles Laurent.jpg', lic: 'CC BY-SA 4.0', by: 'Giles Laurent', fx: 0.45, fy: 0.5 },
  { num: 22, quizId: 'focus-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false, a: 'The Scream', t: 'Edvard Munch, 1893, The Scream, oil, tempera and pastel on cardboard, 91 x 73 cm, National Gallery of Norway.jpg', lic: 'Public domain', by: 'Edvard Munch', fx: 0.5, fy: 0.55 },
  { num: 23, quizId: 'focus-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false, a: 'Grand piano', t: 'Steinway & Sons concert grand piano, model D-274, manufactured at Steinway\'s factory in Hamburg, Germany.png', lic: 'CC BY-SA 3.0', by: 'Steinway & Sons', fx: 0.5, fy: 0.5 },
  { num: 24, quizId: 'focus-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false, a: 'Marie Curie', t: 'Marie Curie c1920.jpg', lic: 'Public domain', by: 'Henri Manuel', fx: 0.5, fy: 0.4 },
  { num: 25, quizId: 'focus-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false, a: 'Grand Canyon', t: 'Grand Canyon Arizona USA - Planet Labs satellite image.jpg', lic: 'CC BY-SA 4.0', by: 'Planet Labs, Inc.', fx: 0.5, fy: 0.5 },
  { num: 26, quizId: 'focus-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: false, a: 'Mars', t: 'OSIRIS Mars true color.jpg', lic: 'CC BY-SA 3.0 IGO', by: 'ESA & MPS for OSIRIS Team', fx: 0.5, fy: 0.5 },
  { num: 27, quizId: 'focus-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false, a: 'Sydney Opera House', t: 'Sydney Opera House - Dec 2008.jpg', lic: 'CC BY-SA 3.0', by: 'Diliff', fx: 0.5, fy: 0.5 },
  { num: 28, quizId: 'focus-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false, a: 'Chameleon', t: 'Chamaeleo calyptratus female.jpg', lic: 'Public domain', by: 'Drägüs', fx: 0.5, fy: 0.5 },
  { num: 29, quizId: 'focus-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false, a: 'American Gothic', t: 'Grant Wood - American Gothic - Google Art Project.jpg', lic: 'Public domain', by: 'Grant Wood', fx: 0.5, fy: 0.45 },
  { num: 30, quizId: 'focus-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false, a: 'Concorde', t: 'G-BOAC 2 BAC-SNIAS Concorde 102 British Airways MAN 22MAY04 (11432526884).jpg', lic: 'CC BY-SA 3.0', by: 'Ken Fielding', fx: 0.5, fy: 0.5 },
  { num: 31, quizId: 'focus-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false, a: 'Nikola Tesla', t: 'N.Tesla.JPG', lic: 'Public domain', by: 'Napoleon Sarony', fx: 0.5, fy: 0.4 },
  { num: 32, quizId: 'focus-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false, a: 'Mount Fuji', t: 'Mount Fuji-ISS019-E-05286 lrg.jpg', lic: 'Public domain', by: 'NASA ISS Expedition 19', fx: 0.5, fy: 0.5 },
  { num: 33, quizId: 'focus-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: false, a: 'Pillars of Creation', t: 'Pillars of creation 2014 HST WFC3-UVIS full-res denoised.jpg', lic: 'Public domain', by: 'NASA, ESA, and the Hubble Heritage Team', fx: 0.5, fy: 0.5 },
  { num: 34, quizId: 'focus-10-5-26', live: '2026-10-05', dateLabel: 'October 5, 2026', sunday: false, a: 'Colosseum', t: 'Colosseo 2020.jpg', lic: 'CC BY-SA 4.0', by: 'FeaturedPics', fx: 0.5, fy: 0.5 },
  { num: 35, quizId: 'focus-10-6-26', live: '2026-10-06', dateLabel: 'October 6, 2026', sunday: false, a: 'Peacock', t: 'Peacock Plumage.jpg', lic: 'CC BY-SA 4.0', by: 'Jatin Sindhu', fx: 0.5, fy: 0.5 },
  { num: 36, quizId: 'focus-10-7-26', live: '2026-10-07', dateLabel: 'October 7, 2026', sunday: false, a: 'The Birth of Venus', t: 'Sandro Botticelli - La nascita di Venere - Google Art Project - edited.jpg', lic: 'Public domain', by: 'Sandro Botticelli', fx: 0.5, fy: 0.45 },
  { num: 37, quizId: 'focus-10-8-26', live: '2026-10-08', dateLabel: 'October 8, 2026', sunday: false, a: 'Typewriter', t: 'Underwood typewriter.jpg', lic: 'CC BY-SA 4.0', by: 'Maksym Kozlenko', fx: 0.5, fy: 0.5 },
  { num: 38, quizId: 'focus-10-9-26', live: '2026-10-09', dateLabel: 'October 9, 2026', sunday: false, a: 'Charles Darwin', t: 'Charles Darwin seated crop.jpg', lic: 'Public domain', by: 'Henry Maull and John Fox', fx: 0.5, fy: 0.35 },
  { num: 39, quizId: 'focus-10-10-26', live: '2026-10-10', dateLabel: 'October 10, 2026', sunday: false, a: 'The Nile Delta', t: 'Nile River Delta at Night.JPG', lic: 'Public domain', by: 'NASA ISS Expedition 25', fx: 0.5, fy: 0.5 },
  { num: 40, quizId: 'focus-10-11-26', live: '2026-10-11', dateLabel: 'October 11, 2026', sunday: false, a: 'International Space Station', t: 'International Space Station after undocking of STS-132.jpg', lic: 'Public domain', by: 'NASA / Crew of STS-132', fx: 0.5, fy: 0.5 },
  { num: 41, quizId: 'focus-10-12-26', live: '2026-10-12', dateLabel: 'October 12, 2026', sunday: false, a: 'Statue of Liberty', t: 'Statue of Liberty 7.jpg', lic: 'Public domain', by: 'Elcobbola', fx: 0.5, fy: 0.35 },
  { num: 42, quizId: 'focus-10-13-26', live: '2026-10-13', dateLabel: 'October 13, 2026', sunday: false, a: 'Red panda', t: 'RedPandaFullBody.JPG', lic: 'CC BY-SA 3.0', by: 'Greg Hume', fx: 0.5, fy: 0.5 },
  { num: 43, quizId: 'focus-10-14-26', live: '2026-10-14', dateLabel: 'October 14, 2026', sunday: false, a: 'Mona Lisa', t: 'Mona Lisa, by Leonardo da Vinci, from C2RMF retouched.jpg', lic: 'Public domain', by: 'Leonardo da Vinci', fx: 0.5, fy: 0.4 },
  { num: 44, quizId: 'focus-10-15-26', live: '2026-10-15', dateLabel: 'October 15, 2026', sunday: false, a: 'Hot air balloon', t: 'Hot air balloon and moon.jpg', lic: 'CC BY-SA 3.0', by: 'Tomas Castelazo', fx: 0.4, fy: 0.55 },
  { num: 45, quizId: 'focus-10-16-26', live: '2026-10-16', dateLabel: 'October 16, 2026', sunday: false, a: 'Mahatma Gandhi', t: 'Mahatma-Gandhi, studio, 1931.jpg', lic: 'Public domain', by: 'Elliott & Fry', fx: 0.5, fy: 0.4 },
  { num: 46, quizId: 'focus-10-17-26', live: '2026-10-17', dateLabel: 'October 17, 2026', sunday: false, a: 'Iceland', t: 'Iceland satellite.jpg', lic: 'Public domain', by: 'NASA / Jeff Schmaltz', fx: 0.5, fy: 0.5 },
  { num: 47, quizId: 'focus-10-18-26', live: '2026-10-18', dateLabel: 'October 18, 2026', sunday: false, a: 'Earth', t: 'The Earth seen from Apollo 17.jpg', lic: 'Public domain', by: 'NASA / Apollo 17 crew', fx: 0.5, fy: 0.5 },
];
