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

const rim = extractZone("rf-zone-rim");
const jw = extractZone("rf-zone-jw");
const cluster = /<!--PH_rf-zone-rim-->\s*<!--PH_rf-zone-jw-->/;
if (!cluster.test(html)) {
  throw new Error("Expected rim then jw placeholders");
}
html = html.replace(cluster, `${jw}\n\n${rim}`);
fs.writeFileSync(filePath, html);
console.log("OK: JW section now before La Cantera");
