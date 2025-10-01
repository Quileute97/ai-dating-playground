-- Create admin_settings table to store global app settings
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage all settings
CREATE POLICY "Admin can manage all settings"
ON public.admin_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Everyone can read settings (needed for features to check)
CREATE POLICY "Everyone can read settings"
ON public.admin_settings
FOR SELECT
USING (true);

-- Insert default setting for dating premium requirement
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES (
  'dating_requires_premium',
  '{"enabled": true}'::jsonb,
  'Whether dating features require premium subscription'
) ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER update_admin_settings_timestamp
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION update_admin_settings_updated_at();