import fs from "fs";
import path from "path";

const root = process.cwd();
const filePath = path.join(root, "resort-food.html");
let html = fs.readFileSync(filePath, "utf8");

// --- Meta + hero ---
html = html.replace(
  /<title>San Antonio Resort Food Guide \| Where To Go SA<\/title>/,
  "<title>Resort + Airport Food Nearby | Where To Go SA</title>"
);
html = html.replace(
  /content="Resort-area dinner planning for JW, La Cantera \/ The Rim, Hyatt Hill Country, and more — distance, timing, and appetite-aware picks from Where To Go SA\."/g,
  'content="Resort and airport food near JW, La Cantera, Hyatt Hill Country, SAT, Quarry, and Stone Oak — when to stay close, take a short ride, or make downtown or Pearl the night."'
);
html = html.replace(
  /content="San Antonio Resort Food Guide \| Where To Go SA"/g,
  'content="Resort + Airport Food Nearby | Where To Go SA"'
);
html = html.replace(
  /<p class="eyebrow eyebrow-on-dark eyebrow-hero rf-hero-eyebrow">Resort Food Guide<\/p>\s*<h1 id="rf-hero-heading" class="hero-title">Resort-area dining without the downtown gamble\.<\/h1>\s*<p class="hero-text hero-text-on-dark">For JW Marriott[\s\S]*?<\/p>/,
  `<p class="eyebrow eyebrow-on-dark eyebrow-hero rf-hero-eyebrow">Resort + Airport Food Nearby</p>
            <h1 id="rf-hero-heading" class="hero-title">Eat well near your hotel, resort, or flight path.</h1>
            <p class="hero-text hero-text-on-dark">JW, La Cantera, Hyatt Hill Country, SAT Airport, Quarry, Stone Oak, SeaWorld, Pearl, and downtown &mdash; organized by when to stay close, when to take a short ride, and when the night is worth leaving the area.</p>`
);

// --- Remove bloat sections ---
html = html.replace(
  /\s*<section class="rf-concierge-strip"[\s\S]*?<\/section>\s*<section class="page-jump-band[\s\S]*?<\/section>\s*/,
  "\n"
);
html = html.replace(
  /\s*<section class="rf-appetite-band"[\s\S]*?<\/section>\s*(?=<section class="eat-cat-band rf-zone-band")/,
  "\n"
);
html = html.replace(
  /\s*<section class="rf-proof-band"[\s\S]*?<\/section>\s*(?=<section class="rf-final-cta")/,
  "\n"
);

// --- Decision band ---
html = html.replace(
  /<p class="eyebrow">Start here<\/p>\s*<h2>Choose the food plan before the ride gets messy<\/h2>\s*<p>Most resort nights come down to three choices:[\s\S]*?<\/p>/,
  `<p class="eyebrow">Quick decision</p>
          <h2>Start with the right move</h2>
          <p>Pick the plan that matches your energy, timing, and group &mdash; then jump to your starting zone below.</p>`
);
html = html.replace(/<p class="rf-move-pill">Route [ABC]<\/p>\s*/g, "");
html = html.replace(
  /<h3>Stay close<\/h3>\s*<p>Best when kids are tired[\s\S]*?<p class="meta"><strong>Best for:<\/strong> first night, families, pool days, early mornings\.<\/p>/,
  `<h3>Stay close</h3>
            <p>Use when the group is tired, kids are done, flight timing is tight, pool/spa/golf ran long, or dinner needs to be easy.</p>`
);
html = html.replace(
  /<h3>Take the short upgrade<\/h3>[\s\S]*?<p class="meta"><strong>Best for:<\/strong> business dinners, couples, celebration dinners\.<\/p>/,
  `<h3>Take the short ride</h3>
            <p>Use when nearby has a better dinner, patio, drink, or group option without making it a downtown night.</p>`
);
html = html.replace(
  /<h3>Make it the story<\/h3>[\s\S]*?<p class="meta"><strong>Best for:<\/strong> Soluna[\s\S]*?Pearl dinners\.<\/p>/,
  `<h3>Make it the story</h3>
            <p>Use when downtown, Pearl, River Walk, rooftops, Market Square, Hotel Emma, or a destination dinner is worth the extra ride.</p>`
);

