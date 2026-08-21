// Niche facts: US STATES (the Monday universe). All fifty, with clean-edged
// facts only.
//
// FIELD RULES:
//   cap   the state capital.
//   y     year of admission to the Union (ratification year for the original
//         thirteen).
//   can   borders Canada (the standard thirteen; a Great Lakes water boundary
//         counts, so Ohio and Pennsylvania are in, the generous reading).
//   mex   borders Mexico (the four).
//   oc    has an ocean coastline (the Gulf of Mexico counts, the generous
//         reading; Pennsylvania's estuary does not).
//   gulf  on the Gulf of Mexico (the five).
//   lakes touches a Great Lake (the eight).
//   col   one of the thirteen colonies.
//   pop5  population clearly over five million (2020s censuses; Alabama at
//         ~5.16M is the lowest in, Louisiana at ~4.6M the highest out).
//   riv   borders the Mississippi River (the ten).
//   pop2  population clearly under two million (Nebraska and Idaho, at the
//         line, are excluded).
//   west  lies west of the Mississippi River (a river-border state whose bulk
//         is on the west bank counts: Iowa, Missouri, Arkansas, Louisiana and
//         Minnesota are in, the generous reading; Hawaii and Alaska count).
export const STATES = [
  { t: 'Alabama', cap: 'Montgomery', y: 1819, oc: 1, gulf: 1, pop5: 1 },
  { t: 'Alaska', cap: 'Juneau', y: 1959, can: 1, oc: 1, pop2: 1, west: 1 },
  { t: 'Arizona', cap: 'Phoenix', y: 1912, mex: 1, pop5: 1, west: 1 },
  { t: 'Arkansas', cap: 'Little Rock', y: 1836, riv: 1, west: 1 },
  { t: 'California', cap: 'Sacramento', y: 1850, mex: 1, oc: 1, pop5: 1, west: 1 },
  { t: 'Colorado', cap: 'Denver', y: 1876, pop5: 1, west: 1 },
  { t: 'Connecticut', cap: 'Hartford', y: 1788, oc: 1, col: 1 },
  { t: 'Delaware', cap: 'Dover', y: 1787, oc: 1, col: 1, pop2: 1 },
  { t: 'Florida', cap: 'Tallahassee', y: 1845, oc: 1, gulf: 1, pop5: 1 },
  { t: 'Georgia', cap: 'Atlanta', y: 1788, oc: 1, col: 1, pop5: 1 },
  { t: 'Hawaii', cap: 'Honolulu', y: 1959, oc: 1, pop2: 1, west: 1 },
  { t: 'Idaho', cap: 'Boise', y: 1890, can: 1, west: 1 },
  { t: 'Illinois', cap: 'Springfield', y: 1818, lakes: 1, riv: 1, pop5: 1 },
  { t: 'Indiana', cap: 'Indianapolis', y: 1816, lakes: 1, pop5: 1 },
  { t: 'Iowa', cap: 'Des Moines', y: 1846, riv: 1, west: 1 },
  { t: 'Kansas', cap: 'Topeka', y: 1861, west: 1 },
  { t: 'Kentucky', cap: 'Frankfort', y: 1792, riv: 1 },
  { t: 'Louisiana', cap: 'Baton Rouge', y: 1812, oc: 1, gulf: 1, riv: 1, west: 1 },
  { t: 'Maine', cap: 'Augusta', y: 1820, can: 1, oc: 1, pop2: 1 },
  { t: 'Maryland', cap: 'Annapolis', y: 1788, oc: 1, col: 1, pop5: 1 },
  { t: 'Massachusetts', cap: 'Boston', y: 1788, oc: 1, col: 1, pop5: 1 },
  { t: 'Michigan', cap: 'Lansing', y: 1837, can: 1, lakes: 1, pop5: 1 },
  { t: 'Minnesota', cap: 'Saint Paul', y: 1858, can: 1, lakes: 1, riv: 1, pop5: 1, west: 1 },
  { t: 'Mississippi', cap: 'Jackson', y: 1817, oc: 1, gulf: 1, riv: 1 },
  { t: 'Missouri', cap: 'Jefferson City', y: 1821, riv: 1, pop5: 1, west: 1 },
  { t: 'Montana', cap: 'Helena', y: 1889, can: 1, pop2: 1, west: 1 },
  { t: 'Nebraska', cap: 'Lincoln', y: 1867, west: 1 },
  { t: 'Nevada', cap: 'Carson City', y: 1864, west: 1 },
  { t: 'New Hampshire', cap: 'Concord', y: 1788, can: 1, oc: 1, col: 1, pop2: 1 },
  { t: 'New Jersey', cap: 'Trenton', y: 1787, oc: 1, col: 1, pop5: 1 },
  { t: 'New Mexico', cap: 'Santa Fe', y: 1912, mex: 1, west: 1 },
  { t: 'New York', cap: 'Albany', y: 1788, can: 1, oc: 1, lakes: 1, col: 1, pop5: 1 },
  { t: 'North Carolina', cap: 'Raleigh', y: 1789, oc: 1, col: 1, pop5: 1 },
  { t: 'North Dakota', cap: 'Bismarck', y: 1889, can: 1, pop2: 1, west: 1 },
  { t: 'Ohio', cap: 'Columbus', y: 1803, can: 1, lakes: 1, pop5: 1 },
  { t: 'Oklahoma', cap: 'Oklahoma City', y: 1907, west: 1 },
  { t: 'Oregon', cap: 'Salem', y: 1859, oc: 1, west: 1 },
  { t: 'Pennsylvania', cap: 'Harrisburg', y: 1787, can: 1, lakes: 1, col: 1, pop5: 1 },
  { t: 'Rhode Island', cap: 'Providence', y: 1790, oc: 1, col: 1, pop2: 1 },
  { t: 'South Carolina', cap: 'Columbia', y: 1788, oc: 1, col: 1, pop5: 1 },
  { t: 'South Dakota', cap: 'Pierre', y: 1889, pop2: 1, west: 1 },
  { t: 'Tennessee', cap: 'Nashville', y: 1796, riv: 1, pop5: 1 },
  { t: 'Texas', cap: 'Austin', y: 1845, mex: 1, oc: 1, gulf: 1, pop5: 1, west: 1 },
  { t: 'Utah', cap: 'Salt Lake City', y: 1896, west: 1 },
  { t: 'Vermont', cap: 'Montpelier', y: 1791, can: 1, pop2: 1 },
  { t: 'Virginia', cap: 'Richmond', y: 1788, oc: 1, col: 1, pop5: 1 },
  { t: 'Washington', cap: 'Olympia', y: 1889, can: 1, oc: 1, pop5: 1, west: 1 },
  { t: 'West Virginia', cap: 'Charleston', y: 1863, pop2: 1 },
  { t: 'Wisconsin', cap: 'Madison', y: 1848, lakes: 1, riv: 1, pop5: 1 },
  { t: 'Wyoming', cap: 'Cheyenne', y: 1890, pop2: 1, west: 1 },
];
