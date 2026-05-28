# Dashboard Status

Last updated: 2026-05-28

## Purpose

This file tracks the private/internal Owner Dashboard for Where To Go SA / The AI Plug.

Use this file when working on:
- Owner Dashboard
- AI Plug business leads
- restaurant prospects / restaurant clients
- transportation requests
- dashboard QA
- Supabase / Netlify dashboard functions
- internal sales tools
- internal proposal / follow-up / copy tools
- monthly recap / retention tools

This file is meant to live in the repo at:

`/docs/DASHBOARD_STATUS.md`

## Project Identity

Public visitor brand: **Where To Go SA**  
Business systems brand: **The AI Plug**  
Old/internal repo name: **The SA Plug**  
Website: https://wheretogosa.com  
Business Services page: https://wheretogosa.com/business-services  
Owner Dashboard route: `/owner-dashboard/`

Contact:
- Phone: **(830) 355-3353**
- Email: **aibusinessplug@gmail.com**
## 2026-05-28 — Home Services Language Cleanup

PR #131 cleaned up remaining Home Services / AI Plug dashboard language after live mobile review.

Branch:
- cursor/home-services-language-cleanup-936d

File changed:
- owner-dashboard/index.html

Result:
- Home Services proposal and pricing areas now use owner-facing deliverable language instead of vague AI/package language.
- “customer path” was removed from Home Services client-facing copy.
- “smart intake path” was removed.
- Home Services proposals now lead with real deliverables such as missed-call follow-up, owner alert flow, quote request form, photo intake, estimate follow-up workflow, review request workflow, owner dashboard / CRM-lite, Google Ads setup + landing page, and monthly optimization support.
- Restaurant Sales Mode was preserved.
- Public pages were untouched.
- Transportation logic was untouched.

Rule:
Future Home Services, contractor, professional services, and AI Plug sales-copy work must use plain business-owner language first. Use deliverables, not vague AI package names.

## Current Business Direction

The AI Plug is now positioned as a **Practical AI Adoption + Growth Systems** company.

Core positioning:

**Give your business an AI advantage before your competitors do.**

Support belief:

**The businesses that learn AI now will have the advantage later.**

The dashboard should not classify business leads only as website leads, chatbot leads, form leads, or lead-path leads.

The dashboard should support the new AI Advantage First system:
- AI Growth Review
- AI Marketing Systems
- AI Customer Experience
- AI Intake + Automation
- AI Business Assistants
- AI Growth Management
- Full AI Growth System
- Restaurant Partner Program / Visitor Visibility where relevant

## Current Dashboard Status

The Owner Dashboard exists as a private/internal operating system.

It should **not** be rebuilt from scratch unless there is a deliberate redesign.

### General dashboard areas already built

- Owner Daily Brief
- AI Plug Leads / Business Leads
- Transportation Requests
- Restaurant Prospects
- Restaurant Clients
- Search and filters
- Copy / Export Summary
- Owner workflow notes
- Status/stage buttons
- Lead command sheet
- Copy-only outreach tools
- CRM/export summaries
- Proposal / estimate helpers
- Follow-up command tools
- Client support / retention tools

### Restaurant dashboard areas already built

Restaurant Program v1 exists internally inside the Owner Dashboard.

Do **not** remove or rebuild these unless intentionally improving them:

- Restaurant Sales Mode
- Restaurant Prospects tab
- Restaurant Clients tab
- Manual Restaurant Prospect Creator
- First 50 Restaurant List / First 50 workflow
- Restaurant Prospect Workflow
- Restaurant Scouting Copy Tools
- Restaurant Research Profile
- Editable research fields and research scoring
- Restaurant Sales Command
- Restaurant Proposal Builder
- Restaurant Close Command
- Restaurant Client Success Command
- Restaurant Monthly Recap Builder
- Restaurant Sales Rep Command
- Restaurant Pitch Script Builder
- Restaurant Discovery Questions
- Restaurant Objection Handler
- Restaurant Follow-Up Cadence
- Restaurant Rep Manager Recap
- Restaurant Rep Guardrails
- Restaurant Copy Tools
- Restaurant Action Buttons
- Restaurant reports/exports

### Transportation dashboard status

Transportation request handling exists and should not be broken during dashboard updates.

Preserve:
- transportation request loading
- internal request notes/status
- existing form routing
- owner dashboard visibility
- safe handling of pickup / route / provider details

## PR #123 — AI Plug Business Command + Vertical Command System (2026-05-28)

Branch: `cursor/fix-ai-plug-vertical-command-e7c2`

### Root cause fixed

`aiPlugDiagnosis()` called `aiPlugRecommendLadderOffer()`, which called `aiPlugDiagnosis()` again — infinite recursion and stack overflow. That crashed `renderAiPlugBusinessCommand()` and showed “temporarily unavailable.”

### Fix

- Extracted `aiPlugDetectLeakKey()` and `aiPlugOfferFromLeakKey()` to break the cycle.
- Added defensive try/catch in diagnosis, lead previews, and queue rendering.
- Unclassified leads show **Needs classification** instead of taking down the whole section.

