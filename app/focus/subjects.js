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
// punctuation all fold away, so "rubiks" finds Rubik’s Cube.
export const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
