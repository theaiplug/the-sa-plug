> 🛑 **RETIRED (owner ruling 2026-07-18):** Historical only — the live site + house standard are the `wheretogosa-website` repo (Vercel; `docs/state-of-the-site.md`), canonical social handles are `wheretogosa-website/docs/social/profiles-and-setup.md`, the Fiesta/cream visual direction and AI Plug homepage/footer mandates below are superseded, and the phone in this file is DEAD (only line: 830-500-5112). Adopt nothing. Full ruling: top of `WHERE_TO_GO_SA_PROJECT_INDEX.md`.

# Website Status

Last updated: 2026-05-29 (Business Services bridge — removed footer CTA strip)

## Purpose
Tracks the public Where To Go SA website: pages, visitor experience, CTAs, brand direction, SEO, public funnels, public business-services pages, social links, and public-facing content.

This file is the current website-thread source of truth and replaces the older `WEBSITE_STATUS.md`.

## Current Status Summary
Where To Go SA is now a premium San Antonio visitor guide, a live local concierge proof-of-work system, and the public example of what The AI Plug can build for businesses.

Current hierarchy:
- **Where To Go SA** is the public visitor-guide brand.
- **The AI Plug** is the business systems brand.
- **Where To Go SA proves The AI Plug** by showing useful visitor pages, Ask A Local style flows, request capture, lead routing, owner alerts, restaurant inquiry routing, transportation request routing, and business lead capture.
- Public visitor pages should remain visitor-first.
- Business pages should speak to owners/managers in plain language about problems they actually feel.
- Internal Owner Dashboard language must not be exposed publicly.

## Public Brand Direction
Public brand: **Where To Go SA**  
Tagline: **Where locals send visitors.**  
Old/internal repo/project name: **The SA Plug**  
Business/services brand: **The AI Plug**

Use **Where To Go SA** publicly wherever possible. Treat **The SA Plug** as the old/internal project or repo name unless dealing with legacy paths or code. Use **The AI Plug** only for business services, AI systems, business-owner pages, and proof-of-work sections.

## Contact Info
Phone: **(830) 355-3353**  
Email: **aibusinessplug@gmail.com**

## Official Social Links
Facebook: https://facebook.com/VisitWhereToGoSA  
Instagram: https://instagram.com/visitwheretogosa  
TikTok: https://tiktok.com/@visitwheretogosa  
Threads: https://threads.net/@visitwheretogosa  
YouTube: https://www.youtube.com/@WhereToGoSA  
X: https://x.com/wheretogosa  
Pinterest: https://pin.it/5vWBJ0a5j

## Visual Direction
The public site should keep the Connected Local Guide / Fiesta Premium direction:

- Premium San Antonio local guide
- Deep navy / charcoal dark sections
- Warm cream backgrounds
- River turquoise accents
- Fiesta coral / pink / orange
- Mission gold
- Local concierge + business traveler friendly
- Polished, useful, mobile-first
- Not generic tourism copy
- Not generic AI chatbot styling
- Not a pushy business sales site on visitor pages
- Business-owner pages can sell, but they should still feel premium, practical, and problem-solving

## Completed / Worked On Public Pages
The following pages have been worked on and should not be rebuilt from scratch unless intentionally redesigning or fixing a specific issue:

- Home
- Start Here
- Where To Eat
- Downtown + River Walk
- Pearl
- Resort Food Nearby / Resort Guides
- Family
- Driver / Transportation Concierge
- Ask / Ask A Local
- Business Services / The AI Plug
- Business Types / AI Plug category page
- Home Services + Home Improvement page
- Public Restaurant Funnel / Restaurants page
- Privacy Policy
- Terms
- Social links integration
- Main visual brand direction
- Footer/nav link updates

## Completed Business Services / The AI Plug Direction
The Business Services page has been revised away from generic “AI websites” language and toward business-owner problem solving.

Core direction:
- The AI Plug helps businesses stop losing opportunities because calls, forms, messages, questions, and follow-up are not connected.
- The AI Plug builds the customer path behind the business: AI-assisted answers, smart intake, lead routing, follow-up workflows, automations, content systems, and owner-visible workflows.
- The page should speak to missed calls, weak forms, scattered DMs/texts, repeated customer questions, slow follow-up, no booking/request path, no owner visibility, AI website operators, smart intake, lead routing, and practical AI support.
- The page should not sound like a generic website company, SaaS tool, AI gimmick, or dashboard demo.

