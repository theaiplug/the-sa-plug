import fs from "fs";

const p = "resort-food.html";
let h = fs.readFileSync(p, "utf8");

const reps = [
  ["Quick decision", "How to plan your nights"],
  ["Start with the right move", "Stay close, take a short ride, or make it the story"],
  [
    "Pick the plan that matches your energy, timing, and group &mdash; then jump to your starting zone below.",
    "Most resort nights come down to three choices. Pick yours, then choose your hotel zone below.",
  ],
  [
    '<p class="eyebrow eyebrow-on-dark">Pick your starting zone</p>\n            <h2 id="rf-zone-cards-title">Pick your starting zone</h2>',
    '<p class="eyebrow eyebrow-on-dark">Start here</p>\n            <h2 id="rf-zone-cards-title">Choose your resort area</h2>',
  ],
  ["Jump to airport zone", "Open airport guide"],
  ["Jump to JW zone", "Open JW / Stone Oak guide"],
  ["Jump to La Cantera zone", "Open La Cantera guide"],
  ["Jump to Hyatt zone", "Open Hyatt guide"],
  ["Jump to escape guide", "Stay nearby or go downtown"],
  ['href="#rf-zone-escape"', 'href="#rf-stay-vs-downtown"'],
  ['id="rf-zone-escape"', 'id="rf-stay-vs-downtown"'],
  ['<p class="eyebrow">Downtown / Pearl escape</p>', '<p class="eyebrow">Stay nearby or go downtown</p>'],
  [
    "<h2>When downtown or Pearl is worth leaving the hotel zone</h2>",
    "<h2>Stay nearby or make downtown / Pearl the night</h2>",
  ],
  ["Restaurants near SAT / Quarry", "Food nearby — SAT / Quarry"],
  ["On-property dining at JW Marriott", "Food nearby — on property at JW Marriott"],
  [
    "Nearby dinner &mdash; Stone Oak / North 281 / TPC Parkway",
    "Food nearby — Stone Oak / North 281",
  ],
  ["La Cantera dining picks", "Food nearby — La Cantera"],
  ["On-property dining at Hyatt Hill Country", "Food nearby — on property at Hyatt Hill Country"],
  ["Nearby food outside Hyatt Hill Country", "Food nearby — outside Hyatt Hill Country"],
  ["Bars &amp; lounges at Hyatt Hill Country", "Drinks nearby — Hyatt Hill Country"],
  ["Bars / drinks near SAT", "Drinks nearby — SAT"],
  ["North Central corridor", "North Central area"],
  ["airport corridor", "airport area"],
  ["Quarry dining corridor", "Quarry dining area"],
  ["Get Route Help", "Get route help"],
  ['<a href="resort-food.html">Resort Food</a>', '<a href="resort-food.html">Resort Guides</a>'],
  ["Ask A Local or get route help", "Need help choosing?"],
  [
    "Built from real San Antonio routes and local experience",
    "Built from real San Antonio plans and local experience",
  ],
];

for (const [a, b] of reps) {
  h = h.split(a).join(b);
}

if (!h.includes("rf-resort-areas-title")) {
  h = h.replace(
    /(\s*)<section class="rf-zone-detail rf-zone-detail--airport"/,
    `$1<header class="rf-areas-intro section-lead" id="rf-resort-areas" aria-labelledby="rf-resort-areas-title">
        <p class="eyebrow">Resort areas</p>
        <h2 id="rf-resort-areas-title">Guides by hotel zone</h2>
        <p class="section-subcopy compact">Each zone covers what to do nearby, where to eat, and the best move for your night &mdash; without treating every north-side hotel like the same bubble.</p>
      </header>
$1<section class="rf-zone-detail rf-zone-detail--airport"`
  );
}

if (!h.includes(".rf-areas-intro")) {
  h = h.replace(
    ".resort-food-page .rf-zone-move-band .hero-cta-row {",
    `.resort-food-page .rf-areas-intro {
      margin: clamp(2rem, 4vw, 2.75rem) 0 0;
      padding-top: clamp(1.5rem, 3vw, 2rem);
      border-top: 1px solid rgba(255, 246, 230, 0.1);
    }

    .resort-food-page .rf-zone-move-band .hero-cta-row {`
  );
}

h = h.replace(
  'aria-label="San Antonio airport and Quarry dining corridor"',
  'aria-label="San Antonio airport and Quarry dining area"'
);

h = h.replace(/<motion /g, "<div ");

fs.writeFileSync(p, h);
console.log("OK", fs.readFileSync(p, "utf8").length);
