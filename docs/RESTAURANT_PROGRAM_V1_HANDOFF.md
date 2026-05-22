# Where To Go SA Restaurant Program v1 — Internal Dashboard Handoff

## Purpose

This document describes the **internal owner/sales-rep operating system** for the Where To Go SA Restaurant Program v1. It lives inside the **Owner Command Dashboard** (`owner-dashboard/index.html`) and is designed to support the full restaurant sales lifecycle:

- Prospecting
- Research
- Outreach
- Proposal preparation
- Follow-up
- Onboarding
- Client retention
- Reporting

The dashboard is **copy-and-workflow tooling only**. It helps the owner and sales reps decide what to do next, prepare messaging, track stages, and export summaries. It is **not** the public-facing restaurant partner website or intake funnel.

---

## Current Status

| Area | Status |
|------|--------|
| Restaurant dashboard inside Owner Command | **Built (v1 internal)** |
| Public restaurant website pages | **Not built yet** |
| Payments / invoices | **Not connected from dashboard** |
| SMS / email automation | **Not connected from dashboard** |
| Client-facing listings | **Not connected from dashboard** |
| Automations (send, publish, charge) | **Not connected unless separately approved** |

**Implementation note:** Restaurant Sales Mode is embedded in Owner Command Dashboard. All copy tools, action buttons, stage markers, and export reports are **manual**. Nothing sends, publishes, invoices, charges, or promises results automatically from this interface.

---

## Existing Dashboard Areas

The following Restaurant Program v1 areas are present in Owner Command:

### Navigation & overview

- **Owner Daily Brief with Restaurant Sales Mode summary** — Daily action list includes restaurant pipeline counts, proposal-ready leads, follow-ups, and won/client metrics alongside other business modes.
- **Restaurant Prospects tab** — Primary prospecting workspace: create prospects, filter by stage/priority, First 50 list mode, and prospect cards.
- **Restaurant Clients tab** — Post-win client workspace: support status, recap, renewal, upsell, and testimonial/referral tracking.

### Prospect & research

- **Restaurant prospect cards** — Card view with lane, opportunity, research score, stage, next action, and First 50 badge.
- **Restaurant Research Profile** — Internal research fields: website status, Google profile, menu/reservation path, social presence, private dining/group path, visitor fit, QR/funnel opportunity, review/repeat guest opportunity, and research score.
- **Restaurant Prospect Workflow** — Stage progression, suggested next step, and workflow guardrails on each prospect detail sheet.

### Sales command & rep tools

- **Restaurant Sales Command** — Snapshot of business, contact, lane, recommended offer, stage, and next action with sales-direction guidance.
- **Restaurant Sales Rep Command** — Rep-facing stage selector, rep action buttons, and rep stage tracking separate from owner workflow markers.
- **Restaurant Pitch Script Builder** — Copy blocks for first outreach and partner program positioning.
- **Restaurant Discovery Questions** — Qualifying question sets (visibility, reservation path, QR/funnel, reviews/repeat, owner approval).
- **Restaurant Objection Handler** — Responses for common objections (existing website, social media, AI concerns, guarantees, price, think-about-it).
- **Restaurant Follow-Up Cadence** — Day 0 through Day 30 follow-up message templates.
- **Restaurant Rep Manager Recap** — Daily/weekly pipeline recap with rep stage counts.
- **Restaurant Rep Guardrails** — Reminder that all guidance is internal; nothing sends or charges automatically.

### Copy, actions & export

- **Restaurant Copy Tools** — Offer copy, outreach, follow-up, proposal, intake, recap, renewal, and case study copy buttons.
- **Restaurant Action Buttons** — One-click stage markers (First 50 target, contacted, interested, proposal ready, intake needed, in build, live, not now, not a fit, etc.).
- **Restaurant Scouting Copy Tools** — Scouting notes template and related prospecting copy for field research.
- **Export / CRM Summary** — Export modes including First 50 restaurant list/report, restaurant pipeline reports, and CRM summary copy for manual use.

---

## Restaurant Sales Stages

The intended end-to-end sales flow uses these **23 stages**. Stages are tracked via owner notes, workflow markers, rep stage selectors, and action buttons in the dashboard.

| # | Stage | Typical meaning |
|---|-------|-----------------|
| 1 | **First 50 target** | Priority prospect on the initial target list |
| 2 | **Needs research** | Identified; research not yet complete |
| 3 | **Researched** | Internal research profile filled in |
| 4 | **Ready for contact** | Research complete enough for first outreach |
| 5 | **Restaurant contacted** | First touch made manually |
| 6 | **Restaurant interested** | Positive response; discovery next |
| 7 | **Discovery needed** | Qualifying questions and fit confirmation in progress |
| 8 | **Qualified** | Fit confirmed; ready to shape an offer |
| 9 | **Restaurant proposal ready** | Proposal/offer copy prepared internally |
| 10 | **Proposal sent** | Proposal copied/sent manually |
| 11 | **Follow-up due** | Awaiting response after proposal or contact |
| 12 | **Verbal yes** | Verbal agreement; deposit/approval next |
| 13 | **Deposit requested** | Deposit or approval step requested manually |
| 14 | **Won/client** | Closed; moving to onboarding |
| 15 | **Restaurant intake needed** | Collecting materials and intake details |
| 16 | **Restaurant in build** | Deliverables in progress |
| 17 | **Restaurant live** | Launched after owner approval |
| 18 | **Monthly recap due** | Client success recap owed |
| 19 | **Renewal due** | Renewal conversation or offer due |
| 20 | **Case study needed** | Testimonial/case study opportunity |
| 21 | **Not now** | Paused; revisit later |
| 22 | **Not a fit** | Does not match current offer |
| 23 | **Lost** | Declined or closed lost |

