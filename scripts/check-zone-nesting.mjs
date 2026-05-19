import fs from "fs";

const html = fs.readFileSync("resort-food.html", "utf8");
const zones = ["rf-zone-rim", "rf-zone-jw", "rf-zone-hyatt", "rf-zone-airport"];

for (const id of zones) {
  const marker = `id="${id}"`;
  const open = html.indexOf(marker);
  const before = html.slice(0, open);
  const detailOpens = (before.match(/<section class="rf-zone-detail/g) || []).length;
  const allCloses = (before.match(/<\/section>/g) || []).length;
  console.log(`${id}: sibling depth ${detailOpens - allCloses} (expect 0)`);
}
