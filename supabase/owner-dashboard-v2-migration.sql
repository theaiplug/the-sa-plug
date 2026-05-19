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

UPDATE public.transportation_requests
SET status = 'new'
WHERE status IS NULL OR btrim(status) = '';

UPDATE public.transportation_requests
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE public.transportation_requests
  ALTER COLUMN status SET DEFAULT 'new';
