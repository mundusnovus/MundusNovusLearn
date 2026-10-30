// Draws the course art in the Mundus Novus pixel style: public/brand/swift-course.svg, a Mac showing Swift code
// beside an iPhone running an app. A 64 × 48 grid of rectangles, like the brand's marks.  node tools/art.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const C = { ink: '#0c1222', night: '#131c31', coal: '#1c2742', sea: '#2a62c9', bright: '#4a82e6', deep: '#17449a', gold: '#e9b04b',
  light: '#ffd47e', cream: '#f4ecdb', pink: '#ff7ab2', cyan: '#5dd8ff', green: '#67b7a4', grey: '#5a6a8a' };
const r = [];
const rect = (x, y, w, h, c) => r.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C[c]}"/>`);

rect(0, 0, 64, 48, 'night');
for (let y = 1; y < 48; y += 2) rect(0, y, 64, 1, 'ink');           // a quiet scan of lines behind everything
// the Mac
rect(5, 7, 38, 26, 'coal'); rect(6, 8, 36, 24, 'ink');
rect(20, 33, 8, 3, 'coal'); rect(15, 36, 18, 2, 'coal');
const code = [ // [indent, [len, colour]...] — a struct, a property, a view body
  [0, [3, 'pink'], [1, 'ink'], [7, 'cyan'], [1, 'ink'], [1, 'grey']],
  [2, [3, 'pink'], [1, 'ink'], [5, 'cream'], [1, 'grey'], [6, 'cyan']],
  [2, [3, 'pink'], [1, 'ink'], [4, 'cream'], [1, 'grey'], [4, 'pink'], [1, 'ink'], [4, 'cyan']],
  [4, [4, 'cyan'], [1, 'grey'], [6, 'gold'], [1, 'grey']],
  [6, [4, 'green'], [1, 'grey'], [3, 'cream'], [1, 'grey']],
  [2, [1, 'grey']],
  [0, [1, 'grey']],
];
code.forEach((line, i) => { let x = 8 + line[0]; for (const [len, c] of line.slice(1)) { if (c !== 'ink') rect(x, 10 + i * 3, len, 1, c); x += len; } });
rect(8 + 6, 10 + 7 * 3, 1, 2, 'light');                           // the caret
// the iPhone
rect(45, 12, 14, 27, 'coal'); rect(46, 13, 12, 25, 'sea');
rect(49, 13, 6, 1, 'ink');                                        // the island
for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) rect(47 + col * 4, 16 + row * 4, 3, 3, ['cream', 'gold', 'bright'][(row + col) % 3]);
rect(47, 29, 10, 6, 'deep'); rect(48, 30, 6, 1, 'cream'); rect(48, 32, 4, 1, 'light');
rect(49, 36, 6, 1, 'cream');
// a little gold sun of a mark in the corner, for the New World
rect(56, 3, 4, 4, 'gold'); rect(57, 2, 2, 6, 'gold'); rect(55, 4, 6, 2, 'gold');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" width="640" height="480" shape-rendering="crispEdges">${r.join('')}</svg>\n`;
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'brand', 'swift-course.svg'), svg);
console.log('wrote public/brand/swift-course.svg');