### Vertical command panels (business lead detail)

| Vertical | Command block |
|----------|----------------|
| Home Services + Contractors | Existing Home Services Command (unchanged depth) |
| Hospitality + Local Experience | New vertical command panel + copy tools |
| Restaurants | Restaurant Sales Mode (unchanged) |
| Professional Services | New vertical command panel + copy tools |
| Transportation + Concierge | New vertical command panel + copy tools |
| Local Brands + Retail | New vertical command panel + copy tools |
| Other / Custom | New vertical command panel + copy tools |

Each vertical panel includes: summary, queue focus, discovery, objections, pricing guidance, proposal summary, delivery handoff, monthly recap prompts, guardrails, and copy buttons.

### AI Plug Business Command filters

Vertical lane filters updated: Home Services, Hospitality, Restaurants, Professional Services, Transportation, Local Brands, Other / Custom.

### Files changed

- `owner-dashboard/index.html`
- `docs/DASHBOARD_STATUS.md`

### Schema / Netlify

No schema changes. No Netlify function changes.

### QA still manual

Live Supabase load, copy button content, Restaurant Sales Mode, Transportation Requests, and mobile layout on a real device.

---

## 2026-05-28 — Pricing + Client-Language Reset

PR **#129** was merged to `main`.

| Field | Value |
|-------|-------|
| PR | #129 |
| Branch | `cursor/dashboard-pricing-language-reset-a60b` |
| Commit | `873e1a0` |
| Merged commit | `8e21704` |

**Purpose:** Reset dashboard pricing and proposal language to follow the new real-world service inventory and pricing foundation.

### What changed

1. Dashboard now uses **deliverable-first pricing** instead of vague AI package pricing.
2. **Paid ads** are included as real service logic: Google Ads, Meta/Facebook/Instagram Ads, TikTok Ads, ad creative/testing, campaign tracking, monthly management, with ad spend separate.
3. **Home Services** copy now uses owner language first: roofing leads, missed calls, quote requests, photo intake, estimate follow-up, Google Ads, owner lead tracker.
4. **Restaurant visibility pricing** remains separate from AI Plug system build pricing.
5. **Restaurant Sales Mode** was preserved.
6. **Transportation request logic** was preserved.
7. Pricing areas must show **internal guidance / confirm scope before quoting**.
8. No invoices, payment links, deposits, public listings, auto-SMS, auto-email, or customer-facing automation were added.

### Required source files (read before dashboard/pricing/manual/sales-copy work)

- `/docs/THE_AI_PLUG_REAL_WORLD_SERVICE_RESET_V1.md`
- `/docs/THE_AI_PLUG_SERVICE_INVENTORY_AND_PRICING_FOUNDATION_V1.md`

### Rule

All future dashboard/pricing/manual/sales-copy work must read the two reset files first. **Client language and real deliverables override old AI/package language.**

### Remaining QA

- Live Supabase dashboard test
- Home Services lead copy-button test
- Restaurant Sales Mode test
- Transportation request test
- Mobile pricing builder test
- Copy-button paste test

---

## AI Advantage First Dashboard Update

A Cursor branch/PR was created for AI Advantage First v3 dashboard alignment.

Known branch:
`cursor/ai-advantage-first-v3-cc06`

Known PR:
`https://github.com/theaiplug/the-sa-plug/pull/121`

Cursor reported:

### File changed

- `owner-dashboard/index.html`

### Dashboard sections added/updated

- AI Plug Business Command header positioned as AI Advantage First / Practical AI Adoption + Growth Systems
- Business lead cards with compact classification row:
  - business type
  - lane
  - first system
  - problem
  - awareness
  - guardrail
- AI Advantage nav section:
  - Lead summary
  - AI Growth Review
- v3 panels wired into existing sections:
  - Diagnosis
  - Offers
  - Discovery
  - Deal
  - Proposal
  - Delivery
  - Support
- Objection handler updated to v3 objection set
- Pipeline stages expanded with:
  - Needs Review
  - Review Recommended
  - Won / Deposit Paid
  - In Delivery
  - Launched
  - Monthly Management
- New copy tool kinds:
  - `ai-advantage-discovery-script`
  - `ai-advantage-proposal-summary`
  - `ai-advantage-pricing-guidance`
  - `ai-advantage-delivery-handoff`
  - `ai-advantage-monthly-recap`
  - `ai-advantage-growth-review`

### Schema status

No schema changes were made.

Classification uses existing lead fields and owner-note markers, such as:
- `Business type:`
- `Service lane:`
- `First useful system:`
- `Problem type:`
- `AI awareness:`
- `Guardrail risk:`

### Functions touched

None.

Netlify functions were not changed.

### Known limitations

- Classification is heuristic until owner-note markers are saved.
- Restaurant leads still use Restaurant Sales Mode.
- v3 panels are skipped for restaurant rows.
- Pricing is guidance only, not quoting/invoicing.
- Live Supabase dashboard testing still needs to be done with the real dashboard key and environment.

