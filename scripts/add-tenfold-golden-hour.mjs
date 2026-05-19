import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "where-to-eat.html");
let html = fs.readFileSync(filePath, "utf8");

if (html.includes("<h3>Tenfold Rooftop</h3>")) {
  console.log("Tenfold already present");
  process.exit(0);
}

const tenfoldCard = `          <article class="card pink eat-guide-card eat-rec-card eat-card eat-rec-card--premium restaurant-card eat-rec--accent-plum">
            <div class="eat-rec-card__inner">
              <div class="eat-rec-card__rating-row">
                <span class="eat-google-pill">Google: 4.8 ★ · 1.5K reviews</span>
                <div class="eat-rec-card__rating-trust"><span class="eat-proof-pill">Top-rated rooftop</span></motion>
              </div>
              <h3>Tenfold Rooftop</h3>
              <div class="eat-zone-chips"><span class="eat-chip">Rooftop lounge</span><span class="eat-chip is-price">$20–$40</span></div>
              <p class="eat-guide-meta"><strong>Zone:</strong> Downtown / South Alamo</p>
              <p class="eat-rec-desc">Open-terrace skyline drinks with mezcal, tequila, and small plates — the strongest Google-rated downtown rooftop when the view and cocktail room are the main event.</p>
              <p class="eat-rec-best"><strong>Best for:</strong> sunset skyline drinks, post-dinner finishes, hotel guests nearby, DJ energy on busy nights.</p>
            </div>
          </article>
`;

const marker = '        <div class="eat-lane-grid eat-lane-grid--2">\n';
const laneIdx = html.indexOf('id="lane-drinks"');
const idx = html.indexOf(marker, laneIdx);
if (idx === -1) throw new Error("lane-drinks grid not found");

const card = tenfoldCard.replace(
  '<div class="eat-rec-card__rating-trust"><span class="eat-proof-pill">Top-rated rooftop</span></motion>',
  '<div class="eat-rec-card__rating-trust"><span class="eat-proof-pill">Top-rated rooftop</span></div>'
);

html = html.slice(0, idx + marker.length) + card + html.slice(idx + marker.length);

html = html.replace(
  /<p><strong>Quick guide:<\/strong> Dress-up skyline/,
  "<p><strong>Quick guide:</strong> Skyline-first &rarr; Tenfold. Dress-up skyline"
);

fs.writeFileSync(filePath, html);
console.log("OK: added Tenfold to Golden hour");
