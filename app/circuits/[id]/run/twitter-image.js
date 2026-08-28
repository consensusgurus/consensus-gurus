// The twitter card is the SAME image as the OG card, which is how every other
// share surface on the site does it: one renderer, two routes, so a change to
// the card can never land on one and not the other.
export { default, runtime, alt, size, contentType } from './opengraph-image';