## Completed / Current Business Services Page Flow
The Business Services page was rebuilt as a **premium bridge page** — restrained, visitor-guide-adjacent, not a long AI agency sales page.

Current flow (4 sections):
1. Hero — The business side behind Where To Go SA (original hero visual + background).
2. Who this helps — original category card grid with images and CTAs.
3. Business Operator — live chat widget.
4. Start the conversation — simplified request form inside form card (no separate navy CTA strip between the form and the footer).

Important:
- Not a dashboard demo, not a service-lane grid, not a business-types directory on this page.
- Do not use dashboard/internal language publicly.
- Form routes to Business Leads via `business-lead-form.js` → `/.netlify/functions/business-lead`.

## Business Services Form / Routing Status
Business Services page submissions should route to the internal Owner Dashboard / Business Leads flow.

Known desired metadata:
- `source: business_services_page`
- `lead_type: ai_plug_business_request`
- `status: New`
- `next_action: review request`
- `page_path: /business-services.html`

Public success language should stay safe:
“Request received. We'll review your business type, current situation, and best starting point before following up.”

Do not promise instant results, guaranteed leads, guaranteed bookings, revenue, rankings, or guaranteed outcomes.

## Homepage AI Plug Section Direction
The homepage should remain a visitor guide first.

The AI Plug section on the homepage should be a **premium teaser**, not a full sales page.

Current public layout (2026-05-29):
- Image card with overlay copy preserved (**Built by The AI Plug** headline + subline on image).
- One short supporting line beneath the image.
- One primary CTA: **Explore AI Plug** → `business-services.html`.
- No stacked feature cards or long explanatory paragraphs under the image on the homepage.

Best framing:
- **Built by The AI Plug**
- Where To Go SA is visitor-first; The AI Plug is the business side behind the work.
- Businesses can click through if they want that side of the work.

Avoid:
- turning the homepage into a generic agency homepage
- making visitor pages feel like ads
- over-explaining internal tools
- stacked business feature cards on the homepage
- using dashboard words like “lead classification,” “vertical lane,” or “internal workflow”

## Visitor Footer Business Link
Visitor-guide page footers should include **one** business-side link only:
- Label: **AI Plug**
- Target: `business-services.html` (or `../business-services.html` from nested paths)

Do not add multiple business footer links (e.g. Business Types) on visitor-facing guide pages.

## Business Types / AI Plug Category Strategy
The Business Types / AI Plug category page should use a small number of strong category landing pages, not every vertical as a top-level page.

Main public categories:
1. **Home Services + Home Improvement**
2. **Hospitality + Local Experience Businesses**
3. **Professional Services**
4. **Transportation + Concierge**

Restaurants should sit under **Hospitality + Local Experience** because they are part of the Where To Go SA visitor ecosystem. The existing restaurant page/funnel remains linked from there.

## Business Types Page Public Positioning
Headline direction:
**AI systems built around how your business actually gets customers.**

Support copy direction:
A restaurant, roofer, bar, event vendor, consultant, and transportation provider do not need the same customer flow. The AI Plug builds the path behind the business — intake, routing, follow-up, approved AI assistance, and owner visibility — around how that business actually works.

Avoid internal-sounding phrases:
- customer-path systems as the main CTA
- ask about this business type
- vertical lane
- dashboard-ready
- internal workflow
- operating system
- lead classification
- niche lane

Use owner-facing language:
- missed calls
- quote requests
- private event inquiries
- group bookings
- customer questions
- follow-up
- owner visibility
- request flow
- better intake
- cleaner handoff
- fewer scattered messages

## Business Category Card Direction

### Home Services + Home Improvement
Includes:
Roofing, flooring, remodeling, HVAC, plumbing, electrical, restoration, handyman/local service.

Owner-facing problem copy:
Missed calls, quote requests, job photos, scheduling, estimates, service areas, and follow-up get scattered.

CTA:
**Fix missed calls + quote requests**

Alternate CTA:
**Explore home services systems**

### Hospitality + Local Experience
Includes:
Restaurants, bars, nightlife, rooftops, event venues, attractions/tours, resort-area businesses, visitor-facing local brands.

Owner-facing problem copy:
Visitor attention, private events, table requests, group dining, catering questions, QR paths, and follow-up need a clearer path.

CTA:
**Get help with visitor + event inquiries**

