-- Owner Command Dashboard v2 — status + owner notes workflow
-- Run in Supabase SQL Editor if columns are missing.
-- Safe to re-run: uses IF NOT EXISTS / conditional alters.

-- business_leads
ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS status text;

ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS owner_notes text;

ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.business_leads
SET status = 'new'
WHERE status IS NULL OR btrim(status) = '';

UPDATE public.business_leads
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE public.business_leads
  ALTER COLUMN status SET DEFAULT 'new';

-- transportation_requests
ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS owner_notes text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS lead_type text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS next_action text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS preferred_contact_method text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS requested_date text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS time_window text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS trip_type text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS transportation_need text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS flight_number text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS hotel_or_resort text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS accessibility_needs text;

ALTER TABLE public.transportation_requests
  ADD COLUMN IF NOT EXISTS child_seats_needed text;

UPDATE public.transportation_requests
SET status = 'New'
WHERE status IS NULL OR btrim(status) = '';

UPDATE public.transportation_requests
SET updated_at = created_at
WHERE updated_at IS NULL;

UPDATE public.transportation_requests
SET lead_type = 'transportation_request'
WHERE lead_type IS NULL OR btrim(lead_type) = '';

UPDATE public.transportation_requests
SET next_action = 'review route request'
WHERE next_action IS NULL OR btrim(next_action) = '';

ALTER TABLE public.transportation_requests
  ALTER COLUMN status SET DEFAULT 'New';

ALTER TABLE public.transportation_requests
  ALTER COLUMN lead_type SET DEFAULT 'transportation_request';

ALTER TABLE public.transportation_requests
  ALTER COLUMN next_action SET DEFAULT 'review route request';
