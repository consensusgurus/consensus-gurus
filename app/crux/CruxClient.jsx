'use client';

// Crux — a clue-less mini crossword with letter-feedback guessing and
// hidden category pairs.
//
// Eight hidden words interlock in a mini crossword grid. There are no clues:
// the only hints are four categories, each owning exactly two of the eight
// words (which slots? that's the puzzle). Every slot is solved by guessing —
// type any letters, get locked/close feedback per letter — and locked
// letters stay in the grid, bleeding into crossing slots. The whole
// board shares one guess budget. Solved words are then filed under their
// category to finish. Filing is penalty-free — the categories' job is to be
// the clues (and the traps) during the guessing phase.
//
// Soft launch: this page is intentionally NOT linked from the homepage, the
// /quizzes hub, or the sitemap. Reachable only at /crux.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, RotateCcw, X, ChevronLeft, ChevronRight, Swords, Trophy } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import SiteHeader from '../SiteHeader';
import QuizPlayerBar from '../quiz/[id]/QuizPlayerBar';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import QuizLeaderboard from '../quiz/[id]/QuizLeaderboard';
import { isMobileDevice } from '@/lib/is-mobile';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  rust: '#c0392b',
  faded: '#6b7280',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Category palette, easiest -> trickiest: yellow, green, blue, RED — the
// fourth is red (owner call 2026-07-07) so the set isn't the familiar
// grouping-game quartet.
const CAT_COLORS = [
  { bg: '#e6b93f', tc: '#5c4a06', sq: '\u{1F7E8}' },
  { bg: '#5aa96a', tc: '#173f1f', sq: '\u{1F7E9}' },
  { bg: '#5a97dd', tc: '#0c3a66', sq: '\u{1F7E6}' },
  { bg: '#d96363', tc: '#571212', sq: '\u{1F7E5}' },
];

