import fs from "fs";

const filePath = "resort-food.html";
let html = fs.readFileSync(filePath, "utf8");

html = html.replace(
  /\n<!--PH_rf-stay-vs-downtown-->\s*\n\s*<section class="rf-final-cta"[\s\S]*?<\/section>\s*(?=\n\s*<\/section>\s*\n\s*<\/main>)/,
  "\n"
);

html = html.replace(/<!--PH_rf-stay-vs-downtown-->\s*/g, "");
html = html.replace(/<!--PH_rf-zone-\w+-->\s*/g, "");

fs.writeFileSync(filePath, html);
console.log("rf-final-cta removed:", !html.includes('id="rf-final-cta"'));
