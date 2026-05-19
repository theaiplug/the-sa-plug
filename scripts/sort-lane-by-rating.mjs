import fs from "fs";
import path from "path";

const laneId = process.argv[2] || "lane-drinks";
const filePath = path.join(process.cwd(), "where-to-eat.html");
const html = fs.readFileSync(filePath, "utf8");

const laneStart = html.indexOf(`id="${laneId}"`);
if (laneStart === -1) throw new Error(`Lane ${laneId} not found`);

const gridStart = html.indexOf('class="eat-lane-grid', laneStart);
if (gridStart === -1) throw new Error("Grid not found");

const gridTagEnd = html.indexOf(">", gridStart) + 1;
const chooseStrip = html.indexOf('class="eat-choose-strip"', gridStart);
if (chooseStrip === -1) throw new Error("eat-choose-strip not found");

const gridInner = html.slice(gridTagEnd, chooseStrip);
const gridCloseIdx = gridInner.lastIndexOf("</motion>");
const gridCloseFinal = gridCloseIdx === -1 ? gridInner.lastIndexOf("</div>") : gridCloseIdx;
const cardsHtml = gridInner.slice(0, gridCloseFinal);

const articleRe = /<article class="card[\s\S]*?<\/article>/g;
const articles = cardsHtml.match(articleRe);
if (!articles?.length) throw new Error("No articles found");

function parseRating(article) {
  const pill = article.match(/eat-google-pill">([^<]+)</)?.[1] || "";
  const m = pill.match(/(\d\.\d)\s*★/);
  return m ? parseFloat(m[1]) : 0;
}

function parseReviews(article) {
  const pill = article.match(/eat-google-pill">([^<]+)</)?.[1] || "";
  const m = pill.match(/([\d.]+)K?\s+reviews/i);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  if (/K\s+reviews/i.test(pill)) n *= 1000;
  return n;
}

function parseName(article) {
  return article.match(/<h3>([^<]+)/)?.[1]?.replace(/&rsquo;/g, "'") || "?";
}

articles.sort((a, b) => {
  const dr = parseRating(b) - parseRating(a);
  if (dr !== 0) return dr;
  return parseReviews(b) - parseReviews(a);
});

const sortedInner = "\n          " + articles.join("\n          ") + "\n        ";
const newHtml =
  html.slice(0, gridTagEnd) + sortedInner + html.slice(gridTagEnd + gridCloseFinal);

fs.writeFileSync(filePath, newHtml);
console.log(`OK: sorted ${articles.length} cards in #${laneId}:`);
for (const a of articles) {
  console.log(`  ${parseRating(a).toFixed(1)} — ${parseName(a)}`);
}
