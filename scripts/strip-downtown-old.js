const fs = require("fs");
const path = require("path");
const htmlPath = path.join(__dirname, "..", "downtown.html");
let html = fs.readFileSync(htmlPath, "utf8");
const anchorsStart = html.indexOf('<section id="downtown-anchors"');
const chooseStart = html.indexOf('<section id="choose-downtown-move"');
if (anchorsStart === -1 || chooseStart === -1) {
  console.error("markers missing", anchorsStart, chooseStart);
  process.exit(1);
}
html = html.slice(0, anchorsStart) + html.slice(chooseStart);
fs.writeFileSync(htmlPath, html);
console.log("Removed", chooseStart - anchorsStart, "characters");
