// Draws the BetterPanabo mark (a banana plant over a rising sun) and writes
// every logo file the site uses:
//   src/Theme/logo.svg          the mark in the navbar and footer
//   public/favicon.svg, .ico     browser tab icons (no sun stripes: clearer when tiny)
//   public/apple-touch-icon.png, icon-192.png, icon-512.png, icon-maskable-512.png
//   public/og-image.png         the 1200 x 630 link preview
//
// Usage, from the project folder (the renderer isn't a project dependency):
//   npm install --no-save --legacy-peer-deps @resvg/resvg-js@2.6.2
//   node scripts/logo/build-logo.cjs
//
// To change the logo, edit COLORS, LEAVES or mark() below and run it again.
// The link preview's text uses the system's Segoe UI font (Windows).
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const NAME = "BetterPanabo";
const root = path.join(__dirname, "../..");
const out = (file) => path.join(root, file);

const COLORS = {
  leafLight: "#5fa83a",
  leafDark: "#2f7a2b",
  trunk: "#3d8030",
  trunkShade: "#28601f",
  sunTop: "#fcc93a",
  sunBottom: "#f28a1d",
  wordmark: "#1f5a1f", // same as --color-logo in src/Theme/theme.css
};

// --- The mark ---

const round = (n) => Math.round(n * 100) / 100;

// One leaf, pointing along +x from (0,0): two halves split by a curved midrib,
// with torn notches like a banana leaf. Notches are positions along the leaf (0–1).
function leaf({ len, width, bend = 0, notchesTop = [], notchesBottom = [] }) {
  const N = 48;
  const mid = (t) => [t * len, bend * t * t * len];
  // A thin stalk for the first 14%, then the blade, widest past the middle
  const half = (t) => {
    const s = Math.max(0, (t - 0.14) / 0.86);
    return width * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.85)), 0.65) + (t < 0.2 ? 0.55 : 0);
  };
  const notched = (t, notches) => {
    let k = 1;
    for (const n of notches) {
      const d = Math.abs(t - n);
      if (d < 0.03) k = Math.min(k, 0.12 + 0.88 * (d / 0.03));
    }
    return k;
  };
  const edge = (side, notches) =>
    Array.from({ length: N + 1 }, (_, i) => {
      const t = i / N;
      const [x, y] = mid(t);
      return [x, y + side * half(t) * notched(t, notches)];
    });
  const midrib = Array.from({ length: N + 1 }, (_, i) => mid(i / N)).reverse();
  const toPath = (pts) => "M" + pts.map(([x, y]) => `${round(x)},${round(y)}`).join("L") + "Z";
  return {
    top: toPath([...edge(-1, notchesTop), ...midrib]),
    bottom: toPath([...edge(1, notchesBottom), ...midrib]),
  };
}

// Where each leaf starts, its angle (0 = right, -90 = up), length, width and curve
const LEAVES = [
  { x: 49.4, y: 58, angle: -152, len: 33, width: 6.4, bend: -0.12, notchesTop: [0.56] },
  { x: 49.6, y: 55, angle: -120, len: 37, width: 6.8, bend: -0.1, notchesTop: [0.62] },
  { x: 50, y: 53, angle: -80, len: 45, width: 7.2, bend: 0.08, notchesTop: [0.62], notchesBottom: [0.48] },
  { x: 50.4, y: 55, angle: -44, len: 37, width: 6.8, bend: 0.1, notchesTop: [0.6] },
  { x: 50.6, y: 58, angle: -22, len: 32, width: 6.4, bend: 0.12, notchesTop: [0.54] },
];