// --- Zone picker header + grid ---
html = html.replace(
  /<p class="eyebrow eyebrow-on-dark">Resort guest desk<\/p>\s*<h2 id="rf-zone-cards-title">Tap your zone first<\/h2>\s*<p class="section-text">Match the hotel zone[\s\S]*?<\/p>/,
  `<p class="eyebrow eyebrow-on-dark">Pick your starting zone</p>
            <h2 id="rf-zone-cards-title">Pick your starting zone</h2>
            <p class="section-text">Match where you are sleeping or landing before you chase downtown.</p>`
);

const zoneGrid = `          <div class="route-card-grid rf-zone-grid" role="list">
            <a href="#rf-zone-airport" class="image-route-card rf-crop--airport" role="listitem">
              <img class="image-route-card__media" src="assets/resort-card-airport-timing-v3.png" alt="San Antonio airport and quick meal timing" width="640" height="400" decoding="async" loading="lazy" />
              <span class="image-route-card__shade" aria-hidden="true"></span>
              <span class="image-route-card__body">
                <span class="eyebrow">Airport / SAT / Quarry</span>
                <h3>Airport / SAT / Quarry</h3>
                <p>Best for late arrivals, early flights, business travelers, before-flight meals, Quarry dining, and North Central quick moves.</p>
                <span class="image-route-card__cta">Jump to airport zone</span>
              </span>
            </a>
            <a href="#rf-zone-jw" class="image-route-card rf-crop--jw" role="listitem">
              <img class="image-route-card__media" src="assets/resort-card-jw-tpc-north-281-v3.png" alt="JW Marriott and Stone Oak resort area" width="640" height="400" decoding="async" loading="lazy" />
              <span class="image-route-card__shade" aria-hidden="true"></span>
              <span class="image-route-card__body">
                <span class="eyebrow">JW Marriott / TPC / Stone Oak</span>
                <h3>JW Marriott / TPC / Stone Oak</h3>
                <p>Beautiful and secluded. Stay on property when convenience matters, then look toward Stone Oak / North 281 for stronger nearby dinner options.</p>
                <span class="image-route-card__cta">Jump to JW zone</span>
              </span>
            </a>
            <a href="#rf-zone-rim" class="image-route-card rf-crop--rim" role="listitem">
              <img class="image-route-card__media" src="assets/resort-card-la-cantera-rim-v3.png" alt="La Cantera and The Rim evening dining" width="640" height="400" decoding="async" loading="lazy" />
              <span class="image-route-card__shade" aria-hidden="true"></span>
              <span class="image-route-card__body">
                <span class="eyebrow">La Cantera / The Rim</span>
                <h3>La Cantera / The Rim</h3>
                <p>Best when shopping, Six Flags, The Rock, Topgolf, Andretti, or polished north-side restaurants are part of the plan.</p>
                <span class="image-route-card__cta">Jump to La Cantera zone</span>
              </span>
            </a>
            <a href="#rf-zone-hyatt" class="image-route-card rf-crop--hyatt" role="listitem">
              <img class="image-route-card__media" src="assets/resort-card-hyatt-hill-country-v3.png" alt="Hyatt Hill Country and SeaWorld resort area" width="640" height="400" decoding="async" loading="lazy" />
              <span class="image-route-card__shade" aria-hidden="true"></span>
              <span class="image-route-card__body">
                <span class="eyebrow">Hyatt Hill Country / SeaWorld</span>
                <h3>Hyatt Hill Country / SeaWorld</h3>
                <p>Best for SeaWorld families, lazy river days, pool fatigue, and easy Far West Side meals.</p>
                <span class="image-route-card__cta">Jump to Hyatt zone</span>
              </span>
            </a>
            <a href="#rf-zone-escape" class="image-route-card rf-crop--story" role="listitem">
              <img class="image-route-card__media" src="assets/resort-card-story-dinner-v3.png" alt="Downtown and Pearl destination dinner night" width="640" height="400" decoding="async" loading="lazy" />
              <span class="image-route-card__shade" aria-hidden="true"></span>
              <span class="image-route-card__body">
                <span class="eyebrow">Downtown / Pearl escape</span>
                <h3>Downtown / Pearl escape</h3>
                <p>Use when the group wants River Walk, rooftop drinks, Market Square, Hotel Emma, Pearl, or a true San Antonio night.</p>
                <span class="image-route-card__cta">Jump to escape guide</span>
              </span>
            </a>
          </div>`.replace(/<motion /g, "<div ").replace(/<\/motion>/g, "</motion>");

