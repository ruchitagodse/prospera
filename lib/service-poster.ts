import { CanvasTexture, SRGBColorSpace } from "three";

const palette = { cream: "#f1ecdf", ink: "#242b22", gold: "#c9aa6d", olive: "#a8ac91", burgundy: "#6c333d" };
const backgrounds = ["#242820", "#a8ac91", "#1d211b", "#6c333d", "#e7ddc6"];
type Context = CanvasRenderingContext2D;

function box(c: Context, x: number, y: number, w: number, h: number, color: string, radius = 12) {
  c.fillStyle = color; c.beginPath(); c.roundRect(x, y, w, h, radius); c.fill();
}
function text(c: Context, value: string, x: number, y: number, size = 16, color = palette.ink, weight = "400") {
  c.fillStyle = color; c.font = `${weight} ${size}px Arial`; c.fillText(value, x, y);
}
function rule(c: Context, x: number, y: number, width: number, color = "#a8ac9170") {
  c.strokeStyle = color; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + width, y); c.stroke();
}
function shadow(c: Context) { c.shadowColor = "#10160d35"; c.shadowBlur = 30; c.shadowOffsetY = 18; }
function browser(c: Context, x: number, y: number, w: number, h: number) {
  shadow(c); box(c, x, y, w, h, palette.cream); c.shadowColor = "transparent";
  box(c, x, y, w, 29, "#e0dccf", 10);
  for (let i = 0; i < 3; i++) { c.fillStyle = ["#a18a64", "#a8ac91", "#717866"][i]; c.beginPath(); c.arc(x + 15 + i * 11, y + 14, 3, 0, Math.PI * 2); c.fill(); }
  box(c, x + w * .3, y + 8, w * .4, 13, "#f1ecdf", 5);
}
function label(c: Context, value: string, x: number, y: number, color: string) {
  c.fillStyle = color; c.font = "16px monospace"; c.fillText(value, x, y);
}