// ─── Puzzles ────────────────────────────────────────────────────────────────
// One entry per drop. `live` gates by Eastern date: /crux plays the newest
// puzzle whose live date has arrived, so future puzzles can be banked here
// and ship themselves at ET midnight. Each puzzle keys its own localStorage
// save (sot_crux_<num>), catalog id, and leaderboard. /crux?p=N pins an
// archived puzzle (the hub's dated tiles link that way).
const PUZZLES = [
  {
    num: 1,
    quizId: 'crux-7-6-26',
    live: '2026-07-06',
    dateLabel: 'July 6, 2026',
    guesses: 18,
    rows: 9,
    cols: 10,
    categories: [
      { name: 'Card games', words: ['HEARTS', 'BRIDGE'] },
      { name: 'Musical instruments', words: ['ORGAN', 'VIOLA'] },
      { name: 'Body parts', words: ['SPLEEN', 'TEMPLE'] },
      { name: 'Structures', words: ['TOWER', 'STEEPLE'] },
    ],
    slots: [
      { id: '1D', word: 'VIOLA', row: 0, col: 1, dir: 'D' },
      { id: '2D', word: 'HEARTS', row: 1, col: 3, dir: 'D' },
      { id: '3D', word: 'BRIDGE', row: 1, col: 9, dir: 'D' },
      { id: '4A', word: 'TOWER', row: 2, col: 0, dir: 'A' },
      { id: '5D', word: 'SPLEEN', row: 3, col: 5, dir: 'D' },
      { id: '6D', word: 'TEMPLE', row: 3, col: 7, dir: 'D' },
      { id: '7A', word: 'STEEPLE', row: 6, col: 3, dir: 'A' },
      { id: '8A', word: 'ORGAN', row: 8, col: 1, dir: 'A' },
    ],
  },
  {
    num: 2,
    quizId: 'crux-7-7-26',
    live: '2026-07-07',
    dateLabel: 'July 7, 2026',
    guesses: 18,
    rows: 9,
    cols: 9,
    // Trap cycle: PUNCH looks boxing (it's a drink), SWING looks boxing (it's
    // a dance), HOOK looks fishing (it's a punch), REEL looks like a dance
    // (it's fishing gear). HOOK even crosses TACKLE on the board.
    categories: [
      { name: 'Party drinks', words: ['PUNCH', 'CIDER'] },
      { name: 'Dances', words: ['SWING', 'TANGO'] },
      { name: 'Boxing blows', words: ['HOOK', 'UPPERCUT'] },
      { name: 'Fishing gear', words: ['REEL', 'TACKLE'] },
    ],
    slots: [
      { id: '1A', word: 'PUNCH', row: 0, col: 2, dir: 'A' },
      { id: '2D', word: 'HOOK', row: 0, col: 6, dir: 'D' },
      { id: '3D', word: 'UPPERCUT', row: 0, col: 8, dir: 'D' },
      { id: '4D', word: 'TANGO', row: 2, col: 4, dir: 'D' },
      { id: '5A', word: 'TACKLE', row: 3, col: 3, dir: 'A' },
      { id: '6D', word: 'CIDER', row: 4, col: 2, dir: 'D' },
      { id: '7A', word: 'SWING', row: 5, col: 0, dir: 'A' },
      { id: '8A', word: 'REEL', row: 8, col: 2, dir: 'A' },
    ],
  },
  {
    num: 3,
    quizId: 'crux-7-8-26',
    live: '2026-07-08',
    dateLabel: 'July 8, 2026',
    guesses: 18,
    rows: 9,
    cols: 8,
    rev: 2,
    // rev 2 (2026-07-08): ARCH/CALF -> ELBOW/WRIST. The old body pair was
    // interchangeable with the shoe pair (arch supports, boot calves) —
    // two valid solutions. TONGUE/SOLE/SCALE keep the traps, all resolvable.
    categories: [
      { name: 'Fish', words: ['PERCH', 'SOLE'] },
      { name: 'Shoe parts', words: ['HEEL', 'TONGUE'] },
      { name: 'Body parts', words: ['ELBOW', 'WRIST'] },
      { name: 'Music terms', words: ['SCALE', 'PITCH'] },
    ],
    slots: [
      { id: '1A', word: 'WRIST', row: 0, col: 3, dir: 'A' },
      { id: '2D', word: 'TONGUE', row: 0, col: 7, dir: 'D' },
      { id: '3A', word: 'PERCH', row: 3, col: 0, dir: 'A' },
      { id: '3D', word: 'PITCH', row: 3, col: 0, dir: 'D' },
      { id: '4A', word: 'SCALE', row: 5, col: 3, dir: 'A' },
      { id: '4D', word: 'SOLE', row: 5, col: 3, dir: 'D' },
      { id: '5A', word: 'HEEL', row: 7, col: 0, dir: 'A' },
      { id: '6A', word: 'ELBOW', row: 8, col: 3, dir: 'A' },
    ],
  },
  {
    num: 4,
    quizId: 'crux-7-9-26',
    live: '2026-07-09',
    dateLabel: 'July 9, 2026',
    guesses: 18,
    rows: 10,
    cols: 9,
    categories: [
      { name: 'Baking', words: ['DOUGH', 'BATTER'] },
      { name: 'Money slang', words: ['BUCK', 'LOOT'] },
      { name: 'Baseball', words: ['MOUND', 'DIAMOND'] },
      { name: 'Gems', words: ['PEARL', 'OPAL'] },
    ],
    slots: [
      { id: '1D', word: 'PEARL', row: 0, col: 8, dir: 'D' },
      { id: '2A', word: 'MOUND', row: 1, col: 0, dir: 'A' },
      { id: '3D', word: 'OPAL', row: 1, col: 1, dir: 'D' },
      { id: '4D', word: 'DIAMOND', row: 1, col: 4, dir: 'D' },
      { id: '5A', word: 'BATTER', row: 3, col: 3, dir: 'A' },
      { id: '6A', word: 'LOOT', row: 5, col: 2, dir: 'A' },
      { id: '7D', word: 'BUCK', row: 6, col: 6, dir: 'D' },
      { id: '8A', word: 'DOUGH', row: 7, col: 4, dir: 'A' },
    ],
  },
  {
    num: 5,
    quizId: 'crux-7-10-26',
    live: '2026-07-10',
    dateLabel: 'July 10, 2026',
    guesses: 18,
    rows: 9,
    cols: 9,
    categories: [
      { name: 'Laundry day', words: ['FOLD', 'HAMPER'] },
      { name: 'Poker terms', words: ['FLUSH', 'ANTE'] },
      { name: 'Birds', words: ['CRANE', 'SWALLOW'] },
      { name: 'Golf terms', words: ['IRON', 'EAGLE'] },
    ],
    slots: [
      { id: '1D', word: 'FLUSH', row: 0, col: 2, dir: 'D' },
      { id: '2D', word: 'EAGLE', row: 0, col: 6, dir: 'D' },
      { id: '3A', word: 'FOLD', row: 1, col: 0, dir: 'A' },
      { id: '4D', word: 'HAMPER', row: 2, col: 4, dir: 'D' },
      { id: '5A', word: 'SWALLOW', row: 3, col: 2, dir: 'A' },
      { id: '6D', word: 'IRON', row: 5, col: 1, dir: 'D' },
      { id: '7A', word: 'CRANE', row: 6, col: 0, dir: 'A' },
      { id: '8A', word: 'ANTE', row: 8, col: 0, dir: 'A' },
    ],
  },
  {
    num: 6,
    quizId: 'crux-7-11-26',
    live: '2026-07-11',
    dateLabel: 'July 11, 2026',
    guesses: 18,
    rows: 6,
    cols: 11,
    categories: [
      { name: 'Fruits', words: ['DATE', 'MANGO'] },
      { name: 'Toast spreads', words: ['JAM', 'BUTTER'] },
      { name: 'Music genres', words: ['ROCK', 'METAL'] },
      { name: 'Terms of endearment', words: ['HONEY', 'PEACH'] },
    ],
    slots: [
      { id: '1A', word: 'JAM', row: 0, col: 0, dir: 'A' },
      { id: '2D', word: 'METAL', row: 0, col: 2, dir: 'D' },
      { id: '3D', word: 'PEACH', row: 1, col: 4, dir: 'D' },
      { id: '4A', word: 'BUTTER', row: 2, col: 0, dir: 'A' },
      { id: '5D', word: 'DATE', row: 2, col: 7, dir: 'D' },
      { id: '6D', word: 'ROCK', row: 2, col: 10, dir: 'D' },
      { id: '7A', word: 'MANGO', row: 3, col: 6, dir: 'A' },
      { id: '8A', word: 'HONEY', row: 5, col: 4, dir: 'A' },
    ],
  },
  {
    num: 7,
    quizId: 'crux-7-12-26',
    live: '2026-07-12',
    dateLabel: 'July 12, 2026',
    guesses: 18,
    rows: 10,
    cols: 8,
    categories: [
      { name: 'Headwear', words: ['BEANIE', 'VISOR'] },
      { name: 'Bottle parts', words: ['NECK', 'CAP'] },
      { name: 'Shirt parts', words: ['COLLAR', 'CUFF'] },
      { name: 'Guitar parts', words: ['FRET', 'STRING'] },
    ],
    slots: [
      { id: '1A', word: 'COLLAR', row: 0, col: 2, dir: 'A' },
      { id: '1D', word: 'CUFF', row: 0, col: 2, dir: 'D' },
      { id: '2D', word: 'BEANIE', row: 2, col: 4, dir: 'D' },
      { id: '3D', word: 'VISOR', row: 3, col: 0, dir: 'D' },
      { id: '4A', word: 'FRET', row: 3, col: 2, dir: 'A' },
      { id: '5A', word: 'STRING', row: 5, col: 0, dir: 'A' },
      { id: '6A', word: 'NECK', row: 7, col: 3, dir: 'A' },
      { id: '7D', word: 'CAP', row: 7, col: 5, dir: 'D' },
    ],
  },
  {
    num: 8,
    quizId: 'crux-7-13-26',
    live: '2026-07-13',
    dateLabel: 'July 13, 2026',
    guesses: 18,
    rows: 9,
    cols: 8,
    rev: 2,
    // rev 2 (2026-07-08): NEPTUNE/JUPITER/VENUS were gods AND planets —
    // multiple valid solutions. EARTH+URANUS are planets but not Roman gods
    // (Uranus is Greek); JUNO+MINERVA are gods but not planets. MARS and
    // MERCURY keep the deception, both resolvable by elimination.
    categories: [
      { name: 'Candy bars', words: ['MARS', 'CRUNCH'] },
      { name: 'Chemical elements', words: ['MERCURY', 'CARBON'] },
      { name: 'Planets', words: ['EARTH', 'URANUS'] },
      { name: 'Roman gods', words: ['JUNO', 'MINERVA'] },
    ],
    slots: [
      { id: '1D', word: 'EARTH', row: 0, col: 5, dir: 'D' },
      { id: '2D', word: 'MERCURY', row: 1, col: 0, dir: 'D' },
      { id: '3A', word: 'MARS', row: 2, col: 3, dir: 'A' },
      { id: '3D', word: 'MINERVA', row: 2, col: 3, dir: 'D' },
      { id: '4A', word: 'CRUNCH', row: 4, col: 0, dir: 'A' },
      { id: '5D', word: 'JUNO', row: 5, col: 6, dir: 'D' },
      { id: '6A', word: 'URANUS', row: 6, col: 2, dir: 'A' },
      { id: '7A', word: 'CARBON', row: 8, col: 2, dir: 'A' },
    ],
  },
  {
    num: 9,
    quizId: 'crux-7-14-26',
    live: '2026-07-14',
    dateLabel: 'July 14, 2026',
    guesses: 18,
    rows: 9,
    cols: 8,
    categories: [
      { name: 'Pencil case', words: ['RULER', 'ERASER'] },
      { name: 'Flowers', words: ['TULIP', 'DAISY'] },
      { name: 'Eye parts', words: ['PUPIL', 'IRIS'] },
      { name: 'Royalty', words: ['CROWN', 'THRONE'] },
    ],
    slots: [
      { id: '1A', word: 'TULIP', row: 0, col: 1, dir: 'A' },
      { id: '2D', word: 'PUPIL', row: 0, col: 5, dir: 'D' },
      { id: '3D', word: 'THRONE', row: 2, col: 7, dir: 'D' },
      { id: '4D', word: 'ERASER', row: 3, col: 3, dir: 'D' },
      { id: '5D', word: 'DAISY', row: 4, col: 0, dir: 'D' },
      { id: '6A', word: 'RULER', row: 4, col: 3, dir: 'A' },
      { id: '7A', word: 'IRIS', row: 6, col: 0, dir: 'A' },
      { id: '8A', word: 'CROWN', row: 8, col: 2, dir: 'A' },
    ],
  },
  {
    num: 10,
    quizId: 'crux-7-15-26',
    live: '2026-07-15',
    dateLabel: 'July 15, 2026',
    guesses: 18,
    rows: 10,
    cols: 8,
    categories: [
      { name: 'Birds', words: ['RAVEN', 'FINCH'] },
      { name: 'Castle features', words: ['MOAT', 'TURRET'] },
      { name: 'Shades of black', words: ['EBONY', 'JET'] },
      { name: 'Chess pieces', words: ['KNIGHT', 'ROOK'] },
    ],
    slots: [
      { id: '1A', word: 'ROOK', row: 0, col: 4, dir: 'A' },
      { id: '2D', word: 'KNIGHT', row: 0, col: 7, dir: 'D' },
      { id: '3D', word: 'JET', row: 2, col: 0, dir: 'D' },
      { id: '4D', word: 'MOAT', row: 2, col: 2, dir: 'D' },
      { id: '5A', word: 'EBONY', row: 3, col: 0, dir: 'A' },
      { id: '6A', word: 'TURRET', row: 5, col: 2, dir: 'A' },
      { id: '7D', word: 'RAVEN', row: 5, col: 4, dir: 'D' },
      { id: '8A', word: 'FINCH', row: 9, col: 2, dir: 'A' },
    ],
  },
  {
    num: 11,
    quizId: 'crux-7-16-26',
    live: '2026-07-16',
    dateLabel: 'July 16, 2026',
    guesses: 18,
    rows: 7,
    cols: 10,
    categories: [
      { name: 'Long journeys', words: ['TREK', 'VOYAGE'] },
      { name: 'Water sources', words: ['WELL', 'GEYSER'] },
      { name: 'Ways to tumble', words: ['TRIP', 'STUMBLE'] },
      { name: 'Seasons', words: ['SPRING', 'FALL'] },
    ],
    slots: [
      { id: '1A', word: 'SPRING', row: 0, col: 1, dir: 'A' },
      { id: '1D', word: 'STUMBLE', row: 0, col: 1, dir: 'D' },
      { id: '2D', word: 'GEYSER', row: 0, col: 6, dir: 'D' },
      { id: '3D', word: 'TREK', row: 0, col: 9, dir: 'D' },
      { id: '4A', word: 'VOYAGE', row: 2, col: 4, dir: 'A' },
      { id: '5D', word: 'FALL', row: 3, col: 3, dir: 'D' },
      { id: '6A', word: 'TRIP', row: 5, col: 5, dir: 'A' },
      { id: '7A', word: 'WELL', row: 6, col: 0, dir: 'A' },
    ],
  },
  {
    num: 12,
    quizId: 'crux-7-17-26',
    live: '2026-07-17',
    dateLabel: 'July 17, 2026',
    guesses: 18,
    rows: 8,
    cols: 9,
    categories: [
      { name: 'Rocket parts', words: ['STAGE', 'BOOSTER'] },
      { name: 'Movie-set jobs', words: ['GRIP', 'GAFFER'] },
      { name: 'Car parts', words: ['CLUTCH', 'FENDER'] },
      { name: 'Firm holds', words: ['CLASP', 'GRASP'] },
    ],
    slots: [
      { id: '1D', word: 'CLUTCH', row: 0, col: 0, dir: 'D' },
      { id: '2A', word: 'GRIP', row: 0, col: 4, dir: 'A' },
      { id: '2D', word: 'GRASP', row: 0, col: 4, dir: 'D' },
      { id: '3D', word: 'GAFFER', row: 2, col: 6, dir: 'D' },
      { id: '4D', word: 'FENDER', row: 2, col: 8, dir: 'D' },
      { id: '5A', word: 'STAGE', row: 3, col: 4, dir: 'A' },
      { id: '6A', word: 'CLASP', row: 4, col: 0, dir: 'A' },
      { id: '7A', word: 'BOOSTER', row: 7, col: 0, dir: 'A' },
    ],
  },
  {
    num: 13,
    quizId: 'crux-7-18-26',
    live: '2026-07-18',
    dateLabel: 'July 18, 2026',
    guesses: 18,
    rows: 8,
    cols: 9,
    categories: [
      { name: 'Flower parts', words: ['PETAL', 'STEM'] },
      { name: 'Computer keys', words: ['SHIFT', 'ESCAPE'] },
      { name: 'Horse gear', words: ['BRIDLE', 'REINS'] },
      { name: 'Bike parts', words: ['PEDAL', 'SADDLE'] },
    ],
    slots: [
      { id: '1A', word: 'STEM', row: 0, col: 0, dir: 'A' },
      { id: '2D', word: 'ESCAPE', row: 0, col: 2, dir: 'D' },
      { id: '3D', word: 'BRIDLE', row: 0, col: 6, dir: 'D' },
      { id: '4D', word: 'PETAL', row: 0, col: 8, dir: 'D' },
      { id: '5A', word: 'SHIFT', row: 2, col: 4, dir: 'A' },
      { id: '5D', word: 'SADDLE', row: 2, col: 4, dir: 'D' },
      { id: '6A', word: 'PEDAL', row: 4, col: 2, dir: 'A' },
      { id: '7A', word: 'REINS', row: 7, col: 3, dir: 'A' },
    ],
  },
  {
    num: 14,
    quizId: 'crux-7-19-26',
    live: '2026-07-19',
    dateLabel: 'July 19, 2026',
    guesses: 27,
    rows: 12,
    cols: 10,
    // First SUNDAY EDITION: four categories of THREE (score /24). Traps all
    // pinned: CRICKET and SQUASH read as sports (their real homes fill the
    // sports slots), SEAL reads navy, BAT reads sports gear, SUB reads
    // sandwich, POLO reads shirts.
    categories: [
      { name: 'Vegetables', words: ['LEEK', 'RADISH', 'TURNIP'] },
      { name: 'Navy things', words: ['ANCHOR', 'SUB', 'FLEET'] },
      { name: 'Sports', words: ['SQUASH', 'RUGBY', 'POLO'] },
      { name: 'Animals', words: ['BAT', 'CRICKET', 'SEAL'] },
    ],
    slots: [
      { id: '1D', word: 'POLO', row: 0, col: 6, dir: 'D' },
      { id: '2A', word: 'ANCHOR', row: 1, col: 2, dir: 'A' },
      { id: '3D', word: 'CRICKET', row: 1, col: 4, dir: 'D' },
      { id: '4D', word: 'FLEET', row: 3, col: 2, dir: 'D' },
      { id: '5D', word: 'RADISH', row: 4, col: 8, dir: 'D' },
      { id: '6A', word: 'LEEK', row: 5, col: 1, dir: 'A' },
      { id: '7A', word: 'SEAL', row: 5, col: 6, dir: 'A' },
      { id: '8A', word: 'BAT', row: 7, col: 0, dir: 'A' },
      { id: '9A', word: 'TURNIP', row: 7, col: 4, dir: 'A' },
      { id: '10A', word: 'SQUASH', row: 9, col: 3, dir: 'A' },
      { id: '10D', word: 'SUB', row: 9, col: 3, dir: 'D' },
      { id: '11A', word: 'RUGBY', row: 11, col: 0, dir: 'A' },
    ],
  },
  {
    num: 15,
    quizId: 'crux-7-20-26',
    live: '2026-07-20',
    dateLabel: 'July 20, 2026',
    guesses: 18,
    rows: 7,
    cols: 9,
    categories: [
      { name: 'Tennis shots', words: ['LOB', 'VOLLEY'] },
      { name: 'Dog commands', words: ['SIT', 'STAY'] },
      { name: 'Hotel spaces', words: ['SUITE', 'LOBBY'] },
      { name: 'Congress things', words: ['SENATE', 'VETO'] },
    ],
    slots: [
      { id: '1D', word: 'SIT', row: 0, col: 2, dir: 'D' },
      { id: '2D', word: 'VETO', row: 0, col: 4, dir: 'D' },
      { id: '3D', word: 'STAY', row: 0, col: 8, dir: 'D' },
      { id: '4A', word: 'SUITE', row: 1, col: 0, dir: 'A' },
      { id: '4D', word: 'SENATE', row: 1, col: 0, dir: 'D' },
      { id: '5A', word: 'VOLLEY', row: 3, col: 3, dir: 'A' },
      { id: '6D', word: 'LOB', row: 3, col: 6, dir: 'D' },
      { id: '7A', word: 'LOBBY', row: 5, col: 3, dir: 'A' },
    ],
  },
  {
    num: 16,
    quizId: 'crux-7-21-26',
    live: '2026-07-21',
    dateLabel: 'July 21, 2026',
    guesses: 18,
    rows: 9,
    cols: 9,
    categories: [
      { name: 'Breakfast items', words: ['OMELET', 'WAFFLE'] },
      { name: 'Pans', words: ['SKILLET', 'WOK'] },
      { name: 'Hunting things', words: ['DECOY', 'CAMO'] },
      { name: 'Drum kit parts', words: ['SNARE', 'CYMBAL'] },
    ],
    slots: [
      { id: '1D', word: 'WAFFLE', row: 0, col: 5, dir: 'D' },
      { id: '2A', word: 'CYMBAL', row: 1, col: 1, dir: 'A' },
      { id: '3D', word: 'DECOY', row: 3, col: 7, dir: 'D' },
      { id: '4A', word: 'SKILLET', row: 4, col: 2, dir: 'A' },
      { id: '4D', word: 'SNARE', row: 4, col: 2, dir: 'D' },
      { id: '5A', word: 'CAMO', row: 6, col: 1, dir: 'A' },
      { id: '6A', word: 'WOK', row: 6, col: 6, dir: 'A' },
      { id: '7A', word: 'OMELET', row: 8, col: 0, dir: 'A' },
    ],
  },
  {
    num: 17,
    quizId: 'crux-7-22-26',
    live: '2026-07-22',
    dateLabel: 'July 22, 2026',
    guesses: 18,
    rows: 8,
    cols: 8,
    categories: [
      { name: 'Beach features', words: ['TIDE', 'DUNE'] },
      { name: "Santa's gear", words: ['SLEIGH', 'SACK'] },
      { name: 'Moon features', words: ['CRATER', 'PHASE'] },
      { name: 'Grammar terms', words: ['TENSE', 'CLAUSE'] },
    ],
    slots: [
      { id: '1A', word: 'SLEIGH', row: 0, col: 1, dir: 'A' },
      { id: '1D', word: 'SACK', row: 0, col: 1, dir: 'D' },
      { id: '2A', word: 'CRATER', row: 2, col: 1, dir: 'A' },
      { id: '3D', word: 'TIDE', row: 2, col: 4, dir: 'D' },
      { id: '4D', word: 'TENSE', row: 3, col: 7, dir: 'D' },
      { id: '5A', word: 'DUNE', row: 4, col: 4, dir: 'A' },
      { id: '6A', word: 'PHASE', row: 5, col: 0, dir: 'A' },
      { id: '7A', word: 'CLAUSE', row: 7, col: 2, dir: 'A' },
    ],
  },
  {
    num: 18,
    quizId: 'crux-7-23-26',
    live: '2026-07-23',
    dateLabel: 'July 23, 2026',
    guesses: 18,
    rows: 9,
    cols: 10,
    categories: [
      { name: 'Office supplies', words: ['STAPLER', 'BINDER'] },
      { name: 'Front-door things', words: ['KNOCKER', 'PORCH'] },
      { name: 'Book parts', words: ['SPINE', 'JACKET'] },
      { name: 'Gym things', words: ['BARBELL', 'MAT'] },
    ],
    slots: [
      { id: '1D', word: 'STAPLER', row: 0, col: 1, dir: 'D' },
      { id: '2D', word: 'MAT', row: 0, col: 5, dir: 'D' },
      { id: '3D', word: 'BINDER', row: 0, col: 7, dir: 'D' },
      { id: '4A', word: 'JACKET', row: 2, col: 0, dir: 'A' },
      { id: '5D', word: 'KNOCKER', row: 2, col: 3, dir: 'D' },
      { id: '6D', word: 'SPINE', row: 4, col: 5, dir: 'D' },
      { id: '7A', word: 'PORCH', row: 5, col: 5, dir: 'A' },
      { id: '8A', word: 'BARBELL', row: 8, col: 1, dir: 'A' },
    ],
  },
  {
    num: 19,
    quizId: 'crux-7-24-26',
    live: '2026-07-24',
    dateLabel: 'July 24, 2026',
    guesses: 18,
    rows: 9,
    cols: 9,
    categories: [
      { name: 'Sewing kit', words: ['THIMBLE', 'BOBBIN'] },
      { name: 'Bar orders', words: ['NEAT', 'DOUBLE'] },
      { name: 'Story beats', words: ['CLIMAX', 'PROLOGUE'] },
      { name: 'Cocktail garnishes', words: ['OLIVE', 'TWIST'] },
    ],
    slots: [
      { id: '1A', word: 'PROLOGUE', row: 0, col: 0, dir: 'A' },
      { id: '2D', word: 'OLIVE', row: 0, col: 2, dir: 'D' },
      { id: '3D', word: 'DOUBLE', row: 1, col: 8, dir: 'D' },
      { id: '4A', word: 'CLIMAX', row: 2, col: 0, dir: 'A' },
      { id: '5D', word: 'BOBBIN', row: 3, col: 6, dir: 'D' },
      { id: '6A', word: 'NEAT', row: 4, col: 1, dir: 'A' },
      { id: '7D', word: 'TWIST', row: 4, col: 4, dir: 'D' },
      { id: '8A', word: 'THIMBLE', row: 6, col: 2, dir: 'A' },
    ],
  },
  {
    num: 20,
    quizId: 'crux-7-25-26',
    live: '2026-07-25',
    dateLabel: 'July 25, 2026',
    guesses: 18,
    rows: 9,
    cols: 9,
    categories: [
      { name: 'Coffee orders', words: ['LATTE', 'DECAF'] },
      { name: 'Exercises', words: ['SQUAT', 'LUNGE'] },
      { name: 'Shades of brown', words: ['MOCHA', 'TAN'] },
      { name: 'Pirate things', words: ['PLANK', 'PARROT'] },
    ],
    slots: [
      { id: '1D', word: 'PLANK', row: 0, col: 2, dir: 'D' },
      { id: '2D', word: 'DECAF', row: 2, col: 4, dir: 'D' },
      { id: '3A', word: 'LUNGE', row: 3, col: 0, dir: 'A' },
      { id: '3D', word: 'LATTE', row: 3, col: 0, dir: 'D' },
      { id: '4D', word: 'MOCHA', row: 4, col: 7, dir: 'D' },
      { id: '5A', word: 'PARROT', row: 5, col: 3, dir: 'A' },
      { id: '6A', word: 'TAN', row: 6, col: 0, dir: 'A' },
      { id: '7A', word: 'SQUAT', row: 8, col: 4, dir: 'A' },
    ],
  },
  {
    num: 21,
    quizId: 'crux-7-26-26',
    live: '2026-07-26',
    dateLabel: 'July 26, 2026',
    guesses: 27,
    rows: 10,
    cols: 11,
    // Sunday Edition #2. BUN is the pivot trap (hair vs burger — pinned:
    // hair has exactly three viable words). COMBO leans fast-food, DASH
    // leans sprinting, COLON leans anatomy; all pinned by full categories.
    categories: [
      { name: 'Punctuation marks', words: ['DASH', 'COLON', 'COMMA'] },
      { name: 'Burger parts', words: ['PATTY', 'PICKLE', 'ONION'] },
      { name: 'Music groups', words: ['TRIO', 'QUARTET', 'COMBO'] },
      { name: 'Hairstyles', words: ['BUN', 'BRAID', 'BANGS'] },
    ],
    slots: [
      { id: '1D', word: 'BRAID', row: 0, col: 3, dir: 'D' },
      { id: '2A', word: 'PATTY', row: 2, col: 2, dir: 'A' },
      { id: '3D', word: 'TRIO', row: 2, col: 5, dir: 'D' },
      { id: '4D', word: 'ONION', row: 2, col: 10, dir: 'D' },
      { id: '5A', word: 'BUN', row: 3, col: 8, dir: 'A' },
      { id: '5D', word: 'BANGS', row: 3, col: 8, dir: 'D' },
      { id: '6D', word: 'PICKLE', row: 4, col: 0, dir: 'D' },
      { id: '7A', word: 'COLON', row: 5, col: 4, dir: 'A' },
      { id: '7D', word: 'COMMA', row: 5, col: 4, dir: 'D' },
      { id: '8A', word: 'COMBO', row: 6, col: 0, dir: 'A' },
      { id: '9A', word: 'DASH', row: 7, col: 6, dir: 'A' },
      { id: '10A', word: 'QUARTET', row: 9, col: 2, dir: 'A' },
    ],
  },
];
const HELP_KEY = 'sot_crux_help_seen';

