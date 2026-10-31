import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Native vector layouts. Existing interface previews are embedded unchanged;
// no image generation, perspective mockups or baked-in generated typography.
const covers = [
  { dir: "noormeher", number: "01", category: "EDUCATION / MANAGEMENT SOFTWARE", title: ["School", "management."], description: ["A connected workspace for", "school and trust administration."], source: "gallery-concept.webp", background: "#e9eae5", ink: "#2e3b35", muted: "#738078", accent: "#637d6b", frame: [64, 430, 1040, 535], features: ["Student records & attendance", "Gallery & daily administration"] },
  { dir: "hrms", number: "02", category: "PEOPLE / BUSINESS SOFTWARE", title: ["HRMS.", "Work, organised."], description: ["Attendance, leave and employee", "communication in one place."], source: "attendance-blue.webp", background: "#e9edf2", ink: "#253851", muted: "#758497", accent: "#6b83aa", frame: [64, 430, 1085, 535], features: ["Attendance & leave workflows", "Notifications & email updates"] },
  { dir: "sales-crm", number: "03", category: "AUTOMOTIVE / SALES SOFTWARE", title: ["Sales CRM.", "Every deal, closer."], description: ["Vehicle inventory, customer enquiries", "and the next conversation."], source: "vehicle-restyled.webp", background: "#e6ebe9", ink: "#263c35", muted: "#77877e", accent: "#4d7c6c", frame: [64, 430, 1120, 535], features: ["Vehicle inventory & enquiries", "Follow-ups & WhatsApp sharing"] },
  { dir: "business-network", number: "04", category: "COMMUNITY / BUSINESS PLATFORM", title: ["Business.", "Connected."], description: ["Discover services, share updates", "and pass relevant referrals."], source: "directory-restyled.webp", background: "#ecebf0", ink: "#37374e", muted: "#7e7c90", accent: "#7c7c9c", frame: [125, 430, 650, 535], imageCrop: "0 380 863 1000", features: ["Business listings, stories & posts", "Referrals, commissions & points"] },
  { dir: "stock-market", number: "05", category: "FINTECH / MARKET INTERFACES", title: ["Market", "perspective."], description: ["A clear workspace for charts,", "watchlists and market context."], source: "dashboard-restyled.webp", background: "#13211f", ink: "#e4ece7", muted: "#8fa59b", accent: "#8db6a3", frame: [64, 430, 1100, 535], features: ["Charts & analysis interfaces", "Watchlists & simulated market views"] },
];
const escape = s => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const text = (lines, x, y, size, leading, attributes = "") => `<text x="${x}" y="${y}" font-size="${size}" ${attributes}>${lines.map((line, i) => `<tspan x="${x}" dy="${i ? leading : 0}">${escape(line)}</tspan>`).join("")}</text>`;

for (const c of covers) {
  const dir = path.join("public", "work", c.dir);
  const bytes = await fs.readFile(path.join(dir, c.source));
  const meta = await sharp(bytes).metadata();
  const embedded = await sharp(bytes).png().toBuffer();
  const [x, y, w, h] = c.frame;
  const crop = c.imageCrop ?? `0 0 ${meta.width} ${meta.height}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1240" viewBox="0 0 900 1240">
  <defs><clipPath id="screen"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/></clipPath></defs>
  <rect width="900" height="1240" fill="${c.background}"/>
  <g font-family="Arial, Helvetica, sans-serif" fill="${c.ink}">
    <text x="64" y="65" font-size="12" letter-spacing="3">PROSPERA / SELECTED WORK</text>
    <text x="836" y="65" text-anchor="end" font-size="13" fill="${c.muted}">${c.number}</text>
    <path d="M64 101H836" stroke="${c.accent}" stroke-opacity=".35"/>
    <text x="64" y="147" font-size="10" letter-spacing="2" fill="${c.muted}">${escape(c.category)}</text>
    ${text(c.title, 60, 235, 72, 76, `font-family="Georgia, 'Times New Roman', serif" letter-spacing="-2.5"`)}
    ${text(c.description, 64, 363, 17, 26, `fill="${c.muted}"`)}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c.ink}" fill-opacity=".04"/>
    <g clip-path="url(#screen)"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${crop}" preserveAspectRatio="xMinYMin slice"><image width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${embedded.toString("base64")}"/></svg></g>
    <rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="${h - 1}" rx="4" fill="none" stroke="${c.accent}" stroke-opacity=".25"/>
    <text x="64" y="1023" font-size="10" letter-spacing="2" fill="${c.muted}">SELECTED CAPABILITIES</text>
    ${text(c.features, 64, 1067, 20, 34)}
    <path d="M64 1160H836" stroke="${c.accent}" stroke-opacity=".35"/>
    <text x="64" y="1193" font-size="10" fill="${c.muted}">Restyled interface / Demo data</text>
    <text x="836" y="1193" font-size="17" text-anchor="end" fill="${c.ink}">↗</text>
  </g></svg>`;
  await fs.writeFile(path.join(dir, "cover-editorial.svg"), svg);
  await sharp(Buffer.from(svg)).webp({ quality: 94 }).toFile(path.join(dir, "cover-editorial.webp"));
  console.log(`${c.dir}: 900 × 1240 native cover`);
}
