/**
 * The name, drawn rather than typeset.
 *
 * Every glyph is built from filled polygons on a shared 100 x 140 grid, so the
 * wordmark owes nothing to an installed font: no webfont request, no fallback
 * to worry about, and the strokes taper the way a physical set does (slightly
 * wider at the top, because the camera is looking up at them).
 *
 * `w` is the glyph's advance relative to the grid, which is how the letters are
 * spaced without a font's metrics to lean on.
 */
export interface Glyph {
  char: string;
  /** Advance width as a fraction of the 100-unit grid. */
  w: number;
  paths: string[];
}

const A: Glyph = {
  char: 'A',
  w: 0.96,
  paths: [
    'M 36 6 L 64 6 L 34 134 L 2 134 Z',    // left leg
    'M 36 6 L 64 6 L 98 134 L 66 134 Z',   // right leg
    'M 24 84 L 76 84 L 76 108 L 24 108 Z', // crossbar
  ],
};

const M: Glyph = {
  char: 'M',
  w: 1.22,
  paths: [
    'M 2 6 L 30 6 L 28 134 L 0 134 Z',     // left stem
    'M 70 6 L 98 6 L 100 134 L 72 134 Z',  // right stem
    'M 4 6 L 30 6 L 60 100 L 42 100 Z',    // left diagonal
    'M 70 6 L 96 6 L 58 100 L 40 100 Z',   // right diagonal
  ],
};

const R: Glyph = {
  char: 'R',
  w: 1.0,
  paths: [
    // The stem. The dive is aimed at this shape.
    'M 2 6 L 32 6 L 30 134 L 0 134 Z',
    // Bowl: straight top and bottom with a turned outer edge.
    'M 30 6 L 62 6 C 88 6 94 20 94 38 C 94 56 88 72 62 72 L 30 72 L 30 50 L 58 50 C 66 50 70 45 70 38 C 70 31 66 26 58 26 L 30 26 Z',
    'M 44 62 L 74 62 L 100 134 L 70 134 Z', // leg
  ],
};

const T: Glyph = {
  char: 'T',
  w: 0.92,
  paths: [
    'M 0 6 L 100 6 L 100 30 L 0 30 Z',     // bar
    'M 36 26 L 64 26 L 62 134 L 34 134 Z', // stem
  ],
};

const Y: Glyph = {
  char: 'Y',
  w: 0.96,
  paths: [
    'M 0 6 L 28 6 L 60 68 L 40 68 Z',      // left diagonal
    'M 72 6 L 100 6 L 60 68 L 40 68 Z',    // right diagonal
    'M 36 60 L 64 60 L 62 134 L 34 134 Z', // stem
  ],
};

/** A M A R T Y A */
export const WORDMARK: Glyph[] = [A, M, A, R, T, Y, A];

/** Index of the R, whose stem the camera dives into. */
export const DIVE_INDEX = 3;