Restaurant CTA:
**View restaurant visibility + AI systems**

### Professional Services
Includes:
Attorneys, consultants, real estate, insurance, medical/wellness, financial-style local services, B2B services.

Owner-facing problem copy:
Consultation requests, qualification, trust, process questions, intake, and follow-up need to feel clear before a client books.

CTA:
**Clean up consultation requests**

### Transportation + Concierge
Includes:
Transportation providers, concierge requests, route planning, airport/resort requests, group pickup needs, local handoff workflows.

Owner-facing problem copy:
Pickup details, timing, group size, destination, luggage, route needs, and follow-up need to be organized before anyone guesses.

CTA:
**Organize transportation requests**

## Home Services + Home Improvement Page Direction
The Home Services page should be its own page and should speak directly to contractors, home improvement owners, and service operators.

It should not feel technical.
It should not sound like generic AI.
It should not use “ask about this business type.”

Main headline:
**Stop losing quote requests between the call, the form, the photo, and the follow-up.**

Support copy:
The AI Plug helps home service businesses organize the request path behind the website: calls, forms, job photos, scheduling, estimates, service areas, follow-up, and owner visibility.

Primary CTA:
**Fix my quote request flow**

Secondary CTA:
**See what this can build**

Recommended page flow:
1. Hero — stop losing quote requests.
2. Problem section — where home service leads get messy.
3. What The AI Plug fixes — calls, forms, photos, scheduling, estimates, follow-up, owner visibility.
4. Trade cards / home service types.
5. Proof / explanation — how this works without promising jobs.
6. Form section — tell us where requests are getting messy.
7. Final CTA.

## Home Services Trade Card CTA Examples
Roofing: **Clean up roof inspection requests**  
Flooring: **Organize measurement + quote requests**  
Remodeling: **Qualify remodel consultations**  
HVAC: **Route service calls + quote follow-up**  
Plumbing: **Organize urgent and routine requests**  
Electrical: **Capture safer project details**  
Restoration / Insurance Estimating: **Organize loss details + estimate status**  
Handyman / Local Service: **Simplify small job requests**

## Home Services Form Direction
If the Home Services form exists, keep it. Make the CTA and field labels owner-friendly.

Suggested public form headline:
**Tell us where requests are getting messy.**

Suggested form intro:
Send the business type, website, service area, and what part of the request path is breaking. We’ll review the first useful system to build — not a giant package you do not need.

Owner-friendly fields:
- Business name
- Your name
- Email
- Phone
- Preferred contact method
- Website or social link
- Service area
- What kind of business do you run?
- Where do requests get messy?
- What would you like help with?
- Optional message

If hidden markers or query params already exist for category/vertical, preserve them. Do not expose technical tags publicly.

## Home Services Image Asset Rules
Home Services page images should be standalone website image assets.

Forbidden:
- baked-in text
- readable logos
- fake company names
- UI mockups
- title cards
- badges
- watermarks
- signs with readable words
- dark transparency walls built into the image
- collages
- side-by-side panels
- before/after composites unless explicitly requested

Required:
- premium cinematic home services / home improvement photography
- warm, realistic, business-owner friendly
- clean service vehicles only if no readable logos/text
- natural negative space where useful
- no public claims in the image
- text overlays must be done in HTML/CSS, not baked into the image

Recommended asset list:
- `home-services-hero-request-flow.png`
- `home-services-quote-photo-intake.png`
- `home-services-missed-call-dispatch.png`
- `home-services-roofing-inspection.png`
- `home-services-flooring-measurement.png`
- `home-services-restoration-details.png`

## Public Restaurant Website Funnel Status
The public restaurant funnel/page has been built in the website thread and tested.

Known completed public restaurant work:
- Dedicated public restaurant page/funnel at or intended for `/restaurants/`
- Restaurant Partner Program public explanation
- AI Restaurant Growth Systems public explanation
- Two-path positioning: visitor visibility vs restaurant systems
- Public-safe restaurant owner/manager inquiry form
- SMS/email consent language visible/readable on the restaurant inquiry form
- Footer Restaurants link added/confirmed
- Form tested using fake lead: **Alamo Ember Kitchen**
- Test lead successfully submitted and appeared in the Owner Command Dashboard / Restaurant Leads flow
- Page received at least one polish pass for restaurant-owner conversion, visual hierarchy, hero/visual treatment, form readability, and guardrails

