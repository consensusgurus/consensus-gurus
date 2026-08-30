// Authored source for Quotes, the daily attribution gauntlet.
// Built into app/quotes/{questions,puzzles}.js by scripts/gen-mcq.mjs.
//
//   c  lane, cycling in LANES order across every block of five
//   t  tier, 1 (gimme) to 5 (expert), five questions per tier per day
//   q  the question
//   a  the TRUE answer, always authored here in first position
//   d  three distractors
//
// FOUR REAL LANES TO ONE FICTIONAL (owner, 2026-08-29). The game is weighted
// toward real life and history: presidents and politics, history and war,
// science and letters and ideas, and books and authors are all attributions to
// people who actually said or wrote the words. Screen Lines is the one
// invented lane, one question in five.
//
// A FICTIONAL LINE IS ALWAYS ASKED AS A CHARACTER (owner rule). Every Screen
// Lines stem contains the word "character" and every one of its four choices is
// a character from that work, never the actor who played them. The same holds
// for the occasional novel line in Books & Authors: either the stem asks which
// character speaks it, or it asks which author wrote it, and it says which.
// Never mix a character and a performer inside one set of choices.
//
// NOTHING APOCRYPHAL. The failure mode of a quotes bank is the famous line
// nobody actually said. Banned outright: Marie Antoinette on cake, Voltaire on
// defending your right to say it, Machiavelli on ends and means, Einstein on
// the definition of insanity, Burke on good men doing nothing, Victoria on not
// being amused, Revere on the British coming. Where a misattribution is itself
// interesting it may be asked directly, naming the real author as the answer.
// Every line here is one the named person is documented as having written or
// spoken, and a translated line is asked in its standard English rendering.
//
// EVERY FACT IS FROZEN, which a quotes bank gets almost for free: a line said in
// 1863 stays said. What is banned is asking who "currently" holds any office, or
// pinning a quote to a living person's present role rather than to the moment
// they said it.
export const LANES = ['Presidents & Politics', 'History & War', 'Science, Letters & Ideas', 'Books & Authors', 'Screen Lines'];

