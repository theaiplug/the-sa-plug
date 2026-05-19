import fs from "fs";
import path from "path";

const root = process.cwd();
const files = [
  "index.html",
  "start-here.html",
  "where-to-eat.html",
  "downtown.html",
  "summer-family.html",
  "business-services.html",
  "driver-concierge.html",
  "ask/index.html",
];

for (const rel of files) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) continue;
  let h = fs.readFileSync(fp, "utf8");
  h = h.replace(/<a href="(\.\.\/)?resort-food\.html">Resort Food<\/a>/g, (m) =>
    m.replace("Resort Food", "Resort Guides")
  );
  fs.writeFileSync(fp, h);
}

// index.html specific
let index = fs.readFileSync(path.join(root, "index.html"), "utf8");
index = index.replace('href="resort-food.html">Resort food</a>', 'href="resort-food.html">Resort guides</a>');
index = index.replace("<h3 class=\"home-dir-title\">Resort Food</h3>", "<h3 class=\"home-dir-title\">Resort Guides</h3>");
index = index.replace(
  "<p class=\"home-dir-copy\">JW, La Cantera, Hill Country resort areas.</p>",
  "<p class=\"home-dir-copy\">JW, La Cantera, Hyatt, airport timing, and stay-nearby decisions.</p>"
);
index = index.replace("<span class=\"home-dir-cta\">Resort picks →</span>", "<span class=\"home-dir-cta\">Open resort guides →</span>");
index = index.replace(
  "<p class=\"home-lane-copy\">Zone-smart meals and realistic routes from JW Marriott, La Cantera, and Hill Country resort areas.</p>",
  "<p class=\"home-lane-copy\">Food, things to do, and realistic plans from JW Marriott, La Cantera, and Hill Country resort areas.</p>"
);
index = index.replace("<span class=\"home-lane-cta\">Resort picks →</span>", "<span class=\"home-lane-cta\">Resort guides →</span>");
fs.writeFileSync(path.join(root, "index.html"), index);

// start-here
let sh = fs.readFileSync(path.join(root, "start-here.html"), "utf8");
sh = sh.replace("Open resort food guide", "Open resort guides");
sh = sh.replace(
  'Open <a href="resort-food.html">Resort Food</a> before you burn an hour',
  'Open <a href="resort-food.html">Resort Guides</a> before you burn an hour'
);
fs.writeFileSync(path.join(root, "start-here.html"), sh);

// where-to-eat
let eat = fs.readFileSync(path.join(root, "where-to-eat.html"), "utf8");
eat = eat.replace("Resort food by zone", "See resort food picks");
eat = eat.replace(
  '<h3>Resort-area dinner</h3>',
  '<h3>Resort-area dinner</h3>'
);
eat = eat.replace(
  '<span class="image-route-card__cta">See resort food picks</span>',
  '<span class="image-route-card__cta">See nearby food picks</span>'
);
// Add full guide link if missing after resort zones
if (!eat.includes("Full resort guides")) {
  eat = eat.replace(
    `            <a class="eat-area-link" href="resort-food.html#rf-zone-hyatt">Hyatt Hill Country guide</a>
          </article>
        </div>
      </motion>`,
    `            <a class="eat-area-link" href="resort-food.html#rf-zone-hyatt">Hyatt Hill Country guide</a>
          </article>
        </div>
        <p class="eat-resort-full-guide"><a class="btn btn-secondary hero-secondary-btn" href="resort-food.html">Open full resort guides</a></p>
      </div>`
  );
  eat = eat.replace(
    `            <a class="eat-area-link" href="resort-food.html#rf-zone-hyatt">Hyatt Hill Country guide</a>
          </article>
        </div>
      </div>`,
    `            <a class="eat-area-link" href="resort-food.html#rf-zone-hyatt">Hyatt Hill Country guide</a>
          </article>
        </div>
        <p class="eat-resort-full-guide"><a class="btn btn-secondary hero-secondary-btn" href="resort-food.html">Open full resort guides</a></p>
      </div>`
  );
}
fs.writeFileSync(path.join(root, "where-to-eat.html"), eat);

// summer-family inline links
let fam = fs.readFileSync(path.join(root, "summer-family.html"), "utf8");
fam = fam.replaceAll('href="resort-food.html">Resort Food<', 'href="resort-food.html">Resort Guides<');
fam = fam.replace("for zone picks", "for area guides");
fs.writeFileSync(path.join(root, "summer-family.html"), fam);

// README
const readme = path.join(root, "README.txt");
if (fs.existsSync(readme)) {
  let r = fs.readFileSync(readme, "utf8");
  r = r.replace("resort-food.html = resort-area food guide", "resort-food.html = resort-area guides (food, activities, timing)");
  fs.writeFileSync(readme, r);
}

console.log("site links updated");