// Every puzzle answer is always a legal guess, even the proper nouns that a
// Scrabble-style list omits (JUNO, MINERVA, URANUS...).
const ANSWER_WORDS = new Set(PUZZLES.flatMap((pz) => pz.categories.flatMap((c) => c.words.map((w) => w.toLowerCase()))));

function etToday() {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}
function pickPuzzle(forceNum) {
  if (forceNum) {
    const p = PUZZLES.find((x) => x.num === forceNum);
    if (p) return p;
  }
  const today = etToday();
  const open = PUZZLES.filter((p) => p.live <= today);
  return open.length ? open[open.length - 1] : PUZZLES[0];
}

function slotCells(s) {
  return s.word.split('').map((ch, i) => ({
    r: s.dir === 'A' ? s.row : s.row + i,
    c: s.dir === 'A' ? s.col + i : s.col,
    ch,
  }));
}

// key "r,c" -> { ch, slots: [slotIds] }
function buildCells(puzzle) {
  const m = new Map();
  for (const s of puzzle.slots) {
    for (const cl of slotCells(s)) {
      const k = `${cl.r},${cl.c}`;
      if (!m.has(k)) m.set(k, { ch: cl.ch, slots: [] });
      m.get(k).slots.push(s.id);
    }
  }
  return m;
}
function slotLabel(id) {
  return `${parseInt(id, 10)}-${id.endsWith('A') ? 'Across' : 'Down'}`;
}
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Same anon identity the other quiz boards use, so plays attribute correctly
// and a later leaderboard join claims this browser's past results.
function getAnonId() {
  if (typeof window === 'undefined') return null;
  try {
    let a = localStorage.getItem('sot_quiz_anon');
    if (!a) {
      a = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('sot_quiz_anon', a);
    }
    return a;
  } catch (e) { return null; }
}
const EMPTY_BOARD = { plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [], leaderboardMobile: [], leaderboardFirst: [], leaderboards: {} };