// --- Extract and reorder zone sections ---
function extractSection(id) {
  const re = new RegExp(
    `(<section class="rf-zone-detail[^"]*" id="${id}"[\\s\\S]*?<\\/section>)`
  );
  const m = html.match(re);
  if (!m) throw new Error(`Missing: ${id}`);
  html = html.replace(m[1], `<!--PH_${id}-->`);
  return m[1];
}

const jw = extractSection("rf-zone-jw");
const hyatt = extractSection("rf-zone-hyatt");
const rim = extractSection("rf-zone-rim");
extractSection("rf-zone-airport");

const airport = fs.readFileSync(
  path.join(root, "scripts", "resort-food-airport-section.html"),
  "utf8"
);
const downtown = fs.readFileSync(
  path.join(root, "scripts", "resort-food-downtown-section.html"),
  "utf8"
);

html = html.replace(/<section class="rf-story-shell"[\s\S]*?<\/section>\s*/, downtown);

html = html.replace(
  /<div class="route-card-grid rf-zone-grid" role="list">[\s\S]*?<\/div>/,
  zoneGrid
);

html = html.replace(
  /<!--PH_rf-zone-jw-->/,
  `${airport}\n${jw}\n${rim}\n${hyatt}\n`
);
["rf-zone-hyatt", "rf-zone-rim", "rf-zone-airport"].forEach((id) => {
  html = html.replace(new RegExp(`<!--PH_${id}-->\\s*`, "g"), "");
});

// --- Zone headline trims (specific anchors) ---
html = html.replace(
  /<p class="eyebrow">JW Marriott \/ TPC \/ Far North<\/p>\s*<h2>JW Marriott \/ TPC resort-area guide<\/h2>\s*<p class="section-subcopy compact">[\s\S]*?never treat them as the same resort bubble\.<\/p>/,
  `<p class="eyebrow">JW Marriott / TPC / Stone Oak</p>
          <h2>JW Marriott / TPC: stay on property or go Stone Oak</h2>
          <p class="section-subcopy compact">At JW Marriott, nearby dinner usually means the resort itself, TPC Parkway, North 281, or Stone Oak. Downtown is a destination night, not the default nearby dinner. Separate from La Cantera and Hyatt Hill Country.</p>`
);

html = html.replace(
  /<div class="rf-zone-move-band" id="rf-jw-move">\s*<h3>Best nearby dinner move from JW<\/h3>[\s\S]*?<\/div>\s*<\/section>/,
  `<div class="rf-zone-move-band" id="rf-jw-move">
          <h3>Best move from JW</h3>
          <p>Stay on property for convenience. Go Stone Oak / North 281 for a better nearby dinner. Go downtown or Pearl only when the night is worth the ride.</p>
          <div class="hero-cta-row">
            <a class="btn btn-primary" href="/ask/">Ask A Local</a>
            <a class="btn btn-secondary hero-secondary-btn" href="driver-concierge.html#route-operator">Get Route Help</a>
          </div>
        </div>
      </section>`
);

html = html.replace(
  /<p class="eyebrow">La Cantera \/ The Rim \/ northwest<\/p>\s*<h2>La Cantera resort-area guide<\/h2>\s*<p class="section-subcopy compact">[\s\S]*?do not treat them as the same resort bubble\.<\/p>/,
  `<p class="eyebrow">La Cantera / The Rim</p>
          <h2>La Cantera / The Rim: polished food, shopping, and entertainment</h2>
          <p class="section-subcopy compact">La Cantera can carry a full night without downtown. Use it for resort dining, shopping, Six Flags, The Rock, Topgolf, Andretti, and polished north-side dinners. Separate from JW and Hyatt.</p>`
);

