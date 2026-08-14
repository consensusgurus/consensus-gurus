// Puzzle data for Stet, the daily copy-desk game. Imported ONLY by the server
// page (app/stet/page.js), which filters live<=today before passing puzzles to
// the client — so future briefs, and their answers, never ship to the browser.
//
// One news brief per day: five sentences (seven on Sundays). Each sentence
// carries an `errors` array with 0, 1, or (Sundays only) 2 errors — always a
// real word, so a spellchecker sails past it: eggcorns, swapped homophones,
// malaprops, AND grammar slips (should of, had ran, subject-verb). A sentence
// with an EMPTY errors array is clean copy — the player earns its points by
// stamping it "stet" (let it stand). Not every day carries a clean sentence.
//
// AUTHORING RULES (validate with scripts/verify-stet.mjs after ANY edit):
//  - errors: 0–1 per sentence on weekdays, 0–2 on Sundays (owner ruling
//    2026-07-17: Sundays are tougher, and only Sundays may double up).
//  - each error's `wrong` is the offending token exactly as it appears
//    (punctuation aside) and must appear EXACTLY ONCE in the sentence.
//  - `fix` is a single replacement token (hyphens allowed); `alts` lists other
//    accepted spellings. fix !== wrong, and the fix must not already appear in
//    the sentence.
//  - clean sentences (errors: []) carry a `cleanNote` — ideally BAIT: correct
//    usage of a word that looks wrong (bated, counsel, taut, morale, flair…).
//  - every error must be clean-cut for a mainstream copy desk — no contested
//    usage calls unless it's a Sunday item WITH a note that owns the ruling.
//  - `note` per error is the one-line payoff (15–140 chars).
//  - GRAMMAR EVERY DAY (owner ruling 2026-07-28): from 2026-08-11 forward
//    every day MUST carry at least one true GRAMMAR (syntax) error IN ADDITION
//    to the spelling/word-choice errors, tagged `kind: 'grammar'` on that error
//    object. Grammar = syntax: subject-verb agreement (Neither ... is; turnout
//    was, not were; the data are), verb form after have/had (had run/gone/drunk,
//    should have — never had ran, had went, should of), pronoun case (between
//    you and me; who vs whom), tense and participle slips. USAGE/word-choice
//    pairs (then/than, fewer/less, farther/further, affect/effect, homophones)
//    do NOT satisfy the grammar quota — they are the spelling/word-choice axis.
//    Keep grammar a minority of each day's errors, not the whole slate.
//  - `kind` is optional and defaults to word-choice/spelling; set `kind:
//    'grammar'` on the syntax errors. verify-stet.mjs enforces the daily quota
//    for every day on/after GRAMMAR_FROM.
//  - THE ERROR MUST BE SELF-CONTAINED (owner ruling 2026-08-14, after a reader
//    caught stet-8-14-26 #5: "The cyclist was fined for riding on the pavement",
//    marked fined→cautioned). The sentence itself must make the fix the only
//    reasonable reading. If the flagged word is correct standard English and
//    nothing in the sentence rules it out, there is NO error and the item is
//    unanswerable — the player is guessing which synonym the author had in mind.
//    Concretely, NEVER flag:
//      · a US/British variant, in either direction (meter/metre, grade/gradient,
//        leash/lead, nought/naught). The copy may keep its British voice, but no
//        error may turn on the dialect axis, and both forms are accepted.
//      · a synonym or a house-style preference (vellum→parchment, slate→tab,
//        creels→pots, juncture→time). "The other word is more usual" is not an error.
//      · a one-word-vs-two-word compound call (fire proof→fireproof, quay
//        side→quayside). These also RENDER BROKEN: the reveal strikes the tapped
//        word and inserts the fix after it, so "fire proof safe" reads back as
//        "fire fireproof safe". verify-stet.mjs now fails these outright.
//      · a collective noun that is already correct. A pod of dolphins and a raft
//        of eider are the right terms; the bank once flagged both AND taught the
//        opposite on another day (#45.7 pod→school vs #74.3 school→pod).
//    The test before banking an item: read the sentence cold, with no answer key.
//    Could a careful copy editor land anywhere else? Then re-cut it.
//  - `alts` carries every other correct fix (only `fix` + `alts` score the second
//    point, so a player who writes an equally right word must not be marked down).
//  - never reuse a wrong→fix pair already banked here.
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
        errors: [{ wrong: 'exasperated', fix: 'exacerbated', note: 'To exacerbate is to make worse; to exasperate is to annoy someone.' }],
      },
      {
        text: 'Under the new deal, the young striker will have free reign over where he plays his final season.',
        errors: [{ wrong: 'reign', fix: 'rein', note: 'Free rein comes from horseback riding — slack reins — not royalty.' }],
      },
      {
        text: "The museum's new wing has peaked the interest of donors on both coasts.",
        errors: [{ wrong: 'peaked', fix: 'piqued', note: 'Piqued means stimulated. A peak is a summit.' }],
      },
      {
        text: "Critics called the committee's report a mute point, since the law it studies expired in June.",
        errors: [{ wrong: 'mute', fix: 'moot', note: 'Moot means debatable or academic; mute means silent.' }],
      },
      {
        text: 'Campaign volunteers waited with baited breath as the final precincts reported.',
        errors: [{ wrong: 'baited', fix: 'bated', note: '"Bated" is a clipped "abated" — breath held. Bait is for hooks.' }],
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
        errors: [{ wrong: 'flaunted', fix: 'flouted', note: 'To flout is to defy a rule; to flaunt is to show something off.' }],
      },
      {
        text: "The senator's ten minutes of questioning failed to illicit a single straight answer.",
        errors: [{ wrong: 'illicit', fix: 'elicit', note: 'Elicit means draw out. Illicit means illegal.' }],
      },
      {
        text: 'The shop survives on wedding invitations and high-end stationary.',
        errors: [{ wrong: 'stationary', fix: 'stationery', note: 'Stationery with an e is paper — remember e for envelope. Stationary means not moving.' }],
      },
      {
        text: 'Both coaches met at midfield to diffuse the situation before the restart.',
        errors: [{ wrong: 'diffuse', fix: 'defuse', note: 'Defuse: take the fuse out of. Diffuse: spread thin.' }],
      },
      {
        text: "The gallery waited with bated breath as the auction's final lot crossed the block.",
        errors: [],
        cleanNote: 'Clean copy — and yes, "bated" is right. Yesterday’s lesson pays off.',
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
        errors: [{ wrong: 'appraised', fix: 'apprised', note: 'Apprise: inform. Appraise: put a value on.' }],
      },
      {
        text: 'Her new book challenges the central tenants of modern portfolio theory.',
        errors: [{ wrong: 'tenants', fix: 'tenets', note: 'Tenets are principles; tenants pay rent.' }],
      },
      {
        text: "Analysts describe the fund's incoming manager as deeply adverse to leverage.",
        errors: [{ wrong: 'adverse', fix: 'averse', note: 'People are averse (opposed); conditions are adverse (unfavorable).' }],
      },
      {
        text: 'For decades the label traded on the cache of its Paris address.',
        errors: [{ wrong: 'cache', fix: 'cachet', note: 'Cachet: prestige. A cache is a hidden store.' }],
      },
      {
        text: 'Forecasters warned that landfall was immanent by Sunday evening.',
        errors: [{ wrong: 'immanent', fix: 'imminent', note: 'Imminent: about to happen. Immanent: inherent — a theology word.' }],
      },
      {
        text: 'The study sorts undecided voters into five discreet categories by age and income.',
        errors: [{ wrong: 'discreet', fix: 'discrete', note: 'Discrete: separate and distinct. Discreet: tactful.' }],
      },
      {
        text: 'The chairman excepted the resignation with regret, adding that the timing could hardly have been worst.',
        errors: [
          { wrong: 'excepted', fix: 'accepted', note: 'Accept: receive. Except: leave out.' },
          { wrong: 'worst', fix: 'worse', note: 'Worse is the comparative — nothing is being ranked dead last here.' },
        ],
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
        errors: [{ wrong: 'compliments', fix: 'complements', note: 'Complement: complete or pair well with. Compliment: praise.' }],
      },
      {
        text: 'Patients in the trial reported only mild side affects within the first week.',
        errors: [{ wrong: 'affects', fix: 'effects', note: 'Effect is the noun — side effects. Affect is (almost always) the verb.' }],
      },
      {
        text: 'He refused on principal to accept the settlement, however generous.',
        errors: [{ wrong: 'principal', fix: 'principle', note: 'A principle is a rule you live by; principal means main — or runs a school.' }],
      },
      {
        text: 'Auditors poured over the ledgers through the night before the filing.',
        errors: [{ wrong: 'poured', fix: 'pored', note: 'To pore over is to study closely; pouring is for liquids.' }],
      },
      {
        text: 'The number of asylum applications have doubled since June, the ministry said.',
        errors: [{ wrong: 'have', fix: 'has', note: 'The subject is "the number" — singular. The number has doubled.' }],
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
        errors: [{ wrong: 'palate', fix: 'palette', note: 'A palette holds colors; the palate tastes; a pallet carries freight.' }],
      },
      {
        text: 'The ruling sited three landmark cases from the 1970s.',
        errors: [{ wrong: 'sited', fix: 'cited', note: 'Cite: refer to. Site: a place (a building is sited).' }],
      },
      {
        text: 'Nervous investors moved their capitol offshore ahead of the vote.',
        errors: [{ wrong: 'capitol', fix: 'capital', note: 'Capital is the money (and the city); a capitol is the statehouse building.' }],
      },
      {
        text: 'The two-minute trailer is built to wet your appetite for the sequel.',
        errors: [{ wrong: 'wet', fix: 'whet', note: 'Whet: sharpen — as on a whetstone.' }],
      },
      {
        text: 'Counsel for the estate declined to comment as the hearing adjourned.',
        errors: [],
        cleanNote: 'Clean copy — "counsel," the lawyer, is exactly right. A council is a committee.',
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
        errors: [{ wrong: 'phase', fix: 'faze', note: 'Faze: rattle. A phase is a stage.' }],
      },
      {
        text: 'The regional carrier has been in dire straights since the fuel spike.',
        errors: [{ wrong: 'straights', fix: 'straits', note: 'Straits are narrow, dangerous waters — hence tight spots.' }],
      },
      {
        text: "The witness's totals simply don't jive with the bank records.",
        errors: [{ wrong: 'jive', fix: 'jibe', note: 'Jibe: agree. Jive: swing-era slang (or the dance).' }],
      },
      {
        text: 'In the end every backbencher towed the party line on the final vote.',
        errors: [{ wrong: 'towed', fix: 'toed', note: 'Toe the line: stand with your toes at the mark.' }],
      },
      {
        text: 'Bookmakers rate the incumbent a shoe-in for a third term.',
        errors: [{ wrong: 'shoe-in', fix: 'shoo-in', alts: ['shooin'], note: 'A shoo-in was a horse shooed toward the finish.' }],
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
        errors: [{ wrong: 'lead', fix: 'led', note: 'Led is the past tense. Lead that rhymes with led is the metal.' }],
      },
      {
        text: 'The retiring chairman was loathe to name a successor.',
        errors: [{ wrong: 'loathe', fix: 'loath', note: 'Loath: reluctant (adjective). Loathe: to despise (verb).' }],
      },
      {
        text: "The film's premier drew half of Hollywood to the Bowl.",
        errors: [{ wrong: 'premier', fix: 'premiere', note: 'A premiere is a debut; a premier runs a government.' }],
      },
      {
        text: 'Reactions to the verdict ran the gambit from delight to fury.',
        errors: [{ wrong: 'gambit', fix: 'gamut', note: 'A gamut is the full range; a gambit is an opening move.' }],
      },
      {
        text: "Reviewers praised the thriller's taut, ninety-minute final cut.",
        errors: [],
        cleanNote: 'Clean copy — taut, stretched tight, is the right word. Taught is for teachers.',
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
        errors: [{ wrong: 'waivered', fix: 'wavered', note: 'To waver is to hesitate; a waiver signs away a right.' }],
      },
      {
        text: "Lenders remain weary of the sector after last year's defaults.",
        errors: [{ wrong: 'weary', fix: 'wary', note: 'Wary: cautious. Weary: tired.' }],
      },
      {
        text: 'The clerk read a two-page summery of the findings into the record.',
        errors: [{ wrong: 'summery', fix: 'summary', note: 'Summery describes the weather.' }],
      },
      {
        text: 'The ace reliever holds duel citizenship and may pitch for either country.',
        errors: [{ wrong: 'duel', fix: 'dual', note: 'Dual: double. A duel needs pistols at dawn.' }],
      },
      {
        text: 'Pundits agree the referee should of waved play on before the collision.',
        errors: [{ wrong: 'of', fix: 'have', note: '"Should have" — the spoken "should’ve" is where "of" sneaks in.' }],
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
        errors: [{ wrong: 'naval', fix: 'navel', note: 'Navel oranges have the little belly button; naval means navy.' }],
      },
      {
        text: 'Regulators accused the site of pedaling miracle cures to seniors.',
        errors: [{ wrong: 'pedaling', fix: 'peddling', note: 'Peddle: hawk goods. Pedal: what you do on a bike.' }],
      },
      {
        text: 'The report accuses a foreign service of medaling in the election.',
        errors: [{ wrong: 'medaling', fix: 'meddling', note: 'Meddle: interfere. Medal: what you win for it, presumably.' }],
      },
      {
        text: "The intern spent a whole summer at the director's beck and call.",
        errors: [],
        cleanNote: "Clean copy: 'beck and call' is the idiom, from beck, an old word for a summoning nod. 'Beckon call' is the eggcorn.",
      },
      {
        text: 'Morale in the clubhouse has soared since the deadline trade.',
        errors: [],
        cleanNote: 'Clean copy — morale, the team’s spirit, is spot on. A story has a moral.',
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
        errors: [{ wrong: 'uninterested', fix: 'disinterested', note: 'Disinterested: impartial, no stake. Uninterested: bored.' }],
      },
      {
        text: 'The archipelago is comprised of eleven inhabited islands.',
        errors: [{ wrong: 'comprised', fix: 'composed', note: 'The whole comprises its parts — "comprised of" flips it. Composed of is the fix.' }],
      },
      {
        text: "The symphony's climatic third movement lost the audience entirely.",
        errors: [{ wrong: 'climatic', fix: 'climactic', note: 'Climactic: of a climax. Climatic: of climate.' }],
      },
      {
        text: 'By nine, a line of perspective buyers wrapped around the showroom.',
        errors: [{ wrong: 'perspective', fix: 'prospective', note: 'Prospective: would-be. Perspective: point of view.' }],
      },
      {
        text: 'The derecho wrecked havoc across three counties overnight.',
        errors: [{ wrong: 'wrecked', fix: 'wreaked', note: 'One wreaks havoc. Wrecked means destroyed — which, fair.' }],
      },
      {
        text: 'Judges called the bridge design ingenious in its simplicity.',
        errors: [],
        cleanNote: 'Clean copy — ingenious (clever) is correct. Ingenuous — artless — would be the error.',
      },
      {
        text: 'Her advise — settle quietly before the appeal — fell on death ears.',
        errors: [
          { wrong: 'advise', fix: 'advice', note: 'Advice is the noun you give; advise is the verb you do.' },
          { wrong: 'death', fix: 'deaf', note: 'Deaf ears — ears that cannot hear. Grimmer than intended otherwise.' },
        ],
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
        errors: [{ wrong: 'breech', fix: 'breach', note: 'Breach: a break or violation. Breech: the rear of a gun barrel.' }],
      },
      {
        text: 'The grounded jet sat in a leased hanger through the audit.',
        errors: [{ wrong: 'hanger', fix: 'hangar', note: 'Aircraft live in hangars; shirts live on hangers.' }],
      },
      {
        text: "The filing claims undo influence by the founder's family.",
        errors: [{ wrong: 'undo', fix: 'undue', note: 'Undue: excessive. Undo: reverse.' }],
      },
      {
        text: 'Debris was laying across both lanes of the parkway at dawn.',
        errors: [{ wrong: 'laying', fix: 'lying', note: 'Things lie where they are; you lay something down. The debris was lying there.' }],
      },
      {
        text: 'The documentary follows the air to a Greek shipping fortune.',
        errors: [{ wrong: 'air', fix: 'heir', note: 'An heir inherits. The h is silent, the money is not.' }],
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
        errors: [{ wrong: 'bare', fix: 'bear', note: 'To bear arms is to carry them; bare arms are just sleeveless.' }],
      },
      {
        text: 'Detectives described a grizzly scene inside the warehouse.',
        errors: [{ wrong: 'grizzly', fix: 'grisly', note: 'Grisly: gruesome. Grizzly: the bear.' }],
      },
      {
        text: 'The surgery repaired both of the tenor’s vocal chords.',
        errors: [{ wrong: 'chords', fix: 'cords', note: 'Vocal cords are folds of tissue; chords are for guitars.' }],
      },
      {
        text: 'Doctors urged fans to curve their enthusiasm about the experimental drug.',
        errors: [{ wrong: 'curve', fix: 'curb', note: 'Curb: restrain — as a curb bit restrains a horse.' }],
      },
      {
        text: "Scouts rave about the rookie's flair for the dramatic finish.",
        errors: [],
        cleanNote: 'Clean copy — flair, the knack, is right. A flare burns.',
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
        errors: [{ wrong: 'envelop', fix: 'envelope', note: '"Push the envelope" is test-pilot jargon — the flight limits. Envelop is a verb.' }],
      },
      {
        text: 'Jurors heard an incredulous tale of offshore accounts and burner phones.',
        errors: [{ wrong: 'incredulous', fix: 'incredible', note: 'Stories are incredible; the people hearing them are incredulous.' }],
      },
      {
        text: 'A traveling troop of acrobats opens the county fair on Friday.',
        errors: [{ wrong: 'troop', fix: 'troupe', note: 'A troupe performs; a troop marches.' }],
      },
      {
        text: 'The bill cleared the chamber with less than a dozen votes to spare.',
        errors: [{ wrong: 'less', fix: 'fewer', note: 'Fewer for things you count, less for things you measure.' }],
      },
      {
        text: 'The village well had ran dry by the middle of August.',
        errors: [{ wrong: 'ran', fix: 'run', kind: 'grammar', note: 'Had run — "ran" never follows "had."' }],
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
        errors: [{ wrong: 'precede', fix: 'proceed', note: 'Proceed: go ahead. Precede: come before.' }],
      },
      {
        text: 'A record amount of complaints reached the ombudsman in June.',
        errors: [{ wrong: 'amount', fix: 'number', note: 'Complaints are countable — a number of them. Amount is for bulk.' }],
      },
      {
        text: 'The two rivals signed a historical ceasefire at dawn on Thursday.',
        errors: [{ wrong: 'historical', fix: 'historic', note: 'Historic: momentous. Historical: merely from the past.' }],
      },
      {
        text: 'Campaign volunteers will canvas the district on Saturday morning.',
        errors: [{ wrong: 'canvas', fix: 'canvass', note: 'Canvass, two s’s: solicit votes. Canvas: the cloth.' }],
      },
      {
        text: 'Turnout ran far higher then expected in the northern districts.',
        errors: [{ wrong: 'then', fix: 'than', note: 'Than compares; then sequences.' }],
      },
    ],
  },
  {
    num: 15,
    quizId: 'stet-7-31-26',
    live: '2026-07-31',
    dateLabel: 'July 31, 2026',
    sunday: false,
    items: [
      {
        text: 'The transit authority raised fares this week to insure the network stays solvent through 2030.',
        errors: [{ wrong: 'insure', fix: 'ensure', note: 'Ensure: make certain. Insure: buy an insurance policy against loss.' }],
      },
      {
        text: 'Officials warned the aging signal system could cause the agency to loose federal funding.',
        errors: [{ wrong: 'loose', fix: 'lose', note: 'Lose is the verb (to lose funding); loose is the adjective, not tight.' }],
      },
      {
        text: 'A hoard of commuters packed the downtown platform during the morning rush.',
        errors: [{ wrong: 'hoard', fix: 'horde', note: 'A horde is a crowd; a hoard is a hidden stash of treasure.' }],
      },
      {
        text: 'The new express line complements the existing bus network rather than replacing it.',
        errors: [],
        cleanNote: 'Clean copy — complements (completes, pairs with) is right; a compliment is praise.',
      },
      {
        text: 'The chair promised farther study before any station is closed for good.',
        errors: [{ wrong: 'farther', fix: 'further', note: 'Further for figurative or additional; farther is for physical distance.' }],
      },
    ],
  },
  {
    num: 16,
    quizId: 'stet-8-1-26',
    live: '2026-08-01',
    dateLabel: 'August 1, 2026',
    sunday: false,
    items: [
      {
        text: 'Engineers said the overnight fuel leak effected only the backup booster.',
        errors: [{ wrong: 'effected', fix: 'affected', note: 'Affected: influenced. Effected would mean brought about, a different verb.' }],
      },
      {
        text: 'Early attempts to restart the main engine proved all in vein.',
        errors: [{ wrong: 'vein', fix: 'vain', note: 'In vain means to no avail; a vein carries blood.' }],
      },
      {
        text: 'The recovery crew gave the returning capsule a hardy round of applause.',
        errors: [{ wrong: 'hardy', fix: 'hearty', note: 'Hearty: warm and full. Hardy: tough, able to endure hardship.' }],
      },
      {
        text: "The mission's principal investigator briefed reporters within the hour.",
        errors: [],
        cleanNote: 'Clean copy — the principal investigator is the lead; a principle is a rule.',
      },
      {
        text: 'By Friday the launch window had went, and the flight slipped to autumn.',
        errors: [{ wrong: 'went', fix: 'gone', kind: 'grammar', note: 'Had gone: the participle after had is gone, never went.' }],
      },
    ],
  },
  {
    num: 17,
    quizId: 'stet-8-2-26',
    live: '2026-08-02',
    dateLabel: 'August 2, 2026',
    sunday: true,
    items: [
      {
        text: 'The negotiator tried a softer tact after the first round of talks collapsed.',
        errors: [{ wrong: 'tact', fix: 'tack', note: 'The idiom is "change tack" (a sailing turn); tact is diplomacy.' }],
      },
      {
        text: 'The chef plated each course with theatrical flare and a wink at the diners.',
        errors: [{ wrong: 'flare', fix: 'flair', note: 'Flair is a knack or style; a flare is a burst of light or flame.' }],
      },
      {
        text: "The thriller's plot stayed taut right up to the final page.",
        errors: [],
        cleanNote: 'Clean copy: taut (pulled tight) is correct; taught is the past tense of teach.',
      },
      {
        text: 'The zoning counsel meets Tuesday to weigh the disputed permit.',
        errors: [{ wrong: 'counsel', fix: 'council', note: 'A council is the governing body; counsel is advice or a lawyer.' }],
      },
      {
        text: 'The couple refused to altar their vows, leaving guests to wander what went wrong.',
        errors: [
          { wrong: 'altar', fix: 'alter', note: 'To alter is to change; an altar is the ceremonial table.' },
          { wrong: 'wander', fix: 'wonder', note: 'To wonder is to muse; to wander is to roam on foot.' },
        ],
      },
      {
        text: 'Auditors pour over the records at every construction cite before signing off.',
        errors: [
          { wrong: 'pour', fix: 'pore', note: 'You pore over documents (study them closely); you pour a drink.' },
          { wrong: 'cite', fix: 'site', note: 'A site is a location; to cite is to quote a source.' },
        ],
      },
      {
        text: 'She answered the reporters with a rye smile and said nothing more.',
        errors: [{ wrong: 'rye', fix: 'wry', note: 'A wry smile is dryly ironic; rye is a grain or a whiskey.' }],
      },
    ],
  },
  {
    num: 18,
    quizId: 'stet-8-3-26',
    live: '2026-08-03',
    dateLabel: 'August 3, 2026',
    sunday: false,
    items: [
      {
        text: 'Analysts named the young startup the dominate player in regional logistics.',
        errors: [{ wrong: 'dominate', fix: 'dominant', note: 'Dominant is the adjective; dominate is the verb you do to rivals.' }],
      },
      {
        text: "Investigators described the shell company's paperwork as bazaar and contradictory.",
        errors: [{ wrong: 'bazaar', fix: 'bizarre', note: 'Bizarre means weird; a bazaar is a marketplace.' }],
      },
      {
        text: 'The gallery offered longtime patrons an early peak at the restored mural.',
        errors: [{ wrong: 'peak', fix: 'peek', note: 'A peek is a quick look; a peak is a mountain summit.' }],
      },
      {
        text: 'Forecasters warned that lightening could ground flights through the evening.',
        errors: [{ wrong: 'lightening', fix: 'lightning', note: 'Lightning is the bolt; lightening means making lighter.' }],
      },
      {
        text: "The council praised the auditor's discreet handling of the quiet settlement.",
        errors: [],
        cleanNote: 'Clean copy: discreet (tactful) is right here; discrete would mean separate.',
      },
    ],
  },
  {
    num: 19,
    quizId: 'stet-8-4-26',
    live: '2026-08-04',
    dateLabel: 'August 4, 2026',
    sunday: false,
    items: [
      {
        text: 'The board voted to except the new bylaws at its meeting on Friday.',
        errors: [{ wrong: 'except', fix: 'accept', note: 'To accept is to receive or approve; except means to leave out.' }],
      },
      {
        text: 'By the third hour of testimony, several jurors looked visibly board.',
        errors: [{ wrong: 'board', fix: 'bored', note: 'Bored means weary; a board is a plank or a governing body.' }],
      },
      {
        text: 'Of coarse the deadline can move if the client agrees.',
        errors: [{ wrong: 'coarse', fix: 'course', note: 'Of course uses course; coarse means rough in texture.' }],
      },
      {
        text: 'The negotiators reached an amicable accord after weeks of quiet talks.',
        errors: [],
        cleanNote: 'Clean copy: accord and amicable are used correctly; no error here.',
      },
      {
        text: 'Every peace of evidence pointed to the same conclusion.',
        errors: [{ wrong: 'peace', fix: 'piece', note: 'A piece is a portion; peace is calm or the absence of war.' }],
      },
    ],
  },
  {
    num: 20,
    quizId: 'stet-8-5-26',
    live: '2026-08-05',
    dateLabel: 'August 5, 2026',
    sunday: false,
    items: [
      {
        text: 'The caterer forgot the desert, so the banquet ended without cake.',
        errors: [{ wrong: 'desert', fix: 'dessert', note: 'Dessert is the sweet course; a desert is an arid land.' }],
      },
      {
        text: 'The report called it a miner setback that would not delay the launch.',
        errors: [{ wrong: 'miner', fix: 'minor', note: 'Minor means small; a miner digs for coal or ore.' }],
      },
      {
        text: 'In years passed the festival drew crowds from across the county.',
        errors: [{ wrong: 'passed', fix: 'past', note: 'Past refers to earlier time; passed is the verb, as in time passed.' }],
      },
      {
        text: 'The understudy stepped into the leading roll on opening night.',
        errors: [{ wrong: 'roll', fix: 'role', note: 'A role is a part played; a roll is a list or a small loaf.' }],
      },
      {
        text: "The auditor's thorough review reassured the nervous shareholders.",
        errors: [],
        cleanNote: 'Clean copy: thorough and reassured are spelled and used correctly.',
      },
    ],
  },
  {
    num: 21,
    quizId: 'stet-8-6-26',
    live: '2026-08-06',
    dateLabel: 'August 6, 2026',
    sunday: false,
    items: [
      {
        text: 'They took a short brake before the second session began.',
        errors: [{ wrong: 'brake', fix: 'break', note: 'A break is a pause; a brake stops a vehicle.' }],
      },
      {
        text: 'The pilot guided the plain smoothly onto the rain-slicked runway.',
        errors: [{ wrong: 'plain', fix: 'plane', note: 'A plane is an aircraft; plain means simple or a flat expanse.' }],
      },
      {
        text: 'Critics hailed the novelist as a profit of the digital age.',
        errors: [{ wrong: 'profit', fix: 'prophet', note: 'A prophet foretells the future; profit is financial gain.' }],
      },
      {
        text: 'She gave the intruder a long, cold stair.',
        errors: [{ wrong: 'stair', fix: 'stare', note: 'To stare is to gaze; a stair is a step in a staircase.' }],
      },
      {
        text: 'The panel debated weather to publish the findings early.',
        errors: [{ wrong: 'weather', fix: 'whether', note: 'Whether introduces a choice; weather is the state of the atmosphere.' }],
      },
    ],
  },
  {
    num: 22,
    quizId: 'stet-8-7-26',
    live: '2026-08-07',
    dateLabel: 'August 7, 2026',
    sunday: false,
    items: [
      {
        text: 'The tenants left there keys at the front desk overnight.',
        errors: [{ wrong: 'there', fix: 'their', note: 'Their shows possession; there refers to a place.' }],
      },
      {
        text: 'The board voted to censor the official for missing three hearings.',
        errors: [{ wrong: 'censor', fix: 'censure', note: 'To censure is to formally rebuke; to censor is to suppress content.' }],
      },
      {
        text: 'The author thanked her editor in the forward to the new edition.',
        errors: [{ wrong: 'forward', fix: 'foreword', note: 'A foreword opens a book; forward means ahead or to send on.' }],
      },
      {
        text: "The committee's recommendation was unanimous and remarkably concise.",
        errors: [],
        cleanNote: 'Clean copy: unanimous and concise are correct; nothing to change here.',
      },
      {
        text: "The magician's final allusion left the audience gasping.",
        errors: [{ wrong: 'allusion', fix: 'illusion', note: 'An illusion is a false impression; an allusion is an indirect reference.' }],
      },
    ],
  },
  {
    num: 23,
    quizId: 'stet-8-8-26',
    live: '2026-08-08',
    dateLabel: 'August 8, 2026',
    sunday: false,
    items: [
      {
        text: 'Forecasters warned that a storm was eminent along the coast.',
        errors: [{ wrong: 'eminent', fix: 'imminent', note: 'Imminent means about to happen; eminent means distinguished.' }],
      },
      {
        text: 'The critic argued the novel belongs in the literary cannon.',
        errors: [{ wrong: 'cannon', fix: 'canon', note: 'A canon is an accepted body of works; a cannon is a heavy gun.' }],
      },
      {
        text: 'Fans treated the aging quarterback as a national idle.',
        errors: [{ wrong: 'idle', fix: 'idol', note: 'An idol is an object of devotion; idle means inactive.' }],
      },
      {
        text: 'Officials accused the vendor of trying to pedal counterfeit tickets.',
        errors: [{ wrong: 'pedal', fix: 'peddle', note: 'To peddle is to sell wares; a pedal is a foot lever.' }],
      },
      {
        text: 'Villagers longed to throw off the yolk of foreign rule.',
        errors: [{ wrong: 'yolk', fix: 'yoke', note: 'A yoke is a harness or burden; a yolk is the yellow of an egg.' }],
      },
    ],
  },
  {
    num: 24,
    quizId: 'stet-8-9-26',
    live: '2026-08-09',
    dateLabel: 'August 9, 2026',
    sunday: true,
    items: [
      {
        text: 'He poured his sole into the performance, moving the hole audience to tears.',
        errors: [
          { wrong: 'sole', fix: 'soul', note: 'The soul is the spirit; a sole is a fish or the bottom of a foot.' },
          { wrong: 'hole', fix: 'whole', note: 'Whole means entire; a hole is an opening.' },
        ],
      },
      {
        text: 'The exhibit was vary popular with younger visitors.',
        errors: [{ wrong: 'vary', fix: 'very', note: 'Very is an intensifier; to vary is to differ or change.' }],
      },
      {
        text: 'She new the shortcut and led us threw the alley to the stage door.',
        errors: [
          { wrong: 'new', fix: 'knew', note: 'Knew is the past tense of know; new means recent.' },
          { wrong: 'threw', fix: 'through', note: 'Through means in one side and out the other; threw is the past tense of throw.' },
        ],
      },
      {
        text: 'The heirs gathered at the family manner for the reading of the will.',
        errors: [{ wrong: 'manner', fix: 'manor', note: 'A manor is a large country house; manner means a way of doing something.' }],
      },
      {
        text: "The editor praised the reporter's diligent, well-sourced coverage.",
        errors: [],
        cleanNote: 'Clean copy: diligent and well-sourced are correct; nothing needs fixing.',
      },
      {
        text: 'The hawk began to pray on the field mice, and farmers hated to waist a single trap.',
        errors: [
          { wrong: 'pray', fix: 'prey', note: 'Prey is a hunted animal; to pray is to worship or plead.' },
          { wrong: 'waist', fix: 'waste', note: 'To waste is to squander; the waist is the midsection of the body.' },
        ],
      },
      {
        text: 'The tutor turned each mistake into a lasting lessen.',
        errors: [{ wrong: 'lessen', fix: 'lesson', note: 'A lesson is something learned; to lessen is to reduce.' }],
      },
    ],
  },
  {
    num: 25,
    quizId: 'stet-8-10-26',
    live: '2026-08-10',
    dateLabel: 'August 10, 2026',
    sunday: false,
    items: [
      {
        text: 'She pressed a dried flour between the pages of the atlas.',
        errors: [{ wrong: 'flour', fix: 'flower', note: 'A flower blossoms; flour is ground grain for baking.' }],
      },
      {
        text: 'After the rally his voice was horse and barely audible.',
        errors: [{ wrong: 'horse', fix: 'hoarse', note: 'Hoarse means rough or raspy of voice; a horse is the animal.' }],
      },
      {
        text: 'Her essay offered real incite into the crisis.',
        errors: [{ wrong: 'incite', fix: 'insight', note: 'Insight is deep understanding; to incite is to stir up.' }],
      },
      {
        text: 'The startup revenue grew steadily despite the crowded market.',
        errors: [],
        cleanNote: 'Clean copy: steadily and crowded are used correctly; no change needed.',
      },
      {
        text: "The school's principle addressed the assembly about the new schedule.",
        errors: [{ wrong: 'principle', fix: 'principal', note: 'A principal leads a school; a principle is a rule or belief.' }],
      },
    ],
  },
  {
    num: 26,
    quizId: 'stet-8-11-26',
    live: '2026-08-11',
    dateLabel: 'August 11, 2026',
    sunday: false,
    items: [
      {
        text: "The engineer said the beam had began to sag under the load.",
        errors: [{ wrong: "began", fix: "begun", kind: 'grammar', note: "After had the verb takes begun, not began." }],
      },
      {
        text: "The council voted to rescind the by-law after a long hearing.",
        errors: [],
        cleanNote: "Clean copy: rescind and by-law are both correct here.",
      },
      {
        text: "The developer applied to raise the old mill and build flats.",
        errors: [{ wrong: "raise", fix: "raze", kind: 'wordchoice', note: "To raze is to demolish; to raise is to lift up." }],
      },
      {
        text: "The mayor promised to allay fears about the new levee.",
        errors: [],
        cleanNote: "Clean copy: allay and levee are the right words, odd as levee looks.",
      },
      {
        text: "The farmer sells his produce at the weekly bizarre.",
        errors: [{ wrong: "bizarre", fix: "bazaar", kind: 'wordchoice', note: "A bazaar is a market; bizarre means strange." }],
      },
    ],
  },
  {
    num: 27,
    quizId: 'stet-8-12-26',
    live: '2026-08-12',
    dateLabel: 'August 12, 2026',
    sunday: false,
    items: [
      {
        text: "The porter admitted he had drank nothing since the early shift.",
        errors: [{ wrong: "drank", fix: "drunk", kind: 'grammar', note: "After had the verb takes drunk, not drank." }],
      },
      {
        text: "Residents complained about the sheer volume of freight passing through.",
        errors: [],
        cleanNote: "Clean copy: sheer means utter here, and it is spelled correctly.",
      },
      {
        text: "A stray dog was found wandering the mote at the castle.",
        errors: [{ wrong: "mote", fix: "moat", kind: 'wordchoice', note: "A moat is a defensive ditch; a mote is a speck of dust." }],
      },
      {
        text: "The inspector said the wiring posed a serious fire hazard.",
        errors: [],
        cleanNote: "Clean copy: posed and hazard are used correctly throughout.",
      },
      {
        text: "The tenor sang the aria with remarkable pour.",
        errors: [{ wrong: "pour", fix: "poise", kind: 'wordchoice', note: "Poise is composure; to pour is to tip a liquid out." }],
      },
    ],
  },
  {
    num: 28,
    quizId: 'stet-8-13-26',
    live: '2026-08-13',
    dateLabel: 'August 13, 2026',
    sunday: false,
    items: [
      {
        text: "The captain reported the hull had took on water overnight.",
        errors: [{ wrong: "took", fix: "taken", kind: 'grammar', note: "After had the verb takes taken, not took." }],
      },
      {
        text: "She was granted a reprieve on the eve of the deadline.",
        errors: [],
        cleanNote: "Clean copy: reprieve is the right word and correctly spelled.",
      },
      {
        text: "The estate agent described the flat as a real steel.",
        errors: [{ wrong: "steel", fix: "steal", kind: 'wordchoice', note: "A steal is a bargain; steel is the metal." }],
      },
      {
        text: "The county surveyor measured the site before the works began.",
        errors: [],
        cleanNote: "Clean copy: surveyor and works are both correct as written.",
      },
      {
        text: "The band played a taught, disciplined set.",
        errors: [{ wrong: "taught", fix: "taut", kind: 'wordchoice', note: "Taut means tight and controlled; taught is the past of teach." }],
      },
    ],
  },
  {
    num: 29,
    quizId: 'stet-8-14-26',
    live: '2026-08-14',
    dateLabel: 'August 14, 2026',
    sunday: false,
    items: [
      {
        text: "The tenant complained the boiler had blew a fuse again.",
        errors: [{ wrong: "blew", fix: "blown", kind: 'grammar', note: "After had the verb takes blown, not blew." }],
      },
      {
        text: "He accepted the award with genuine humility.",
        errors: [],
        cleanNote: "Clean copy: accepted is right here, and humility is spelled correctly.",
      },
      {
        text: "The old barn was sold with its timbre roof intact.",
        errors: [{ wrong: "timbre", fix: "timber", kind: 'wordchoice', note: "Timber is wood; timbre is the character of a sound." }],
      },
      {
        text: "The gallery will exhibit the bequest in the autumn.",
        errors: [],
        cleanNote: "Clean copy: exhibit and bequest are both used correctly.",
      },
      {
        text: "The cyclist was fined for riding on the pavement.",
        errors: [],
        cleanNote: "Clean copy: fined is the right word, and the rest of the sentence stands as written.",
      },
    ],
  },
  {
    num: 30,
    quizId: 'stet-8-15-26',
    live: '2026-08-15',
    dateLabel: 'August 15, 2026',
    sunday: false,
    items: [
      {
        text: "The gardener said the frost had did real damage to the espaliers.",
        errors: [{ wrong: "did", fix: "done", kind: 'grammar', note: "After had the verb takes done, not did." }],
      },
      {
        text: "Officers found the vault door had been forced with a pry bar.",
        errors: [],
        cleanNote: "Clean copy: forced is the right verb for a broken lock.",
      },
      {
        text: "The captain gave the order to way anchor at first light.",
        errors: [{ wrong: "way", fix: "weigh", kind: 'wordchoice', note: "To weigh anchor is to raise it; way is a route." }],
      },
      {
        text: "Ministers agreed to waive the fee for small charities.",
        errors: [],
        cleanNote: "Clean copy: waive means to give up a right, exactly as used.",
      },
      {
        text: "The tenant was asked to vacate the premise by Friday.",
        errors: [{ wrong: "premise", fix: "premises", kind: 'wordchoice', note: "Premises means the building; a premise is a proposition." }],
      },
    ],
  },
  {
    num: 31,
    quizId: 'stet-8-16-26',
    live: '2026-08-16',
    dateLabel: 'August 16, 2026',
    sunday: true,
    items: [
      {
        text: "The pipes had froze solid by the second morning of the cold snap.",
        errors: [{ wrong: "froze", fix: "frozen", kind: 'grammar', note: "After had the verb takes frozen, not froze." }],
      },
      {
        text: "The parade passed the stand in marshal order.",
        errors: [{ wrong: "marshal", fix: "martial", kind: 'wordchoice', note: "Martial means military; a marshal is an officer." }],
      },
      {
        text: "Heavy rain delayed the harvest across the eastern counties.",
        errors: [],
        cleanNote: "Clean copy: delayed and harvest are correct as written.",
      },
      {
        text: "The hikers were warned to keep of the loose scree.",
        errors: [{ wrong: "of", fix: "off", kind: 'wordchoice', note: "Off means away from; of is a possessive preposition." }],
      },
      {
        text: "The developer promised to reign back the costs.",
        errors: [{ wrong: "reign", fix: "curb", alts: ["rein", "check"], kind: 'wordchoice', note: "To rein back or curb is to restrain; a reign is a monarch's rule." }],
      },
      {
        text: "The bridge was closed after engineers found a hairline fracture.",
        errors: [],
        cleanNote: "Clean copy: hairline fracture is the right term for the crack.",
      },
      {
        text: "The bidder withdrew after the reserve was reveiled.",
        errors: [{ wrong: "reveiled", fix: "revealed", kind: 'spelling', note: "Revealed is the correct spelling; reveiled is not a word." }],
      },
    ],
  },
  {
    num: 32,
    quizId: 'stet-8-17-26',
    live: '2026-08-17',
    dateLabel: 'August 17, 2026',
    sunday: false,
    items: [
      {
        text: "The lay brothers had ate in silence since the founding.",
        errors: [{ wrong: "ate", fix: "eaten", kind: 'grammar', note: "After had the verb takes eaten, not ate." }],
      },
      {
        text: "The lifeboat crew launched within four minutes of the call.",
        errors: [],
        cleanNote: "Clean copy: launched and crew are used correctly here.",
      },
      {
        text: "The auctioneer noted a sliver of vernier missing from the case.",
        errors: [{ wrong: "vernier", fix: "veneer", kind: 'wordchoice', note: "Veneer is a thin surface layer; a vernier is a measuring scale." }],
      },
      {
        text: "Snow fell steadily through the night on the high fells.",
        errors: [],
        cleanNote: "Clean copy: fells is the correct northern word for the hills.",
      },
      {
        text: "The judge called the delay completely unexcusable.",
        errors: [{ wrong: "unexcusable", fix: "inexcusable", kind: 'wordchoice', note: "Inexcusable is the standard form; unexcusable is not." }],
      },
    ],
  },
  {
    num: 33,
    quizId: 'stet-8-18-26',
    live: '2026-08-18',
    dateLabel: 'August 18, 2026',
    sunday: false,
    items: [
      {
        text: "The choir had sang the same anthem at every installation.",
        errors: [{ wrong: "sang", fix: "sung", kind: 'grammar', note: "After had the verb takes sung, not sang." }],
      },
      {
        text: "The chef reduced the sauce until it began to thicken.",
        errors: [],
        cleanNote: "Clean copy: reduced is the correct culinary term here.",
      },
      {
        text: "The applicant was asked to precise his claim in writing.",
        errors: [{ wrong: "precise", fix: "specify", kind: 'wordchoice', note: "Specify is the verb; precise is an adjective." }],
      },
      {
        text: "The archive holds letters from every decade of the last century.",
        errors: [],
        cleanNote: "Clean copy: archive and decade are correct as written.",
      },
      {
        text: "The tenor's voice carried to the nave without ampliation.",
        errors: [{ wrong: "ampliation", fix: "amplification", kind: 'wordchoice', note: "Amplification is the word; ampliation is a legal rarity." }],
      },
    ],
  },
  {
    num: 34,
    quizId: 'stet-8-19-26',
    live: '2026-08-19',
    dateLabel: 'August 19, 2026',
    sunday: false,
    items: [
      {
        text: "The swimmer had swam the channel twice before that summer.",
        errors: [{ wrong: "swam", fix: "swum", kind: 'grammar', note: "After had the verb takes swum, not swam." }],
      },
      {
        text: "The minister refused to be drawn on the leaked memo.",
        errors: [],
        cleanNote: "Clean copy: drawn is idiomatic and correct in this sense.",
      },
      {
        text: "The porter found the seal on the parcel was brocken.",
        errors: [{ wrong: "brocken", fix: "broken", kind: 'spelling', note: "Broken is the correct spelling; Brocken is a German peak." }],
      },
      {
        text: "The scheme was designed to complement the existing service.",
        errors: [],
        cleanNote: "Clean copy: complement means to complete, which is what is meant.",
      },
      {
        text: "The choir processed to the chancel in full vestures.",
        errors: [{ wrong: "vestures", fix: "vestments", kind: 'wordchoice', note: "Vestments are church robes; vesture is a poetic covering." }],
      },
    ],
  },
  {
    num: 35,
    quizId: 'stet-8-20-26',
    live: '2026-08-20',
    dateLabel: 'August 20, 2026',
    sunday: false,
    items: [
      {
        text: "The ringers had rang a full peal on the coronation morning.",
        errors: [{ wrong: "rang", fix: "rung", kind: 'grammar', note: "After had the verb takes rung, not rang." }],
      },
      {
        text: "The auditors examined every invoice from the last quarter.",
        errors: [],
        cleanNote: "Clean copy: auditors and invoice are used correctly.",
      },
      {
        text: "The porter carried the trunk up four flights without pause for breathe.",
        errors: [{ wrong: "breathe", fix: "breath", kind: 'wordchoice', note: "Breath is the noun; breathe is the verb." }],
      },
      {
        text: "The letter was addressed to the executor of the estate.",
        errors: [],
        cleanNote: "Clean copy: executor is the correct legal term here.",
      },
      {
        text: "The lecturer said the argument was entirely fatuitous.",
        errors: [{ wrong: "fatuitous", fix: "fatuous", kind: 'spelling', note: "Fatuous means silly; fatuitous is not a word." }],
      },
    ],
  },
  {
    num: 36,
    quizId: 'stet-8-21-26',
    live: '2026-08-21',
    dateLabel: 'August 21, 2026',
    sunday: false,
    items: [
      {
        text: "The river had rose four feet by the time the sirens went.",
        errors: [{ wrong: "rose", fix: "risen", kind: 'grammar', note: "After had the verb takes risen, not rose." }],
      },
      {
        text: "The society was founded to preserve the old drove roads.",
        errors: [],
        cleanNote: "Clean copy: drove roads is the correct historical term.",
      },
      {
        text: "The surveyor found the wall was badly out of plum.",
        errors: [{ wrong: "plum", fix: "plumb", kind: 'wordchoice', note: "Plumb means vertical; a plum is a fruit." }],
      },
      {
        text: "Inspectors praised the school's pastoral care.",
        errors: [],
        cleanNote: "Clean copy: pastoral care is standard usage in schools.",
      },
      {
        text: "The clerk read the notice allowed to the meeting.",
        errors: [{ wrong: "allowed", fix: "aloud", kind: 'wordchoice', note: "Aloud means out loud; allowed means permitted." }],
      },
    ],
  },
  {
    num: 37,
    quizId: 'stet-8-22-26',
    live: '2026-08-22',
    dateLabel: 'August 22, 2026',
    sunday: false,
    items: [
      {
        text: "The timbers had shrank in the long dry spell.",
        errors: [{ wrong: "shrank", fix: "shrunk", kind: 'grammar', note: "After had the verb takes shrunk, not shrank." }],
      },
      {
        text: "He was hoping to home in on the source of the leak.",
        errors: [],
        cleanNote: "Clean copy: home in is correct; hone in is the common error.",
      },
      {
        text: "The lense floated on mercury, reducing friction to almost nothing.",
        errors: [{ wrong: "lense", fix: "lens", kind: 'spelling', note: "Lens is the correct spelling; lense is a common misspelling of it." }],
      },
      {
        text: "The trust appealed for volunteers to man the phone lines.",
        errors: [],
        cleanNote: "Clean copy: man the lines is idiomatic and correctly used.",
      },
      {
        text: "The precinct wall was breeched during the dissolution.",
        errors: [{ wrong: "breeched", fix: "breached", kind: 'wordchoice', note: "To breach is to break through; breeches are trousers." }],
      },
    ],
  },
  {
    num: 38,
    quizId: 'stet-8-23-26',
    live: '2026-08-23',
    dateLabel: 'August 23, 2026',
    sunday: true,
    items: [
      {
        text: "The barge had sank in shallow water off the staithe.",
        errors: [{ wrong: "sank", fix: "sunk", kind: 'grammar', note: "After had the verb takes sunk, not sank." }],
      },
      {
        text: "The clerk complained of a cramped and illegable script.",
        errors: [{ wrong: "illegable", fix: "illegible", kind: 'spelling', note: "Illegible is the correct spelling for unreadable writing." }],
      },
      {
        text: "The trawler returned to port with a full hold.",
        errors: [],
        cleanNote: "Clean copy: hold is the right word for a ship's cargo space.",
      },
      {
        text: "The inquest censured the deputy for a lax inspection regiment.",
        errors: [{ wrong: "regiment", fix: "regime", kind: 'wordchoice', note: "A regime is a system; a regiment is a military unit." }],
      },
      {
        text: "The basin silted up, unnoticed accept by the herons.",
        errors: [{ wrong: "accept", fix: "except", kind: 'wordchoice', note: "Except means apart from; to accept is to receive." }],
      },
      {
        text: "The lecture drew a capacity crowd to the old hall.",
        errors: [],
        cleanNote: "Clean copy: capacity crowd is standard and correct.",
      },
      {
        text: "The company blamed an act of God rather than the affect of pumping.",
        errors: [{ wrong: "affect", fix: "effect", kind: 'wordchoice', note: "The effect is the result; to affect is to influence." }],
      },
    ],
  },
  {
    num: 39,
    quizId: 'stet-8-24-26',
    live: '2026-08-24',
    dateLabel: 'August 24, 2026',
    sunday: false,
    items: [
      {
        text: "The curate had wrote to the bishop twice that winter.",
        errors: [{ wrong: "wrote", fix: "written", kind: 'grammar', note: "After had the verb takes written, not wrote." }],
      },
      {
        text: "The report was full of vague allusions to a second site.",
        errors: [],
        cleanNote: "Clean copy: allusions means indirect references, which fits.",
      },
      {
        text: "The apprentice was always maid to clear the wheel pit.",
        errors: [{ wrong: "maid", fix: "made", kind: 'wordchoice', note: "Made is the past of make; a maid is a servant." }],
      },
      {
        text: "The vet said the mare had made a full recovery.",
        errors: [],
        cleanNote: "Clean copy: mare and recovery are both correct here.",
      },
      {
        text: "The warden described the cliff path as quite treacherous in wet weather, and advised walkers to where boots.",
        errors: [{ wrong: "where", fix: "wear", kind: 'wordchoice', note: "To wear is to have on; where asks about place." }],
      },
    ],
  },
  {
    num: 40,
    quizId: 'stet-8-25-26',
    live: '2026-08-25',
    dateLabel: 'August 25, 2026',
    sunday: false,
    items: [
      {
        text: "The witness had spoke to officers before the inquest opened.",
        errors: [{ wrong: "spoke", fix: "spoken", kind: 'grammar', note: "After had the verb takes spoken, not spoke." }],
      },
      {
        text: "The exhibition traces the rise of the cotton trade.",
        errors: [],
        cleanNote: "Clean copy: traces is the right verb for a historical survey.",
      },
      {
        text: "The clerk noted the meeting was adjourned sign die.",
        errors: [{ wrong: "sign", fix: "sine", kind: 'wordchoice', note: "The Latin is sine die, meaning without a day fixed." }],
      },
      {
        text: "The candidate made a passionate plea for calm.",
        errors: [],
        cleanNote: "Clean copy: plea is correct; the homophone please is not needed.",
      },
      {
        text: "The society bought the plot to prevent it being built upon by a spectator developer.",
        errors: [{ wrong: "spectator", fix: "speculative", kind: 'wordchoice', note: "Speculative means done on a gamble; a spectator watches." }],
      },
    ],
  },
  {
    num: 41,
    quizId: 'stet-8-26-26',
    live: '2026-08-26',
    dateLabel: 'August 26, 2026',
    sunday: false,
    items: [
      {
        text: "The warden had saw the vessel drifting an hour earlier.",
        errors: [{ wrong: "saw", fix: "seen", kind: 'grammar', note: "After had the verb takes seen, not saw." }],
      },
      {
        text: "Divers surveyed the wreck at a depth of forty metres.",
        errors: [],
        cleanNote: "Clean copy: surveyed and depth are used correctly.",
      },
      {
        text: "The vicar read the lesson from the leggern at the crossing.",
        errors: [{ wrong: "leggern", fix: "lectern", kind: 'spelling', note: "A lectern is a reading stand; leggern is not a word." }],
      },
      {
        text: "The village pump has not drawn water since 1974.",
        errors: [],
        cleanNote: "Clean copy: drawn is the correct participle after has.",
      },
      {
        text: "The mason repaired the quoins with a lime morter.",
        errors: [{ wrong: "morter", fix: "mortar", kind: 'spelling', note: "Mortar is the correct spelling for the binding mix." }],
      },
    ],
  },
  {
    num: 42,
    quizId: 'stet-8-27-26',
    live: '2026-08-27',
    dateLabel: 'August 27, 2026',
    sunday: false,
    items: [
      {
        text: "The relief crew had came ashore before the gale.",
        errors: [{ wrong: "came", fix: "come", kind: 'grammar', note: "After had the verb takes come, not came." }],
      },
      {
        text: "The choir sang unaccompanied in the north aisle.",
        errors: [],
        cleanNote: "Clean copy: aisle is correctly spelled, and unaccompanied fits.",
      },
      {
        text: "The gardener said the yew hedge needed a hard prune to reinvigerate it.",
        errors: [{ wrong: "reinvigerate", fix: "reinvigorate", kind: 'spelling', note: "Reinvigorate is the correct spelling." }],
      },
      {
        text: "The bakery has traded on the same corner since 1908.",
        errors: [],
        cleanNote: "Clean copy: traded and corner are used correctly.",
      },
      {
        text: "The barn owl quartered the meadow at dusk, silent as a wraith, hunting voles among the tussuck grass.",
        errors: [{ wrong: "tussuck", fix: "tussock", kind: 'spelling', note: "Tussock is the correct spelling for a clump of grass." }],
      },
    ],
  },
  {
    num: 43,
    quizId: 'stet-8-28-26',
    live: '2026-08-28',
    dateLabel: 'August 28, 2026',
    sunday: false,
    items: [
      {
        text: "The trustees had gave notice of the sale in March.",
        errors: [{ wrong: "gave", fix: "given", kind: 'grammar', note: "After had the verb takes given, not gave." }],
      },
      {
        text: "Rescuers worked through the night to shore up the wall.",
        errors: [],
        cleanNote: "Clean copy: shore up is the correct idiom for propping something.",
      },
      {
        text: "The archivist wore cotton gloves to handle the vellum manuscripts, which were kept in a seller beneath the library.",
        errors: [{ wrong: "seller", fix: "cellar", kind: 'wordchoice', note: "A cellar is an underground room; a seller is someone who sells." }],
      },
      {
        text: "The tenant complained of a persistent draft under the door.",
        errors: [],
        cleanNote: "Clean copy: draft is acceptable US style for a current of air.",
      },
      {
        text: "The society restored the sundial and its knomon.",
        errors: [{ wrong: "knomon", fix: "gnomon", kind: 'spelling', note: "A gnomon is the pointer on a sundial; knomon is not a word." }],
      },
    ],
  },
  {
    num: 44,
    quizId: 'stet-8-29-26',
    live: '2026-08-29',
    dateLabel: 'August 29, 2026',
    sunday: false,
    items: [
      {
        text: "The foreman had knew about the fault for a fortnight.",
        errors: [{ wrong: "knew", fix: "known", kind: 'grammar', note: "After had the verb takes known, not knew." }],
      },
      {
        text: "The museum acquired the diary at a country sale.",
        errors: [],
        cleanNote: "Clean copy: acquired is exact and correctly spelled.",
      },
      {
        text: "The engineer measured the fall of the drain and said the gradient was to shallow for the flow.",
        errors: [{ wrong: "to", fix: "too", kind: 'wordchoice', note: "Too means excessively; to is the preposition." }],
      },
      {
        text: "The magistrate imposed a suspended sentence.",
        errors: [],
        cleanNote: "Clean copy: suspended sentence is the correct legal phrase.",
      },
      {
        text: "The auctioneer described the chest as a fine example of marquetary.",
        errors: [{ wrong: "marquetary", fix: "marquetry", kind: 'spelling', note: "Marquetry is the correct spelling for inlaid woodwork." }],
      },
    ],
  },
  {
    num: 45,
    quizId: 'stet-8-30-26',
    live: '2026-08-30',
    dateLabel: 'August 30, 2026',
    sunday: true,
    items: [
      {
        text: "The storm had threw slates across the whole terrace.",
        errors: [{ wrong: "threw", fix: "thrown", kind: 'grammar', note: "After had the verb takes thrown, not threw." }],
      },
      {
        text: "The abbot's tomb bears a brass effigee worn smooth by pilgrims.",
        errors: [{ wrong: "effigee", fix: "effigy", kind: 'spelling', note: "Effigy is the correct spelling for a carved likeness." }],
      },
      {
        text: "The tide had turned before the boat cleared the bar.",
        errors: [],
        cleanNote: "Clean copy: bar is the correct word for a sandbank at a harbour mouth.",
      },
      {
        text: "The trust replaced the rotten bargeboards on the gable end and renewed the led flashing beneath.",
        errors: [{ wrong: "led", fix: "lead", kind: 'wordchoice', note: "Lead is the metal on the roof; led is the past tense of lead." }],
      },
      {
        text: "The parish paid a mason to repair the lychgate roof, witch had been open to the weather for years.",
        errors: [{ wrong: "witch", fix: "which", kind: 'wordchoice', note: "Which is the relative pronoun; a witch is a person." }],
      },
      {
        text: "The station master rang the bell twice before departure.",
        errors: [],
        cleanNote: "Clean copy: station master and departure are correct.",
      },
      {
        text: "The keeper locked a pod of dolphins passing the head at dusk.",
        errors: [{ wrong: "locked", fix: "logged", kind: 'wordchoice', note: "To log is to record; to lock is to fasten." }],
      },
    ],
  },
  {
    num: 46,
    quizId: 'stet-8-31-26',
    live: '2026-08-31',
    dateLabel: 'August 31, 2026',
    sunday: false,
    items: [
      {
        text: "The pilot had flew the route in worse weather than this.",
        errors: [{ wrong: "flew", fix: "flown", kind: 'grammar', note: "After had the verb takes flown, not flew." }],
      },
      {
        text: "Surveyors marked the boundary with cast-iron posts.",
        errors: [],
        cleanNote: "Clean copy: boundary and cast-iron are correctly used.",
      },
      {
        text: "The tenant left the cottage in a filthy state, and the agent found the flue completely choaked with soot.",
        errors: [{ wrong: "choaked", fix: "choked", kind: 'spelling', note: "Choked is the correct spelling; choaked is not a word." }],
      },
      {
        text: "The scheme will benefit those who are most vulnerable.",
        errors: [],
        cleanNote: "Clean copy: benefit and vulnerable are the right words here.",
      },
      {
        text: "The society published a memoire of the founder's early years.",
        errors: [{ wrong: "memoire", fix: "memoir", kind: 'spelling', note: "Memoir is the English spelling; memoire is French." }],
      },
    ],
  },
  {
    num: 47,
    quizId: 'stet-9-1-26',
    live: '2026-09-01',
    dateLabel: 'September 1, 2026',
    sunday: false,
    items: [
      {
        text: "The committee had chose the site before the survey arrived.",
        errors: [{ wrong: "chose", fix: "chosen", kind: 'grammar', note: "After had the verb takes chosen, not chose." }],
      },
      {
        text: "The orchard has produced fruit for over a century.",
        errors: [],
        cleanNote: "Clean copy: orchard and produced are used correctly.",
      },
      {
        text: "The stonemason worked the granite with a pitching tool and a bolstor.",
        errors: [{ wrong: "bolstor", fix: "bolster", kind: 'spelling', note: "A bolster is a broad chisel; bolstor is a misspelling." }],
      },
      {
        text: "The inquiry found no evidence of deliberate concealment.",
        errors: [],
        cleanNote: "Clean copy: concealment is the right noun and correctly spelled.",
      },
      {
        text: "The trustees asked whether the covenant was still enforcable.",
        errors: [{ wrong: "enforcable", fix: "enforceable", kind: 'wordchoice', note: "Enforceable keeps the e before able." }],
      },
    ],
  },
  {
    num: 48,
    quizId: 'stet-9-2-26',
    live: '2026-09-02',
    dateLabel: 'September 2, 2026',
    sunday: false,
    items: [
      {
        text: "The frost had broke the top course of brickwork.",
        errors: [{ wrong: "broke", fix: "broken", kind: 'grammar', note: "After had the verb takes broken, not broke." }],
      },
      {
        text: "The gallery mounted the canvas in a plain oak frame.",
        errors: [],
        cleanNote: "Clean copy: canvas is right here, since it means the cloth.",
      },
      {
        text: "The curator catalogued the coins as a hord of the late fourth century.",
        errors: [{ wrong: "hord", fix: "hoard", kind: 'spelling', note: "A hoard is a buried store; hord is not a word." }],
      },
      {
        text: "The union warned that morale had reached a new nadir.",
        errors: [],
        cleanNote: "Clean copy: morale and nadir are both correct as written.",
      },
      {
        text: "The engineer proposed a sluice to releive the pressure on the culvert.",
        errors: [{ wrong: "releive", fix: "relieve", kind: 'wordchoice', note: "Relieve follows the i before e rule after the l." }],
      },
    ],
  },
  {
    num: 49,
    quizId: 'stet-9-3-26',
    live: '2026-09-03',
    dateLabel: 'September 3, 2026',
    sunday: false,
    items: [
      {
        text: "The thieves had stole the lead from the chancel roof.",
        errors: [{ wrong: "stole", fix: "stolen", kind: 'grammar', note: "After had the verb takes stolen, not stole." }],
      },
      {
        text: "The lighthouse was automated in the early nineties.",
        errors: [],
        cleanNote: "Clean copy: automated is exact and correctly spelled.",
      },
      {
        text: "The vicar thanked the ringers for a quarter peal rung in memorium.",
        errors: [{ wrong: "memorium", fix: "memoriam", kind: 'wordchoice', note: "The Latin phrase is in memoriam." }],
      },
      {
        text: "The auctioneer withdrew the lot before bidding closed.",
        errors: [],
        cleanNote: "Clean copy: withdrew is the correct past tense of withdraw.",
      },
      {
        text: "The wall plate had rotted where the gutter had overflowed, and the damage had past unnoticed for years.",
        errors: [{ wrong: "past", fix: "passed", kind: 'wordchoice', note: "Passed is the verb; past means an earlier time or beyond." }],
      },
    ],
  },
  {
    num: 50,
    quizId: 'stet-9-4-26',
    live: '2026-09-04',
    dateLabel: 'September 4, 2026',
    sunday: false,
    items: [
      {
        text: "The ferryman had wore the same oilskin for thirty years.",
        errors: [{ wrong: "wore", fix: "worn", kind: 'grammar', note: "After had the verb takes worn, not wore." }],
      },
      {
        text: "The path skirts the reservoir for about a mile.",
        errors: [],
        cleanNote: "Clean copy: skirts and reservoir are used correctly.",
      },
      {
        text: "The society bought a set of chairs said to be Chippendale, though the provenence was thin.",
        errors: [{ wrong: "provenence", fix: "provenance", kind: 'spelling', note: "Provenance is the correct spelling for an object's history." }],
      },
      {
        text: "The forge has stood beside the ford since Tudor times.",
        errors: [],
        cleanNote: "Clean copy: forge and ford are the right words here.",
      },
      {
        text: "The farmer drained the low meadow with a herringbone of clay tiles, and the field was dry within a weak.",
        errors: [{ wrong: "weak", fix: "week", kind: 'wordchoice', note: "A week is seven days; weak means lacking strength." }],
      },
    ],
  },
  {
    num: 51,
    quizId: 'stet-9-5-26',
    live: '2026-09-05',
    dateLabel: 'September 5, 2026',
    sunday: false,
    items: [
      {
        text: "The gale had tore the sail clean from the yard.",
        errors: [{ wrong: "tore", fix: "torn", kind: 'grammar', note: "After had the verb takes torn, not tore." }],
      },
      {
        text: "The bursar reconciled the accounts on the last day of term.",
        errors: [],
        cleanNote: "Clean copy: bursar and reconciled are correct as written.",
      },
      {
        text: "The organist complained the bellows leaked and the wind pressure was iregular.",
        errors: [{ wrong: "iregular", fix: "irregular", kind: 'wordchoice', note: "Irregular doubles the r after the prefix." }],
      },
      {
        text: "Officials denied that the decision had been made in advance.",
        errors: [],
        cleanNote: "Clean copy: denied and in advance are used correctly.",
      },
      {
        text: "The society keeps the founder's papers in a fireproof safe, and only the archivist has excess to it.",
        errors: [{ wrong: "excess", fix: "access", kind: 'wordchoice', note: "Access is the right of entry; excess means too much of something." }],
      },
    ],
  },
  {
    num: 52,
    quizId: 'stet-9-6-26',
    live: '2026-09-06',
    dateLabel: 'September 6, 2026',
    sunday: true,
    items: [
      {
        text: "The carrier had drove the same lane since the war.",
        errors: [{ wrong: "drove", fix: "driven", kind: 'grammar', note: "After had the verb takes driven, not drove." }],
      },
      {
        text: "The warden reported a heard of deer on the golf links at dawn.",
        errors: [{ wrong: "heard", fix: "herd", kind: 'wordchoice', note: "A herd is a group of animals; heard is the past of hear." }],
      },
      {
        text: "The abbey ruins are managed by a small charitable trust.",
        errors: [],
        cleanNote: "Clean copy: ruins and charitable are correct as written.",
      },
      {
        text: "The chandler sold rope, tar and canvas to the whole quayside, and kept his ledger in a hand no clerk could reed.",
        errors: [{ wrong: "reed", fix: "read", kind: 'wordchoice', note: "To read is to make out writing; a reed is a marsh plant." }],
      },
      {
        text: "The bell ringers practised a method called Grandsire Triples every Tuesday, and the tower captain kept a peel book.",
        errors: [{ wrong: "peel", fix: "peal", kind: 'wordchoice', note: "A peal is a run of bell changes; to peel is to strip." }],
      },
      {
        text: "Wardens counted seals hauled out on the sandbank.",
        errors: [],
        cleanNote: "Clean copy: hauled out is the correct term for seals on shore.",
      },
      {
        text: "The gamekeeper found a snair set in the plantation.",
        errors: [{ wrong: "snair", fix: "snare", kind: 'spelling', note: "A snare is a wire trap; snair is not a word." }],
      },
    ],
  },
  {
    num: 53,
    quizId: 'stet-9-7-26',
    live: '2026-09-07',
    dateLabel: 'September 7, 2026',
    sunday: false,
    items: [
      {
        text: "The postmistress had rode to the outlying farms by pony.",
        errors: [{ wrong: "rode", fix: "ridden", kind: 'grammar', note: "After had the verb takes ridden, not rode." }],
      },
      {
        text: "The paper printed a full retraction the following week.",
        errors: [],
        cleanNote: "Clean copy: retraction is the right word for a printed correction.",
      },
      {
        text: "The trust asked walkers to keep dogs on a leash near the ewes and to shut every gait behind them.",
        errors: [{ wrong: "gait", fix: "gate", kind: 'wordchoice', note: "A gate is a barrier; a gait is a manner of walking." }],
      },
      {
        text: "The estate has kept the same tenant farmers for decades.",
        errors: [],
        cleanNote: "Clean copy: tenant is correct here, since it means a renter.",
      },
      {
        text: "The auctioneer knocked the lot down to a telephone bider.",
        errors: [{ wrong: "bider", fix: "bidder", kind: 'spelling', note: "A bidder makes an offer; bider is not a word." }],
      },
    ],
  },
  {
    num: 54,
    quizId: 'stet-9-8-26',
    live: '2026-09-08',
    dateLabel: 'September 8, 2026',
    sunday: false,
    items: [
      {
        text: "The smugglers had hid the casks beneath the stable floor.",
        errors: [{ wrong: "hid", fix: "hidden", kind: 'grammar', note: "After had the verb takes hidden, not hid." }],
      },
      {
        text: "The society restored the organ pipe by pipe.",
        errors: [],
        cleanNote: "Clean copy: restored and pipe by pipe are used correctly.",
      },
      {
        text: "The keeper set a line of lobster creels along the reef and hauled them at first light on a rising tied.",
        errors: [{ wrong: "tied", fix: "tide", kind: 'wordchoice', note: "The tide is the sea rising and falling; tied means fastened." }],
      },
      {
        text: "He gave a candid account of the night's events.",
        errors: [],
        cleanNote: "Clean copy: candid is the right word and correctly spelled.",
      },
      {
        text: "The blacksmith drew the bar down on the anvil's beek.",
        errors: [{ wrong: "beek", fix: "beak", kind: 'wordchoice', note: "The beak is the pointed horn of an anvil." }],
      },
    ],
  },
  {
    num: 55,
    quizId: 'stet-9-9-26',
    live: '2026-09-09',
    dateLabel: 'September 9, 2026',
    sunday: false,
    items: [
      {
        text: "The sheepdog had bit the auctioneer during the sale.",
        errors: [{ wrong: "bit", fix: "bitten", kind: 'grammar', note: "After had the verb takes bitten, not bit." }],
      },
      {
        text: "The ferry runs hourly from the slipway in summer.",
        errors: [],
        cleanNote: "Clean copy: slipway is the right word and correctly spelled.",
      },
      {
        text: "The society traced the family through the parish regesters.",
        errors: [{ wrong: "regesters", fix: "registers", kind: 'spelling', note: "Registers is the correct spelling for parish record books." }],
      },
      {
        text: "The flock of geese was grazing on the winter wheat.",
        errors: [],
        cleanNote: "Clean copy: a flock takes a singular verb, so was is right.",
      },
      {
        text: "The tenant said the chimney had not been swept in living memory, and the flu was blocked with jackdaw nests.",
        errors: [{ wrong: "flu", fix: "flue", kind: 'wordchoice', note: "A flue is a chimney passage; flu is the illness." }],
      },
    ],
  },
  {
    num: 56,
    quizId: 'stet-9-10-26',
    live: '2026-09-10',
    dateLabel: 'September 10, 2026',
    sunday: false,
    items: [
      {
        text: "The scaffolding had fell before the inspector arrived.",
        errors: [{ wrong: "fell", fix: "fallen", kind: 'grammar', note: "After had the verb takes fallen, not fell." }],
      },
      {
        text: "The bishop consecrated the new chapel in June.",
        errors: [],
        cleanNote: "Clean copy: consecrated is exact and correctly spelled.",
      },
      {
        text: "The mason cut a drip mould to through water clear of the wall face.",
        errors: [{ wrong: "through", fix: "throw", kind: 'wordchoice', note: "To throw water clear is the sense here; through means passing inside." }],
      },
      {
        text: "The tenant claimed the landlord had reneged on the deal.",
        errors: [],
        cleanNote: "Clean copy: reneged is the right verb and correctly spelled.",
      },
      {
        text: "The bursar found the accounts did not tally, being out by a considerable some.",
        errors: [{ wrong: "some", fix: "sum", kind: 'wordchoice', note: "A sum is an amount of money; some means a few." }],
      },
    ],
  },
  {
    num: 57,
    quizId: 'stet-9-11-26',
    live: '2026-09-11',
    dateLabel: 'September 11, 2026',
    sunday: false,
    items: [
      {
        text: "The verger had forgot to wind the tower clock.",
        errors: [{ wrong: "forgot", fix: "forgotten", kind: 'grammar', note: "After had the verb takes forgotten, not forgot." }],
      },
      {
        text: "The quarry closed in 1962 and has since flooded.",
        errors: [],
        cleanNote: "Clean copy: quarry and flooded are used correctly.",
      },
      {
        text: "The society photographed every headstone before the clearance, though the lettering on many was pail and worn.",
        errors: [{ wrong: "pail", fix: "pale", kind: 'wordchoice', note: "Pale means faint in colour; a pail is a bucket." }],
      },
      {
        text: "The tribunal ordered the firm to reinstate the worker.",
        errors: [],
        cleanNote: "Clean copy: reinstate is the correct legal term here.",
      },
      {
        text: "The ferry was held at the quay by a strong ebb and a foul birth.",
        errors: [{ wrong: "birth", fix: "berth", kind: 'wordchoice', note: "A berth is a mooring; birth is being born." }],
      },
    ],
  },
  {
    num: 58,
    quizId: 'stet-9-12-26',
    live: '2026-09-12',
    dateLabel: 'September 12, 2026',
    sunday: false,
    items: [
      {
        text: "The keeper had awoke to find the lamp still burning.",
        errors: [{ wrong: "awoke", fix: "awoken", kind: 'grammar', note: "After had the verb takes awoken, not awoke." }],
      },
      {
        text: "The choir master rehearsed the descant until dusk.",
        errors: [],
        cleanNote: "Clean copy: descant is the right musical term, oddly as it reads.",
      },
      {
        text: "The forester marked the diseased elms with a paint blaise.",
        errors: [{ wrong: "blaise", fix: "blaze", kind: 'wordchoice', note: "A blaze is a mark cut or painted on a tree." }],
      },
      {
        text: "The library keeps the parish registers on microfilm.",
        errors: [],
        cleanNote: "Clean copy: registers and microfilm are correct as written.",
      },
      {
        text: "The clerk filed the deeds under a docket numbered in serial order, and noted the seel was intact.",
        errors: [{ wrong: "seel", fix: "seal", kind: 'wordchoice', note: "A seal is a wax impression; seel is a falconry term." }],
      },
    ],
  },
  {
    num: 59,
    quizId: 'stet-9-13-26',
    live: '2026-09-13',
    dateLabel: 'September 13, 2026',
    sunday: true,
    items: [
      {
        text: "A dispute had arose over the boundary hedge.",
        errors: [{ wrong: "arose", fix: "arisen", kind: 'grammar', note: "After had the verb takes arisen, not arose." }],
      },
      {
        text: "The publican kept a slate for the regulars, a custom that finally seized in 1974.",
        errors: [{ wrong: "seized", fix: "ceased", kind: 'wordchoice', note: "To cease is to stop; to seize is to grab or to jam." }],
      },
      {
        text: "The society published a facsimile of the 1745 map.",
        errors: [],
        cleanNote: "Clean copy: facsimile is the right word and correctly spelled.",
      },
      {
        text: "The keeper counted forty grey seal pups on the skerry at low water, though he had to pier through the haze to be sure.",
        errors: [{ wrong: "pier", fix: "peer", kind: 'wordchoice', note: "To peer is to look closely; a pier is a jetty." }],
      },
      {
        text: "The trust rebuilt the sea wall with rock armour brought by barge, and graded the aprin behind it.",
        errors: [{ wrong: "aprin", fix: "apron", kind: 'wordchoice', note: "An apron is the sloping surface at the base of a wall." }],
      },
      {
        text: "Her testimony was consistent throughout the hearing.",
        errors: [],
        cleanNote: "Clean copy: testimony and consistent are used correctly.",
      },
      {
        text: "The archivist unfolded a plan drawn on linen and backed with pased paper.",
        errors: [{ wrong: "pased", fix: "pasted", kind: 'wordchoice', note: "Pasted is the correct past participle of paste." }],
      },
    ],
  },
  {
    num: 60,
    quizId: 'stet-9-14-26',
    live: '2026-09-14',
    dateLabel: 'September 14, 2026',
    sunday: false,
    items: [
      {
        text: "The surveyor had mistook the datum for the old benchmark.",
        errors: [{ wrong: "mistook", fix: "mistaken", kind: 'grammar', note: "After had the verb takes mistaken, not mistook." }],
      },
      {
        text: "The bell tower leans a little to the south.",
        errors: [],
        cleanNote: "Clean copy: leans is the right verb and correctly spelled.",
      },
      {
        text: "The gardener staked the espalier against the south wall, where a vain of chalk ran close under the border.",
        errors: [{ wrong: "vain", fix: "vein", kind: 'wordchoice', note: "A vein is a seam running through the ground; vain means conceited." }],
      },
      {
        text: "The tunnel was bored through solid chalk.",
        errors: [],
        cleanNote: "Clean copy: bored is correct here, meaning drilled.",
      },
      {
        text: "The society recorded the ring of six bells, the tenor recast in 1898 buy a Whitechapel founder.",
        errors: [{ wrong: "buy", fix: "by", kind: 'wordchoice', note: "By names the agent who did the work; buy means to purchase." }],
      },
    ],
  },
  {
    num: 61,
    quizId: 'stet-9-15-26',
    live: '2026-09-15',
    dateLabel: 'September 15, 2026',
    sunday: false,
    items: [
      {
        text: "Him and the foreman signed the completion notice together.",
        errors: [{ wrong: "Him", fix: "He", kind: 'grammar', note: "A subject takes the nominative, so it reads he and the foreman." }],
      },
      {
        text: "The harbour wall was rebuilt after the winter storms.",
        errors: [],
        cleanNote: "Clean copy: rebuilt and harbour are used correctly.",
      },
      {
        text: "The engineer said the culvert had silted and would need jetting to clear the invart.",
        errors: [{ wrong: "invart", fix: "invert", kind: 'wordchoice', note: "The invert is the lowest inside surface of a pipe." }],
      },
      {
        text: "The lock keeper opened the gates at six.",
        errors: [],
        cleanNote: "Clean copy: lock keeper is the correct canal term.",
      },
      {
        text: "The trustees agreed to insure the collection for its full replacment value.",
        errors: [{ wrong: "replacment", fix: "replacement", kind: 'wordchoice', note: "Replacement keeps the e before ment." }],
      },
    ],
  },
  {
    num: 62,
    quizId: 'stet-9-16-26',
    live: '2026-09-16',
    dateLabel: 'September 16, 2026',
    sunday: false,
    items: [
      {
        text: "Us surveyors were asked to file a single joint report.",
        errors: [{ wrong: "Us", fix: "We", kind: 'grammar', note: "The subject takes we, so it reads we surveyors were asked." }],
      },
      {
        text: "The rector read the banns for the third time.",
        errors: [],
        cleanNote: "Clean copy: banns is the correct church spelling.",
      },
      {
        text: "The porter said the lift had been out of order for a fortnight, which was a serious inconvenence.",
        errors: [{ wrong: "inconvenence", fix: "inconvenience", kind: 'spelling', note: "Inconvenience is the correct spelling." }],
      },
      {
        text: "The farm has diversified into cheese and cider.",
        errors: [],
        cleanNote: "Clean copy: diversified is exact and correctly spelled.",
      },
      {
        text: "The society published a guide to the church, its glass and its monuments, with a foreward by the archdeacon.",
        errors: [{ wrong: "foreward", fix: "foreword", kind: 'wordchoice', note: "A foreword is an introduction; forward means ahead." }],
      },
    ],
  },
  {
    num: 63,
    quizId: 'stet-9-17-26',
    live: '2026-09-17',
    dateLabel: 'September 17, 2026',
    sunday: false,
    items: [
      {
        text: "Between you and I, the tender was never going to succeed.",
        errors: [{ wrong: "I", fix: "me", kind: 'grammar', note: "After between the pronoun takes the object form, me." }],
      },
      {
        text: "The kiln was fired for the last time in 1978.",
        errors: [],
        cleanNote: "Clean copy: kiln and fired are used correctly.",
      },
      {
        text: "The keeper described the otter's tracks in the silt as unmistakeable.",
        errors: [{ wrong: "unmistakeable", fix: "unmistakable", kind: 'wordchoice', note: "Unmistakable drops the e before able." }],
      },
      {
        text: "The report recommended a phased withdrawal of funding.",
        errors: [],
        cleanNote: "Clean copy: phased and withdrawal are correct as written.",
      },
      {
        text: "The society dated the roof by dendochronology of the tie beams.",
        errors: [{ wrong: "dendochronology", fix: "dendrochronology", kind: 'spelling', note: "Dendrochronology is the correct spelling for tree-ring dating." }],
      },
    ],
  },
  {
    num: 64,
    quizId: 'stet-9-18-26',
    live: '2026-09-18',
    dateLabel: 'September 18, 2026',
    sunday: false,
    items: [
      {
        text: "The archivist thanked they who had catalogued the plates.",
        errors: [{ wrong: "they", fix: "those", kind: 'grammar', note: "The object form is needed, so it reads thanked those who." }],
      },
      {
        text: "The chapel retains its original box pews.",
        errors: [],
        cleanNote: "Clean copy: box pews is the correct architectural term.",
      },
      {
        text: "The vicar said the parish had been served by the same family of clerks for four generations, a remarkable continuum.",
        errors: [{ wrong: "continuum", fix: "continuity", kind: 'wordchoice', note: "Continuity is unbroken succession; a continuum is a range." }],
      },
      {
        text: "The signal box was decommissioned last autumn.",
        errors: [],
        cleanNote: "Clean copy: decommissioned is exact and correctly spelled.",
      },
      {
        text: "The trust cleared the pond of blanket weed and restored the sluce.",
        errors: [{ wrong: "sluce", fix: "sluice", kind: 'spelling', note: "Sluice is the correct spelling for the water gate." }],
      },
    ],
  },
  {
    num: 65,
    quizId: 'stet-9-19-26',
    live: '2026-09-19',
    dateLabel: 'September 19, 2026',
    sunday: false,
    items: [
      {
        text: "The society honoured the man whom donated the collection.",
        errors: [{ wrong: "whom", fix: "who", kind: 'grammar', note: "Who is the subject of donated, so whom is wrong." }],
      },
      {
        text: "The society holds an annual lecture in the guildhall.",
        errors: [],
        cleanNote: "Clean copy: guildhall is the right word and correctly spelled.",
      },
      {
        text: "The archivist found a letter signed by the steward, dated Michelmas 1788.",
        errors: [{ wrong: "Michelmas", fix: "Michaelmas", kind: 'spelling', note: "Michaelmas is the correct spelling of the September feast." }],
      },
      {
        text: "The cellar was dry despite the high water table.",
        errors: [],
        cleanNote: "Clean copy: water table is the correct hydrological term.",
      },
      {
        text: "The trust rehung the gate on new pintels driven into the pier.",
        errors: [{ wrong: "pintels", fix: "pintles", kind: 'spelling', note: "A pintle is the pin a gate hangs on; pintels is a misspelling." }],
      },
    ],
  },
  {
    num: 66,
    quizId: 'stet-9-20-26',
    live: '2026-09-20',
    dateLabel: 'September 20, 2026',
    sunday: true,
    items: [
      {
        text: "The trustees argued about who to appoint as chair.",
        errors: [{ wrong: "who", fix: "whom", kind: 'grammar', note: "Who is the object of appoint here, so it takes whom." }],
      },
      {
        text: "The society recorded a fine hammerbeem roof over the nave.",
        errors: [{ wrong: "hammerbeem", fix: "hammerbeam", kind: 'wordchoice', note: "Hammerbeam is the correct name for the roof truss." }],
      },
      {
        text: "The weir was rebuilt to allow salmon to pass.",
        errors: [],
        cleanNote: "Clean copy: weir is spelled correctly and used properly.",
      },
      {
        text: "The keeper reported a raft of eider off the point, feeding over the muscle beds at slack water.",
        errors: [{ wrong: "muscle", fix: "mussel", kind: 'wordchoice', note: "A mussel is the shellfish eider feed on; a muscle moves the body." }],
      },
      {
        text: "The farmer said the ewes were due to lamb within the fortnite.",
        errors: [{ wrong: "fortnite", fix: "fortnight", kind: 'wordchoice', note: "A fortnight is two weeks; Fortnite is a video game." }],
      },
      {
        text: "The parish council agreed to fund the repair.",
        errors: [],
        cleanNote: "Clean copy: parish council and repair are correct.",
      },
      {
        text: "The mason repaired the parapit above the porch.",
        errors: [{ wrong: "parapit", fix: "parapet", kind: 'spelling', note: "Parapet is the correct spelling for a low wall." }],
      },
    ],
  },
  {
    num: 67,
    quizId: 'stet-9-21-26',
    live: '2026-09-21',
    dateLabel: 'September 21, 2026',
    sunday: false,
    items: [
      {
        text: "The dome was turned by hand, which cut the effort considerable.",
        errors: [{ wrong: "considerable", fix: "considerably", kind: 'grammar', note: "An adverb is needed to modify cut, so considerably." }],
      },
      {
        text: "The bridge carries a single track over the gorge.",
        errors: [],
        cleanNote: "Clean copy: carries and gorge are used correctly.",
      },
      {
        text: "The archivist described the binding as limp velum over boards.",
        errors: [{ wrong: "velum", fix: "vellum", kind: 'wordchoice', note: "Vellum is fine calfskin; velum is an anatomical membrane." }],
      },
      {
        text: "The observatory recorded the transit in fine weather.",
        errors: [],
        cleanNote: "Clean copy: transit is the right astronomical term.",
      },
      {
        text: "The engineer found the retaining wall was bulging and would need buttrressing.",
        errors: [{ wrong: "buttrressing", fix: "buttressing", kind: 'wordchoice', note: "Buttressing has a single r after the double t." }],
      },
    ],
  },
  {
    num: 68,
    quizId: 'stet-9-22-26',
    live: '2026-09-22',
    dateLabel: 'September 22, 2026',
    sunday: false,
    items: [
      {
        text: "The lifeboat answered the call remarkable quickly that night.",
        errors: [{ wrong: "remarkable", fix: "remarkably", kind: 'grammar', note: "An adverb modifies quickly, so it reads remarkably quickly." }],
      },
      {
        text: "The trust replanted the avenue with limes.",
        errors: [],
        cleanNote: "Clean copy: limes is correct here, meaning lime trees.",
      },
      {
        text: "The gardener pruned the wistaria back to two buds after flowering.",
        errors: [{ wrong: "wistaria", fix: "wisteria", kind: 'spelling', note: "Wisteria is the standard modern spelling." }],
      },
      {
        text: "The scheme drew objections from three parishes.",
        errors: [],
        cleanNote: "Clean copy: objections and parishes are used correctly.",
      },
      {
        text: "The vicar said the organ needed a new tremulent stop.",
        errors: [{ wrong: "tremulent", fix: "tremulant", kind: 'wordchoice', note: "A tremulant is the organ stop that wavers the tone." }],
      },
    ],
  },
  {
    num: 69,
    quizId: 'stet-9-23-26',
    live: '2026-09-23',
    dateLabel: 'September 23, 2026',
    sunday: false,
    items: [
      {
        text: "The mason worked slow and steady through the frost.",
        errors: [{ wrong: "slow", fix: "slowly", kind: 'grammar', note: "The verb needs an adverb, so it reads worked slowly." }],
      },
      {
        text: "The mill race still runs beneath the old floor.",
        errors: [],
        cleanNote: "Clean copy: mill race is the correct term for the channel.",
      },
      {
        text: "The keeper found the barn owl roosting on a purloin above the byre.",
        errors: [{ wrong: "purloin", fix: "purlin", kind: 'wordchoice', note: "A purlin is a roof timber; to purloin is to steal." }],
      },
      {
        text: "The board deferred the decision until October.",
        errors: [],
        cleanNote: "Clean copy: deferred is exact and correctly spelled.",
      },
      {
        text: "The engineer said the beam would need to be jacked and the padstone renewed before the wall began to sheer.",
        errors: [{ wrong: "sheer", fix: "shear", kind: 'wordchoice', note: "Shear is the engineering term for a sliding failure; sheer means utter or steep." }],
      },
    ],
  },
  {
    num: 70,
    quizId: 'stet-9-24-26',
    live: '2026-09-24',
    dateLabel: 'September 24, 2026',
    sunday: false,
    items: [
      {
        text: "The choir sang particular well at the Christmas service.",
        errors: [{ wrong: "particular", fix: "particularly", kind: 'grammar', note: "An adverb is needed before well, so particularly." }],
      },
      {
        text: "The path is impassable after heavy rain.",
        errors: [],
        cleanNote: "Clean copy: impassable is the right adjective, correctly spelled.",
      },
      {
        text: "The trust rebuilt the dry stone wall using the original throughstones, a job that took to men a fortnight.",
        errors: [{ wrong: "to", fix: "two", kind: 'wordchoice', note: "Two is the number; to is the preposition." }],
      },
      {
        text: "The dairy bottles its milk on the farm.",
        errors: [],
        cleanNote: "Clean copy: dairy and bottles are used correctly.",
      },
      {
        text: "The society noted the font cover was suspended from a counterweight and raised by a single chord.",
        errors: [{ wrong: "chord", fix: "cord", kind: 'wordchoice', note: "A cord is a length of rope; a chord is a group of musical notes." }],
      },
    ],
  },
  {
    num: 71,
    quizId: 'stet-9-25-26',
    live: '2026-09-25',
    dateLabel: 'September 25, 2026',
    sunday: false,
    items: [
      {
        text: "The scheme was received bad by the parish meeting.",
        errors: [{ wrong: "bad", fix: "badly", kind: 'grammar', note: "The verb needs an adverb, so it reads received badly." }],
      },
      {
        text: "The cottage is thatched in Norfolk reed.",
        errors: [],
        cleanNote: "Clean copy: thatched and reed are correct as written.",
      },
      {
        text: "The vicar thanked the flower guild for the harvest displays around the chancel arch and the pulput.",
        errors: [{ wrong: "pulput", fix: "pulpit", kind: 'spelling', note: "Pulpit is the correct spelling for the preacher's stand." }],
      },
      {
        text: "The council refused to comment on the settlement.",
        errors: [],
        cleanNote: "Clean copy: settlement is the right word in this legal sense.",
      },
      {
        text: "The mason set the sill on a bed of mortar and checked it with a spirit levl.",
        errors: [{ wrong: "levl", fix: "level", kind: 'spelling', note: "Level is the correct spelling of the tool." }],
      },
    ],
  },
  {
    num: 72,
    quizId: 'stet-9-26-26',
    live: '2026-09-26',
    dateLabel: 'September 26, 2026',
    sunday: false,
    items: [
      {
        text: "The engine ran different after the rebuild.",
        errors: [{ wrong: "different", fix: "differently", kind: 'grammar', note: "The verb needs an adverb, so it reads ran differently." }],
      },
      {
        text: "The forge bell still hangs above the door.",
        errors: [],
        cleanNote: "Clean copy: forge and hangs are used correctly here.",
      },
      {
        text: "The farmer said the crop had been flattened by a summer squal.",
        errors: [{ wrong: "squal", fix: "squall", kind: 'spelling', note: "A squall is a sudden storm; squal is a misspelling." }],
      },
      {
        text: "The riverbank was reinforced with willow spiling.",
        errors: [],
        cleanNote: "Clean copy: spiling is the correct riverbank engineering term.",
      },
      {
        text: "The trust surveyed the leadwork and found the bay was badly corrogated.",
        errors: [{ wrong: "corrogated", fix: "corrugated", kind: 'spelling', note: "Corrugated is the correct spelling." }],
      },
    ],
  },
  {
    num: 73,
    quizId: 'stet-9-27-26',
    live: '2026-09-27',
    dateLabel: 'September 27, 2026',
    sunday: true,
    items: [
      {
        text: "The tide came in sudden and cut off the causeway.",
        errors: [{ wrong: "sudden", fix: "suddenly", kind: 'grammar', note: "The verb needs an adverb, so it reads came in suddenly." }],
      },
      {
        text: "The keeper counted nine curlew probing the tideline at first light, a site he never tired of.",
        errors: [{ wrong: "site", fix: "sight", kind: 'wordchoice', note: "A sight is something seen; a site is a place or location." }],
      },
      {
        text: "The lease runs for a further eleven years.",
        errors: [],
        cleanNote: "Clean copy: lease and further are used correctly.",
      },
      {
        text: "The archivist noted the seal matrix was chipped but the legand was legible.",
        errors: [{ wrong: "legand", fix: "legend", kind: 'wordchoice', note: "The legend is the inscription round a seal." }],
      },
      {
        text: "The society published a transcript of the court rolls, with a glossery of the Latin terms.",
        errors: [{ wrong: "glossery", fix: "glossary", kind: 'spelling', note: "Glossary is the correct spelling for a word list." }],
      },
      {
        text: "The colliery band still rehearses on Thursdays.",
        errors: [],
        cleanNote: "Clean copy: colliery and rehearses are correct as written.",
      },
      {
        text: "The gardener said the box hedge was suffering from blite and would be replaced with yew.",
        errors: [{ wrong: "blite", fix: "blight", kind: 'wordchoice', note: "Blight is the plant disease; blite is an obscure plant name." }],
      },
    ],
  },
  {
    num: 74,
    quizId: 'stet-9-28-26',
    live: '2026-09-28',
    dateLabel: 'September 28, 2026',
    sunday: false,
    items: [
      {
        text: "The wall was pointed careful in lime mortar.",
        errors: [{ wrong: "careful", fix: "carefully", kind: 'grammar', note: "The verb needs an adverb, so it reads pointed carefully." }],
      },
      {
        text: "The chapel roof was releaded in the spring.",
        errors: [],
        cleanNote: "Clean copy: releaded is the correct term for renewing lead work.",
      },
      {
        text: "The keeper logged a school of porpoise working the tide race off the head.",
        errors: [{ wrong: "school", fix: "pod", kind: 'wordchoice', note: "A pod is the usual collective term for porpoises." }],
      },
      {
        text: "The tenant gave notice at the end of the quarter.",
        errors: [],
        cleanNote: "Clean copy: quarter is correct here, meaning a rent period.",
      },
      {
        text: "The mason described the arch as a segmentle rather than a true semicircle.",
        errors: [{ wrong: "segmentle", fix: "segmental", kind: 'wordchoice', note: "Segmental is the correct architectural term." }],
      },
    ],
  },
  {
    num: 75,
    quizId: 'stet-9-29-26',
    live: '2026-09-29',
    dateLabel: 'September 29, 2026',
    sunday: false,
    items: [
      {
        text: "The trust said the mill had lost it's cap in the storm.",
        errors: [{ wrong: "it's", fix: "its", kind: 'grammar', note: "Its is the possessive; it's is short for it is." }],
      },
      {
        text: "The harbour master logged every arrival by hand.",
        errors: [],
        cleanNote: "Clean copy: logged and arrival are used correctly.",
      },
      {
        text: "The engineer said the sluice paddle was seized and the gearing would need to be striped and greased.",
        errors: [{ wrong: "striped", fix: "stripped", kind: 'wordchoice', note: "Stripped means taken apart; striped means marked with lines." }],
      },
      {
        text: "The bakery still uses a peel to load the oven.",
        errors: [],
        cleanNote: "Clean copy: peel is the correct name for a baker's shovel.",
      },
      {
        text: "The society noted the pews were installed in 1843, a change the vicar recorded at grate length.",
        errors: [{ wrong: "grate", fix: "great", kind: 'wordchoice', note: "Great means large; a grate is a fireplace fitting." }],
      },
    ],
  },
];
