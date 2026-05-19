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

const airport = extractZone("rf-zone-airport");
const downtown = extractZone("rf-stay-vs-downtown");

const pair = /<!--PH_rf-zone-airport-->[\s\S]*?<!--PH_rf-stay-vs-downtown-->/;
if (!pair.test(html)) {
  throw new Error("Expected airport then downtown placeholders");
}
html = html.replace(pair, `${downtown}\n\n${airport}`);

html = html.replace(/<!--PH_rf-zone-airport-->\s*/g, "");
html = html.replace(/<!--PH_rf-stay-vs-downtown-->\s*/g, "");

const cardRe =
  /(            <a href="#rf-zone-airport" class="image-route-card rf-crop--airport rf-zone-card--support"[\s\S]*?            <\/a>\s*)(            <a href="#rf-stay-vs-downtown" class="image-route-card rf-crop--story"[\s\S]*?            <\/a>)/;
const cardMatch = html.match(cardRe);
if (!cardMatch) throw new Error("Zone cards not found in expected order");
html = html.replace(cardRe, `$2\n$1`);

fs.writeFileSync(filePath, html);
console.log("OK: downtown before airport (cards + detail sections)");
