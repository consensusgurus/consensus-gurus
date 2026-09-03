// The /trivia door, both ends of it.
//
// /trivia forwards to the Gauntlet run with this query on the address, and
// the run page reads it once (app/circuits/TriviaDoorPop.jsx), stamps the
// arrival in localStorage, and clears it from the address. Spelled here so
// the redirect and the reader cannot drift apart; a Next page file may export
// nothing but its page, which is why this is not in app/trivia/page.js.

export const DOOR_PARAM = 'via';
export const DOOR_VALUE = 'trivia';
export const DOOR_QUERY = `${DOOR_PARAM}=${DOOR_VALUE}`;

// One key, three states: absent (never came through the door, or was not new
// when they did), 'armed' (came through the door as a new visitor; the pop-up
// is owed after their first finished run), 'shown' (paid, never again).
export const DOOR_STORE = 'sot_trivia_door';
