-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to ping sitemap every hour
-- Note: You need to replace the URL with your actual Supabase project URL
SELECT cron.schedule(
  'ping-sitemap-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/ping-google-sitemap',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXBtc2J0dHhma25rem5ibnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODQwMjMsImV4cCI6MjA2NTQ2MDAyM30.U0ur6BLFqhRJgcqTXGWgdqsWXwryQGw7YcMQp9XT364"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Create a function to manually trigger sitemap ping (useful for testing)
CREATE OR REPLACE FUNCTION public.trigger_sitemap_ping()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT net.http_post(
    url:='https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/ping-google-sitemap',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXBtc2J0dHhma25rem5ibnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODQwMjMsImV4cCI6MjA2NTQ2MDAyM30.U0ur6BLFqhRJgcqTXGWgdqsWXwryQGw7YcMQp9XT364"}'::jsonb,
    body:='{"manual_trigger": true}'::jsonb
  ) INTO result;
  
  RETURN result;
END;
$$;
