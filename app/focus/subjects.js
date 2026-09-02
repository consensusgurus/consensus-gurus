// Focus — the daily zoomed-photo game. One subject per ET weekday, and each
// subject carries its whole answer universe: the type-ahead offers ONLY these
// names, so a pick is always a real guess and a typo never costs anything.
// Every day's answer in puzzles.js must appear in its weekday's `options`
// (scripts/verify-focus.mjs checks this), and the universe is deliberately a
// few dozen names, wide enough that the first frame is a real puzzle and
// narrow enough that the list is a ladder rather than a haystack.
//
// Sunday is index 0, matching Date#getDay() in America/New_York.

export const SUBJECTS = [
  {
    key: 'space', label: 'Space', prompt: 'Name what the camera is looking at',
    blurb: 'Planets, moons, nebulae and the machines we sent up to see them.',
    options: [
      'Earth', 'The Moon', 'The Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
      'International Space Station', 'Hubble Space Telescope', 'James Webb Space Telescope', 'Space Shuttle', 'Saturn V', 'Apollo Lunar Module', 'Voyager', 'Curiosity rover', 'Perseverance rover', 'Starship', 'Falcon 9',
      'Pillars of Creation', 'Andromeda Galaxy', 'Milky Way', 'Orion Nebula', 'Crab Nebula', 'Horsehead Nebula', 'Helix Nebula', 'Sombrero Galaxy', 'Whirlpool Galaxy', 'Eagle Nebula', 'Carina Nebula',
      'Halley’s Comet', 'Europa', 'Titan', 'Io', 'Enceladus', 'Phobos', 'Ceres', 'The Great Red Spot', 'A solar eclipse', 'A lunar eclipse', 'Aurora borealis', 'A black hole',
      'Comet', 'Asteroid', 'Meteor shower', 'Apollo 11', 'Sputnik', 'Lunar rover', 'Astronaut on a spacewalk', 'Rocket launch', 'Satellite', 'Solar flare', 'Sunspot', 'Meteorite', 'Ganymede', 'Callisto', 'Triton', 'Charon', 'Vesta', 'Supernova', 'Star cluster', 'Spiral galaxy', 'Cat’s Eye Nebula', 'Ring Nebula', 'Lagoon Nebula', 'Tarantula Nebula', 'Butterfly Nebula', 'Bubble Nebula', 'Veil Nebula', 'Pleiades', 'Betelgeuse', 'Sirius', 'Polaris', 'Big Dipper', 'Orion', 'Olympus Mons', 'Valles Marineris', 'Lunar crater', 'Far side of the Moon', 'Earthrise', 'Blue Marble', 'Pale Blue Dot', 'Space station cupola', 'Soyuz', 'Dragon capsule', 'Rocket engine', 'Launch pad', 'Mission control', 'Observatory dome', 'Radio telescope',
    ],
  },
  {
    key: 'landmarks', label: 'Landmarks', prompt: 'Name the landmark',
    blurb: 'Bridges, towers, temples and monuments you would know from across a city.',
    options: [
      'Eiffel Tower', 'Golden Gate Bridge', 'Statue of Liberty', 'Taj Mahal', 'Colosseum', 'Sydney Opera House', 'Big Ben', 'Tower Bridge', 'Brooklyn Bridge', 'Empire State Building',
      'Burj Khalifa', 'Christ the Redeemer', 'Machu Picchu', 'Great Wall of China', 'Stonehenge', 'Leaning Tower of Pisa', 'Sagrada Família', 'Petra', 'Angkor Wat', 'Great Pyramid of Giza',
      'Mount Rushmore', 'Space Needle', 'Gateway Arch', 'Hollywood Sign', 'Chrysler Building', 'Louvre Pyramid', 'Arc de Triomphe', 'Notre-Dame de Paris', 'Buckingham Palace', 'Neuschwanstein Castle',
      'Parthenon', 'Hagia Sophia', 'Blue Mosque', 'St. Basil’s Cathedral', 'Kremlin', 'Brandenburg Gate', 'Atomium', 'Petronas Towers', 'Tokyo Tower', 'Forbidden City',
      'Moai of Easter Island', 'Chichen Itza', 'Alhambra', 'Edinburgh Castle', 'Hoover Dam', 'CN Tower', 'Sphinx of Giza', 'Lincoln Memorial', 'Washington Monument', 'White House',
      'Tower of London', 'Westminster Abbey', 'St. Paul’s Cathedral', 'London Eye', 'The Shard', 'Trevi Fountain', 'Pantheon', 'St. Peter’s Basilica', 'Duomo di Milano', 'Rialto Bridge', 'St. Mark’s Basilica', 'Pompeii', 'Mont Saint-Michel', 'Palace of Versailles', 'Moulin Rouge', 'Sacré-Cœur', 'Cologne Cathedral', 'Berlin TV Tower', 'Prague Castle', 'Charles Bridge', 'Schönbrunn Palace', 'Acropolis', 'Santorini', 'Sydney Harbour Bridge', 'Uluru', 'Marina Bay Sands', 'Gardens by the Bay', 'Burj Al Arab', 'Kaaba', 'Western Wall', 'Dome of the Rock', 'Abu Simbel', 'Luxor Temple', 'Table Mountain', 'Victoria Falls', 'Golden Temple', 'Lotus Temple', 'Red Fort', 'Gateway of India', 'Potala Palace', 'Temple of Heaven', 'Terracotta Army', 'Shanghai Tower', 'Oriental Pearl Tower', 'Gyeongbokgung Palace', 'Fushimi Inari Shrine', 'Kinkaku-ji', 'Himeji Castle', 'Shibuya Crossing', 'Itsukushima Shrine', 'One World Trade Center', 'Times Square', 'Central Park', 'Flatiron Building', 'Grand Central Terminal', 'United States Capitol', 'Jefferson Memorial', 'Pentagon', 'Alcatraz', 'Las Vegas Strip', 'Cinderella Castle', 'Cloud Gate', 'Willis Tower', 'Niagara Falls', 'Old Faithful', 'Statue of David', 'The Little Mermaid', 'Manneken Pis', 'Mount Vesuvius', 'Blue Lagoon', 'Giant’s Causeway', 'Cliffs of Moher', 'Loch Ness', 'Stirling Castle', 'Windsor Castle', 'Hadrian’s Wall', 'Roman Baths', 'Blackpool Tower', 'Angel of the North', 'Louvre', 'Pont du Gard', 'Chateau de Chambord', 'Carcassonne', 'Matterhorn', 'Jungfrau', 'Ponte Vecchio', 'Florence Cathedral', 'Vatican', 'Sistine Chapel', 'Meteora', 'Wadi Rum', 'Cappadocia', 'Bran Castle', 'Red Square', 'Bolshoi Theatre', 'Trans-Siberian Railway', 'Summer Palace', 'Bund', 'Victoria Peak', 'Hong Kong skyline', 'Taipei 101', 'Lotte Tower', 'Tokyo Skytree', 'Osaka Castle', 'Nara Great Buddha', 'Borobudur', 'Ha Long Bay', 'Wat Arun', 'Grand Palace', 'Shwedagon Pagoda', 'Sigiriya', 'Hawa Mahal', 'Amber Fort', 'Mysore Palace',
    ],
  },
  {
    key: 'animals', label: 'Animals', prompt: 'Name the animal',
    blurb: 'Fur, feather and scale, from the first patch of pattern outward.',
    options: [
      'Giraffe', 'Zebra', 'Flamingo', 'Chameleon', 'Peacock', 'Red panda', 'Giant panda', 'Lion', 'Tiger', 'Leopard', 'Cheetah', 'Jaguar', 'Elephant', 'Rhinoceros', 'Hippopotamus',
      'Gorilla', 'Orangutan', 'Chimpanzee', 'Koala', 'Kangaroo', 'Platypus', 'Sloth', 'Polar bear', 'Grizzly bear', 'Wolf', 'Red fox', 'Arctic fox', 'Moose', 'Bison', 'Camel',
      'Bald eagle', 'Owl', 'Toucan', 'Parrot', 'Penguin', 'Ostrich', 'Hummingbird', 'Puffin', 'Swan', 'Kingfisher',
      'Crocodile', 'Komodo dragon', 'Iguana', 'Sea turtle', 'Frog', 'Axolotl', 'Octopus', 'Jellyfish', 'Clownfish', 'Seahorse', 'Great white shark', 'Humpback whale', 'Dolphin', 'Orca', 'Manta ray',
      'Monarch butterfly', 'Honeybee', 'Ladybird', 'Dragonfly', 'Tarantula', 'Snail', 'Hedgehog', 'Raccoon', 'Meerkat', 'Lemur',
      'Dog', 'Cat', 'Horse', 'Cow', 'Pig', 'Sheep', 'Goat', 'Chicken', 'Rooster', 'Duck', 'Goose', 'Turkey', 'Rabbit', 'Hamster', 'Guinea pig', 'Mouse', 'Rat', 'Squirrel', 'Chipmunk', 'Beaver', 'Otter', 'Seal', 'Sea lion', 'Walrus', 'Deer', 'Elk', 'Reindeer', 'Antelope', 'Gazelle', 'Buffalo', 'Yak', 'Llama', 'Alpaca', 'Donkey', 'Bat', 'Black bear', 'Panther', 'Lynx', 'Bobcat', 'Cougar', 'Hyena', 'Jackal', 'Coyote', 'Warthog', 'Wild boar', 'Tapir', 'Okapi', 'Anteater', 'Armadillo', 'Porcupine', 'Skunk', 'Badger', 'Wolverine', 'Mongoose', 'Baboon', 'Mandrill', 'Capuchin monkey', 'Gibbon', 'Wombat', 'Tasmanian devil', 'Echidna', 'Golden eagle', 'Falcon', 'Hawk', 'Vulture', 'Condor', 'Crow', 'Raven', 'Magpie', 'Pigeon', 'Sparrow', 'Robin', 'Blue jay', 'Cardinal', 'Woodpecker', 'Macaw', 'Cockatoo', 'Budgie', 'Pelican', 'Heron', 'Stork', 'Crane', 'Albatross', 'Seagull', 'Emu', 'Kiwi', 'Alligator', 'Python', 'Cobra', 'Rattlesnake', 'Anaconda', 'Gecko', 'Tortoise', 'Salamander', 'Toad', 'Newt', 'Piranha', 'Salmon', 'Goldfish', 'Koi', 'Swordfish', 'Tuna', 'Hammerhead shark', 'Whale shark', 'Blue whale', 'Sperm whale', 'Narwhal', 'Beluga whale', 'Manatee', 'Stingray', 'Squid', 'Lobster', 'Crab', 'Shrimp', 'Starfish', 'Sea urchin', 'Coral', 'Sea anemone', 'Butterfly', 'Moth', 'Bumblebee', 'Wasp', 'Ant', 'Beetle', 'Grasshopper', 'Cricket', 'Praying mantis', 'Scorpion', 'Spider', 'Centipede', 'Earthworm', 'Slug', 'Mole', 'Hare', 'Ferret', 'Mink', 'Weasel', 'Chinchilla', 'Gerbil', 'Ram', 'Bull', 'Pony', 'Water buffalo', 'Musk ox', 'Ibex', 'Bighorn sheep', 'Mountain goat', 'Snow leopard', 'Clouded leopard', 'Serval', 'Caracal', 'Ocelot', 'Fennec fox', 'Dingo', 'African wild dog', 'Sloth bear', 'Sun bear', 'Spectacled bear', 'Pangolin', 'Aardvark',
    ],
  },
  {
    key: 'paintings', label: 'Paintings', prompt: 'Name the painting',
    blurb: 'Brushstrokes first, the whole canvas last.',
    options: [
      'The Starry Night', 'Mona Lisa', 'Girl with a Pearl Earring', 'The Great Wave off Kanagawa', 'The Scream', 'American Gothic', 'The Birth of Venus', 'The Last Supper', 'The Persistence of Memory', 'Guernica',
      'The Kiss', 'Water Lilies', 'Sunflowers', 'The Night Watch', 'Whistler’s Mother', 'Nighthawks', 'A Sunday Afternoon on the Island of La Grande Jatte', 'Café Terrace at Night', 'Irises', 'The Garden of Earthly Delights',
      'Liberty Leading the People', 'Washington Crossing the Delaware', 'The Creation of Adam', 'The School of Athens', 'Las Meninas', 'The Arnolfini Portrait', 'Bal du moulin de la Galette', 'Impression, Sunrise', 'The Son of Man', 'Composition VIII',
      'Christina’s World', 'The Raft of the Medusa', 'Wanderer above the Sea of Fog', 'The Hay Wain', 'The Fighting Temeraire', 'Ophelia', 'The Lady of Shalott', 'Dance at Le Moulin de la Galette', 'The Dance', 'Campbell’s Soup Cans',
      'Self-Portrait with Thorn Necklace', 'The Two Fridas', 'Lady with an Ermine', 'The Milkmaid', 'Girl with a Red Hat', 'Olympia', 'Luncheon on the Grass', 'The Card Players', 'Mont Sainte-Victoire', 'Broadway Boogie Woogie',
      'The Sleeping Gypsy', 'The Dream', 'Girl Before a Mirror', 'Les Demoiselles d’Avignon', 'Weeping Woman', 'The Old Guitarist', 'Bedroom in Arles', 'Wheatfield with Crows', 'Almond Blossoms', 'Self-Portrait with Bandaged Ear', 'The Potato Eaters', 'Woman with a Parasol', 'Poppies', 'Haystacks', 'Rouen Cathedral', 'The Swing', 'The Blue Boy', 'Whistlejacket', 'The Death of Marat', 'Napoleon Crossing the Alps', 'The Third of May 1808', 'Saturn Devouring His Son', 'View of Toledo', 'Judith Slaying Holofernes', 'The Calling of St Matthew', 'The Tower of Babel', 'Hunters in the Snow', 'The Peasant Wedding', 'The Ambassadors', 'Venus of Urbino', 'Primavera', 'The Wedding at Cana', 'The Anatomy Lesson', 'The Jewish Bride', 'View of Delft', 'The Astronomer', 'The Geographer', 'Flaming June', 'The Nightmare', 'Rain, Steam and Speed', 'The Gleaners', 'The Angelus', 'Paris Street; Rainy Day', 'The Floor Scrapers', 'A Bar at the Folies-Bergère', 'Luncheon of the Boating Party', 'The Bathers', 'Still Life with Apples', 'Vision after the Sermon', 'Tahitian Women', 'At the Moulin Rouge', 'Nude Descending a Staircase', 'The Treachery of Images', 'Golconda', 'Swans Reflecting Elephants', 'The Elephants', 'Autumn Rhythm', 'Orange, Red, Yellow', 'Woman I', 'Flag', 'Marilyn Diptych', 'Whaam!', 'Drowning Girl', 'Freedom from Want', 'Hotel Lobby', 'Automat', 'Early Sunday Morning', 'Portrait of Adele Bloch-Bauer', 'The Tree of Life', 'Girl with Balloon',
    ],
  },
  {
    key: 'machines', label: 'Machines', prompt: 'Name the machine',
    blurb: 'Things people built, from a bolt or a key up to the whole contraption.',
    options: [
      'Vespa', 'Volkswagen Beetle', 'Rubik’s Cube', 'Grand piano', 'Concorde', 'Typewriter', 'Hot air balloon', 'Steam locomotive', 'Bicycle', 'Penny-farthing',
      'Ford Model T', 'Mini Cooper', 'DeLorean', 'Jeep', 'London bus', 'Yellow cab', 'Tractor', 'Harley-Davidson', 'Segway', 'Skateboard',
      'Boeing 747', 'Helicopter', 'Zeppelin', 'Wright Flyer', 'Spitfire', 'Fighter jet', 'Sailing ship', 'Submarine', 'Titanic', 'Gondola',
      'Rotary telephone', 'Gramophone', 'Jukebox', 'Cassette player', 'Game Boy', 'Polaroid camera', 'Film projector', 'Television', 'Vinyl record', 'Microphone',
      'Sewing machine', 'Windmill', 'Ferris wheel', 'Roller coaster', 'Carousel', 'Espresso machine', 'Pocket watch', 'Grandfather clock', 'Abacus', 'Slot machine',
      'Violin', 'Saxophone', 'Trumpet', 'Drum kit', 'Electric guitar', 'Accordion', 'Harp', 'Telescope', 'Microscope', 'Robot arm',
      'Motorcycle', 'Tricycle', 'Unicycle', 'Rickshaw', 'Tuk-tuk', 'Golf cart', 'Forklift', 'Bulldozer', 'Excavator', 'Construction crane', 'Cement mixer', 'Dump truck', 'Fire engine', 'Ambulance', 'Police car', 'School bus', 'Double-decker bus', 'Tram', 'Subway train', 'Bullet train', 'Monorail', 'Cable car', 'Ski lift', 'Snowmobile', 'Jet ski', 'Speedboat', 'Yacht', 'Cruise ship', 'Aircraft carrier', 'Container ship', 'Tugboat', 'Canoe', 'Kayak', 'Rowing boat', 'Hovercraft', 'Airship', 'Glider', 'Seaplane', 'Biplane', 'Boeing 737', 'Airbus A380', 'Stealth bomber', 'Drone', 'Space rocket', 'Satellite dish', 'Wind turbine', 'Solar panel', 'Combine harvester', 'Lawn mower', 'Chainsaw', 'Power drill', 'Jackhammer', 'Printing press', 'Loom', 'Spinning wheel', 'Water wheel', 'Hourglass', 'Sundial', 'Cuckoo clock', 'Wristwatch', 'Metronome', 'Calculator', 'Cash register', 'Vending machine', 'Pinball machine', 'Arcade cabinet', 'Games console', 'Joystick', 'Computer mouse', 'Keyboard', 'Laptop', 'Smartphone', 'Walkman', 'Boombox', 'Radio', 'Turntable', 'Loudspeaker', 'Headphones', 'Camera', 'Camcorder', 'Binoculars', 'Compass', 'Sextant', 'Barometer', 'Stethoscope', 'Microwave', 'Toaster', 'Blender', 'Refrigerator', 'Washing machine', 'Vacuum cleaner', 'Organ', 'Harpsichord', 'Cello', 'Double bass', 'Banjo', 'Ukulele', 'Bagpipes', 'Tuba', 'French horn', 'Clarinet', 'Flute', 'Xylophone', 'Cymbals', 'Tambourine', 'Harmonica', 'Propeller', 'Anchor', 'Steering wheel', 'Speedometer', 'Zipper', 'Padlock', 'Scissors', 'Umbrella', 'Fountain pen', 'Stapler', 'Light bulb', 'Lantern', 'Kite', 'Yo-yo', 'Spinning top', 'Dice', 'Chess set', 'Roulette wheel', 'Telephone box', 'Mailbox', 'Fire hydrant', 'Traffic light', 'Parking meter', 'Shopping cart', 'Wheelbarrow', 'Sled', 'Roller skates', 'Ice skates', 'Trampoline', 'Bumper cars', 'Water slide', 'Escalator', 'Elevator', 'Drawbridge', 'Oil rig', 'Tank', 'Cannon', 'Catapult', 'Trebuchet', 'Anvil', 'Potter’s wheel', 'Lighthouse', 'Cassette tape', 'Floppy disk', 'CD player', 'Game controller',
    ],
  },
  {
    key: 'faces', label: 'Faces', prompt: 'Name the person',
    blurb: 'Famous faces from the history books, an eye or an eyebrow at a time.',
    options: [
      'Albert Einstein', 'Abraham Lincoln', 'Frida Kahlo', 'Marie Curie', 'Nikola Tesla', 'Charles Darwin', 'Mahatma Gandhi', 'Winston Churchill', 'Napoleon Bonaparte', 'Queen Victoria',
      'George Washington', 'Thomas Jefferson', 'Benjamin Franklin', 'Theodore Roosevelt', 'Franklin D. Roosevelt', 'John F. Kennedy', 'Martin Luther King Jr.', 'Nelson Mandela', 'Rosa Parks', 'Harriet Tubman',
      'Isaac Newton', 'Galileo Galilei', 'Leonardo da Vinci', 'Vincent van Gogh', 'Pablo Picasso', 'Claude Monet', 'Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Frederic Chopin',
      'William Shakespeare', 'Charles Dickens', 'Mark Twain', 'Jane Austen', 'Oscar Wilde', 'Ernest Hemingway', 'Virginia Woolf', 'Edgar Allan Poe', 'Leo Tolstoy', 'Franz Kafka',
      'Amelia Earhart', 'Charlie Chaplin', 'Marilyn Monroe', 'Audrey Hepburn', 'Elvis Presley', 'The Beatles', 'Muhammad Ali', 'Babe Ruth', 'Jesse Owens', 'Bruce Lee',
      'Cleopatra', 'Julius Caesar', 'Alexander the Great', 'Genghis Khan', 'Joan of Arc', 'Henry VIII', 'Elizabeth I', 'Louis XIV', 'Sigmund Freud', 'Alan Turing',
      'Queen Elizabeth II', 'Princess Diana', 'Barack Obama', 'Ronald Reagan', 'Richard Nixon', 'Dwight D. Eisenhower', 'Harry S. Truman', 'Woodrow Wilson', 'Ulysses S. Grant', 'Andrew Jackson', 'John Adams', 'James Madison', 'Alexander Hamilton', 'Frederick Douglass', 'Booker T. Washington', 'W. E. B. Du Bois', 'Malcolm X', 'Susan B. Anthony', 'Eleanor Roosevelt', 'Helen Keller', 'Florence Nightingale', 'Mother Teresa', 'Pope John Paul II', 'Dalai Lama', 'Desmond Tutu', 'Jawaharlal Nehru', 'Indira Gandhi', 'Mao Zedong', 'Ho Chi Minh', 'Vladimir Lenin', 'Joseph Stalin', 'Leon Trotsky', 'Mikhail Gorbachev', 'Karl Marx', 'Adolf Hitler', 'Benito Mussolini', 'Charles de Gaulle', 'Otto von Bismarck', 'Kaiser Wilhelm II', 'Marie Antoinette', 'Catherine the Great', 'Peter the Great', 'Ivan the Terrible', 'Rasputin', 'Nicholas II', 'Che Guevara', 'Fidel Castro', 'Simón Bolívar', 'Eva Perón', 'Pancho Villa', 'Emiliano Zapata', 'Christopher Columbus', 'Ferdinand Magellan', 'Marco Polo', 'Captain Cook', 'Ernest Shackleton', 'Roald Amundsen', 'Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Sally Ride', 'Wright brothers', 'Henry Ford', 'Thomas Edison', 'Alexander Graham Bell', 'Guglielmo Marconi', 'Samuel Morse', 'George Washington Carver', 'Louis Pasteur', 'Gregor Mendel', 'Niels Bohr', 'Max Planck', 'Enrico Fermi', 'Robert Oppenheimer', 'Richard Feynman', 'Stephen Hawking', 'Carl Sagan', 'Jane Goodall', 'Rachel Carson', 'Ada Lovelace', 'Charles Babbage', 'Steve Jobs', 'Bill Gates', 'Socrates', 'Plato', 'Aristotle', 'Confucius', 'Dante Alighieri', 'Geoffrey Chaucer', 'John Milton', 'Voltaire', 'Jean-Jacques Rousseau', 'Johann Wolfgang von Goethe', 'Victor Hugo', 'Alexandre Dumas', 'Jules Verne', 'Marcel Proust', 'Fyodor Dostoevsky', 'Anton Chekhov', 'Walt Whitman', 'Emily Dickinson', 'Henry David Thoreau', 'Ralph Waldo Emerson', 'Herman Melville', 'Louisa May Alcott', 'Lewis Carroll', 'Rudyard Kipling', 'Arthur Conan Doyle', 'Agatha Christie', 'H. G. Wells', 'George Orwell', 'James Joyce', 'W. B. Yeats', 'T. S. Eliot', 'F. Scott Fitzgerald', 'John Steinbeck', 'William Faulkner', 'Langston Hughes', 'Maya Angelou', 'J. R. R. Tolkien', 'C. S. Lewis', 'Roald Dahl', 'Dr. Seuss', 'Walt Disney', 'Alfred Hitchcock', 'Orson Welles', 'Stanley Kubrick', 'Buster Keaton', 'Humphrey Bogart', 'Cary Grant', 'James Dean', 'Grace Kelly', 'Elizabeth Taylor', 'Katharine Hepburn', 'Fred Astaire', 'Gene Kelly', 'Judy Garland', 'Frank Sinatra', 'Louis Armstrong', 'Duke Ellington', 'Ella Fitzgerald', 'Billie Holiday', 'Miles Davis', 'John Coltrane', 'Bob Dylan', 'Jimi Hendrix', 'Janis Joplin', 'Johnny Cash', 'Aretha Franklin', 'Michael Jackson', 'David Bowie', 'Freddie Mercury', 'John Lennon', 'Paul McCartney', 'Bob Marley', 'Jackie Robinson', 'Joe DiMaggio', 'Lou Gehrig', 'Ty Cobb', 'Jim Thorpe', 'Pelé', 'Diego Maradona', 'Michael Jordan', 'Wilt Chamberlain', 'Jack Dempsey', 'Joe Louis', 'Rocky Marciano', 'Jack Nicklaus', 'Arnold Palmer', 'Billie Jean King', 'Arthur Ashe', 'Wayne Gretzky', 'Coco Chanel', 'Andy Warhol', 'Salvador Dalí', 'Georgia O’Keeffe', 'Jackson Pollock', 'Rembrandt', 'Michelangelo', 'Raphael', 'Caravaggio', 'Johannes Vermeer', 'Auguste Rodin', 'Edgar Degas', 'Paul Cézanne', 'Paul Gauguin', 'Henri Matisse', 'Edvard Munch', 'Gustav Klimt', 'Wassily Kandinsky', 'Piet Mondrian', 'Frank Lloyd Wright', 'Antoni Gaudí', 'Anne Frank', 'Douglas MacArthur', 'George S. Patton', 'Erwin Rommel', 'Robert E. Lee', 'Horatio Nelson', 'Duke of Wellington', 'Lawrence of Arabia', 'Geronimo', 'Sitting Bull', 'Sacagawea', 'Buffalo Bill', 'Billy the Kid', 'Jesse James', 'Wyatt Earp', 'Annie Oakley', 'Al Capone', 'Harry Houdini', 'P. T. Barnum',
    ],
  },
  {
    key: 'above', label: 'From above', prompt: 'Name the place',
    blurb: 'Cities, coasts and canyons the way a satellite sees them.',
    options: [
      'Manhattan', 'Venice', 'Palm Jumeirah', 'Grand Canyon', 'Mount Fuji', 'The Nile Delta', 'Iceland', 'Hawaii', 'Sicily', 'Cuba',
      'Florida', 'Italy', 'Great Britain', 'Ireland', 'Japan', 'Sri Lanka', 'Madagascar', 'New Zealand', 'Greenland', 'Tasmania',
      'Paris', 'London', 'Washington, D.C.', 'San Francisco', 'Chicago', 'Tokyo', 'Dubai', 'Singapore', 'Hong Kong', 'Rio de Janeiro',
      'Sydney', 'Cape Town', 'Istanbul', 'Barcelona', 'Amsterdam', 'Las Vegas', 'Brasilia', 'Canberra', 'Mexico City', 'Cairo',
      'Mount Everest', 'Mount Kilimanjaro', 'Mount Etna', 'Mount Vesuvius', 'Yellowstone', 'Niagara Falls', 'Uluru', 'Great Barrier Reef', 'The Sahara', 'The Amazon River',
      'Panama Canal', 'Suez Canal', 'Strait of Gibraltar', 'The Dead Sea', 'Lake Baikal', 'Great Salt Lake', 'Bora Bora', 'The Maldives', 'Cape Cod', 'The Bahamas',
      'Long Island', 'Boston Harbor', 'Chesapeake Bay', 'Florida Keys', 'Everglades', 'Mississippi Delta', 'Great Lakes', 'Lake Michigan', 'Lake Tahoe', 'Death Valley', 'Monument Valley', 'Yosemite', 'Mount St. Helens', 'Mount Rainier', 'Crater Lake', 'Denali', 'Alaska', 'Baja California', 'Yucatán Peninsula', 'Galápagos Islands', 'The Andes', 'Lake Titicaca', 'Patagonia', 'Tierra del Fuego', 'Antarctica', 'Faroe Islands', 'Norwegian fjords', 'Scotland', 'Isle of Skye', 'English Channel', 'Normandy', 'The Alps', 'Mont Blanc', 'Matterhorn', 'Lake Geneva', 'Lake Como', 'Sardinia', 'Corsica', 'Crete', 'Cyprus', 'Bosphorus', 'Cappadocia', 'Sinai Peninsula', 'Red Sea', 'Persian Gulf', 'Strait of Hormuz', 'Arabian Peninsula', 'Caspian Sea', 'Aral Sea', 'Himalayas', 'Ganges Delta', 'Mumbai', 'Bay of Bengal', 'Mekong Delta', 'Ha Long Bay', 'Bangkok', 'Phuket', 'Bali', 'Borneo', 'Java', 'Krakatoa', 'Philippines', 'Manila', 'Taiwan', 'Seoul', 'Korean Peninsula', 'Beijing', 'Shanghai', 'Three Gorges Dam', 'Gobi Desert', 'Kamchatka', 'Osaka', 'Okinawa', 'Papua New Guinea', 'Lake Eyre', 'Perth', 'Melbourne', 'Auckland', 'Fiji', 'Tahiti', 'Easter Island', 'Kilauea', 'Atlas Mountains', 'Nile River', 'Lake Victoria', 'Serengeti', 'Ngorongoro Crater', 'Okavango Delta', 'Namib Desert', 'Cape of Good Hope', 'Zanzibar', 'Seychelles', 'Mauritius', 'Canary Islands', 'Azores', 'Madeira', 'Gibraltar', 'Lisbon', 'Madrid', 'Seville', 'Rome', 'Naples', 'Athens', 'Vienna', 'Budapest', 'Prague', 'Berlin', 'Hamburg', 'Copenhagen', 'Stockholm', 'Oslo', 'Helsinki', 'St. Petersburg', 'Moscow', 'Kyiv', 'Warsaw', 'Dubrovnik', 'Milan', 'Zurich', 'Brussels', 'Rotterdam', 'Dublin', 'Edinburgh', 'Liverpool', 'Toronto', 'Montreal', 'Vancouver', 'Seattle', 'Los Angeles', 'San Diego', 'Phoenix', 'Denver', 'Dallas', 'Houston', 'New Orleans', 'Miami', 'Atlanta', 'Detroit', 'Philadelphia', 'Boston', 'Havana', 'Bermuda', 'Puerto Rico', 'Jamaica', 'Aruba', 'Sahara', 'Amazon River', 'Maldives', 'Bahamas',
    ],
  },
];

