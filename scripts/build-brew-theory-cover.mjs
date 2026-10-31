import fs from "node:fs/promises";
import sharp from "sharp";

const dir = "public/work/coffee/brew-theory";
const source = await fs.readFile(`${dir}/supplied-home.png`);
const meta = await sharp(source).metadata();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1240" viewBox="0 0 900 1240">
<rect width="900" height="1240" fill="#eee7db"/>
<g fill="#3b2b20" font-family="Arial, Helvetica, sans-serif">
<text x="60" y="65" font-size="12" letter-spacing="3">PROSPERA / SELECTED WORK</text>
<path d="M60 101H840" stroke="#b7a28b" stroke-opacity=".5"/>
<text x="60" y="147" font-size="11" letter-spacing="2" fill="#8e7963">BREW THEORY / COFFEE E-COMMERCE</text>
<text x="56" y="240" font-family="Georgia, 'Times New Roman', serif" font-size="78" letter-spacing="-3"><tspan x="56">From bean</tspan><tspan x="56" dy="82">to bliss.</tspan></text>
<text x="60" y="376" font-size="18" fill="#8e7963">Coffee discovery and online shopping.</text>
<rect x="60" y="428" width="780" height="485" rx="4" fill="#342218"/>
<svg x="60" y="428" width="780" height="485" viewBox="0 0 ${meta.width} ${meta.height}" preserveAspectRatio="xMidYMid meet"><image width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${source.toString("base64")}"/></svg>
<text x="60" y="955" font-size="10" fill="#8e7963" letter-spacing="1.5">SUPPLIED WEBSITE SCREENSHOT</text>
<text x="60" y="1025" font-size="22">Storefront &amp; product discovery</text>
<text x="60" y="1064" font-size="22">Shopping cart &amp; product options</text>
<path d="M60 1155H840" stroke="#b7a28b" stroke-opacity=".5"/>
<text x="60" y="1190" font-size="10" fill="#8e7963">Brew Theory / Portfolio presentation</text>
<text x="840" y="1190" text-anchor="end" font-size="17">↗</text>
</g></svg>`;
await fs.writeFile(`${dir}/cover-supplied.svg`, svg);
await sharp(Buffer.from(svg)).webp({ quality: 94 }).toFile(`${dir}/cover-supplied.webp`);
console.log("Brew Theory cover: 900 × 1240, composed from supplied screenshot.");