## Public Restaurant Funnel Positioning
The restaurant page should stay simple, premium, and public-safe.

It should explain two public-facing paths:

### Restaurant Partner Program
Visitor visibility inside Where To Go SA guide contexts.

Best public framing:
- Get in front of San Antonio visitors before they choose where to eat.
- Visibility opportunities reviewed for fit.
- Relevant to resort dining, downtown/River Walk nights, airport timing, business meals, family plans, date nights, nightlife, and food-category decisions.

### AI Restaurant Growth Systems
Restaurant customer-flow infrastructure built by The AI Plug.

Best public framing:
- Smarter intake.
- QR/menu/funnel paths.
- Private event/catering request flows.
- Follow-up workflows.
- Owner-visible lead tracking.
- Better customer path and operational clarity.

## Restaurant Inquiry Form Requirements
The restaurant inquiry form should collect or preserve fields similar to:

- Restaurant name
- Contact name
- Email
- Phone
- Preferred contact method
- Website/social link
- Restaurant area/neighborhood
- What they want help with
- Interest selection:
  - Restaurant Partner Program
  - AI Restaurant Growth Systems
  - Both
- Optional message

Visible SMS/email consent language must remain readable near the submit button when collecting phone/email:

**By submitting, you agree that Where To Go SA may contact you by email or SMS about your request. Message and data rates may apply. Reply STOP to opt out or HELP for help.**

## Restaurant Funnel Routing Status
The fake restaurant inquiry test worked.

Confirmed test lead:
- Restaurant: **Alamo Ember Kitchen**
- Contact: **Marcus Rivera**
- Interest: Restaurant Partner Program + AI Restaurant Growth Systems
- Result: form submission reached the internal dashboard/Restaurant Leads workflow

Future website work should preserve that routing and should not rebuild the internal dashboard system.

## Transportation + Concierge Page Direction
Public positioning is **scheduled private local concierge experiences** for San Antonio visitors — not instant rides, ride requests, or rideshare replacement language.

Best public framing:
- Book a local concierge for your San Antonio visit.
- Reserve concierge time with experience types (city night out, resort guest route, family/first-time visitor, convention free time, nearby day trip, custom local plan).
- Package-style starting rates: 2h from $250, 3h from $375, 4–5h from $600, 6–8h from $900–$1,200, custom quoted.
- Homepage section previews experiences + “starts at $250” teaser; full pricing on `driver-concierge.html`.
- Booking form at `#transportation-request` routes to `/.netlify/functions/transportation-request` (Supabase + owner alerts). Live calendar/payment not active yet — form notes review-first scheduling.

Avoid on public pages:
- instant ride / ride request / taxi or Uber replacement / dispatch / “private concierge by the hour” as main headline / defensive “not instant pickup” copy.

Important:
- Keep visitor-facing pages visitor-first and premium.
- Do not overpromise availability.
- Transportation leads stay separate from restaurant and AI Plug business leads.
- Do not edit `owner-dashboard/index.html` for website-thread concierge copy work.

## Ask A Local / Operator Direction
Ask A Local is a major proof point for The AI Plug.

Visitor-facing goal:
- Help visitors get a useful local answer faster.
- Route visitors by situation, not generic search.
- Keep it helpful, not overly salesy.
- It can become a public example of an AI website operator / guided concierge flow.

Business proof angle:
- This is the kind of website operator The AI Plug can build for other niches.
- Other business niches can use a similar operator to answer repeat questions, guide request type, collect better details, and hand off to a human.

Do not force AI Plug sales inside the visitor chat experience unless it is placed carefully outside the visitor answer flow.

## Dashboard / Website Boundary
The Owner Command Dashboard and all internal sales systems are internal. They should not be duplicated or exposed on the public website.

Website thread owns:
- Public visitor pages.
- Public `/restaurants/` page.
- Public Business Services page.
- Public Business Types / category page.
- Public Home Services page.
- Public Transportation/Concierge page.
- Public offer language.
- Visitor and business-owner form UX.
- Public SEO metadata.
- Public mobile QA.
- Public CTA routing into dashboard/backend.

Dashboard/internal thread owns:
- Owner Command Dashboard.
- AI Plug Business Leads.
- Restaurant Leads.
- Transportation Requests.
- Restaurant Sales Mode.
- Business Command tools.
- First 50 workflow.
- Restaurant research scoring.
- Proposal builders.
- Follow-up kits.
- Close/onboarding workflows.
- Client success/monthly recap/renewal tools.
- Internal owner notes, CRM stages, copy tools, exports.
- Dashboard/Supabase/Netlify function debugging.

