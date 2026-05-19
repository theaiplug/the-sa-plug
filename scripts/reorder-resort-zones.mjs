import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "resort-food.html");
let html = fs.readFileSync(filePath, "utf8");

function extractZone(id) {
  const openRe = new RegExp(
    `<section class="rf-zone-detail[^"]*" id="${id}"[^>]*>`
  );
  const openMatch = html.match(openRe);
  if (!openMatch) throw new Error(`Missing zone ${id}`);
  const start = html.indexOf(openMatch[0]);
  let i = start + openMatch[0].length;
  let depth = 1;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf("<section", i);
    const nextClose = html.indexOf("</section>", i);
    if (nextClose === -1) throw new Error(`Unclosed zone ${id}`);
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + 8;
    } else {
      depth -= 1;
      i = nextClose + 10;
    }
  }
  const block = html.slice(start, i);
  html = html.slice(0, start) + `<!--PH_${id}-->` + html.slice(i);
  return block;
}

// Bottom-up extraction
const airport = extractZone("rf-zone-airport");
const downtown = extractZone("rf-stay-vs-downtown");
const hyatt = extractZone("rf-zone-hyatt");
const rim = extractZone("rf-zone-rim");
const jw = extractZone("rf-zone-jw");

const cluster = /<!--PH_rf-zone-jw-->[\s\S]*?<!--PH_rf-zone-airport-->/;
if (!cluster.test(html)) {
  throw new Error("Zone placeholders not found");
}

const areasIntro = `      <header class="rf-areas-intro section-lead" id="rf-resort-areas" aria-labelledby="rf-resort-areas-title">
        <p class="eyebrow">Resort areas</p>
        <h2 id="rf-resort-areas-title">Guides by hotel zone</h2>
        <p class="section-subcopy compact">JW Marriott, La Cantera, and Hyatt Hill Country each play differently &mdash; food, things to do, and the best move for your night. Downtown / Pearl and flight-timing help are farther down when you need them.</p>
      </header>

`;

html = html.replace(
  cluster,
  `${areasIntro}${jw}\n\n${rim}\n\n${hyatt}\n\n${downtown}\n\n${airport}`
);

fs.writeFileSync(filePath, html);
console.log("OK: zones reordered jw → rim → hyatt → downtown → airport");
