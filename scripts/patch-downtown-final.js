const fs = require("fs");
const path = require("path");
const htmlPath = path.join(__dirname, "..", "downtown.html");
let html = fs.readFileSync(htmlPath, "utf8");

function moveArticle(html, id, beforeId) {
  const re = new RegExp(
    `            <article class="dt-act-card" data-dt-dining="${id}">[\\s\\S]*?</article>\\n`,
    "m"
  );
  const m = html.match(re);
  if (!m) return html;
  let out = html.replace(m[0], "");
  const anchor = `data-dt-dining="${beforeId}"`;
  const idx = out.indexOf(anchor);
  if (idx === -1) return html;
  const insertAt = out.lastIndexOf("<article", idx);
  return out.slice(0, insertAt) + m[0] + out.slice(insertAt);
}

// Dinner order: bohanans, biga, pinkertons, paesanos, domingo, boudros, mi-tierra, schilos, esquire, chart-house, casa-rio
html = moveArticle(html, "pinkertons", "paesanos");
html = moveArticle(html, "mi-tierra", "schilos");

// Moon's Daughter -> rooftops before Rosario's
const moonRe =
  /            <article class="dt-act-card" data-dt-dining="moons-daughter">[\s\S]*?<\/article>\n/;
const moonM = html.match(moonRe);
if (moonM) {
  html = html.replace(moonM[0], "");
  const anchor = 'data-dt-dining="rosarios-rooftop"';
  const idx = html.indexOf(anchor);
  if (idx !== -1) {
    const insertAt = html.lastIndexOf("<article", idx);
    html = html.slice(0, insertAt) + moonM[0] + html.slice(insertAt);
  }
}

html = html.replace(
  /<h2 id="dt-dining-heading">[^<]+<\/h2>\s*<p class="dt-guide-intro">[\s\S]*?<\/p>/,
  `<h2 id="dt-dining-heading">Downtown dinner picks + nightlife</h2>
          <p class="dt-guide-intro">Curated owner-ranked tables and drinks — not every River Walk sign. Pick dinner first, then one rooftop or bar in the same area.</p>`
);

html = html.replace(
  /id="dt-cat-restaurants">Downtown restaurants/,
  'id="dt-cat-restaurants">Downtown dinner picks'
);

html = html.replace(
  /(<article class="dt-act-card" data-dt-dining="casa-rio">[\s\S]*?<p class="dt-act-read">)[\s\S]*?(<p class="dt-act-best">)/,
  "$1Classic River Walk photo and history stop — colorful umbrellas and easy patio energy. Not a top food-first pick.$2"
);

html = html.replace(
  /(<article class="dt-act-card" data-dt-dining="chart-house">[\s\S]*?<p class="dt-act-read">)[\s\S]*?(<p class="dt-act-best">)/,
  "$1View-first dinner at the Tower — use when the skyline experience matters more than top food ratings.$2"
);

html = html.replace(
  /<p class="dt-guide-intro">The Pearl is a reimagined[\s\S]*?River Walk bends\.<\/p>/,
  `<p class="dt-guide-intro"><strong>The Pearl is the polished food-and-stroll move just north of downtown</strong> — better when you want strong restaurants, cocktails, walking, and atmosphere without the busiest River Walk crowd.</p>`
);

html = html.replace(
  /Willie Approved luxury cocktails and lounge energy at Hotel Emma — the Pearl drinks move when dinner is already set\./,
  "Willie Approved Hotel Emma lounge — premium cocktails and fermentation-tank booths. One of the highest-priority Pearl nightlife picks."
);

if (!html.includes('id="dt-culture-loop"')) {
  const block = fs.readFileSync(
    path.join(__dirname, "downtown-culture-convention.html"),
    "utf8"
  );
  html = html.replace(
    /    <section class="dt-food-strip"/,
    block + '\n    <section class="dt-food-strip"'
  );
}

if (!html.includes(">Savor<")) {
  const extra = `
            <article class="dt-act-card">
              <h4>Savor</h4>
              <span class="dt-act-google">Google: 4.5 ★ · 350 reviews</span>
              <p class="dt-act-read">CIA student-run restaurant — insider foodie pick.</p>
              <p class="dt-act-best"><strong>Best for:</strong> foodies, affordable fine dining.</p>
            </article>
            <article class="dt-act-card">
              <h4>Boiler House Texas Grill &amp; Wine Garden</h4>
              <span class="dt-act-google">Google: 4.3 ★ · 2.4K reviews</span>
              <p class="dt-act-read">Industrial steak, wine, and brunch.</p>
              <p class="dt-act-best"><strong>Best for:</strong> groups wanting steak or brunch at the Pearl.</p>
            </article>
            <article class="dt-act-card">
              <h4>Pullman Market</h4>
              <span class="dt-act-google">Google: 4.5 ★ · 650 reviews</span>
              <p class="dt-act-read">Large culinary market — best for groups with mixed tastes.</p>
            </article>
            <article class="dt-act-card">
              <h4>Blue Box Bar</h4>
              <span class="dt-act-google">Google: 4.4 ★ · 550 reviews</span>
              <p class="dt-act-read">Casual cocktail bar, happy hour, local patio feel.</p>
              <p class="dt-act-best"><strong>Best for:</strong> relaxed Pearl drinks.</p>
            </article>
`;
  html = html.replace(
    /(<article class="dt-act-card">\s*<h4>Jazz, TX<\/h4>[\s\S]*?<\/article>\n)(\s*<\/div>\s*<\/section>\s*<section class="dt-cat-band" aria-labelledby="dt-cat-pearl-do">)/,
    "$1" + extra + "$2"
  );
}

html = html.replace(/for a cleaner route before/g, "for a cleaner plan before");

// Add Esquire to bars section header area - Esquire stays in dinner; bars have Downstairs + Bar 414 + note
html = html.replace(
  /<h3 class="dt-cat-title" id="dt-cat-bars">Downtown bars, lounges, and speakeasies<\/h3>\s*<p class="dt-guide-intro" style="margin-bottom:12px;">Use these after dinner/,
  `<h3 class="dt-cat-title" id="dt-cat-bars">Rooftops, bars, and nightlife</h3>
          <p class="dt-guide-intro" style="margin-bottom:12px;">After dinner: Esquire for historic gastropub energy, Downstairs for speakeasy mood, Bar 414 for blues and classic cocktails. See dinner picks for Esquire as a moody dinner-and-drinks room.`
);

// Fix Aleteo title per user spec
html = html.replace(
  /<h4>Aleteo at The Monarch San Antonio<\/h4>/,
  "<h4>Aleteo at The Monarch</h4>"
);

// Rosario's rating note
html = html.replace(
  /Rating reflects main venue unless a rooftop-specific listing exists\./,
  "Rating from main venue — high-energy Southtown rooftop."
);

fs.writeFileSync(htmlPath, html);
console.log("Done");