## Business Type Classification

Use these business type lanes:

- Home Services + Contractors
- Hospitality + Local Experience
- Restaurants
- Professional Services
- Transportation + Concierge
- Local Brands + Retail
- Other / Custom

## Service Lane Classification

Use these service lanes:

- AI Growth Review
- AI Marketing Systems
- AI Customer Experience
- AI Intake + Automation
- AI Business Assistants
- AI Growth Management
- Full AI Growth System
- Restaurant Partner Program / Visitor Visibility
- Other / Custom

## Starting Point / First Useful System Options

Use these starting points:

- AI Growth Review
- AI Website + Conversion System
- AI Content + Social Media Engine
- SEO + AI Search Visibility
- Paid Campaign + Landing Page System
- AI Chat Operator / Customer Experience
- AI Phone / Voice Planning
- Smart Intake + Automation
- Internal AI Assistants + Workflow Support
- QR Campaign / Menu Path
- Visitor Visibility Review
- Provider Handoff Workflow
- Consultation Intake + Qualification
- Product Answer / Customer Experience
- Other / Custom

## Guardrails

Dashboard actions are internal only.

Do not:
- send emails automatically
- send SMS automatically
- publish listings
- create invoices
- process payments
- expose secrets
- expose private owner notes publicly
- create customer-facing AI without approval rules

Never promise:
- guaranteed leads
- guaranteed traffic
- guaranteed revenue
- guaranteed bookings
- guaranteed reservations
- guaranteed rankings
- guaranteed jobs
- guaranteed reviews
- guaranteed QR scans
- guaranteed ad ROI
- guaranteed outcomes
- AI replacing staff

## Restaurant Guardrails

Never promise:
- guaranteed reservations
- guaranteed visitor traffic
- guaranteed revenue
- guaranteed Google rankings
- fake reviews
- forced recommendations
- AI replacing staff
- unapproved customer-facing messages
- public listing before owner approval
- payment/invoice automation from dashboard

Restaurant visibility should be reviewed for fit.

Payment should never guarantee placement.

## Technical Guardrails

Known stack:
- Netlify hosting
- GitHub repo likely still named `the-sa-plug`
- Supabase for request/lead data
- Netlify functions for server-side dashboard data/actions
- Owner Dashboard protected by dashboard key
- Twilio/Resend may be used for alerting where configured

If dashboard shows:
“Data unavailable. Dashboard data is temporarily unavailable. Check Netlify function logs.”

Then debug:
1. exact frontend fetch route
2. Netlify function logs
3. Supabase query behavior
4. env var presence as booleans only
5. section-level failure handling

Never log:
- Supabase service role key
- Twilio auth token
- Resend API key
- owner dashboard key
- full private lead data unnecessarily

Safe logs:
- function started
- env var present true/false
- table queried
- sanitized error
- response status

## Mobile QA Items To Watch

Mobile word-break issues sometimes appear after new sections:
- broken words like “rest aurant”
- “follow- up”
- “re commendation”
- “custom er”
- text running through buttons
- cramped cards
- horizontal overflow

Use:
- `word-break: normal`
- `overflow-wrap: anywhere` only for long URLs/emails
- avoid excessive letter spacing
- test full training panels on mobile

## Do Not Rebuild

Do not rebuild from scratch unless explicitly requested:
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
- Transportation request workflow
- Existing public website pages
- Business Services / The AI Plug hero

## Recommended Next Steps

1. Upload this file to `/docs/DASHBOARD_STATUS.md` in the repo.
2. Make sure the complete master manual is also in `/docs/`.
3. Preview PR #121 before merging.
4. Test real Owner Dashboard load with Supabase data.
5. Test one non-restaurant AI Plug business lead in Full Training View → AI Advantage.
6. Paste classification markers into owner notes for one test lead.
7. Refresh and confirm markers persist.
8. Test Restaurant Sales Mode still works.
9. Test Transportation Requests still load.
10. Test mobile layout.
11. Only merge after QA passes.
12. After merge, update this file again with final PR status.

## Quick Continuation Prompt

Use this at the start of future dashboard work:

“Read `/docs/WHERE_TO_GO_SA_PROJECT_INDEX.md`, `/docs/DASHBOARD_STATUS.md`, `/docs/THE_AI_PLUG_REAL_WORLD_SERVICE_RESET_V1.md`, `/docs/THE_AI_PLUG_SERVICE_INVENTORY_AND_PRICING_FOUNDATION_V1.md`, `/docs/TECH_STACK_STATUS.md`, `/docs/THE_AI_PLUG_MASTER_MANUAL_V3_COMPLETE_2026-05-27.md`, and `/docs/THE_AI_PLUG_LIVE_BUSINESS_SYSTEM_ALIGNMENT_2026-05-27.md` first. Continue from the latest completed state. Client language and real deliverables override old AI/package language. Do not rebuild dashboard modules marked complete. Preserve restaurant tools, transportation requests, public/private boundaries, safe claims, and no-secret rules.”
