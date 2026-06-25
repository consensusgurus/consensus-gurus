// AUTO-GENERATED companion to us-geo.js.
// The lower-48 borderless silhouette (imported as-is) PLUS two clickable inset
// marker boxes for Alaska and Hawaii, dropped into the open Pacific at the
// lower-left the way a standard US atlas insets them. This lets a single map
// quiz cover all 50 states: the 48 contiguous states are clicked on the
// silhouette, Alaska and Hawaii are clicked on their inset boxes.
// Used by the 'us-states-50' map region in MapQuizBoard.jsx.
import { GEO as LOWER48 } from './us-geo.js';

export const GEO = {
  ...LOWER48,
  noBorders: true,
  markers: [
    { name: 'Alaska', x: 80, y: 540 },
    { name: 'Hawaii', x: 188, y: 566 },
  ],
};
