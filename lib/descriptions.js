// TEST BUILD ONLY: reduced.
const DESCRIPTIONS = {
 "most-weeks-billboard-hot-100": {
  "Lose Control (Teddy Swims; 112 weeks)": "Teddy Swims' breakout soul ballad spent a record 112 weeks on the Hot 100, the longest run in the chart's history. It topped the chart in 2024, more than a year after its release, and refused to leave.",
  "Heat Waves (Glass Animals; 91 weeks)": "The Oxford band's hazy synth-pop sleeper took a record 59 weeks just to reach No. 1, the slowest climb to the top the chart has ever seen. All told it logged 91 weeks, powered by TikTok and a viral second life.",
  "Blinding Lights (The Weeknd; 90 weeks)": "The Weeknd's neon synthwave smash was the first song to spend 90 weeks on the Hot 100 and was later crowned Billboard's greatest Hot 100 hit of all time. Its relentless retro pulse never seemed to fade from radio.",
  "Beautiful Things (Benson Boone; 89 weeks)": "Benson Boone's soaring, quiet-to-explosive ballad became 2024's defining breakout, climbing to No. 2 and lingering 89 weeks on the chart. A falsetto hook and a full-band drop made it inescapable.",
  "Radioactive (Imagine Dragons; 87 weeks)": "Imagine Dragons' stomping arena-rock anthem held the all-time longevity record at 87 weeks before the streaming era rewrote the books. Its grinding dubstep-rock drop turned a debut single into a cultural fixture.",
  "Sail (AWOLNATION; 79 weeks)": "Aaron Bruno's brooding electro-rock single was a true slow burn, peaking at just No. 17 yet hanging on for 79 weeks through licensing, remixes, and word of mouth. It became one of the longest-charting songs of its era.",
  "All I Want for Christmas Is You (Mariah Carey; 78 weeks)": "Mariah Carey's 1994 holiday standard finally hit No. 1 in 2019 and now re-enters the chart every December, stacking 78 weeks across seasonal runs. It is the rare evergreen that climbs anew each winter.",
  "Levitating (Dua Lipa; 77 weeks)": "Dua Lipa's disco-pop centerpiece from Future Nostalgia was Billboard's No. 1 song of 2021, riding a glittering groove to 77 weeks on the chart. It peaked at No. 2 and defined the pandemic-era dance-pop revival.",
  "I'm Yours (Jason Mraz; 76 weeks)": "Jason Mraz's sunny acoustic singalong set the longevity record of its day at 76 weeks, a benchmark that stood for years. Its laid-back ukulele-and-reggae lilt made it a wedding and coffee-shop staple.",
  "Snooze (SZA; 70 weeks)": "SZA's smoky R&B standout from SOS proved a long-tail hit, peaking at No. 2 and charting for 70 weeks on the strength of streaming and devoted fans. Its intimate, late-night feel kept it in heavy rotation."
 },
 "pizza-miami": {
  "Miami Slice (Wynwood)": "Wynwood's thin-crust slice shop took the No. 3 spot in the country on 50 Top Pizza's 2026 slice ranking and a 9.6 from The Infatuation. Crispy, foldable squares and rounds locals line up for, with a Coconut Grove location on the way.",
  "La Leggenda (Miami Beach)": "Giovanni Gagliardi's Española Way Neapolitan parlor is a fixture on 50 Top Pizza's world list, tying for No. 11 in the U.S. for 2026. Wood-fired, leopard-spotted pies on long-fermented dough.",
  "Eleventh Street Pizza (Downtown)": "Time Out's No. 1 pizza in Miami and a top-19 in the world, this downtown sourdough specialist slings NY-style slices and airy Sicilian squares. The hot honey Sicilian with cupped pepperoni is the order.",
  "Marc's Artisanal Pizzeria (Miami Beach)": "The Infatuation's second-highest-scored pizza in Miami at 9.4, Marc Bonifacio's Normandy Isle parlor turns out blistered Neapolitan-leaning pies. Dave Portnoy clocked it at 8.2.",
  "Bar Bucce (Little River)": "An Italian market, wine bar and pizzeria in Little River that drew a 9.0 from The Infatuation and an 8.1 from Dave Portnoy. Naturally leavened pies and natural wine in a cult-favorite room.",
  "Lucali (Miami Beach)": "The Sunset Harbour outpost of Mark Iacono's Brooklyn icon. Thin, charred, hand-pulled pies made one at a time, an 8.7 from The Infatuation and a Time Out top 10.",
  "'O Munaciello (MiMo)": "Carmine Candito's MiMo Neapolitan institution tied for No. 11 in the U.S. on 50 Top Pizza 2026. Wood-fired Naples-style pies with a 4.7 Google average across thousands of reviews.",
  "Baker & Barista (Downtown)": "A downtown bakery-pizzeria that quietly became one of the city's highest-rated, with a 9.1 from The Infatuation and a 4.7 on Google. Sourdough crusts and pastry-shop precision.",
  "Vice City Pizza (Kendall)": "A homegrown Kendall favorite for New York-style pies and slices, carrying a 4.6 on both Yelp and Google. A Time Out and Infatuation pick that punches above its strip-mall setting.",
  "ViceVersa (Downtown)": "A downtown Neapolitan spot ranked No. 3 by Time Out and scored 8.6 by The Infatuation, with a 4.6 Google average. Wood-fired pies in the heart of the city."
 },
 "green-chile-cheeseburgers-new-mexico": {
  "Sparky's (Hatch)": "In the chile capital of the world, Sparky's won the 2022 New Mexico State Fair Green Chile Cheeseburger Challenge and carries a 4.6 Google average across 4,600-plus reviews. A kooky-Americana roadside stop where the chile grows within miles.",
  "Buckhorn Tavern (San Antonio)": "The historic San Antonio tavern that beat Bobby Flay in a green chile cheeseburger throwdown and made GQ's burgers-to-eat-before-you-die list. A juicy patty under fiery Hatch chile, 4.6 on Google.",
  "Tumbleweeds Diner (Magdalena)": "A Highway 60 newcomer in tiny Magdalena that became a destination fast, with a 4.8 Google average. House-ground brisket smashed thin, American cheese and Young Guns Hatch chile on a buttered potato bun.",
  "Chili Line Depot (Tres Piedras)": "A farm-to-table inn and restaurant near Carson National Forest serving a chile-drenched burger built on beef, pork and eggs from the owners' own ranch. A 4.6 on Yelp.",
  "Realburger (Santa Fe)": "A Cerrillos Road counter that set the Santa Fe standard, praised for its green-chile-to-beef ratio and ribbon fries. A 4.6 Google average.",
  "The Owl Bar & Café (San Antonio)": "A nearly century-old San Antonio landmark whose Owl Burger was born when Manhattan Project scientists asked for a grill. Beef ground on-site, smashed thin, under a secret green chile sauce.",
  "Bang Bite (Santa Fe)": "A Santa Fe food truck parked at Santa Fe Brewing, cooking every green chile burger to order with add-ons from blue cheese to maple-bacon jam. A 4.6 on Google and 4.5 on Yelp.",
  "Laguna Burger (Albuquerque)": "Born in a Laguna Pueblo gas station and a 2016 State Fair winner, Laguna Burger stacks a half-pound of seasoned Angus and chopped Hatch chile on a local bun. A New Mexico rite of passage.",
  "Grassburger (Albuquerque)": "A regenerative-ranching spot serving 100% grass-fed beef, with its Green Chile Jack Burger driving a devoted following and a 4.5 Google average across 1,700-plus reviews.",
  "Horseman's Haven Café (Santa Fe)": "A humble Cerrillos Road café famous for some of the state's spiciest green chile, dialed across five heat levels. Anthony Bourdain stopped in; the burger hides under a pile of sauce."
 },
 "crab-cakes-maryland": {
  "Koco's Pub (Baltimore)": "The Lauraville pub whose 11-ounce, no-filler crab cake became a national mail-order legend. Almost all jumbo lump, barely bound, with Old Bay calibrated to let the sweet crab shine. A 4.7 on Google.",
  "G&M Restaurant (Linthicum Heights)": "A former pizza joint near BWI that became a statewide standard-bearer, with 14,000-plus Google reviews. The 8-ounce cake is a master class in Maryland style: jumbo lump, white bread, just enough binder.",
  "Faidley's (Baltimore)": "A pilgrimage-worthy Lexington Market institution since 1886 that helped define the archetypal Baltimore crab cake. Softball-sized, jumbo lump-forward, no egg, bound with saltines and eaten standing at the high-tops.",
  "Thames Street Oyster House (Baltimore)": "A Fells Point waterfront favorite where the crab cake is seared in a cast-iron skillet, simple and bursting with crab. A 4.7 on both Google and Yelp.",
  "Boatyard Bar & Grill (Annapolis)": "Annapolis voters have crowned Boatyard's 'all killer, no filler' crab cakes the area's best for two decades running. Hand-picked jumbo lump broiled to a golden finish, 4.6 on Google.",
  "Box Hill (Abingdon)": "An Abingdon pizzeria-and-crab-cake spot that makes a bold claim, 100% Maryland blue crab, and has won Harford County's crab cake category every year since 2015. A 4.6 Google average.",
  "Jerry's Seafood (Bowie)": "Home of the famous Crab Bomb, Jerry's serves a hand-picked, filler-free cake with no cartilage in sight. A Barstool top pick and a 4.5 on Google.",
  "Pappas (Parkville)": "Oprah's go-to and the top finisher in the Baltimore Sun's 2025 reader poll, with more than 47,000 votes cast. Fresh, never-frozen jumbo lump and a light binder, in sizes up to 10 ounces.",
  "Jimmy's Famous Seafood (Baltimore)": "The TV-famous Holabird Avenue institution often ranked the country's best and named No. 1 by Food & Wine. A softball-sized cake held together with just a whisper of filling over lump crab, baked and browned.",
  "L.P. Steamers (Baltimore)": "A Locust Point rowhouse classic better known for steamed crabs, where the crab cake is a sleeper hit: minimal binder and the correct amount of Old Bay. A 4.5 on Google."
 },
 "meat-thermometers": {
  "Thermapen ONE": "The category benchmark, with a one-second read and accuracy within a few tenths of a degree on an auto-rotating backlit display, named number one by America's Test Kitchen, Food Network, and The Kitchn. Buyers call it accurate and reliable with one-to-two-second reads, praising the auto on/off, clear display, and versatility, a must-have for home cooks.",
  "Classic Thermapen": "The previous flagship, still sold and still excellent, with two-to-three second reads and the same handmade build as the ONE minus the auto-rotating backlight. Buyers call it highly accurate and about three times faster than other thermometers, praising its professional-grade performance and easy reading, even in low light and for baking.",
  "Lavatools Javelin PRO Duo": "The strongest non-ThermoWorks instant-read, fast and accurate with a motion-sensing backlight and magnetic back. Buyers call it accurate, quick, and easier to use than traditional models, liking the fridge-magnet back and rating it well worth the price, though a few report durability issues after a year.",
  "Typhur InstaProbe": "A premium instant-read built on sub-one-second reads and a crisp OLED display, a credible challenger to the Thermapen. Buyers call it the best on the market, praising the roughly one-second readings, accuracy, and bright OLED display, though some find it overpriced.",
  "MEATER Pro": "A fully wireless leave-in probe that tracks internal and ambient temperature by app, the pick for long grilling and smoking sessions. Buyers call it excellent quality and easy to use, with accuracy that matches their other tools and perfect steaks and roasts, though connectivity dropouts during cooks are a recurring complaint.",
  "OXO Good Grips Thermocouple Thermometer": "Fast and accurate with a 225-degree rotating probe and illuminated digits readable at any angle in either hand. Buyers say it works equally well left- or right-handed and praise its near-instant, within-a-degree accuracy and readable display, calling it a must-have for grilling.",
  "ThermoPop 2": "A pen-style instant-read with a big auto-rotating screen and improved waterproofing, hitting near-Thermapen accuracy for less. Buyers call it reliable and accurate with quick any-angle reads and a probe that clicks securely into place, rating it excellent value, though durability draws a few complaints.",
  "Combustion Predictive Thermometer": "A wireless leave-in probe with eight internal sensors that predicts when food will hit its target, designed by a former ThermoWorks engineer. Owners and reviewers praise the eight-sensor prediction as genuinely useful for timing dinner, calling it the most innovative probe in the category.",
  "ThermoWorks Signals": "A four-channel WiFi and Bluetooth leave-in system for multi-piece barbecue, the step up from single-probe alarms for monitoring meat and pit at once. Pitmasters praise its rock-solid four-channel monitoring and ThermoWorks accuracy, the trusted choice for long competition-style cooks.",
  "ThermoWorks Smoke X": "A long-range RF leave-in alarm thermometer for low-and-slow cooking, with dual channels to watch the meat and the smoker together from across the yard. Pitmasters praise its exceptional RF range and reliability, calling it the set-and-forget standard for overnight smokes."
 }
};
export { DESCRIPTIONS };
