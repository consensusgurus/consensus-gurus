// Puzzle data for Thread, the daily where nine films are each described in
// one sentence by someone who missed the point, and all nine share one hidden
// thread.
//
// SHAPE. A weekday board is nine `tiles` and ONE entry in `threads` covering
// all nine. A Sunday Edition is sixteen tiles and TWO threads of eight,
// interleaved, so `sunday: true` boards carry `threads.length === 2` and every
// tile belongs to exactly one of them. Each tile is `{ t, s, keys, anti? }`:
// `t` the title as revealed, `s` the logline, `keys` the normalised strings a
// typed guess is matched against (substring, or every word present for a
// multi-word key, the quiz matcher's rule), `anti` strings that block a
// match so a bare title cannot steal its own sequel. A thread is
// `{ t, keys, tiles }` with `tiles` the indices it covers. `decoys` name the
// FALSE threads deliberately planted on the board, with the indices they
// cover, so a wrong call can say how many tiles it explains and so the
// verifier can prove the true thread is the only one covering every tile.
//
// AUTHORING RULES, all enforced by scripts/verify-thread.mjs:
//   * a logline never contains its own title, any of its keys, or any word of
//     the board's thread (Tom Hanks does not appear on a Tom Hanks board);
//   * the true thread covers every tile; every decoy covers strictly fewer;
//   * no film returns inside 60 days and no thread ever returns;
//   * typing any tile's own title credits that tile and no other (the
//     collision audit), and no thread key hits a tile;
//   * dates run consecutively, numbered from 1, quizIds in the
//     thread-M-D-YY shape, Sunday boards on real Sundays.
//
// The server page ships only the picked day's tiles and threads to the
// browser (page.js), so tomorrow's answers never reach a client. The shared
// daily consumers read only num/quizId/live/dateLabel/sunday.
//
// The craft is in the sentence. A flat summary is a dead tile: the joke is
// that the description is TRUE and useless, written by someone who watched
// the whole film and took the wrong thing from it.

