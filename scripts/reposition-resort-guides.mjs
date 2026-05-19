import fs from "fs";
import path from "path";

const root = process.cwd();
const filePath = path.join(root, "resort-food.html");
let html = fs.readFileSync(filePath, "utf8");

const metaDesc =
  "Resort guides for JW Marriott, La Cantera, Hyatt Hill Country, SAT Airport, and north-side stays — food, things to do, timing, and when to stay close vs. head downtown or Pearl.";

html = html.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>San Antonio Resort Guides | Where To Go SA</title>"
);
html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${metaDesc}" />`);
html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, '<meta property="og:title" content="San Antonio Resort Guides | Where To Go SA" />');
html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${metaDesc}" />`);
html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, '<meta name="twitter:title" content="San Antonio Resort Guides | Where To Go SA" />');
html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${metaDesc}" />`);

html = html.replace(
  /<a href="resort-food\.html" aria-current="page">Resort Food<\/a>/,
  '<a href="resort-food.html" aria-current="page">Resort Guides</a>'
);

html = html.replace(
  /<p class="eyebrow eyebrow-on-dark eyebrow-hero rf-hero-eyebrow">Resort \+ Airport Food Nearby<\/p>\s*<h1 id="rf-hero-heading" class="hero-title">Eat well near your hotel, resort, or flight path\.<\/h1>\s*<p class="hero-text hero-text-on-dark">[\s\S]*?<\/p>\s*<div class="hero-cue-grid" aria-label="Who this guide fits">[\s\S]*?<\/motion>\s*<div class="hero-cta-row">[\s\S]*?<\/motion>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  `<p class="eyebrow eyebrow-on-dark eyebrow-hero rf-hero-eyebrow">Resort Guides</p>
            <h1 id="rf-hero-heading" class="hero-title">Plan your resort stay without guessing the drive.</h1>
            <p class="hero-text hero-text-on-dark">JW Marriott, La Cantera, Hyatt Hill Country, SAT Airport, and north-side hotel zones &mdash; food, things to do, family logistics, and when to stay close vs. make downtown or Pearl the night.</p>
            <div class="hero-cue-grid" aria-label="Who this guide fits">
              <motion class="hero-cue"><span aria-hidden="true"></span><strong>Resort guests</strong></div>
              <div class="hero-cue"><span aria-hidden="true"></span><strong>Families</strong></div>
              <div class="hero-cue"><span aria-hidden="true"></span><strong>Business travelers</strong></div>
              <div class="hero-cue"><span aria-hidden="true"></span><strong>Airport timing</strong></div>
            </div>
            <div class="hero-cta-row">
              <a class="btn btn-primary" href="#rf-resort-guest-desk">Find my resort area</a>
              <a class="btn btn-secondary hero-secondary-btn" href="#rf-zone-jw">See nearby food picks</a>
              <a class="btn btn-secondary hero-secondary-btn" href="/ask/">Ask A Local</a>
            </div>
          </div>
        </div>
      </div>`
);

html = html.replace(
  /<div class="hero-cue-grid" aria-label="Who this guide fits">[\s\S]*?<div class="hero-cta-row">[\s\S]*?<\/div>\s*<\/motion>\s*<\/div>\s*<\/div>\s*<\/div>/,
  (block) => {
    if (block.includes("Find my resort area")) return block;
    return `<div class="hero-cue-grid" aria-label="Who this guide fits">
              <div class="hero-cue"><span aria-hidden="true"></span><strong>Resort guests</strong></div>
              <div class="hero-cue"><span aria-hidden="true"></span><strong>Families</strong></div>
              <div class="hero-cue"><span aria-hidden="true"></span><strong>Business travelers</strong></div>
              <div class="hero-cue"><span aria-hidden="true"></span><strong>Airport timing</strong></motion>
            </div>
            <div class="hero-cta-row">
              <a class="btn btn-primary" href="#rf-resort-guest-desk">Find my resort area</a>
              <a class="btn btn-secondary hero-secondary-btn" href="#rf-zone-jw">See nearby food picks</a>
              <a class="btn btn-secondary hero-secondary-btn" href="/ask/">Ask A Local</a>
            </div>
          </motion>
        </div>
      </div>`;
  }
);

html = html.replace(/<motion /g, "<div ");
html = html.replace(/<\/motion>/g, "</div>");

html = html.replace(
  /<p class="eyebrow">Quick decision<\/p>\s*<h2>Start with the right move<\/h2>\s*<p>Pick the plan that matches your energy, timing, and group &mdash; then jump to your starting zone below\.<\/p>/,
  `<p class="eyebrow">How to plan your nights</p>
          <h2>Stay close, take a short ride, or make it the story</h2>
          <p>Most resort nights come down to three choices. Pick yours, then choose your hotel zone below.</p>`
);

html = html.replace(
  /<p class="eyebrow eyebrow-on-dark">Pick your starting zone<\/p>\s*<h2 id="rf-zone-cards-title">Pick your starting zone<\/h2>\s*<p class="section-text">Match where you are sleeping or landing before you chase downtown\.<\/p>/,
  `<p class="eyebrow eyebrow-on-dark">Start here</p>
            <h2 id="rf-zone-cards-title">Choose your resort area</h2>
            <p class="section-text">Match where you are sleeping or landing before you chase downtown.</p>`
);