export function subjectFor(dateStr) {
  // A bank date is an ET calendar day; the weekday of 'YYYY-MM-DD' at noon UTC
  // is the same weekday in every zone, so this never straddles midnight.
  const d = new Date(`${dateStr}T12:00:00Z`);
  return SUBJECTS[d.getUTCDay()];
}

// Loose matching for the type-ahead: case, accents, apostrophes and
// punctuation all fold away, so "rubiks" finds Rubik’s Cube. Words survive as
// words, separated by single spaces, because matchOptions below reads them.
export const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// THE TYPE-AHEAD MATCHES ON WORDS, IN ANY ORDER, NOT ON ONE RUNNING STRING.
//
// It used to match a prefix or a substring of the whole folded name and
// nothing else, which is fine right up until a reader types the name they
// actually know. A player recognised The Starry Night off the FIRST frame,
// typed "Starry Starry Night", and got an empty list: no row to tap, no Enter
// chip, and no message of any kind until they pressed a key they had no
// reason to press (reader report, 2026-09-02). "starry starry night" is
// neither a prefix nor a substring of "the starry night", so the one reader
// who knew the answer instantly was the one the box went silent on. Word
// order, a leading article and a doubled word are the reader's business, not
// the matcher's.
//
// Three tiers, best first, so the strongest match still leads the list and
// Enter still takes something predictable:
//   1. the name STARTS with what was typed        "starry n"
//   2. the name CONTAINS what was typed           "starry night"
//   3. every word typed is the PREFIX OF SOME WORD in the name, any order
//                                                 "starry starry night",
//                                                 "night starry", "night s"
// Tier 3 deliberately does NOT require distinct words: "starry starry" has to
// find a name carrying one "starry", which is the whole reported case. It
// tests prefixes rather than whole words because the list rebuilds on every
// keystroke, so a half-typed last word must still match. A single-word query
// reaches tier 3 with nothing new to say (tier 2 already covers it), so the
// widening only ever changes a multi-word query.
export function matchOptions(query, options, spent) {
  const n = fold(query);
  if (n.length < 2) return [];
  const words = n.split(' ');
  const skip = spent instanceof Set ? spent : new Set(spent || []);
  const starts = [], has = [], loose = [];
  for (const o of options) {
    if (skip.has(o)) continue;
    const f = fold(o);
    if (f.startsWith(n)) { starts.push(o); continue; }
    if (f.includes(n)) { has.push(o); continue; }
    const parts = f.split(' ');
    if (words.every((w) => parts.some((p) => p.startsWith(w)))) loose.push(o);
  }
  return [...starts, ...has, ...loose].slice(0, 6);
}