// Per-letter feedback marking with duplicate handling.
export function computeMarks(guess, answer) {
  const n = answer.length;
  const marks = Array(n).fill('x');
  const rem = {};
  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) marks[i] = 'g';
    else rem[answer[i]] = (rem[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < n; i++) {
    if (marks[i] !== 'g' && rem[guess[i]] > 0) {
      marks[i] = 'y';
      rem[guess[i]] -= 1;
    }
  }
  return marks;
}

function freshState(puzzle) {
  return {
    v: 1,
    greens: {},          // "r,c" -> true (letter is locked correct)
    solved: {},          // slotId -> true
    slotGuesses: {},     // slotId -> guesses spent on that slot
    present: {},         // slotId -> "ABC" letters known in word
    absent: {},          // slotId -> "XYZ" letters known absent
    lastGuess: {},       // slotId -> { word, marks[] }
    assigned: {},        // WORD -> category index (correct filings only)
    order: [],           // slotIds in solve order
    filedRight: null,    // set by the single Lock-it-in: words correctly categorized
    left: puzzle.guesses,
    status: 'playing',   // playing | won | lost
    t0: null,
    tEnd: null,
  };
}

export default function CruxClient({ forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(forceNum), [forceNum]);
  const ROWS = PUZZLE.rows;
  const COLS = PUZZLE.cols;
  const STORE_KEY = `sot_crux_${PUZZLE.num}${PUZZLE.rev ? `_r${PUZZLE.rev}` : ''}`;
  const SLOT = useMemo(() => Object.fromEntries(PUZZLE.slots.map((s) => [s.id, s])), [PUZZLE]);
  const CELLS = useMemo(() => buildCells(PUZZLE), [PUZZLE]);
  const [g, setG] = useState(() => freshState(PUZZLE));
  const [sel, setSel] = useState(PUZZLE.slots[0].id);
  const [typed, setTyped] = useState('');
  const [pick, setPick] = useState(null); // solved word chosen for filing
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [armLock, setArmLock] = useState(false);
  const [justWon, setJustWon] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [garbleDoneToday, setGarbleDoneToday] = useState(true);
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const toastTimer = useRef(null);
  const wordSetRef = useRef(null);
  const viewedRef = useRef(false);

  // ---- persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1) setG({ ...freshState(PUZZLE), ...saved });
      }
      if (!localStorage.getItem(HELP_KEY)) setShowHelp(true);
    } catch (e) {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch (e) {}
    // same-device day breadcrumb for cross-game recommendations — only for
    // TODAY'S puzzle (archive replays must not mark today as played)
    try {
      if (PUZZLE.num === pickPuzzle(null).num) {
        localStorage.setItem('sot_crux_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
      }
    } catch (e) {}
  }, [g, hydrated, PUZZLE]);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('sot_garble_day') || 'null');
      setGarbleDoneToday(!!(c && c.d === etToday() && c.done));
    } catch (e) { setGarbleDoneToday(false); }
  }, [g.status]);

  // ---- metrics + leaderboard (same /api/quiz/* flow as every other board) ----
  // Guess dictionary (lazy, cached, ~115k words). Fail-open: until it loads,
  // any letters are accepted — never block play on a fetch.
  useEffect(() => {
    fetch('/crux-words.txt')
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => { if (t) wordSetRef.current = new Set(t.split('\n')); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) setIdentity(id);
    } catch (e) {}
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(PUZZLE.quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
      .catch(() => {});
    if (!viewedRef.current) {
      viewedRef.current = true;
      fetch('/api/quiz/view', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: PUZZLE.quizId }) }).catch(() => {});
    }
  }, []);

  function say(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const slot = SLOT[sel];
  const cells = useMemo(() => (slot ? slotCells(slot) : []), [slot]);
  const editable = cells.filter((cl) => !g.greens[`${cl.r},${cl.c}`]);
  const playing = g.status === 'playing';

  // ---- input ----
  const onKey = useCallback((k) => {
    if (g.status !== 'playing') return;
    if (g.left <= 0) return;
    if (!slot || g.solved[sel]) return;
    if (k === 'ENTER') submit();
    else if (k === 'BACK') setTyped((t) => t.slice(0, -1));
    else if (/^[A-Z]$/.test(k)) setTyped((t) => (t.length < editable.length ? t + k : t));
  }, [g, sel, slot, typed, editable.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onDown(e) {
      if (showHelp) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Enter') { e.preventDefault(); onKey('ENTER'); }
      else if (e.key === 'Backspace') { e.preventDefault(); onKey('BACK'); }
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
    }
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [onKey, showHelp]);

  function sweepAutoSolve(g2) {
    for (const s of PUZZLE.slots) {
      if (g2.solved[s.id]) continue;
      const full = slotCells(s).every((cl) => g2.greens[`${cl.r},${cl.c}`]);
      if (full) {
        g2.solved = { ...g2.solved, [s.id]: true };
        g2.order = [...g2.order, s.id];
      }
    }
  }

  function nextUnsolved(g2, fromId) {
    const ids = PUZZLE.slots.map((s) => s.id);
    const start = Math.max(0, ids.indexOf(fromId));
    for (let i = 1; i <= ids.length; i++) {
      const id = ids[(start + i) % ids.length];
      if (!g2.solved[id]) return id;
    }
    return fromId;
  }

  function submit() {
    if (!playing || !slot || g.solved[sel]) return;
    if (typed.length < editable.length) { say('Not enough letters'); return; }
    let ti = 0;
    const letters = cells.map((cl) => (g.greens[`${cl.r},${cl.c}`] ? cl.ch : typed[ti++]));
    const guess = letters.join('');
    if (guess !== slot.word && !ANSWER_WORDS.has(guess.toLowerCase())) {
      const ws = wordSetRef.current;
      if (ws && !ws.has(guess.toLowerCase())) {
        say('Not in the word list');
        return;
      }
    }
    const marks = computeMarks(guess, slot.word);

    const g2 = { ...g };
    if (!g2.t0) g2.t0 = Date.now();
    g2.left = g.left - 1;
    g2.slotGuesses = { ...g.slotGuesses, [sel]: (g.slotGuesses[sel] || 0) + 1 };
    const greens2 = { ...g.greens };
    cells.forEach((cl, i) => { if (marks[i] === 'g') greens2[`${cl.r},${cl.c}`] = true; });
    g2.greens = greens2;

    const pres = new Set((g.present[sel] || '').split('').filter(Boolean));
    const abs = new Set((g.absent[sel] || '').split('').filter(Boolean));
    marks.forEach((m, i) => {
      const L = guess[i];
      if (m === 'y') pres.add(L);
      else if (m === 'x') {
        const elsewhere = marks.some((mm, j) => j !== i && guess[j] === L && mm !== 'x');
        if (!elsewhere) abs.add(L);
      }
    });
    g2.present = { ...g.present, [sel]: [...pres].join('') };
    g2.absent = { ...g.absent, [sel]: [...abs].join('') };
    g2.lastGuess = { ...g.lastGuess, [sel]: { word: guess, marks } };

    if (guess === slot.word) {
      g2.solved = { ...g2.solved, [sel]: true };
      g2.order = [...g2.order, sel];
      say(`${slot.word} — solved. File it under a category.`);
    }
    sweepAutoSolve(g2);

    const allSolved = PUZZLE.slots.every((s) => g2.solved[s.id]);
    if (!allSolved && g2.left <= 0) {
      if (g2.order.length === 0) {
        g2.status = 'lost';
        g2.filedRight = 0;
        g2.tEnd = Date.now();
        postResult(g2, 0);
      } else {
        say('Out of guesses — place your solved words, then lock it in');
      }
    }
    setTyped('');
    if (g2.solved[sel] && g2.status === 'playing') setSel(nextUnsolved(g2, sel));
    setG(g2);
  }

  // One completed game = one play (win or loss). Score = words solved of 8,
  // time is the tiebreak — same shape the connections-format boards report.
  // Only game-end transitions post, so resumed/saved games never double-count;
  // replays post again on their own completion, matching the site-wide metric.
  function postResult(g2, scoreOverride) {
    const sc = scoreOverride != null ? scoreOverride : g2.order.length;
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: PUZZLE.slots.length * 2, correct: sc, guessesUsed: Object.values(g2.slotGuesses || {}).reduce((a, b) => a + b, 0), timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // Placements are PROVISIONAL and silent: no correctness feedback until the
  // player locks in the full board (owner decision 2026-07-07). The only
  // verdict is a count of misfiled words — never which ones.
  function fileWord(word, ci) {
    if (!playing) return;
    const occupants = Object.keys(g.assigned).filter((w) => g.assigned[w] === ci && w !== word);
    if (occupants.length >= PUZZLE.categories[ci].words.length) {
      say(`${PUZZLE.categories[ci].name} is already full — tap a word there to take it back`);
      return;
    }
    setG({ ...g, assigned: { ...g.assigned, [word]: ci } });
    setPick(null);
  }
  function unfile(word) {
    if (!playing) return;
    const assigned2 = { ...g.assigned };
    delete assigned2[word];
    setG({ ...g, assigned: assigned2 });
    setPick(null);
  }
  // ONE lock-in, and it concludes the game. Score is out of 16: a point per
  // word solved plus a point per word correctly categorized. Available at a
  // full solve, or once the guess budget is spent (place what you solved).
  // No lock-in, no score — abandoned games never post.
  function lockIn() {
    if (!playing) return;
    const solvedSlots = PUZZLE.slots.filter((s) => g.solved[s.id]);
    const allSolved = solvedSlots.length === PUZZLE.slots.length;
    const placedAll = solvedSlots.every((s) => g.assigned[s.word] !== undefined);
    if (!placedAll || solvedSlots.length === 0) return;
    if (!allSolved && g.left > 0) return;
    const right = solvedSlots.filter((s) => PUZZLE.categories[g.assigned[s.word]].words.includes(s.word)).length;
    const score = solvedSlots.length + right;
    const g2 = { ...g, filedRight: right, status: score === PUZZLE.slots.length * 2 ? 'won' : 'lost', tEnd: Date.now() };
    postResult(g2, score);
    setG(g2);
    if (score === PUZZLE.slots.length * 2) setJustWon(true);
  }

  function cellClick(r, c) {
    const info = CELLS.get(`${r},${c}`);
    if (!info || !playing) return;
    const unsolvedIds = info.slots.filter((id) => !g.solved[id]);
    const pool = unsolvedIds.length ? unsolvedIds : info.slots;
    if (pool.length > 1 && pool.includes(sel)) setSel(pool.find((id) => id !== sel));
    else setSel(pool[0]);
    setTyped('');
  }

  function cycleSlot(dirn) {
    const ids = PUZZLE.slots.map((s) => s.id).filter((id) => !g.solved[id]);
    if (!ids.length) return;
    const i = Math.max(0, ids.indexOf(sel));
    setSel(ids[(i + (dirn === 1 ? 1 : ids.length - 1)) % ids.length]);
    setTyped('');
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(PUZZLE)); setSel(PUZZLE.slots[0].id); setTyped(''); setPick(null);
  }

  const guessesUsed = Object.values(g.slotGuesses).reduce((a, b) => a + b, 0);
  const prevPuzzle = PUZZLES.find((x) => x.num === PUZZLE.num - 1) || null;
  const isTodays = PUZZLE.num === pickPuzzle(null).num;
  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';

  // Copyable grid, one row GROUPED BY CATEGORY (yellow pair, green pair,
  // blue pair, red pair): color = that word solved AND filed right, black =
  // missed (unsolved or misfiled). No letters or words leak.
  function shareText() {
    const rows = PUZZLE.categories.map((cat, ci) =>
      cat.words.map((w) => (g.assigned[w] === ci ? CAT_COLORS[ci].sq : '⬛')).join(''));
    const score = g.status === 'won' ? PUZZLE.slots.length * 2 : g.order.length + (g.filedRight || 0);
    const head = `Crux #${PUZZLE.num} · ${score}/${PUZZLE.slots.length * 2} · ${guessesUsed} guess${guessesUsed === 1 ? '' : 'es'} · ${elapsed}`;
    return `${head}\n${rows.join('\n')}\nsourceoftruths.com/crux`;
  }
  function copyShare() {
    const text = playing
      ? `Crux #${PUZZLE.num} \u2014 a crossword with no clues. Can you crack it?\nsourceoftruths.com/crux`
      : shareText();
    // Mobile: native share sheet (like the big daily games) — the receiving
    // app gets the text directly, line breaks intact, no clipboard quirks.
    // Desktop: clipboard with the Copied flip.
    try {
      if (typeof navigator !== 'undefined' && navigator.share && isMobileDevice()) {
        navigator.share({ text }).catch(() => {});
        return;
      }
    } catch (e) {}
    try {
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    } catch (e) {}
  }

  // next editable cell (cursor) in the selected slot
  const cursorKey = (() => {
    if (!playing || !slot || g.solved[sel]) return null;
    const cl = editable[typed.length];
    return cl ? `${cl.r},${cl.c}` : null;
  })();

  // typed letters mapped onto cells
  const typedAt = {};
  if (slot && !g.solved[sel]) editable.forEach((cl, i) => { if (typed[i]) typedAt[`${cl.r},${cl.c}`] = typed[i]; });

  const selCellKeys = new Set(cells.map((cl) => `${cl.r},${cl.c}`));

  // keyboard letter states for the selected slot
  const keyState = {};
  if (slot) {
    const presStr = g.present[sel] || '';
    const absStr = g.absent[sel] || '';
    for (const ch of absStr) keyState[ch] = 'x';
    for (const ch of presStr) keyState[ch] = 'y';
    cells.forEach((cl) => { if (g.greens[`${cl.r},${cl.c}`]) keyState[cl.ch] = 'g'; });
  }

  const solvedUnfiled = PUZZLE.slots
    .filter((s) => g.solved[s.id] && g.assigned[s.word] === undefined)
    .map((s) => s.word);
  const readyToLock = playing
    && g.order.length > 0
    && PUZZLE.slots.filter((s) => g.solved[s.id]).every((s) => g.assigned[s.word] !== undefined)
    && (g.order.length === PUZZLE.slots.length || g.left <= 0);

  const lost = g.status === 'lost';
  const won = g.status === 'won';

  function cellStyle(r, c, info) {
    const k = `${r},${c}`;
    const green = g.greens[k];
    // a cell owned by any solved+filed word takes that category's tint
    // Category tint only appears at game end (placements are secret while
    // playing), and always by TRUE category — the reveal moment.
    let cat = null;
    if (!playing) {
      for (const id of info.slots) {
        if (g.solved[id]) {
          cat = CAT_COLORS[PUZZLE.categories.findIndex((c) => c.words.includes(SLOT[id].word))];
          break;
        }
      }
    }
    const inSel = playing && selCellKeys.has(k) && !g.solved[sel];
    const base = {
      width: 'var(--cs)', height: 'var(--cs)', borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontWeight: 800, fontSize: 'calc(var(--cs) * 0.48)',
      cursor: playing ? 'pointer' : 'default', userSelect: 'none',
      gridRow: r + 1, gridColumn: c + 1, position: 'relative',
      transition: 'background .12s,border-color .12s',
    };
    if (cat) return { ...base, background: cat.bg, color: cat.tc, border: `1.5px solid ${cat.bg}` };
    if (green) return { ...base, background: COLORS.ink, color: '#fff', border: `1.5px solid ${COLORS.ink}` };
    if (lost) return { ...base, background: '#fff', color: COLORS.rust, border: '1.5px dashed rgba(192,57,43,0.55)' };
    if (inSel) {
      const isCursor = cursorKey === k;
      return {
        ...base,
        background: isCursor ? '#dbe7ff' : '#eef4ff',
        color: COLORS.ember,
        border: `2px solid ${isCursor ? COLORS.ember : 'rgba(37,99,235,0.55)'}`,
      };
    }
    return { ...base, background: '#fff', color: COLORS.ink, border: '1.5px solid rgba(20,22,28,0.18)' };
  }

  function cellLetter(r, c, info) {
    const k = `${r},${c}`;
    if (g.greens[k]) return info.ch;
    if (lost) return info.ch;
    if (typedAt[k]) return typedAt[k];
    return '';
  }

  const startNum = {};
  PUZZLE.slots.forEach((s) => {
    const k = `${s.row},${s.col}`;
    if (!startNum[k]) startNum[k] = parseInt(s.id, 10);
  });

  const KB = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  const kbColors = { g: { bg: COLORS.ink, fg: '#fff' }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: '#6b7280' } };

  const lastG = g.lastGuess[sel];
  const markColor = { g: { bg: COLORS.ink, fg: '#fff' }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: '#40434b' } };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, position: 'relative' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 3 }}><SiteHeader active="quizzes" flush inlay={<QuizPlayerBar />} /></div>

      <div className="qzf-w" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '8px 38px 80px', fontFamily: SANS }}>
        <div className="qzf-line" aria-hidden="true" />
        <style>{`
          .cl-cols{display:grid;grid-template-columns:minmax(0,auto) minmax(280px,1fr);gap:30px;align-items:start;}
          @media(max-width:860px){.cl-cols{grid-template-columns:1fr;gap:16px;}.cl-side{order:-1;}.cl-cat{min-height:0 !important;padding:8px 11px !important;}}
          .cl-grid{--cs:42px;}
          @media(max-width:560px){.cl-grid{--cs:calc((100vw - ${35 + (COLS - 1) * 3}px)/${COLS});}}
          .cl-key{border:none;font-family:${SANS};font-weight:800;cursor:pointer;border-radius:6px;padding:0;touch-action:manipulation;}
          .cl-grid > div{touch-action:manipulation;}
          .cl-key:active{transform:scale(0.94);}
          .cl-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .cl-btn:hover{background:${COLORS.paper};}
          @keyframes cxfall{0%{transform:translateY(-4vh) rotate(0deg);}100%{transform:translateY(108vh) rotate(680deg);}}
          .cx-conf{position:fixed;top:-3vh;z-index:86;pointer-events:none;border-radius:2px;animation:cxfall linear forwards;}
        `}</style>

        {/* game content recentered: the qzf box is 1180, the game stays 960 */}
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 2 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: COLORS.ink }}>Crux</h1>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: COLORS.ember, borderRadius: 6, padding: '2px 8px' }}>#{PUZZLE.num}</span>
          {PUZZLE.categories[0].words.length === 3 && (
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: COLORS.ink, borderRadius: 6, padding: '2px 8px' }}>SUNDAY EDITION</span>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontWeight: 700, fontSize: 13 }}>
            <HelpCircle size={18} /> How to play
          </button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: COLORS.faded, fontWeight: 600 }}>
          A crossword with no clues &mdash; the four categories are the only hints. One shared guess budget.
        </p>

        {/* status strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded }}>Guesses</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: g.left <= 3 ? COLORS.rust : COLORS.ink }}>{g.left}</span>
            <div style={{ width: 90, height: 7, background: '#e2e5ea', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(0, Math.min(100, (g.left / PUZZLE.guesses) * 100))}%`, height: '100%', background: g.left <= 3 ? COLORS.rust : COLORS.ember, transition: 'width .2s' }} />
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>{g.order.length}/{PUZZLE.slots.length} words solved</div>
        </div>

        <div className="cl-cols">
          {/* left: board + input */}
          <div>
            <div className="cl-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, var(--cs))`, gridTemplateRows: `repeat(${ROWS}, var(--cs))`, gap: 3, marginBottom: 12 }}>
              {[...CELLS.entries()].map(([k, info]) => {
                const [r, c] = k.split(',').map(Number);
                return (
                  <div key={k} onClick={() => cellClick(r, c)} style={cellStyle(r, c, info)}>
                    {startNum[k] ? <span style={{ position: 'absolute', top: 1, left: 3, fontSize: 'calc(var(--cs) * 0.22)', fontWeight: 800, opacity: 0.65 }}>{startNum[k]}</span> : null}
                    {cellLetter(r, c, info)}
                  </div>
                );
              })}
            </div>

            {/* selected slot bar */}
            {playing && slot && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <button className="cl-key" onClick={() => cycleSlot(-1)} aria-label="Previous word" style={{ background: COLORS.paper, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={17} /></button>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.ink }}>
                  {slotLabel(sel)} <span style={{ color: COLORS.faded, fontWeight: 700 }}>&middot; {slot.word.length} letters &middot; {(g.slotGuesses[sel] || 0)} guess{(g.slotGuesses[sel] || 0) === 1 ? '' : 'es'} spent</span>
                </div>
                <button className="cl-key" onClick={() => cycleSlot(1)} aria-label="Next word" style={{ background: COLORS.paper, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={17} /></button>
              </div>
            )}

            {/* last guess feedback for this slot */}
            {playing && lastG && !g.solved[sel] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded, marginRight: 4 }}>Last try</span>
                {lastG.word.split('').map((ch, i) => {
                  const mc = markColor[lastG.marks[i]];
                  return <span key={i} style={{ width: 26, height: 26, borderRadius: 5, background: mc.bg, color: mc.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{ch}</span>;
                })}
                <span style={{ fontSize: 11.5, color: COLORS.faded, fontWeight: 700, marginLeft: 6 }}>
                  {(g.present[sel] || '') ? <>in word: <b style={{ color: '#8a6d1a' }}>{(g.present[sel] || '').split('').join(' ')}</b></> : null}
                </span>
              </div>
            )}

            {/* keyboard (hidden once the budget is spent — filing phase) */}
            {playing && g.left > 0 && (
              <div style={{ maxWidth: 470 }}>
                {KB.map((row, ri) => (
                  <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: 5, justifyContent: 'center' }}>
                    {ri === 2 && (
                      <button className="cl-key" onClick={() => onKey('ENTER')} style={{ flex: '1.6 0 0', height: 44, background: COLORS.ember, color: '#fff', fontSize: 11.5 }}>ENTER</button>
                    )}
                    {row.split('').map((ch) => {
                      const st = keyState[ch];
                      const kc = st ? kbColors[st] : { bg: '#fff', fg: COLORS.ink };
                      return (
                        <button key={ch} className="cl-key" onClick={() => onKey(ch)} style={{ flex: '1 0 0', height: 44, background: kc.bg, color: kc.fg, fontSize: 15, border: st ? 'none' : '1.5px solid rgba(20,22,28,0.15)' }}>{ch}</button>
                      );
                    })}
                    {ri === 2 && (
                      <button className="cl-key" onClick={() => onKey('BACK')} aria-label="Delete" style={{ flex: '1.6 0 0', height: 44, background: COLORS.paper, color: COLORS.ink, fontSize: 16 }}>&#9003;</button>
                    )}
                  </div>
                ))}
                <p style={{ fontSize: 11.5, color: COLORS.faded, fontWeight: 600, margin: '6px 0 0', textAlign: 'center' }}>
                  Guesses must be real words &mdash; the budget is the constraint.
                </p>
              </div>
            )}
          </div>

          {/* right: categories + filing + result (ordered above the grid on mobile — they are the clues) */}
          <div className="cl-side">
            <div style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded, marginBottom: 8 }}>
              The categories &mdash; each hides {PUZZLE.categories[0].words.length === 3 ? 'three' : 'two'} of the {PUZZLE.slots.length === 12 ? 'twelve' : 'eight'} words
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {PUZZLE.categories.map((cat, ci) => {
                const cc = CAT_COLORS[ci];
                const filed = Object.keys(g.assigned).filter((w) => g.assigned[w] === ci);
                const clickable = playing && pick;
                return (
                  <div key={ci} className="cl-cat" onClick={clickable ? () => fileWord(pick, ci) : undefined}
                    style={{ background: cc.bg, borderRadius: 10, padding: '10px 12px', minHeight: 74, cursor: clickable ? 'pointer' : 'default', outline: clickable ? `2.5px dashed ${cc.tc}` : 'none', outlineOffset: 2 }}>
                    <div style={{ color: cc.tc, fontWeight: 800, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: 1.25, marginBottom: 7 }}>{cat.name}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {cat.words.map((_, i) => {
                        const w = lost ? cat.words[i] : filed[i];
                        if (!w) return <span key={i} style={{ background: 'rgba(255,255,255,0.28)', color: cc.tc, borderRadius: 6, padding: '3px 14px', fontWeight: 800, fontSize: 12.5 }}>?</span>;
                        if (lost) return <span key={i} style={{ background: 'rgba(255,255,255,0.28)', color: cc.tc, borderRadius: 6, padding: '3px 8px', fontWeight: 700, fontSize: 12.5, opacity: 0.85 }}>{w}</span>;
                        return (
                          <button key={i} onClick={playing ? () => unfile(w) : undefined} title={playing ? 'Tap to take back' : undefined}
                            style={{ background: 'rgba(255,255,255,0.6)', color: cc.tc, border: 'none', borderRadius: 6, padding: '3px 8px', fontWeight: 800, fontSize: 12.5, fontFamily: SANS, cursor: playing ? 'pointer' : 'default' }}>
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* filing tray */}
            {playing && solvedUnfiled.length > 0 && (
              <div style={{ background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.ink, marginBottom: 7 }}>
                  {pick ? <>Placing <span style={{ color: COLORS.ember }}>{pick}</span> &mdash; tap a category</> : 'Solved — place each word under a category. Nothing is checked until you submit.'}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {solvedUnfiled.map((w) => (
                    <button key={w} onClick={() => setPick(pick === w ? null : w)}
                      style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, padding: '6px 11px', borderRadius: 7, cursor: 'pointer', border: 'none', background: pick === w ? COLORS.ember : COLORS.ink, color: '#fff', boxShadow: pick === w ? '0 0 0 3px rgba(37,99,235,0.25)' : 'none' }}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* lock it in: single shot, concludes the game — armed two-tap */}
            {readyToLock && (
              <button onClick={() => { if (armLock) { lockIn(); } else { setArmLock(true); setTimeout(() => setArmLock(false), 3500); } }}
                style={{ width: '100%', fontFamily: SANS, fontWeight: 800, fontSize: 15, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '15px 10px', borderRadius: 10, border: 'none', background: armLock ? COLORS.ink : COLORS.ember, color: '#fff', cursor: 'pointer', marginBottom: 14 }}>
                {armLock ? 'Tap again — this ends the game' : 'Submit answers'}
              </button>
            )}

            {/* result */}
            {!playing && (
              <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '16px 16px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: won ? COLORS.ember : COLORS.rust, marginBottom: 4 }}>
                  {won ? 'You got to the crux of the matter.' : g.filedRight != null ? `Final: ${g.order.length + g.filedRight}/${PUZZLE.slots.length * 2}.` : 'Out of guesses.'}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.faded, marginBottom: 12 }}>
                  {won
                    ? <>{guessesUsed} guesses &middot; {elapsed}</>
                    : g.filedRight != null
                      ? <>{g.order.length}/{PUZZLE.slots.length} words &middot; {g.filedRight}/{PUZZLE.slots.length} placements &middot; the reveal is on the board</>
                      : <>{g.order.length} of {PUZZLE.slots.length} words &middot; the reveal is on the board</>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="cl-btn" onClick={copyShare}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
                  <button className="cl-btn" onClick={resetGame} style={{ borderColor: '#c3c8cf', color: COLORS.faded }}><RotateCcw size={15} /> Replay</button>
                </div>
                {!garbleDoneToday && (
                  <a href="/garble" style={{ display: 'block', marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fdf6e3', border: '1.5px solid rgba(230,185,63,0.6)', textDecoration: 'none', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink }}>
                  Still on the table today: <b style={{ color: '#8a6d1a' }}>Garble</b> &mdash; five garbled words, one clued finale &rarr;
                  </a>
                )}
                <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
                  A new puzzle drops at midnight Eastern.
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/crux?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play {isTodays ? "yesterday's Crux" : `the ${prevPuzzle.dateLabel.replace(', 2026', '')} Crux`} &rarr;
                      </a>
                    </>
                  )}
                </p>
              </div>
            )}

          </div>
        </div>
        </div>

        {/* standard quiz-page bottom: challenge + join + leaderboard (always) */}
        <div style={{ maxWidth: 640, margin: '36px auto 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <a href={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`} style={{ fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 52, padding: '0 10px', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap', textDecoration: 'none' }}>
              <Swords size={14} strokeWidth={2.5} /> Challenge a Friend
            </a>
            {playing && (
              <button onClick={copyShare} style={{ fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 52, padding: '0 10px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.cream, color: COLORS.ink, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Copied' : 'Share This Puzzle'}
              </button>
            )}
          </div>
        </div>
        {!identity && (
          <div style={{ maxWidth: 640, margin: '18px auto 0' }}>
            <JoinLeaderboardForm identity={identity} onJoined={(id) => setIdentity(id)} />
          </div>
        )}
        <div style={{ maxWidth: 760, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <QuizLeaderboard board={board} identity={identity} total={PUZZLE.slots.length * 2} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, fontStyle: 'italic', fontWeight: 600, color: COLORS.faded, margin: '34px 0 0' }}>For WMM, in memoriam.</p>
      </div>

      {/* the win moment: confetti + overlay, only on the transition to won */}
      {justWon && (
        <>
          {Array.from({ length: 80 }).map((_, i) => {
            const confColors = ['#e6b93f', '#5aa96a', '#5a97dd', '#d96363', '#2563eb'];
            const w = 7 + ((i * 13) % 8);
            return (
              <span key={i} className="cx-conf" style={{ left: `${(i * 137) % 100}%`, width: w, height: Math.round(w * 1.5), background: confColors[i % confColors.length], animationDuration: `${2.1 + ((i * 29) % 12) / 10}s`, animationDelay: `${((i * 53) % 70) / 100}s` }} />
            );
          })}
          <div onClick={() => setJustWon(false)} style={{ position: 'fixed', inset: 0, zIndex: 85, background: 'rgba(20,22,28,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', border: `3px solid ${COLORS.ember}`, borderRadius: 16, padding: '30px 28px 24px', maxWidth: 440, width: '100%', textAlign: 'center', fontFamily: SANS }}>
              <Trophy size={42} strokeWidth={2} style={{ color: '#e6b93f' }} />
              <div style={{ fontSize: 27, fontWeight: 800, color: COLORS.ink, letterSpacing: '-0.01em', margin: '10px 0 6px', lineHeight: 1.2 }}>You got to the crux of the matter.</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.faded, marginBottom: 18 }}>{PUZZLE.slots.length * 2}/{PUZZLE.slots.length * 2} &middot; {guessesUsed} guess{guessesUsed === 1 ? '' : 'es'} &middot; {elapsed}</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="cl-btn" onClick={copyShare} style={{ background: COLORS.ember, color: '#fff', borderColor: COLORS.ember }}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
                <button className="cl-btn" onClick={() => setJustWon(false)}>See the board</button>
              </div>
            </div>
          </div>
        </>
      )}

      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

      {/* toast */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: COLORS.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, zIndex: 60, boxShadow: '0 6px 18px rgba(20,22,28,0.25)', maxWidth: '86vw', textAlign: 'center' }}>
          {toast}
        </div>
      )}

      {/* help modal */}
      {showHelp && (
        <div onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
              <p style={{ margin: '0 0 9px' }}><b>{PUZZLE.slots.length === 12 ? 'Twelve' : 'Eight'} words</b> interlock in the grid &mdash; no clues. The <b>four categories</b> are the only hints; each hides exactly {PUZZLE.categories[0].words.length === 3 ? 'three' : 'two'} of the words.</p>
              <p style={{ margin: '0 0 9px' }}><b>Guess to reveal:</b> tap a slot, type a real word, hit enter. <span style={{ background: COLORS.ink, color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>Dark</span> = right letter, right square (locks in, crossings too). <span style={{ background: '#e6b93f', color: '#5c4a06', borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>Yellow</span> = in the word, different square. The whole board shares <b>{PUZZLE.guesses} guesses</b>.</p>
              <p style={{ margin: 0 }}><b>File your solves:</b> tap a word, then a category &mdash; placements stay secret and movable. One <b>submit</b> ends the game. Score is out of {PUZZLE.slots.length * 2}: a point per solved word, a point per correct placement. No lock-in, no score.</p>
            </div>
            <button className="cl-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Crux — crawlable prose for search, server-rendered into the initial HTML */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Crux</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Crux is a free daily word game from Source of Truths &mdash; a crossword with no clues. Eight hidden words (twelve in the Sunday Edition) interlock in a compact grid, and the only hints are four visible categories; working out which words belong to them is the puzzle.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Guess real words to reveal letters: dark tiles lock a letter into its square and every crossing, yellow tiles mean the letter belongs elsewhere in the word. The whole board shares one guess budget, and a single submit files each solved word under its category &mdash; a point per solve, a point per correct placement.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new Crux puzzle arrives every day, with a bigger Sunday Edition each week. No app, no signup &mdash; play free in your browser and compare score, guesses, and time on the daily leaderboard. Prefer scrambles? Try <a href="/garble" style={{ color: COLORS.ink, fontWeight: 800 }}>Garble</a>, our daily word scramble.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
