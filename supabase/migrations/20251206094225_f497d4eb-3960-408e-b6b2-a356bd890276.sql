-- Update existing profiles with old default avatar to NULL (so getDefaultAvatar can work)
UPDATE public.profiles 
SET avatar = NULL 
WHERE avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

-- Update the trigger function to not set a default avatar
CREATE OR REPLACE FUNCTION public.handle_new_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    NULL,  -- Let frontend handle default avatar based on gender
    '{"age_range": {"min": 18, "max": 35}, "distance": 50, "gender_preference": "all"}'::jsonb,
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    age = COALESCE(EXCLUDED.age, profiles.age),
    gender = COALESCE(EXCLUDED.gender, profiles.gender),
    last_active = now();
  RETURN NEW;
END;
$function$;