function mark({ stripes = true } = {}) {
  const c = COLORS;
  const leaves = LEAVES.map((l) => {
    const { top, bottom } = leaf(l);
    return `<g transform="translate(${l.x} ${l.y}) rotate(${l.angle})"><path fill="${c.leafLight}" d="${top}"/><path fill="${c.leafDark}" d="${bottom}"/></g>`;
  }).join("");
  // Horizon stripes are cut out of the sun, so they show whatever is behind the logo
  const stripeMask = stripes
    ? `<mask id="cut"><rect x="0" y="0" width="100" height="100" fill="#fff"/><path fill="#000" d="M18,68.2 L46,67 L46,69.4 L18,70.6 Z M54,67 L82,68.2 L82,70.6 L54,69.4 Z M18,76.6 L46,75.2 L46,77.8 L18,79.2 Z M54,75.2 L82,76.6 L82,79.2 L54,77.8 Z"/></mask>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${NAME}" viewBox="12 6 76 84">
<title>${NAME}</title><defs><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sunTop}"/><stop offset="1" stop-color="${c.sunBottom}"/></linearGradient>${stripeMask}</defs>
<circle cx="50" cy="61" r="26" fill="url(#sun)"${stripes ? ' mask="url(#cut)"' : ""}/>
<path fill="${c.trunk}" d="M48.6,54 C48.2,66 46,78 39,87 L61,87 C54,78 51.8,66 51.4,54 Z"/>
<path fill="${c.trunkShade}" d="M50.4,54 L51.4,54 C51.8,66 54,78 61,87 L53,87 C51.8,77 51,66 50.4,54 Z"/>
${leaves}
<path fill="${c.trunk}" d="M46.6,58.5 C46.2,54.2 47.8,50.4 50,48.8 C52.2,50.4 53.8,54.2 53.4,58.5 Z"/>
</svg>
`;
}

// --- Rendering ---

const full = mark();
const small = mark({ stripes: false });

// A copy of the mark inside a bigger SVG (it keeps its proportions)
const place = (svg, x, y, w, h) => svg.replace("<svg ", `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const font = { loadSystemFonts: true, defaultFontFamily: "Segoe UI" };
const png = (svg, width) => new Resvg(svg, { fitTo: { mode: "width", value: width }, font }).render().asPng();

// A square icon: the mark centered, with `pad` (a share of the side) around it
const square = (svg, size, pad, background) => {
  const inner = size * (1 - 2 * pad);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${
    background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : ""
  }${place(svg, size * pad, size * pad, inner, inner)}</svg>`;
};

// An .ico holding PNG images
const ico = (images) => {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size, e);
    header.writeUInt8(size, e + 1);
    header.writeUInt16LE(1, e + 4); // color planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
};

const linkPreview = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#ffffff"/>
${place(full, 90, 110, 370, 410)}
<g font-family="Segoe UI, sans-serif">
<text x="540" y="215" font-size="42" font-weight="700" fill="${COLORS.wordmark}">${NAME}</text>
<text x="540" y="300" font-size="64" font-weight="700" fill="#0f172a">Public information,</text>
<text x="540" y="375" font-size="64" font-weight="700" fill="#0f172a">made easy to find.</text>
<text x="540" y="445" font-size="29" fill="#64748b">City service guides, emergency hotlines, and</text>
<text x="540" y="486" font-size="29" fill="#64748b">the city's budget and procurement, explained.</text>
</g>
<rect y="614" width="1200" height="16" fill="${COLORS.leafDark}"/>
</svg>`;

const files = {
  "src/Theme/logo.svg": full,
  "public/favicon.svg": small,
  "public/favicon.ico": ico([16, 32, 48].map((size) => ({ size, data: png(square(small, size, 0.02), size) }))),
  "public/apple-touch-icon.png": png(square(full, 180, 0.12, "#ffffff"), 180),
  "public/icon-192.png": png(square(full, 192, 0.1, "#ffffff"), 192),
  "public/icon-512.png": png(square(full, 512, 0.1, "#ffffff"), 512),
  // Android crops maskable icons to a circle or squircle: keep the mark well inside
  "public/icon-maskable-512.png": png(square(full, 512, 0.2, "#ffffff"), 512),
  "public/og-image.png": png(linkPreview, 1200),
};

for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(out(file), content);
  console.log(String(Buffer.byteLength(content)).padStart(7), file);
}