**Rep stage subset:** The Restaurant Sales Rep Command also tracks a simplified rep pipeline (Not started → Research needed → … → Won/client / Not now / Lost) that maps to the broader owner workflow above.

---

## Restaurant Offers

Current **offer ladder** (as configured in the dashboard copy tools and proposal builder):

| Offer | Price / term |
|-------|----------------|
| **Starter Visibility** | $399 / 90 days |
| **Featured Visitor Placement** | $750 / 90 days |
| **Route Partner** | $1,250 / 90 days |
| **Website + Local SEO Upgrade** | Starting at $1,500 |
| **Lead + Inquiry System** | Starting at $2,500 |
| **AI Restaurant Concierge** | Starting at $3,500 |
| **QR Funnel System** | Starting at $1,000 |
| **Review + Repeat Guest System** | Starting at $1,500 |
| **Full AI Restaurant Growth System** | Starting at $7,500+ |
| **Ongoing Growth Management** | $500–$2,500/mo |

**Sales guidance:** Start with the smallest useful offer that matches the restaurant’s primary bottleneck (visibility, path, capture, QR, reviews, or full system). Expand only after proof and owner approval.

---

## Restaurant Guardrails

**Do not promise:**

- No guaranteed reservations
- No guaranteed visitor traffic
- No guaranteed revenue
- No guaranteed Google rankings
- No fake reviews
- No forced recommendations
- No AI replacing staff
- No unapproved customer-facing messages
- No public listing before owner approval
- No payment/invoice automation from the dashboard

These guardrails appear in the dashboard UI and should carry through to any public-facing materials.

---

## Allowed Positioning

**Safe positioning themes:**

- Better visitor visibility
- Better customer path
- Better inquiry capture
- Better QR/funnel tracking
- Better owner visibility
- Better follow-up process
- Practical AI assistance with owner approval

Additional internal guidance: *Start small, improve after proof.*

---

## What The Public Website Still Needs

Future public-facing work (not in scope for Restaurant Program v1 dashboard):

1. **Restaurant Partner Program page or section** — Public overview of how restaurants partner with Where To Go SA.
2. **AI Restaurant Growth Systems page or section** — Public explanation of growth system tiers without exposing internal sales tooling.
3. **Restaurant inquiry/intake form or smart form** — Structured lead capture for inbound restaurant interest.
4. **Restaurant partner CTA buttons** — Sitewide or page-level CTAs routing to the inquiry flow.
5. **Lead routing into Owner Dashboard** — Connect form submissions to prospect records (or a staging queue) in Owner Command.
6. **Restaurant prospect/client database mapping** — Clear field mapping between public form data and dashboard prospect/client records.
7. **Public-safe pricing/offer presentation** — Simplified, conversion-focused offer presentation (not the full internal ladder).
8. **Approval process before any restaurant is listed publicly** — Owner sign-off workflow before live placement.
9. **Optional QR funnel strategy** — Public-facing QR landing pages tied to partner onboarding (separate build).
10. **Optional payment link process, separate from dashboard** — Manual or third-party payment links; not wired to dashboard automation.

---

## Recommended Next Build

Suggested order for the next website/funnel build thread:

1. **Final dashboard QA and mobile polish** — Validate Restaurant Sales Mode on mobile; confirm stage markers, copy tools, and export reports.
2. **Public restaurant funnel plan in website thread** — Map public pages, form fields, and lead routing before coding.
3. **Restaurant Partner Program page** — Primary conversion page for restaurant partners.
4. **AI Restaurant Growth Systems page/section** — Supporting page for higher-tier system interest.
5. **Restaurant intake/request flow** — Smart form with owner-approved fields and guardrail-safe copy.
6. **Connect restaurant form submissions into Owner Dashboard** — Inbound leads appear as prospects with correct stage defaults.
7. **Create sales rep training PDF/manual** — Operational guide derived from this handoff and dashboard workflows.

---

## Notes For Future Build Thread

- **The dashboard is the internal operating system.** It is where owners and reps research, stage, copy, and report. It should remain feature-rich and workflow-oriented.
- **The website should become the public intake and sales funnel.** It should attract interest, explain the program simply, and capture qualified leads — not replicate every dashboard tool.
- **Do not duplicate every dashboard tool publicly.** Public pages should be simpler, cleaner, and conversion-focused.
- **Do not expose internal research scores, rep notes, or full offer ladders** on public pages without owner review.
- **All customer-facing placement, messaging, and listings require owner approval** before go-live.
- **Payments, invoices, SMS, and email** remain separate until explicitly approved and integrated.
- **Source of truth for v1 behavior:** `owner-dashboard/index.html` (Restaurant Sales Mode constants, UI sections, stage logic, offer map, guardrails).

---

*Document created for internal handoff. Restaurant Program v1 — Owner Command Dashboard.*
