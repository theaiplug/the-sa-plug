# Tech Stack Status

Last updated: 2026-05-22

## Purpose
Tracks Where To Go SA technical setup, hosting, repo, Netlify, Supabase, functions, env vars, dashboard API behavior, and integration rules.

## Current Known Stack
- GitHub repo/project folder likely still named `the-sa-plug`
- Netlify hosting
- Legacy Netlify project: `the-sa-plug`
- Public domain direction: `wheretogosa.com`
- Supabase for request/lead data
- Netlify functions for server-side data/actions
- Owner Dashboard protected by dashboard key
- Twilio and Resend may be used for alerting where configured

## Important URLs / Names
Legacy Netlify URL may still be:
https://the-sa-plug.netlify.app

Owner Dashboard route likely:
`/owner-dashboard/`

Public brand:
Where To Go SA

Old/internal/repo name:
The SA Plug

## Known Contact / Business Setup
Phone:
(830) 355-3353

Email:
aibusinessplug@gmail.com

## Dashboard Technical Notes
Dashboard data likely uses Netlify functions and Supabase queries for:
- business leads
- transportation requests
- restaurant prospect/client detection from existing business lead fields and owner_notes
- owner notes/status updates
- export/copy summaries

Potential dashboard tables:
- `business_leads`
- `transportation_requests`

## Environment Variable Rules
Never expose:
- Supabase service role key
- Twilio auth token
- Resend API key
- Owner dashboard key
- Any secrets

Safe logging only:
- env var present: true/false
- function started
- table queried
- sanitized error message
- response status

## Stability Rules
- Public website work should not break owner dashboard functions.
- Dashboard should degrade gracefully if optional SMS/email services fail.
- Missing optional fields should not crash the whole dashboard.
- If restaurant-specific fields are not real columns, use `owner_notes` markers and defensive mapping.
- Do not require new schema unless necessary.
- If one dashboard section fails, return partial data when possible.

## Known Dashboard Runtime Error Pattern
If the dashboard shows:
“Data unavailable. Dashboard data is temporarily unavailable. Check Netlify function logs.”

Then:
1. Check latest Netlify function logs.
2. Identify exact dashboard fetch route.
3. Add safe logs.
4. Confirm Supabase env vars exist.
5. Confirm queries match actual schema.
6. Avoid total failure from optional restaurant mapping.
7. Return safe empty arrays and section-level errors.

## Important Rules
- Do not log secrets.
- Do not expose private dashboard data publicly.
- Do not change public nav while debugging backend functions.
- Do not connect payments/invoices until explicitly planned.
- Do not enable automatic SMS/email without clear approval.

## Current Recommended Next Steps
1. Keep dashboard data loading stable.
2. Add restaurant form routing only after public restaurant funnel is built.
3. Update this file after any Netlify/Supabase/function/env var changes.
