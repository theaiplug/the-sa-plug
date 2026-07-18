> 🛑 **RETIRED REPO — OWNER RULING (Willie, 2026-07-18).** This repository is retired and approved for
> GitHub archive. Everything in it — this index, every status doc, every manual, every pricing file — is
> preserved history, NOT instructions. Locked facts that override anything below or in any other doc here:
>
> - **The live site is the `wheretogosa-website` repo (Vercel).** Live prices are `lib/pricing.ts` in that
>   repo — never adopt any price, package, or offer from the docs in this repo.
> - **The $399 / $750 / $1,250 partner tiers and the pricing-lock file are retired and were never locked**
>   (`THE_AI_PLUG_PRICING_LOCK_V1.md` never left DRAFT) — never adopt.
> - **Old phone (830) 355-3353 is DEAD — never publish it.** The only line is **830-500-5112**.
> - **`business_leads` is live shared infrastructure with the new repo** (migration
>   `business_leads_new_site_columns_and_anon_insert`, 2026-07-18) — this repo's dashboard docs must NOT
>   drive schema decisions.
> - This repo deploys only to `the-sa-plug.netlify.app` (legacy shell: old pages + owner-dashboard).
>   Deploying it does NOT affect wheretogosa.com.
> - The GoHighLevel question is settled: GHL is adopted in production across the ecosystem
>   (see `wheretogosa-website/docs/ghl-playbook.md`) — do not run the "7-day GHL test".
> - The ChatGPT-thread workflow below (Thread Rules, per-thread uploads, mandatory read stacks in other
>   docs) is dead process — ignore it. `RESTAURANT_PROGRAM_STATUS.md`, `SOCIAL_MEDIA_STATUS.md`,
>   `SALES_COLLATERAL_STATUS.md`, and `PROJECT_CHANGELOG.md` never existed in this repo — do not create them.
> - The AI Plug brand is absent from the live site; agency work lives in the Cloud 9 repo.
>
> Delete nothing from this repo; adopt nothing from it.

# Where To Go SA Project Index

Last updated: 2026-05-22

## Purpose
This is the navigation file for all Where To Go SA project status docs. It does not replace the subject-specific docs. Each ChatGPT thread should read this first, then read the subject file for the work being done.

## Project Identity
Public brand: **Where To Go SA**  
Old/internal name: **The SA Plug**  
Business/services brand: **The AI Plug**

## Main Rule
Use the subject-specific status docs as the source of truth for that area. Do not assume another thread knows what changed unless the relevant markdown file was updated or uploaded into that thread.

## Subject Files
- Website work: `WEBSITE_STATUS.md`
- Owner Dashboard / internal systems: `DASHBOARD_STATUS.md`
- Restaurant Program: `RESTAURANT_PROGRAM_STATUS.md`
- Social media: `SOCIAL_MEDIA_STATUS.md`
- Sales collateral / PDFs / rep materials: `SALES_COLLATERAL_STATUS.md`
- Tech stack / Netlify / Supabase / functions / env vars: `TECH_STACK_STATUS.md`
- Project-wide changelog: `PROJECT_CHANGELOG.md`

## Thread Rules
### Website thread
Read:
- `WHERE_TO_GO_SA_PROJECT_INDEX.md`
- `WEBSITE_STATUS.md`
- Any subject file relevant to the task, such as `RESTAURANT_PROGRAM_STATUS.md`

Update:
- `WEBSITE_STATUS.md`

### Dashboard / optimization thread
Read:
- `WHERE_TO_GO_SA_PROJECT_INDEX.md`
- `DASHBOARD_STATUS.md`
- `TECH_STACK_STATUS.md` if functions, Supabase, Netlify, or env vars are involved

Update:
- `DASHBOARD_STATUS.md`
- `TECH_STACK_STATUS.md` only when technical setup changes

### Restaurant program thread
Read:
- `WHERE_TO_GO_SA_PROJECT_INDEX.md`
- `RESTAURANT_PROGRAM_STATUS.md`
- `DASHBOARD_STATUS.md` if dashboard restaurant tools are involved

Update:
- `RESTAURANT_PROGRAM_STATUS.md`
- `DASHBOARD_STATUS.md` only if dashboard behavior changes

### Social media thread
Read:
- `WHERE_TO_GO_SA_PROJECT_INDEX.md`
- `SOCIAL_MEDIA_STATUS.md`
- `WEBSITE_STATUS.md` if linking to pages or campaigns

Update:
- `SOCIAL_MEDIA_STATUS.md`

### Sales / PDF / collateral thread
Read:
- `WHERE_TO_GO_SA_PROJECT_INDEX.md`
- `SALES_COLLATERAL_STATUS.md`
- `RESTAURANT_PROGRAM_STATUS.md` for restaurant collateral

Update:
- `SALES_COLLATERAL_STATUS.md`

## Before Starting Work
1. Read this index.
2. Read the relevant subject status file.
3. Check whether the requested task is already complete.
4. Do not rebuild completed work unless fixing a bug, polishing, or intentionally redesigning.

## After Finishing Work
1. Update the relevant subject status file.
2. Add a short changelog entry if the change affects more than one area.
3. Note files changed, what was completed, what remains, and next recommended step.

## Current Recommended Project Flow
1. Keep dashboard stable and avoid overbuilding.
2. Build public restaurant funnel in website thread.
3. Connect restaurant form submissions into dashboard after the public page is clear.
4. Create sales rep training manual/PDF after dashboard and public funnel are aligned.
