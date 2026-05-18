const fs = require("fs");
const path = require("path");
const htmlPath = path.join(__dirname, "..", "downtown.html");
const insertPath = path.join(__dirname, "downtown-new-sections.html");
let html = fs.readFileSync(htmlPath, "utf8");
if (html.includes('id="dt-first-time-route"')) {
  console.log("Sections already inserted");
  process.exit(0);
}
const marker = '    </section>\n    <section id="dt-dining-nightlife"';
const idx = html.indexOf(marker);
if (idx === -1) {
  console.error("Marker not found");
  process.exit(1);
}
const insert = fs.readFileSync(insertPath, "utf8");
html = html.slice(0, idx + "    </section>\n".length) + insert + html.slice(idx + "    </section>\n".length);
fs.writeFileSync(htmlPath, html);
console.log("Inserted first-time + family sections");