html = html.replace(
  /<p class="eyebrow">Hyatt Hill Country \/ SeaWorld \/ Far West Side<\/p>\s*<h2>Hyatt Hill Country \/ SeaWorld resort-area guide<\/h2>\s*<p class="section-subcopy compact">[\s\S]*?never treat them as the same resort bubble\.<\/p>/,
  `<p class="eyebrow">Hyatt Hill Country / SeaWorld</p>
          <h2>Hyatt Hill Country / SeaWorld: family-first resort logic</h2>
          <p class="section-subcopy compact">Hyatt Hill Country is its own zone near SeaWorld / Westover Hills / Far West Side. Do not merge it with JW or La Cantera.</p>`
);

html = html.replace(
  /\s*<div class="rf-zone-move-band" id="rf-hyatt-nearby-move">[\s\S]*?<\/motion>\s*<section class="rf-activity-band" id="rf-hyatt-things"/,
  `\n        <section class="rf-activity-band" id="rf-hyatt-things"`
);
html = html.replace(
  /\s*<motion class="rf-zone-move-band" id="rf-hyatt-nearby-move">[\s\S]*?<\/div>\s*<section class="rf-activity-band" id="rf-hyatt-things"/,
  `\n        <section class="rf-activity-band" id="rf-hyatt-things"`
);
html = html.replace(
  /\s*<div class="rf-zone-move-band" id="rf-hyatt-nearby-move">[\s\S]*?<\/motion>\s*<section class="rf-activity-band" id="rf-hyatt-things"/,
  `\n        <section class="rf-activity-band" id="rf-hyatt-things"`
);
html = html.replace(
  /\s*<div class="rf-zone-move-band" id="rf-hyatt-nearby-move">[\s\S]*?<\/div>\s*<section class="rf-activity-band" id="rf-hyatt-things"/,
  `\n        <section class="rf-activity-band" id="rf-hyatt-things"`
);

html = html.replace(
  /\s*<div class="rf-lane-grid rf-lane-grid--2" id="rf-hyatt-summaries">[\s\S]*?<\/div>\s*<div class="rf-zone-move-band" id="rf-hyatt-move">/,
  `\n        <div class="rf-zone-move-band" id="rf-hyatt-move">`
);

html = html.replace(
  /<div class="rf-zone-move-band" id="rf-hyatt-move">\s*<p>Not sure whether to stay near Hyatt[\s\S]*?<\/p>/,
  `<div class="rf-zone-move-band" id="rf-hyatt-move">
          <h3>Best move near Hyatt</h3>
          <p>Stay near Hyatt after a long SeaWorld, pool, or family day. Use downtown or Pearl only when the group wants a bigger San Antonio night and has enough energy for the ride.</p>`
);

// Remove Six Flags + La Cantera Shops + downtown card from Hyatt activities only
html = html.replace(
  /(<section class="rf-zone-detail rf-zone-detail--hyatt"[\s\S]*?<div class="rf-activity-grid">)([\s\S]*?)(<\/div>\s*<\/section>\s*<div class="rf-zone-move-band" id="rf-hyatt-move">)/,
  (full, start, grid, end) => {
    let g = grid;
    g = g.replace(
      /<article class="rf-activity-card">\s*<span class="rf-activity-google">Google: 4\.6 ★ · 31K reviews<\/span>[\s\S]*?<\/article>\s*/,
      ""
    );
    g = g.replace(
      /<article class="rf-activity-card">\s*<span class="rf-activity-google">Google: 4\.7 ★ · 11K reviews<\/span>[\s\S]*?<\/article>\s*/,
      ""
    );
    g = g.replace(
      /<article class="rf-activity-card rf-activity-card--wide">\s*<span class="rf-activity-google">Google: 4\.7 ★ · 74K reviews<\/span>[\s\S]*?<\/article>\s*/,
      ""
    );
    return start + g + end;
  }
);

html = html.replace(
  /<h2 id="rf-final-heading">Want the easiest food route from your hotel\?<\/h2>\s*<p>Tell us your resort[\s\S]*?<\/p>/,
  `<h2 id="rf-final-heading">Ask A Local or get route help</h2>
        <p>Tell us your hotel zone, party size, timing, and dinner mood. We&rsquo;ll help you pick stay close, short ride, or story night before traffic or flight timing decides for you.</p>`
);

html = html.replace(/<motion /g, "<div ");
html = html.replace(/<\/motion>/g, "</div>");

fs.writeFileSync(filePath, html);
console.log("OK");
