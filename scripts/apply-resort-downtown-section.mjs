import fs from "fs";
import path from "path";

const root = process.cwd();
const htmlPath = path.join(root, "resort-food.html");
const sectionPath = path.join(root, "scripts", "resort-food-downtown-section.html");

let html = fs.readFileSync(htmlPath, "utf8");
let section = fs.readFileSync(sectionPath, "utf8");

section = section.replace(/<motion /g, "<motion ");
section = section.replace(/<\/motion>/g, "</motion>");
section = section.replace(/<motion /g, "<div ");
section = section.replace(/<\/motion>/g, "</div>");

const re =
  /<section class="rf-zone-detail rf-zone-detail--escape" id="rf-stay-vs-downtown">[\s\S]*?<\/section>\s*(?=\s*<\/section>\s*<\/main>)/;
if (!re.test(html)) {
  throw new Error("Downtown escape section not found");
}
html = html.replace(re, section.trim() + "\n");

const cssBlock = `
    .resort-food-page .rf-zone-banner--story img {
      object-position: center 38%;
    }

    .resort-food-page .rf-dining-zone-label--escape {
      margin: 0.25rem 0 0;
      font-size: 0.92rem;
      color: rgba(255, 246, 230, 0.78);
    }

    .resort-food-page .rf-dining-zone-label--escape .rf-inline-link {
      color: #99f8f1;
      font-weight: 650;
      text-decoration: underline;
      text-underline-offset: 0.14em;
    }

    .resort-food-page .rf-zone-detail--escape {
      margin-top: clamp(2rem, 4vw, 2.75rem);
      padding-top: clamp(1.5rem, 3vw, 2rem);
      border-top: 1px solid rgba(238, 111, 178, 0.22);
    }

    .resort-food-page .rf-zone-move-band .hero-cta-row {`;

if (!html.includes(".rf-zone-banner--story img")) {
  html = html.replace(
    ".resort-food-page .rf-zone-move-band .hero-cta-row {",
    cssBlock
  );
}

fs.writeFileSync(htmlPath, html);
console.log("OK: downtown escape section updated");
