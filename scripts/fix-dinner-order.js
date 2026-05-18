const fs = require("fs");
const path = require("path");
const htmlPath = path.join(__dirname, "..", "downtown.html");
let html = fs.readFileSync(htmlPath, "utf8");

const start = html.indexOf('id="dt-cat-restaurants">');
const end = html.indexOf('id="dt-cat-rooftops">');
if (start === -1 || end === -1) {
  console.error("markers missing");
  process.exit(1);
}

const before = html.slice(0, start);
const section = html.slice(start, end);
const after = html.slice(end);

const articleRe = /<article class="dt-act-card"[\s\S]*?<\/article>/g;
const articles = section.match(articleRe) || [];
const byId = {};
for (const a of articles) {
  const m = a.match(/data-dt-dining="([^"]+)"/);
  if (m) byId[m[1]] = a.replace(/^[\s]+/m, "            ");
}

const order = [
  "bohanans",
  "biga",
  "pinkertons",
  "paesanos",
  "domingo",
  "boudros",
  "mi-tierra",
  "schilos",
  "esquire",
  "chart-house",
  "casa-rio",
];

const bandHead = section.match(/^[\s\S]*?<div class="dt-act-grid">/)[0];
const newSection =
  bandHead +
  "\n" +
  order
    .filter((id) => byId[id])
    .map((id) => byId[id])
    .join("\n") +
  "\n          </div>\n        </section>\n\n        ";

fs.writeFileSync(htmlPath, before + newSection + after);
console.log("Dinner order fixed");