export const PUZZLES = [
  {
    num: 1, quizId: 'thread-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false,
    threads: [{ t: 'Tom Hanks', keys: ['tom hanks', 'hanks'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Steven Spielberg', keys: ['spielberg'], cover: [5, 6, 8] },
      { n: 'Based on a true story', keys: ['true story', 'real events', 'real life', 'biopic'], cover: [3, 5, 7, 8] },
    ],
    tiles: [
      { t: 'Big', s: 'A boy wishes he were older, gets his wish, and ends up in middle management.', keys: ['big'], anti: ['big lebowski', 'big short', 'big fish', 'big sick'] },
      { t: 'Cast Away', s: 'A delivery man takes four years to deliver one package.', keys: ['cast away', 'castaway'] },
      { t: 'Forrest Gump', s: 'A man sits on a bench and will not stop talking to strangers.', keys: ['forrest gump', 'forest gump', 'gump'] },
      { t: 'Apollo 13', s: 'Three men take a road trip, the car breaks down, and they turn around.', keys: ['apollo 13', 'apollo thirteen'] },
      { t: 'Toy Story', s: 'A cowboy is jealous of the new guy at work.', keys: ['toy story'], anti: ['toy story 2', 'toy story 3', 'toy story 4'] },
      { t: 'Saving Private Ryan', s: 'Eight men go looking for one man who did not ask to be found.', keys: ['saving private ryan', 'private ryan'] },
      { t: 'The Terminal', s: 'A man lives at an airport because of paperwork.', keys: ['the terminal', 'terminal'], anti: ['terminator'] },
      { t: 'Sully', s: 'A pilot lands a plane and gets in trouble for it.', keys: ['sully'] },
      { t: 'Catch Me If You Can', s: 'A teenager keeps changing jobs and a man from the government takes it personally.', keys: ['catch me if you can', 'catch me'] },
    ],
  },
  {
    num: 2, quizId: 'thread-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false,
    threads: [{ t: 'Directed by Christopher Nolan', keys: ['nolan'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Time runs strangely', keys: ['time', 'time travel', 'nonlinear', 'non linear'], cover: [0, 1, 3, 4, 7] },
      { n: 'Christian Bale', keys: ['bale'], cover: [2, 5] },
    ],
    tiles: [
      { t: 'Memento', s: 'A man with a bad memory gets a lot of tattoos and trusts the wrong people.', keys: ['memento'] },
      { t: 'Inception', s: 'A team of contractors renovates a man’s dream while he sleeps on a plane.', keys: ['inception'] },
      { t: 'The Dark Knight', s: 'A billionaire in a cape struggles with a clown who keeps winning arguments.', keys: ['the dark knight', 'dark knight'], anti: ['rises'] },
      { t: 'Interstellar', s: 'A farmer leaves for work and misses his daughter’s entire life.', keys: ['interstellar'] },
      { t: 'Dunkirk', s: 'A great many people wait on a beach for a lift home.', keys: ['dunkirk'] },
      { t: 'The Prestige', s: 'Two magicians take a professional rivalry much too far.', keys: ['the prestige', 'prestige'] },
      { t: 'Oppenheimer', s: 'A physicist builds something, regrets it, and then attends a lot of meetings.', keys: ['oppenheimer'] },
      { t: 'Tenet', s: 'A man is hired to save the world and is never told his own name.', keys: ['tenet'] },
      { t: 'Insomnia', s: 'A detective cannot sleep in Alaska because it will not get dark.', keys: ['insomnia'] },
    ],
  },
  {
    num: 3, quizId: 'thread-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false,
    threads: [{ t: 'Released in 1999', keys: ['1999', 'nineteen ninety nine'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'A twist ending', keys: ['twist', 'twist ending', 'plot twist'], cover: [0, 1, 2] },
      { n: 'Hating your office job', keys: ['office', 'work', 'jobs', 'quitting'], cover: [0, 3, 5] },
    ],
    tiles: [
      { t: 'The Matrix', s: 'An office worker takes a pill from a stranger and quits his job.', keys: ['the matrix', 'matrix'], anti: ['reloaded', 'revolutions', 'resurrections'] },
      { t: 'Fight Club', s: 'A man with insomnia starts a small business with a friend who is bad at boundaries.', keys: ['fight club'] },
      { t: 'The Sixth Sense', s: 'A child psychologist takes a case and never sends an invoice.', keys: ['the sixth sense', 'sixth sense', '6th sense'] },
      { t: 'Office Space', s: 'A man stops going to work and gets promoted for it.', keys: ['office space'] },
      { t: 'The Blair Witch Project', s: 'Three film students get lost in the woods and blame the map.', keys: ['blair witch'] },
      { t: 'American Beauty', s: 'A suburban dad quits his job, buys a sports car, and lifts weights in the garage.', keys: ['american beauty'] },
      { t: 'Toy Story 2', s: 'A cowboy is stolen by a collector and has to decide whether he likes museums.', keys: ['toy story 2', 'toy story two'] },
      { t: 'Being John Malkovich', s: 'A puppeteer finds a very small door at work.', keys: ['being john malkovich', 'malkovich'] },
      { t: 'Notting Hill', s: 'A bookshop owner spills juice on a customer and it goes surprisingly well.', keys: ['notting hill', 'noting hill'] },
    ],
  },
  {
    num: 4, quizId: 'thread-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false,
    threads: [{ t: 'Directed by Steven Spielberg', keys: ['spielberg'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Aliens', keys: ['alien', 'aliens', 'extraterrestrial', 'space'], cover: [0, 6, 8] },
      { n: 'Tom Cruise', keys: ['cruise'], cover: [4, 6] },
      { n: 'Dinosaurs', keys: ['dinosaur', 'dinosaurs'], cover: [1] },
    ],
    tiles: [
      { t: 'E.T. the Extra-Terrestrial', s: 'A boy hides a short houseguest from his mother, and it works for a surprisingly long time.', keys: ['e t', 'et', 'extra terrestrial'] },
      { t: 'Jurassic Park', s: 'A theme park has a soft opening and the reviews are not good.', keys: ['jurassic park'], anti: ['lost world', 'jurassic park iii', 'jurassic park 3'] },
      { t: 'Raiders of the Lost Ark', s: 'A professor’s field research is interrupted by Nazis, repeatedly.', keys: ['raiders of the lost ark', 'raiders', 'lost ark'] },
      { t: 'Schindler’s List', s: 'A businessman keeps his factory badly staffed on purpose.', keys: ['schindler'] },
      { t: 'Minority Report', s: 'A police department arrests people for things they have not done yet, and it goes wrong for the man in charge.', keys: ['minority report'] },
      { t: 'Lincoln', s: 'A tall man spends four months counting votes.', keys: ['lincoln'] },
      { t: 'War of the Worlds', s: 'A divorced dad drives his kids to their mother’s during a very bad week.', keys: ['war of the worlds'] },
      { t: 'Hook', s: 'A lawyer misses his children’s events and has to go and get them.', keys: ['hook'] },
      { t: 'Close Encounters of the Third Kind', s: 'A man builds a mountain in his living room and his family leaves him.', keys: ['close encounters'] },
    ],
  },
  {
    num: 5, quizId: 'thread-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false,
    threads: [{ t: 'Pixar', keys: ['pixar', 'disney'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Talking animals', keys: ['animal', 'animals', 'talking animals'], cover: [0, 3] },
      { n: 'Someone has died', keys: ['death', 'grief', 'dead', 'dies'], cover: [1, 7] },
      { n: 'Fathers and children', keys: ['father', 'fathers', 'dad', 'dads', 'parents'], cover: [0, 5, 7] },
    ],
    tiles: [
      { t: 'Finding Nemo', s: 'A single father crosses the ocean because his son went to school.', keys: ['finding nemo', 'nemo'] },
      { t: 'Up', s: 'An elderly widower refuses to sell his house and takes it with him.', keys: ['up'] },
      { t: 'WALL-E', s: 'A janitor works alone for seven hundred years and then meets someone at work.', keys: ['wall e', 'walle'] },
      { t: 'Ratatouille', s: 'A restaurant in Paris has a rodent problem and gets a rave review.', keys: ['ratatouille', 'ratatouile', 'ratatoullie'] },
      { t: 'Inside Out', s: 'A girl moves to San Francisco and five coworkers in her head argue about it.', keys: ['inside out'], anti: ['inside out 2'] },
      { t: 'The Incredibles', s: 'A man in insurance lies to his wife about a business trip.', keys: ['the incredibles', 'incredibles'], anti: ['incredibles 2'] },
      { t: 'Monsters, Inc.', s: 'A power company’s top employee brings a child to work by accident.', keys: ['monsters inc', 'monsters incorporated'], anti: ['university'] },
      { t: 'Coco', s: 'A boy steals a guitar and has to apologise to his whole family, including the dead ones.', keys: ['coco'] },
      { t: 'Cars', s: 'A racing car takes a wrong turn and gets community service.', keys: ['cars'], anti: ['cars 2', 'cars 3'] },
    ],
  },
  {
    num: 6, quizId: 'thread-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true,
    threads: [
      { t: 'Set in New York', keys: ['new york', 'nyc', 'manhattan', 'york'], tiles: [0, 2, 4, 6, 8, 10, 12, 14] },
      { t: 'Al Pacino', keys: ['pacino'], tiles: [1, 3, 5, 7, 9, 11, 13, 15] },
    ],
    decoys: [
      { n: 'Crime', keys: ['crime', 'criminals', 'gangsters', 'robbery', 'heist'], cover: [1, 3, 4, 9, 11, 13] },
      { n: 'Christmas', keys: ['christmas', 'holiday', 'holidays'], cover: [8] },
    ],
    tiles: [
      { t: 'Ghostbusters', s: 'Four unemployed academics start a pest-control business.', keys: ['ghostbusters', 'ghost busters'], anti: ['ghostbusters 2', 'ghostbusters ii', 'afterlife', 'frozen empire'] },
      { t: 'Heat', s: 'Two men who respect each other professionally arrange to meet for coffee.', keys: ['heat'] },
      { t: 'Night at the Museum', s: 'A security guard’s first night shift is much busier than advertised.', keys: ['night at the museum', 'museum'], anti: ['battle', 'smithsonian', 'tomb', 'kahmunrah'] },
      { t: 'Scarface', s: 'An immigrant works his way up in the import business and it goes to his head.', keys: ['scarface'] },
      { t: 'Taxi Driver', s: 'A cab driver has trouble sleeping and buys a gun about it.', keys: ['taxi driver'] },
      { t: 'The Insider', s: 'A television producer and a chemist have a very long phone call.', keys: ['the insider', 'insider'] },
      { t: 'Ghost', s: 'A man refuses to leave his apartment after dying.', keys: ['ghost'], anti: ['ghostbusters', 'ghost busters', 'ghost in the shell', 'ghost rider'] },
      { t: 'Any Given Sunday', s: 'A football coach gives a lot of speeches.', keys: ['any given sunday'] },
      { t: 'Elf', s: 'A very tall man in tights looks for his father in a department store.', keys: ['elf'] },
      { t: 'Glengarry Glen Ross', s: 'Four salesmen are told that only two of them will keep their jobs, and coffee is involved.', keys: ['glengarry', 'glen ross'] },
      { t: 'Spider-Man', s: 'A teenager gets bitten by a bug and it changes his whole schedule.', keys: ['spider man', 'spiderman'], anti: ['spider man 2', 'spider man 3', 'homecoming', 'far from home', 'no way home', 'spider verse', 'amazing'] },
      { t: 'Ocean’s Thirteen', s: 'A group of friends goes back to Las Vegas because someone was rude to one of them.', keys: ['ocean s thirteen', 'oceans thirteen', 'ocean s 13', 'oceans 13'] },
      { t: 'When Harry Met Sally', s: 'Two people share a car ride and take twelve years to agree about it.', keys: ['when harry met sally', 'harry met sally'] },
      { t: 'Dick Tracy', s: 'A detective in a yellow coat has trouble with a man whose face is wrong.', keys: ['dick tracy'] },
      { t: 'Coming to America', s: 'A prince takes a job at a burger restaurant to meet women.', keys: ['coming to america'], anti: ['coming 2 america'] },
      { t: 'The Recruit', s: 'A young man is told that everything is a test, and it is.', keys: ['the recruit', 'recruit'] },
    ],
  },
  {
    num: 7, quizId: 'thread-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false,
    threads: [{ t: 'Set in Chicago', keys: ['chicago', 'illinois'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Gangsters', keys: ['gangsters', 'gangster', 'mob', 'mafia', 'crime'], cover: [4, 7, 8] },
      { n: 'John Hughes', keys: ['hughes'], cover: [1, 5] },
    ],
    tiles: [
      { t: 'The Fugitive', s: 'A doctor is wrongly convicted and keeps interrupting a hospital’s day.', keys: ['the fugitive', 'fugitive'] },
      { t: 'Ferris Bueller’s Day Off', s: 'A teenager takes a sick day and his principal takes it personally.', keys: ['ferris bueller', 'ferris'] },
      { t: 'The Blues Brothers', s: 'Two brothers put a band back together and get most of the police force involved.', keys: ['blues brothers'] },
      { t: 'High Fidelity', s: 'A record shop owner ranks his breakups and tells the camera about it.', keys: ['high fidelity'] },
      { t: 'The Untouchables', s: 'An accountant helps the police with a tax case.', keys: ['the untouchables', 'untouchables'] },
      { t: 'Home Alone', s: 'A boy is left at home over the holidays and takes an interest in home security.', keys: ['home alone'], anti: ['home alone 2', 'home alone 3', 'lost in new york'] },
      { t: 'While You Were Sleeping', s: 'A woman saves a man’s life and his family gets the wrong idea for a week.', keys: ['while you were sleeping'] },
      { t: 'Road to Perdition', s: 'A father takes his son on a long drive to teach him about work.', keys: ['road to perdition', 'perdition'] },
      { t: 'The Sting', s: 'Two men set up a fake betting shop to annoy one specific customer.', keys: ['the sting', 'sting'] },
    ],
  },
  {
    num: 8, quizId: 'thread-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false,
    threads: [{ t: 'Directed by Quentin Tarantino', keys: ['tarantino'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Samuel L. Jackson', keys: ['samuel l jackson', 'samuel jackson', 'jackson'], cover: [0, 3, 5, 6] },
      { n: 'Revenge', keys: ['revenge', 'vengeance'], cover: [2, 4, 5] },
    ],
    tiles: [
      { t: 'Pulp Fiction', s: 'Two men in suits discuss breakfast, a watch, and what to do about a briefcase.', keys: ['pulp fiction'] },
      { t: 'Reservoir Dogs', s: 'A robbery goes badly and the crew argues about tipping.', keys: ['reservoir dogs', 'reservoir'] },
      { t: 'Kill Bill: Volume 1', s: 'A woman wakes up from a long nap and makes a list.', keys: ['kill bill'] },
      { t: 'Jackie Brown', s: 'A flight attendant plays several men against each other over a bag of money.', keys: ['jackie brown'] },
      { t: 'Inglourious Basterds', s: 'A film premiere in Paris goes badly for everyone who attends.', keys: ['inglourious basterds', 'inglorious basterds', 'inglourious bastards', 'inglorious bastards', 'basterds'] },
      { t: 'Django Unchained', s: 'A dentist takes on an apprentice and they tour the South.', keys: ['django'] },
      { t: 'The Hateful Eight', s: 'Eight people are snowed in at a shop and nobody is nice about it.', keys: ['hateful eight', 'hateful 8'] },
      { t: 'Once Upon a Time in Hollywood', s: 'An actor and his stunt double have a slow year and a loud night.', keys: ['once upon a time in hollywood', 'hollywood'] },
      { t: 'Death Proof', s: 'A stuntman finds out his car is safer than the people in it.', keys: ['death proof', 'deathproof'] },
    ],
  },
  {
    num: 9, quizId: 'thread-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false,
    threads: [{ t: 'Sports movies', keys: ['sport', 'sports', 'athlete', 'athletes', 'sports movies', 'sports films'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Based on a true story', keys: ['true story', 'real events', 'real life', 'biopic'], cover: [1, 2, 3, 6] },
      { n: 'Underdogs', keys: ['underdog', 'underdogs'], cover: [0, 1, 6, 7] },
      { n: 'Baseball', keys: ['baseball'], cover: [2, 4, 5] },
    ],
    tiles: [
      { t: 'Rocky', s: 'A man is invited to lose a fight and takes it very seriously.', keys: ['rocky'], anti: ['rocky ii', 'rocky 2', 'rocky iii', 'rocky 3', 'rocky iv', 'rocky 4', 'rocky v', 'rocky 5', 'balboa', 'horror'] },
      { t: 'Hoosiers', s: 'A small-town team’s coach measures the basket to prove a point.', keys: ['hoosiers'] },
      { t: 'Moneyball', s: 'A general manager reads a spreadsheet and the old scouts hate it.', keys: ['moneyball', 'money ball'] },
      { t: 'Remember the Titans', s: 'A new coach makes his players go to camp and the town sulks.', keys: ['remember the titans', 'titans'] },
      { t: 'Field of Dreams', s: 'A farmer ploughs under his corn because a voice told him to.', keys: ['field of dreams'] },
      { t: 'A League of Their Own', s: 'A drunk coach is given a team of women and is informed that there is no crying.', keys: ['league of their own'] },
      { t: 'Rudy', s: 'A short man attends college mostly for the last few minutes.', keys: ['rudy'] },
      { t: 'The Karate Kid', s: 'A boy waxes a car and paints a fence and it turns out to be training.', keys: ['karate kid'], anti: ['part ii', 'part 2', 'part iii', 'part 3', '2010', 'legends'] },
      { t: 'Happy Gilmore', s: 'A hockey player takes up golf and fights a game-show host.', keys: ['happy gilmore', 'gilmore'], anti: ['happy gilmore 2'] },
    ],
  },
  {
    num: 10, quizId: 'thread-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false,
    threads: [{ t: 'Meryl Streep', keys: ['streep'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Based on a true story', keys: ['true story', 'real events', 'real life', 'biopic'], cover: [4, 5, 7, 8] },
      { n: 'Food', keys: ['food', 'cooking', 'cooks', 'chefs'], cover: [2, 4, 7] },
    ],
    tiles: [
      { t: 'The Devil Wears Prada', s: 'An assistant is repeatedly asked to get coffee and takes it personally.', keys: ['devil wears prada', 'prada'] },
      { t: 'Sophie’s Choice', s: 'A woman in Brooklyn has a secret and a boyfriend who is not well.', keys: ['sophie s choice', 'sophies choice'] },
      { t: 'Kramer vs. Kramer', s: 'A father learns to make French toast during a custody dispute.', keys: ['kramer'] },
      { t: 'Mamma Mia!', s: 'A bride invites three men to her wedding to find out which one is her father.', keys: ['mamma mia', 'mama mia'], anti: ['here we go again'] },
      { t: 'Julie & Julia', s: 'A blogger cooks her way through a book while the woman who wrote it learns to cook.', keys: ['julie and julia', 'julie julia'] },
      { t: 'The Iron Lady', s: 'A grocer’s daughter gets a job in politics and keeps it for eleven years.', keys: ['iron lady'] },
      { t: 'Doubt', s: 'A nun is sure about something and cannot prove it.', keys: ['doubt'] },
      { t: 'Out of Africa', s: 'A woman runs a coffee farm and has a complicated boyfriend with a plane.', keys: ['out of africa'] },
      { t: 'The Post', s: 'A newspaper decides whether to print something, and then prints it.', keys: ['the post'] },
    ],
  },
  {
    num: 11, quizId: 'thread-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false,
    threads: [{ t: 'Set over a single night', keys: ['one night', 'single night', 'a night', 'overnight', 'night', 'one evening', '24 hours', 'twenty four hours', 'one day', 'single day'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Teenagers', keys: ['teenagers', 'teenager', 'teens', 'high school', 'school'], cover: [1, 2, 6, 8] },
      { n: 'Driving around', keys: ['driving', 'cars', 'taxi', 'taxis', 'cabs'], cover: [3, 8] },
    ],
    tiles: [
      { t: 'After Hours', s: 'A man cannot get home from downtown and everyone he meets makes it worse.', keys: ['after hours'] },
      { t: 'Superbad', s: 'Two friends try to buy alcohol and one of them has a fake name.', keys: ['superbad', 'super bad'] },
      { t: 'Dazed and Confused', s: 'The last day of school ends and nobody goes home.', keys: ['dazed and confused', 'dazed'] },
      { t: 'Collateral', s: 'A cab driver picks up a passenger who has several errands.', keys: ['collateral'], anti: ['beauty', 'damage'] },
      { t: 'Before Sunrise', s: 'Two strangers get off a train in Vienna and talk until the shops open.', keys: ['before sunrise'] },
      { t: 'Die Hard', s: 'A man attends his wife’s office party barefoot and it becomes a hostage situation.', keys: ['die hard'], anti: ['die hard 2', 'die harder', 'vengeance', 'live free', 'good day'] },
      { t: 'Booksmart', s: 'Two students realise they should have gone to a party, and go to several.', keys: ['booksmart', 'book smart'] },
      { t: 'Go', s: 'A supermarket cashier tries to make rent and the story is told three times.', keys: ['go'] },
      { t: 'American Graffiti', s: 'A group of teenagers drive around town after dark and mostly talk.', keys: ['american graffiti', 'graffiti'] },
    ],
  },
  {
    num: 12, quizId: 'thread-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false,
    threads: [{ t: 'Musician biopics', keys: ['musician', 'musicians', 'biopic', 'biopics', 'music'], tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    decoys: [
      { n: 'Won Best Actor', keys: ['best actor', 'oscar', 'oscars', 'academy award'], cover: [1, 2, 6] },
      { n: 'Country singers', keys: ['country'], cover: [0, 8] },
    ],
    tiles: [
      { t: 'Walk the Line', s: 'A man in black meets a woman on tour and proposes on stage.', keys: ['walk the line'] },
      { t: 'Ray', s: 'A blind pianist has a very good career and a very bad habit.', keys: ['ray'] },
      { t: 'Bohemian Rhapsody', s: 'A band writes a six-minute song and the record label says it is too long.', keys: ['bohemian rhapsody', 'bohemian'] },
      { t: 'Rocketman', s: 'A piano player buys a great many pairs of glasses and walks out of a meeting.', keys: ['rocketman', 'rocket man'] },
      { t: 'Elvis', s: 'A singer from Memphis has a manager who takes a large percentage.', keys: ['elvis'] },
      { t: 'Straight Outta Compton', s: 'Five men from one neighbourhood make a record and the police object.', keys: ['straight outta compton', 'compton'] },
      { t: 'Amadeus', s: 'A composer is jealous of a younger man who laughs too much.', keys: ['amadeus'] },
      { t: 'La Bamba', s: 'A teenager from California records a song in Spanish and gets on a plane.', keys: ['la bamba', 'bamba'] },
      { t: 'Coal Miner’s Daughter', s: 'A girl from Kentucky marries at fifteen and ends up in Nashville.', keys: ['coal miner'] },
    ],
  },
  {
    num: 13, quizId: 'thread-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true,
    threads: [
      { t: 'Set in Paris', keys: ['paris', 'france', 'french'], tiles: [0, 2, 4, 6, 8, 10, 12, 14] },
      { t: 'Harrison Ford', keys: ['harrison ford', 'ford'], tiles: [1, 3, 5, 7, 9, 11, 13, 15] },
    ],
    decoys: [
      { n: 'Amnesia', keys: ['amnesia', 'memory'], cover: [8] },
      { n: 'Musicals', keys: ['musical', 'musicals', 'singing'], cover: [2, 14] },
      { n: 'Lawyers and police', keys: ['police', 'lawyers', 'law'], cover: [3, 11] },
    ],
    tiles: [
      { t: 'Amélie', s: 'A waitress fixes strangers’ lives and avoids her own.', keys: ['amelie'] },
      { t: 'Air Force One', s: 'A president’s flight is hijacked and he handles it personally.', keys: ['air force one', 'air force 1'] },
      { t: 'Moulin Rouge!', s: 'A writer falls for a dancer and everyone sings pop songs that do not exist yet.', keys: ['moulin rouge'] },
      { t: 'Witness', s: 'A policeman hides on a farm and helps build a barn.', keys: ['witness'], anti: ['prosecution'] },
      { t: 'Before Sunset', s: 'Two people who once talked all night meet again nine years later and talk for eighty minutes.', keys: ['before sunset'] },
      { t: 'Blade Runner', s: 'A retired detective is asked to find some people who are not, strictly, people.', keys: ['blade runner', 'bladerunner'], anti: ['2049'] },
      { t: 'Hugo', s: 'A boy lives in a train station and fixes a robot.', keys: ['hugo'] },
      { t: 'Working Girl', s: 'A secretary borrows her boss’s job while the boss has a broken leg.', keys: ['working girl'] },
      { t: 'The Bourne Identity', s: 'A man is pulled out of the sea with no memory and a very good set of skills.', keys: ['bourne identity', 'bourne'], anti: ['supremacy', 'ultimatum', 'legacy'] },
      { t: 'Patriot Games', s: 'A retired analyst stops an attack while on holiday and the attackers hold a grudge.', keys: ['patriot games'] },
      { t: 'The Da Vinci Code', s: 'A professor is questioned about a death in a museum and goes looking for a cup.', keys: ['da vinci code', 'davinci code', 'da vinci'] },
      { t: 'Presumed Innocent', s: 'A prosecutor investigates a murder he is suspiciously close to.', keys: ['presumed innocent'] },
      { t: 'La Vie en Rose', s: 'A singer with a tiny frame and a huge voice has a hard life.', keys: ['la vie en rose', 'vie en rose'] },
      { t: 'What Lies Beneath', s: 'A woman’s house is haunted and her husband is very calm about it.', keys: ['what lies beneath'] },
      { t: 'Les Misérables', s: 'A man steals bread, gets out of prison, and is chased for the rest of his life by a policeman who sings.', keys: ['les miserables', 'les mis'] },
      { t: '42', s: 'A baseball player is asked to be very good and very patient at the same time.', keys: ['42', 'forty two'] },
    ],
  },
];
