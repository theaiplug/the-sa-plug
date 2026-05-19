import fs from "fs";

const sh = fs.readFileSync("start-here.html", "utf8");
const ask = fs.readFileSync("ask/index.html", "utf8");

const d = "div";
const glassMarker = `<${d} class="live-concierge__glass-panel live-concierge__glass-panel--tool-first">`;
const glassStartIdx = sh.indexOf(glassMarker);
if (glassStartIdx === -1) throw new Error("glass panel not found");

const mainMarker = `<${d} class="live-concierge__main-card">`;
const mainStart = sh.indexOf(mainMarker);
const mainClose = `            </${d}>\n          </${d}>`;
const mainCloseWithThread = `              </${d}>\n            </${d}>\n          </${d}>`;
let mainEnd = sh.indexOf(mainCloseWithThread, mainStart);
let mainCard;
if (mainEnd !== -1) {
  mainCard = sh.slice(mainStart, mainEnd + `              </${d}>\n            </${d}>`.length);
} else {
  mainEnd = sh.indexOf(mainClose, mainStart);
  if (mainStart === -1 || mainEnd === -1) throw new Error("main card block not found");
  mainCard = sh.slice(mainStart, mainEnd + `            </${d}>`.length);
}

const chipsStart = ask.indexOf(`<${d} class="live-concierge__starter-chips"`);
const chipsEnd = ask.indexOf(`            </${d}>\n            </${d}>`, chipsStart);
if (chipsStart === -1 || chipsEnd === -1) throw new Error("ask chips block not found");

let chipsBlock = ask.slice(chipsStart, chipsEnd + `            </${d}>\n            </${d}>`.length);
chipsBlock = chipsBlock.replace("../driver-concierge.html", "driver-concierge.html");

const cardClose = sh.indexOf(`        </${d}>`, mainEnd);
if (cardClose === -1) throw new Error("card close not found");

const newGlass =
  glassMarker +
  "\n" +
  mainCard +
  "\n\n" +
  chipsBlock +
  "\n            </" +
  d +
  ">\n";

const before = sh.slice(0, glassStartIdx);
const after = sh.slice(cardClose);

const out = before + newGlass + after;
fs.writeFileSync("start-here.html", out);
console.log("Updated start-here.html Ask A Local card layout");
