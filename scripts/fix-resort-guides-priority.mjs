import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "resort-food.html");
let html = fs.readFileSync(filePath, "utf8");

/** Extract a top-level rf-zone-detail block (handles nested <section> activity bands). */
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

const airport = extractZone("rf-zone-airport");
const jw = extractZone("rf-zone-jw");
const rim = extractZone("rf-zone-rim");
const hyatt = extractZone("rf-zone-hyatt");

const zoneCluster =
  /<!--PH_rf-zone-airport-->[\s\S]*?<!--PH_rf-zone-hyatt-->/;
if (!zoneCluster.test(html)) {
  throw new Error("Zone placeholders not found");
}
html = html.replace(zoneCluster, `${rim}\n\n${jw}\n\n${hyatt}\n\n${airport}`);
html = html.replace(/<!--PH_rf-zone-\w+-->\s*/g, "");

fs.writeFileSync(filePath, html);
console.log("OK: zone sections reordered with balanced parsing");
