// Puzzle data for Stet, the daily copy-desk game. Imported ONLY by the server
// page (app/stet/page.js), which filters live<=today before passing puzzles to
// the client — so future briefs, and their answers, never ship to the browser.
//
// One news brief per day: five sentences (seven on Sundays). Each sentence
// carries an `errors` array with 0, 1, or (Sundays only) 2 errors — always a
// real word, so a spellchecker sails past it: eggcorns, swapped homophones,
// malaprops, AND grammar slips (should of, had ran, higher then). A sentence
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
        text: "The intern spent a whole summer at the director's beckon call.",
        errors: [{ wrong: 'beckon', fix: 'beck', note: '"Beck and call" — a beck is an old word for a summoning nod.' }],
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
        errors: [{ wrong: 'ran', fix: 'run', note: 'Had run — "ran" never follows "had."' }],
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
        errors: [{ wrong: 'went', fix: 'gone', note: 'Had gone: the participle after had is gone, never went.' }],
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
];