export const DAYS = [

// ── Day 1 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president urged Americans to ask not what their country could do for them?', a: 'John F. Kennedy', d: ['Franklin D. Roosevelt', 'Lyndon B. Johnson', 'Dwight D. Eisenhower'] },
{ c: 'History & War', t: 1, q: 'Who told the March on Washington in 1963 that he had a dream?', a: 'Martin Luther King Jr.', d: ['Malcolm X', 'John Lewis', 'Thurgood Marshall'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Who described a small step for man and a giant leap for mankind?', a: 'Neil Armstrong', d: ['Buzz Aldrin', 'Yuri Gagarin', 'John Glenn'] },
{ c: 'Books & Authors', t: 1, q: "Which novel opens with the words 'Call me Ishmael'?", a: 'Moby-Dick', d: ['Treasure Island', 'The Old Man and the Sea', 'Robinson Crusoe'] },
{ c: 'Screen Lines', t: 1, q: "Which character says 'Here's looking at you, kid' in Casablanca?", a: 'Rick Blaine', d: ['Ilsa Lund', 'Victor Laszlo', 'Captain Renault'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president warned in his farewell address against the military-industrial complex?', a: 'Dwight D. Eisenhower', d: ['Harry S. Truman', 'John F. Kennedy', 'Richard Nixon'] },
{ c: 'History & War', t: 2, q: 'Who told the House of Commons in 1940 that he had nothing to offer but blood, toil, tears and sweat?', a: 'Winston Churchill', d: ['Neville Chamberlain', 'Clement Attlee', 'Anthony Eden'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Who reasoned that because he was thinking, he must exist?', a: 'Rene Descartes', d: ['Immanuel Kant', 'Baruch Spinoza', 'John Locke'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel begins by calling it the best of times and the worst of times?', a: 'A Tale of Two Cities', d: ['Great Expectations', 'Bleak House', 'Oliver Twist'] },
{ c: 'Screen Lines', t: 2, q: "Which character promises to make him an offer he can't refuse in The Godfather?", a: 'Vito Corleone', d: ['Michael Corleone', 'Sonny Corleone', 'Tom Hagen'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president promised at his first inaugural that the nation asks for action, and action now?', a: 'Franklin D. Roosevelt', d: ['Woodrow Wilson', 'Herbert Hoover', 'Harry S. Truman'] },
{ c: 'History & War', t: 3, q: "Who reported a victory with the words 'I came, I saw, I conquered'?", a: 'Julius Caesar', d: ['Augustus', 'Pompey', 'Mark Antony'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Who wrote that if he had seen further it was by standing on the shoulders of giants?', a: 'Isaac Newton', d: ['Galileo Galilei', 'Robert Hooke', 'Edmond Halley'] },
{ c: 'Books & Authors', t: 3, q: 'Which author wrote that a single man in possession of a good fortune must be in want of a wife?', a: 'Jane Austen', d: ['Charlotte Bronte', 'George Eliot', 'Elizabeth Gaskell'] },
{ c: 'Screen Lines', t: 3, q: "Which character asks 'You talkin' to me?' in Taxi Driver?", a: 'Travis Bickle', d: ['Iris Steensma', 'Sport', 'Betsy'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president urged Americans to speak softly and carry a big stick?', a: 'Theodore Roosevelt', d: ['William McKinley', 'William Howard Taft', 'Woodrow Wilson'] },
{ c: 'History & War', t: 4, q: "Which American general answered a German surrender demand at Bastogne with the single word 'Nuts'?", a: 'Anthony McAuliffe', d: ['George Patton', 'Omar Bradley', 'Matthew Ridgway'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Who is recorded at his trial as saying the unexamined life is not worth living?', a: 'Socrates', d: ['Plato', 'Aristotle', 'Epicurus'] },
{ c: 'Books & Authors', t: 4, q: 'Which author opened a novel by saying every unhappy family is unhappy in its own way?', a: 'Leo Tolstoy', d: ['Fyodor Dostoevsky', 'Ivan Turgenev', 'Anton Chekhov'] },
{ c: 'Screen Lines', t: 4, q: 'Which character in Gone with the Wind runs the Atlanta blockade and later marries Scarlett?', a: 'Rhett Butler', d: ['Ashley Wilkes', 'Frank Kennedy', 'Charles Hamilton'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which president said the chief business of the American people is business?', a: 'Calvin Coolidge', d: ['Warren G. Harding', 'Herbert Hoover', 'William McKinley'] },
{ c: 'History & War', t: 5, q: 'Which admiral signalled that England expects every man to do his duty?', a: 'Horatio Nelson', d: ['Arthur Wellesley', 'Francis Drake', 'John Jervis'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Who asked for a place to stand and promised to move the earth?', a: 'Archimedes', d: ['Euclid', 'Pythagoras', 'Eratosthenes'] },
{ c: 'Books & Authors', t: 5, q: 'Which poet urged his dying father not to go gentle into that good night?', a: 'Dylan Thomas', d: ['W. B. Yeats', 'T. S. Eliot', 'Seamus Heaney'] },
{ c: 'Screen Lines', t: 5, q: 'Which character describes attack ships on fire off the shoulder of Orion in Blade Runner?', a: 'Roy Batty', d: ['Rick Deckard', 'Rachael', 'Eldon Tyrell'] },
],

// ── Day 2 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president demanded at the Brandenburg Gate that Mr. Gorbachev tear down this wall?', a: 'Ronald Reagan', d: ['George H. W. Bush', 'Jimmy Carter', 'Richard Nixon'] },
{ c: 'History & War', t: 1, q: 'Which general promised the Philippines in 1942 that he would return?', a: 'Douglas MacArthur', d: ['Dwight D. Eisenhower', 'George Patton', 'Chester Nimitz'] },
{ c: 'Science, Letters & Ideas', t: 1, q: "Whose theory of evolution is popularly summed up as 'survival of the fittest', a phrase he borrowed from Herbert Spencer?", a: 'Charles Darwin', d: ['Gregor Mendel', 'Alfred Russel Wallace', 'Thomas Huxley'] },
{ c: 'Books & Authors', t: 1, q: "In which play does a prince ask whether to be, or not to be?", a: 'Hamlet', d: ['Macbeth', 'King Lear', 'Othello'] },
{ c: 'Screen Lines', t: 1, q: 'Which character says he loves the smell of napalm in the morning in Apocalypse Now?', a: 'Lieutenant Colonel Kilgore', d: ['Captain Willard', 'Colonel Kurtz', 'Chef'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told reporters that he was not a crook?', a: 'Richard Nixon', d: ['Lyndon B. Johnson', 'Gerald Ford', 'Ronald Reagan'] },
{ c: 'History & War', t: 2, q: 'Which queen told her troops at Tilbury that she had the heart and stomach of a king?', a: 'Elizabeth I', d: ['Mary I', 'Anne Boleyn', 'Victoria'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which physicist told an interviewer that imagination is more important than knowledge?', a: 'Albert Einstein', d: ['Isaac Newton', 'Nikola Tesla', 'Thomas Edison'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens on a bright cold day in April with the clocks striking thirteen?', a: 'Nineteen Eighty-Four', d: ['Brave New World', 'Fahrenheit 451', 'We'] },
{ c: 'Screen Lines', t: 2, q: "Which character says 'Say hello to my little friend' in Scarface?", a: 'Tony Montana', d: ['Manny Ribera', 'Frank Lopez', 'Alejandro Sosa'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president closed his first inaugural by appealing to the better angels of our nature?', a: 'Abraham Lincoln', d: ['Andrew Jackson', 'James Buchanan', 'Ulysses S. Grant'] },
{ c: 'History & War', t: 3, q: 'Which Virginian orator demanded liberty or death in 1775?', a: 'Patrick Henry', d: ['Thomas Paine', 'Samuel Adams', 'John Hancock'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Who wrote that man is born free, and everywhere he is in chains?', a: 'Jean-Jacques Rousseau', d: ['Voltaire', 'Montesquieu', 'Denis Diderot'] },
{ c: 'Books & Authors', t: 3, q: 'Which author opened The Go-Between by calling the past a foreign country?', a: 'L. P. Hartley', d: ['Graham Greene', 'Evelyn Waugh', 'E. M. Forster'] },
{ c: 'Screen Lines', t: 3, q: 'Which character compares life to a box of chocolates, quoting his mother?', a: 'Forrest Gump', d: ['Jenny Curran', 'Lieutenant Dan', 'Bubba Blue'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president kept a desk sign saying the buck stops here?', a: 'Harry S. Truman', d: ['Franklin D. Roosevelt', 'Dwight D. Eisenhower', 'Herbert Hoover'] },
{ c: 'History & War', t: 4, q: "Which Roman emperor took as his motto 'make haste slowly'?", a: 'Augustus', d: ['Julius Caesar', 'Tiberius', 'Hadrian'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Who argued that the medium is the message?', a: 'Marshall McLuhan', d: ['Noam Chomsky', 'Roland Barthes', 'Walter Benjamin'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet wandered lonely as a cloud?', a: 'William Wordsworth', d: ['Samuel Taylor Coleridge', 'John Keats', 'Percy Bysshe Shelley'] },
{ c: 'Screen Lines', t: 4, q: "Which character shouts 'You can't handle the truth!' in A Few Good Men?", a: 'Colonel Nathan Jessup', d: ['Lieutenant Daniel Kaffee', 'Lieutenant Commander Galloway', 'Lieutenant Sam Weinberg'] },

{ c: 'Presidents & Politics', t: 5, q: "Which British prime minister told her party conference that the lady's not for turning?", a: 'Margaret Thatcher', d: ['Edward Heath', 'Harold Wilson', 'John Major'] },
{ c: 'History & War', t: 5, q: 'Which American spy is said to have regretted having only one life to lose for his country?', a: 'Nathan Hale', d: ['Paul Revere', 'Ethan Allen', 'Benedict Arnold'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Who described life without government as solitary, poor, nasty, brutish and short?', a: 'Thomas Hobbes', d: ['John Locke', 'David Hume', 'Jeremy Bentham'] },
{ c: 'Books & Authors', t: 5, q: 'Which poet asked whether he dared disturb the universe?', a: 'T. S. Eliot', d: ['Ezra Pound', 'W. H. Auden', 'Wallace Stevens'] },
{ c: 'Screen Lines', t: 5, q: 'Which character declares that what we have here is failure to communicate in Cool Hand Luke?', a: 'The Captain', d: ['Carr', 'Dragline', 'Society Red'] },
],

// ── Day 3 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president opened an address with the words four score and seven years ago?', a: 'Abraham Lincoln', d: ['George Washington', 'Thomas Jefferson', 'Andrew Johnson'] },
{ c: 'History & War', t: 1, q: 'Which physicist recalled the line about becoming Death, the destroyer of worlds, after the first atomic test?', a: 'J. Robert Oppenheimer', d: ['Enrico Fermi', 'Leslie Groves', 'Edward Teller'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which two-time Nobel laureate said that nothing in life is to be feared, it is only to be understood?', a: 'Marie Curie', d: ['Rosalind Franklin', 'Lise Meitner', 'Ada Lovelace'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel ends with boats beating against the current, borne back ceaselessly into the past?', a: 'The Great Gatsby', d: ['Tender Is the Night', 'The Sun Also Rises', 'An American Tragedy'] },
{ c: 'Screen Lines', t: 1, q: "Which character says 'phone home' in Steven Spielberg's 1982 film?", a: 'E.T.', d: ['Elliott', 'Gertie', 'Michael'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which presidential nominee told his convention to read his lips: no new taxes?', a: 'George H. W. Bush', d: ['Ronald Reagan', 'Bill Clinton', 'Bob Dole'] },
{ c: 'History & War', t: 2, q: 'Which pamphlet ends by calling on the workers of the world to unite?', a: 'The Communist Manifesto', d: ['Das Kapital', 'What Is to Be Done?', 'The State and Revolution'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'The vow to defend to the death your right to say it is usually credited to Voltaire, but who actually wrote it?', a: 'His biographer, Evelyn Beatrice Hall', d: ['Denis Diderot', 'Jean-Jacques Rousseau', 'Thomas Paine'] },
{ c: 'Books & Authors', t: 2, q: "Which novel opens 'All this happened, more or less'?", a: 'Slaughterhouse-Five', d: ['Catch-22', 'The Naked and the Dead', "Gravity's Rainbow"] },
{ c: 'Screen Lines', t: 2, q: "Which animated character is known for the exasperated cry 'D'oh!'?", a: 'Homer Simpson', d: ['Bart Simpson', 'Ned Flanders', 'Mr. Burns'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president announced in a State of the Union address that the era of big government is over?', a: 'Bill Clinton', d: ['Ronald Reagan', 'George H. W. Bush', 'Jimmy Carter'] },
{ c: 'History & War', t: 3, q: 'Which president told a crowd in a divided city that he was a Berliner?', a: 'John F. Kennedy', d: ['Ronald Reagan', 'Lyndon B. Johnson', 'Harry S. Truman'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which philosopher wrote a play whose closing verdict is that hell is other people?', a: 'Jean-Paul Sartre', d: ['Albert Camus', 'Simone de Beauvoir', 'Martin Heidegger'] },
{ c: 'Books & Authors', t: 3, q: 'Which author wrote that the mass of men lead lives of quiet desperation?', a: 'Henry David Thoreau', d: ['Ralph Waldo Emerson', 'Walt Whitman', 'Nathaniel Hawthorne'] },
{ c: 'Screen Lines', t: 3, q: 'Which character announces that nobody puts Baby in a corner?', a: 'Johnny Castle', d: ['Baby Houseman', 'Jake Houseman', 'Penny Johnson'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which prime minister returned from Munich in 1938 promising peace for our time?', a: 'Neville Chamberlain', d: ['Stanley Baldwin', 'Winston Churchill', 'Ramsay MacDonald'] },
{ c: 'History & War', t: 4, q: 'Which Union admiral is quoted as damning the torpedoes and going full speed ahead?', a: 'David Farragut', d: ['John Paul Jones', 'Oliver Hazard Perry', 'George Dewey'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Who wrote that philosophers have only interpreted the world, and the point is to change it?', a: 'Karl Marx', d: ['Friedrich Engels', 'Georg Hegel', 'Ludwig Feuerbach'] },
{ c: 'Books & Authors', t: 4, q: 'Which writer coined the line that a rose is a rose is a rose?', a: 'Gertrude Stein', d: ['Djuna Barnes', 'Edith Sitwell', 'Katherine Mansfield'] },
{ c: 'Screen Lines', t: 4, q: 'Which character argues that greed, for lack of a better word, is good in Wall Street?', a: 'Gordon Gekko', d: ['Bud Fox', 'Lou Mannheim', 'Sir Larry Wildman'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which prime minister spent 1929 to 1939 out of office, in what he called his wilderness years?', a: 'Winston Churchill', d: ['Clement Attlee', 'David Lloyd George', 'Harold Macmillan'] },
{ c: 'History & War', t: 5, q: 'Which Confederate general died murmuring about crossing over the river to rest under the shade of the trees?', a: 'Stonewall Jackson', d: ['Robert E. Lee', 'J. E. B. Stuart', 'Albert Sidney Johnston'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Who concluded that whereof one cannot speak, thereof one must be silent?', a: 'Ludwig Wittgenstein', d: ['Bertrand Russell', 'Gottlob Frege', 'Rudolf Carnap'] },
{ c: 'Books & Authors', t: 5, q: 'Which playwright wrote the advice to try again, fail again, fail better?', a: 'Samuel Beckett', d: ['Eugene Ionesco', 'Harold Pinter', 'Tom Stoppard'] },
{ c: 'Screen Lines', t: 5, q: 'Which member of Project Mayhem is chanted by name after he is killed?', a: 'Robert Paulson', d: ['Tyler Durden', 'Angel Face', 'Marla Singer'] },
],

// ── Day 4 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: "Which president campaigned on the slogan 'Yes we can'?", a: 'Barack Obama', d: ['Bill Clinton', 'John Kerry', 'Al Gore'] },
{ c: 'History & War', t: 1, q: 'Who vowed in 1940 to fight on the beaches and on the landing grounds?', a: 'Winston Churchill', d: ['Neville Chamberlain', 'Anthony Eden', 'Lord Halifax'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which physicist wrote that the important thing is not to stop questioning?', a: 'Albert Einstein', d: ['Richard Feynman', 'Carl Sagan', 'Niels Bohr'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a small person living in a hole in the ground, and not a nasty one?', a: 'The Hobbit', d: ['The Lord of the Rings', 'The Sword in the Stone', 'Watership Down'] },
{ c: 'Screen Lines', t: 1, q: "Which character promises 'I'll be back' at a police station desk in the 1984 film?", a: 'The T-800', d: ['Kyle Reese', 'Sarah Connor', 'Dr. Silberman'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told an audience at Rice University that we choose to go to the Moon?', a: 'John F. Kennedy', d: ['Lyndon B. Johnson', 'Richard Nixon', 'Dwight D. Eisenhower'] },
{ c: 'History & War', t: 2, q: 'Which Union general is remembered for declaring that war is hell?', a: 'William Tecumseh Sherman', d: ['Ulysses S. Grant', 'Philip Sheridan', 'George McClellan'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which philosopher declared that God is dead?', a: 'Friedrich Nietzsche', d: ['Arthur Schopenhauer', 'Soren Kierkegaard', 'Georg Hegel'] },
{ c: 'Books & Authors', t: 2, q: 'Which poet ended an ode by equating beauty with truth?', a: 'John Keats', d: ['Percy Bysshe Shelley', 'Lord Byron', 'William Blake'] },
{ c: 'Screen Lines', t: 2, q: "Which character yells 'Show me the money!' down the phone in Jerry Maguire?", a: 'Rod Tidwell', d: ['Marcee Tidwell', 'Dorothy Boyd', 'Bob Sugar'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president liked to quote the Russian proverb about trusting but verifying?', a: 'Ronald Reagan', d: ['Richard Nixon', 'George H. W. Bush', 'Jimmy Carter'] },
{ c: 'History & War', t: 3, q: 'Which explorer greeted a long-lost missionary by asking whether he presumed correctly?', a: 'Henry Morton Stanley', d: ['Richard Burton', 'John Hanning Speke', 'Samuel Baker'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which inventor called genius one percent inspiration and ninety-nine percent perspiration?', a: 'Thomas Edison', d: ['Nikola Tesla', 'Henry Ford', 'Alexander Graham Bell'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet wrote of water everywhere, with not a drop to drink?', a: 'Samuel Taylor Coleridge', d: ['William Wordsworth', 'Robert Southey', 'William Blake'] },
{ c: 'Screen Lines', t: 3, q: 'Which character in The Shining is the ghostly former caretaker who urges Jack to correct his family?', a: 'Delbert Grady', d: ['Lloyd the bartender', 'Dick Hallorann', 'Danny Torrance'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president insisted to reporters that he was the decider?', a: 'George W. Bush', d: ['Bill Clinton', 'Barack Obama', 'Ronald Reagan'] },
{ c: 'History & War', t: 4, q: 'Which commander observed after the retreat from Moscow that it is only a step from the sublime to the ridiculous?', a: 'Napoleon Bonaparte', d: ['Marshal Ney', 'Talleyrand', 'Tsar Alexander I'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Who wrote that the heart has its reasons of which reason knows nothing?', a: 'Blaise Pascal', d: ['Rene Descartes', 'Michel de Montaigne', 'Pierre Gassendi'] },
{ c: 'Books & Authors', t: 4, q: 'Which novelist gave a dying trader the last words about the horror?', a: 'Joseph Conrad', d: ['Rudyard Kipling', 'E. M. Forster', 'Somerset Maugham'] },
{ c: 'Screen Lines', t: 4, q: 'Which character in The Wizard of Oz threatens Dorothy and her little dog too?', a: 'The Wicked Witch of the West', d: ['Glinda', 'Miss Gulch', 'The Wizard'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which presidential nominee told his 1964 convention that extremism in the defense of liberty is no vice?', a: 'Barry Goldwater', d: ['Richard Nixon', 'George Wallace', 'Nelson Rockefeller'] },
{ c: 'History & War', t: 5, q: 'Which general told Congress in 1951 that old soldiers never die, they just fade away?', a: 'Douglas MacArthur', d: ['George Marshall', 'Dwight D. Eisenhower', 'Omar Bradley'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Who wrote that the owl of Minerva spreads its wings only with the falling of the dusk?', a: 'Georg Hegel', d: ['Immanuel Kant', 'Johann Fichte', 'Friedrich Schelling'] },
{ c: 'Books & Authors', t: 5, q: 'Which author gave his dystopia the invented language Newspeak?', a: 'George Orwell', d: ['Aldous Huxley', 'Anthony Burgess', 'Yevgeny Zamyatin'] },
{ c: 'Screen Lines', t: 5, q: 'Which character crows about drinking your milkshake in There Will Be Blood?', a: 'Daniel Plainview', d: ['Eli Sunday', 'H. W. Plainview', 'Fletcher Hamilton'] },
],

// ── Day 5 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which first lady told a convention that when they go low, we go high?', a: 'Michelle Obama', d: ['Hillary Clinton', 'Laura Bush', 'Nancy Reagan'] },
{ c: 'History & War', t: 1, q: 'Which Indian leader wrote that forgiveness is the attribute of the strong?', a: 'Mahatma Gandhi', d: ['Jawaharlal Nehru', 'Nelson Mandela', 'Martin Luther King Jr.'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which astronomer opened his television series by calling the cosmos all that is or ever was or ever will be?', a: 'Carl Sagan', d: ['Neil deGrasse Tyson', 'Patrick Moore', 'Fred Hoyle'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with the narrator dreaming she went to Manderley again?', a: 'Rebecca', d: ['Jane Eyre', 'Wuthering Heights', 'The Woman in White'] },
{ c: 'Screen Lines', t: 1, q: "Which character declares 'To infinity and beyond!' in Toy Story?", a: 'Buzz Lightyear', d: ['Woody', 'Rex', 'Mr. Potato Head'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president pledged a new deal for the American people when he accepted his nomination?', a: 'Franklin D. Roosevelt', d: ['Woodrow Wilson', 'Harry S. Truman', 'Al Smith'] },
{ c: 'History & War', t: 2, q: 'Which defendant told a 1964 courtroom that it was an ideal for which he was prepared to die?', a: 'Nelson Mandela', d: ['Steve Biko', 'Desmond Tutu', 'Oliver Tambo'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which Elizabethan philosopher is credited with the maxim that knowledge is power?', a: 'Francis Bacon', d: ['Roger Bacon', 'John Locke', 'Isaac Newton'] },
{ c: 'Books & Authors', t: 2, q: 'Which poet wrote the lines about huddled masses yearning to breathe free that are mounted at the Statue of Liberty?', a: 'Emma Lazarus', d: ['Walt Whitman', 'Emily Dickinson', 'Henry Wadsworth Longfellow'] },
{ c: 'Screen Lines', t: 2, q: 'Which character reports that Houston has a problem in the 1995 film Apollo 13?', a: 'Jim Lovell', d: ['Jack Swigert', 'Fred Haise', 'Gene Kranz'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president promised that government of the people, by the people, for the people shall not perish from the earth?', a: 'Abraham Lincoln', d: ['Thomas Jefferson', 'Daniel Webster', 'Ulysses S. Grant'] },
{ c: 'History & War', t: 3, q: 'Which British foreign secretary said on the eve of war in 1914 that the lamps were going out all over Europe?', a: 'Edward Grey', d: ['Herbert Asquith', 'David Lloyd George', 'Arthur Balfour'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which anthropologist is credited with the line about a small group of thoughtful, committed citizens changing the world?', a: 'Margaret Mead', d: ['Ruth Benedict', 'Jane Goodall', 'Franz Boas'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet wrote that to err is human, to forgive divine?', a: 'Alexander Pope', d: ['John Dryden', 'Jonathan Swift', 'Samuel Johnson'] },
{ c: 'Screen Lines', t: 3, q: 'Which character in The Lord of the Rings films argues aloud with a second personality named Smeagol?', a: 'Gollum', d: ['Frodo Baggins', 'Bilbo Baggins', 'Sam Gamgee'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which lawyer asked Joseph McCarthy at the Army hearings whether he had no sense of decency?', a: 'Joseph Welch', d: ['Roy Cohn', 'Robert Kennedy', 'Karl Mundt'] },
{ c: 'History & War', t: 4, q: 'Which founder wrote that the tree of liberty must be refreshed with the blood of patriots and tyrants?', a: 'Thomas Jefferson', d: ['John Adams', 'James Madison', 'Patrick Henry'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Who wrote that one is not born, but rather becomes, a woman?', a: 'Simone de Beauvoir', d: ['Betty Friedan', 'Germaine Greer', 'Hannah Arendt'] },
{ c: 'Books & Authors', t: 4, q: "Which author opened a novel with the sentence 'It was a pleasure to burn'?", a: 'Ray Bradbury', d: ['Kurt Vonnegut', 'Philip K. Dick', 'Isaac Asimov'] },
{ c: 'Screen Lines', t: 4, q: "Which character shouts 'Made it, Ma! Top of the world!' in White Heat?", a: 'Cody Jarrett', d: ['Big Ed Somers', 'Hank Fallon', 'Verna Jarrett'] },

{ c: 'Presidents & Politics', t: 5, q: "Which vice-presidential nominee was told in a 1988 debate that he was no Jack Kennedy?", a: 'Dan Quayle', d: ['Al Gore', 'Walter Mondale', 'Bob Dole'] },
{ c: 'History & War', t: 5, q: 'Whose funeral oration for the Athenian war dead is preserved by Thucydides?', a: 'Pericles', d: ['Solon', 'Cleisthenes', 'Themistocles'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which philosopher wrote that what does not kill him makes him stronger?', a: 'Friedrich Nietzsche', d: ['Arthur Schopenhauer', 'Soren Kierkegaard', 'Max Stirner'] },
{ c: 'Books & Authors', t: 5, q: "Which author wrote the line 'Reader, I married him'?", a: 'Charlotte Bronte', d: ['Emily Bronte', 'Anne Bronte', 'George Eliot'] },
{ c: 'Screen Lines', t: 5, q: "Which character utters the word 'Rosebud' at the start of Citizen Kane?", a: 'Charles Foster Kane', d: ['Jedediah Leland', 'Jerry Thompson', 'Susan Alexander'] },
],

// ── Day 6 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president told a grieving nation that the Challenger crew had slipped the surly bonds of earth?', a: 'Ronald Reagan', d: ['George H. W. Bush', 'Jimmy Carter', 'Bill Clinton'] },
{ c: 'History & War', t: 1, q: "Which suffragette leader adopted 'Deeds not words' as her movement's motto?", a: 'Emmeline Pankhurst', d: ['Millicent Fawcett', 'Sylvia Pankhurst', 'Emily Davison'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which inventor summoned an assistant with the first words sent by telephone?', a: 'Alexander Graham Bell', d: ['Thomas Edison', 'Guglielmo Marconi', 'Samuel Morse'] },
{ c: 'Books & Authors', t: 1, q: "Which story opens by insisting that Marley was dead, to begin with?", a: 'A Christmas Carol', d: ['Great Expectations', 'The Pickwick Papers', 'Nicholas Nickleby'] },
{ c: 'Screen Lines', t: 1, q: "Which character reveals 'I am your father' in The Empire Strikes Back?", a: 'Darth Vader', d: ['Obi-Wan Kenobi', 'Emperor Palpatine', 'Yoda'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president declared an unconditional war on poverty and promised a Great Society?', a: 'Lyndon B. Johnson', d: ['John F. Kennedy', 'Harry S. Truman', 'Hubert Humphrey'] },
{ c: 'History & War', t: 2, q: 'Which president called December 7, 1941 a date which will live in infamy?', a: 'Franklin D. Roosevelt', d: ['Harry S. Truman', 'Douglas MacArthur', 'Cordell Hull'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which biologist warned of a spring in which no birds sang?', a: 'Rachel Carson', d: ['Aldo Leopold', 'John Muir', 'Jane Goodall'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens by telling readers they do not know about the narrator unless they have read a book about Tom Sawyer?', a: 'Adventures of Huckleberry Finn', d: ['The Adventures of Tom Sawyer', 'Life on the Mississippi', 'The Prince and the Pauper'] },
{ c: 'Screen Lines', t: 2, q: "Which character cries that they may take our lives but never our freedom in Braveheart?", a: 'William Wallace', d: ['Robert the Bruce', 'King Edward I', 'Hamish Campbell'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which founding father is traditionally credited with warning that they must all hang together, or assuredly hang separately?', a: 'Benjamin Franklin', d: ['John Adams', 'John Hancock', 'Thomas Jefferson'] },
{ c: 'History & War', t: 3, q: 'Which Spartan king is said to have answered a demand for his weapons by inviting the Persians to come and take them?', a: 'Leonidas', d: ['Lycurgus', 'Brasidas', 'Agesilaus'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Martin Luther King Jr. often quoted the line about the moral arc bending toward justice. Which nineteenth-century minister first wrote it?', a: 'Theodore Parker', d: ['Ralph Waldo Emerson', 'Henry Ward Beecher', 'William Lloyd Garrison'] },
{ c: 'Books & Authors', t: 3, q: "Which Scottish novelist opened a book with the day his grandmother exploded?", a: 'Iain Banks', d: ['Martin Amis', 'Julian Barnes', 'Ian McEwan'] },
{ c: 'Screen Lines', t: 3, q: "Which character whispers 'I see dead people' in The Sixth Sense?", a: 'Cole Sear', d: ['Malcolm Crowe', 'Lynn Sear', 'Vincent Grey'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which Kentucky senator said he would rather be right than be President?', a: 'Henry Clay', d: ['Daniel Webster', 'John C. Calhoun', 'Stephen Douglas'] },
{ c: 'History & War', t: 4, q: 'Which Carthaginian commander is said to have sworn eternal enmity to Rome as a boy?', a: 'Hannibal', d: ['Hamilcar Barca', 'Hasdrubal', 'Mago'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which German biologist formulated the biogenetic law summarised as ontogeny recapitulating phylogeny?', a: 'Ernst Haeckel', d: ['Charles Darwin', 'Thomas Huxley', 'Karl von Baer'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet described two roads diverging in a yellow wood?', a: 'Robert Frost', d: ['Carl Sandburg', 'Wallace Stevens', 'William Carlos Williams'] },
{ c: 'Screen Lines', t: 4, q: 'Which character advises keeping your friends close and your enemies closer in The Godfather Part II?', a: 'Michael Corleone', d: ['Tom Hagen', 'Hyman Roth', 'Fredo Corleone'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which British prime minister is credited with saying that a week is a long time in politics?', a: 'Harold Wilson', d: ['Harold Macmillan', 'Edward Heath', 'James Callaghan'] },
{ c: 'History & War', t: 5, q: 'Which Roman historian records a chieftain saying the Romans make a desert and call it peace?', a: 'Tacitus', d: ['Livy', 'Suetonius', 'Sallust'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Who made the greatest happiness of the greatest number the foundation of his moral philosophy?', a: 'Jeremy Bentham', d: ['William Paley', 'David Hume', 'Adam Smith'] },
{ c: 'Books & Authors', t: 5, q: 'Which poet called hope the thing with feathers?', a: 'Emily Dickinson', d: ['Christina Rossetti', 'Elizabeth Barrett Browning', 'Emily Bronte'] },
{ c: 'Screen Lines', t: 5, q: 'Which character in The Karate Kid runs the Cobra Kai dojo?', a: 'John Kreese', d: ['Mr. Miyagi', 'Daniel LaRusso', 'Johnny Lawrence'] },
],

// ── Day 7 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president introduced himself to the country by saying he was a Ford, not a Lincoln?', a: 'Gerald Ford', d: ['Jimmy Carter', 'Richard Nixon', 'Ronald Reagan'] },
{ c: 'History & War', t: 1, q: 'Which Soviet leader told Western diplomats that we will bury you?', a: 'Nikita Khrushchev', d: ['Joseph Stalin', 'Leonid Brezhnev', 'Vyacheslav Molotov'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which astrophysicist said the good thing about science is that it is true whether or not you believe in it?', a: 'Neil deGrasse Tyson', d: ['Carl Sagan', 'Brian Cox', 'Stephen Hawking'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with four children named Peter, Susan, Edmund and Lucy?', a: 'The Lion, the Witch and the Wardrobe', d: ['The Hobbit', 'Peter Pan', 'The Secret Garden'] },
{ c: 'Screen Lines', t: 1, q: 'Which character decides they are going to need a bigger boat in Jaws?', a: 'Chief Brody', d: ['Quint', 'Matt Hooper', 'Mayor Vaughn'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president joked that the nine most terrifying words are that he is from the government and here to help?', a: 'Ronald Reagan', d: ['George H. W. Bush', 'Barry Goldwater', 'Gerald Ford'] },
{ c: 'History & War', t: 2, q: 'Who warned a Missouri audience in 1946 that an iron curtain had descended across the continent?', a: 'Winston Churchill', d: ['Harry S. Truman', 'Clement Attlee', 'George Marshall'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which economist described the market being guided by an invisible hand?', a: 'Adam Smith', d: ['David Ricardo', 'John Maynard Keynes', 'Thomas Malthus'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel amends its commandment to say that some animals are more equal than others?', a: 'Animal Farm', d: ['Nineteen Eighty-Four', 'Brave New World', 'Lord of the Flies'] },
{ c: 'Screen Lines', t: 2, q: "Which character says 'Hasta la vista, baby' in Terminator 2?", a: 'The T-800', d: ['Miles Dyson', 'Sarah Connor', 'The T-1000'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president said his country must be the great arsenal of democracy?', a: 'Franklin D. Roosevelt', d: ['Woodrow Wilson', 'Harry S. Truman', 'Dwight D. Eisenhower'] },
{ c: 'History & War', t: 3, q: "Which radio reporter broke down at the Hindenburg disaster crying 'Oh, the humanity!'?", a: 'Herbert Morrison', d: ['Edward R. Murrow', 'Walter Winchell', 'Lowell Thomas'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which thinker called dream interpretation the royal road to the unconscious?', a: 'Sigmund Freud', d: ['Carl Jung', 'Alfred Adler', 'Jean Piaget'] },
{ c: 'Books & Authors', t: 3, q: "Which novelist called his autobiography 'Speak, Memory'?", a: 'Vladimir Nabokov', d: ['Joseph Brodsky', 'Isaac Babel', 'Boris Pasternak'] },
{ c: 'Screen Lines', t: 3, q: "Which character rallies a party with the chant 'Toga! Toga!' in Animal House?", a: 'Bluto Blutarsky', d: ['Otter', 'Boon', 'Dean Wormer'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which New York governor said you campaign in poetry and govern in prose?', a: 'Mario Cuomo', d: ['Nelson Rockefeller', 'Hugh Carey', 'George Pataki'] },
{ c: 'History & War', t: 4, q: 'Which Confederate commander said it is well that war is so terrible, or we should grow too fond of it?', a: 'Robert E. Lee', d: ['Stonewall Jackson', 'James Longstreet', 'Jefferson Davis'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which geneticist wrote that nothing in biology makes sense except in the light of evolution?', a: 'Theodosius Dobzhansky', d: ['Ernst Mayr', 'J. B. S. Haldane', 'Julian Huxley'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet warned that things fall apart and the centre cannot hold?', a: 'W. B. Yeats', d: ['T. S. Eliot', 'Ezra Pound', 'Robert Graves'] },
{ c: 'Screen Lines', t: 4, q: 'Which character swears never to be hungry again in Gone with the Wind?', a: "Scarlett O'Hara", d: ['Rhett Butler', 'Melanie Hamilton', 'Mammy'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which German chancellor called politics the art of the possible?', a: 'Otto von Bismarck', d: ['Konrad Adenauer', 'Gustav Stresemann', 'Willy Brandt'] },
{ c: 'History & War', t: 5, q: 'Which polar explorer wrote a last message begging that his people be looked after?', a: 'Robert Falcon Scott', d: ['Ernest Shackleton', 'Roald Amundsen', 'Edward Wilson'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which statistician wrote that all models are wrong, but some are useful?', a: 'George Box', d: ['Ronald Fisher', 'John Tukey', 'Karl Pearson'] },
{ c: 'Books & Authors', t: 5, q: "Which novelist wrote that the past is never dead, and is not even past?", a: 'William Faulkner', d: ['Ernest Hemingway', "Flannery O'Connor", 'Eudora Welty'] },
{ c: 'Screen Lines', t: 5, q: "Which character says 'Leave the gun. Take the cannoli' in The Godfather?", a: 'Peter Clemenza', d: ['Vito Corleone', 'Sonny Corleone', 'Rocco Lampone'] },
],

// ── Day 8 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president described America in his farewell address as a shining city upon a hill?', a: 'Ronald Reagan', d: ['John F. Kennedy', 'George H. W. Bush', 'Jimmy Carter'] },
{ c: 'History & War', t: 1, q: 'Which boxer announced to the world that he was the greatest?', a: 'Muhammad Ali', d: ['Joe Frazier', 'Sugar Ray Robinson', 'George Foreman'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which painter worked through a Blue Period before co-founding Cubism with Georges Braque?', a: 'Pablo Picasso', d: ['Henri Matisse', 'Salvador Dali', 'Marc Chagall'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a couple of number four, Privet Drive, proud to say they are perfectly normal?', a: "Harry Potter and the Philosopher's Stone", d: ['The Worst Witch', 'Matilda', 'The BFG'] },
{ c: 'Screen Lines', t: 1, q: "Which character observes that 'life finds a way' in Jurassic Park?", a: 'Ian Malcolm', d: ['Alan Grant', 'Ellie Sattler', 'John Hammond'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told Congress in 2002 of an axis of evil?', a: 'George W. Bush', d: ['Bill Clinton', 'Barack Obama', 'Ronald Reagan'] },
{ c: 'History & War', t: 2, q: 'Which commander told his troops on the eve of D-Day that the eyes of the world were upon them?', a: 'Dwight D. Eisenhower', d: ['Bernard Montgomery', 'Omar Bradley', 'George Marshall'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which architect made his motto that less is more?', a: 'Ludwig Mies van der Rohe', d: ['Le Corbusier', 'Frank Lloyd Wright', 'Walter Gropius'] },
{ c: 'Books & Authors', t: 2, q: "Which dramatist wrote the line about the lady protesting too much?", a: 'William Shakespeare', d: ['Christopher Marlowe', 'Ben Jonson', 'John Webster'] },
{ c: 'Screen Lines', t: 2, q: "Which character shrieks 'I'm melting!' in The Wizard of Oz?", a: 'The Wicked Witch of the West', d: ['Glinda', 'The Scarecrow', 'Dorothy Gale'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which senator claimed in 1950 to hold in his hand a list of communists in the State Department?', a: 'Joseph McCarthy', d: ['Richard Nixon', 'Pat McCarran', 'Karl Mundt'] },
{ c: 'History & War', t: 3, q: "Which former slave is famously remembered as asking an 1851 women's convention whether she was not a woman?", a: 'Sojourner Truth', d: ['Harriet Tubman', 'Frederick Douglass', 'Susan B. Anthony'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which economist answered long-range forecasts by noting that in the long run we are all dead?', a: 'John Maynard Keynes', d: ['Milton Friedman', 'Friedrich Hayek', 'Joseph Schumpeter'] },
{ c: 'Books & Authors', t: 3, q: "Which novelist opened a book with a screaming that comes across the sky?", a: 'Thomas Pynchon', d: ['Don DeLillo', 'William Gaddis', 'Robert Coover'] },
{ c: 'Screen Lines', t: 3, q: 'Which character says you either get busy living or get busy dying in The Shawshank Redemption?', a: 'Andy Dufresne', d: ['Captain Hadley', 'Warden Norton', 'Brooks Hatlen'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president told an interviewer that when the president does it, that means it is not illegal?', a: 'Richard Nixon', d: ['Lyndon B. Johnson', 'Ronald Reagan', 'Bill Clinton'] },
{ c: 'History & War', t: 4, q: "Which member of a doomed polar expedition walked out saying he was just going outside and might be some time?", a: 'Lawrence Oates', d: ['Robert Falcon Scott', 'Edward Wilson', 'Henry Bowers'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which essayist held that what can be asserted without evidence can be dismissed without evidence?', a: 'Christopher Hitchens', d: ['Richard Dawkins', 'Daniel Dennett', 'Sam Harris'] },
{ c: 'Books & Authors', t: 4, q: "Which novelist used 'So it goes' as a refrain after every death in a book?", a: 'Kurt Vonnegut', d: ['Joseph Heller', 'Richard Brautigan', 'Tom Robbins'] },
{ c: 'Screen Lines', t: 4, q: "Which character bellows 'Stella!' up a staircase in A Streetcar Named Desire?", a: 'Stanley Kowalski', d: ['Blanche DuBois', 'Harold Mitchell', 'Steve Hubbell'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which French premier said war is too important to be left to the generals?', a: 'Georges Clemenceau', d: ['Raymond Poincare', 'Aristide Briand', 'Philippe Petain'] },
{ c: 'History & War', t: 5, q: 'Which Byzantine empress is quoted as saying that the imperial purple makes a fine shroud?', a: 'Theodora', d: ['Irene', 'Zoe', 'Anna Komnene'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which Greek sophist declared that man is the measure of all things?', a: 'Protagoras', d: ['Heraclitus', 'Parmenides', 'Democritus'] },
{ c: 'Books & Authors', t: 5, q: 'Which novelist wrote that the world is a fine place and worth fighting for?', a: 'Ernest Hemingway', d: ['John Steinbeck', 'F. Scott Fitzgerald', 'John Dos Passos'] },
{ c: 'Screen Lines', t: 5, q: "Which character yells 'I'm walking here!' at a taxi in Midnight Cowboy?", a: 'Ratso Rizzo', d: ['Joe Buck', "Mr. O'Daniel", 'Cass'] },
],

// ── Day 9 ──────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which future president drafted the words about life, liberty and the pursuit of happiness?', a: 'Thomas Jefferson', d: ['John Adams', 'Benjamin Franklin', 'James Madison'] },
{ c: 'History & War', t: 1, q: 'Which seamstress refused to give up her bus seat in Montgomery and later said she was tired of giving in?', a: 'Rosa Parks', d: ['Coretta Scott King', 'Fannie Lou Hamer', 'Daisy Bates'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which physicist advised people to look up at the stars and not down at their feet?', a: 'Stephen Hawking', d: ['Carl Sagan', 'Richard Feynman', 'Neil deGrasse Tyson'] },
{ c: 'Books & Authors', t: 1, q: "Which childrens novel opens by asking where Papa is going with that axe?", a: "Charlotte's Web", d: ['Stuart Little', 'The Trumpet of the Swan', "Mr. Popper's Penguins"] },
{ c: 'Screen Lines', t: 1, q: 'Which character in The Princess Bride keeps announcing that he has come to avenge his father?', a: 'Inigo Montoya', d: ['Westley', 'Fezzik', 'Vizzini'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told Congress in 1965 that we shall overcome?', a: 'Lyndon B. Johnson', d: ['John F. Kennedy', 'Richard Nixon', 'Hubert Humphrey'] },
{ c: 'History & War', t: 2, q: 'Which commodore opened the battle of Manila Bay by telling his captain to fire when ready?', a: 'George Dewey', d: ['David Farragut', 'William Sampson', 'Winfield Scott Schley'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which historian wrote that power tends to corrupt and absolute power corrupts absolutely?', a: 'Lord Acton', d: ['Edmund Burke', 'John Stuart Mill', 'Thomas Macaulay'] },
{ c: 'Books & Authors', t: 2, q: 'Which novelist ended a book with a man going to a far, far better rest than he had ever known?', a: 'Charles Dickens', d: ['Wilkie Collins', 'William Makepeace Thackeray', 'Anthony Trollope'] },
{ c: 'Screen Lines', t: 2, q: "Which character sings 'Just keep swimming' in Finding Nemo?", a: 'Dory', d: ['Marlin', 'Nemo', 'Crush'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which politician told reporters after a lost race that they would not have him to kick around any more?', a: 'Richard Nixon', d: ['Barry Goldwater', 'George Romney', 'Edmund Muskie'] },
{ c: 'History & War', t: 3, q: 'Which American captain is traditionally said to have replied that he had not yet begun to fight?', a: 'John Paul Jones', d: ['Oliver Hazard Perry', 'Stephen Decatur', 'David Farragut'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which philosopher wrote that those who cannot remember the past are condemned to repeat it?', a: 'George Santayana', d: ['Edmund Burke', 'Arnold Toynbee', 'Oswald Spengler'] },
{ c: 'Books & Authors', t: 3, q: 'Which character in Ulysses calls history a nightmare from which he is trying to awake?', a: 'Stephen Dedalus', d: ['Leopold Bloom', 'Molly Bloom', 'Buck Mulligan'] },
{ c: 'Screen Lines', t: 3, q: 'Which character says that where they are going they do not need roads?', a: 'Doc Brown', d: ['Marty McFly', 'Biff Tannen', 'George McFly'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president told a grand jury that it depends on what the meaning of the word is is?', a: 'Bill Clinton', d: ['Richard Nixon', 'Ronald Reagan', 'George W. Bush'] },
{ c: 'History & War', t: 4, q: 'Which queen is recorded as saying she would be good, on learning she would inherit the throne?', a: 'Victoria', d: ['Elizabeth I', 'Anne', 'Mary II'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'The line about the most adaptable species surviving is routinely credited to Charles Darwin. Who actually wrote it?', a: 'A business professor, Leon Megginson', d: ['Herbert Spencer', 'Thomas Huxley', 'Alfred Russel Wallace'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet concluded that what will survive of us is love?', a: 'Philip Larkin', d: ['Ted Hughes', 'Thom Gunn', 'Louis MacNeice'] },
{ c: 'Screen Lines', t: 4, q: "Which character has the last line of Some Like It Hot, 'Nobody's perfect'?", a: 'Osgood Fielding III', d: ['Joe', 'Jerry', 'Sugar Kane'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Roman statesman ended every speech by insisting that Carthage must be destroyed?', a: 'Cato the Elder', d: ['Cicero', 'Scipio Africanus', 'Sulla'] },
{ c: 'History & War', t: 5, q: 'Which Union colonel ordered bayonets fixed as his regiment ran out of ammunition at Little Round Top?', a: 'Joshua Chamberlain', d: ['George Meade', 'Winfield Hancock', 'Gouverneur Warren'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which writer held that when a distinguished elderly scientist calls something impossible, he is very probably wrong?', a: 'Arthur C. Clarke', d: ['Isaac Asimov', 'Robert Heinlein', 'Frank Herbert'] },
{ c: 'Books & Authors', t: 5, q: "Which novelist opened a book by declaring 'I am an invisible man'?", a: 'Ralph Ellison', d: ['James Baldwin', 'Richard Wright', 'Toni Morrison'] },
{ c: 'Screen Lines', t: 5, q: 'Which character in Rocky orders his corner man to cut him between rounds?', a: 'Rocky Balboa', d: ['Apollo Creed', 'Mickey Goldmill', 'Paulie Pennino'] },
],

// ── Day 10 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president was sworn in by lamplight at the family farm, by his own father?', a: 'Calvin Coolidge', d: ['Herbert Hoover', 'Warren G. Harding', 'Theodore Roosevelt'] },
{ c: 'History & War', t: 1, q: "Which broadcaster signed off his programmes with 'Good night, and good luck'?", a: 'Edward R. Murrow', d: ['Walter Cronkite', 'Eric Sevareid', 'Lowell Thomas'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which computing pioneer popularised the story of the moth taped into a Harvard Mark II logbook?', a: 'Grace Hopper', d: ['Ada Lovelace', 'Alan Turing', 'John von Neumann'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with the Mole spring-cleaning his little home?', a: 'The Wind in the Willows', d: ['Watership Down', 'The Tale of Peter Rabbit', 'Winnie-the-Pooh'] },
{ c: 'Screen Lines', t: 1, q: "Which character taunts Batman with 'Why so serious?' in The Dark Knight?", a: 'The Joker', d: ['Harvey Dent', 'Commissioner Gordon', 'Carmine Falcone'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which prime minister told an interviewer there is no such thing as society?', a: 'Margaret Thatcher', d: ['John Major', 'Edward Heath', 'Harold Wilson'] },
{ c: 'History & War', t: 2, q: 'Which Texan commander led the charge at San Jacinto under the cry to remember the Alamo?', a: 'Sam Houston', d: ['Davy Crockett', 'Jim Bowie', 'Stephen F. Austin'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which naturalist wrote that tugging at a single thing in nature finds it hitched to everything else?', a: 'John Muir', d: ['Henry David Thoreau', 'Aldo Leopold', 'Rachel Carson'] },
{ c: 'Books & Authors', t: 2, q: 'Which novelist wrote that whatever souls are made of, his and hers are the same?', a: 'Emily Bronte', d: ['Charlotte Bronte', 'Anne Bronte', 'Elizabeth Gaskell'] },
{ c: 'Screen Lines', t: 2, q: "Which character signs off with 'Yippee-ki-yay' in Die Hard?", a: 'John McClane', d: ['Hans Gruber', 'Sergeant Al Powell', 'Holly Gennero'] },

{ c: 'Presidents & Politics', t: 3, q: "Which vice president said the office was not worth a bucket of warm spit?", a: 'John Nance Garner', d: ['Harry S. Truman', 'Alben Barkley', 'Hubert Humphrey'] },
{ c: 'History & War', t: 3, q: 'Which pamphleteer wrote that these are the times that try mens souls?', a: 'Thomas Paine', d: ['Samuel Adams', 'Patrick Henry', 'Benjamin Rush'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which mathematician said God made the integers and all else is the work of man?', a: 'Leopold Kronecker', d: ['Georg Cantor', 'Karl Weierstrass', 'David Hilbert'] },
{ c: 'Books & Authors', t: 3, q: 'Which playwright wrote that we are all in the gutter, but some of us are looking at the stars?', a: 'Oscar Wilde', d: ['George Bernard Shaw', 'W. B. Yeats', 'Aubrey Beardsley'] },
{ c: 'Screen Lines', t: 3, q: "Which character demands 'Say what again' in Pulp Fiction?", a: 'Jules Winnfield', d: ['Vincent Vega', 'Marsellus Wallace', 'Butch Coolidge'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president told the country on taking office that our long national nightmare is over?', a: 'Gerald Ford', d: ['Jimmy Carter', 'Richard Nixon', 'Lyndon B. Johnson'] },
{ c: 'History & War', t: 4, q: 'Which American commander reported that we have met the enemy and they are ours?', a: 'Oliver Hazard Perry', d: ['John Paul Jones', 'David Farragut', 'Stephen Decatur'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which thinker coined the warning that the map is not the territory?', a: 'Alfred Korzybski', d: ['Ludwig Wittgenstein', 'Ferdinand de Saussure', 'Charles Peirce'] },
{ c: 'Books & Authors', t: 4, q: "Which poet titled a work 'I Sing the Body Electric'?", a: 'Walt Whitman', d: ['Emily Dickinson', 'Hart Crane', 'Carl Sandburg'] },
{ c: 'Screen Lines', t: 4, q: "Which character screams that Soylent Green is people?", a: 'Detective Thorn', d: ['Sol Roth', 'Governor Santini', 'Shirl'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Roman consul opened a prosecution by asking how long the accused would abuse their patience?', a: 'Cicero', d: ['Cato the Elder', 'Julius Caesar', 'Sulla'] },
{ c: 'History & War', t: 5, q: 'Which admiral wrote the dispatch reporting the victory at Trafalgar and the death of his commander?', a: 'Cuthbert Collingwood', d: ['Thomas Hardy', 'John Jervis', 'Edward Codrington'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which Greek thinker held that war is the father and king of all things?', a: 'Heraclitus', d: ['Parmenides', 'Zeno of Elea', 'Anaximander'] },
{ c: 'Books & Authors', t: 5, q: "Which novelist took her title from the line about the heart being a lonely hunter?", a: 'Carson McCullers', d: ["Flannery O'Connor", 'Eudora Welty', 'Katherine Anne Porter'] },
{ c: 'Screen Lines', t: 5, q: 'Which character protests that you cannot fight in here, because this is the War Room?', a: 'President Merkin Muffley', d: ['General Turgidson', 'Dr. Strangelove', 'Group Captain Mandrake'] },
],

// ── Day 11 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: "Which president was carried into office on the slogan 'I like Ike'?", a: 'Dwight D. Eisenhower', d: ['Harry S. Truman', 'Richard Nixon', 'Adlai Stevenson'] },
{ c: 'History & War', t: 1, q: "Which preacher closed a 1963 speech with the cry 'Free at last, free at last'?", a: 'Martin Luther King Jr.', d: ['Ralph Abernathy', 'Jesse Jackson', 'Andrew Young'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which primatologist wrote that what you do makes a difference and you have to decide what kind of difference to make?', a: 'Jane Goodall', d: ['Dian Fossey', 'Birute Galdikas', 'Rachel Carson'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens by saying that all children, except one, grow up?', a: 'Peter Pan', d: ['The Secret Garden', "Alice's Adventures in Wonderland", 'The Wind in the Willows'] },
{ c: 'Screen Lines', t: 1, q: 'Which character orders a martini shaken, not stirred, across the 007 films?', a: 'James Bond', d: ['Felix Leiter', 'Ernst Stavro Blofeld', 'M'] },

{ c: 'Presidents & Politics', t: 2, q: "Whose 1992 campaign headquarters posted the reminder about the economy?", a: 'Bill Clinton', d: ['George H. W. Bush', 'Ross Perot', 'Paul Tsongas'] },
{ c: 'History & War', t: 2, q: 'Which exiled officer broadcast from London in 1940 that the flame of French resistance must not go out?', a: 'Charles de Gaulle', d: ['Philippe Petain', 'Jean Moulin', 'Pierre Laval'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which physicist said he thought he could safely say that nobody understands quantum mechanics?', a: 'Richard Feynman', d: ['Niels Bohr', 'Werner Heisenberg', 'Paul Dirac'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens with the claim that someone must have slandered Josef K.?', a: 'The Trial', d: ['The Castle', 'The Metamorphosis', 'Amerika'] },
{ c: 'Screen Lines', t: 2, q: 'Which character turns on the crowd and demands to know whether they are not entertained?', a: 'Maximus', d: ['Commodus', 'Proximo', 'Juba'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president promised in his first inaugural peace and honest friendship with all nations, entangling alliances with none?', a: 'Thomas Jefferson', d: ['George Washington', 'John Adams', 'James Monroe'] },
{ c: 'History & War', t: 3, q: "The greeting 'Lafayette, we are here' is usually credited to General Pershing. Which of his officers actually said it?", a: 'Charles E. Stanton', d: ['Douglas MacArthur', 'Peyton March', 'Tasker Bliss'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which chemist observed that in the field of observation, chance favours only the prepared mind?', a: 'Louis Pasteur', d: ['Robert Koch', 'Joseph Lister', 'Antoine Lavoisier'] },
{ c: 'Books & Authors', t: 3, q: "Which character in To Kill a Mockingbird advises climbing into someone's skin and walking around in it?", a: 'Atticus Finch', d: ['Scout Finch', 'Jem Finch', 'Calpurnia'] },
{ c: 'Screen Lines', t: 3, q: "Which character announces 'They're here' in Poltergeist?", a: 'Carol Anne Freeling', d: ['Diane Freeling', 'Steve Freeling', 'Tangina Barrons'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president described the office he held as a bully pulpit?', a: 'Theodore Roosevelt', d: ['William McKinley', 'Woodrow Wilson', 'William Howard Taft'] },
{ c: 'History & War', t: 4, q: 'Which Ottoman commander told his men at Gallipoli that he was not ordering them to attack but to die?', a: 'Mustafa Kemal Ataturk', d: ['Enver Pasha', 'Liman von Sanders', 'Talaat Pasha'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which philosopher wrote of the starry heavens above him and the moral law within him?', a: 'Immanuel Kant', d: ['Georg Hegel', 'Johann Fichte', 'Arthur Schopenhauer'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet addressed a tiger burning bright in the forests of the night?', a: 'William Blake', d: ['Samuel Taylor Coleridge', 'Robert Burns', 'William Cowper'] },
{ c: 'Screen Lines', t: 4, q: 'Which character invites a cornered gunman to make his day and asks whether he feels lucky?', a: 'Harry Callahan', d: ['Scorpio', 'Chief Inspector Bressler', 'Chico Gonzalez'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Canadian prime minister said the state has no business in the bedrooms of the nation?', a: 'Pierre Trudeau', d: ['Lester Pearson', 'John Diefenbaker', 'Brian Mulroney'] },
{ c: 'History & War', t: 5, q: 'Which Persian king had his victories carved into a cliff face at Behistun?', a: 'Darius I', d: ['Cyrus the Great', 'Xerxes', 'Artaxerxes'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which medieval friar gave his name to the principle that entities should not be multiplied beyond necessity?', a: 'William of Ockham', d: ['Thomas Aquinas', 'Duns Scotus', 'Roger Bacon'] },
{ c: 'Books & Authors', t: 5, q: "Which novelist opened a book with ships at a distance carrying every man's wish on board?", a: 'Zora Neale Hurston', d: ['Nella Larsen', 'Jean Toomer', 'Countee Cullen'] },
{ c: 'Screen Lines', t: 5, q: "Which character keeps asking 'What's in the box?' at the end of Se7en?", a: 'Detective Mills', d: ['Detective Somerset', 'John Doe', 'Tracy Mills'] },
],

// ── Day 12 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: "Which president was elected on the slogan 'Tippecanoe and Tyler too'?", a: 'William Henry Harrison', d: ['Martin Van Buren', 'Zachary Taylor', 'James K. Polk'] },
{ c: 'History & War', t: 1, q: "Asked in 1922 whether he could see anything inside a newly opened tomb, which archaeologist replied 'Yes, wonderful things'?", a: 'Howard Carter', d: ['Flinders Petrie', 'Leonard Woolley', 'Arthur Evans'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which nurse said before her execution in 1915 that patriotism is not enough?', a: 'Edith Cavell', d: ['Florence Nightingale', 'Mary Seacole', 'Clara Barton'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a woman announcing that she would buy the flowers herself?', a: 'Mrs Dalloway', d: ['To the Lighthouse', 'Orlando', 'The Waves'] },
{ c: 'Screen Lines', t: 1, q: "Which character roars 'You shall not pass!' on a bridge in The Fellowship of the Ring?", a: 'Gandalf', d: ['Aragorn', 'Frodo Baggins', 'Boromir'] },

{ c: 'Presidents & Politics', t: 2, q: "Which candidate ran in 1964 on the slogan 'In your heart, you know he's right'?", a: 'Barry Goldwater', d: ['Richard Nixon', 'Nelson Rockefeller', 'George Romney'] },
{ c: 'History & War', t: 2, q: 'Who told Parliament in 1940 that never was so much owed by so many to so few?', a: 'Winston Churchill', d: ['Hugh Dowding', 'Clement Attlee', 'Anthony Eden'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which chemist wrote that nothing is created in the operations of art or of nature, matter being equal before and after?', a: 'Antoine Lavoisier', d: ['Joseph Priestley', 'Henry Cavendish', 'John Dalton'] },
{ c: 'Books & Authors', t: 2, q: "Which novel opens 'Mother died today. Or maybe yesterday, I can't be sure'?", a: 'The Stranger', d: ['Nausea', 'The Plague', 'The Fall'] },
{ c: 'Screen Lines', t: 2, q: "Which character shouts 'Run, Forrest, run!' at a boy being chased?", a: 'Jenny Curran', d: ['Forrest Gump', 'Lieutenant Dan', 'Mrs. Gump'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which prime minister told a 1957 audience that most of the people had never had it so good?', a: 'Harold Macmillan', d: ['Anthony Eden', 'Harold Wilson', 'Clement Attlee'] },
{ c: 'History & War', t: 3, q: 'Which president asked Congress in 1917 for a war to make the world safe for democracy?', a: 'Woodrow Wilson', d: ['Theodore Roosevelt', 'William Howard Taft', 'Warren G. Harding'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which American jurist wrote that the life of the law has not been logic but experience?', a: 'Oliver Wendell Holmes Jr.', d: ['Louis Brandeis', 'Learned Hand', 'Benjamin Cardozo'] },
{ c: 'Books & Authors', t: 3, q: "Which novelist took 'Only connect' as the epigraph of a novel?", a: 'E. M. Forster', d: ['Virginia Woolf', 'D. H. Lawrence', 'Ford Madox Ford'] },
{ c: 'Screen Lines', t: 3, q: "Which character orders his men to round up the usual suspects in Casablanca?", a: 'Captain Renault', d: ['Rick Blaine', 'Major Strasser', 'Victor Laszlo'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president told Congress in 1861 that there can be no successful appeal from a ballot to a bullet?', a: 'Abraham Lincoln', d: ['Frederick Douglass', 'Ulysses S. Grant', 'Andrew Johnson'] },
{ c: 'History & War', t: 4, q: "Which pope is said to have launched the First Crusade with the cry 'God wills it'?", a: 'Urban II', d: ['Gregory VII', 'Innocent III', 'Leo IX'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which economist described capitalism as a process of creative destruction?', a: 'Joseph Schumpeter', d: ['John Maynard Keynes', 'Friedrich Hayek', 'Thorstein Veblen'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet addressed autumn as a season of mists and mellow fruitfulness?', a: 'John Keats', d: ['Percy Bysshe Shelley', 'Lord Byron', 'Robert Burns'] },
{ c: 'Screen Lines', t: 4, q: "Which character whips up a crowd chanting 'Attica!' in Dog Day Afternoon?", a: 'Sonny Wortzik', d: ['Sal Naturile', 'Detective Moretti', 'Leon Shermer'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Piedmontese statesman called for a free church in a free state?', a: 'Camillo Cavour', d: ["Massimo d'Azeglio", 'Giuseppe Garibaldi', 'Giuseppe Mazzini'] },
{ c: 'History & War', t: 5, q: 'Which Prussian theorist wrote that war is the continuation of policy by other means?', a: 'Carl von Clausewitz', d: ['Antoine-Henri Jomini', 'Helmuth von Moltke', 'Alfred von Schlieffen'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which sociologist wrote about the Protestant ethic and the spirit of capitalism?', a: 'Max Weber', d: ['Emile Durkheim', 'Georg Simmel', 'Ferdinand Tonnies'] },
{ c: 'Books & Authors', t: 5, q: "Which novelist opened a book with a stately, plump man coming from the stairhead?", a: 'James Joyce', d: ['Samuel Beckett', "Flann O'Brien", "Sean O'Casey"] },
{ c: 'Screen Lines', t: 5, q: "Which character says 'you're trying to seduce me' in The Graduate?", a: 'Benjamin Braddock', d: ['Mrs. Robinson', 'Elaine Robinson', 'Mr. Braddock'] },
],

// ── Day 13 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: "Which president's 1928 campaign advertised a chicken in every pot?", a: 'Herbert Hoover', d: ['Calvin Coolidge', 'Warren G. Harding', 'Alfred E. Smith'] },
{ c: 'History & War', t: 1, q: "Which aviator flew the Atlantic alone in 1927 and called his memoir 'We'?", a: 'Charles Lindbergh', d: ['Amelia Earhart', 'Wiley Post', 'Richard Byrd'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which reformer wrote that the very first requirement in a hospital is that it should do the sick no harm?', a: 'Florence Nightingale', d: ['Mary Seacole', 'Clara Barton', 'Dorothea Dix'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a great fish moving silently through the night water?', a: 'Jaws', d: ['Moby-Dick', 'The Old Man and the Sea', 'Twenty Thousand Leagues Under the Sea'] },
{ c: 'Screen Lines', t: 1, q: "Which character insists there's no crying in baseball in A League of Their Own?", a: 'Jimmy Dugan', d: ['Dottie Hinson', 'Kit Keller', 'Marla Hooch'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president warned in 1961 of the disastrous rise of misplaced power?', a: 'Dwight D. Eisenhower', d: ['John F. Kennedy', 'Harry S. Truman', 'Lyndon B. Johnson'] },
{ c: 'History & War', t: 2, q: 'Which commander declared the die was cast as he crossed a small river into Italy?', a: 'Julius Caesar', d: ['Sulla', 'Pompey', 'Mark Antony'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which astronomer wrote that the book of nature is written in the language of mathematics?', a: 'Galileo Galilei', d: ['Johannes Kepler', 'Nicolaus Copernicus', 'Tycho Brahe'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens with a colonel facing a firing squad and remembering a distant afternoon?', a: 'One Hundred Years of Solitude', d: ['Love in the Time of Cholera', 'The Autumn of the Patriarch', 'Pedro Paramo'] },
{ c: 'Screen Lines', t: 2, q: "Which character shouts 'I'm the king of the world!' from a ship's bow?", a: 'Jack Dawson', d: ['Rose DeWitt Bukater', 'Cal Hockley', 'Captain Smith'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which humorist joked that he belonged to no organized political party, being a Democrat?', a: 'Will Rogers', d: ['Mark Twain', 'H. L. Mencken', 'Ambrose Bierce'] },
{ c: 'History & War', t: 3, q: 'Which Chinese leader wrote that a revolution is not a dinner party?', a: 'Mao Zedong', d: ['Zhou Enlai', 'Deng Xiaoping', 'Sun Yat-sen'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which French thinker declared that property is theft?', a: 'Pierre-Joseph Proudhon', d: ['Mikhail Bakunin', 'Peter Kropotkin', 'Georges Sorel'] },
{ c: 'Books & Authors', t: 3, q: 'Which novel ends by warning never to tell anybody anything, or you start missing everybody?', a: 'The Catcher in the Rye', d: ['Franny and Zooey', 'A Separate Peace', 'On the Road'] },
{ c: 'Screen Lines', t: 3, q: "Which character corrects a sheriff with 'They call me MISTER Tibbs!'?", a: 'Virgil Tibbs', d: ['Chief Gillespie', 'Sam Wood', 'Eric Endicott'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president called the White House the finest prison in the world?', a: 'Harry S. Truman', d: ['Franklin D. Roosevelt', 'Lyndon B. Johnson', 'Dwight D. Eisenhower'] },
{ c: 'History & War', t: 4, q: 'Which Nez Perce leader surrendered in 1877 saying he would fight no more forever?', a: 'Chief Joseph', d: ['Sitting Bull', 'Crazy Horse', 'Geronimo'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which mathematician opened a 1950 paper by asking whether machines can think?', a: 'Alan Turing', d: ['John von Neumann', 'Claude Shannon', 'Norbert Wiener'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet put the boast of a king of kings on a shattered statue in the desert?', a: 'Percy Bysshe Shelley', d: ['Lord Byron', 'John Keats', 'William Wordsworth'] },
{ c: 'Screen Lines', t: 4, q: 'Which character calls out to a volleyball named Wilson in Cast Away?', a: 'Chuck Noland', d: ['Kelly Frears', 'Stan', 'Bettina Peterson'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Irish rebel asked at his 1803 trial that no man write his epitaph?', a: 'Robert Emmet', d: ['Wolfe Tone', "Daniel O'Connell", 'Charles Stewart Parnell'] },
{ c: 'History & War', t: 5, q: 'Which conqueror is quoted in Persian chronicles as calling himself the punishment of God?', a: 'Genghis Khan', d: ['Timur', 'Kublai Khan', 'Hulagu Khan'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which Roman emperor filled a private notebook with the reminder to do every act as if it were his last?', a: 'Marcus Aurelius', d: ['Hadrian', 'Trajan', 'Antoninus Pius'] },
{ c: 'Books & Authors', t: 5, q: 'Which blind poet ended a sonnet by saying they also serve who only stand and wait?', a: 'John Milton', d: ['John Donne', 'George Herbert', 'Andrew Marvell'] },
{ c: 'Screen Lines', t: 5, q: "Which character breathes 'The horror, the horror' at the end of Apocalypse Now?", a: 'Colonel Kurtz', d: ['Captain Willard', 'Lieutenant Colonel Kilgore', 'Chef'] },
],

// ── Day 14 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which future president was urged by his wife in a 1776 letter to remember the ladies?', a: 'John Adams', d: ['Thomas Jefferson', 'George Washington', 'James Madison'] },
{ c: 'History & War', t: 1, q: 'Which aviator wrote that adventure is worthwhile in itself?', a: 'Amelia Earhart', d: ['Bessie Coleman', 'Beryl Markham', 'Jacqueline Cochran'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which painter wrote to his brother that he was always doing what he could not do yet, in order to learn how?', a: 'Vincent van Gogh', d: ['Paul Gauguin', 'Paul Cezanne', 'Claude Monet'] },
{ c: 'Books & Authors', t: 1, q: 'Which novella follows a riverboat journey up the Congo in search of a man named Kurtz?', a: 'Heart of Darkness', d: ['Lord Jim', 'Typhoon', 'The Secret Agent'] },
{ c: 'Screen Lines', t: 1, q: "Which character ends a press conference by announcing 'I am Iron Man'?", a: 'Tony Stark', d: ['Pepper Potts', 'James Rhodes', 'Obadiah Stane'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president called for a thousand points of light?', a: 'George H. W. Bush', d: ['Ronald Reagan', 'Bill Clinton', 'Bob Dole'] },
{ c: 'History & War', t: 2, q: 'Which admiral died at Trafalgar giving thanks that he had done his duty?', a: 'Horatio Nelson', d: ['Cuthbert Collingwood', 'John Jervis', 'Adam Duncan'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which mathematician claimed a marvellous proof that the margin was too narrow to contain?', a: 'Pierre de Fermat', d: ['Blaise Pascal', 'Rene Descartes', 'Leonhard Euler'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens by saying there was no possibility of taking a walk that day?', a: 'Jane Eyre', d: ['Wuthering Heights', 'Villette', 'Agnes Grey'] },
{ c: 'Screen Lines', t: 2, q: 'Which character asks a shopkeeper what is the most he ever lost on a coin toss?', a: 'Anton Chigurh', d: ['Llewelyn Moss', 'Sheriff Ed Tom Bell', 'Carson Wells'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which politician defended a gift dog in a televised speech in 1952?', a: 'Richard Nixon', d: ['Dwight D. Eisenhower', 'Adlai Stevenson', 'Estes Kefauver'] },
{ c: 'History & War', t: 3, q: 'Which pilot commanded the bomber named for his mother over Hiroshima?', a: 'Paul Tibbets', d: ['Charles Sweeney', 'Curtis LeMay', 'Thomas Ferebee'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which Greek physician gave medicine the injunction to help, or at least to do no harm?', a: 'Hippocrates', d: ['Galen', 'Avicenna', 'Paracelsus'] },
{ c: 'Books & Authors', t: 3, q: 'Which novelist gave her creature the warning to beware, for he was fearless and therefore powerful?', a: 'Mary Shelley', d: ['Ann Radcliffe', 'Charlotte Bronte', 'Bram Stoker'] },
{ c: 'Screen Lines', t: 3, q: 'Which character insists that nobody calls him chicken in Back to the Future?', a: 'Marty McFly', d: ['Doc Brown', 'Biff Tannen', 'George McFly'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which Speaker of the House made his motto that all politics is local?', a: "Tip O'Neill", d: ['Sam Rayburn', 'Newt Gingrich', 'Carl Albert'] },
{ c: 'History & War', t: 4, q: 'Which mortally wounded American captain told his crew not to give up the ship?', a: 'James Lawrence', d: ['Oliver Hazard Perry', 'John Paul Jones', 'Stephen Decatur'] },
{ c: 'Science, Letters & Ideas', t: 4, q: "Which biologist coined the word 'agnostic' to describe his own position?", a: 'Thomas Huxley', d: ['Charles Darwin', 'Herbert Spencer', 'John Tyndall'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet told his coy mistress that had they but world enough, and time?', a: 'Andrew Marvell', d: ['John Donne', 'Robert Herrick', 'Richard Lovelace'] },
{ c: 'Screen Lines', t: 4, q: "Which character tells a child 'You is kind. You is smart. You is important' in The Help?", a: 'Aibileen Clark', d: ['Skeeter Phelan', 'Minny Jackson', 'Hilly Holbrook'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Labour attorney general told the Commons in 1946 that we are the masters at the moment?', a: 'Hartley Shawcross', d: ['Clement Attlee', 'Aneurin Bevan', 'Herbert Morrison'] },
{ c: 'History & War', t: 5, q: 'Which Athenian general argued against the Sicilian expedition and was sent to lead it anyway?', a: 'Nicias', d: ['Alcibiades', 'Cleon', 'Demosthenes'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which Danish philosopher wrote that the greatest hazard of all, losing oneself, can pass unnoticed?', a: 'Soren Kierkegaard', d: ['Friedrich Nietzsche', 'Arthur Schopenhauer', 'Martin Heidegger'] },
{ c: 'Books & Authors', t: 5, q: "Which character answers every request with 'I would prefer not to'?", a: 'Bartleby', d: ['Billy Budd', 'Captain Ahab', 'Ishmael'] },
{ c: 'Screen Lines', t: 5, q: "Which character sneers that they have no badges in The Treasure of the Sierra Madre?", a: 'Gold Hat', d: ['Fred C. Dobbs', 'Howard', 'Bob Curtin'] },
],

// ── Day 15 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president opened his second inaugural with malice toward none and charity for all?', a: 'Abraham Lincoln', d: ['Andrew Johnson', 'Ulysses S. Grant', 'Rutherford B. Hayes'] },
{ c: 'History & War', t: 1, q: 'Which explorer lost his ship Endurance in the ice and brought every man home alive?', a: 'Ernest Shackleton', d: ['Robert Falcon Scott', 'Roald Amundsen', 'Douglas Mawson'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which experimenter wrote that nothing is too wonderful to be true?', a: 'Michael Faraday', d: ['James Clerk Maxwell', 'Humphry Davy', 'Lord Kelvin'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens by wondering whether the narrator will turn out to be the hero of his own life?', a: 'David Copperfield', d: ['Great Expectations', 'Oliver Twist', 'Nicholas Nickleby'] },
{ c: 'Screen Lines', t: 1, q: "Which character says 'That'll do, pig' in Babe?", a: 'Farmer Hoggett', d: ['Babe', 'Fly', 'Rex'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told the country in his inaugural to let us begin anew?', a: 'John F. Kennedy', d: ['Lyndon B. Johnson', 'Dwight D. Eisenhower', 'Harry S. Truman'] },
{ c: 'History & War', t: 2, q: 'Which British commander privately described his own soldiers as the scum of the earth?', a: 'The Duke of Wellington', d: ['Horatio Nelson', 'John Moore', 'Thomas Picton'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which mathematician wrote that the essence of mathematics lies in its freedom?', a: 'Georg Cantor', d: ['David Hilbert', 'Henri Poincare', 'Bertrand Russell'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens by saying it was love at first sight when Yossarian saw the chaplain?', a: 'Catch-22', d: ['Slaughterhouse-Five', 'The Naked and the Dead', 'From Here to Eternity'] },
{ c: 'Screen Lines', t: 2, q: 'Which character declares that he feels the need for speed in Top Gun?', a: 'Maverick', d: ['Slider', 'Iceman', 'Viper'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which founder wrote into a state constitution the ideal of a government of laws and not of men?', a: 'John Adams', d: ['Thomas Jefferson', 'James Madison', 'Alexander Hamilton'] },
{ c: 'History & War', t: 3, q: "Which leader issued the 1942 order known as 'Not one step back'?", a: 'Joseph Stalin', d: ['Georgy Zhukov', 'Kliment Voroshilov', 'Semyon Timoshenko'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which economist popularised the saying that there is no such thing as a free lunch?', a: 'Milton Friedman', d: ['John Kenneth Galbraith', 'Paul Samuelson', 'Friedrich Hayek'] },
{ c: 'Books & Authors', t: 3, q: 'Which English translator gave us the moving finger that writes and, having writ, moves on?', a: 'Edward FitzGerald', d: ['Alfred Tennyson', 'Robert Browning', 'Matthew Arnold'] },
{ c: 'Screen Lines', t: 3, q: "Which character delivers the news 'Yer a wizard, Harry'?", a: 'Rubeus Hagrid', d: ['Albus Dumbledore', 'Minerva McGonagall', 'Severus Snape'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which chief justice wrote that it is the province and duty of the judiciary to say what the law is?', a: 'John Marshall', d: ['Roger Taney', 'Oliver Wendell Holmes Jr.', 'Earl Warren'] },
{ c: 'History & War', t: 4, q: 'Which Spanish republican orator said it is better to die on your feet than to live on your knees?', a: 'Dolores Ibarruri', d: ['Francisco Largo Caballero', 'Manuel Azana', 'Buenaventura Durruti'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which psychologist warned that if your only tool is a hammer, every problem looks like a nail?', a: 'Abraham Maslow', d: ['B. F. Skinner', 'Carl Rogers', 'Erik Erikson'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet ended a poem by calling himself the master of his fate and the captain of his soul?', a: 'William Ernest Henley', d: ['Rudyard Kipling', 'A. E. Housman', 'Robert Louis Stevenson'] },
{ c: 'Screen Lines', t: 4, q: "Which character slaps a man and orders him to snap out of it in Moonstruck?", a: 'Loretta Castorini', d: ['Ronny Cammareri', 'Rose Castorini', 'Johnny Cammareri'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Athenian lawgiver defended his reforms in his own surviving verse?', a: 'Solon', d: ['Cleisthenes', 'Pericles', 'Draco'] },
{ c: 'History & War', t: 5, q: "Which Roman historian's account preserves Hannibal's boyhood oath against Rome?", a: 'Livy', d: ['Polybius', 'Tacitus', 'Sallust'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which photographer said the camera teaches people how to see without a camera?', a: 'Dorothea Lange', d: ['Ansel Adams', 'Walker Evans', 'Margaret Bourke-White'] },
{ c: 'Books & Authors', t: 5, q: "Which poet opened a famous poem with the invitation 'Let us go then, you and I'?", a: 'T. S. Eliot', d: ['Ezra Pound', 'Wallace Stevens', 'Hart Crane'] },
{ c: 'Screen Lines', t: 5, q: 'Which private investigator in Who Framed Roger Rabbit cannot stand toons?', a: 'Eddie Valiant', d: ['Roger Rabbit', 'Jessica Rabbit', 'Judge Doom'] },
],

// ── Day 16 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: "Which president told complainers that if they can't stand the heat they should get out of the kitchen?", a: 'Harry S. Truman', d: ['Dwight D. Eisenhower', 'Franklin D. Roosevelt', 'Lyndon B. Johnson'] },
{ c: 'History & War', t: 1, q: 'Which conductor of the Underground Railroad said she never lost a passenger?', a: 'Harriet Tubman', d: ['Sojourner Truth', 'Frederick Douglass', 'Harriet Beecher Stowe'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which Greek is said to have leapt from his bath shouting that he had found it?', a: 'Archimedes', d: ['Pythagoras', 'Thales', 'Euclid'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a fair-haired boy lowering himself down the last few feet of rock?', a: 'Lord of the Flies', d: ['The Coral Island', 'Robinson Crusoe', 'Treasure Island'] },
{ c: 'Screen Lines', t: 1, q: 'Which character screams after slapping on aftershave in Home Alone?', a: 'Kevin McCallister', d: ['Harry Lyme', 'Marv Merchants', 'Buzz McCallister'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told the country in 1979 that it faced a crisis of confidence?', a: 'Jimmy Carter', d: ['Gerald Ford', 'Ronald Reagan', 'Richard Nixon'] },
{ c: 'History & War', t: 2, q: 'Which Roman emperor is said to have joked on his deathbed that he was becoming a god?', a: 'Vespasian', d: ['Titus', 'Domitian', 'Nerva'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which bacteriologist found a mould killing his cultures and turned it into penicillin?', a: 'Alexander Fleming', d: ['Howard Florey', 'Ernst Chain', 'Paul Ehrlich'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens by saying that in a village of La Mancha there lived a gentleman?', a: 'Don Quixote', d: ['Lazarillo de Tormes', 'The Trickster of Seville', 'Life Is a Dream'] },
{ c: 'Screen Lines', t: 2, q: "Which character answers 'I love you' with 'Ditto' in Ghost?", a: 'Sam Wheat', d: ['Molly Jensen', 'Oda Mae Brown', 'Carl Bruner'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which trial lawyer joked that he was beginning to believe anybody really could become president?', a: 'Clarence Darrow', d: ['Will Rogers', 'H. L. Mencken', 'Mark Twain'] },
{ c: 'History & War', t: 3, q: 'Which Union general vowed to fight it out on that line if it took all summer?', a: 'Ulysses S. Grant', d: ['William Tecumseh Sherman', 'George Meade', 'Philip Sheridan'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which naturalist closed his greatest book with the image of an entangled bank?', a: 'Charles Darwin', d: ['Alfred Russel Wallace', 'Thomas Huxley', 'Joseph Hooker'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet told his son to keep his head when all about him were losing theirs?', a: 'Rudyard Kipling', d: ['A. E. Housman', 'William Ernest Henley', 'Robert Service'] },
{ c: 'Screen Lines', t: 3, q: "Which character promises 'I'll never let go' in Titanic?", a: 'Rose DeWitt Bukater', d: ['Jack Dawson', 'Cal Hockley', 'Molly Brown'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which Supreme Court justice warned that the Constitution is not a suicide pact?', a: 'Robert H. Jackson', d: ['Hugo Black', 'Felix Frankfurter', 'William O. Douglas'] },
{ c: 'History & War', t: 4, q: 'The preference for a lucky general over a good one is usually credited to Napoleon. Which French cardinal actually asked only whether a general was lucky?', a: 'Cardinal Mazarin', d: ['Cardinal Richelieu', 'Cardinal de Retz', 'Cardinal Fleury'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which philosopher of science made falsifiability the test of a scientific theory?', a: 'Karl Popper', d: ['Thomas Kuhn', 'Imre Lakatos', 'Paul Feyerabend'] },
{ c: 'Books & Authors', t: 4, q: 'Which writer wrote that no man is an island, entire of itself?', a: 'John Donne', d: ['George Herbert', 'Andrew Marvell', 'Henry Vaughan'] },
{ c: 'Screen Lines', t: 4, q: 'Which character tells viewers to get up and shout that they are mad as hell in Network?', a: 'Howard Beale', d: ['Diana Christensen', 'Max Schumacher', 'Frank Hackett'] },

{ c: 'Presidents & Politics', t: 5, q: "Which prime minister spoke of a tryst with destiny at India's independence?", a: 'Jawaharlal Nehru', d: ['Mahatma Gandhi', 'Vallabhbhai Patel', 'B. R. Ambedkar'] },
{ c: 'History & War', t: 5, q: 'Which runner is said to have carried news of the victory at Marathon and died on arrival?', a: 'Pheidippides', d: ['Miltiades', 'Themistocles', 'Aristides'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which logician proved that no consistent formal system can prove every arithmetic truth?', a: 'Kurt Godel', d: ['Alfred Tarski', 'Alonzo Church', 'David Hilbert'] },
{ c: 'Books & Authors', t: 5, q: 'Which poet described half a league onward into the valley of Death?', a: 'Alfred Tennyson', d: ['Robert Browning', 'Matthew Arnold', 'Algernon Swinburne'] },
{ c: 'Screen Lines', t: 5, q: "Which character orders his ship to go to ludicrous speed in Spaceballs?", a: 'Dark Helmet', d: ['Lone Starr', 'Barf', 'President Skroob'] },
],

// ── Day 17 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which candidate closed a 1980 debate by asking voters whether they were better off than four years earlier?', a: 'Ronald Reagan', d: ['Jimmy Carter', 'Gerald Ford', 'Walter Mondale'] },
{ c: 'History & War', t: 1, q: 'Which teenage commander told her judges that she had been sent by God?', a: 'Joan of Arc', d: ['Catherine de Medici', 'Eleanor of Aquitaine', 'Isabella of Castile'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which astronomer insisted that extraordinary claims require extraordinary evidence?', a: 'Carl Sagan', d: ['Neil deGrasse Tyson', 'Isaac Asimov', 'Fred Hoyle'] },
{ c: 'Books & Authors', t: 1, q: "Which novel opens by grumbling that Christmas won't be Christmas without any presents?", a: 'Little Women', d: ['Anne of Green Gables', 'What Katy Did', 'A Little Princess'] },
{ c: 'Screen Lines', t: 1, q: "Which character offers the farewell 'Live long and prosper'?", a: 'Spock', d: ['Captain Kirk', 'Dr. McCoy', 'Montgomery Scott'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which candidate promised in 1976 that he would never lie to the American people?', a: 'Jimmy Carter', d: ['Gerald Ford', 'Ronald Reagan', 'Walter Mondale'] },
{ c: 'History & War', t: 2, q: "Which British king's 1939 broadcast quoted a poem about standing at the gate of the year?", a: 'George VI', d: ['Edward VIII', 'George V', 'Elizabeth II'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which biologist argued that genes, rather than organisms, are the true units of selection?', a: 'Richard Dawkins', d: ['Stephen Jay Gould', 'E. O. Wilson', 'John Maynard Smith'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens with a studio filled with the rich odour of roses?', a: 'The Picture of Dorian Gray', d: ['The Woman in White', 'Dracula', 'The Turn of the Screw'] },
{ c: 'Screen Lines', t: 2, q: "Which character keeps declaring events 'Inconceivable!' in The Princess Bride?", a: 'Vizzini', d: ['Inigo Montoya', 'Fezzik', 'Westley'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which secretary of state used a 1947 Harvard speech to propose rebuilding postwar Europe?', a: 'George Marshall', d: ['Dean Acheson', 'Averell Harriman', 'James Byrnes'] },
{ c: 'History & War', t: 3, q: 'Which campaigner told a court in 1873 that her only crime had been to cast a vote?', a: 'Susan B. Anthony', d: ['Elizabeth Cady Stanton', 'Lucretia Mott', 'Alice Paul'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which economist wrote that the ideas of economists and political philosophers are more powerful than is commonly understood?', a: 'John Maynard Keynes', d: ['Alfred Marshall', 'Arthur Pigou', 'Joan Robinson'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet wrote that because she could not stop for Death, he kindly stopped for her?', a: 'Emily Dickinson', d: ['Christina Rossetti', 'Elizabeth Barrett Browning', 'Edna St. Vincent Millay'] },
{ c: 'Screen Lines', t: 3, q: "Which character insists 'I am the one who knocks' in Breaking Bad?", a: 'Walter White', d: ['Jesse Pinkman', 'Hank Schrader', 'Skyler White'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which senator ended his reply to Robert Hayne with liberty and union, now and forever?', a: 'Daniel Webster', d: ['Henry Clay', 'John C. Calhoun', 'Thomas Hart Benton'] },
{ c: 'History & War', t: 4, q: 'Which emperor is said to have cried out for a defeated commander to give him back his legions?', a: 'Augustus', d: ['Tiberius', 'Claudius', 'Julius Caesar'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which historian of science argued that science advances by paradigm shifts rather than steady accumulation?', a: 'Thomas Kuhn', d: ['Karl Popper', 'Imre Lakatos', 'Paul Feyerabend'] },
{ c: 'Books & Authors', t: 4, q: 'Which author wrote that all that is gold does not glitter?', a: 'J. R. R. Tolkien', d: ['C. S. Lewis', 'Ursula K. Le Guin', 'T. H. White'] },
{ c: 'Screen Lines', t: 4, q: "Which character says the greatest trick the Devil pulled was convincing the world he did not exist?", a: 'Verbal Kint', d: ['Dean Keaton', 'Agent Kujan', 'Michael McManus'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Florentine wrote that it is safer to be feared than loved, if you cannot be both?', a: 'Niccolo Machiavelli', d: ['Francesco Guicciardini', 'Baldassare Castiglione', 'Leon Battista Alberti'] },
{ c: 'History & War', t: 5, q: 'Which Greek poet wrote the Thermopylae epitaph for the seer Megistias, his own guest-friend?', a: 'Simonides', d: ['Pindar', 'Bacchylides', 'Anacreon'] },
{ c: 'Science, Letters & Ideas', t: 5, q: "Which physicist popularised the term 'black hole' in the late 1960s?", a: 'John Archibald Wheeler', d: ['Stephen Hawking', 'Roger Penrose', 'Subrahmanyan Chandrasekhar'] },
{ c: 'Books & Authors', t: 5, q: "Which novelist took a title from Robert Burns's line about the best laid schemes?", a: 'John Steinbeck', d: ['Ernest Hemingway', 'William Faulkner', 'Sherwood Anderson'] },
{ c: 'Screen Lines', t: 5, q: "Which character panics with 'Game over, man!' in Aliens?", a: 'Private Hudson', d: ['Ellen Ripley', 'Corporal Hicks', 'Carter Burke'] },
],

// ── Day 18 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president told a 1936 rally that he welcomed the hatred of the financial interests?', a: 'Franklin D. Roosevelt', d: ['Woodrow Wilson', 'Theodore Roosevelt', 'Harry S. Truman'] },
{ c: 'History & War', t: 1, q: "Which leader named his campaign of nonviolent resistance 'satyagraha', or truth-force?", a: 'Mahatma Gandhi', d: ['Jawaharlal Nehru', 'Subhas Chandra Bose', 'B. R. Ambedkar'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which scientist was the first person to win Nobel Prizes in two different sciences?', a: 'Marie Curie', d: ['Linus Pauling', 'John Bardeen', 'Frederick Sanger'] },
{ c: 'Books & Authors', t: 1, q: 'Which story opens by telling of four little rabbits named Flopsy, Mopsy, Cottontail and Peter?', a: 'The Tale of Peter Rabbit', d: ['The Wind in the Willows', 'Winnie-the-Pooh', 'The Tale of Squirrel Nutkin'] },
{ c: 'Screen Lines', t: 1, q: 'Which character tells Simba to remember who he is in The Lion King?', a: 'Mufasa', d: ['Scar', 'Rafiki', 'Zazu'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which British statesman coined the phrase about a special relationship between Britain and the United States?', a: 'Winston Churchill', d: ['Clement Attlee', 'Anthony Eden', 'Harold Macmillan'] },
{ c: 'History & War', t: 2, q: 'Which Roman emperor was greeted at a staged naval battle by men saying that those about to die salute him?', a: 'Claudius', d: ['Caligula', 'Nero', 'Tiberius'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which chemist said the ring structure of benzene came to him after dreaming of a snake biting its own tail?', a: 'August Kekule', d: ['Justus von Liebig', 'Friedrich Wohler', 'Emil Fischer'] },
{ c: 'Books & Authors', t: 2, q: "Which novel ends with its heroine resolving that tomorrow is another day?", a: 'Gone with the Wind', d: ['Rebecca', 'Jane Eyre', 'Wuthering Heights'] },
{ c: 'Screen Lines', t: 2, q: 'Which character says she is just a girl standing in front of a boy in Notting Hill?', a: 'Anna Scott', d: ['William Thacker', 'Spike', 'Honey Thacker'] },

{ c: 'Presidents & Politics', t: 3, q: "Which congresswoman ran for president in 1972 under the slogan 'Unbought and Unbossed'?", a: 'Shirley Chisholm', d: ['Barbara Jordan', 'Patsy Mink', 'Bella Abzug'] },
{ c: 'History & War', t: 3, q: 'Which French revolutionary demanded audacity, more audacity, always audacity?', a: 'Georges Danton', d: ['Maximilien Robespierre', 'Jean-Paul Marat', 'Camille Desmoulins'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which philosopher argued that liberty consists in doing what one desires?', a: 'John Stuart Mill', d: ['Jeremy Bentham', 'Thomas Hill Green', 'Herbert Spencer'] },
{ c: 'Books & Authors', t: 3, q: "Which poet opened a poem about poetry with the admission 'I, too, dislike it'?", a: 'Marianne Moore', d: ['Elizabeth Bishop', 'Gwendolyn Brooks', 'Edna St. Vincent Millay'] },
{ c: 'Screen Lines', t: 3, q: "Which character says 'You complete me' in the 1996 film about a sports agent?", a: 'Jerry Maguire', d: ['Dorothy Boyd', 'Rod Tidwell', 'Avery Bishop'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president used his farewell address to warn against the baneful effects of the spirit of party?', a: 'George Washington', d: ['John Adams', 'Thomas Jefferson', 'James Madison'] },
{ c: 'History & War', t: 4, q: 'Which Prussian king described himself as the first servant of the state?', a: 'Frederick the Great', d: ['Frederick William I', 'Wilhelm I', 'Joseph II'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which economist called it the curious task of economics to show how little men know about what they imagine they can design?', a: 'Friedrich Hayek', d: ['Milton Friedman', 'Ludwig von Mises', 'James Buchanan'] },
{ c: 'Books & Authors', t: 4, q: 'Which lexicographer said that when a man is tired of London, he is tired of life?', a: 'Samuel Johnson', d: ['James Boswell', 'Oliver Goldsmith', 'David Garrick'] },
{ c: 'Screen Lines', t: 4, q: "Which character delivers the final line 'Forget it, Jake. It's Chinatown'?", a: 'Lawrence Walsh', d: ['Jake Gittes', 'Noah Cross', 'Evelyn Mulwray'] },

{ c: 'Presidents & Politics', t: 5, q: "Which of Alexander's generals took Egypt and founded a dynasty that ruled it for three centuries?", a: 'Ptolemy', d: ['Seleucus', 'Antigonus', 'Lysimachus'] },
{ c: 'History & War', t: 5, q: 'Which Athenian is said to have answered a raised staff with the words strike, but hear me?', a: 'Themistocles', d: ['Aristides', 'Miltiades', 'Cimon'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which mathematician called mathematics the queen of the sciences?', a: 'Carl Friedrich Gauss', d: ['Leonhard Euler', 'Pierre-Simon Laplace', 'Joseph-Louis Lagrange'] },
{ c: 'Books & Authors', t: 5, q: 'Which writer said there is no greater agony than bearing an untold story inside you?', a: 'Maya Angelou', d: ['Toni Morrison', 'Alice Walker', 'Lorraine Hansberry'] },
{ c: 'Screen Lines', t: 5, q: 'Which character teaches a man to whistle in To Have and Have Not?', a: 'Marie Browning', d: ['Harry Morgan', 'Eddie', 'Helene de Bursac'] },
],

// ── Day 19 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president reassured the country through a series of radio fireside chats?', a: 'Franklin D. Roosevelt', d: ['Herbert Hoover', 'Harry S. Truman', 'Calvin Coolidge'] },
{ c: 'History & War', t: 1, q: 'Which navigator set out on the first voyage around the world but died before it was finished?', a: 'Ferdinand Magellan', d: ['Christopher Columbus', 'Vasco da Gama', 'Francis Drake'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which mathematician gave his name to the theorem about the sides of a right triangle?', a: 'Pythagoras', d: ['Euclid', 'Thales', 'Archimedes'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens on a queer, sultry summer, the summer they electrocuted the Rosenbergs?', a: 'The Bell Jar', d: ['Franny and Zooey', 'Revolutionary Road', 'The Group'] },
{ c: 'Screen Lines', t: 1, q: "Which character corrects a classmate's pronunciation of Wingardium Leviosa?", a: 'Hermione Granger', d: ['Ron Weasley', 'Harry Potter', 'Neville Longbottom'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president called his domestic programme the Square Deal?', a: 'Theodore Roosevelt', d: ['William Howard Taft', 'Woodrow Wilson', 'William McKinley'] },
{ c: 'History & War', t: 2, q: 'Which chancellor declared that his country would not go to Canossa?', a: 'Otto von Bismarck', d: ['Wilhelm I', 'Leo von Caprivi', 'Bernhard von Bulow'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which meteorologist proposed that the continents had once been joined and had drifted apart?', a: 'Alfred Wegener', d: ['Charles Lyell', 'James Hutton', 'Harry Hess'] },
{ c: 'Books & Authors', t: 2, q: 'Which comic novel opens by calling Earth an utterly insignificant little blue-green planet?', a: "The Hitchhiker's Guide to the Galaxy", d: ['Good Omens', 'The Colour of Magic', 'Bored of the Rings'] },
{ c: 'Screen Lines', t: 2, q: "Which character interrupts a speech with 'You had me at hello'?", a: 'Dorothy Boyd', d: ['Jerry Maguire', 'Rod Tidwell', 'Avery Bishop'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which future Supreme Court justice wrote that sunlight is said to be the best of disinfectants?', a: 'Louis Brandeis', d: ['Oliver Wendell Holmes Jr.', 'Felix Frankfurter', 'Benjamin Cardozo'] },
{ c: 'History & War', t: 3, q: 'Which emperor boasted that he found Rome a city of brick and left it a city of marble?', a: 'Augustus', d: ['Julius Caesar', 'Trajan', 'Hadrian'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which geometer is said to have told a king that there is no royal road to his subject?', a: 'Euclid', d: ['Archimedes', 'Apollonius', 'Eratosthenes'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet wrote that the child is father of the man?', a: 'William Wordsworth', d: ['Samuel Taylor Coleridge', 'Robert Southey', 'Thomas Gray'] },
{ c: 'Screen Lines', t: 3, q: "Which character warns his children that winter is coming?", a: 'Ned Stark', d: ['Tyrion Lannister', 'Jon Snow', 'Robert Baratheon'] },

{ c: 'Presidents & Politics', t: 4, q: 'The warning that a government big enough to give you everything can take everything away is often credited to Jefferson. Which president used it in a 1974 address to a joint session of Congress?', a: 'Gerald Ford', d: ['Lyndon B. Johnson', 'Jimmy Carter', 'Richard Nixon'] },
{ c: 'History & War', t: 4, q: 'Which Athenian was reportedly ostracised by a citizen tired of hearing him called the Just?', a: 'Aristides', d: ['Themistocles', 'Cimon', 'Miltiades'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which biologist suspected the universe is not only queerer than we suppose, but queerer than we can suppose?', a: 'J. B. S. Haldane', d: ['Julian Huxley', 'Peter Medawar', 'Ronald Fisher'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet observed that the best laid schemes of mice and men often go awry?', a: 'Robert Burns', d: ['Walter Scott', 'James Hogg', 'Robert Fergusson'] },
{ c: 'Screen Lines', t: 4, q: 'Which character says she has always depended on the kindness of strangers?', a: 'Blanche DuBois', d: ['Stella Kowalski', 'Stanley Kowalski', 'Harold Mitchell'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which British foreign secretary said his country had no eternal allies, only eternal interests?', a: 'Lord Palmerston', d: ['Benjamin Disraeli', 'William Gladstone', 'Robert Peel'] },
{ c: 'History & War', t: 5, q: 'Which Chinese strategist wrote that all warfare is based on deception?', a: 'Sun Tzu', d: ['Wu Qi', 'Sima Rangju', 'Jiang Ziya'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which philosopher held that to be is to be perceived?', a: 'George Berkeley', d: ['David Hume', 'John Locke', 'Thomas Reid'] },
{ c: 'Books & Authors', t: 5, q: "Which poet wrote that a man's reach should exceed his grasp?", a: 'Robert Browning', d: ['Alfred Tennyson', 'Matthew Arnold', 'Algernon Swinburne'] },
{ c: 'Screen Lines', t: 5, q: 'Which character asks whether this is the end of Rico as he dies?', a: 'Rico Bandello', d: ['Joe Massara', 'Otero', 'Big Boy'] },
],

// ── Day 20 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which candidate promised a New Frontier in accepting the 1960 nomination?', a: 'John F. Kennedy', d: ['Lyndon B. Johnson', 'Richard Nixon', 'Adlai Stevenson'] },
{ c: 'History & War', t: 1, q: 'Which commander opened his own account of a campaign by saying that all Gaul is divided into three parts?', a: 'Julius Caesar', d: ['Pompey', 'Marius', 'Sulla'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which astronomer argued the Earth goes round the Sun, in a book published as he lay dying?', a: 'Nicolaus Copernicus', d: ['Tycho Brahe', 'Johannes Kepler', 'Galileo Galilei'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a brother breaking his arm badly at the elbow when he was nearly thirteen?', a: 'To Kill a Mockingbird', d: ['The Adventures of Tom Sawyer', 'A Tree Grows in Brooklyn', 'The Yearling'] },
{ c: 'Screen Lines', t: 1, q: "Which character shouts 'I volunteer as tribute' in The Hunger Games?", a: 'Katniss Everdeen', d: ['Primrose Everdeen', 'Effie Trinket', 'Peeta Mellark'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told a television audience in 1974 that he would resign the office the next day?', a: 'Richard Nixon', d: ['Gerald Ford', 'Lyndon B. Johnson', 'Jimmy Carter'] },
{ c: 'History & War', t: 2, q: 'Who told the Commons in 1940 that when asked their aim, he could answer in one word: victory?', a: 'Winston Churchill', d: ['Neville Chamberlain', 'Clement Attlee', 'Lord Halifax'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which physicist formulated the uncertainty principle?', a: 'Werner Heisenberg', d: ['Niels Bohr', 'Erwin Schrodinger', 'Max Born'] },
{ c: 'Books & Authors', t: 2, q: "Which novel opens mid-sentence with 'riverrun, past Eve and Adam's'?", a: 'Finnegans Wake', d: ['Ulysses', 'Dubliners', 'A Portrait of the Artist as a Young Man'] },
{ c: 'Screen Lines', t: 2, q: "Which character cries 'It's alive!' over his creation in the 1931 Frankenstein?", a: 'Henry Frankenstein', d: ['The Monster', 'Doctor Waldman', 'Fritz'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president introduced the domino theory at a 1954 press conference?', a: 'Dwight D. Eisenhower', d: ['Harry S. Truman', 'John F. Kennedy', 'Lyndon B. Johnson'] },
{ c: 'History & War', t: 3, q: 'Which Prussian field marshal said no plan of operations survives contact with the enemy?', a: 'Helmuth von Moltke', d: ['Alfred von Schlieffen', 'Erich Ludendorff', 'Paul von Hindenburg'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which philosopher imagined prisoners in a cave mistaking shadows for reality?', a: 'Plato', d: ['Socrates', 'Aristotle', 'Plotinus'] },
{ c: 'Books & Authors', t: 3, q: 'Which novelist wrote that a true place is not down on any map?', a: 'Herman Melville', d: ['Nathaniel Hawthorne', 'Washington Irving', 'James Fenimore Cooper'] },
{ c: 'Screen Lines', t: 3, q: 'Which character thanks the audience on behalf of his mother and father in Yankee Doodle Dandy?', a: 'George M. Cohan', d: ['Sam Harris', 'Jerry Cohan', 'Mary Cohan'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president told a Paris audience that it is not the critic who counts?', a: 'Theodore Roosevelt', d: ['Woodrow Wilson', 'William Howard Taft', 'Calvin Coolidge'] },
{ c: 'History & War', t: 4, q: 'Which Spartan regent commanded the allied Greek army at Plataea in 479 BC?', a: 'Pausanias', d: ['Leonidas', 'Cleomenes', 'Archidamus'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Whose decades of precise observations of Mars did Kepler use to derive elliptical orbits?', a: 'Tycho Brahe', d: ['Nicolaus Copernicus', 'Galileo Galilei', 'Christiaan Huygens'] },
{ c: 'Books & Authors', t: 4, q: 'Which Elizabethan playwright invited his love to come live with him?', a: 'Christopher Marlowe', d: ['William Shakespeare', 'Ben Jonson', 'Thomas Kyd'] },
{ c: 'Screen Lines', t: 4, q: 'Which character explains that in France they call it a Royale with cheese?', a: 'Vincent Vega', d: ['Jules Winnfield', 'Mia Wallace', 'Butch Coolidge'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which prime minister mocked a rival as a sophistical rhetorician inebriated with the exuberance of his own verbosity?', a: 'Benjamin Disraeli', d: ['Robert Peel', 'Lord Salisbury', 'Lord Palmerston'] },
{ c: 'History & War', t: 5, q: 'Which medieval chronicle records that in the anarchy men said Christ and his saints slept?', a: 'The Anglo-Saxon Chronicle', d: ['The Domesday Book', 'The Bayeux Tapestry', "Bede's Ecclesiastical History"] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which mathematician praised an especially elegant proof as coming straight from The Book?', a: 'Paul Erdos', d: ['Andre Weil', 'John von Neumann', 'Emmy Noether'] },
{ c: 'Books & Authors', t: 5, q: 'Which novelist wrote that the world breaks everyone, and afterward many are strong at the broken places?', a: 'Ernest Hemingway', d: ['F. Scott Fitzgerald', 'John Dos Passos', 'Ford Madox Ford'] },
{ c: 'Screen Lines', t: 5, q: 'Which character calls a statuette the stuff that dreams are made of?', a: 'Sam Spade', d: ['Kasper Gutman', 'Joel Cairo', "Brigid O'Shaughnessy"] },
],

// ── Day 21 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president answered a heckler by saying he never gave anybody hell, he just told the truth and they thought it was hell?', a: 'Harry S. Truman', d: ['Franklin D. Roosevelt', 'Dwight D. Eisenhower', 'Lyndon B. Johnson'] },
{ c: 'History & War', t: 1, q: 'Which Mississippi organiser said that nobody is free until everybody is free?', a: 'Fannie Lou Hamer', d: ['Rosa Parks', 'Ella Baker', 'Septima Clark'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which vaccine developer, asked who owned the patent, answered that the people did?', a: 'Jonas Salk', d: ['Albert Sabin', 'Alexander Fleming', 'Frederick Banting'] },
{ c: 'Books & Authors', t: 1, q: 'Which picture book opens in a great green room with a telephone and a red balloon?', a: 'Goodnight Moon', d: ['The Runaway Bunny', 'Where the Wild Things Are', 'The Very Hungry Caterpillar'] },
{ c: 'Screen Lines', t: 1, q: 'Which character sings about letting it go on a mountainside in Frozen?', a: 'Elsa', d: ['Anna', 'Olaf', 'Kristoff'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president argued that a rising tide lifts all the boats?', a: 'John F. Kennedy', d: ['Lyndon B. Johnson', 'Harry S. Truman', 'Dwight D. Eisenhower'] },
{ c: 'History & War', t: 2, q: "Which cosmonaut shouted 'Let's go!' as his rocket lifted off in 1961?", a: 'Yuri Gagarin', d: ['Alexei Leonov', 'Gherman Titov', 'Vladimir Komarov'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which physician was ridiculed for insisting that doctors wash their hands between patients?', a: 'Ignaz Semmelweis', d: ['Joseph Lister', 'Louis Pasteur', 'John Snow'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel ends with its creature borne away by the waves and lost in darkness and distance?', a: 'Frankenstein', d: ['Dracula', 'The Strange Case of Dr Jekyll and Mr Hyde', 'The Picture of Dorian Gray'] },
{ c: 'Screen Lines', t: 2, q: "Which character greets her own reflection with 'Hello, gorgeous' in Funny Girl?", a: 'Fanny Brice', d: ['Nick Arnstein', 'Rose Brice', 'Georgia James'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which French president joked that a country producing hundreds of cheeses is impossible to govern?', a: 'Charles de Gaulle', d: ['Georges Pompidou', 'Vincent Auriol', 'Francois Mitterrand'] },
{ c: 'History & War', t: 3, q: 'Which explorer reached the South Pole first, in December 1911?', a: 'Roald Amundsen', d: ['Robert Falcon Scott', 'Ernest Shackleton', 'Fridtjof Nansen'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which philosopher argued that man is by nature a political animal?', a: 'Aristotle', d: ['Plato', 'Socrates', 'Epicurus'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet wrote that she walks in beauty, like the night?', a: 'Lord Byron', d: ['Percy Bysshe Shelley', 'John Keats', 'Thomas Moore'] },
{ c: 'Screen Lines', t: 3, q: "Which character taunts his sister with 'They're coming to get you, Barbara'?", a: 'Johnny', d: ['Ben', 'Barbara', 'Harry Cooper'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which senator delivered a 1950 Declaration of Conscience rebuking Joseph McCarthy?', a: 'Margaret Chase Smith', d: ['Robert Taft', 'Estes Kefauver', 'Wayne Morse'] },
{ c: 'History & War', t: 4, q: 'Which German foreign secretary sent the coded 1917 telegram proposing an alliance with Mexico?', a: 'Arthur Zimmermann', d: ['Theobald von Bethmann-Hollweg', 'Paul von Hindenburg', 'Erich Ludendorff'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which philosopher described the newborn mind as a blank sheet of paper?', a: 'John Locke', d: ['David Hume', 'George Berkeley', 'Thomas Hobbes'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet opened a poem many and many a year ago, in a kingdom by the sea?', a: 'Edgar Allan Poe', d: ['Nathaniel Hawthorne', 'Herman Melville', 'Sidney Lanier'] },
{ c: 'Screen Lines', t: 4, q: "Which character complains 'You're killing me, Smalls' in The Sandlot?", a: 'Ham Porter', d: ['Benny Rodriguez', 'Scotty Smalls', 'Squints Palledorous'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Roman emperor exchanged letters with Pliny the Younger about how to treat Christians?', a: 'Trajan', d: ['Hadrian', 'Nerva', 'Antoninus Pius'] },
{ c: 'History & War', t: 5, q: 'Which sultan is remembered for the restraint of his troops on retaking Jerusalem in 1187?', a: 'Saladin', d: ['Nur ad-Din', 'Baibars', 'Al-Kamil'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which astronomer called the second law of thermodynamics the supreme law of nature?', a: 'Arthur Eddington', d: ['Ludwig Boltzmann', 'Rudolf Clausius', 'James Clerk Maxwell'] },
{ c: 'Books & Authors', t: 5, q: 'Which poet apologised in a short poem for eating the plums in the icebox?', a: 'William Carlos Williams', d: ['Wallace Stevens', 'Marianne Moore', 'e. e. cummings'] },
{ c: 'Screen Lines', t: 5, q: "Which character in Grand Hotel repeatedly says 'I want to be alone'?", a: 'Grusinskaya', d: ['Baron von Gaigern', 'Flaemmchen', 'Preysing'] },
],

// ── Day 22 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president of the Continental Congress signed the Declaration with a famously large hand?', a: 'John Hancock', d: ['John Adams', 'Charles Thomson', 'Peyton Randolph'] },
{ c: 'History & War', t: 1, q: 'Which aviator became the first woman to fly the Atlantic solo, in 1932?', a: 'Amelia Earhart', d: ['Bessie Coleman', 'Beryl Markham', 'Harriet Quimby'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which physicist wrote that he had no special talent and was only passionately curious?', a: 'Albert Einstein', d: ['Max Planck', 'Niels Bohr', 'Erwin Schrodinger'] },
{ c: 'Books & Authors', t: 1, q: 'Which series of novels sends the Pevensie children through a wardrobe?', a: 'The Chronicles of Narnia', d: ['The Dark Is Rising', 'His Dark Materials', 'The Borrowers'] },
{ c: 'Screen Lines', t: 1, q: 'Which character is the anxious grandson dragged between dimensions in Rick and Morty?', a: 'Morty Smith', d: ['Rick Sanchez', 'Summer Smith', 'Jerry Smith'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told a divided country that we are all Republicans, we are all Federalists?', a: 'Thomas Jefferson', d: ['John Adams', 'James Madison', 'James Monroe'] },
{ c: 'History & War', t: 2, q: 'Which battle cry followed the sinking of an American warship in Havana harbour in 1898?', a: 'Remember the Maine', d: ['Remember the Alamo', 'Remember Pearl Harbor', 'Fifty-four Forty or Fight'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which writer coined the line that a ship in harbour is safe, but that is not what ships are built for?', a: 'John A. Shedd', d: ['Joseph Conrad', 'Herman Melville', 'Rudyard Kipling'] },
{ c: 'Books & Authors', t: 2, q: "Which novel opens with the flat announcement that the primroses were over?", a: 'Watership Down', d: ['The Wind in the Willows', 'Animal Farm', 'The Once and Future King'] },
{ c: 'Screen Lines', t: 2, q: "Which character in the American version of The Office is forever saying 'That's what she said'?", a: 'Michael Scott', d: ['Dwight Schrute', 'Jim Halpert', 'Pam Beesly'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which senator warned in 1858 of an irrepressible conflict between free and slave labour?', a: 'William Seward', d: ['Stephen Douglas', 'Charles Sumner', 'Salmon Chase'] },
{ c: 'History & War', t: 3, q: 'Which Roman commander lost three legions in the Teutoburg Forest?', a: 'Publius Quinctilius Varus', d: ['Germanicus', 'Drusus', 'Agrippa'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which clergyman argued that population grows faster than the food supply?', a: 'Thomas Malthus', d: ['David Ricardo', 'Adam Smith', 'Nassau Senior'] },
{ c: 'Books & Authors', t: 3, q: 'Which author wrote that a person is a person, no matter how small?', a: 'Dr. Seuss', d: ['Shel Silverstein', 'Roald Dahl', 'Maurice Sendak'] },
{ c: 'Screen Lines', t: 3, q: 'Which character warns that life moves pretty fast, and you could miss it?', a: 'Ferris Bueller', d: ['Cameron Frye', 'Sloane Peterson', 'Ed Rooney'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which chief justice wrote that separate educational facilities are inherently unequal?', a: 'Earl Warren', d: ['Fred Vinson', 'Hugo Black', 'William O. Douglas'] },
{ c: 'History & War', t: 4, q: 'Which Roman emperor is said to have wished the Roman people had a single neck?', a: 'Caligula', d: ['Nero', 'Domitian', 'Commodus'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which philosopher opened a treatise by saying the world is everything that is the case?', a: 'Ludwig Wittgenstein', d: ['Bertrand Russell', 'Rudolf Carnap', 'Moritz Schlick'] },
{ c: 'Books & Authors', t: 4, q: 'Which writer sent an owl and a pussycat to sea in a pea-green boat?', a: 'Edward Lear', d: ['Lewis Carroll', 'Hilaire Belloc', 'A. A. Milne'] },
{ c: 'Screen Lines', t: 4, q: "Which character urges his students to seize the day in Dead Poets Society?", a: 'John Keating', d: ['Neil Perry', 'Todd Anderson', 'Mr. Nolan'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Athenian orator spent his career warning the city about Philip of Macedon?', a: 'Demosthenes', d: ['Isocrates', 'Aeschines', 'Lysias'] },
{ c: 'History & War', t: 5, q: 'Which sultan, after taking Constantinople, declared there must be only one empire, one faith and one sovereignty in the world?', a: 'Mehmed II', d: ['Suleiman the Magnificent', 'Bayezid I', 'Selim I'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which Greek historian described his own work as a possession for all time?', a: 'Thucydides', d: ['Herodotus', 'Xenophon', 'Polybius'] },
{ c: 'Books & Authors', t: 5, q: "Which novelist gave a lovesick captain the words 'I am half agony, half hope'?", a: 'Jane Austen', d: ['Fanny Burney', 'Maria Edgeworth', 'Ann Radcliffe'] },
{ c: 'Screen Lines', t: 5, q: "Which character boasts that his amplifiers go to eleven?", a: 'Nigel Tufnel', d: ['David St. Hubbins', 'Derek Smalls', 'Marty DiBergi'] },
],

// ── Day 23 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which future president told a 2004 convention there is not a liberal America and a conservative America?', a: 'Barack Obama', d: ['Bill Clinton', 'John Kerry', 'Al Gore'] },
{ c: 'History & War', t: 1, q: 'Which suffragette said she would rather be a rebel than a slave?', a: 'Emmeline Pankhurst', d: ['Millicent Fawcett', 'Emily Davison', 'Christabel Pankhurst'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which philosopher wrote that mathematics possesses not only truth, but supreme beauty?', a: 'Bertrand Russell', d: ['Alfred North Whitehead', 'G. H. Hardy', 'Henri Poincare'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a hobbit announcing his eleventy-first birthday party?', a: 'The Fellowship of the Ring', d: ['The Hobbit', 'The Silmarillion', 'The Two Towers'] },
{ c: 'Screen Lines', t: 1, q: 'Which character in Guardians of the Galaxy can say only three words?', a: 'Groot', d: ['Rocket', 'Star-Lord', 'Drax'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which American statesman said in 1962 that Britain had lost an empire and not yet found a role?', a: 'Dean Acheson', d: ['John Foster Dulles', 'George Kennan', 'Averell Harriman'] },
{ c: 'History & War', t: 2, q: 'Which general told West Point cadets in 1962 that their watchwords were duty, honour, country?', a: 'Douglas MacArthur', d: ['Omar Bradley', 'Matthew Ridgway', 'Maxwell Taylor'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which experimenter first used the word cell for the compartments he saw through a microscope?', a: 'Robert Hooke', d: ['Antonie van Leeuwenhoek', 'Marcello Malpighi', 'Jan Swammerdam'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel ends with the narrator lingering by three headstones under a benign sky?', a: 'Wuthering Heights', d: ['Jane Eyre', 'Villette', 'Agnes Grey'] },
{ c: 'Screen Lines', t: 2, q: "Which character asks 'What's your favorite scary movie?' down the phone in Scream?", a: 'Ghostface', d: ['Sidney Prescott', 'Billy Loomis', 'Randy Meeks'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which defense secretary spoke at a briefing about known knowns and unknown unknowns?', a: 'Donald Rumsfeld', d: ['Dick Cheney', 'Colin Powell', 'Robert Gates'] },
{ c: 'History & War', t: 3, q: 'Which Roman is said to have held a bridge alone against an invading army?', a: 'Horatius Cocles', d: ['Cincinnatus', 'Camillus', 'Mucius Scaevola'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which mathematician said that one who is not also something of a poet will never be a complete mathematician?', a: 'Karl Weierstrass', d: ['Georg Cantor', 'Richard Dedekind', 'Bernhard Riemann'] },
{ c: 'Books & Authors', t: 3, q: "Which poet wrote that nature's first green is gold?", a: 'Robert Frost', d: ['Carl Sandburg', 'Edwin Arlington Robinson', 'Sara Teasdale'] },
{ c: 'Screen Lines', t: 3, q: "Which character remarks that a boy's best friend is his mother?", a: 'Norman Bates', d: ['Marion Crane', 'Sam Loomis', 'Milton Arbogast'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president explained a difficult policy by saying that when you have an elephant by the hind legs it is best to let him run?', a: 'Abraham Lincoln', d: ['Andrew Jackson', 'Ulysses S. Grant', 'Theodore Roosevelt'] },
{ c: 'History & War', t: 4, q: "Which emperor is said to have exclaimed 'Solomon, I have outdone thee' on entering his new church?", a: 'Justinian I', d: ['Constantine', 'Heraclius', 'Basil II'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which physician wrote that medicine is a science of uncertainty and an art of probability?', a: 'William Osler', d: ['William Harvey', 'Rudolf Virchow', 'Claude Bernard'] },
{ c: 'Books & Authors', t: 4, q: 'Which author wrote that it is only with the heart that one can see rightly?', a: 'Antoine de Saint-Exupery', d: ['Albert Camus', 'Andre Gide', 'Marcel Pagnol'] },
{ c: 'Screen Lines', t: 4, q: "Which character warns his fleet 'It's a trap!' in Return of the Jedi?", a: 'Admiral Ackbar', d: ['Lando Calrissian', 'Han Solo', 'Mon Mothma'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Chinese teacher advised that the superior man is modest in speech but exceeds in his actions?', a: 'Confucius', d: ['Laozi', 'Mencius', 'Zhuangzi'] },
{ c: 'History & War', t: 5, q: 'Which naval commander at Salamis drew from Xerxes the remark that his men had become women?', a: 'Artemisia I', d: ['Atossa', 'Roxana', 'Amestris'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which physicist observed that a new scientific truth wins because its opponents eventually die?', a: 'Max Planck', d: ['Niels Bohr', 'Wolfgang Pauli', 'Arnold Sommerfeld'] },
{ c: 'Books & Authors', t: 5, q: 'Which novelist wrote that the unread story is not a story?', a: 'Ursula K. Le Guin', d: ['Octavia Butler', 'Margaret Atwood', 'Doris Lessing'] },
{ c: 'Screen Lines', t: 5, q: "Which character introduces the pair with the flat line 'We rob banks'?", a: 'Clyde Barrow', d: ['Bonnie Parker', 'C. W. Moss', 'Buck Barrow'] },
],

// ── Day 24 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president advised that if you see ten troubles coming down the road, nine will run into the ditch first?', a: 'Calvin Coolidge', d: ['Herbert Hoover', 'Warren G. Harding', 'Gerald Ford'] },
{ c: 'History & War', t: 1, q: 'Which pilot commanded the first crewed landing on the Moon?', a: 'Neil Armstrong', d: ['Buzz Aldrin', 'Michael Collins', 'Jim Lovell'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which physicist called the whole of science nothing more than a refinement of everyday thinking?', a: 'Albert Einstein', d: ['Richard Feynman', 'Max Born', 'Enrico Fermi'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a boy named Bruno finding the maid packing his things?', a: 'The Boy in the Striped Pyjamas', d: ['The Book Thief', 'Number the Stars', 'When Hitler Stole Pink Rabbit'] },
{ c: 'Screen Lines', t: 1, q: "Which character insists 'I'm not a smart man, but I know what love is'?", a: 'Forrest Gump', d: ['Jenny Curran', 'Lieutenant Dan', 'Mrs. Gump'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president told Congress in 1941 that the world should rest on four essential human freedoms?', a: 'Franklin D. Roosevelt', d: ['Herbert Hoover', 'Calvin Coolidge', 'Woodrow Wilson'] },
{ c: 'History & War', t: 2, q: 'Which Union president delivered a two-minute address dedicating a battlefield cemetery?', a: 'Abraham Lincoln', d: ['Andrew Johnson', 'Ulysses S. Grant', 'Edward Everett'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which naturalist sailed as a young man aboard the Beagle?', a: 'Charles Darwin', d: ['Thomas Huxley', 'Alfred Russel Wallace', 'Joseph Hooker'] },
{ c: 'Books & Authors', t: 2, q: "Which novel's last words are that he loved Big Brother?", a: 'Nineteen Eighty-Four', d: ['Brave New World', 'Fahrenheit 451', 'Darkness at Noon'] },
{ c: 'Screen Lines', t: 2, q: "Which character shouts 'Great Scott!' at almost every crisis?", a: 'Doc Brown', d: ['Marty McFly', 'Biff Tannen', 'Jennifer Parker'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president signed the Voting Rights Act into law in August 1965?', a: 'Lyndon B. Johnson', d: ['John F. Kennedy', 'Harry S. Truman', 'Hubert Humphrey'] },
{ c: 'History & War', t: 3, q: 'Which Union general burned Atlanta and marched to the sea?', a: 'William Tecumseh Sherman', d: ['Ulysses S. Grant', 'Philip Sheridan', 'George Thomas'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which philosopher wrote that all men by nature desire to know?', a: 'Aristotle', d: ['Plato', 'Theophrastus', 'Zeno of Citium'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet asked whether he should compare thee to a summer day?', a: 'William Shakespeare', d: ['Philip Sidney', 'Edmund Spenser', 'Michael Drayton'] },
{ c: 'Screen Lines', t: 3, q: "Which character calms a diner standoff by saying 'Nobody's gonna hurt anybody'?", a: 'Jules Winnfield', d: ['Pumpkin', 'Honey Bunny', 'Vincent Vega'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which framer warned that the accumulation of all powers in the same hands is the very definition of tyranny?', a: 'James Madison', d: ['Alexander Hamilton', 'John Jay', 'Gouverneur Morris'] },
{ c: 'History & War', t: 4, q: 'Which admiral is said to have raised a telescope to his blind eye and reported seeing no signal?', a: 'Horatio Nelson', d: ['Hyde Parker', 'Cuthbert Collingwood', 'Adam Duncan'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which economist wrote that the tendency of the rate of profit to fall is the most important law of political economy?', a: 'Karl Marx', d: ['David Ricardo', 'Adam Smith', 'Friedrich Engels'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet declared that April is the cruellest month?', a: 'T. S. Eliot', d: ['Ezra Pound', 'W. H. Auden', 'Robert Graves'] },
{ c: 'Screen Lines', t: 4, q: "Which character delivers the closing line 'It was beauty killed the beast'?", a: 'Carl Denham', d: ['Ann Darrow', 'Jack Driscoll', 'Captain Englehorn'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Roman dictator is said to have returned to his plough after saving the republic?', a: 'Cincinnatus', d: ['Camillus', 'Fabius Maximus', 'Scipio Africanus'] },
{ c: 'History & War', t: 5, q: 'Which Carthaginian is said to have complained that his countrymen knew how to win a victory but not how to use one?', a: 'Maharbal', d: ['Hasdrubal', 'Hamilcar Barca', 'Mago'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which physicist wrote that the imagination of nature is far greater than the imagination of man?', a: 'Richard Feynman', d: ['Freeman Dyson', 'John Wheeler', 'Murray Gell-Mann'] },
{ c: 'Books & Authors', t: 5, q: 'Which novelist described a character as a man of the crowd in a story of that name?', a: 'Edgar Allan Poe', d: ['Nathaniel Hawthorne', 'Washington Irving', 'Charles Brockden Brown'] },
{ c: 'Screen Lines', t: 5, q: 'Which character orders the unauthorised nuclear attack that begins the crisis in Dr. Strangelove?', a: 'General Jack D. Ripper', d: ['General Turgidson', 'Colonel Bat Guano', 'Major Kong'] },
],

// ── Day 25 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president called the Soviet Union an evil empire in a 1983 speech?', a: 'Ronald Reagan', d: ['Jimmy Carter', 'Gerald Ford', 'George H. W. Bush'] },
{ c: 'History & War', t: 1, q: 'Which leader told the world in 1994 that South Africa would never again be the source of oppression?', a: 'Nelson Mandela', d: ['Desmond Tutu', 'Thabo Mbeki', 'Walter Sisulu'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which physicist compared himself to a boy on a seashore finding a smoother pebble than ordinary?', a: 'Isaac Newton', d: ['Edmond Halley', 'Christiaan Huygens', 'Robert Boyle'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a travelling salesman waking to find himself changed into a monstrous insect?', a: 'The Metamorphosis', d: ['The Trial', 'The Castle', 'Amerika'] },
{ c: 'Screen Lines', t: 1, q: "Which character warns her guests to fasten their seatbelts for a bumpy night?", a: 'Margo Channing', d: ['Eve Harrington', 'Addison DeWitt', 'Karen Richards'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president said that a nation which forgets its defenders will itself be forgotten?', a: 'Calvin Coolidge', d: ['Warren G. Harding', 'Herbert Hoover', 'Woodrow Wilson'] },
{ c: 'History & War', t: 2, q: 'Which US president ordered the Berlin airlift in 1948?', a: 'Harry S. Truman', d: ['Franklin D. Roosevelt', 'Dwight D. Eisenhower', 'George Marshall'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which philosopher wrote that we live forward but understand backward?', a: 'Soren Kierkegaard', d: ['Arthur Schopenhauer', 'Friedrich Nietzsche', 'Henri Bergson'] },
{ c: 'Books & Authors', t: 2, q: 'Which poet wrote that the woods are lovely, dark and deep?', a: 'Robert Frost', d: ['Carl Sandburg', 'Edwin Arlington Robinson', 'Walt Whitman'] },
{ c: 'Screen Lines', t: 2, q: "Which character in Jaws mutters 'Smile, you son of a...' before firing at the shark?", a: 'Chief Brody', d: ['Quint', 'Matt Hooper', 'Mayor Vaughn'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president told a television interviewer years later that he had given his enemies a sword?', a: 'Richard Nixon', d: ['Lyndon B. Johnson', 'Gerald Ford', 'Spiro Agnew'] },
{ c: 'History & War', t: 3, q: 'Which admiral urged his captains before Trafalgar that no captain can do very wrong who places his ship alongside that of an enemy?', a: 'Horatio Nelson', d: ['John Jervis', 'Cuthbert Collingwood', 'Edward Codrington'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which naturalist wrote that in wildness is the preservation of the world?', a: 'Henry David Thoreau', d: ['John Muir', 'Ralph Waldo Emerson', 'Aldo Leopold'] },
{ c: 'Books & Authors', t: 3, q: 'Which novelist wrote that there is no charm equal to tenderness of heart?', a: 'Jane Austen', d: ['Maria Edgeworth', 'Frances Burney', 'Susan Ferrier'] },
{ c: 'Screen Lines', t: 3, q: 'Which character taunts a lone policeman over the radio as Mister Cowboy in Die Hard?', a: 'Hans Gruber', d: ['Karl', 'Theo', 'Sergeant Al Powell'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which vice president resigned in 1832 to take a Senate seat and argue for states rights?', a: 'John C. Calhoun', d: ['Martin Van Buren', 'Richard Mentor Johnson', 'George Dallas'] },
{ c: 'History & War', t: 4, q: 'Which French marshal is credited with the order at Verdun that they shall not pass?', a: 'Robert Nivelle', d: ['Ferdinand Foch', 'Joseph Joffre', 'Maxime Weygand'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which mathematician described a proof of the infinitude of primes that is still taught unchanged?', a: 'Euclid', d: ['Eratosthenes', 'Diophantus', 'Apollonius'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet and pamphleteer wrote that a good book is the precious lifeblood of a master spirit?', a: 'John Milton', d: ['Francis Bacon', 'John Bunyan', 'Thomas Browne'] },
{ c: 'Screen Lines', t: 4, q: "Which character asks 'Do you know what nemesis means?' in Snatch?", a: 'Brick Top', d: ['Turkish', 'Mickey', 'Tommy'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Roman politician published the letters that give us most of what we know of the late republic?', a: 'Cicero', d: ['Sallust', 'Varro', 'Cato the Younger'] },
{ c: 'History & War', t: 5, q: 'Which Japanese admiral warned that a war with America could only be won in the first six months?', a: 'Isoroku Yamamoto', d: ['Chuichi Nagumo', 'Osami Nagano', 'Minoru Genda'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which mathematician wrote an apology arguing that pure mathematics is useless and beautiful?', a: 'G. H. Hardy', d: ['Bertrand Russell', 'John Littlewood', 'Srinivasa Ramanujan'] },
{ c: 'Books & Authors', t: 5, q: 'Which poet wrote that the apparition of these faces in the crowd is like petals on a wet, black bough?', a: 'Ezra Pound', d: ['T. S. Eliot', 'H. D.', 'Amy Lowell'] },
{ c: 'Screen Lines', t: 5, q: 'Which character defends himself on a Ferris wheel by talking about Swiss cuckoo clocks?', a: 'Harry Lime', d: ['Holly Martins', 'Anna Schmidt', 'Major Calloway'] },
],

// ── Day 26 ────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president was the only one elected to four terms?', a: 'Franklin D. Roosevelt', d: ['Woodrow Wilson', 'Theodore Roosevelt', 'Harry S. Truman'] },
{ c: 'History & War', t: 1, q: 'Which minister wrote that the ultimate measure of a man is where he stands in moments of challenge?', a: 'Martin Luther King Jr.', d: ['Malcolm X', 'Ralph Abernathy', 'Howard Thurman'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which inventor held more than a thousand American patents, among them a practical light bulb?', a: 'Thomas Edison', d: ['Nikola Tesla', 'George Westinghouse', 'Joseph Swan'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel follows a boy named Jonas who is given the assignment of Receiver at twelve?', a: 'The Giver', d: ['A Wrinkle in Time', 'Holes', 'Bridge to Terabithia'] },
{ c: 'Screen Lines', t: 1, q: 'Which character opens the song by calling Hakuna Matata a wonderful phrase?', a: 'Timon', d: ['Pumbaa', 'Rafiki', 'Zazu'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president wrote that no man is good enough to govern another without that other man consenting?', a: 'Abraham Lincoln', d: ['Thomas Jefferson', 'James Madison', 'John Quincy Adams'] },
{ c: 'History & War', t: 2, q: 'Which king is said to have ordered the tide to halt, to show his courtiers the limits of royal power?', a: 'Canute', d: ['Alfred the Great', 'Harold Godwinson', 'Ethelred the Unready'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which physicist won a Nobel Prize for proposing that light arrives in discrete packets?', a: 'Albert Einstein', d: ['Max Planck', 'Niels Bohr', 'Arthur Compton'] },
{ c: 'Books & Authors', t: 2, q: 'Which poet declared that hell is a city much like London?', a: 'Percy Bysshe Shelley', d: ['William Blake', 'Lord Byron', 'Thomas Hood'] },
{ c: 'Screen Lines', t: 2, q: 'Which character in Goodfellas demands to know whether he is funny like a clown?', a: 'Tommy DeVito', d: ['Henry Hill', 'Jimmy Conway', 'Paulie Cicero'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which candidate ran for president five times as a socialist, the last time from a prison cell?', a: 'Eugene V. Debs', d: ['Norman Thomas', 'Robert La Follette', 'Henry Wallace'] },
{ c: 'History & War', t: 3, q: 'Which organiser united the French underground and died under interrogation in 1943?', a: 'Jean Moulin', d: ['Pierre Brossolette', 'Henri Frenay', 'Jean Cavailles'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which friar traced inheritance through generations of pea plants in a monastery garden?', a: 'Gregor Mendel', d: ['Hugo de Vries', 'William Bateson', 'Carl Correns'] },
{ c: 'Books & Authors', t: 3, q: 'Which novelist wrote a story about the death of a Russian judge named Ivan Ilyich?', a: 'Leo Tolstoy', d: ['Fyodor Dostoevsky', 'Nikolai Gogol', 'Ivan Goncharov'] },
{ c: 'Screen Lines', t: 3, q: "Which character insists that deserving has got nothing to do with it in Unforgiven?", a: 'Will Munny', d: ['Little Bill Daggett', 'Ned Logan', 'The Schofield Kid'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which secretary of war said the only way to make a man trustworthy is to trust him?', a: 'Henry Stimson', d: ['Cordell Hull', 'Frank Knox', 'Dean Acheson'] },
{ c: 'History & War', t: 4, q: 'Which lord admiral, rather than Drake, actually commanded the English fleet against the Spanish Armada?', a: 'Lord Howard of Effingham', d: ['John Hawkins', 'Martin Frobisher', 'Walter Raleigh'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which writer preserved the saying of Heraclitus that everything flows and nothing stands still?', a: 'Plato', d: ['Aristotle', 'Diogenes Laertius', 'Plutarch'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet wrote that he can connect nothing with nothing?', a: 'T. S. Eliot', d: ['Ezra Pound', 'W. B. Yeats', 'Wallace Stevens'] },
{ c: 'Screen Lines', t: 4, q: 'Which character tells a jury in The Verdict that today they are the law?', a: 'Frank Galvin', d: ['Ed Concannon', 'Laura Fischer', 'Judge Hoyle'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which Roman emperor wrote that the best revenge is to be unlike the one who did the injury?', a: 'Marcus Aurelius', d: ['Seneca', 'Epictetus', 'Cicero'] },
{ c: 'History & War', t: 5, q: "Which Zulu king's army destroyed a British column at Isandlwana in 1879?", a: 'Cetshwayo', d: ['Shaka', 'Dingane', 'Mpande'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which mathematician held that the art of proposing a question is worth more than solving it?', a: 'Georg Cantor', d: ['David Hilbert', 'Felix Klein', 'Henri Poincare'] },
{ c: 'Books & Authors', t: 5, q: 'Which poet, on a moonlit beach, begged his love that they be true to one another?', a: 'Matthew Arnold', d: ['Alfred Tennyson', 'Arthur Hugh Clough', 'Robert Browning'] },
{ c: 'Screen Lines', t: 5, q: "Which character in Casablanca runs the Blue Parrot and buys Rick's cafe?", a: 'Signor Ferrari', d: ['Captain Renault', 'Ugarte', 'Major Strasser'] },
],

// ── Day 27 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president signed the Civil Rights Act of 1964?', a: 'Lyndon B. Johnson', d: ['John F. Kennedy', 'Dwight D. Eisenhower', 'Richard Nixon'] },
{ c: 'History & War', t: 1, q: 'Which navigator crossed the Atlantic in 1492 with the Nina, the Pinta and the Santa Maria?', a: 'Christopher Columbus', d: ['Ferdinand Magellan', 'Vasco da Gama', 'Amerigo Vespucci'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which naturalist wrote that a man who dares to waste one hour of time has not discovered the value of life?', a: 'Charles Darwin', d: ['Thomas Huxley', 'Herbert Spencer', 'Alfred Russel Wallace'] },
{ c: 'Books & Authors', t: 1, q: 'Which book opens on a warm evening in the Seeonee hills as a wolf family wakes?', a: 'The Jungle Book', d: ['Just So Stories', 'Kim', 'The Wind in the Willows'] },
{ c: 'Screen Lines', t: 1, q: "Which character closes his address to the United Nations with 'Wakanda forever'?", a: "T'Challa", d: ['Everett Ross', 'Ulysses Klaue', 'Killmonger'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president wrote that the government is us, that we are the government, you and I?', a: 'Theodore Roosevelt', d: ['Woodrow Wilson', 'William Howard Taft', 'Calvin Coolidge'] },
{ c: 'History & War', t: 2, q: 'Which American general drove the Third Army across France in 1944?', a: 'George Patton', d: ['Omar Bradley', 'Courtney Hodges', 'Mark Clark'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which Danish astronomer recorded the most precise observations of the sky made before the telescope?', a: 'Tycho Brahe', d: ['Johannes Kepler', 'Nicolaus Copernicus', 'Christiaan Huygens'] },
{ c: 'Books & Authors', t: 2, q: "Which novel opens with the blunt sentence that its title character was drunk?", a: 'Elmer Gantry', d: ['Babbitt', 'Main Street', 'Arrowsmith'] },
{ c: 'Screen Lines', t: 2, q: "Which character shouts 'You can't sit with us!' at Regina George over a dress-code violation?", a: 'Gretchen Wieners', d: ['Janis Ian', 'Cady Heron', 'Damian Hubbard'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president told a Yale audience that the great enemy of truth is often not the lie but the myth?', a: 'John F. Kennedy', d: ['Lyndon B. Johnson', 'Dwight D. Eisenhower', 'Adlai Stevenson'] },
{ c: 'History & War', t: 3, q: 'Which Irish leader said on signing the 1921 treaty that he had signed his own death warrant?', a: 'Michael Collins', d: ['Eamon de Valera', 'Arthur Griffith', 'Cathal Brugha'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which novelist and physicist argued that the sciences and the humanities had become two cultures no longer able to speak?', a: 'C. P. Snow', d: ['Aldous Huxley', 'Bertrand Russell', 'F. R. Leavis'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet demanded that all the clocks be stopped and the telephone cut off?', a: 'W. H. Auden', d: ['Stephen Spender', 'Louis MacNeice', 'Cecil Day-Lewis'] },
{ c: 'Screen Lines', t: 3, q: 'Which character in The Wire warns that if you come at the king, you best not miss?', a: 'Omar Little', d: ['Stringer Bell', 'Avon Barksdale', 'Jimmy McNulty'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which chancellor said on resigning that the government gave the impression of being in office but not in power?', a: 'Norman Lamont', d: ['John Major', 'Michael Heseltine', 'Kenneth Clarke'] },
{ c: 'History & War', t: 4, q: 'Which Spartan commander destroyed the Athenian fleet at Aegospotami?', a: 'Lysander', d: ['Brasidas', 'Gylippus', 'Agesilaus'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which essayist wrote that a foolish consistency is the hobgoblin of little minds?', a: 'Ralph Waldo Emerson', d: ['Henry David Thoreau', 'Walt Whitman', 'Margaret Fuller'] },
{ c: 'Books & Authors', t: 4, q: 'Which novelist wrote of a mother haunted by the daughter she lost, in a book called Beloved?', a: 'Toni Morrison', d: ['Alice Walker', 'Gloria Naylor', 'Paule Marshall'] },
{ c: 'Screen Lines', t: 4, q: "Which character asks a rival 'How do you like them apples?' through a window?", a: 'Will Hunting', d: ['Chuckie Sullivan', 'Sean Maguire', 'Skylar'] },

{ c: 'Presidents & Politics', t: 5, q: "Which lord chancellor said on the scaffold that he died the king's good servant, but God's first?", a: 'Thomas More', d: ['Thomas Cromwell', 'Thomas Wolsey', 'John Fisher'] },
{ c: 'History & War', t: 5, q: 'Which Aztec ruler received Cortes at Tenochtitlan in 1519?', a: 'Moctezuma II', d: ['Cuauhtemoc', 'Cuitlahuac', 'Ahuitzotl'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which mathematician spent the night before a fatal duel writing out a new branch of algebra?', a: 'Evariste Galois', d: ['Niels Henrik Abel', 'Carl Jacobi', 'Augustin-Louis Cauchy'] },
{ c: 'Books & Authors', t: 5, q: 'Which Russian novelist wrote a satire in which the devil visits Moscow?', a: 'Mikhail Bulgakov', d: ['Andrei Platonov', 'Isaac Babel', 'Yevgeny Zamyatin'] },
{ c: 'Screen Lines', t: 5, q: 'Which character says that every man dies, but not every man really lives?', a: 'William Wallace', d: ['Robert the Bruce', 'Hamish Campbell', 'Argyle Wallace'] },
],

// ── Day 28 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president was assassinated in Dallas in November 1963?', a: 'John F. Kennedy', d: ['Lyndon B. Johnson', 'Robert Kennedy', 'Franklin D. Roosevelt'] },
{ c: 'History & War', t: 1, q: 'Which nurse tended the wounded in the Crimea and became known as the Lady with the Lamp?', a: 'Florence Nightingale', d: ['Mary Seacole', 'Clara Barton', 'Edith Cavell'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which scientist discovered both radium and polonium?', a: 'Marie Curie', d: ['Lise Meitner', 'Irene Joliot-Curie', 'Dorothy Hodgkin'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a girl growing tired of sitting by her sister on the bank?', a: "Alice's Adventures in Wonderland", d: ['Through the Looking-Glass', 'The Water-Babies', 'Peter Pan'] },
{ c: 'Screen Lines', t: 1, q: "Which character wishes that the odds be ever in your favour?", a: 'Effie Trinket', d: ['Katniss Everdeen', 'Haymitch Abernathy', 'Caesar Flickerman'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which prime minister called Russia a riddle wrapped in a mystery inside an enigma?', a: 'Winston Churchill', d: ['Neville Chamberlain', 'Clement Attlee', 'Anthony Eden'] },
{ c: 'History & War', t: 2, q: 'Which Roman is said to have thrust his hand into a fire to show an enemy king his contempt for pain?', a: 'Mucius Scaevola', d: ['Horatius Cocles', 'Cincinnatus', 'Camillus'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which physician described the circulation of the blood in a 1628 treatise?', a: 'William Harvey', d: ['Andreas Vesalius', 'Ambroise Pare', 'Marcello Malpighi'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens with the scent of bitter almonds and the fate of unrequited love?', a: 'Love in the Time of Cholera', d: ['One Hundred Years of Solitude', 'Chronicle of a Death Foretold', 'The General in His Labyrinth'] },
{ c: 'Screen Lines', t: 2, q: "Which character growls 'Nobody tosses a Dwarf' before a leap?", a: 'Gimli', d: ['Legolas', 'Aragorn', 'Boromir'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president set out fourteen points and called for a league of nations?', a: 'Woodrow Wilson', d: ['Theodore Roosevelt', 'Warren G. Harding', 'William Howard Taft'] },
{ c: 'History & War', t: 3, q: 'Which queen apologised to her executioner in 1793 for treading on his foot?', a: 'Marie Antoinette', d: ['Madame Roland', 'Charlotte Corday', 'Madame du Barry'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which economist wrote that we expect our dinner not from the benevolence of the butcher but from his self-interest?', a: 'Adam Smith', d: ['David Ricardo', 'Nassau Senior', 'Jean-Baptiste Say'] },
{ c: 'Books & Authors', t: 3, q: 'Which novelist wrote a book narrated by a woman who never gives her own name, haunted by her husband’s first wife?', a: 'Daphne du Maurier', d: ['Elizabeth Bowen', 'Rosamond Lehmann', 'Mary Webb'] },
{ c: 'Screen Lines', t: 3, q: "Which character keeps asking 'Is it safe?' over a dentist's chair?", a: 'Christian Szell', d: ['Babe Levy', 'Doc Levy', 'Janeway'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which secretary of state remarked that power is the ultimate aphrodisiac?', a: 'Henry Kissinger', d: ['Dean Rusk', 'William Rogers', 'Cyrus Vance'] },
{ c: 'History & War', t: 4, q: 'Which king of Epirus won the costly victories that gave a phrase to the language?', a: 'Pyrrhus', d: ['Hannibal', 'Antiochus III', 'Mithridates'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which Danish astronomer first showed that light travels at a finite speed, using the moons of Jupiter?', a: 'Ole Romer', d: ['Christiaan Huygens', 'Giovanni Cassini', 'James Bradley'] },
{ c: 'Books & Authors', t: 4, q: 'Which Nigerian novelist took the title of his first book from a line by W. B. Yeats?', a: 'Chinua Achebe', d: ['Wole Soyinka', "Ngugi wa Thiong'o", 'Ben Okri'] },
{ c: 'Screen Lines', t: 4, q: "Which character bursts in announcing that nobody expects the Spanish Inquisition?", a: 'Cardinal Ximenez', d: ['Cardinal Biggles', 'Cardinal Fang', 'Reg'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which king is said to have asked who would rid him of a turbulent priest?', a: 'Henry II', d: ['Henry I', 'Stephen', 'Richard I'] },
{ c: 'History & War', t: 5, q: 'Which Norse voyager is credited in the sagas with reaching North America around the year 1000?', a: 'Leif Erikson', d: ['Erik the Red', 'Bjarni Herjolfsson', 'Thorfinn Karlsefni'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which astronomer predicted the return of the comet that now carries his name?', a: 'Edmond Halley', d: ['John Flamsteed', 'James Bradley', 'Nevil Maskelyne'] },
{ c: 'Books & Authors', t: 5, q: 'Which Sicilian prince wrote a single novel, published after his death, about a fading aristocracy?', a: 'Giuseppe Tomasi di Lampedusa', d: ['Italo Calvino', 'Alberto Moravia', 'Cesare Pavese'] },
{ c: 'Screen Lines', t: 5, q: 'Which character tells his brother in the back of a car that he could have been a contender?', a: 'Terry Malloy', d: ['Charley Malloy', 'Johnny Friendly', 'Edie Doyle'] },
],

// ── Day 29 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president was the first to live in the White House?', a: 'John Adams', d: ['George Washington', 'Thomas Jefferson', 'James Madison'] },
{ c: 'History & War', t: 1, q: 'Which war ended with the armistice signed on 11 November 1918?', a: 'The First World War', d: ['The Second World War', 'The Franco-Prussian War', 'The Crimean War'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which chemist arranged the elements into the table still used today?', a: 'Dmitri Mendeleev', d: ['Antoine Lavoisier', 'John Dalton', 'Robert Boyle'] },
{ c: 'Books & Authors', t: 1, q: 'Which picture book opens with a tree who loved a little boy?', a: 'The Giving Tree', d: ['The Velveteen Rabbit', 'Corduroy', 'The Little House'] },
{ c: 'Screen Lines', t: 1, q: 'Which character narrates the mission to boldly go where no man has gone before?', a: 'Captain Kirk', d: ['Spock', 'Dr. McCoy', 'Montgomery Scott'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president campaigned on the doctrine of peace through strength?', a: 'Ronald Reagan', d: ['Richard Nixon', 'Jimmy Carter', 'George H. W. Bush'] },
{ c: 'History & War', t: 2, q: 'Which general commanded all Union armies at the end of the American Civil War?', a: 'Ulysses S. Grant', d: ['George Meade', 'Henry Halleck', 'George McClellan'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which surgeon introduced antiseptic operating using carbolic acid?', a: 'Joseph Lister', d: ['Ignaz Semmelweis', 'William Halsted', 'John Hunter'] },
{ c: 'Books & Authors', t: 2, q: "Which novel opens with the warning 'You better not never tell nobody but God'?", a: 'The Color Purple', d: ['Beloved', 'Their Eyes Were Watching God', 'Sula'] },
{ c: 'Screen Lines', t: 2, q: "Which character says he is serious, and not to call him Shirley?", a: 'Dr. Rumack', d: ['Ted Striker', 'Elaine Dickinson', 'Captain Oveur'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which prime minister told a Harvard audience that the price of greatness is responsibility?', a: 'Winston Churchill', d: ['Clement Attlee', 'Anthony Eden', 'Harold Macmillan'] },
{ c: 'History & War', t: 3, q: 'Which general seized power in France in 1799 and made himself first consul?', a: 'Napoleon Bonaparte', d: ['Lazare Carnot', 'Emmanuel Sieyes', 'Jean-Victor Moreau'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which philosopher argued that a just city would be governed by philosopher kings?', a: 'Plato', d: ['Aristotle', 'Xenophon', 'Isocrates'] },
{ c: 'Books & Authors', t: 3, q: 'Which poet asked what happens to a dream deferred?', a: 'Langston Hughes', d: ['Countee Cullen', 'Claude McKay', 'Jean Toomer'] },
{ c: 'Screen Lines', t: 3, q: 'Which character warns a kidnapper down the phone that he has a very particular set of skills?', a: 'Bryan Mills', d: ['Kim Mills', 'Lenore', 'Marko'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which president complained that nothing brings out the lower traits of human nature like office seeking?', a: 'Rutherford B. Hayes', d: ['James Garfield', 'Chester Arthur', 'Grover Cleveland'] },
{ c: 'History & War', t: 4, q: 'Which cavalry officer led the charge of the Light Brigade at Balaclava?', a: 'Lord Cardigan', d: ['Lord Lucan', 'Lord Raglan', 'Louis Nolan'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which writer answered Edmund Burke and then argued for the rights of woman?', a: 'Mary Wollstonecraft', d: ['Harriet Taylor Mill', 'Olympe de Gouges', 'Hannah More'] },
{ c: 'Books & Authors', t: 4, q: 'Which novelist wrote Middlemarch under a name that was not her own?', a: 'George Eliot', d: ['Elizabeth Gaskell', 'Margaret Oliphant', 'Charlotte Yonge'] },
{ c: 'Screen Lines', t: 4, q: "Which character yells 'Get to the chopper!' in Predator?", a: 'Dutch', d: ['Dillon', 'Blain', 'Billy'] },

{ c: 'Presidents & Politics', t: 5, q: "Which MP quoted Cromwell's words back at Neville Chamberlain in the Commons in 1940?", a: 'Leo Amery', d: ['Clement Attlee', 'Anthony Eden', 'David Lloyd George'] },
{ c: 'History & War', t: 5, q: 'Which Athenian playwright had his service at Marathon, not his plays, carved on his tomb?', a: 'Aeschylus', d: ['Sophocles', 'Euripides', 'Aristophanes'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which mathematician set out twenty-three unsolved problems to guide the new century in 1900?', a: 'David Hilbert', d: ['Henri Poincare', 'Felix Klein', 'Hermann Minkowski'] },
{ c: 'Books & Authors', t: 5, q: 'Which German novelist wrote a book narrated by a boy who refuses to grow?', a: 'Gunter Grass', d: ['Heinrich Boll', 'Siegfried Lenz', 'Uwe Johnson'] },
{ c: 'Screen Lines', t: 5, q: 'Which character explains that some men just want to watch the world burn?', a: 'Alfred Pennyworth', d: ['The Joker', 'Bruce Wayne', 'Lucius Fox'] },
],

// ── Day 30 ─────────────────────────────────────────────────────────────────
[
{ c: 'Presidents & Politics', t: 1, q: 'Which president appears on the American one dollar bill?', a: 'George Washington', d: ['Abraham Lincoln', 'Thomas Jefferson', 'Alexander Hamilton'] },
{ c: 'History & War', t: 1, q: 'Which barrier divided a German city from 1961 until 1989?', a: 'The Berlin Wall', d: ["Hadrian's Wall", 'The Maginot Line', 'The Siegfried Line'] },
{ c: 'Science, Letters & Ideas', t: 1, q: 'Which physicist published the general theory of relativity in 1915?', a: 'Albert Einstein', d: ['Max Planck', 'Hendrik Lorentz', 'Henri Poincare'] },
{ c: 'Books & Authors', t: 1, q: 'Which novel opens with a farmer locking the hen-houses for the night but forgetting the pop-holes?', a: 'Animal Farm', d: ['Nineteen Eighty-Four', 'Watership Down', 'Lord of the Flies'] },
{ c: 'Screen Lines', t: 1, q: "Which character announces 'I'm Mary Poppins, y'all' in Guardians of the Galaxy Vol. 2?", a: 'Yondu', d: ['Star-Lord', 'Rocket', 'Drax'] },

{ c: 'Presidents & Politics', t: 2, q: 'Which president wrote that the only limit to our realisation of tomorrow will be our doubts of today?', a: 'Franklin D. Roosevelt', d: ['Woodrow Wilson', 'Harry S. Truman', 'Herbert Hoover'] },
{ c: 'History & War', t: 2, q: 'Which British commander led the Eighth Army to victory at El Alamein?', a: 'Bernard Montgomery', d: ['Claude Auchinleck', 'Harold Alexander', 'Archibald Wavell'] },
{ c: 'Science, Letters & Ideas', t: 2, q: 'Which physicist devised the thought experiment about a cat in a sealed box?', a: 'Erwin Schrodinger', d: ['Werner Heisenberg', 'Niels Bohr', 'Paul Dirac'] },
{ c: 'Books & Authors', t: 2, q: 'Which novel opens outside a squat grey building of only thirty-four storeys?', a: 'Brave New World', d: ['Nineteen Eighty-Four', 'Fahrenheit 451', 'Erewhon'] },
{ c: 'Screen Lines', t: 2, q: 'Which character says you either die a hero or live long enough to see yourself become the villain?', a: 'Harvey Dent', d: ['Bruce Wayne', 'The Joker', 'Rachel Dawes'] },

{ c: 'Presidents & Politics', t: 3, q: 'Which president said he had never advocated war except as a means of peace?', a: 'Ulysses S. Grant', d: ['William Tecumseh Sherman', 'Rutherford B. Hayes', 'James Garfield'] },
{ c: 'History & War', t: 3, q: 'Which German officer planted the bomb in the July 1944 plot against Hitler?', a: 'Claus von Stauffenberg', d: ['Ludwig Beck', 'Carl Goerdeler', 'Henning von Tresckow'] },
{ c: 'Science, Letters & Ideas', t: 3, q: 'Which philosopher wrote Being and Time?', a: 'Martin Heidegger', d: ['Edmund Husserl', 'Karl Jaspers', 'Hans-Georg Gadamer'] },
{ c: 'Books & Authors', t: 3, q: 'Which Colombian novelist wrote the saga of the Buendia family in Macondo?', a: 'Gabriel Garcia Marquez', d: ['Mario Vargas Llosa', 'Julio Cortazar', 'Carlos Fuentes'] },
{ c: 'Screen Lines', t: 3, q: 'Which character describes eating a census taker with fava beans and a nice Chianti?', a: 'Hannibal Lecter', d: ['Clarice Starling', 'Jack Crawford', 'Buffalo Bill'] },

{ c: 'Presidents & Politics', t: 4, q: 'Which author of the Federalist Papers argued that energy in the executive is a leading character in good government?', a: 'Alexander Hamilton', d: ['James Madison', 'John Jay', 'Gouverneur Morris'] },
{ c: 'History & War', t: 4, q: 'Which commander was proclaimed emperor by his troops in Britain in 306?', a: 'Constantine', d: ['Maxentius', 'Licinius', 'Galerius'] },
{ c: 'Science, Letters & Ideas', t: 4, q: 'Which Greek astronomer produced the first known scale of stellar brightness?', a: 'Hipparchus', d: ['Ptolemy', 'Eratosthenes', 'Aristarchus'] },
{ c: 'Books & Authors', t: 4, q: 'Which poet wrote of anyone who lived in a pretty how town?', a: 'e. e. cummings', d: ['Wallace Stevens', 'Hart Crane', 'William Carlos Williams'] },
{ c: 'Screen Lines', t: 4, q: "Which character says 'Chewie, we're home' on stepping back aboard his old ship?", a: 'Han Solo', d: ['Leia Organa', 'Rey', 'Finn'] },

{ c: 'Presidents & Politics', t: 5, q: 'Which French revolutionary was stabbed to death in his bath in 1793?', a: 'Jean-Paul Marat', d: ['Georges Danton', 'Camille Desmoulins', 'Louis Saint-Just'] },
{ c: 'History & War', t: 5, q: 'Which admiral led the Ming treasure fleets across the Indian Ocean in the fifteenth century?', a: 'Zheng He', d: ['Wang Jinghong', 'Hong Bao', 'Zhou Man'] },
{ c: 'Science, Letters & Ideas', t: 5, q: 'Which Scottish philosopher wrote A Treatise of Human Nature in his twenties?', a: 'David Hume', d: ['Adam Ferguson', 'Thomas Reid', 'Dugald Stewart'] },
{ c: 'Books & Authors', t: 5, q: 'Which Italian novelist wrote a book made of ten unfinished novels addressed to its reader?', a: 'Italo Calvino', d: ['Umberto Eco', 'Primo Levi', 'Cesare Pavese'] },
{ c: 'Screen Lines', t: 5, q: 'Which character descends a staircase declaring she is ready for her close-up?', a: 'Norma Desmond', d: ['Joe Gillis', 'Max von Mayerling', 'Betty Schaefer'] },
],

];