## Public Website Must NOT
- Expose internal dashboard tools.
- Use internal sales-rep language publicly.
- Duplicate dashboard tools on public pages.
- Promise guaranteed leads, jobs, bookings, reservations, traffic, revenue, rankings, reviews, appointments, claim approvals, financing approvals, energy savings, or results.
- Say AI replaces staff.
- Imply automatic customer-facing messages happen without approval.
- Create public restaurant listings without owner approval.
- Mention internal test/demo restaurants publicly.
- Connect payments, invoices, or auto-send systems.
- Add fake public directories.
- Use Tally links, example.com links, or broken placeholders.
- Make visitor pages feel like business ads.

## Public-Safe Allowed Language
Use phrases like:
- better intake
- clearer request flow
- fewer scattered messages
- better follow-up process
- owner visibility
- approved AI assistance
- practical systems
- start with the first useful fix
- reviewed for fit
- request routing
- cleaner handoff
- organize requests
- capture the right details

## Current Website QA Priorities
1. Confirm latest Business Services page still routes to Business Leads.
2. Confirm Business Services form looks clean on mobile.
3. Confirm Business Types / AI Plug category page uses owner-facing language and correct category links.
4. Confirm Home Services page uses contractor/home-service owner language, not dashboard language.
5. Confirm Home Services form is clean, readable, and owner-friendly on mobile.
6. Confirm Home Services image assets have no baked-in text/logos/signs.
7. Confirm `/restaurants/` page still routes correctly after any shared CSS/form changes.
8. Confirm transportation request page still routes correctly after any shared CSS/form changes.
9. Confirm footer/nav links work: Restaurants, AI Business Services, Transportation + Concierge, Ask A Local, Privacy Policy, Terms.
10. Confirm no old public-facing “The SA Plug” copy appears unless it is legacy/internal.
11. Confirm no internal dashboard language appears publicly.
12. Confirm no broken placeholder URLs.

## Current Recommended Next Website Steps
1. Replace this file as `/docs/WEBSITE_STATUS.md` so new threads have the latest website context.
2. Commit updated docs to GitHub.
3. Finish/polish the Business Types / AI Plug category page with the four-category public structure.
4. Finish/polish the Home Services page using owner-facing contractor language.
5. Generate/upload clean standalone Home Services image assets.
6. Test Home Services form routing.
7. Test Business Services, Restaurant, and Transportation form routing after any shared changes.
8. Confirm homepage AI Plug proof section still feels visitor-first.
9. Lock the stable pages once mobile QA and routing pass.
10. Update related status files if dashboard, restaurant, or tech routing changes.

## Files / Areas Likely Affected By Website Work
- `index.html`
- `business-services.html`
- `business-lead-form.js`
- Business Types / AI Plug category page file if separate
- Home Services page file if separate
- Transportation / Concierge page file
- `restaurants/index.html`
- shared CSS / site CSS
- shared header/footer if applicable
- public navigation/footer links
- public form frontend JS if separate
- Netlify function only if form routing breaks
- SEO metadata
- `/docs/WEBSITE_STATUS.md`

## Do Not Rebuild Unless Explicitly Requested
- Owner Command Dashboard
- Restaurant Program v1 dashboard
- Restaurant Sales Mode
- Restaurant Prospect/Client tabs
- Manual Restaurant Prospect Creator
- First 50 workflow
- Restaurant Research Profile
- Restaurant Proposal Builder
- Restaurant Close Command
- Restaurant Client Success Command
- Restaurant Sales Rep Command
- Existing completed public visitor pages
- Stable Business Services hero unless fixing bugs
- Stable restaurant funnel unless intentionally polishing
- Transportation backend unless routing breaks

## Notes For Future Threads
If starting a new website thread, read this file first along with:

- `WHERE_TO_GO_SA_PROJECT_INDEX.md`
- `DASHBOARD_STATUS.md`
- `RESTAURANT_PROGRAM_STATUS.md`
- `TECH_STACK_STATUS.md`
- Any newer cross-thread update file if one exists

Use this file to prevent duplicate work and to keep the website thread focused on public pages, public conversion, mobile polish, visitor experience, and public-safe business-owner language.