function website(c: Context, time: number) {
  c.save(); c.translate(256, 330 + Math.sin(time * .65) * 6); c.rotate(-.07);
  box(c, -211, -169, 420, 300, "#c9aa6d40");
  browser(c, -222, -151, 420, 300);
  text(c, "PROSPERA", -198, -91, 15, palette.ink, "700");
  text(c, "Studio    Work    Contact", 45, -91, 10);
  rule(c, -198, -78, 372);
  c.fillStyle = palette.ink; c.font = "38px Georgia"; c.fillText("A better first", -198, -26); c.fillText("impression.", -198, 16);
  text(c, "Thoughtful websites.", -196, 43, 12, "#6e7561");
  box(c, -198, 67, 126, 31, palette.ink, 16); text(c, "Explore studio  ↗", -184, 87, 11, palette.cream);
  c.fillStyle = palette.gold; c.beginPath(); c.arc(112, 4, 61, Math.PI, 0); c.lineTo(173, 100); c.lineTo(51, 100); c.fill();
  c.fillStyle = "#7e856c"; c.beginPath(); c.ellipse(111, 107, 66, 9, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  c.save(); c.translate(393, 432 + Math.sin(time * .65 + 1) * 8); c.rotate(.08);
  shadow(c); box(c, -52, -93, 104, 190, palette.ink, 17); c.shadowColor = "transparent";
  box(c, -46, -86, 92, 175, palette.cream, 12); box(c, -16, -80, 32, 5, palette.ink, 3);
  label(c, "PROSPERA", -36, -56, palette.ink); text(c, "Made for", -36, -28, 15, palette.ink, "700"); text(c, "every screen.", -36, -10, 13);
  box(c, -36, 5, 72, 46, palette.olive, 4); box(c, -36, 61, 52, 10, palette.gold, 5); c.restore();
}

function crm(c: Context, time: number) {
  c.save(); c.translate(256, 326 + Math.sin(time * .55) * 7); c.rotate(-.035);
  browser(c, -225, -171, 450, 335);
  box(c, -225, -142, 62, 306, palette.ink, 0);
  text(c, "P", -207, -110, 22, palette.gold, "700");
  for (let i = 0; i < 5; i++) { box(c, -212, -81 + i * 35, 36, 23, i === 0 ? "#d4bd8455" : "#ffffff10", 5); }
  text(c, "Customer overview", -146, -112, 18, palette.ink, "700"); text(c, "Your business, at a glance", -145, -93, 11, "#737a67");
  ["Leads", "Customers", "Open deals"].forEach((name, i) => { const x = -145 + i * 116; box(c, x, -73, 104, 66, i === 1 ? "#ded7c2" : "#e6e6da", 7); text(c, name, x + 10, -52, 10, "#6b725f"); text(c, ["128", "42", "18"][i], x + 10, -23, 25, palette.ink, "700"); });
  ["New lead", "In progress", "Won"].forEach((name, i) => {
    const x = -145 + i * 116; text(c, name, x, 18, 11, palette.ink, "700");
    for (let j = 0; j < 2; j++) { box(c, x, 30 + j * 47, 104, 38, i === 2 ? "#c7d0b7" : "#e2e3d8", 5); box(c, x + 8, 40 + j * 47, 17, 17, i === 0 ? palette.gold : "#929e80", 9); text(c, [["Aarav", "Mira"], ["North Co.", "Oak Studio"], ["Field Co.", "Bloom"]][i][j], x + 31, 52 + j * 47, 9); }
  }); c.restore();
  shadow(c); box(c, 254, 465 + Math.sin(time * .65) * 4, 223, 52, palette.ink, 9); c.shadowColor = "transparent";
  text(c, "✓", 269, 498 + Math.sin(time * .65) * 4, 23, palette.gold); text(c, "New lead added", 301, 496 + Math.sin(time * .65) * 4, 15, palette.cream);
}

function automation(c: Context, time: number) {
  const nodes = [{ x: 39, y: 151, title: "Enquiry received", sub: "Website form", icon: "form" }, { x: 198, y: 300, title: "Added to CRM", sub: "Customer record", icon: "record" }, { x: 55, y: 449, title: "Follow-up sent", sub: "Email automation", icon: "mail" }];
  c.strokeStyle = "#b2bba36b"; c.lineWidth = 3; c.setLineDash([7, 8]);
  for (let i = 0; i < 2; i++) { const a = nodes[i], b = nodes[i + 1]; c.beginPath(); c.moveTo(a.x + 123, a.y + 82); c.bezierCurveTo(a.x + 123, a.y + 119, b.x + 123, b.y - 36, b.x + 123, b.y); c.stroke(); }
  c.setLineDash([]);
  const phase = ((time * .22) % 1) * 2, step = Math.floor(phase), t = phase - step, a = nodes[step], b = nodes[step + 1];
  const inverse = 1 - t, px = inverse ** 3 * (a.x + 123) + 3 * inverse ** 2 * t * (a.x + 123) + 3 * inverse * t ** 2 * (b.x + 123) + t ** 3 * (b.x + 123), py = inverse ** 3 * (a.y + 82) + 3 * inverse ** 2 * t * (a.y + 119) + 3 * inverse * t ** 2 * (b.y - 36) + t ** 3 * b.y;
  c.fillStyle = palette.gold; c.beginPath(); c.arc(px, py, 5, 0, Math.PI * 2); c.fill();
  nodes.forEach((node, index) => {
    shadow(c); box(c, node.x, node.y, 264, 82, palette.cream, 12); c.shadowColor = "transparent";
    box(c, node.x + 13, node.y + 19, 43, 43, palette.ink, 10);
    c.save(); c.translate(node.x + 24, node.y + 30); c.strokeStyle = palette.gold; c.lineWidth = 2;
    c.strokeRect(0, 0, 21, 20); if (node.icon === "mail") { c.beginPath(); c.moveTo(0, 1); c.lineTo(10, 10); c.lineTo(21, 1); c.stroke(); } else { for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(4, 5 + j * 5); c.lineTo(17, 5 + j * 5); c.stroke(); } } c.restore();
    text(c, node.title, node.x + 69, node.y + 34, 16, palette.ink, "700"); text(c, node.sub, node.x + 69, node.y + 55, 11, "#6e7561");
    label(c, `0${index + 1}`, node.x + 233, node.y + 16, "#7d836f");
  });
}

function commerce(c: Context, time: number) {
  c.save(); c.translate(252, 298 + Math.sin(time * .55) * 5); c.rotate(-.045);
  browser(c, -212, -164, 424, 340); text(c, "THE EVERYDAY STORE", -191, -108, 16, palette.ink, "700"); text(c, "Shop    About    Bag (2)", 45, -108, 10);
  rule(c, -190, -94, 380); text(c, "Everyday, considered.", -190, -62, 25, palette.ink, "700");
  for (let i = 0; i < 3; i++) {
    const x = -190 + i * 129; box(c, x, -39, 116, 142, ["#d5d6c5", "#dfd3b8", "#b7bea6"][i], 5);
    c.save(); c.translate(x + 58, 31);
    if (i === 0) { box(c, -30, -20, 60, 66, "#837657", 3); c.strokeStyle = "#504a39"; c.lineWidth = 4; c.beginPath(); c.arc(0, -19, 18, Math.PI, 0); c.stroke(); }
    if (i === 1) { box(c, -23, -15, 46, 66, "#eee6d2", 5); box(c, -15, -35, 30, 22, palette.ink, 3); label(c, "DAILY", -18, 22, palette.ink); }
    if (i === 2) { box(c, -28, -33, 56, 57, "#6c333d", 8); box(c, -35, 14, 70, 13, "#6c333d", 3); c.fillStyle = palette.ink; c.fillRect(-29, 25, 5, 32); c.fillRect(24, 25, 5, 32); }
    c.restore(); text(c, ["Carry tote", "Daily mist", "Studio chair"][i], x, 125, 11, palette.ink, "700"); text(c, ["₹ 1,200", "₹ 850", "₹ 4,500"][i], x, 144, 11, "#737a67");
  } c.restore();
  c.save(); c.translate(347, 445 + Math.sin(time * .55 + 1) * 6); c.rotate(.035);
  shadow(c); box(c, -125, -69, 250, 160, palette.ink, 12); c.shadowColor = "transparent";
  text(c, "Your bag", -107, -40, 18, palette.cream, "700"); label(c, "2 ITEMS", 44, -40, palette.gold);
  rule(c, -105, -24, 210, "#f1ecdf30"); text(c, "Carry tote + Daily mist", -105, 0, 12, palette.cream);
  text(c, "Total", -105, 27, 12, palette.cream); text(c, "₹ 2,050", 45, 27, 14, palette.cream, "700");
  box(c, -106, 44, 212, 31, palette.gold, 4); text(c, "Secure checkout   ↗", -84, 65, 13, palette.ink, "700"); c.restore();
}

