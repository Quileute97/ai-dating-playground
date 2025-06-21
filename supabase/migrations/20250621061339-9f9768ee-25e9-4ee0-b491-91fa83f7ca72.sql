
-- Add columns to upgrade_requests table for package duration and expiry
ALTER TABLE public.upgrade_requests 
ADD COLUMN duration_days INTEGER,
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have unlimited duration (for backward compatibility)
UPDATE public.upgrade_requests 
SET duration_days = -1 
WHERE type = 'nearby' AND duration_days IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.upgrade_requests.duration_days IS 'Duration in days: 7 for week, 30 for month, -1 for unlimited';
COMMENT ON COLUMN public.upgrade_requests.expires_at IS 'When the subscription expires, NULL for unlimited packages';
