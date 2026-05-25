#!/usr/bin/env node
/**
 * Mobile QA checks for optional SMS consent on public intake forms.
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FORM_FILES = [
  "restaurants/index.html",
  "business-services.html",
  "driver-concierge.html",
];

const LABEL =
  "I agree to receive SMS messages from Where To Go SA about my request";

let failed = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  failed += 1;
}

function pass(msg) {
  console.log("PASS:", msg);
}

for (const rel of FORM_FILES) {
  const file = path.join(ROOT, rel);
  const html = fs.readFileSync(file, "utf8");
  console.log("\n---", rel, "---");

  if (!html.includes('name="sms_consent"')) fail(`${rel}: missing sms_consent checkbox`);
  else pass(`${rel}: sms_consent checkbox present`);

  const inputMatch = html.match(/<input[^>]*name="sms_consent"[^>]*>/i);
  if (!inputMatch) fail(`${rel}: could not parse sms_consent input`);
  else {
    const tag = inputMatch[0];
    if (/\bchecked\b/i.test(tag)) fail(`${rel}: checkbox must be unchecked by default`);
    else pass(`${rel}: checkbox unchecked by default`);
    if (/\brequired\b/i.test(tag)) fail(`${rel}: checkbox must not be required`);
    else pass(`${rel}: checkbox not required`);
  }

  if (!html.includes(LABEL)) fail(`${rel}: missing consent label text`);
  else pass(`${rel}: consent label text present`);

  if (!html.includes("SMS consent is optional")) fail(`${rel}: missing optional help text`);
  else pass(`${rel}: optional help text present`);

  if (!html.includes('href="/privacy/"')) fail(`${rel}: missing Privacy Policy link`);
  else pass(`${rel}: Privacy Policy link present`);

  if (!html.includes('href="/terms/"')) fail(`${rel}: missing Terms link`);
  else pass(`${rel}: Terms link present`);

  if (html.includes("By submitting, you agree that Where To Go SA"))
    fail(`${rel}: old implicit submit consent still present`);
  else pass(`${rel}: old implicit submit consent removed`);

  if (!html.includes("sms-consent-block")) fail(`${rel}: missing sms-consent-block wrapper`);
  else pass(`${rel}: consent visible in page markup (not popup)`);
}

const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
if (!css.includes(".sms-consent-block")) fail("styles.css: missing .sms-consent-block");
else pass("styles.css: shared SMS consent styles");

const askHtml = fs.readFileSync(path.join(ROOT, "ask/index.html"), "utf8");
if (askHtml.includes('type="tel"') || askHtml.includes('name="sms_consent"'))
  console.log("NOTE: ask/index.html has tel/sms_consent — review if human help collects phone");
else pass("ask/index.html: no phone field (human help links to transport form)");

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
