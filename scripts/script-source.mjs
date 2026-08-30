// Authored source for Script, the daily film and television gauntlet.
// Built into app/script/{questions,puzzles}.js by scripts/gen-mcq.mjs.
//
//   c  lane, cycling in LANES order across every block of five
//   t  tier, 1 (gimme) to 5 (expert), five questions per tier per day
//   q  the question
//   a  the TRUE answer, always authored here in first position
//   d  three distractors
//
// The correct answer's POSITION is never authored. The generator lays each day
// out on a balanced no-3-run column plan derived from the day number, so the
// bank cannot drift into a column bias. Never move an answer into `d` or a
// distractor into `a` to "fix" a pattern.
//
// EVERY FACT IS FROZEN. Film and television rot in a specific way: a cast
// changes, a series is renewed or cancelled, a gross is overtaken, a record
// falls. So nothing here asks who currently plays anything, what is currently
// the highest grossing or longest running, or how any unfinished thing ends. A
// superlative worth asking is pinned in the stem ("the highest grossing film of
// the 1990s", "for years the most watched"), and casting questions are asked
// about performances already given.
export const LANES = ['Movies', 'Television', 'Actors & Directors', 'Awards & Box Office', 'Behind the Scenes'];

export const DAYS = [

// ── Day 1 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'Which 1997 film ends with a passenger liner sinking after striking an iceberg?', a: 'Titanic', d: ['The Poseidon Adventure', 'Life of Pi', 'Master and Commander'] },
{ c: 'Television', t: 1, q: 'Which sitcom was set in a Boston bar where everybody knows your name?', a: 'Cheers', d: ['Frasier', 'Taxi', 'Night Court'] },
{ c: 'Actors & Directors', t: 1, q: 'Which director made Jaws, E.T. and Jurassic Park?', a: 'Steven Spielberg', d: ['George Lucas', 'James Cameron', 'Ridley Scott'] },
{ c: 'Awards & Box Office', t: 1, q: 'What is the statuette handed out at the Academy Awards commonly called?', a: 'The Oscar', d: ['The Emmy', 'The Tony', 'The Palme'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which Mario Puzo novel did Francis Ford Coppola adapt into a 1972 film?', a: 'The Godfather', d: ['Goodfellas', 'Scarface', 'The Untouchables'] },

{ c: 'Movies', t: 2, q: 'In The Matrix, which color of pill does Neo swallow?', a: 'Red', d: ['Blue', 'Green', 'White'] },
{ c: 'Television', t: 2, q: 'Which HBO drama follows a New Jersey mob boss who starts seeing a psychiatrist?', a: 'The Sopranos', d: ['The Wire', 'Boardwalk Empire', 'Oz'] },
{ c: 'Actors & Directors', t: 2, q: 'Which actor played the title role in Forrest Gump?', a: 'Tom Hanks', d: ['Kevin Costner', 'Bill Paxton', 'Gary Sinise'] },
{ c: 'Awards & Box Office', t: 2, q: "Which 1994 film took the Palme d'Or at Cannes?", a: 'Pulp Fiction', d: ['Forrest Gump', 'The Shawshank Redemption', 'Four Weddings and a Funeral'] },
{ c: 'Behind the Scenes', t: 2, q: 'What nickname did the crew of Jaws give the malfunctioning mechanical shark?', a: 'Bruce', d: ['Clyde', 'Sheila', 'Monty'] },

{ c: 'Movies', t: 3, q: 'In Citizen Kane, what does Rosebud turn out to be?', a: 'A sled', d: ['A racehorse', 'A yacht', 'A nightclub'] },
{ c: 'Television', t: 3, q: 'Which 1983 series finale was for years the most watched scripted episode in American television history?', a: 'M*A*S*H', d: ['Cheers', 'Seinfeld', 'Friends'] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made Vertigo, Rear Window and The Birds?', a: 'Alfred Hitchcock', d: ['Billy Wilder', 'Otto Preminger', 'Fritz Lang'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film won Outstanding Picture at the very first Academy Awards?', a: 'Wings', d: ['The Crowd', 'The Jazz Singer', 'The Last Command'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which film used chocolate syrup for blood in a shower scene that took a week to shoot?', a: 'Psycho', d: ['Carrie', 'The Shining', 'Frenzy'] },

{ c: 'Movies', t: 4, q: 'In Blade Runner, what is the test used to identify replicants called?', a: 'Voight-Kampff', d: ['Turing-Rosen', 'Kessler-Baty', 'Tyrell-Sebastian'] },
{ c: 'Television', t: 4, q: 'Which anthology series opened with narration about a dimension beyond that which is known to man?', a: 'The Twilight Zone', d: ['The Outer Limits', 'Tales from the Crypt', 'Night Gallery'] },
{ c: 'Actors & Directors', t: 4, q: 'Which performer won four Academy Awards for Best Actress, more than anyone else?', a: 'Katharine Hepburn', d: ['Meryl Streep', 'Bette Davis', 'Ingrid Bergman'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film swept picture, director, actor, actress and screenplay at the 1992 ceremony?', a: 'The Silence of the Lambs', d: ['Unforgiven', "Schindler's List", 'Rain Man'] },
{ c: 'Behind the Scenes', t: 4, q: "Which film shot under the fake working title 'Blue Harvest' to keep fans away from the set?", a: 'Return of the Jedi', d: ['The Empire Strikes Back', 'Raiders of the Lost Ark', 'E.T. the Extra-Terrestrial'] },

{ c: 'Movies', t: 5, q: 'Which instrument plays the famous theme of The Third Man?', a: 'The zither', d: ['The harpsichord', 'The mandolin', 'The accordion'] },
{ c: 'Television', t: 5, q: 'What was the advertising agency at the center of the first season of Mad Men called?', a: 'Sterling Cooper', d: ['Cooper Draper', 'Pryce Holloway', 'Hobart and Olson'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actor directed The Night of the Hunter and never directed another film?', a: 'Charles Laughton', d: ['Herk Harvey', 'Leonard Kastle', 'James William Guercio'] },
{ c: 'Awards & Box Office', t: 5, q: 'Who was the first person to refuse an Academy Award, turning down a screenplay prize in 1936?', a: 'Dudley Nichols', d: ['George C. Scott', 'Marlon Brando', 'Katharine Hepburn'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which film shot its crop duster sequence in California farmland standing in for rural Indiana?', a: 'North by Northwest', d: ['The Birds', 'Badlands', 'Days of Heaven'] },
],

// ── Day 2 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'In which film series does a boy learn he is a wizard and enroll at Hogwarts?', a: 'Harry Potter', d: ['The Chronicles of Narnia', 'Percy Jackson', 'His Dark Materials'] },
{ c: 'Television', t: 1, q: 'Which animated family lives in Springfield with a father named Homer?', a: 'The Simpsons', d: ['Family Guy', 'King of the Hill', "Bob's Burgers"] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor introduced Iron Man to the Marvel Cinematic Universe in 2008?', a: 'Robert Downey Jr.', d: ['Chris Evans', 'Mark Ruffalo', 'Jeremy Renner'] },
{ c: 'Awards & Box Office', t: 1, q: 'The Emmy Awards honor achievement in which medium?', a: 'Television', d: ['Film', 'Theater', 'Radio'] },
{ c: 'Behind the Scenes', t: 1, q: "Which 1994 Disney animated feature has long been described as drawing on Shakespeare's Hamlet?", a: 'The Lion King', d: ['Aladdin', 'Pocahontas', 'Mulan'] },

{ c: 'Movies', t: 2, q: 'In Back to the Future, which car is converted into a time machine?', a: 'A DeLorean', d: ['A Ford Mustang', 'A Pontiac Firebird', 'A Chevrolet Camaro'] },
{ c: 'Television', t: 2, q: 'In Breaking Bad, which subject does Walter White teach before he turns to crime?', a: 'Chemistry', d: ['Physics', 'Biology', 'Mathematics'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Reservoir Dogs, Kill Bill and Inglourious Basterds?', a: 'Quentin Tarantino', d: ['Robert Rodriguez', 'Guy Ritchie', 'David Fincher'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film became the first in a language other than English to win Best Picture?', a: 'Parasite', d: ['Roma', 'Amour', 'Crouching Tiger, Hidden Dragon'] },
{ c: 'Behind the Scenes', t: 2, q: "Which film's star improvised the line 'Here's Johnny!', borrowing a talk show introduction?", a: 'The Shining', d: ['Misery', 'The Exorcist', 'Cape Fear'] },

{ c: 'Movies', t: 3, q: 'Apocalypse Now is loosely based on which Joseph Conrad novella?', a: 'Heart of Darkness', d: ['Lord Jim', 'Nostromo', 'The Secret Agent'] },
{ c: 'Television', t: 3, q: 'Which Baltimore institution is the focus of the fourth season of The Wire?', a: 'The public schools', d: ['The docks', 'City Hall', 'The newspaper'] },
{ c: 'Actors & Directors', t: 3, q: 'Which Swedish director made The Seventh Seal and Wild Strawberries?', a: 'Ingmar Bergman', d: ['Lasse Hallstrom', 'Bo Widerberg', 'Victor Sjostrom'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which actor won Best Actor at consecutive ceremonies in 1938 and 1939?', a: 'Spencer Tracy', d: ['Clark Gable', 'James Cagney', 'Gary Cooper'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which 1995 release was the first feature made entirely with computer animation?', a: 'Toy Story', d: ['Tron', "A Bug's Life", 'Antz'] },

{ c: 'Movies', t: 4, q: "In 2001: A Space Odyssey, what is the ship's computer called?", a: 'HAL 9000', d: ['MU-TH-UR', 'Proteus IV', 'Colossus'] },
{ c: 'Television', t: 4, q: 'Which 1967 British series stranded a resigned agent in a place known only as the Village?', a: 'The Prisoner', d: ['Danger Man', 'The Avengers', 'Callan'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actress played the young runaway Iris in Taxi Driver?', a: 'Jodie Foster', d: ['Sissy Spacek', 'Brooke Shields', "Tatum O'Neal"] },
{ c: 'Awards & Box Office', t: 4, q: 'Which 1977 film took eleven Academy Award nominations and won none, a futility record it shares with The Color Purple?', a: 'The Turning Point', d: ['Julia', 'The Goodbye Girl', 'Star Wars'] },
{ c: 'Behind the Scenes', t: 4, q: "What did the crew of The Godfather use for the severed horse's head?", a: 'A real head from a dog food plant', d: ['A latex cast', 'A taxidermy mount', 'A carved wooden prop'] },

{ c: 'Movies', t: 5, q: 'In Casablanca, what are the papers everyone is chasing called?', a: 'Letters of transit', d: ['Exit visas', 'Travel warrants', 'Safe conducts'] },
{ c: 'Television', t: 5, q: 'What is the hotel in Twin Peaks called?', a: 'The Great Northern', d: ['The Silver Mustang', 'The Blue Pine', 'The Fat Trout'] },
{ c: 'Actors & Directors', t: 5, q: 'Which pseudonym did the Directors Guild of America assign, from 1969 until 2000, to films whose directors disowned them?', a: 'Alan Smithee', d: ['Thomas Lee', 'Harry Kirkpatrick', 'George Spelvin'] },
{ c: 'Awards & Box Office', t: 5, q: 'Who has won more competitive Academy Awards than any other individual, with twenty-two?', a: 'Walt Disney', d: ['John Williams', 'Alfred Newman', 'Cedric Gibbons'] },
{ c: 'Behind the Scenes', t: 5, q: "Which 1980 film's cost overruns are credited with helping end United Artists as an independent studio?", a: "Heaven's Gate", d: ['Raise the Titanic', 'Popeye', 'Inchon'] },
],

// ── Day 3 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'In the original Star Wars trilogy, who turns out to be the father of Luke Skywalker?', a: 'Darth Vader', d: ['Obi-Wan Kenobi', 'Emperor Palpatine', 'Han Solo'] },
{ c: 'Television', t: 1, q: 'Which sitcom followed six twenty-somethings in New York, several of them sharing an apartment with a purple door?', a: 'Friends', d: ['Seinfeld', 'How I Met Your Mother', 'Will & Grace'] },
{ c: 'Actors & Directors', t: 1, q: "Which actor delivers the line 'I'll be back' in The Terminator?", a: 'Arnold Schwarzenegger', d: ['Sylvester Stallone', 'Bruce Willis', 'Jean-Claude Van Damme'] },
{ c: 'Awards & Box Office', t: 1, q: 'Winning an Oscar, an Emmy, a Grammy and a Tony is known by which acronym?', a: 'EGOT', d: ['GOAT', 'TEGO', 'EGGT'] },
{ c: 'Behind the Scenes', t: 1, q: "Which 1993 film's dinosaurs mixed full-size animatronics with then-new computer animation?", a: 'Jurassic Park', d: ['The Lost World', 'Dragonheart', 'Godzilla'] },

{ c: 'Movies', t: 2, q: 'In The Silence of the Lambs, what was Hannibal Lecter before his imprisonment?', a: 'A psychiatrist', d: ['A surgeon', 'A pathologist', 'A chef'] },
{ c: 'Television', t: 2, q: 'Which sitcom was set at Dunder Mifflin, a paper company in Scranton?', a: 'The Office', d: ['Parks and Recreation', '30 Rock', 'Better Off Ted'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Do the Right Thing and Malcolm X?', a: 'Spike Lee', d: ['John Singleton', 'Ava DuVernay', 'F. Gary Gray'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which 2003 film won all eleven Academy Awards for which it was nominated?', a: 'The Lord of the Rings: The Return of the King', d: ['Master and Commander', 'Mystic River', 'Cold Mountain'] },
{ c: 'Behind the Scenes', t: 2, q: 'The Wilhelm scream is what kind of recurring film element?', a: 'A stock sound effect', d: ['A lens flare technique', 'A camera move', 'A lighting setup'] },

{ c: 'Movies', t: 3, q: 'Which film is told largely in reverse order, following a man who cannot form new memories?', a: 'Memento', d: ['Irreversible', 'Following', 'Primer'] },
{ c: 'Television', t: 3, q: 'Which late night sketch show has broadcast from Studio 8H at Rockefeller Center since 1975?', a: 'Saturday Night Live', d: ['SCTV', 'In Living Color', 'MADtv'] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made Rashomon, Seven Samurai and Ran?', a: 'Akira Kurosawa', d: ['Yasujiro Ozu', 'Kenji Mizoguchi', 'Masaki Kobayashi'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which Academy Award category was handed out for the first time in 2002, with Shrek the winner?', a: 'Best Animated Feature', d: ['Best Visual Effects', 'Best Sound Editing', 'Best Casting'] },
{ c: 'Behind the Scenes', t: 3, q: "Which film's 'bullet time' effect used a ring of still cameras firing in sequence?", a: 'The Matrix', d: ['Blade', 'Equilibrium', 'Wanted'] },

{ c: 'Movies', t: 4, q: 'How many of the samurai are still alive at the end of Seven Samurai?', a: 'Three', d: ['Two', 'Four', 'Five'] },
{ c: 'Television', t: 4, q: 'Which American sitcom ended with its four main characters behind bars?', a: 'Seinfeld', d: ['Cheers', 'Frasier', 'Newhart'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor wore the Darth Vader suit on set in the original trilogy while somebody else supplied the voice?', a: 'David Prowse', d: ['Bob Anderson', 'Sebastian Shaw', 'Peter Mayhew'] },
{ c: 'Awards & Box Office', t: 4, q: 'Who was the first woman to win the Academy Award for Best Director?', a: 'Kathryn Bigelow', d: ['Sofia Coppola', 'Jane Campion', 'Lina Wertmuller'] },
{ c: 'Behind the Scenes', t: 4, q: 'The opening crawl of the 1977 Star Wars was shot how?', a: 'A camera moving over artwork on the floor', d: ['Hand-drawn cel animation', 'An early computer render', 'Rear projection onto a screen'] },

{ c: 'Movies', t: 5, q: 'In The Big Lebowski, what does the Dude spend the film trying to have replaced?', a: 'His rug', d: ['His car', 'His bowling ball', 'His bathrobe'] },
{ c: 'Television', t: 5, q: 'Which sitcom drew a bigger American audience for a January 1953 episode than the presidential inauguration the next day?', a: 'I Love Lucy', d: ['The Honeymooners', 'Your Show of Shows', 'The Jack Benny Program'] },
{ c: 'Actors & Directors', t: 5, q: 'Which cinematographer shot Citizen Kane?', a: 'Gregg Toland', d: ['James Wong Howe', 'Karl Struss', 'Leon Shamroy'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which film was the first sequel to win Best Picture?', a: 'The Godfather Part II', d: ['The Return of the King', 'Aliens', 'Rocky II'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which studio was founded by Charlie Chaplin, Mary Pickford, Douglas Fairbanks and D. W. Griffith?', a: 'United Artists', d: ['RKO', 'Columbia Pictures', 'Paramount Pictures'] },
],

// ── Day 4 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'Which film follows a boy who hides a stranded alien and helps him phone home?', a: 'E.T. the Extra-Terrestrial', d: ['Close Encounters of the Third Kind', 'Flight of the Navigator', 'Explorers'] },
{ c: 'Television', t: 1, q: 'Which series set noble houses fighting over the Iron Throne?', a: 'Game of Thrones', d: ['The Witcher', 'Vikings', 'Rome'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actress played Hermione Granger across the Harry Potter films?', a: 'Emma Watson', d: ['Emma Stone', 'Bonnie Wright', 'Evanna Lynch'] },
{ c: 'Awards & Box Office', t: 1, q: 'The Golden Globe Awards honor achievement in film and which other medium?', a: 'Television', d: ['Theater', 'Music', 'Radio'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which studio made Toy Story, the first fully computer-animated feature?', a: 'Pixar', d: ['DreamWorks Animation', 'Illumination', 'Industrial Light & Magic'] },

{ c: 'Movies', t: 2, q: 'In The Wizard of Oz, what does the Scarecrow ask the Wizard for?', a: 'A brain', d: ['A heart', 'Courage', 'A way home'] },
{ c: 'Television', t: 2, q: "In Star Trek, which planet is the home world of Spock's father?", a: 'Vulcan', d: ['Romulus', 'Andoria', 'Kronos'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Taxi Driver, Goodfellas and The Departed?', a: 'Martin Scorsese', d: ['Brian De Palma', 'Michael Mann', 'Sidney Lumet'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which Best Picture winner of the 2009 ceremony was set largely in Mumbai?', a: 'Slumdog Millionaire', d: ['The Reader', 'Frost/Nixon', 'Milk'] },
{ c: 'Behind the Scenes', t: 2, q: 'The 1927 release The Jazz Singer is remembered as a landmark for introducing what to features?', a: 'Synchronized spoken dialogue', d: ['Technicolor', 'Widescreen framing', 'Stereo sound'] },

{ c: 'Movies', t: 3, q: 'In Vertigo, what is the occupation of the man played by James Stewart?', a: 'A retired detective', d: ['A newspaper editor', 'A doctor', 'An architect'] },
{ c: 'Television', t: 3, q: 'Which 1990s series was set in the fictional California town of Sunnydale?', a: 'Buffy the Vampire Slayer', d: ['Angel', 'Charmed', 'Roswell'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor played both Michael Corleone and Tony Montana?', a: 'Al Pacino', d: ['Robert De Niro', 'Andy Garcia', 'Ray Liotta'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which actress won a supporting Oscar for a brief turn as Queen Elizabeth I in Shakespeare in Love?', a: 'Judi Dench', d: ['Brenda Blethyn', 'Kathy Bates', 'Lynn Redgrave'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which animated feature was the first ever nominated for Best Picture?', a: 'Beauty and the Beast', d: ['The Lion King', 'Snow White and the Seven Dwarfs', 'Up'] },

{ c: 'Movies', t: 4, q: 'What is the name of the commercial towing ship in Alien?', a: 'The Nostromo', d: ['The Sulaco', 'The Prometheus', 'The Covenant'] },
{ c: 'Television', t: 4, q: 'Which series ended with its lead sitting on a hillside as a soft drink commercial begins?', a: 'Mad Men', d: ['The Sopranos', 'Six Feet Under', 'Halt and Catch Fire'] },
{ c: 'Actors & Directors', t: 4, q: 'Which twenty-five year old directed and starred in Citizen Kane?', a: 'Orson Welles', d: ['John Huston', 'Elia Kazan', 'Nicholas Ray'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which actor won a posthumous Academy Award for The Dark Knight?', a: 'Heath Ledger', d: ['Peter Finch', 'Spencer Tracy', 'James Dean'] },
{ c: 'Behind the Scenes', t: 4, q: 'The Hays Code governed what in American filmmaking?', a: 'Content and morality standards', d: ['Union labor rules', 'Studio ownership limits', 'Ticket pricing'] },

{ c: 'Movies', t: 5, q: 'Which unusual equipment let Stanley Kubrick shoot candlelit interiors for Barry Lyndon?', a: 'Ultra-fast lenses developed for NASA', d: ['Infrared film stock', 'Fiber-optic reflectors', 'Anamorphic prisms'] },
{ c: 'Television', t: 5, q: 'What was the Cartwright family ranch in Bonanza called?', a: 'The Ponderosa', d: ['Southfork', 'The Barkley', 'The High Chaparral'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director was nominated four times for Best Director, for Dr. Strangelove, 2001, A Clockwork Orange and Barry Lyndon, and never won it?', a: 'Stanley Kubrick', d: ['Robert Altman', 'Sidney Lumet', 'King Vidor'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which 1989 release won Best Picture even though its director, Bruce Beresford, was not nominated?', a: 'Driving Miss Daisy', d: ['Born on the Fourth of July', 'Dead Poets Society', 'Field of Dreams'] },
{ c: 'Behind the Scenes', t: 5, q: 'The documentary Hearts of Darkness chronicles the troubled Philippine shoot of which film?', a: 'Apocalypse Now', d: ['Platoon', 'The Deer Hunter', 'Full Metal Jacket'] },
],

// ── Day 5 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'In Toy Story, what kind of toy is Woody?', a: 'A cowboy doll', d: ['A space ranger', 'A piggy bank', 'A toy dinosaur'] },
{ c: 'Television', t: 1, q: 'Which competition series has amateur bakers working in a tent in the English countryside?', a: 'The Great British Bake Off', d: ['MasterChef', 'Top Chef', 'Chopped'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor wrote and starred in Rocky?', a: 'Sylvester Stallone', d: ['Arnold Schwarzenegger', 'Burt Reynolds', 'Chuck Norris'] },
{ c: 'Awards & Box Office', t: 1, q: 'How many acting categories does the Academy award each year?', a: 'Four', d: ['Two', 'Six', 'Eight'] },
{ c: 'Behind the Scenes', t: 1, q: 'Besides blue, which color screen do actors perform against so a background can be added later?', a: 'Green', d: ['Red', 'Yellow', 'Purple'] },

{ c: 'Movies', t: 2, q: "In The Lion King, what is the name of Simba's uncle?", a: 'Scar', d: ['Mufasa', 'Rafiki', 'Zazu'] },
{ c: 'Television', t: 2, q: 'Which period drama follows the Crawley family and their servants at an English country estate?', a: 'Downton Abbey', d: ['Upstairs, Downstairs', 'Brideshead Revisited', 'The Crown'] },
{ c: 'Actors & Directors', t: 2, q: 'Which actress played Ripley in Alien?', a: 'Sigourney Weaver', d: ['Linda Hamilton', 'Jamie Lee Curtis', 'Carrie Fisher'] },
{ c: 'Awards & Box Office', t: 2, q: 'What is the top prize at the Cannes Film Festival called?', a: "The Palme d'Or", d: ['The Golden Bear', 'The Golden Lion', 'The Silver Shell'] },
{ c: 'Behind the Scenes', t: 2, q: 'How many frames per second have sound films been projected at since the late 1920s?', a: '24', d: ['16', '30', '48'] },

{ c: 'Movies', t: 3, q: 'What does the audience learn is inside the glowing briefcase in Pulp Fiction?', a: 'It is never revealed', d: ['Gold bars', 'Diamonds', 'Cash'] },
{ c: 'Television', t: 3, q: 'Which 1990 series asked viewers who killed Laura Palmer?', a: 'Twin Peaks', d: ['Northern Exposure', 'Picket Fences', 'American Gothic'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor won Best Actor for playing Gandhi?', a: 'Ben Kingsley', d: ['Om Puri', 'Roshan Seth', 'Naseeruddin Shah'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film won Best Picture at the 1998 ceremony?', a: 'Titanic', d: ['L.A. Confidential', 'Good Will Hunting', 'As Good as It Gets'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which rating did the American film ratings board add in 1984, between PG and R?', a: 'PG-13', d: ['M', 'GP', 'NC-17'] },

{ c: 'Movies', t: 4, q: 'What is the trade of Daniel Plainview in There Will Be Blood?', a: 'Oil prospecting', d: ['Timber logging', 'Cattle ranching', 'Railroad building'] },
{ c: 'Television', t: 4, q: 'Which series followed a Baltimore detective named Jimmy McNulty?', a: 'The Wire', d: ['Homicide: Life on the Street', 'The Corner', 'Oz'] },
{ c: 'Actors & Directors', t: 4, q: 'Which director made Yojimbo, later remade as A Fistful of Dollars?', a: 'Akira Kurosawa', d: ['Sergio Leone', 'Hideo Gosha', 'Masaki Kobayashi'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which actor won an Academy Award for playing a role an earlier Oscar winner had already played?', a: 'Robert De Niro', d: ['Al Pacino', 'Anthony Hopkins', 'Jack Nicholson'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which cinematographer shot The Revenant using only natural light?', a: 'Emmanuel Lubezki', d: ['Roger Deakins', 'Robert Richardson', 'Janusz Kaminski'] },

{ c: 'Movies', t: 5, q: "What is the profession of the lead character in Jean-Pierre Melville's Le Samourai?", a: 'A contract killer', d: ['A jazz pianist', 'A police inspector', 'A jewel thief'] },
{ c: 'Television', t: 5, q: 'Which 1970s British sitcom was set in a badly run hotel in Torquay?', a: 'Fawlty Towers', d: ['Are You Being Served?', 'Rising Damp', 'Porridge'] },
{ c: 'Actors & Directors', t: 5, q: 'Who sent a representative to decline his Best Actor Oscar in 1973?', a: 'Marlon Brando', d: ['George C. Scott', 'Paul Newman', 'Jack Nicholson'] },
{ c: 'Awards & Box Office', t: 5, q: 'What was the top prize called at the very first Academy Awards ceremony?', a: 'Outstanding Picture', d: ['Best Production', 'Best Motion Picture', 'Picture of the Year'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which 1915 feature is studied for its technical innovations alongside its notorious racism?', a: 'The Birth of a Nation', d: ['Intolerance', 'Broken Blossoms', 'The Cabinet of Dr. Caligari'] },
],

// ── Day 6 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'Which 1975 summer release about a great white shark is credited with inventing the blockbuster?', a: 'Jaws', d: ['Piranha', 'Orca', 'The Deep'] },
{ c: 'Television', t: 1, q: 'Which quiz show requires contestants to phrase their responses as a question?', a: 'Jeopardy!', d: ['Wheel of Fortune', 'The Price Is Right', 'Family Feud'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Captain Jack Sparrow in Pirates of the Caribbean?', a: 'Johnny Depp', d: ['Orlando Bloom', 'Geoffrey Rush', 'Javier Bardem'] },
{ c: 'Awards & Box Office', t: 1, q: "A film's box office gross refers to what?", a: 'Total ticket sales revenue', d: ['Profit after costs', "The studio's share only", 'Overseas sales only'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which pair of brothers directed Fargo and No Country for Old Men?', a: 'The Coen brothers', d: ['The Wachowskis', 'The Farrelly brothers', 'The Safdie brothers'] },

{ c: 'Movies', t: 2, q: 'Through which city does Rocky Balboa run while training?', a: 'Philadelphia', d: ['New York', 'Boston', 'Chicago'] },
{ c: 'Television', t: 2, q: 'Which short-lived series was set aboard a transport ship named Serenity?', a: 'Firefly', d: ['Battlestar Galactica', 'Farscape', 'Stargate SG-1'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Alien and Gladiator?', a: 'Ridley Scott', d: ['James Cameron', 'Tony Scott', 'Paul Verhoeven'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which 1939 release won eight competitive Academy Awards including the top prize?', a: 'Gone with the Wind', d: ['The Wizard of Oz', 'Mr. Smith Goes to Washington', 'Stagecoach'] },
{ c: 'Behind the Scenes', t: 2, q: 'A motion capture performance such as Gollum is recorded using what worn by the actor?', a: 'A suit covered in markers', d: ['A green mask only', 'A helmet camera alone', 'A wired exoskeleton'] },

{ c: 'Movies', t: 3, q: 'In Rear Window, why is the photographer confined to his apartment?', a: 'A broken leg', d: ['A quarantine', 'House arrest', 'A blizzard'] },
{ c: 'Television', t: 3, q: 'Which BBC comedy series introduced the Ministry of Silly Walks?', a: "Monty Python's Flying Circus", d: ['The Goodies', 'Not the Nine O’Clock News', 'Beyond the Fringe'] },
{ c: 'Actors & Directors', t: 3, q: "Which director made Chinatown and Rosemary's Baby?", a: 'Roman Polanski', d: ['John Schlesinger', 'Arthur Penn', 'Hal Ashby'] },
{ c: 'Awards & Box Office', t: 3, q: 'What is the top prize at the Berlin International Film Festival called?', a: 'The Golden Bear', d: ['The Golden Lion', 'The Golden Leopard', 'The Crystal Globe'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which 1948 Hitchcock film was shot in a handful of long takes and cut to look continuous?', a: 'Rope', d: ['Russian Ark', 'Birdman', 'Timecode'] },

{ c: 'Movies', t: 4, q: 'In Dr. Strangelove, what is the air base whose commander goes rogue called?', a: 'Burpelson', d: ['Ripper Field', 'Turgidson Field', 'Mandrake Base'] },
{ c: 'Television', t: 4, q: 'Which 1970s sitcom sent its characters to a bar called the Regal Beagle?', a: "Three's Company", d: ['Happy Days', 'Laverne & Shirley', 'WKRP in Cincinnati'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor played Norman Bates in 1960?', a: 'Anthony Perkins', d: ['Martin Balsam', 'John Gavin', 'Vince Edwards'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film finished the 1980s as the decade’s highest grossing release worldwide?', a: 'E.T. the Extra-Terrestrial', d: ['Return of the Jedi', 'Batman', 'Raiders of the Lost Ark'] },
{ c: 'Behind the Scenes', t: 4, q: 'For which film did Bernard Herrmann write a score performed entirely by strings?', a: 'Psycho', d: ['Vertigo', 'Taxi Driver', 'Cape Fear'] },

{ c: 'Movies', t: 5, q: 'Who narrates Sunset Boulevard?', a: 'A dead man floating in a swimming pool', d: ['A police detective', 'The studio head', 'A gossip columnist'] },
{ c: 'Television', t: 5, q: 'What are the call letters of the radio station where Frasier Crane broadcasts?', a: 'KACL', d: ['WKRP', 'KBHR', 'WNYX'] },
{ c: 'Actors & Directors', t: 5, q: 'Which Soviet filmmaker made the documentary Man with a Movie Camera?', a: 'Dziga Vertov', d: ['Sergei Eisenstein', 'Esfir Shub', 'Mikhail Kaufman'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which X-rated release won Best Picture, the only one ever to do so?', a: 'Midnight Cowboy', d: ['A Clockwork Orange', 'Last Tango in Paris', 'Deliverance'] },
{ c: 'Behind the Scenes', t: 5, q: 'Who invented the Steadicam?', a: 'Garrett Brown', d: ['Douglas Trumbull', 'John Dykstra', 'Vilmos Zsigmond'] },
],

// ── Day 7 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'Which animated film follows a green ogre who leaves his swamp to rescue a princess?', a: 'Shrek', d: ['Monsters, Inc.', 'Hercules', "The Emperor's New Groove"] },
{ c: 'Television', t: 1, q: 'Which 1960s series sent the USS Enterprise on a five-year mission?', a: 'Star Trek', d: ['Lost in Space', 'Space: 1999', 'Battlestar Galactica'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actress played Katniss Everdeen in The Hunger Games?', a: 'Jennifer Lawrence', d: ['Shailene Woodley', 'Kristen Stewart', 'Emma Roberts'] },
{ c: 'Awards & Box Office', t: 1, q: 'What does calling a film a blockbuster describe?', a: 'A very commercially successful release', d: ['A release that loses money', 'A release that skipped cinemas', 'A release banned in some countries'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which disc format eventually replaced VHS as the main home video medium?', a: 'The DVD', d: ['LaserDisc', 'Blu-ray', 'MiniDisc'] },

{ c: 'Movies', t: 2, q: 'In The Shawshank Redemption, where does Andy Dufresne hide his rock hammer?', a: 'Inside a Bible', d: ['Under his mattress', 'Inside a radio', 'Inside a shoe'] },
{ c: 'Television', t: 2, q: 'What is the coffee house in Friends called?', a: 'Central Perk', d: ["Java Joe's", 'The Grind', 'Cafe Nervosa'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Titanic and Avatar?', a: 'James Cameron', d: ['Ridley Scott', 'Michael Bay', 'Roland Emmerich'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film beat Pulp Fiction to Best Picture at the 1995 ceremony?', a: 'Forrest Gump', d: ['The Shawshank Redemption', 'Quiz Show', 'Four Weddings and a Funeral'] },
{ c: 'Behind the Scenes', t: 2, q: 'In filmmaking, what does CGI stand for?', a: 'Computer-generated imagery', d: ['Cinematic graphic integration', 'Colored gel illumination', 'Continuous gate imaging'] },

{ c: 'Movies', t: 3, q: 'In Some Like It Hot, why do the two musicians disguise themselves as women?', a: 'They witnessed a gangland killing', d: ['They owe a casino money', 'They are dodging the draft', 'They lost a bet'] },
{ c: 'Television', t: 3, q: 'Which series is narrated by a grown man looking back on his suburban 1960s boyhood?', a: 'The Wonder Years', d: ['Happy Days', 'Malcolm in the Middle', 'Freaks and Geeks'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor starred as Harry Callahan in Dirty Harry?', a: 'Clint Eastwood', d: ['Charles Bronson', 'Lee Marvin', 'Steve McQueen'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which Ridley Scott film about a Roman general sold into the arena won Best Picture at the 2001 ceremony?', a: 'Gladiator', d: ['Traffic', 'Erin Brockovich', 'Chocolat'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which 1958 film introduced the dolly zoom, tracking back while zooming in?', a: 'Vertigo', d: ['Jaws', 'Goodfellas', 'Poltergeist'] },

{ c: 'Movies', t: 4, q: 'Which desert does Lawrence insist on crossing against advice in Lawrence of Arabia?', a: 'The Nefud', d: ["The Rub' al Khali", 'The Sinai', 'The Negev'] },
{ c: 'Television', t: 4, q: "Which series opened each episode with 'Woke Up This Morning' by Alabama 3?", a: 'The Sopranos', d: ['The Shield', 'Deadwood', 'Boardwalk Empire'] },
{ c: 'Actors & Directors', t: 4, q: "Which actress starred as Holly Golightly in Breakfast at Tiffany's?", a: 'Audrey Hepburn', d: ['Grace Kelly', 'Natalie Wood', 'Leslie Caron'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film took the top prize at the 1953 ceremony, the first Academy Awards to be televised?', a: 'The Greatest Show on Earth', d: ['High Noon', 'From Here to Eternity', "Singin' in the Rain"] },
{ c: 'Behind the Scenes', t: 4, q: 'What does the term MacGuffin describe?', a: 'A plot device that drives characters but matters little in itself', d: ['A recurring background actor', 'A camera crane move', 'A studio contract clause'] },

{ c: 'Movies', t: 5, q: 'The final section of Andrei Rublev follows the casting of what?', a: 'A bell', d: ['A cannon', 'A statue', 'A church door'] },
{ c: 'Television', t: 5, q: 'What was the Alaskan town in Northern Exposure called?', a: 'Cicely', d: ['Bly', 'Twin Pines', 'Rome'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actor played the vampire in the 1922 silent film Nosferatu?', a: 'Max Schreck', d: ['Conrad Veidt', 'Bela Lugosi', 'Paul Wegener'] },
{ c: 'Awards & Box Office', t: 5, q: 'How many times did Alfred Hitchcock win the Academy Award for Best Director?', a: 'Never', d: ['Once', 'Twice', 'Three times'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which widescreen process did 20th Century Fox introduce in 1953 with The Robe?', a: 'CinemaScope', d: ['VistaVision', 'Todd-AO', 'Cinerama'] },
],

// ── Day 8 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'What kind of fish is the title character of Finding Nemo?', a: 'A clownfish', d: ['An angelfish', 'A goldfish', 'A blue tang'] },
{ c: 'Television', t: 1, q: 'On which long-running childrens series do Big Bird and Elmo live?', a: 'Sesame Street', d: ["Mister Rogers' Neighborhood", 'The Muppet Show', 'Barney & Friends'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Neo in The Matrix?', a: 'Keanu Reeves', d: ['Laurence Fishburne', 'Hugo Weaving', 'Val Kilmer'] },
{ c: 'Awards & Box Office', t: 1, q: 'In which American city are the Academy Awards presented?', a: 'Los Angeles', d: ['New York', 'Chicago', 'Las Vegas'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which 1977 release drove the rapid adoption of stereo sound in cinemas?', a: 'Star Wars', d: ['Close Encounters of the Third Kind', 'Saturday Night Fever', 'Superman'] },

{ c: 'Movies', t: 2, q: 'In Jurassic Park, what is used to fill the gaps in the dinosaur DNA?', a: 'Frog DNA', d: ['Bird DNA', 'Lizard DNA', 'Crocodile DNA'] },
{ c: 'Television', t: 2, q: 'Who owns the nuclear power plant in The Simpsons?', a: 'Mr. Burns', d: ['Waylon Smithers', 'Mayor Quimby', 'Ned Flanders'] },
{ c: 'Actors & Directors', t: 2, q: "Which director made Pan's Labyrinth and The Shape of Water?", a: 'Guillermo del Toro', d: ['Alejandro G. Inarritu', 'Alfonso Cuaron', 'Juan Antonio Bayona'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film actually won Best Picture at the 2017 ceremony after the wrong title was read out?', a: 'Moonlight', d: ['La La Land', 'Manchester by the Sea', 'Hidden Figures'] },
{ c: 'Behind the Scenes', t: 2, q: 'What does a foley artist create?', a: 'Everyday sound effects recorded to picture', d: ['Matte paintings', 'Miniature models', 'Set dressing'] },

{ c: 'Movies', t: 3, q: 'In which city is The Third Man set?', a: 'Vienna', d: ['Berlin', 'Prague', 'Budapest'] },
{ c: 'Television', t: 3, q: 'Which British sitcom centered on the socially ambitious Hyacinth Bucket?', a: 'Keeping Up Appearances', d: ['Absolutely Fabulous', 'Butterflies', 'To the Manor Born'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor played Atticus Finch in the film of To Kill a Mockingbird?', a: 'Gregory Peck', d: ['Henry Fonda', 'James Stewart', 'Spencer Tracy'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which actor was the youngest ever to win a competitive Academy Award for Best Actor?', a: 'Adrien Brody', d: ['Marlon Brando', 'Richard Dreyfuss', 'Matt Damon'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which crew member heads the electrical department and is responsible for lighting?', a: 'The gaffer', d: ['The foley artist', 'The script supervisor', 'The dolly grip'] },

{ c: 'Movies', t: 4, q: 'In Once Upon a Time in the West, what does the harmonica-playing stranger want?', a: "Revenge for his brother's death", d: ['A stolen gold shipment', 'A railroad contract', 'His wife returned'] },
{ c: 'Television', t: 4, q: 'Which sitcom was set in the newsroom of the fictional WJM-TV in Minneapolis?', a: 'The Mary Tyler Moore Show', d: ['Lou Grant', 'Murphy Brown', 'WKRP in Cincinnati'] },
{ c: 'Actors & Directors', t: 4, q: 'Which director made 8½ and La Dolce Vita?', a: 'Federico Fellini', d: ['Michelangelo Antonioni', 'Luchino Visconti', 'Vittorio De Sica'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which mostly silent black and white film won Best Picture at the 2012 ceremony?', a: 'The Artist', d: ['Hugo', 'The Descendants', 'Midnight in Paris'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which studio uses a mountain encircled by stars as its logo?', a: 'Paramount', d: ['Universal', 'Columbia', 'TriStar'] },

{ c: 'Movies', t: 5, q: 'What journey do the elderly couple make in Tokyo Story?', a: 'They travel to Tokyo to visit their grown children', d: ['They emigrate to America', 'They return to their birthplace', 'They move into a temple'] },
{ c: 'Television', t: 5, q: 'Which British sitcom is set on a mining ship drifting three million years into deep space?', a: 'Red Dwarf', d: ['Hyperdrive', 'Come Back Mrs Noah', "Blake's 7"] },
{ c: 'Actors & Directors', t: 5, q: 'Which actress starred opposite Cary Grant in Bringing Up Baby?', a: 'Katharine Hepburn', d: ['Rosalind Russell', 'Irene Dunne', 'Carole Lombard'] },
{ c: 'Awards & Box Office', t: 5, q: "Which country's film Shoeshine took an honorary Academy Award as the outstanding foreign language film of 1947?", a: 'Italy', d: ['France', 'Japan', 'Mexico'] },
{ c: 'Behind the Scenes', t: 5, q: 'The Kuleshov effect demonstrates what about cinema?', a: 'Meaning comes from the juxtaposition of shots', d: ['Color drives mood', 'Sound must match picture exactly', 'Long takes build tension'] },
],

// ── Day 9 ──────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'In The Sound of Music, what was Maria training to become before joining the von Trapp household?', a: 'A nun', d: ['A teacher', 'A nurse', 'An opera singer'] },
{ c: 'Television', t: 1, q: 'Which reality competition has contestants vote one another off the island?', a: 'Survivor', d: ['Big Brother', 'The Amazing Race', 'Fear Factor'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played James Bond in Dr. No, the first film of the series?', a: 'Sean Connery', d: ['Roger Moore', 'George Lazenby', 'Timothy Dalton'] },
{ c: 'Awards & Box Office', t: 1, q: "What does a film's opening weekend measure?", a: 'Ticket sales across its first Friday to Sunday', d: ['Its entire theatrical run', 'Its overseas total', 'Its production budget'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which studio has a roaring lion as its mascot?', a: 'MGM', d: ['Warner Bros.', '20th Century Fox', 'Universal'] },

{ c: 'Movies', t: 2, q: 'Which artifact is Indiana Jones chasing in Raiders of the Lost Ark?', a: 'The Ark of the Covenant', d: ['The Holy Grail', 'The Sankara Stones', 'A crystal skull'] },
{ c: 'Television', t: 2, q: 'What was Sam Malone in Cheers before he ran a bar?', a: 'A baseball pitcher', d: ['A boxer', 'A quarterback', 'A hockey goaltender'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made The Grand Budapest Hotel and Rushmore?', a: 'Wes Anderson', d: ['Noah Baumbach', 'Spike Jonze', 'Michel Gondry'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which musical won Best Picture at the 2003 ceremony?', a: 'Chicago', d: ['Moulin Rouge!', 'Dreamgirls', 'Nine'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which Japanese animation studio produced Spirited Away?', a: 'Studio Ghibli', d: ['Toei Animation', 'Madhouse', 'Production I.G'] },

{ c: 'Movies', t: 3, q: 'What was Travis Bickle before he drove a cab in Taxi Driver?', a: 'A Marine', d: ['A police officer', 'A prison guard', 'A long haul trucker'] },
{ c: 'Television', t: 3, q: "Which nightly news programme did Walter Cronkite sign off with 'and that's the way it is'?", a: 'The CBS Evening News', d: ['NBC Nightly News', '60 Minutes', 'Meet the Press'] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made Blue Velvet and Mulholland Drive?', a: 'David Lynch', d: ['David Cronenberg', 'Terry Gilliam', 'Darren Aronofsky'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film was the first to take more than one hundred million dollars at the American box office?', a: 'Jaws', d: ['The Godfather', 'Star Wars', 'The Exorcist'] },
{ c: 'Behind the Scenes', t: 3, q: 'What does shooting day for night mean?', a: 'Filming in daylight and treating the image to look like night', d: ['Shooting only after sunset', 'Running two units at once', 'Building a night scene on a sound stage'] },

{ c: 'Movies', t: 4, q: 'What is the profession of Harry Caul in The Conversation?', a: 'A surveillance expert', d: ['A journalist', 'A priest', 'A locksmith'] },
{ c: 'Television', t: 4, q: 'Which animated series is set in the fictional Rhode Island town of Quahog?', a: 'Family Guy', d: ['American Dad!', 'The Cleveland Show', 'Futurama'] },
{ c: 'Actors & Directors', t: 4, q: 'Which director made Nashville and The Player?', a: 'Robert Altman', d: ['Hal Ashby', 'Sidney Lumet', 'Arthur Penn'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which release finished the 1990s as the decade’s highest grossing film worldwide?', a: 'Titanic', d: ['Jurassic Park', 'Independence Day', 'The Lion King'] },
{ c: 'Behind the Scenes', t: 4, q: "Which film's poster carried the line about nobody hearing you scream in space?", a: 'Alien', d: ['Event Horizon', 'Outland', 'Solaris'] },

{ c: 'Movies', t: 5, q: 'In Bicycle Thieves, what does the father need the bicycle for?', a: 'A job putting up posters', d: ['Delivering bread', 'Racing', 'Selling vegetables'] },
{ c: 'Television', t: 5, q: 'Which anthology series did Rod Serling host after The Twilight Zone?', a: 'Night Gallery', d: ['The Outer Limits', 'One Step Beyond', 'Thriller'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director made Breathless in 1960?', a: 'Jean-Luc Godard', d: ['Francois Truffaut', 'Claude Chabrol', 'Eric Rohmer'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which art director holds the record for the most Academy Award nominations in a single category, with thirty-nine?', a: 'Cedric Gibbons', d: ['Lyle Wheeler', 'Hans Dreier', 'William Cameron Menzies'] },
{ c: 'Behind the Scenes', t: 5, q: 'What did the 1948 Paramount Decree force the major studios to give up?', a: 'Ownership of cinema chains', d: ['Long-term actor contracts', 'Foreign distribution', 'Color film patents'] },
],

// ── Day 10 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'In which film does a billionaire open an island park stocked with cloned prehistoric animals?', a: 'Jurassic Park', d: ['King Kong', 'Congo', 'Anaconda'] },
{ c: 'Television', t: 1, q: 'Which sitcom follows a Brooklyn police precinct commanded by Captain Raymond Holt?', a: 'Brooklyn Nine-Nine', d: ['The Good Place', 'Superstore', 'Community'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actress played Princess Leia in the original Star Wars trilogy?', a: 'Carrie Fisher', d: ['Sigourney Weaver', 'Jamie Lee Curtis', 'Karen Allen'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which film and television awards are voted on by performers themselves?', a: 'The Screen Actors Guild Awards', d: ['The Academy Awards', 'The Golden Globes', 'The BAFTAs'] },
{ c: 'Behind the Scenes', t: 1, q: "What does a director's cut of a film mean?", a: "A version edited to the director's preference", d: ['The theatrical release', 'The version shown to test audiences', 'The shortest version'] },

{ c: 'Movies', t: 2, q: 'In the 1971 film of Roald Dahl’s chocolate factory story, what does Charlie find inside a candy bar?', a: 'A golden ticket', d: ['A silver coin', 'A map', 'A brass key'] },
{ c: 'Television', t: 2, q: 'Which sitcom is set in the parks department of Pawnee, Indiana?', a: 'Parks and Recreation', d: ['The Office', 'Superstore', 'Veep'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Fight Club and Se7en?', a: 'David Fincher', d: ['Christopher Nolan', 'Darren Aronofsky', 'Doug Liman'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film about an army bomb disposal unit in Iraq won Best Picture at the 2010 ceremony?', a: 'The Hurt Locker', d: ['Avatar', 'Inglourious Basterds', 'Up in the Air'] },
{ c: 'Behind the Scenes', t: 2, q: 'For most of the twentieth century, how wide was the film stock projected in cinemas?', a: '35 millimeters', d: ['16 millimeters', '70 millimeters', '8 millimeters'] },

{ c: 'Movies', t: 3, q: 'What makes the structure of Rashomon famous?', a: 'One event told in contradictory versions', d: ['A single unbroken take', 'Reverse chronology', 'No dialogue at all'] },
{ c: 'Television', t: 3, q: "Which 1981 police drama opened each episode at roll call with 'Let's be careful out there'?", a: 'Hill Street Blues', d: ['NYPD Blue', 'Cagney & Lacey', 'Barney Miller'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor played the weak middle brother Fredo in the Godfather films?', a: 'John Cazale', d: ['James Caan', 'Richard Castellano', 'Gianni Russo'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which western, directed by its star, won Best Picture at the 1991 ceremony?', a: 'Dances with Wolves', d: ['Goodfellas', 'Awakenings', 'Ghost'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which crew role heads the rigging and camera support department?', a: 'The key grip', d: ['The best boy electric', 'The foley artist', 'The script supervisor'] },

{ c: 'Movies', t: 4, q: 'Who narrates the story of Mozart in Amadeus?', a: 'Antonio Salieri', d: ['Emperor Joseph II', 'Constanze Mozart', 'Leopold Mozart'] },
{ c: 'Television', t: 4, q: 'Which series featured a shadowy antagonist known as the Cigarette Smoking Man?', a: 'The X-Files', d: ['Fringe', 'Millennium', 'Person of Interest'] },
{ c: 'Actors & Directors', t: 4, q: 'Which director made Cleo from 5 to 7 and Vagabond?', a: 'Agnes Varda', d: ['Marguerite Duras', 'Chantal Akerman', 'Claire Denis'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which 1950 release took fourteen Academy Award nominations, the most any film had received to that point?', a: 'All About Eve', d: ['Sunset Boulevard', 'Born Yesterday', "King Solomon's Mines"] },
{ c: 'Behind the Scenes', t: 4, q: 'Which 1976 release was the first feature to use the newly invented Steadicam?', a: 'Bound for Glory', d: ['Rocky', 'Marathon Man', 'Taxi Driver'] },

{ c: 'Movies', t: 5, q: 'What journey frames Wild Strawberries?', a: 'An elderly professor driving to receive an honorary degree', d: ['A pilgrimage to a monastery', 'A soldier returning from the front', 'A family voyage to America'] },
{ c: 'Television', t: 5, q: 'What was the Chicago hospital in ER called?', a: 'County General', d: ['Cook County Memorial', 'Mercy General', 'Chicago Hope'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director made Andrei Rublev and Stalker?', a: 'Andrei Tarkovsky', d: ['Sergei Parajanov', 'Elem Klimov', 'Aleksei German'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which Italian film won the first competitive Academy Award for Best Foreign Language Film?', a: 'La Strada', d: ['Nights of Cabiria', 'Bicycle Thieves', 'Rome, Open City'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which 1927 German film had long-lost footage rediscovered in Buenos Aires in 2008?', a: 'Metropolis', d: ['Nosferatu', 'The Cabinet of Dr. Caligari', 'Faust'] },
],

// ── Day 11 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "In Disney's Beauty and the Beast, what does the enchanted rose measure?", a: 'The time left to break the curse', d: ["The Beast's strength", "The castle's magic", "Belle's love"] },
{ c: 'Television', t: 1, q: 'Which medical drama is set at Seattle Grace Hospital?', a: "Grey's Anatomy", d: ['House', 'ER', 'Scrubs'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Han Solo in the original Star Wars trilogy?', a: 'Harrison Ford', d: ['Mark Hamill', 'Billy Dee Williams', 'Kurt Russell'] },
{ c: 'Awards & Box Office', t: 1, q: 'The Academy Award for Best Picture is handed to whom?', a: "The film's producers", d: ['The director', 'The lead actor', 'The studio head'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which animation studio made Toy Story, Up and WALL-E?', a: 'Pixar', d: ['DreamWorks Animation', 'Illumination', 'Blue Sky'] },

{ c: 'Movies', t: 2, q: 'In The Princess Bride, who is Inigo Montoya hunting?', a: 'The man who killed his father', d: ['A thief who stole his sword', 'The pirate who marooned him', 'The king who exiled him'] },
{ c: 'Television', t: 2, q: 'Which series is set in the fictional town of Hawkins, Indiana?', a: 'Stranger Things', d: ['Riverdale', 'Dark', 'The OA'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Get Out and Nope?', a: 'Jordan Peele', d: ['Ryan Coogler', 'Barry Jenkins', 'Boots Riley'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film about a boxer and her trainer won Best Picture at the 2005 ceremony?', a: 'Million Dollar Baby', d: ['The Aviator', 'Sideways', 'Ray'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which Stephen King novella was filmed as Stand by Me?', a: 'The Body', d: ['The Mist', 'Apt Pupil', 'The Breathing Method'] },

{ c: 'Movies', t: 3, q: 'In 12 Angry Men, who is the lone holdout at the first vote?', a: 'Juror 8', d: ['Juror 3', 'Juror 1', 'Juror 12'] },
{ c: 'Television', t: 3, q: 'Which sitcom was set at a Vermont inn run by Dick Loudon?', a: 'Newhart', d: ['The Bob Newhart Show', 'Coach', 'Evening Shade'] },
{ c: 'Actors & Directors', t: 3, q: "Which actress won Best Actress for Sophie's Choice?", a: 'Meryl Streep', d: ['Jessica Lange', 'Sissy Spacek', 'Debra Winger'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about a Depression-era confidence trick won Best Picture at the 1974 ceremony?', a: 'The Sting', d: ['American Graffiti', 'The Exorcist', 'Cries and Whispers'] },
{ c: 'Behind the Scenes', t: 3, q: 'What does ADR mean in post-production?', a: 'Re-recording dialogue in a studio', d: ['Adding digital rain', 'Automatic depth rendering', 'Analog data restoration'] },

{ c: 'Movies', t: 4, q: 'Which resource is at the heart of the conspiracy in Chinatown?', a: 'Water', d: ['Oil', 'Gold', 'Railroad rights'] },
{ c: 'Television', t: 4, q: 'Which British soap opera has been set in the fictional Weatherfield since 1960?', a: 'Coronation Street', d: ['EastEnders', 'Emmerdale', 'Brookside'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor appeared in both The Godfather and Apocalypse Now?', a: 'Robert Duvall', d: ['Harvey Keitel', 'Frederic Forrest', 'Sam Bottoms'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which Billy Wilder film won Best Picture at the 1961 ceremony?', a: 'The Apartment', d: ['Elmer Gantry', 'The Alamo', 'Sons and Lovers'] },
{ c: 'Behind the Scenes', t: 4, q: 'What is the 180 degree rule in filmmaking?', a: 'Keeping the camera on one side of an imaginary line between subjects', d: ['Circling a subject in a full rotation', 'Lighting from directly behind the subject', 'Cutting on a half turn of the head'] },

{ c: 'Movies', t: 5, q: 'Which conflict does The Battle of Algiers dramatize?', a: 'The Algerian war of independence', d: ['The Spanish Civil War', 'The Suez Crisis', 'The Six-Day War'] },
{ c: 'Television', t: 5, q: 'Which 1977 miniseries about an American family enslaved over generations drew record audiences?', a: 'Roots', d: ['Holocaust', 'Rich Man, Poor Man', 'Shogun'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actress played the faded silent star Norma Desmond?', a: 'Gloria Swanson', d: ['Mae West', 'Pola Negri', 'Norma Shearer'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which director won Best Director three times in the 1930s?', a: 'Frank Capra', d: ['John Ford', 'William Wyler', 'Leo McCarey'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which classic color process exposed three separate strips of black and white negative at once?', a: 'Technicolor', d: ['Eastmancolor', 'Kinemacolor', 'Agfacolor'] },
],

// ── Day 12 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "In Disney's Frozen, what power does Elsa have?", a: 'She creates ice and snow', d: ['She can fly', 'She talks to animals', 'She can heal the sick'] },
{ c: 'Television', t: 1, q: 'On which singing competition do the judges audition contestants with their chairs turned away?', a: 'The Voice', d: ['American Idol', 'The X Factor', "America's Got Talent"] },
{ c: 'Actors & Directors', t: 1, q: 'Which director made Inception and The Dark Knight?', a: 'Christopher Nolan', d: ['Zack Snyder', 'Denis Villeneuve', 'Matt Reeves'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which awards honor achievement in recorded music?', a: 'The Grammy Awards', d: ['The Tony Awards', 'The Emmy Awards', 'The Obie Awards'] },
{ c: 'Behind the Scenes', t: 1, q: 'What is the clapperboard snapped at the head of a take for?', a: 'Syncing the picture to the sound', d: ['Measuring focus', 'Setting exposure', 'Timing the scene'] },

{ c: 'Movies', t: 2, q: 'What is the name of the Roman general played by Russell Crowe in Gladiator?', a: 'Maximus', d: ['Commodus', 'Proximo', 'Marcus'] },
{ c: 'Television', t: 2, q: 'Which series follows an Albuquerque lawyer who began life as Jimmy McGill?', a: 'Better Call Saul', d: ['Breaking Bad', 'Ozark', 'Fargo'] },
{ c: 'Actors & Directors', t: 2, q: 'Which actress played Mia Wallace in Pulp Fiction?', a: 'Uma Thurman', d: ['Rosanna Arquette', 'Bridget Fonda', 'Maria de Medeiros'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film won Best Picture at the 2014 ceremony?', a: '12 Years a Slave', d: ['Gravity', 'American Hustle', 'Her'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which 1937 release was the first American feature-length animated film?', a: 'Snow White and the Seven Dwarfs', d: ['Pinocchio', 'Fantasia', 'Bambi'] },

{ c: 'Movies', t: 3, q: 'What is the profession of Walter Neff in Double Indemnity?', a: 'An insurance salesman', d: ['A private detective', 'A lawyer', 'A newspaper reporter'] },
{ c: 'Television', t: 3, q: 'Which comedy was set at Sacred Heart Hospital?', a: 'Scrubs', d: ["Grey's Anatomy", 'House', 'Nurse Jackie'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor starred in Raging Bull, Taxi Driver and Goodfellas for Martin Scorsese?', a: 'Robert De Niro', d: ['Joe Pesci', 'Harvey Keitel', 'Ray Liotta'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which Steven Spielberg film won Best Picture for 1993?', a: "Schindler's List", d: ['Jurassic Park', 'The Fugitive', 'In the Name of the Father'] },
{ c: 'Behind the Scenes', t: 3, q: 'What is a matte painting used for?', a: 'Creating a background too large or costly to build', d: ['Coloring film by hand', 'Blending two takes of one actor', 'Softening the focus'] },

{ c: 'Movies', t: 4, q: 'What is John Wayne’s character searching for in The Searchers?', a: 'His abducted niece', d: ['A gold mine', "His brother's killer", 'A lost herd'] },
{ c: 'Television', t: 4, q: 'Which prime-time soap opera featured the oil magnate J.R. Ewing?', a: 'Dallas', d: ['Dynasty', 'Falcon Crest', 'Knots Landing'] },
{ c: 'Actors & Directors', t: 4, q: 'Which German director made both Sunrise and Nosferatu?', a: 'F. W. Murnau', d: ['Fritz Lang', 'G. W. Pabst', 'Robert Wiene'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film became the first released by a streaming service to win Best Picture?', a: 'CODA', d: ['Roma', 'The Power of the Dog', 'Nomadland'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which technological change made the French New Wave practical to shoot?', a: 'Lightweight portable cameras and faster film stock', d: ['Digital editing', 'The zoom lens', 'Stereo magnetic sound'] },

{ c: 'Movies', t: 5, q: 'What did Jacques Tati build for the production of Playtime?', a: 'A full-scale modern city set', d: ['A rotating apartment', 'An underwater tank', 'A glass train'] },
{ c: 'Television', t: 5, q: 'What is the prison in the HBO series Oz called?', a: 'Oswald State Correctional Facility', d: ['Litchfield', 'Fox River', 'Shawshank'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director made The Rules of the Game in 1939?', a: 'Jean Renoir', d: ['Marcel Carne', 'Rene Clair', 'Julien Duvivier'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which low-budget drama about a lonely Bronx butcher won Best Picture at the 1956 ceremony?', a: 'Marty', d: ['Mister Roberts', 'Picnic', 'The Rose Tattoo'] },
{ c: 'Behind the Scenes', t: 5, q: "What did a film need the Production Code Administration's seal for until 1968?", a: 'Release through the major distributors', d: ['Export overseas', 'Television broadcast', 'Color processing'] },
],

// ── Day 13 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'In Home Alone, where does the McCallister family fly, leaving Kevin behind?', a: 'Paris', d: ['London', 'Rome', 'Miami'] },
{ c: 'Television', t: 1, q: 'Which Netflix drama follows the reign of Queen Elizabeth II from 1947?', a: 'The Crown', d: ['Victoria', 'Downton Abbey', 'The Tudors'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Wolverine across the X-Men films?', a: 'Hugh Jackman', d: ['Patrick Stewart', 'James Marsden', 'Liev Schreiber'] },
{ c: 'Awards & Box Office', t: 1, q: 'The Academy of Motion Picture Arts and Sciences was founded in which decade?', a: 'The 1920s', d: ['The 1910s', 'The 1930s', 'The 1940s'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which crew role is responsible for choosing which actors are auditioned and hired?', a: 'The casting director', d: ['The line producer', 'The unit manager', 'The location scout'] },

{ c: 'Movies', t: 2, q: 'In which Pennsylvania town is the weatherman trapped in Groundhog Day?', a: 'Punxsutawney', d: ['Scranton', 'Erie', 'Altoona'] },
{ c: 'Television', t: 2, q: 'Which comedy series follows the Bluth family and their frozen banana stand?', a: 'Arrested Development', d: ["Schitt's Creek", 'Modern Family', 'The Middle'] },
{ c: 'Actors & Directors', t: 2, q: 'Which actress won an Academy Award for playing Erin Brockovich?', a: 'Julia Roberts', d: ['Sandra Bullock', 'Meg Ryan', 'Michelle Pfeiffer'] },
{ c: 'Awards & Box Office', t: 2, q: "Which film about a suburban man's midlife unravelling won Best Picture at the 2000 ceremony?", a: 'American Beauty', d: ['The Sixth Sense', 'The Insider', 'The Green Mile'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which 1939 film opens in sepia and switches to color when the heroine arrives in another land?', a: 'The Wizard of Oz', d: ['Gone with the Wind', 'The Adventures of Robin Hood', 'Snow White and the Seven Dwarfs'] },

{ c: 'Movies', t: 3, q: 'What does the unravelling anchorman in Network urge viewers to shout out of their windows?', a: 'That they are mad as hell and will not take it any more', d: ['That the network should be shut down', 'That they will cancel their subscriptions', 'That the war must end'] },
{ c: 'Television', t: 3, q: 'Which sitcom is set behind the scenes of a live sketch show at 30 Rockefeller Plaza?', a: '30 Rock', d: ['Studio 60 on the Sunset Strip', 'The Larry Sanders Show', 'Sports Night'] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made La Haine?', a: 'Mathieu Kassovitz', d: ['Jacques Audiard', 'Olivier Assayas', 'Cedric Klapisch'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which Clint Eastwood western won Best Picture at the 1993 ceremony?', a: 'Unforgiven', d: ['Scent of a Woman', 'The Crying Game', 'A Few Good Men'] },
{ c: 'Behind the Scenes', t: 3, q: 'Whose critics developed the auteur theory in 1950s France?', a: 'Cahiers du Cinema', d: ['Positif', 'Sight & Sound', 'Film Comment'] },

{ c: 'Movies', t: 4, q: 'What are the conquistadors searching for in Aguirre, the Wrath of God?', a: 'El Dorado', d: ['The Fountain of Youth', 'The Northwest Passage', 'A lost mission'] },
{ c: 'Television', t: 4, q: 'Which HBO series was set in a lawless South Dakota mining camp in the 1870s?', a: 'Deadwood', d: ['Carnivale', 'Hell on Wheels', 'Godless'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor played the title role in Barry Lyndon?', a: "Ryan O'Neal", d: ['Malcolm McDowell', 'Keith Carradine', 'Michael York'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which 1959 epic won eleven Academy Awards, the most of its decade?', a: 'Ben-Hur', d: ['The Bridge on the River Kwai', 'Around the World in 80 Days', 'Gigi'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which effects supervisor led the motion-control and miniature work on the 1977 Star Wars?', a: 'John Dykstra', d: ['Douglas Trumbull', 'Ray Harryhausen', 'Dennis Muren'] },

{ c: 'Movies', t: 5, q: "What happens to the missing woman on the island in Antonioni's L'Avventura?", a: 'She vanishes and is never found', d: ['She drowns in view of the others', 'She is murdered by a fisherman', 'She elopes with a sailor'] },
{ c: 'Television', t: 5, q: 'What is the pub in EastEnders called?', a: 'The Queen Victoria', d: ['The Rovers Return', 'The Woolpack', 'The Bull'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director made Tokyo Story and Late Spring?', a: 'Yasujiro Ozu', d: ['Mikio Naruse', 'Kenji Mizoguchi', 'Kon Ichikawa'] },
{ c: 'Awards & Box Office', t: 5, q: 'Who was the first Black performer to win an acting Academy Award?', a: 'Hattie McDaniel', d: ['Sidney Poitier', 'Dorothy Dandridge', 'Ethel Waters'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which studio system practice bound a performer to one studio for years at a stretch?', a: 'The long-term contract', d: ['Block booking', 'Four-walling', 'Runaway production'] },
],

// ── Day 14 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'Which weapon do the Jedi carry in Star Wars?', a: 'A lightsaber', d: ['A blaster pistol', 'A bowcaster', 'A vibroblade'] },
{ c: 'Television', t: 1, q: 'Which animated series follows a nihilistic scientist and his anxious grandson between dimensions?', a: 'Rick and Morty', d: ['Futurama', 'Solar Opposites', 'Final Space'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actress played Julia Child in Julie & Julia?', a: 'Meryl Streep', d: ['Diane Keaton', 'Glenn Close', 'Susan Sarandon'] },
{ c: 'Awards & Box Office', t: 1, q: 'How often are the Academy Awards held?', a: 'Once a year', d: ['Twice a year', 'Every two years', 'Every four years'] },
{ c: 'Behind the Scenes', t: 1, q: 'What is a cameo appearance?', a: 'A brief appearance by a well known person', d: ['The leading role', "A stunt double's shot", 'An uncredited crew credit'] },

{ c: 'Movies', t: 2, q: 'Which giant figure stomps through New York at the climax of Ghostbusters?', a: 'The Stay Puft Marshmallow Man', d: ['Gozer the Gorgon', 'A terror dog', 'Slimer'] },
{ c: 'Television', t: 2, q: 'Which HBO series follows the Roy family and their media empire?', a: 'Succession', d: ['Billions', 'Empire', 'Dynasty'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Mad Max: Fury Road?', a: 'George Miller', d: ['Zack Snyder', 'Neill Blomkamp', 'Doug Liman'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film won Best Picture at the 2019 ceremony?', a: 'Green Book', d: ['Roma', 'BlacKkKlansman', 'Bohemian Rhapsody'] },
{ c: 'Behind the Scenes', t: 2, q: 'What does coverage mean on a film set?', a: 'Shooting a scene from several angles to give the editor choices', d: ['Marking where actors stand', 'Choosing the frame', 'Rigging the lights'] },

{ c: 'Movies', t: 3, q: 'In On the Waterfront, what does Terry Malloy say he could have been?', a: 'A contender', d: ['A champion', 'A somebody', 'A free man'] },
{ c: 'Television', t: 3, q: 'Which sitcom frames its whole run as a father telling his children a very long story?', a: 'How I Met Your Mother', d: ['Friends', 'The Goldbergs', 'Modern Family'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actress played the title role in Annie Hall?', a: 'Diane Keaton', d: ['Mia Farrow', 'Louise Lasser', 'Carrie Fisher'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about an autistic savant and his brother won Best Picture at the 1989 ceremony?', a: 'Rain Man', d: ['Mississippi Burning', 'Working Girl', 'Dangerous Liaisons'] },
{ c: 'Behind the Scenes', t: 3, q: "What does a film's aspect ratio describe?", a: 'The proportion of image width to height', d: ['The frames shown each second', 'The focal length of the lens', 'The range that stays in focus'] },

{ c: 'Movies', t: 4, q: 'What cargo are the drivers hauling in The Wages of Fear?', a: 'Nitroglycerin', d: ['Gold bullion', 'Medicine', 'Crude oil'] },
{ c: 'Television', t: 4, q: 'Which 1980s series featured a talking car called KITT?', a: 'Knight Rider', d: ['The A-Team', 'Airwolf', 'Street Hawk'] },
{ c: 'Actors & Directors', t: 4, q: 'Which French director made Playtime and Mon Oncle?', a: 'Jacques Tati', d: ['Rene Clair', 'Pierre Etaix', 'Marcel Carne'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film about a divorce and custody fight won Best Picture at the 1980 ceremony?', a: 'Kramer vs. Kramer', d: ['Apocalypse Now', 'All That Jazz', 'Norma Rae'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which 2002 release introduced Gollum, the breakthrough performance-captured digital character?', a: 'The Lord of the Rings: The Two Towers', d: ['Final Fantasy: The Spirits Within', 'Star Wars: The Phantom Menace', 'The Polar Express'] },

{ c: 'Movies', t: 5, q: 'Which event closes Carl Theodor Dreyer’s Ordet?', a: 'A resurrection', d: ['A wedding', 'A fire', 'A trial'] },
{ c: 'Television', t: 5, q: "Which 1990 British serial adapted Michael Dobbs's novel about a scheming chief whip?", a: 'House of Cards', d: ['Yes Minister', 'A Very British Coup', 'State of Play'] },
{ c: 'Actors & Directors', t: 5, q: 'Which cinematographer shot Persona and Cries and Whispers for Ingmar Bergman?', a: 'Sven Nykvist', d: ['Gunnar Fischer', 'Raoul Coutard', 'Henri Alekan'] },
{ c: 'Awards & Box Office', t: 5, q: 'Who was the first woman nominated for the Academy Award for Best Director?', a: 'Lina Wertmuller', d: ['Jane Campion', 'Sofia Coppola', 'Kathryn Bigelow'] },
{ c: 'Behind the Scenes', t: 5, q: 'What was Poverty Row in classic Hollywood?', a: 'The cluster of small studios making low-budget films', d: ['A backlot slum set', "The extras' union", 'A district of talent agents'] },
],

// ── Day 15 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'What is the family surname in The Incredibles?', a: 'Parr', d: ['Pine', 'Best', 'Stone'] },
{ c: 'Television', t: 1, q: 'Which series strands the survivors of a plane crash on a mysterious island?', a: 'Lost', d: ['The Leftovers', 'Manifest', 'Yellowjackets'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor voiced Buzz Lightyear in the Toy Story films?', a: 'Tim Allen', d: ['Tom Hanks', 'John Ratzenberger', 'Wallace Shawn'] },
{ c: 'Awards & Box Office', t: 1, q: 'What is a film that fails badly at the box office called?', a: 'A flop', d: ['A sleeper', 'A tentpole', 'A four-quadrant'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which department builds prosthetics and fake wounds for a film?', a: 'Makeup effects', d: ['Art direction', 'Camera', 'Sound design'] },

{ c: 'Movies', t: 2, q: 'In which Los Angeles tower is John McClane trapped in Die Hard?', a: 'Nakatomi Plaza', d: ['The Chrysler Building', 'Century Tower', 'The Grand Hyatt'] },
{ c: 'Television', t: 2, q: "Which series about a Yorkshire veterinary practice is based on James Herriot's books?", a: 'All Creatures Great and Small', d: ['Heartbeat', 'Emmerdale', 'Doc Martin'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Amelie?', a: 'Jean-Pierre Jeunet', d: ['Luc Besson', 'Cedric Klapisch', 'Michel Gondry'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film about newspaper reporters investigating the Catholic Church won Best Picture at the 2016 ceremony?', a: 'Spotlight', d: ['The Revenant', 'The Big Short', 'Room'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which company bought Marvel Entertainment in 2009?', a: 'Disney', d: ['Warner Bros.', 'Sony', 'Universal'] },

{ c: 'Movies', t: 3, q: 'Which army do the condemned soldiers of Paths of Glory belong to?', a: 'The French', d: ['The German', 'The British', 'The Russian'] },
{ c: 'Television', t: 3, q: 'Which series follows a Miami forensic analyst who is secretly a serial killer?', a: 'Dexter', d: ['The Following', 'Hannibal', 'Bates Motel'] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made In the Mood for Love?', a: 'Wong Kar-wai', d: ['Hou Hsiao-hsien', 'Edward Yang', 'Zhang Yimou'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film set partly in Elizabethan theatre won Best Picture at the 1999 ceremony?', a: 'Shakespeare in Love', d: ['Saving Private Ryan', 'Life Is Beautiful', 'Elizabeth'] },
{ c: 'Behind the Scenes', t: 3, q: 'What is a practical effect?', a: 'One achieved on set rather than added afterwards', d: ['One drawn frame by frame', 'A cheaply rendered digital effect', 'A sound created in post'] },

{ c: 'Movies', t: 4, q: 'What is the forbidden territory in Stalker called?', a: 'The Zone', d: ['The Room', 'The Perimeter', 'The Grey Belt'] },
{ c: 'Television', t: 4, q: 'Which 1960s British series paired the bowler-hatted John Steed with a series of partners?', a: 'The Avengers', d: ['The Saint', 'Danger Man', 'The Champions'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor played the silent hitman in Le Samourai?', a: 'Alain Delon', d: ['Jean-Paul Belmondo', 'Lino Ventura', 'Yves Montand'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which director has won the Academy Award for Best Director four times, more than anyone else?', a: 'John Ford', d: ['Frank Capra', 'William Wyler', 'Steven Spielberg'] },
{ c: 'Behind the Scenes', t: 4, q: "Which director's 1985 film was recut by the studio into a version nicknamed the Love Conquers All edit?", a: 'Terry Gilliam', d: ['Ridley Scott', 'Michael Cimino', 'Orson Welles'] },

{ c: 'Movies', t: 5, q: 'Which creature is the central figure of Au Hasard Balthazar?', a: 'A donkey', d: ['A horse', 'A dog', 'A goat'] },
{ c: 'Television', t: 5, q: 'What was the cruise ship in The Love Boat called?', a: 'Pacific Princess', d: ['Island Princess', 'Sun Princess', 'Sea Princess'] },
{ c: 'Actors & Directors', t: 5, q: 'Which Soviet director made Come and See?', a: 'Elem Klimov', d: ['Larisa Shepitko', 'Andrei Konchalovsky', 'Aleksei German'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which musical adapted from a Dickens novel won Best Picture at the 1969 ceremony?', a: 'Oliver!', d: ['Funny Girl', 'The Lion in Winter', 'Romeo and Juliet'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which cinema sound format launched in 1992 with Batman Returns?', a: 'Dolby Digital', d: ['DTS', 'SDDS', 'THX'] },
],

// ── Day 16 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'What does Cinderella leave behind when she flees the ball?', a: 'A glass slipper', d: ['A silk glove', 'A pearl necklace', 'A silver mask'] },
{ c: 'Television', t: 1, q: 'Which cartoon cat and mouse have chased each other for decades with almost no dialogue?', a: 'Tom and Jerry', d: ['Road Runner and Wile E. Coyote', 'Sylvester and Tweety', 'Itchy and Scratchy'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Indiana Jones?', a: 'Harrison Ford', d: ['Tom Selleck', 'Kurt Russell', 'Sam Neill'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which film festival is held each January in Park City, Utah?', a: 'Sundance', d: ['Telluride', 'Tribeca', 'South by Southwest'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which stage of production follows the end of shooting?', a: 'Post-production', d: ['Pre-production', 'Principal photography', 'Development'] },

{ c: 'Movies', t: 2, q: 'What does the boy in The Sixth Sense say he sees?', a: 'Dead people', d: ['The future', 'Ghosts of animals', 'His own death'] },
{ c: 'Television', t: 2, q: 'Which series adapted a comic about survivors of a zombie apocalypse in Georgia?', a: 'The Walking Dead', d: ['Z Nation', 'Black Summer', 'The Last of Us'] },
{ c: 'Actors & Directors', t: 2, q: 'Which actress played Sarah Connor in The Terminator?', a: 'Linda Hamilton', d: ['Sigourney Weaver', 'Jamie Lee Curtis', 'Lea Thompson'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film about a rescue from Tehran won Best Picture at the 2013 ceremony?', a: 'Argo', d: ['Lincoln', 'Life of Pi', 'Zero Dark Thirty'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which studio produced the Looney Tunes shorts?', a: 'Warner Bros.', d: ['MGM', 'Paramount', 'Universal'] },

{ c: 'Movies', t: 3, q: 'Which British officer insists on building the bridge in The Bridge on the River Kwai?', a: 'Colonel Nicholson', d: ['Colonel Saito', 'Commander Shears', 'Major Warden'] },
{ c: 'Television', t: 3, q: 'Which 1970s sitcom spun off from All in the Family and followed a family who moved to a Manhattan high-rise?', a: 'The Jeffersons', d: ['Good Times', 'Sanford and Son', 'Maude'] },
{ c: 'Actors & Directors', t: 3, q: 'Which German director made Fitzcarraldo and Aguirre, the Wrath of God?', a: 'Werner Herzog', d: ['Wim Wenders', 'Rainer Werner Fassbinder', 'Volker Schlondorff'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which Boston crime drama won Best Picture at the 2007 ceremony?', a: 'The Departed', d: ['Little Miss Sunshine', 'Babel', 'The Queen'] },
{ c: 'Behind the Scenes', t: 3, q: 'What does method acting describe?', a: 'Drawing on personal emotion and immersion to build a role', d: ['Rehearsing only on camera', 'Speaking lines exactly as written', 'Improvising all dialogue'] },

{ c: 'Movies', t: 4, q: 'What orbits the planet in Solaris?', a: 'A research station', d: ['A prison ship', 'A cathedral', 'A mining rig'] },
{ c: 'Television', t: 4, q: 'Which drama followed the senior staff of a fictional American president named Josiah Bartlet?', a: 'The West Wing', d: ['Madam Secretary', 'Scandal', 'Commander in Chief'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actress played the title role in the ruinously expensive 1963 epic Cleopatra?', a: 'Elizabeth Taylor', d: ['Ava Gardner', 'Sophia Loren', 'Deborah Kerr'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which Best Picture win at the 2006 ceremony is still argued about as an upset over Brokeback Mountain?', a: 'Crash', d: ['Munich', 'Capote', 'Good Night, and Good Luck'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which effects company did George Lucas found to make the first Star Wars?', a: 'Industrial Light & Magic', d: ['Weta Workshop', 'Digital Domain', 'Rhythm & Hues'] },

{ c: 'Movies', t: 5, q: 'In which city do the street children of Los Olvidados live?', a: 'Mexico City', d: ['Buenos Aires', 'Rio de Janeiro', 'Havana'] },
{ c: 'Television', t: 5, q: 'Which live 1950s anthology series first broadcast Twelve Angry Men?', a: 'Studio One', d: ['Playhouse 90', 'Kraft Television Theatre', 'The Philco Television Playhouse'] },
{ c: 'Actors & Directors', t: 5, q: 'Which eleven year old won a supporting Academy Award for The Piano?', a: 'Anna Paquin', d: ["Tatum O'Neal", 'Mary Badham', 'Quvenzhane Wallis'] },
{ c: 'Awards & Box Office', t: 5, q: 'Beginning with which film year did the Academy widen the Best Picture field beyond five nominees?', a: '2009', d: ['1999', '2005', '2013'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which early 1950s process projected onto a deeply curved screen using three synchronized projectors?', a: 'Cinerama', d: ['CinemaScope', 'VistaVision', 'Todd-AO'] },
],

// ── Day 17 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'What kind of vehicle is Lightning McQueen in Cars?', a: 'A race car', d: ['A tow truck', 'A fire engine', 'A tractor'] },
{ c: 'Television', t: 1, q: 'Which quiz show gave contestants lifelines including a call to a friend?', a: 'Who Wants to Be a Millionaire?', d: ['The Weakest Link', 'Deal or No Deal', 'Jeopardy!'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actress played Vivian in Pretty Woman?', a: 'Julia Roberts', d: ['Meg Ryan', 'Demi Moore', 'Andie MacDowell'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which Academy Award category honors the best film not in the English language?', a: 'Best International Feature Film', d: ['Best Foreign Director', 'Best World Cinema', 'Best Global Picture'] },
{ c: 'Behind the Scenes', t: 1, q: 'Who calls action and cut on a film set?', a: 'The director', d: ['The producer', 'The cinematographer', 'The editor'] },

{ c: 'Movies', t: 2, q: 'What does Chief Brody say they are going to need, on first seeing the shark in Jaws?', a: 'A bigger boat', d: ['More men', 'A stronger cage', 'Better bait'] },
{ c: 'Television', t: 2, q: "Which BBC series moved Conan Doyle's consulting detective into present-day London?", a: 'Sherlock', d: ['Elementary', 'Endeavour', 'Luther'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Boyhood, shooting it over twelve years?', a: 'Richard Linklater', d: ['Kelly Reichardt', 'Andrew Haigh', 'Jeff Nichols'] },
{ c: 'Awards & Box Office', t: 2, q: "Which film about a British monarch's speech therapy won Best Picture at the 2011 ceremony?", a: "The King's Speech", d: ['The Social Network', 'Black Swan', 'Inception'] },
{ c: 'Behind the Scenes', t: 2, q: 'What is stop motion animation?', a: 'Photographing physical models one frame at a time', d: ['Drawing directly onto the film strip', 'Freezing a live-action frame', 'Rendering models inside a computer'] },

{ c: 'Movies', t: 3, q: 'What does the recovered statuette turn out to be made of in The Maltese Falcon?', a: 'Lead', d: ['Gold', 'Jade', 'Ivory'] },
{ c: 'Television', t: 3, q: 'Which sitcom was set at a struggling rock radio station in Ohio?', a: 'WKRP in Cincinnati', d: ['NewsRadio', 'Frasier', 'The Bob Newhart Show'] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made The Battle of Algiers?', a: 'Gillo Pontecorvo', d: ['Francesco Rosi', 'Elio Petri', 'Roberto Rossellini'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which Vietnam film won Best Picture at the 1987 ceremony?', a: 'Platoon', d: ['Hannah and Her Sisters', 'A Room with a View', 'Children of a Lesser God'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which term covers everything arranged within the frame: sets, costume, lighting and blocking?', a: 'Mise-en-scene', d: ['Montage', 'Continuity', 'Coverage'] },

{ c: 'Movies', t: 4, q: 'What does the dying bureaucrat in Ikiru set out to build?', a: "A children's playground", d: ['A hospital wing', 'A school', 'A shrine'] },
{ c: 'Television', t: 4, q: 'Which 1980s series paired the detectives Crockett and Tubbs in Florida?', a: 'Miami Vice', d: ['Hunter', 'Hill Street Blues', 'Simon & Simon'] },
{ c: 'Actors & Directors', t: 4, q: 'Which director made Rome, Open City?', a: 'Roberto Rossellini', d: ['Vittorio De Sica', 'Luchino Visconti', 'Giuseppe De Santis'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which musical about a Cockney flower seller won Best Picture at the 1965 ceremony?', a: 'My Fair Lady', d: ['Mary Poppins', 'Dr. Strangelove', 'Zorba the Greek'] },
{ c: 'Behind the Scenes', t: 4, q: 'What is a platform release?', a: 'Opening in a few cinemas first and widening if it works', d: ['Opening everywhere on the same day', 'Renting a cinema outright', 'Touring with reserved seats'] },

{ c: 'Movies', t: 5, q: 'What dominates the visual style of The Passion of Joan of Arc?', a: 'Close-ups of faces', d: ['Long tracking shots', 'Deep-focus wide shots', 'Handheld camera'] },
{ c: 'Television', t: 5, q: 'Which 1960s spy series pitted its agents against an organization called THRUSH?', a: 'The Man from U.N.C.L.E.', d: ['Get Smart', 'I Spy', 'Mission: Impossible'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actress starred in Jeanne Dielman?', a: 'Delphine Seyrig', d: ['Anna Karina', 'Bulle Ogier', 'Stephane Audran'] },
{ c: 'Awards & Box Office', t: 5, q: 'Who became the first performer to win Best Actress for a role played in another language?', a: 'Sophia Loren', d: ['Anna Magnani', 'Simone Signoret', 'Marion Cotillard'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which company created the THX cinema certification standard in 1983?', a: 'Lucasfilm', d: ['Dolby', 'Sony', 'IMAX'] },
],

// ── Day 18 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'What lifts the house into the sky in Up?', a: 'Balloons', d: ['A crane', 'A hot air burner', 'A tornado'] },
{ c: 'Television', t: 1, q: 'Which variety series starred Kermit the Frog and Miss Piggy?', a: 'The Muppet Show', d: ['Sesame Street', 'Fraggle Rock', 'Bear in the Big Blue House'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Thor in the Marvel films?', a: 'Chris Hemsworth', d: ['Chris Evans', 'Chris Pratt', 'Tom Hiddleston'] },
{ c: 'Awards & Box Office', t: 1, q: 'What is the top prize at the Venice Film Festival called?', a: 'The Golden Lion', d: ['The Golden Bear', "The Palme d'Or", 'The Silver Shell'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which document sets out every scene, line and action before a film is shot?', a: 'The screenplay', d: ['The call sheet', 'The shot list', 'The continuity report'] },

{ c: 'Movies', t: 2, q: 'Which character tells Luke there is no try, only do or do not?', a: 'Yoda', d: ['Obi-Wan Kenobi', 'Darth Vader', 'Han Solo'] },
{ c: 'Television', t: 2, q: 'Which series follows the Dutton family and their Montana ranch?', a: 'Yellowstone', d: ['Longmire', 'Justified', 'Hell on Wheels'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Black Swan and Requiem for a Dream?', a: 'Darren Aronofsky', d: ['David Fincher', 'Gaspar Noe', 'Nicolas Winding Refn'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film about people living out of vans won Best Picture at the 2021 ceremony?', a: 'Nomadland', d: ['The Trial of the Chicago 7', 'Minari', 'Mank'] },
{ c: 'Behind the Scenes', t: 2, q: 'What does IMAX primarily describe?', a: 'A large-format film and projection system', d: ['A digital sound format', 'A camera manufacturer', 'A color grading process'] },

{ c: 'Movies', t: 3, q: 'What triggers the brainwashed soldier in The Manchurian Candidate?', a: 'The queen of diamonds playing card', d: ['A telephone ringing', 'A particular song', 'A red scarf'] },
{ c: 'Television', t: 3, q: 'Which British comedy followed a minister and his obstructive permanent secretary in Whitehall?', a: 'Yes Minister', d: ['The Thick of It', 'Drop the Dead Donkey', 'The New Statesman'] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made The Magnificent Seven, the western remake of Seven Samurai?', a: 'John Sturges', d: ['Howard Hawks', 'Delmer Daves', 'Budd Boetticher'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film set on a colonial Kenyan coffee farm won Best Picture at the 1986 ceremony?', a: 'Out of Africa', d: ['The Color Purple', 'Witness', "Prizzi's Honor"] },
{ c: 'Behind the Scenes', t: 3, q: 'What is the Academy ratio?', a: 'The roughly four by three frame standard of classic Hollywood', d: ['The ratio of nominees to winners', 'The share of takings paid to cinemas', 'The ratio of footage shot to footage used'] },

{ c: 'Movies', t: 4, q: 'What is the profession of the title character in Nights of Cabiria?', a: 'A prostitute', d: ['A dancer', 'A seamstress', 'A market trader'] },
{ c: 'Television', t: 4, q: 'Which series was set in a womens prison called Litchfield?', a: 'Orange Is the New Black', d: ['Oz', 'Wentworth', 'Prison Break'] },
{ c: 'Actors & Directors', t: 4, q: 'Chaplin plays the dictator in The Great Dictator, and which other role?', a: 'A Jewish barber', d: ['A newsreel narrator', 'A field marshal', 'An ambassador'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film about prisoners of war in Burma won Best Picture at the 1958 ceremony?', a: 'The Bridge on the River Kwai', d: ['Peyton Place', 'Sayonara', 'Witness for the Prosecution'] },
{ c: 'Behind the Scenes', t: 4, q: "Which composer wrote the scores for Star Wars, Jaws and Schindler's List?", a: 'John Williams', d: ['Jerry Goldsmith', 'James Horner', 'Ennio Morricone'] },

{ c: 'Movies', t: 5, q: 'Which war separates the lovers in The Cranes Are Flying?', a: 'The Second World War', d: ['The Russian Civil War', 'The First World War', 'The Crimean War'] },
{ c: 'Television', t: 5, q: "Which 1963 British series opened with two teachers following a pupil into a junkyard?", a: 'Doctor Who', d: ['The Quatermass Experiment', 'A for Andromeda', 'Out of the Unknown'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director made Wings of Desire?', a: 'Wim Wenders', d: ['Werner Herzog', 'Rainer Werner Fassbinder', 'Margarethe von Trotta'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which Jean Renoir film was the first in a language other than English nominated for Best Picture?', a: 'Grand Illusion', d: ['Bicycle Thieves', 'Z', 'Cries and Whispers'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which newspaper magnate tried to have Citizen Kane suppressed before release?', a: 'William Randolph Hearst', d: ['Joseph Pulitzer', 'Robert McCormick', 'Henry Luce'] },
],

// ── Day 19 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'Which animal dreams of becoming a chef in Ratatouille?', a: 'A rat', d: ['A mouse', 'A raccoon', 'A hedgehog'] },
{ c: 'Television', t: 1, q: 'Which singing competition did Simon Cowell judge from its 2002 debut, alongside Paula Abdul and Randy Jackson?', a: 'American Idol', d: ['The Voice', 'The X Factor', 'Star Search'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Jack Dawson in Titanic?', a: 'Leonardo DiCaprio', d: ['Matt Damon', 'Brad Pitt', 'Ben Affleck'] },
{ c: 'Awards & Box Office', t: 1, q: 'What is it called when a film opens in cinemas and on streaming the same day?', a: 'A day-and-date release', d: ['A platform release', 'A limited release', 'A road show'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which crew member assembles the footage into the finished film?', a: 'The editor', d: ['The gaffer', 'The grip', 'The producer'] },

{ c: 'Movies', t: 2, q: 'Which Corleone son is gunned down at a highway toll booth in The Godfather?', a: 'Sonny', d: ['Fredo', 'Michael', 'Tom Hagen'] },
{ c: 'Television', t: 2, q: "Which comedy follows the awful owners of a Philadelphia bar called Paddy's Pub?", a: "It's Always Sunny in Philadelphia", d: ['Cheers', 'Brooklyn Nine-Nine', 'The League'] },
{ c: 'Actors & Directors', t: 2, q: 'Which actress won an Academy Award for Monster?', a: 'Charlize Theron', d: ['Naomi Watts', 'Diane Lane', 'Salma Hayek'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film about a mute cleaner and an amphibian creature won Best Picture at the 2018 ceremony?', a: 'The Shape of Water', d: ['Three Billboards Outside Ebbing, Missouri', 'Get Out', 'Dunkirk'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which streaming service released Roma, its first Best Picture nominee?', a: 'Netflix', d: ['Amazon Prime Video', 'Hulu', 'Apple TV+'] },

{ c: 'Movies', t: 3, q: 'Which business is at the center of the conflict in Do the Right Thing?', a: 'A pizzeria', d: ['A grocery store', 'A barber shop', 'A laundromat'] },
{ c: 'Television', t: 3, q: 'Which medical drama set in a Chicago emergency room ran for fifteen seasons from 1994?', a: 'ER', d: ['Chicago Hope', 'St. Elsewhere', "Grey's Anatomy"] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made Umberto D. and Bicycle Thieves?', a: 'Vittorio De Sica', d: ['Roberto Rossellini', 'Luchino Visconti', 'Cesare Zavattini'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about a New York narcotics detective won Best Picture at the 1972 ceremony?', a: 'The French Connection', d: ['A Clockwork Orange', 'The Last Picture Show', 'Fiddler on the Roof'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which crew member runs the set day to day and keeps the shooting schedule?', a: 'The first assistant director', d: ['The line producer', 'The unit publicist', 'The script supervisor'] },

{ c: 'Movies', t: 4, q: 'Which art form consumes the heroine of The Red Shoes?', a: 'Ballet', d: ['Opera', 'Painting', 'The violin'] },
{ c: 'Television', t: 4, q: 'Which HBO series followed a family who ran a funeral home?', a: 'Six Feet Under', d: ['Big Love', 'In Treatment', 'Enlightened'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor directed and starred in The Two Jakes, the sequel to Chinatown?', a: 'Jack Nicholson', d: ['Robert Towne', 'Warren Beatty', 'Harvey Keitel'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film set partly in the North African desert won Best Picture at the 1997 ceremony?', a: 'The English Patient', d: ['Fargo', 'Jerry Maguire', 'Shine'] },
{ c: 'Behind the Scenes', t: 4, q: 'What is a plate in visual effects work?', a: 'Background footage that other elements are composited onto', d: ['A board naming the take', 'A reel of assembled dailies', 'A printed frame used for reference'] },

{ c: 'Movies', t: 5, q: 'In which Indian region is the village of Pather Panchali set?', a: 'Bengal', d: ['Kerala', 'Punjab', 'Rajasthan'] },
{ c: 'Television', t: 5, q: 'Which series gave the world the phrase about jumping the shark?', a: 'Happy Days', d: ['Laverne & Shirley', 'Mork & Mindy', "Three's Company"] },
{ c: 'Actors & Directors', t: 5, q: 'Which actress starred in Jules and Jim?', a: 'Jeanne Moreau', d: ['Anna Karina', 'Delphine Seyrig', 'Emmanuelle Riva'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which Billy Wilder film about an alcoholic writer won Best Picture at the 1946 ceremony?', a: 'The Lost Weekend', d: ["The Bells of St. Mary's", 'Mildred Pierce', 'Spellbound'] },
{ c: 'Behind the Scenes', t: 5, q: "Which Abel Gance silent epic did Kevin Brownlow spend decades restoring?", a: 'Napoleon', d: ['Metropolis', 'Intolerance', 'Greed'] },
],

// ── Day 20 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'What do the monsters harvest from children at the start of Monsters, Inc.?', a: 'Screams', d: ['Laughter', 'Dreams', 'Memories'] },
{ c: 'Television', t: 1, q: 'Which sitcom followed the awful Bundy family of Chicago?', a: 'Married... with Children', d: ['Roseanne', 'The Simpsons', 'Family Matters'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actress played Mary Poppins in the 1964 film?', a: 'Julie Andrews', d: ['Audrey Hepburn', 'Debbie Reynolds', 'Angela Lansbury'] },
{ c: 'Awards & Box Office', t: 1, q: "What is the trade term for a film's earnings from cinemas outside its home country?", a: 'The international gross', d: ['The net rental', 'The theatrical spend', 'The residual'] },
{ c: 'Behind the Scenes', t: 1, q: 'What does a stunt double do?', a: "Takes the actor's place in dangerous shots", d: ['Stands in during rehearsal only', 'Operates a second camera', 'Records dialogue in post'] },

{ c: 'Movies', t: 2, q: 'Which candy does Elliott use to lure the alien in E.T.?', a: "Reese's Pieces", d: ["M&M's", 'Skittles', 'Smarties'] },
{ c: 'Television', t: 2, q: 'Which series follows the Pearson family across several decades at once?', a: 'This Is Us', d: ['Parenthood', 'Brothers & Sisters', 'Friday Night Lights'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Arrival and Blade Runner 2049?', a: 'Denis Villeneuve', d: ['Christopher Nolan', 'Alex Garland', 'Duncan Jones'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film built to look like one continuous take won Best Picture at the 2015 ceremony?', a: 'Birdman', d: ['Boyhood', 'The Grand Budapest Hotel', 'Whiplash'] },
{ c: 'Behind the Scenes', t: 2, q: "Which country's Hindi-language film industry is nicknamed Bollywood?", a: 'India', d: ['Nigeria', 'Pakistan', 'Brazil'] },

{ c: 'Movies', t: 3, q: 'What is celebrated about the opening of Touch of Evil?', a: 'A long unbroken crane shot', d: ['A silent montage', 'A freeze frame', 'A split screen'] },
{ c: 'Television', t: 3, q: 'Which detective series followed an Oxford policeman fond of opera, crosswords and real ale?', a: 'Inspector Morse', d: ['A Touch of Frost', 'Midsomer Murders', 'Bergerac'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor starred as the chain gang prisoner in Cool Hand Luke?', a: 'Paul Newman', d: ['Steve McQueen', 'George Kennedy', 'Robert Redford'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about veterans from a Pennsylvania steel town won Best Picture at the 1979 ceremony?', a: 'The Deer Hunter', d: ['Coming Home', 'Midnight Express', 'Heaven Can Wait'] },
{ c: 'Behind the Scenes', t: 3, q: 'What is a boom operator responsible for?', a: 'Holding the microphone just out of frame', d: ['Working the camera crane', 'Rigging the lights', 'Laying dolly track'] },

{ c: 'Movies', t: 4, q: 'What is the profession of the woman being investigated in Klute?', a: 'A call girl', d: ['A nurse', 'A flight attendant', 'A fashion model'] },
{ c: 'Television', t: 4, q: 'Which 2004 remake followed the last survivors of a nuclear attack fleeing the Cylons?', a: 'Battlestar Galactica', d: ['Caprica', 'Firefly', 'Stargate Universe'] },
{ c: 'Actors & Directors', t: 4, q: 'Which Austrian director made The Seventh Continent and Amour?', a: 'Michael Haneke', d: ['Ulrich Seidl', 'Christian Petzold', 'Jessica Hausner'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film about Mozart and his jealous rival won Best Picture at the 1985 ceremony?', a: 'Amadeus', d: ['The Killing Fields', 'A Passage to India', 'Places in the Heart'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which union strike shut down American film and television production across the 2007 and 2008 season?', a: 'The Writers Guild strike', d: ['The Teamsters strike', 'The Screen Actors Guild strike', 'The Directors Guild strike'] },

{ c: 'Movies', t: 5, q: 'Which country did Carl Theodor Dreyer, the director of Vampyr, come from?', a: 'Denmark', d: ['Sweden', 'Norway', 'Germany'] },
{ c: 'Television', t: 5, q: 'Which 1980s British drama followed a gang of bricklayers working in Germany?', a: 'Auf Wiedersehen, Pet', d: ['Boys from the Blackstuff', 'Minder', 'The Beiderbecke Affair'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actor appeared in film after film for Yasujiro Ozu, including Tokyo Story?', a: 'Chishu Ryu', d: ['Toshiro Mifune', 'Takashi Shimura', 'Masayuki Mori'] },
{ c: 'Awards & Box Office', t: 5, q: 'How many Academy Awards did Citizen Kane win?', a: 'One', d: ['Two', 'Four', 'Nine'] },
{ c: 'Behind the Scenes', t: 5, q: 'What was a nickelodeon?', a: 'An early storefront cinema charging five cents', d: ["A studio's private screening room", 'A hand-cranked home projector', 'A theater organ'] },
],

// ── Day 21 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "In Disney's The Little Mermaid, what does Ariel trade away to become human?", a: 'Her voice', d: ['Her hair', 'Her memories', 'Her name'] },
{ c: 'Television', t: 1, q: 'Which preschool series features an animated puppy and a host who hunts for paw prints?', a: "Blue's Clues", d: ['Dora the Explorer', 'Bear in the Big Blue House', 'Barney & Friends'] },
{ c: 'Actors & Directors', t: 1, q: "Which actor played Batman in Tim Burton's 1989 film?", a: 'Michael Keaton', d: ['Val Kilmer', 'George Clooney', 'Christian Bale'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which Academy Award category honors the person who photographed the film?', a: 'Best Cinematography', d: ['Best Production Design', 'Best Film Editing', 'Best Visual Effects'] },
{ c: 'Behind the Scenes', t: 1, q: 'What is a reboot of a film series?', a: 'A fresh start that sets aside the earlier continuity', d: ['A shot-for-shot copy', 'A re-release in a new format', 'A sequel set immediately after'] },

{ c: 'Movies', t: 2, q: "What does Forrest Gump's mother compare life to?", a: 'A box of chocolates', d: ['A long road', 'A river', 'A game of cards'] },
{ c: 'Television', t: 2, q: 'Which sitcom followed a New York stand-up comedian and his friends and was famously about nothing?', a: 'Seinfeld', d: ['Curb Your Enthusiasm', 'Louie', 'Mad About You'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made There Will Be Blood and Boogie Nights?', a: 'Paul Thomas Anderson', d: ['Wes Anderson', 'Alexander Payne', 'Todd Haynes'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which adaptation of a Cormac McCarthy novel won Best Picture at the 2008 ceremony?', a: 'No Country for Old Men', d: ['There Will Be Blood', 'Michael Clayton', 'Atonement'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which piece of equipment lets a camera glide smoothly along laid track?', a: 'A dolly', d: ['A jib', 'A gimbal', 'A crane'] },

{ c: 'Movies', t: 3, q: 'What is Eve Harrington after in All About Eve?', a: 'The place of an ageing stage star', d: ['A marriage to a producer', 'A directing job', 'A contract at the Met'] },
{ c: 'Television', t: 3, q: 'Which Happy Days spin-off followed two women working at a Milwaukee brewery?', a: 'Laverne & Shirley', d: ['Mork & Mindy', 'Joanie Loves Chachi', 'Alice'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actress won Academy Awards for both Klute and Coming Home?', a: 'Jane Fonda', d: ['Faye Dunaway', 'Ellen Burstyn', 'Glenda Jackson'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about a Philadelphia boxer won Best Picture at the 1977 ceremony?', a: 'Rocky', d: ['Taxi Driver', 'Network', "All the President's Men"] },
{ c: 'Behind the Scenes', t: 3, q: 'Which single-strip color process displaced three-strip Technicolor in the 1950s?', a: 'Eastmancolor', d: ['Agfacolor', 'Cinecolor', 'Trucolor'] },

{ c: 'Movies', t: 4, q: "What is tattooed across the preacher's knuckles in The Night of the Hunter?", a: 'LOVE and HATE', d: ['GOOD and EVIL', 'LIFE and DEATH', 'HOPE and FEAR'] },
{ c: 'Television', t: 4, q: 'Which anthology series tells a different Minnesota crime story each season, taking its name from a Coen brothers film?', a: 'Fargo', d: ['True Detective', 'American Crime Story', 'Mindhunter'] },
{ c: 'Actors & Directors', t: 4, q: 'Which Danish director made The Passion of Joan of Arc?', a: 'Carl Theodor Dreyer', d: ['Victor Sjostrom', 'Abel Gance', 'Jean Epstein'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film about T. E. Lawrence won Best Picture at the 1963 ceremony?', a: 'Lawrence of Arabia', d: ['To Kill a Mockingbird', 'The Music Man', 'Mutiny on the Bounty'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which sound man coined the job title sound designer while working on Apocalypse Now?', a: 'Walter Murch', d: ['Ben Burtt', 'Gary Rydstrom', 'Randy Thom'] },

{ c: 'Movies', t: 5, q: 'What fate are the children sold into in Sansho the Bailiff?', a: 'Slavery', d: ['The army', 'A monastery', 'An arranged marriage'] },
{ c: 'Television', t: 5, q: 'Which American sitcom was adapted from the British series Till Death Us Do Part?', a: 'All in the Family', d: ['Sanford and Son', "Three's Company", 'Too Close for Comfort'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actor played the title role in Eisenstein’s Ivan the Terrible?', a: 'Nikolai Cherkasov', d: ['Boris Andreyev', 'Mikhail Zharov', 'Andrei Abrikosov'] },
{ c: 'Awards & Box Office', t: 5, q: 'In which year was the Academy Awards ceremony first broadcast in color?', a: '1966', d: ['1959', '1971', '1975'] },
{ c: 'Behind the Scenes', t: 5, q: 'What was block booking?', a: 'Forcing cinemas to take a bundle of films to get the one they wanted', d: ['Selling advance tickets in blocks', "Reserving a studio's stages", 'Signing actors for several films at once'] },
],

// ── Day 22 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "Which animal is Shrek's talkative travelling companion?", a: 'A donkey', d: ['A cat', 'A dragon', 'A gingerbread man'] },
{ c: 'Television', t: 1, q: 'Which comedy follows a once wealthy family who lose everything and move to a small town they bought as a joke?', a: "Schitt's Creek", d: ["Kim's Convenience", 'Corner Gas', 'Letterkenny'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actress played Dorothy in The Wizard of Oz?', a: 'Judy Garland', d: ['Shirley Temple', 'Deanna Durbin', 'Jane Powell'] },
{ c: 'Awards & Box Office', t: 1, q: 'What color is the carpet traditionally rolled out for arrivals at the Academy Awards?', a: 'Red', d: ['Gold', 'Blue', 'Black'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which department is responsible for a film’s sets, props and dressing?', a: 'The art department', d: ['Camera', 'Sound', 'Locations'] },

{ c: 'Movies', t: 2, q: "What name is written on the bottom of Woody's boot in Toy Story?", a: 'Andy', d: ['Sid', 'Buzz', 'Bo'] },
{ c: 'Television', t: 2, q: 'Which HBO series adapted the novels of George R. R. Martin?', a: 'Game of Thrones', d: ['The Witcher', 'Shadow and Bone', 'The Wheel of Time'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Roma and Gravity?', a: 'Alfonso Cuaron', d: ['Guillermo del Toro', 'Alejandro G. Inarritu', 'Carlos Reygadas'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film about the physicist who led the Manhattan Project won Best Picture at the 2024 ceremony?', a: 'Oppenheimer', d: ['Barbie', 'Killers of the Flower Moon', 'Poor Things'] },
{ c: 'Behind the Scenes', t: 2, q: 'What is the work of performing a character’s lines for an animated film called?', a: 'Voice acting', d: ['Dubbing', 'Looping', 'Playback'] },

{ c: 'Movies', t: 3, q: 'What does the insurance clerk in The Apartment get in return for lending out his home?', a: 'Promotions at work', d: ['Cash payments', 'A company car', 'A share of the rent'] },
{ c: 'Television', t: 3, q: 'Which British sitcom followed two brothers selling dodgy goods out of a Peckham flat?', a: 'Only Fools and Horses', d: ['Steptoe and Son', 'Minder', 'Birds of a Feather'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actress won Best Actress for Silver Linings Playbook?', a: 'Jennifer Lawrence', d: ['Emma Stone', 'Anne Hathaway', 'Amy Adams'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about the Indian independence leader won Best Picture at the 1983 ceremony?', a: 'Gandhi', d: ['E.T. the Extra-Terrestrial', 'Tootsie', 'The Verdict'] },
{ c: 'Behind the Scenes', t: 3, q: 'What is a second unit?', a: 'A crew filming inserts, stunts and scenery apart from the main shoot', d: ['The editing team', 'The publicity department', 'The understudy cast'] },

{ c: 'Movies', t: 4, q: 'Where do the outlaws flee to in The Wild Bunch?', a: 'Into Mexico', d: ['Into Canada', 'Into Bolivia', 'Into Cuba'] },
{ c: 'Television', t: 4, q: 'Which 1971 series followed the Bellamy family and their servants at 165 Eaton Place?', a: 'Upstairs, Downstairs', d: ['The Duchess of Duke Street', 'The Forsyte Saga', 'The Pallisers'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor played the Man with No Name in the Sergio Leone dollars trilogy?', a: 'Clint Eastwood', d: ['Lee Van Cleef', 'Charles Bronson', 'Franco Nero'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which biography of a wartime American general won Best Picture at the 1971 ceremony?', a: 'Patton', d: ['Airport', 'Love Story', 'Five Easy Pieces'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which 1995 manifesto banned added lighting, imported props and non-diegetic music?', a: 'Dogme 95', d: ['Italian neorealism', 'The French New Wave', 'Cinema Novo'] },

{ c: 'Movies', t: 5, q: 'Which tinned fruit does the lovesick policeman keep buying in Chungking Express?', a: 'Pineapple', d: ['Peaches', 'Lychees', 'Mandarins'] },
{ c: 'Television', t: 5, q: 'Which Gerry Anderson puppet series followed the Tracy brothers and International Rescue?', a: 'Thunderbirds', d: ['Stingray', 'Captain Scarlet', 'Joe 90'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director made Ugetsu and Sansho the Bailiff?', a: 'Kenji Mizoguchi', d: ['Yasujiro Ozu', 'Mikio Naruse', 'Masaki Kobayashi'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which was the last largely black and white film to win Best Picture before The Artist?', a: "Schindler's List", d: ['The Apartment', 'Manhattan', 'Raging Bull'] },
{ c: 'Behind the Scenes', t: 5, q: 'What was the Motion Picture Patents Company, formed in 1908?', a: 'A trust controlling film patents and distribution', d: ['The first talent agency', 'A national cinema chain', 'A censorship board'] },
],

// ── Day 23 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "How many wishes does the Genie grant in Disney's Aladdin?", a: 'Three', d: ['Two', 'Five', 'Seven'] },
{ c: 'Television', t: 1, q: 'Which animated series is set in the undersea town of Bikini Bottom?', a: 'SpongeBob SquarePants', d: ['The Fairly OddParents', 'Rugrats', "Hey Arnold!"] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Marty McFly in Back to the Future?', a: 'Michael J. Fox', d: ['Eric Stoltz', 'Crispin Glover', 'Corey Feldman'] },
{ c: 'Awards & Box Office', t: 1, q: 'What is a film that quietly becomes a hit long after opening called?', a: 'A sleeper', d: ['A tentpole', 'A flop', 'A four-quadrant'] },
{ c: 'Behind the Scenes', t: 1, q: 'Which crew member keeps track of continuity between shots?', a: 'The script supervisor', d: ['The gaffer', 'The best boy', 'The location manager'] },

{ c: 'Movies', t: 2, q: 'Which island town is terrorised in Jaws?', a: 'Amity', d: ['Nantucket', 'Innsmouth', 'Provincetown'] },
{ c: 'Television', t: 2, q: 'Which series followed FBI agents Fox Mulder and Dana Scully investigating the paranormal?', a: 'The X-Files', d: ['Fringe', 'Warehouse 13', 'Millennium'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Moonlight?', a: 'Barry Jenkins', d: ['Jordan Peele', 'Ryan Coogler', 'Steve McQueen'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film won Best Picture at the 2023 ceremony?', a: 'Everything Everywhere All at Once', d: ['All Quiet on the Western Front', 'The Banshees of Inisherin', 'Top Gun: Maverick'] },
{ c: 'Behind the Scenes', t: 2, q: 'Whose water tower is the landmark of a famous Burbank studio lot?', a: 'Warner Bros.', d: ['Paramount', 'Universal', 'Sony'] },

{ c: 'Movies', t: 3, q: 'What is the profession of Joe Gillis in Sunset Boulevard?', a: 'A screenwriter', d: ['A studio publicist', 'A cameraman', 'A stunt man'] },
{ c: 'Television', t: 3, q: 'Which series followed a Manhattan sex columnist and her three friends?', a: 'Sex and the City', d: ['Girls', 'Younger', 'Ally McBeal'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor played Hannibal Lecter in Manhunter, five years before The Silence of the Lambs?', a: 'Brian Cox', d: ['Anthony Hopkins', 'Mads Mikkelsen', 'Gary Oldman'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about a Tudor lord chancellor won Best Picture at the 1967 ceremony?', a: 'A Man for All Seasons', d: ["Who's Afraid of Virginia Woolf?", 'The Sand Pebbles', 'Alfie'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which editing technique cuts between two lines of action to build tension?', a: 'Cross-cutting', d: ['Jump cutting', 'Match cutting', 'Dissolving'] },

{ c: 'Movies', t: 4, q: 'What does the last shot of The 400 Blows freeze on?', a: "The boy's face at the sea", d: ['A burning school', 'A prison gate', 'A moving train'] },
{ c: 'Television', t: 4, q: 'Which HBO comedy follows a fictionalised version of a Seinfeld co-creator?', a: 'Curb Your Enthusiasm', d: ['Louie', 'Extras', 'Episodes'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actress won Best Actress in a Leading Role for A Streetcar Named Desire?', a: 'Vivien Leigh', d: ['Kim Hunter', 'Bette Davis', 'Shelley Winters'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film about a neurotic New York comedian and his girlfriend won Best Picture at the 1978 ceremony?', a: 'Annie Hall', d: ['Star Wars', 'The Goodbye Girl', 'Julia'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which 1967 crime film is usually taken as the opening of the New Hollywood era?', a: 'Bonnie and Clyde', d: ['The Graduate', 'Easy Rider', 'Point Blank'] },

{ c: 'Movies', t: 5, q: "Where is Jean Vigo's L'Atalante set?", a: 'On a river barge', d: ['In a travelling circus', 'In a textile mill', 'In a lighthouse'] },
{ c: 'Television', t: 5, q: 'Which British series broadcast its first episode the day after the assassination of John F. Kennedy?', a: 'Doctor Who', d: ['The Avengers', 'Danger Man', 'Coronation Street'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actor played Jedediah Leland in Citizen Kane?', a: 'Joseph Cotten', d: ['Everett Sloane', 'Ray Collins', 'Paul Stewart'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which film was the first sound picture to win the top Academy Award?', a: 'The Broadway Melody', d: ['All Quiet on the Western Front', 'Cimarron', 'Grand Hotel'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which studio first licensed its films for sale on videocassette to the public, in 1977?', a: '20th Century Fox', d: ['Warner Bros.', 'Paramount', 'Universal'] },
],

// ── Day 24 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'How many dwarfs take in Snow White?', a: 'Seven', d: ['Five', 'Six', 'Eight'] },
{ c: 'Television', t: 1, q: 'Which BBC competition pairs celebrities with professional ballroom dancers?', a: 'Strictly Come Dancing', d: ['Dancing on Ice', 'So You Think You Can Dance', 'The Voice'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Morpheus in The Matrix?', a: 'Laurence Fishburne', d: ['Hugo Weaving', 'Wesley Snipes', 'Samuel L. Jackson'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which awards are known as the BAFTAs?', a: 'The British Academy Film Awards', d: ['The Cesar Awards', 'The Goya Awards', 'The David di Donatello Awards'] },
{ c: 'Behind the Scenes', t: 1, q: "What does a film's runtime measure?", a: 'How long it lasts', d: ['How long it took to shoot', 'How long it stays in cinemas', 'How much it cost'] },

{ c: 'Movies', t: 2, q: 'What does Hakuna Matata mean in The Lion King?', a: 'No worries', d: ['Long live the king', 'The circle of life', 'Welcome home'] },
{ c: 'Television', t: 2, q: 'Which sitcom followed four socially awkward scientists and their neighbour Penny?', a: 'The Big Bang Theory', d: ['Young Sheldon', 'Community', 'Silicon Valley'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made The Good, the Bad and the Ugly?', a: 'Sergio Leone', d: ['Sergio Corbucci', 'Duccio Tessari', 'Enzo Barboni'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which Scottish historical epic won Best Picture at the 1996 ceremony?', a: 'Braveheart', d: ['Apollo 13', 'Babe', 'Sense and Sensibility'] },
{ c: 'Behind the Scenes', t: 2, q: 'What is a shot taken from a helicopter or drone called?', a: 'An aerial shot', d: ['A dolly shot', 'A rack focus', 'A whip pan'] },

{ c: 'Movies', t: 3, q: 'What do the prisoners name their three tunnels in The Great Escape?', a: 'Tom, Dick and Harry', d: ['Faith, Hope and Charity', 'North, South and East', 'Alpha, Bravo and Charlie'] },
{ c: 'Television', t: 3, q: 'Which rumpled detective in a raincoat solved crimes the audience had already watched being committed?', a: 'Columbo', d: ['Kojak', 'Ironside', 'McCloud'] },
{ c: 'Actors & Directors', t: 3, q: 'Which director made Bringing Up Baby and His Girl Friday?', a: 'Howard Hawks', d: ['Leo McCarey', 'George Cukor', 'Preston Sturges'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about British runners at the Olympics won Best Picture at the 1982 ceremony?', a: 'Chariots of Fire', d: ['Reds', 'Atlantic City', 'On Golden Pond'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which studio did Adolph Zukor build?', a: 'Paramount', d: ['MGM', 'Warner Bros.', 'Universal'] },

{ c: 'Movies', t: 4, q: 'Roughly how long is the wordless heist sequence at the center of Rififi?', a: 'About half an hour', d: ['About five minutes', 'About an hour', 'About ten minutes'] },
{ c: 'Television', t: 4, q: "Which series used the instrumental theme known as 'Suicide Is Painless'?", a: 'M*A*S*H', d: ['China Beach', "Hogan's Heroes", 'Combat!'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor played Rhett Butler in Gone with the Wind?', a: 'Clark Gable', d: ['Errol Flynn', 'Gary Cooper', 'Cary Grant'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which bawdy adaptation of a Henry Fielding novel won Best Picture at the 1964 ceremony?', a: 'Tom Jones', d: ['Cleopatra', 'How the West Was Won', 'Lilies of the Field'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which editing device, popularised by Breathless, deliberately breaks the sense of continuous time?', a: 'The jump cut', d: ['The match cut', 'The wipe', 'The iris'] },

{ c: 'Movies', t: 5, q: 'Which illness afflicts the priest in Diary of a Country Priest?', a: 'Stomach cancer', d: ['Tuberculosis', 'Typhus', 'Pneumonia'] },
{ c: 'Television', t: 5, q: 'Which 1968 series was among the first to give a Black actress a leading role outside domestic service?', a: 'Julia', d: ['I Spy', 'Room 222', 'The Mod Squad'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director made Los Olvidados and Belle de Jour?', a: 'Luis Bunuel', d: ['Carlos Saura', 'Juan Antonio Bardem', 'Marco Ferreri'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which playwright won both a Nobel Prize in Literature and an Academy Award for screenwriting?', a: 'George Bernard Shaw', d: ['Rudyard Kipling', 'T. S. Eliot', 'W. B. Yeats'] },
{ c: 'Behind the Scenes', t: 5, q: 'In which Paris venue did the Lumiere brothers hold their first paying public screening?', a: 'The Salon Indien du Grand Cafe', d: ['The Theatre Robert-Houdin', 'The Folies Bergere', 'The Moulin Rouge'] },
],

// ── Day 25 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "In Disney's Moana, what does the heroine set out across to complete her quest?", a: 'The ocean', d: ['A desert', 'A mountain range', 'A frozen tundra'] },
{ c: 'Television', t: 1, q: 'Which medical drama starred a brilliant, misanthropic diagnostician who walked with a cane?', a: 'House', d: ['Scrubs', 'ER', 'The Good Doctor'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Willy Wonka in the 1971 film?', a: 'Gene Wilder', d: ['Johnny Depp', 'Peter Sellers', 'Dick Van Dyke'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which Academy Award category rewards a script drawn from an existing book or play?', a: 'Best Adapted Screenplay', d: ['Best Original Screenplay', 'Best Story', 'Best Literary Achievement'] },
{ c: 'Behind the Scenes', t: 1, q: 'What is a theatrical release?', a: 'A film released to cinemas', d: ['A first episode made to sell a series', 'A filmed stage play', 'A short shown before the feature'] },

{ c: 'Movies', t: 2, q: 'What does the Tin Man ask the Wizard for in The Wizard of Oz?', a: 'A heart', d: ['A brain', 'Courage', 'A way home'] },
{ c: 'Television', t: 2, q: 'Which long-running procedural follows a Manhattan squad handling sex crimes?', a: 'Law & Order: Special Victims Unit', d: ['NYPD Blue', 'Criminal Minds', 'CSI: NY'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made 12 Years a Slave and Shame?', a: 'Steve McQueen', d: ['Barry Jenkins', 'John Singleton', 'Ava DuVernay'] },
{ c: 'Awards & Box Office', t: 2, q: "Which film about a mathematician's schizophrenia won Best Picture at the 2002 ceremony?", a: 'A Beautiful Mind', d: ['Gosford Park', 'Moulin Rouge!', 'In the Bedroom'] },
{ c: 'Behind the Scenes', t: 2, q: 'What is a sound stage?', a: 'A soundproofed building used for filming', d: ['A concert venue on a studio lot', 'A booth for recording dialogue', 'An open-air standing set'] },

{ c: 'Movies', t: 3, q: 'What divides the population in Metropolis?', a: 'Workers below and the elite above', d: ['A river', 'A religious schism', 'A language barrier'] },
{ c: 'Television', t: 3, q: 'Which detective series sends its officers to murders in the villages around the fictional town of Causton?', a: 'Midsomer Murders', d: ['Inspector Morse', 'Death in Paradise', 'Vera'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor played Rick Blaine in Casablanca?', a: 'Humphrey Bogart', d: ['Paul Henreid', 'Claude Rains', 'Peter Lorre'] },
{ c: 'Awards & Box Office', t: 3, q: "Which film about a family after a son's death won Best Picture at the 1981 ceremony?", a: 'Ordinary People', d: ['Raging Bull', 'The Elephant Man', "Coal Miner's Daughter"] },
{ c: 'Behind the Scenes', t: 3, q: 'What is a rack focus?', a: 'Shifting focus from one subject to another within a shot', d: ['Moving the camera along a track', 'Changing lenses mid-take', 'Adjusting exposure while rolling'] },

{ c: 'Movies', t: 4, q: 'Whose photographs of the backs of peoples heads recur throughout Yi Yi?', a: "A young boy's", d: ["A grandmother's", "A film director's", "A businessman's"] },
{ c: 'Television', t: 4, q: "Which series adapted Margaret Atwood's novel about a theocracy called Gilead?", a: "The Handmaid's Tale", d: ['Alias Grace', 'Station Eleven', 'The Man in the High Castle'] },
{ c: 'Actors & Directors', t: 4, q: 'Which director made Pierrot le Fou and Contempt?', a: 'Jean-Luc Godard', d: ['Francois Truffaut', 'Alain Resnais', 'Louis Malle'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film set in imperial China won Best Picture at the 1988 ceremony?', a: 'The Last Emperor', d: ['Broadcast News', 'Fatal Attraction', 'Moonstruck'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which discredited practice saw white performers darken their skin to play Black characters?', a: 'Blackface', d: ['Typecasting', 'Dubbing', 'Doubling'] },

{ c: 'Movies', t: 5, q: 'What arrives in the town square in Werckmeister Harmonies?', a: 'A whale in a truck', d: ['A circus tent', 'A bronze statue', 'A military convoy'] },
{ c: 'Television', t: 5, q: "Which 1979 BBC serial adapted John le Carre's novel about a mole in British intelligence?", a: 'Tinker Tailor Soldier Spy', d: ["Smiley's People", 'A Perfect Spy', 'The Sandbaggers'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actress played the title role in Cleo from 5 to 7?', a: 'Corinne Marchand', d: ['Anna Karina', 'Emmanuelle Riva', 'Delphine Seyrig'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which Alfred Hitchcock film won the Academy Award for Best Picture?', a: 'Rebecca', d: ['Notorious', 'Spellbound', 'Suspicion'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which 1935 release was the first feature shot in three-strip Technicolor?', a: 'Becky Sharp', d: ['The Garden of Allah', 'A Star Is Born', 'The Adventures of Robin Hood'] },
],

// ── Day 26 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "What are Gru's small yellow helpers called in Despicable Me?", a: 'Minions', d: ['Gremlins', 'Smurfs', 'Oompa Loompas'] },
{ c: 'Television', t: 1, q: 'Which competition series has fashion designers create garments against the clock?', a: 'Project Runway', d: ['Top Chef', 'Face Off', 'Say Yes to the Dress'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played the title role in Gladiator?', a: 'Russell Crowe', d: ['Joaquin Phoenix', 'Richard Harris', 'Djimon Hounsou'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which Academy Award category honors the instrumental music composed for a film?', a: 'Best Original Score', d: ['Best Sound', 'Best Music Direction', 'Best Film Editing'] },
{ c: 'Behind the Scenes', t: 1, q: 'What is principal photography?', a: 'The main shooting period of a film', d: ['The still photography for posters', 'The first frame of every scene', 'The chemical processing of the negative'] },

{ c: 'Movies', t: 2, q: "What make of car does Cameron's father keep in the garage in Ferris Bueller's Day Off?", a: 'A Ferrari', d: ['A Porsche', 'A Jaguar', 'A Lamborghini'] },
{ c: 'Television', t: 2, q: 'Which sitcom followed a Seattle radio psychiatrist, his brother Niles and their father Martin?', a: 'Frasier', d: ['Cheers', 'Wings', 'Just Shoot Me!'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Whiplash and La La Land?', a: 'Damien Chazelle', d: ['Ryan Coogler', 'Josh Safdie', 'Sean Baker'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which musical set in Austria won Best Picture at the 1966 ceremony?', a: 'The Sound of Music', d: ['Doctor Zhivago', 'Darling', 'Ship of Fools'] },
{ c: 'Behind the Scenes', t: 2, q: 'Which role is credited with financing and organising the making of a film?', a: 'The producer', d: ['The showrunner', 'The unit manager', 'The distributor'] },

{ c: 'Movies', t: 3, q: 'What is the double life of the heroine of Belle de Jour?', a: 'A bourgeois wife who works afternoons in a brothel', d: ['A nun who is a jewel thief', 'A teacher who is a spy', 'A singer who is an assassin'] },
{ c: 'Television', t: 3, q: 'Which British comedy followed a foul-mouthed government spin doctor?', a: 'The Thick of It', d: ['Yes Minister', 'The New Statesman', 'Absolute Power'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor played the title role in Lawrence of Arabia?', a: "Peter O'Toole", d: ['Omar Sharif', 'Alec Guinness', 'Anthony Quinn'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about a New Jersey longshoreman won Best Picture at the 1955 ceremony?', a: 'On the Waterfront', d: ['The Caine Mutiny', 'Seven Brides for Seven Brothers', 'Three Coins in the Fountain'] },
{ c: 'Behind the Scenes', t: 3, q: 'Which term describes assembling shots into a rhythmic sequence that compresses time?', a: 'Montage', d: ['Blocking', 'Coverage', 'Foley'] },

{ c: 'Movies', t: 4, q: 'Whose point of view does Come and See follow?', a: 'A Belarusian boy', d: ['A German officer', 'A Russian nurse', 'A partisan commander'] },
{ c: 'Television', t: 4, q: 'Which series followed a Kentucky United States marshal named Raylan Givens?', a: 'Justified', d: ['Longmire', 'Banshee', 'Ozark'] },
{ c: 'Actors & Directors', t: 4, q: 'Which Belgian director made Jeanne Dielman?', a: 'Chantal Akerman', d: ['Agnes Varda', 'Marguerite Duras', 'Claire Denis'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which musical set among rival New York gangs won Best Picture at the 1962 ceremony?', a: 'West Side Story', d: ['The Hustler', 'Judgment at Nuremberg', 'Fanny'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which innovation let sound be printed onto the film strip itself, replacing synchronised discs?', a: 'The optical soundtrack', d: ['Magnetic tape', 'The Vitaphone disc', 'Digital encoding'] },

{ c: 'Movies', t: 5, q: 'In which century is Marketa Lazarova set?', a: 'The thirteenth', d: ['The tenth', 'The sixteenth', 'The eighteenth'] },
{ c: 'Television', t: 5, q: "Which 1976 BBC serial adapted Robert Graves's novels about a stammering Roman emperor?", a: 'I, Claudius', d: ['The Caesars', 'The Borgias', 'The Cleopatras'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actor played the lead role in both Seven Samurai and Yojimbo?', a: 'Toshiro Mifune', d: ['Takashi Shimura', 'Tatsuya Nakadai', 'Chishu Ryu'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which Shakespeare adaptation won Best Picture at the 1949 ceremony?', a: 'Hamlet', d: ['Johnny Belinda', 'The Snake Pit', 'The Treasure of the Sierra Madre'] },
{ c: 'Behind the Scenes', t: 5, q: 'How many writers and directors were cited for contempt of Congress after the 1947 hearings?', a: 'Ten', d: ['Five', 'Twenty', 'Fifty'] },
],

// ── Day 27 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'What was Po doing for a living before he became the Dragon Warrior in Kung Fu Panda?', a: "Working in his father's noodle shop", d: ['Training as a monk', 'Herding goats', 'Guarding a temple'] },
{ c: 'Television', t: 1, q: 'Which animated series follows a washed-up horse who once starred in a 1990s sitcom?', a: 'BoJack Horseman', d: ['Big Mouth', 'F Is for Family', 'Tuca & Bertie'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Captain America in the Marvel films?', a: 'Chris Evans', d: ['Chris Hemsworth', 'Sebastian Stan', 'Anthony Mackie'] },
{ c: 'Awards & Box Office', t: 1, q: "The Cesar is the national film award of which nation?", a: 'France', d: ['Spain', 'Italy', 'Germany'] },
{ c: 'Behind the Scenes', t: 1, q: 'What is a pilot in television?', a: 'The first episode made to sell a series', d: ['The season finale', 'A clip show', 'A behind-the-scenes special'] },

{ c: 'Movies', t: 2, q: 'Which object does Cobb use to test whether he is dreaming in Inception?', a: 'A spinning top', d: ['A pocket watch', 'A coin', 'A wedding ring'] },
{ c: 'Television', t: 2, q: "Which comedy is set in an American vice president's office?", a: 'Veep', d: ['Parks and Recreation', 'The Thick of It', 'Scandal'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Parasite?', a: 'Bong Joon-ho', d: ['Park Chan-wook', 'Kim Jee-woon', 'Lee Chang-dong'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film about a mother and daughter in Texas won Best Picture at the 1984 ceremony?', a: 'Terms of Endearment', d: ['The Right Stuff', 'The Big Chill', 'Tender Mercies'] },
{ c: 'Behind the Scenes', t: 2, q: 'What does it mean when a studio green lights a project?', a: 'It approves the film to go into production', d: ['It passes censorship', 'It opens in cinemas', 'It recoups its budget'] },

{ c: 'Movies', t: 3, q: 'What pattern do the killings follow in Se7en?', a: 'The seven deadly sins', d: ['The ten commandments', 'The stations of the cross', 'The signs of the zodiac'] },
{ c: 'Television', t: 3, q: 'Which series followed the secrets of the women living on Wisteria Lane?', a: 'Desperate Housewives', d: ['Big Little Lies', 'Melrose Place', 'Knots Landing'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actor won Best Actor for playing Salieri in Amadeus?', a: 'F. Murray Abraham', d: ['Tom Hulce', 'Jeffrey Jones', 'Simon Callow'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which globe-circling adventure won Best Picture at the 1957 ceremony?', a: 'Around the World in 80 Days', d: ['The Ten Commandments', 'Giant', 'The King and I'] },
{ c: 'Behind the Scenes', t: 3, q: "Which practice replaces an actor's voice with another performer's in a different language?", a: 'Dubbing', d: ['Subtitling', 'Looping', 'Foley'] },

{ c: 'Movies', t: 4, q: 'On which Italian island is The Leopard set?', a: 'Sicily', d: ['Sardinia', 'Capri', 'Elba'] },
{ c: 'Television', t: 4, q: 'Which series followed the Shelby family in Birmingham after the First World War?', a: 'Peaky Blinders', d: ['Boardwalk Empire', 'Gangs of London', 'Ripper Street'] },
{ c: 'Actors & Directors', t: 4, q: 'Which director made Faces and A Woman Under the Influence?', a: 'John Cassavetes', d: ['Elia Kazan', 'Sidney Lumet', 'Bob Rafelson'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film about a Black detective investigating a Mississippi murder won Best Picture at the 1968 ceremony?', a: 'In the Heat of the Night', d: ['The Graduate', 'Bonnie and Clyde', 'Doctor Dolittle'] },
{ c: 'Behind the Scenes', t: 4, q: 'What is a long take?', a: 'A single shot running an unusually long time without a cut', d: ['A wide shot covering a whole scene', 'A shot with two actors in frame', 'A close detail cut into a scene'] },

{ c: 'Movies', t: 5, q: 'Over how many days does Jeanne Dielman take place?', a: 'Three', d: ['One', 'Seven', 'Ten'] },
{ c: 'Television', t: 5, q: 'Which 1982 British serial followed five unemployed Liverpool men?', a: 'Boys from the Blackstuff', d: ['Auf Wiedersehen, Pet', 'Bread', 'Brookside'] },
{ c: 'Actors & Directors', t: 5, q: 'Which actor played the priest in Diary of a Country Priest?', a: 'Claude Laydu', d: ['Francois Leterrier', 'Martin Lasalle', 'Pierre Fresnay'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which Gene Kelly musical set in the French capital won Best Picture at the 1952 ceremony?', a: 'An American in Paris', d: ['A Streetcar Named Desire', 'A Place in the Sun', 'Quo Vadis'] },
{ c: 'Behind the Scenes', t: 5, q: 'What was the Vitaphone?', a: 'An early sound-on-disc system synchronised with the projector', d: ['A widescreen lens', 'A color film stock', 'A hand-cranked camera'] },
],

// ── Day 28 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: 'What animal is Judy Hopps in Zootopia?', a: 'A rabbit', d: ['A fox', 'A sloth', 'A buffalo'] },
{ c: 'Television', t: 1, q: 'Which reality series has candidates compete for a job with a demanding businessman who fires them one by one?', a: 'The Apprentice', d: ["Dragons' Den", 'Undercover Boss', 'The Profit'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Legolas in The Lord of the Rings films?', a: 'Orlando Bloom', d: ['Viggo Mortensen', 'Sean Bean', 'Dominic Monaghan'] },
{ c: 'Awards & Box Office', t: 1, q: 'What does the Golden Globe trophy depict?', a: 'A globe on a pedestal', d: ['A gilded film reel', 'A masked face', 'A winged figure'] },
{ c: 'Behind the Scenes', t: 1, q: 'What does shooting on location mean?', a: 'Filming at a real place rather than in a studio', d: ['Filming with a second unit', 'Filming against a green screen', 'Filming a rehearsal'] },

{ c: 'Movies', t: 2, q: 'On which ice planet does The Empire Strikes Back open?', a: 'Hoth', d: ['Tatooine', 'Endor', 'Dagobah'] },
{ c: 'Television', t: 2, q: 'Which British sitcom followed three old men larking about in the Yorkshire hills for thirty-seven years?', a: 'Last of the Summer Wine', d: ['Open All Hours', 'Dad\'s Army', 'Hi-de-Hi!'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Spirited Away and My Neighbor Totoro?', a: 'Hayao Miyazaki', d: ['Isao Takahata', 'Mamoru Hosoda', 'Satoshi Kon'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film finished the 1970s as the decade’s highest grossing release worldwide?', a: 'Star Wars', d: ['Jaws', 'Grease', 'The Exorcist'] },
{ c: 'Behind the Scenes', t: 2, q: 'What is a multi-camera sitcom?', a: 'A comedy shot with several cameras at once, often before a live audience', d: ['A comedy shot like a documentary', 'A comedy shot on location only', 'A comedy of unconnected sketches'] },

{ c: 'Movies', t: 3, q: 'Which regime does the protagonist of The Conformist serve?', a: 'Italian fascism', d: ['Nazi Germany', 'Francoist Spain', 'Vichy France'] },
{ c: 'Television', t: 3, q: 'Which HBO drama followed a Prohibition-era political fixer in Atlantic City?', a: 'Boardwalk Empire', d: ['Deadwood', 'Peaky Blinders', 'The Knick'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actress won Best Actress for playing a union organiser in Norma Rae?', a: 'Sally Field', d: ['Jane Fonda', 'Sissy Spacek', 'Jill Clayburgh'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which musical about a Parisian courtesan-in-training won Best Picture at the 1959 ceremony?', a: 'Gigi', d: ['Auntie Mame', 'The Defiant Ones', 'Separate Tables'] },
{ c: 'Behind the Scenes', t: 3, q: 'What are residuals in the film and television business?', a: 'Payments to talent when a work is reused', d: ['The unspent part of a budget', 'Footage left out of the final cut', "The distributor's fee"] },

{ c: 'Movies', t: 4, q: 'In which country is Fanny and Alexander set?', a: 'Sweden', d: ['Denmark', 'Norway', 'Finland'] },
{ c: 'Television', t: 4, q: 'Which anthology series began with two Louisiana detectives and changed its cast each season?', a: 'True Detective', d: ['Fargo', 'The Sinner', 'Sharp Objects'] },
{ c: 'Actors & Directors', t: 4, q: 'Which actor played Antoine Doinel across five Francois Truffaut films?', a: 'Jean-Pierre Leaud', d: ['Jean-Claude Brialy', 'Charles Aznavour', 'Jean-Paul Belmondo'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which backstage story of a Broadway star won Best Picture at the 1951 ceremony?', a: 'All About Eve', d: ['Born Yesterday', "King Solomon's Mines", 'Sunset Boulevard'] },
{ c: 'Behind the Scenes', t: 4, q: 'Which sound advance did Fantasia introduce to cinemas in 1940?', a: 'Multi-channel stereophonic sound', d: ['The optical soundtrack', 'Post-synchronised dialogue', 'Noise reduction'] },

{ c: 'Movies', t: 5, q: 'What are the professions of the two lovers in Hiroshima Mon Amour?', a: 'A French actress and a Japanese architect', d: ['A doctor and a teacher', 'A journalist and a soldier', 'A singer and an engineer'] },
{ c: 'Television', t: 5, q: "Which 1981 British serial adapted Evelyn Waugh's novel about the Flyte family?", a: 'Brideshead Revisited', d: ['The Jewel in the Crown', 'A Dance to the Music of Time', 'Testament of Youth'] },
{ c: 'Actors & Directors', t: 5, q: 'Which French director made A Man Escaped and Pickpocket?', a: 'Robert Bresson', d: ['Jean-Pierre Melville', 'Louis Malle', 'Georges Franju'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which film about an English family in wartime won Best Picture at the 1943 ceremony?', a: 'Mrs. Miniver', d: ['Casablanca', 'The Pride of the Yankees', 'Random Harvest'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which experiment of Eadweard Muybridge is a direct forerunner of cinema?', a: 'Sequential photographs of a galloping horse', d: ['The magic lantern', 'The camera obscura', 'The daguerreotype'] },
],

// ── Day 29 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "Which country's Day of the Dead is the setting of Coco?", a: 'Mexico', d: ['Spain', 'Peru', 'Colombia'] },
{ c: 'Television', t: 1, q: 'Which reality series sends teams racing around the world against each other?', a: 'The Amazing Race', d: ['Survivor', 'Big Brother', 'The Mole'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Jack Torrance in The Shining?', a: 'Jack Nicholson', d: ['Robert De Niro', 'Christopher Walken', 'Dennis Hopper'] },
{ c: 'Awards & Box Office', t: 1, q: "Which Academy Award category honors the year's best non-fiction film?", a: 'Best Documentary Feature', d: ['Best Reportage', 'Best Factual Feature', 'Best True Story'] },
{ c: 'Behind the Scenes', t: 1, q: 'What is a sequel?', a: 'A film continuing the story of an earlier one', d: ['A film telling an earlier part of the story', 'A remake in another language', 'A shortened re-release'] },

{ c: 'Movies', t: 2, q: 'What does Rose drop into the ocean at the end of Titanic?', a: 'A diamond necklace', d: ['A locket', 'A wedding ring', 'A photograph'] },
{ c: 'Television', t: 2, q: 'Which animated series follows four foul-mouthed boys in a Colorado mountain town?', a: 'South Park', d: ['Beavis and Butt-Head', 'King of the Hill', 'Family Guy'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made The Sixth Sense and Signs?', a: 'M. Night Shyamalan', d: ['David Fincher', 'James Wan', 'Scott Derrickson'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film released in the 2000s went on to gross the most worldwide?', a: 'Avatar', d: ['The Dark Knight', "Pirates of the Caribbean: Dead Man's Chest", 'Shrek 2'] },
{ c: 'Behind the Scenes', t: 2, q: 'What is a showrunner in television?', a: 'The lead writer and executive producer of a series', d: ['The network scheduler', "The studio's head of casting", 'The stage manager'] },

{ c: 'Movies', t: 3, q: 'Which state do the Joads leave in The Grapes of Wrath?', a: 'Oklahoma', d: ['Kansas', 'Arkansas', 'Texas'] },
{ c: 'Television', t: 3, q: 'Which Aaron Sorkin series followed the staff of a fictional cable news channel?', a: 'The Newsroom', d: ['Broadcast News', 'Sports Night', 'Studio 60 on the Sunset Strip'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actress won Best Actress for Roman Holiday?', a: 'Audrey Hepburn', d: ['Grace Kelly', 'Deborah Kerr', 'Leslie Caron'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film about servicemen returning home won Best Picture at the 1947 ceremony?', a: 'The Best Years of Our Lives', d: ["It's a Wonderful Life", 'The Yearling', 'Henry V'] },
{ c: 'Behind the Scenes', t: 3, q: 'What is an establishing shot?', a: 'A wide shot that shows where a scene is taking place', d: ['The first take printed', "A shot of an actor's reaction", 'A shot cut only into the trailer'] },

{ c: 'Movies', t: 4, q: 'Which crop fills the landscape of Days of Heaven?', a: 'Wheat', d: ['Cotton', 'Corn', 'Tobacco'] },
{ c: 'Television', t: 4, q: 'Which HBO drama followed a polygamous family in suburban Utah?', a: 'Big Love', d: ['Sister Wives', 'Under the Banner of Heaven', 'Bloodline'] },
{ c: 'Actors & Directors', t: 4, q: 'Which British director made Kes and Cathy Come Home?', a: 'Ken Loach', d: ['Mike Leigh', 'Alan Clarke', 'Lindsay Anderson'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film won Best Picture at the 1940 ceremony?', a: 'Gone with the Wind', d: ['The Wizard of Oz', 'Wuthering Heights', 'Stagecoach'] },
{ c: 'Behind the Scenes', t: 4, q: 'What is a test screening?', a: 'Showing an unfinished cut to a recruited audience for reaction', d: ['A screening for the press before release', 'The first public showing on opening day', "A screening for the studio's board"] },

{ c: 'Movies', t: 5, q: 'Roughly how long does Satantango run?', a: 'About seven hours', d: ['About three hours', 'About five hours', 'About ten hours'] },
{ c: 'Television', t: 5, q: 'Which 1950s American sitcom pioneered filming a comedy on 35mm with three cameras at once?', a: 'I Love Lucy', d: ['The Honeymooners', 'Dragnet', 'The Jack Benny Program'] },
{ c: 'Actors & Directors', t: 5, q: 'Which director made Le Cercle Rouge and Army of Shadows?', a: 'Jean-Pierre Melville', d: ['Robert Bresson', 'Claude Sautet', 'Henri-Georges Clouzot'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which film about a singing priest won Best Picture at the 1945 ceremony?', a: 'Going My Way', d: ['Double Indemnity', 'Gaslight', 'Since You Went Away'] },
{ c: 'Behind the Scenes', t: 5, q: 'Which film gauge did Kodak introduce in 1923 for amateur filmmakers?', a: '16mm', d: ['8mm', 'Super 8', '9.5mm'] },
],

// ── Day 30 ─────────────────────────────────────────────────────────────────
[
{ c: 'Movies', t: 1, q: "What do the characters living inside Riley's head represent in Inside Out?", a: 'Her emotions', d: ['Her memories', 'Her dreams', 'Her friends'] },
{ c: 'Television', t: 1, q: 'Which childrens series follows a tank engine working on the island of Sodor?', a: 'Thomas & Friends', d: ['Chuggington', 'Postman Pat', 'Fireman Sam'] },
{ c: 'Actors & Directors', t: 1, q: 'Which actor played Gandalf in The Lord of the Rings films?', a: 'Ian McKellen', d: ['Christopher Lee', 'Patrick Stewart', 'Michael Gambon'] },
{ c: 'Awards & Box Office', t: 1, q: 'Which Academy Award category rewards the clothes made for a film?', a: 'Best Costume Design', d: ['Best Production Design', 'Best Makeup and Hairstyling', 'Best Art Direction'] },
{ c: 'Behind the Scenes', t: 1, q: 'What is a prequel?', a: 'A film set before an earlier one in the same story', d: ['A film set after an earlier one', 'A remake in another language', 'A shortened cut'] },

{ c: 'Movies', t: 2, q: 'What does the Cowardly Lion ask the Wizard for?', a: 'Courage', d: ['A brain', 'A heart', 'A way home'] },
{ c: 'Television', t: 2, q: 'Which series followed Captain Jean-Luc Picard and the crew of the Enterprise-D?', a: 'Star Trek: The Next Generation', d: ['Star Trek: Voyager', 'Star Trek: Deep Space Nine', 'Babylon 5'] },
{ c: 'Actors & Directors', t: 2, q: 'Which director made Sideways and The Descendants?', a: 'Alexander Payne', d: ['Cameron Crowe', 'Jason Reitman', 'Noah Baumbach'] },
{ c: 'Awards & Box Office', t: 2, q: 'Which film finished the 2010s as the decade’s highest grossing release worldwide?', a: 'Avengers: Endgame', d: ['Star Wars: The Force Awakens', 'Frozen II', 'Jurassic World'] },
{ c: 'Behind the Scenes', t: 2, q: 'What is runaway production?', a: 'Shooting somewhere other than where the story is set, usually to cut costs', d: ['Block booking', 'Four-walling', 'A platform release'] },

{ c: 'Movies', t: 3, q: 'What destroys the vampire at the end of the 1922 Nosferatu?', a: 'Sunlight', d: ['A wooden stake', 'Holy water', 'A silver blade'] },
{ c: 'Television', t: 3, q: 'Which 1978 British series followed rebels who seized an alien ship called the Liberator?', a: "Blake's 7", d: ['Doctor Who', 'Space: 1999', 'The Tomorrow People'] },
{ c: 'Actors & Directors', t: 3, q: 'Which actress won Best Actress for Misery?', a: 'Kathy Bates', d: ['Anjelica Huston', 'Julia Roberts', 'Joanne Woodward'] },
{ c: 'Awards & Box Office', t: 3, q: 'Which film set in Hawaii before Pearl Harbor won Best Picture at the 1954 ceremony?', a: 'From Here to Eternity', d: ['Roman Holiday', 'Shane', 'Julius Caesar'] },
{ c: 'Behind the Scenes', t: 3, q: 'What are dailies, also called rushes?', a: "The unedited footage from a day's shooting, viewed by the crew", d: ['The daily call sheet', 'The last week of shooting', 'The daily box office figures'] },

{ c: 'Movies', t: 4, q: 'Which bird does the boy train in Kes?', a: 'A kestrel', d: ['A hawk', 'An owl', 'A raven'] },
{ c: 'Television', t: 4, q: 'Which series was set at the fictional St. Eligius hospital in Boston?', a: 'St. Elsewhere', d: ['ER', 'Chicago Hope', 'Ben Casey'] },
{ c: 'Actors & Directors', t: 4, q: 'Which non-professional was cast as the father in Bicycle Thieves?', a: 'Lamberto Maggiorani', d: ['Enzo Staiola', 'Franco Interlenghi', 'Massimo Girotti'] },
{ c: 'Awards & Box Office', t: 4, q: 'Which film won Best Picture at the 1973 ceremony?', a: 'The Godfather', d: ['Cabaret', 'Deliverance', 'Sounder'] },
{ c: 'Behind the Scenes', t: 4, q: 'What is chroma key?', a: 'Shooting against a solid color backdrop so it can be replaced later', d: ['Projecting a background behind the actors on set', 'Painting a background onto glass', 'Printing two negatives together'] },

{ c: 'Movies', t: 5, q: 'How many days does The Turin Horse cover?', a: 'Six', d: ['Three', 'Seven', 'Ten'] },
{ c: 'Television', t: 5, q: 'Which CBS variety series ran from 1948 and introduced America to the Beatles?', a: 'The Ed Sullivan Show', d: ['Texaco Star Theater', 'Your Show of Shows', 'The Colgate Comedy Hour'] },
{ c: 'Actors & Directors', t: 5, q: 'Which Soviet director made The Cranes Are Flying?', a: 'Mikhail Kalatozov', d: ['Grigori Chukhrai', 'Sergei Bondarchuk', 'Andrei Tarkovsky'] },
{ c: 'Awards & Box Office', t: 5, q: 'Which film about a Welsh mining family won Best Picture at the 1942 ceremony?', a: 'How Green Was My Valley', d: ['Citizen Kane', 'The Maltese Falcon', 'Sergeant York'] },
{ c: 'Behind the Scenes', t: 5, q: 'What was the Kinetoscope?', a: "An early peep-show viewing device from Edison's laboratory", d: ['A projector for large audiences', 'A color process', 'A sound recorder'] },
],

];
