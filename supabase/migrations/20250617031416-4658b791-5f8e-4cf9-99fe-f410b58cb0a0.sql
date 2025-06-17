
-- Cập nhật bảng profiles để có đầy đủ thông tin hồ sơ hẹn hò
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dating_preferences JSONB DEFAULT '{"age_range": {"min": 18, "max": 35}, "distance": 50, "gender_preference": "all"}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_dating_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Cập nhật function handle_new_profile để tự động tạo hồ sơ hẹn hò
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    age, 
    gender, 
    avatar,
    dating_preferences,
    is_dating_active,
    last_active
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'age')::integer, 25),
    COALESCE(NEW.raw_user_meta_data ->> 'gender', 'other'),
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    '{"age_range": {"min": 18, "max": 35}, "distance": 50, "gender_preference": "all"}'::jsonb,
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    age = COALESCE(EXCLUDED.age, profiles.age),
    gender = COALESCE(EXCLUDED.gender, profiles.gender),
    avatar = COALESCE(EXCLUDED.avatar, profiles.avatar),
    last_active = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cập nhật RLS policies cho profiles
DROP POLICY IF EXISTS "Allow everyone to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert/update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Allow everyone to read active dating profiles"
  ON public.profiles
  FOR SELECT
  USING (is_dating_active = true OR id = auth.uid()::text);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT 
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE 
  USING (id = auth.uid()::text);

-- Index để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_profiles_dating_active ON public.profiles(is_dating_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(lat, lng) WHERE is_dating_active = true;