function design(c: Context, time: number) {
  c.save(); c.translate(256, 327 + Math.sin(time * .55) * 5); c.rotate(-.07);
  shadow(c); box(c, -212, -170, 424, 309, "#ede6d5", 2); c.shadowColor = "transparent";
  box(c, -212, -170, 141, 309, palette.burgundy, 0); box(c, -71, -170, 142, 309, "#ded5bf", 0);
  label(c, "PROSPERA", -196, -143, palette.cream); c.fillStyle = palette.cream; c.font = "30px Georgia"; c.fillText("Made to", -196, -58); c.fillText("be seen.", -196, -24);
  c.strokeStyle = "#c9aa6d88"; c.lineWidth = 2; c.beginPath(); c.arc(-140, 84, 49, Math.PI, 0); c.lineTo(-91, 139); c.lineTo(-189, 139); c.stroke();
  text(c, "Our story.", -52, -131, 19, palette.ink, "700");
  for (let j = 0; j < 8; j++) rule(c, -52, -105 + j * 12, j % 3 === 2 ? 65 : 102, "#7e826260");
  box(c, -52, 15, 102, 103, palette.olive, 0); text(c, "A little", -41, 49, 18); text(c, "more clarity.", -41, 72, 14);
  text(c, "What we do.", 90, -131, 17, palette.ink, "700");
  for (let j = 0; j < 3; j++) { box(c, 90, -99 + j * 73, 102, 43, j % 2 ? "#c9aa6d70" : "#a8ac9170", 2); rule(c, 90, -44 + j * 73, 85, "#7e826270"); }
  c.restore();
  c.save(); c.translate(326, 483 + Math.sin(time * .5 + 2) * 5); c.rotate(.1);
  box(c, -110, -59, 220, 116, "#c9aa6d", 3); c.rotate(-.04); shadow(c); box(c, -116, -65, 220, 116, palette.ink, 3); c.shadowColor = "transparent";
  text(c, "PROSPERA", -96, -23, 23, palette.gold, "700"); label(c, "BUILD. GROW. PROSPER.", -96, 24, palette.cream); c.restore();
}

export function createServicePoster(category: number) {
  const index = [0, 1, 4][category];
  const categoryTitles = [["DIGITAL", "PRESENCE."], ["BUSINESS", "SOLUTIONS."], ["CREATIVE &", "BRANDING."]];
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 760;
  const c = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
  const draw = (time: number) => {
    c.clearRect(0, 0, 512, 760); c.fillStyle = backgrounds[index]; c.fillRect(0, 0, 512, 760);
    const light = c.createRadialGradient(420, 80, 0, 250, 300, 580); light.addColorStop(0, "#f1ecdf13"); light.addColorStop(1, "#f1ecdf00"); c.fillStyle = light; c.fillRect(0, 0, 512, 760);
    c.save(); [website, crm, automation, commerce, design][index](c, time); c.restore();
    const ink = index === 1 || index === 4 ? palette.ink : palette.cream;
    label(c, "PROSPERA / DIGITAL STUDIO", 26, 37, ink); label(c, `0${category + 1} / MADE FOR YOUR BUSINESS`, 26, 89, ink);
    categoryTitles[category].forEach((title, line) => { c.fillStyle = line === 1 && index !== 1 && index !== 4 ? palette.gold : ink; c.font = `900 ${index === 4 ? 54 : 60}px Arial`; c.fillText(title, 26, 627 + line * 61, 460); });
    rule(c, 26, 711, 460, `${ink}45`); label(c, "EXPLORE THE SERVICE", 26, 737, ink); text(c, "↗", 463, 739, 22, ink);
    texture.needsUpdate = true;
  };
  draw(0); return { canvas, texture, draw, image: canvas.toDataURL("image/webp", .85) };
}