const cardCtas = [
  ["Jump to airport zone", "Open airport guide"],
  ["Jump to JW zone", "Open JW / Stone Oak guide"],
  ["Jump to La Cantera zone", "Open La Cantera guide"],
  ["Jump to Hyatt zone", "Open Hyatt guide"],
  ["Jump to escape guide", "Stay nearby or go downtown"],
];
for (const [from, to] of cardCtas) {
  html = html.replaceAll(from, to);
}

if (!html.includes("rf-resort-areas-title")) {
  html = html.replace(
    /(\s*)<section class="rf-zone-detail rf-zone-detail--airport"/,
    `$1<header class="rf-areas-intro section-lead" id="rf-resort-areas" aria-labelledby="rf-resort-areas-title">
        <p class="eyebrow">Resort areas</p>
        <h2 id="rf-resort-areas-title">Guides by hotel zone</h2>
        <p class="section-subcopy compact">Each zone covers what to do nearby, where to eat, and the best move for your night &mdash; without treating every north-side hotel like the same bubble.</p>
      </header>
$1<section class="rf-zone-detail rf-zone-detail--airport"`
  );
}

const foodRenames = [
  ["Restaurants near SAT / Quarry", "Food nearby — SAT / Quarry"],
  ["On-property dining at JW Marriott", "Food nearby — on property at JW Marriott"],
  ["Nearby dinner &mdash; Stone Oak / North 281 / TPC Parkway", "Food nearby — Stone Oak / North 281"],
  ["La Cantera dining picks", "Food nearby — La Cantera"],
  ["On-property dining at Hyatt Hill Country", "Food nearby — on property at Hyatt Hill Country"],
  ["Nearby food outside Hyatt Hill Country", "Food nearby — outside Hyatt Hill Country"],
  ["Bars &amp; lounges at Hyatt Hill Country", "Drinks nearby — Hyatt Hill Country"],
  ["Bars / drinks near SAT", "Drinks nearby — SAT"],
];
for (const [from, to] of foodRenames) {
  html = html.replaceAll(from, to);
}

html = html.replace(
  /<section class="rf-zone-detail rf-zone-detail--escape" id="rf-zone-escape">\s*<div class="section-lead">\s*<p class="eyebrow">Downtown \/ Pearl escape<\/p>\s*<h2>When downtown or Pearl is worth leaving the hotel zone<\/h2>/,
  `<section class="rf-zone-detail rf-zone-detail--escape" id="rf-stay-vs-downtown">
        <div class="section-lead">
          <p class="eyebrow">Stay nearby or go downtown</p>
          <h2>Stay nearby or make downtown / Pearl the night</h2>`
);

html = html.replaceAll('href="#rf-zone-escape"', 'href="#rf-stay-vs-downtown"');

html = html.replaceAll(
  '<a class="btn btn-secondary hero-secondary-btn" href="driver-concierge.html#route-operator">Get Route Help</a>',
  '<a class="btn btn-secondary hero-secondary-btn" href="driver-concierge.html#route-operator">Get route help</a>'
);

html = html.replace(
  /<h2 id="rf-final-heading">Ask A Local or get route help<\/h2>\s*<p>Tell us your hotel zone[\s\S]*?<\/p>/,
  `<h2 id="rf-final-heading">Need help choosing?</h2>
        <p>Tell us your hotel zone, party size, timing, and dinner mood. We&rsquo;ll help you pick stay close, short ride, or story night before traffic or flight timing decides for you.</p>`
);

html = html.replaceAll("North Central corridor", "North Central area");
html = html.replaceAll("airport corridor", "airport area");
html = html.replaceAll("Quarry dining corridor", "Quarry dining area");
html = html.replaceAll(
  'aria-label="San Antonio airport and Quarry dining corridor"',
  'aria-label="San Antonio airport and Quarry dining area"'
);

html = html.replaceAll(
  '<a href="resort-food.html">Resort Food</a>',
  '<a href="resort-food.html">Resort Guides</a>'
);
html = html.replace(
  "Built from real San Antonio routes and local experience",
  "Built from real San Antonio plans and local experience"
);

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

const placeholder = /<!--PH_rf-zone-airport-->\s*<!--PH_rf-zone-jw-->\s*<!--PH_rf-zone-rim-->\s*<!--PH_rf-zone-hyatt-->/;
if (placeholder.test(html)) {
  html = html.replace(placeholder, `${rim}\n${jw}\n${hyatt}\n${airport}`);
} else {
  html = html.replace(
    /(<!--PH_rf-zone-\w+-->\s*){4}/,
    `${rim}\n${jw}\n${hyatt}\n${airport}`
  );
}
html = html.replace(/<!--PH_rf-zone-\w+-->\s*/g, "");

if (!html.includes(".rf-areas-intro")) {
  html = html.replace(
    ".resort-food-page .rf-zone-move-band .hero-cta-row {",
    `.resort-food-page .rf-areas-intro {
      margin: clamp(2rem, 4vw, 2.75rem) 0 0;
      padding-top: clamp(1.5rem, 3vw, 2rem);
      border-top: 1px solid rgba(255, 246, 230, 0.1);
    }

    .resort-food-page .rf-zone-move-band .hero-cta-row {`
  );
}

fs.writeFileSync(filePath, html);
console.log("OK");
