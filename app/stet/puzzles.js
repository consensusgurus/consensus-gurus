// Puzzle data for Stet, the daily copy-desk game. Imported ONLY by the server
// page (app/stet/page.js), which filters live<=today before passing puzzles to
// the client — so future briefs, and their answers, never ship to the browser.
//
// One news brief per day: five sentences (seven on Sundays), each hiding
// EXACTLY ONE wrong word. The wrong word is always a real word — an eggcorn, a
// swapped homophone, a malaprop, a near-miss — never a spelling typo, so a
// spellchecker would sail right past it. The player taps the offending word,
// then types the one-word fix.
//
// AUTHORING RULES (validate with scripts/verify-stet.mjs after ANY edit):
//  - `wrong` is the offending token exactly as it appears (punctuation aside);
//    it must appear EXACTLY ONCE in the sentence (case-insensitive token match).
//  - `fix` is a single replacement token (hyphens allowed); `alts` lists other
//    accepted spellings. fix !== wrong.
//  - Every error must be clean-cut for a mainstream copy desk — no contested
//    usage calls unless it's a Sunday item WITH a note that owns the ruling.
//  - `note` is the one-line payoff shown after the sentence is scored
//    (15–120 chars, no giveaway of other items).
//  - Never reuse a wrong/fix pair already banked here.
export const PUZZLES = [
  {
    num: 1,
    quizId: 'stet-7-17-26',
    live: '2026-07-17',
    dateLabel: 'July 17, 2026',
    sunday: false,
    items: [
      {
        text: "The mayor's veto exasperated tensions with the city council, aides conceded late Thursday.",
        wrong: 'exasperated',
        fix: 'exacerbated',
        note: 'To exacerbate is to make worse; to exasperate is to annoy someone.',
      },
      {
        text: 'Under the new deal, the young striker will have free reign over where he plays his final season.',
        wrong: 'reign',
        fix: 'rein',
        note: 'Free rein comes from horseback riding — slack reins — not royalty.',
      },
      {
        text: "The museum's new wing has peaked the interest of donors on both coasts.",
        wrong: 'peaked',
        fix: 'piqued',
        note: 'Piqued means stimulated. A peak is a summit.',
      },
      {
        text: "Critics called the committee's report a mute point, since the law it studies expired in June.",
        wrong: 'mute',
        fix: 'moot',
        note: 'Moot means debatable or academic; mute means silent.',
      },
      {
        text: 'Campaign volunteers waited with baited breath as the final precincts reported.',
        wrong: 'baited',
        fix: 'bated',
        note: '"Bated" is a clipped "abated" — breath held. Bait is for hooks.',
      },
    ],
  },
  {
    num: 2,
    quizId: 'stet-7-18-26',
    live: '2026-07-18',
    dateLabel: 'July 18, 2026',
    sunday: false,
    items: [
      {
        text: 'Prosecutors say the firm openly flaunted safety rules for the better part of a decade.',
        wrong: 'flaunted',
        fix: 'flouted',
        note: 'To flout is to defy a rule; to flaunt is to show something off.',
      },
      {
        text: "The senator's ten minutes of questioning failed to illicit a single straight answer.",
        wrong: 'illicit',
        fix: 'elicit',
        note: 'Elicit means draw out. Illicit means illegal.',
      },
      {
        text: 'The shop survives on wedding invitations and high-end stationary.',
        wrong: 'stationary',
        fix: 'stationery',
        note: 'Stationery with an e is paper — remember e for envelope. Stationary means not moving.',
      },
      {
        text: 'Both coaches met at midfield to diffuse the situation before the restart.',
        wrong: 'diffuse',
        fix: 'defuse',
        note: 'Defuse: take the fuse out of. Diffuse: spread thin.',
      },
      {
        text: 'A hoard of tourists descended on the old quarter at sunrise.',
        wrong: 'hoard',
        fix: 'horde',
        note: 'A horde is a crowd; a hoard is a hidden stash.',
      },
    ],
  },
  {
    num: 3,
    quizId: 'stet-7-19-26',
    live: '2026-07-19',
    dateLabel: 'July 19, 2026',
    sunday: true,
    items: [
      {
        text: 'The chief executive kept the board appraised of the merger talks throughout the weekend.',
        wrong: 'appraised',
        fix: 'apprised',
        note: 'Apprise: inform. Appraise: put a value on.',
      },
      {
        text: 'Her new book challenges the central tenants of modern portfolio theory.',
        wrong: 'tenants',
        fix: 'tenets',
        note: 'Tenets are principles; tenants pay rent.',
      },
      {
        text: "Analysts describe the fund's incoming manager as deeply adverse to leverage.",
        wrong: 'adverse',
        fix: 'averse',
        note: 'People are averse (opposed); conditions are adverse (unfavorable).',
      },
      {
        text: 'For decades the label traded on the cache of its Paris address.',
        wrong: 'cache',
        fix: 'cachet',
        note: 'Cachet: prestige. A cache is a hidden store.',
      },
      {
        text: 'Forecasters warned that landfall was immanent by Sunday evening.',
        wrong: 'immanent',
        fix: 'imminent',
        note: 'Imminent: about to happen. Immanent: inherent — a theology word.',
      },
      {
        text: 'The study sorts undecided voters into five discreet categories by age and income.',
        wrong: 'discreet',
        fix: 'discrete',
        note: 'Discrete: separate and distinct. Discreet: tactful.',
      },
      {
        text: 'Without new capital, analysts expect the venture to flounder outright and be wound down by spring.',
        wrong: 'flounder',
        fix: 'founder',
        note: 'To founder is to sink for good; to flounder is to thrash and struggle on.',
      },
    ],
  },
  {
    num: 4,
    quizId: 'stet-7-20-26',
    live: '2026-07-20',
    dateLabel: 'July 20, 2026',
    sunday: false,
    items: [
      {
        text: 'The sommelier insisted the dry riesling compliments the pork course.',
        wrong: 'compliments',
        fix: 'complements',
        note: 'Complement: complete or pair well with. Compliment: praise.',
      },
      {
        text: 'Patients in the trial reported only mild side affects within the first week.',
        wrong: 'affects',
        fix: 'effects',
        note: 'Effect is the noun — side effects. Affect is (almost always) the verb.',
      },
      {
        text: 'He refused on principal to accept the settlement, however generous.',
        wrong: 'principal',
        fix: 'principle',
        note: 'A principle is a rule you live by; principal means main — or runs a school.',
      },
      {
        text: 'Auditors poured over the ledgers through the night before the filing.',
        wrong: 'poured',
        fix: 'pored',
        note: 'To pore over is to study closely; pouring is for liquids.',
      },
      {
        text: 'The old fire tower is struck by lightening a dozen times a year.',
        wrong: 'lightening',
        fix: 'lightning',
        note: 'Lightning — no e — is the bolt. Lightening is making something lighter.',
      },
    ],
  },
  {
    num: 5,
    quizId: 'stet-7-21-26',
    live: '2026-07-21',
    dateLabel: 'July 21, 2026',
    sunday: false,
    items: [
      {
        text: 'The designer chose a muted palate of grays and sage for the lobby.',
        wrong: 'palate',
        fix: 'palette',
        note: 'A palette holds colors; the palate tastes; a pallet carries freight.',
      },
      {
        text: 'The ruling sited three landmark cases from the 1970s.',
        wrong: 'sited',
        fix: 'cited',
        note: 'Cite: refer to. Site: a place (a building is sited).',
      },
      {
        text: 'Nervous investors moved their capitol offshore ahead of the vote.',
        wrong: 'capitol',
        fix: 'capital',
        note: 'Capital is the money (and the city); a capitol is the statehouse building.',
      },
      {
        text: 'She sought the council of her attorney before agreeing to testify.',
        wrong: 'council',
        fix: 'counsel',
        note: 'Counsel: advice, or the lawyer giving it. A council is a committee.',
      },
      {
        text: 'The two-minute trailer is built to wet your appetite for the sequel.',
        wrong: 'wet',
        fix: 'whet',
        note: 'Whet: sharpen — as on a whetstone.',
      },
    ],
  },
  {
    num: 6,
    quizId: 'stet-7-22-26',
    live: '2026-07-22',
    dateLabel: 'July 22, 2026',
    sunday: false,
    items: [
      {
        text: "The keeper insists the missed penalty didn't phase him one bit.",
        wrong: 'phase',
        fix: 'faze',
        note: 'Faze: rattle. A phase is a stage.',
      },
      {
        text: 'The regional carrier has been in dire straights since the fuel spike.',
        wrong: 'straights',
        fix: 'straits',
        note: 'Straits are narrow, dangerous waters — hence tight spots.',
      },
      {
        text: "The witness's totals simply don't jive with the bank records.",
        wrong: 'jive',
        fix: 'jibe',
        note: 'Jibe: agree. Jive: swing-era slang (or the dance).',
      },
      {
        text: 'In the end every backbencher towed the party line on the final vote.',
        wrong: 'towed',
        fix: 'toed',
        note: 'Toe the line: stand with your toes at the mark.',
      },
      {
        text: 'Bookmakers rate the incumbent a shoe-in for a third term.',
        wrong: 'shoe-in',
        fix: 'shoo-in',
        alts: ['shooin'],
        note: 'A shoo-in was a horse shooed toward the finish.',
      },
    ],
  },
  {
    num: 7,
    quizId: 'stet-7-23-26',
    live: '2026-07-23',
    dateLabel: 'July 23, 2026',
    sunday: false,
    items: [
      {
        text: 'The veteran guard lead the league in assists for a third straight season.',
        wrong: 'lead',
        fix: 'led',
        note: 'Led is the past tense. Lead that rhymes with led is the metal.',
      },
      {
        text: 'The retiring chairman was loathe to name a successor.',
        wrong: 'loathe',
        fix: 'loath',
        note: 'Loath: reluctant (adjective). Loathe: to despise (verb).',
      },
      {
        text: "The film's premier drew half of Hollywood to the Bowl.",
        wrong: 'premier',
        fix: 'premiere',
        note: 'A premiere is a debut; a premier runs a government.',
      },
      {
        text: "Reviewers praised the thriller's taught 90-minute cut.",
        wrong: 'taught',
        fix: 'taut',
        note: 'Taut: stretched tight. Taught: past tense of teach.',
      },
      {
        text: 'Reactions to the verdict ran the gambit from delight to fury.',
        wrong: 'gambit',
        fix: 'gamut',
        note: 'A gamut is the full range; a gambit is an opening move.',
      },
    ],
  },
  {
    num: 8,
    quizId: 'stet-7-24-26',
    live: '2026-07-24',
    dateLabel: 'July 24, 2026',
    sunday: false,
    items: [
      {
        text: 'Her resolve never waivered during the eleven-day strike.',
        wrong: 'waivered',
        fix: 'wavered',
        note: 'To waver is to hesitate; a waiver signs away a right.',
      },
      {
        text: "Lenders remain weary of the sector after last year's defaults.",
        wrong: 'weary',
        fix: 'wary',
        note: 'Wary: cautious. Weary: tired.',
      },
      {
        text: 'The clerk read a two-page summery of the findings into the record.',
        wrong: 'summery',
        fix: 'summary',
        note: 'Summery describes the weather.',
      },
      {
        text: 'The resort sits on a private aisle off the coast of Belize.',
        wrong: 'aisle',
        fix: 'isle',
        note: 'An isle is an island; an aisle runs through a supermarket.',
      },
      {
        text: 'The ace reliever holds duel citizenship and may pitch for either country.',
        wrong: 'duel',
        fix: 'dual',
        note: 'Dual: double. A duel needs pistols at dawn.',
      },
    ],
  },
  {
    num: 9,
    quizId: 'stet-7-25-26',
    live: '2026-07-25',
    dateLabel: 'July 25, 2026',
    sunday: false,
    items: [
      {
        text: 'The family grove ships naval oranges across the Midwest all winter.',
        wrong: 'naval',
        fix: 'navel',
        note: 'Navel oranges have the little belly button; naval means navy.',
      },
      {
        text: 'Regulators accused the site of pedaling miracle cures to seniors.',
        wrong: 'pedaling',
        fix: 'peddling',
        note: 'Peddle: hawk goods. Pedal: what you do on a bike.',
      },
      {
        text: 'The report accuses a foreign service of medaling in the election.',
        wrong: 'medaling',
        fix: 'meddling',
        note: 'Meddle: interfere. Medal: what you win for it, presumably.',
      },
      {
        text: "Critics spent the summer debating the morale of the fable's ending.",
        wrong: 'morale',
        fix: 'moral',
        note: 'A story has a moral; a locker room has morale.',
      },
      {
        text: "The intern spent a whole summer at the director's beckon call.",
        wrong: 'beckon',
        fix: 'beck',
        note: '"Beck and call" — a beck is an old word for a summoning nod.',
      },
    ],
  },
  {
    num: 10,
    quizId: 'stet-7-26-26',
    live: '2026-07-26',
    dateLabel: 'July 26, 2026',
    sunday: true,
    items: [
      {
        text: 'The appeal hinges on whether the seated jurors were truly uninterested parties.',
        wrong: 'uninterested',
        fix: 'disinterested',
        note: 'Disinterested: impartial, no stake. Uninterested: bored.',
      },
      {
        text: 'The archipelago is comprised of eleven inhabited islands.',
        wrong: 'comprised',
        fix: 'composed',
        note: 'The whole comprises its parts — "comprised of" flips it. Composed of is the fix.',
      },
      {
        text: 'Several witnesses proved reticent to sign sworn statements.',
        wrong: 'reticent',
        fix: 'reluctant',
        note: 'Reticent: reserved in speech. Reluctant: unwilling to act. The copy desk still splits them.',
      },
      {
        text: "The symphony's climatic third movement lost the audience entirely.",
        wrong: 'climatic',
        fix: 'climactic',
        note: 'Climactic: of a climax. Climatic: of climate.',
      },
      {
        text: 'By nine, a line of perspective buyers wrapped around the showroom.',
        wrong: 'perspective',
        fix: 'prospective',
        note: 'Prospective: would-be. Perspective: point of view.',
      },
      {
        text: 'Judges called the bridge design ingenuous in its simplicity.',
        wrong: 'ingenuous',
        fix: 'ingenious',
        note: 'Ingenious: clever. Ingenuous: innocent, artless.',
      },
      {
        text: 'The derecho wrecked havoc across three counties overnight.',
        wrong: 'wrecked',
        fix: 'wreaked',
        note: 'One wreaks havoc. Wrecked means destroyed — which, fair.',
      },
    ],
  },
  {
    num: 11,
    quizId: 'stet-7-27-26',
    live: '2026-07-27',
    dateLabel: 'July 27, 2026',
    sunday: false,
    items: [
      {
        text: 'The suit alleges a clear breech of fiduciary duty by the trustees.',
        wrong: 'breech',
        fix: 'breach',
        note: 'Breach: a break or violation. Breech: the rear of a gun barrel.',
      },
      {
        text: 'The grounded jet sat in a leased hanger through the audit.',
        wrong: 'hanger',
        fix: 'hangar',
        note: 'Aircraft live in hangars; shirts live on hangers.',
      },
      {
        text: "The filing claims undo influence by the founder's family.",
        wrong: 'undo',
        fix: 'undue',
        note: 'Undue: excessive. Undo: reverse.',
      },
      {
        text: "The headliner's act is pure slight of hand, no props at all.",
        wrong: 'slight',
        fix: 'sleight',
        note: 'Sleight: dexterity or cunning. A slight is an insult.',
      },
      {
        text: 'The documentary follows the air to a Greek shipping fortune.',
        wrong: 'air',
        fix: 'heir',
        note: 'An heir inherits. The h is silent, the money is not.',
      },
    ],
  },
  {
    num: 12,
    quizId: 'stet-7-28-26',
    live: '2026-07-28',
    dateLabel: 'July 28, 2026',
    sunday: false,
    items: [
      {
        text: 'The amendment protects the right to bare arms, the militia clause notwithstanding.',
        wrong: 'bare',
        fix: 'bear',
        note: 'To bear arms is to carry them; bare arms are just sleeveless.',
      },
      {
        text: 'Detectives described a grizzly scene inside the warehouse.',
        wrong: 'grizzly',
        fix: 'grisly',
        note: 'Grisly: gruesome. Grizzly: the bear.',
      },
      {
        text: 'The rookie shows real flare for the dramatic finish.',
        wrong: 'flare',
        fix: 'flair',
        note: 'Flair: a knack. A flare burns.',
      },
      {
        text: 'The surgery repaired both of the tenor’s vocal chords.',
        wrong: 'chords',
        fix: 'cords',
        note: 'Vocal cords are folds of tissue; chords are for guitars.',
      },
      {
        text: 'Doctors urged fans to curve their enthusiasm about the experimental drug.',
        wrong: 'curve',
        fix: 'curb',
        note: 'Curb: restrain — as a curb bit restrains a horse.',
      },
    ],
  },
  {
    num: 13,
    quizId: 'stet-7-29-26',
    live: '2026-07-29',
    dateLabel: 'July 29, 2026',
    sunday: false,
    items: [
      {
        text: 'The battery lab keeps pushing the envelop on energy density.',
        wrong: 'envelop',
        fix: 'envelope',
        note: '"Push the envelope" is test-pilot jargon — the flight limits. Envelop is a verb.',
      },
      {
        text: 'Jurors heard an incredulous tale of offshore accounts and burner phones.',
        wrong: 'incredulous',
        fix: 'incredible',
        note: 'Stories are incredible; the people hearing them are incredulous.',
      },
      {
        text: 'A traveling troop of acrobats opens the county fair on Friday.',
        wrong: 'troop',
        fix: 'troupe',
        note: 'A troupe performs; a troop marches.',
      },
      {
        text: 'At 94, the founder appeared hail and hearty at the ribbon cutting.',
        wrong: 'hail',
        fix: 'hale',
        note: 'Hale: healthy — kin to "whole". Hail: ice, or a greeting.',
      },
      {
        text: 'The bill cleared the chamber with less than a dozen votes to spare.',
        wrong: 'less',
        fix: 'fewer',
        note: 'Fewer for things you count, less for things you measure.',
      },
    ],
  },
  {
    num: 14,
    quizId: 'stet-7-30-26',
    live: '2026-07-30',
    dateLabel: 'July 30, 2026',
    sunday: false,
    items: [
      {
        text: 'Officials said the ceremony would precede as planned despite the forecast.',
        wrong: 'precede',
        fix: 'proceed',
        note: 'Proceed: go ahead. Precede: come before.',
      },
      {
        text: 'A record amount of complaints reached the ombudsman in June.',
        wrong: 'amount',
        fix: 'number',
        note: 'Complaints are countable — a number of them. Amount is for bulk.',
      },
      {
        text: 'The two rivals signed a historical ceasefire at dawn on Thursday.',
        wrong: 'historical',
        fix: 'historic',
        note: 'Historic: momentous. Historical: merely from the past.',
      },
      {
        text: 'In his memoir, the coach eluded to a falling-out with the owner.',
        wrong: 'eluded',
        fix: 'alluded',
        note: 'Allude: refer indirectly. Elude: escape.',
      },
      {
        text: 'Campaign volunteers will canvas the district on Saturday morning.',
        wrong: 'canvas',
        fix: 'canvass',
        note: 'Canvass, two s’s: solicit votes. Canvas: the cloth.',
      },
    ],
  },
];
