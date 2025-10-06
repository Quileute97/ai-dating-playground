-- Fix database functions to set search_path for security

-- Update existing functions to include search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.like_fake_user(liker_id_param text, liked_id_param text, liker_type_param text, liked_type_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  existing_like_id uuid;
  is_matched boolean := false;
BEGIN
  -- Check if like already exists
  SELECT id INTO existing_like_id 
  FROM user_likes 
  WHERE liker_id = liker_id_param AND liked_id = liked_id_param;
  
  -- If like doesn't exist, create it
  IF existing_like_id IS NULL THEN
    INSERT INTO user_likes (liker_id, liked_id)
    VALUES (liker_id_param, liked_id_param);
    
    -- Check if it's a match (fake user likes back)
    IF liked_type_param = 'fake' THEN
      -- Auto-like back from fake user (80% chance)
      IF random() > 0.2 THEN
        INSERT INTO user_likes (liker_id, liked_id)
        VALUES (liked_id_param, liker_id_param)
        ON CONFLICT (liker_id, liked_id) DO NOTHING;
        is_matched := true;
      END IF;
    END IF;
  END IF;
  
  RETURN is_matched;
END;
$function$;

CREATE OR REPLACE FUNCTION public.like_fake_post(post_id_param uuid, user_id_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert or ignore if already exists
  INSERT INTO post_likes (post_id, user_id)
  VALUES (post_id_param, user_id_param)
  ON CONFLICT (post_id, user_id) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.comment_on_fake_post(post_id_param uuid, user_id_param text, content_param text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_comment_id uuid;
BEGIN
  INSERT INTO comments (post_id, user_id, content)
  VALUES (post_id_param, user_id_param, content_param)
  RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_timeline_with_fake_posts(user_id_param text DEFAULT NULL::text, limit_param integer DEFAULT 20, offset_param integer DEFAULT 0)
RETURNS TABLE(id uuid, content text, media_url text, media_type text, location jsonb, sticker jsonb, created_at timestamp with time zone, user_id text, user_name text, user_avatar text, user_age integer, user_gender text, is_fake_user boolean, like_count bigint, comment_count bigint, user_has_liked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    -- Real user posts
    SELECT 
        p.id,
        p.content,
        p.media_url,
        p.media_type,
        p.location,
        p.sticker,
        p.created_at,
        p.user_id,
        pr.name as user_name,
        pr.avatar as user_avatar,
        pr.age as user_age,
        pr.gender as user_gender,
        false as is_fake_user,
        COALESCE(like_counts.like_count, 0) as like_count,
        COALESCE(comment_counts.comment_count, 0) as comment_count,
        CASE WHEN user_likes.id IS NOT NULL THEN true ELSE false END as user_has_liked
    FROM public.posts p
    LEFT JOIN public.profiles pr ON p.user_id = pr.id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
        FROM public.post_likes
        GROUP BY post_id
    ) like_counts ON p.id = like_counts.post_id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as comment_count
        FROM public.comments
        GROUP BY post_id
    ) comment_counts ON p.id = comment_counts.post_id
    LEFT JOIN public.post_likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = user_id_param
    
    UNION ALL
    
    -- Fake user posts
    SELECT 
        fup.id,
        fup.content,
        fup.media_url,
        fup.media_type,
        fup.location,
        fup.sticker,
        fup.created_at,
        fup.fake_user_id::text as user_id,
        fu.name as user_name,
        fu.avatar as user_avatar,
        fu.age as user_age,
        fu.gender as user_gender,
        true as is_fake_user,
        0::bigint as like_count,
        0::bigint as comment_count,
        false as user_has_liked
    FROM public.fake_user_posts fup
    LEFT JOIN public.fake_users fu ON fup.fake_user_id = fu.id
    WHERE fu.is_active = true
    
    ORDER BY created_at DESC
    LIMIT limit_param OFFSET offset_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_friend_request_to_fake_user(real_user_id uuid, fake_user_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_request_id uuid;
BEGIN
  -- Insert friend request
  INSERT INTO friends (user_id, friend_id, status)
  VALUES (real_user_id, fake_user_id::uuid, 'pending')
  ON CONFLICT (user_id, friend_id) DO NOTHING
  RETURNING id INTO new_request_id;
  
  -- Auto-accept from fake user (90% chance)
  IF random() > 0.1 AND new_request_id IS NOT NULL THEN
    UPDATE friends 
    SET status = 'accepted', accepted_at = now()
    WHERE id = new_request_id;
  END IF;
  
  RETURN new_request_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_fake_users_for_dating(user_lat double precision, user_lng double precision, max_distance integer DEFAULT 50, min_age integer DEFAULT 18, max_age integer DEFAULT 35, gender_pref text DEFAULT 'all'::text)
RETURNS TABLE(id uuid, name text, avatar text, age integer, gender text, bio text, lat double precision, lng double precision, location_name text, album jsonb, height integer, job text, education text, interests jsonb, distance_km double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        fu.id,
        fu.name,
        fu.avatar,
        fu.age,
        fu.gender,
        fu.bio,
        fu.lat,
        fu.lng,
        fu.location_name,
        fu.album,
        fu.height,
        fu.job,
        fu.education,
        fu.interests,
        CASE 
            WHEN fu.lat IS NOT NULL AND fu.lng IS NOT NULL AND user_lat IS NOT NULL AND user_lng IS NOT NULL
            THEN 6371 * acos(cos(radians(user_lat)) * cos(radians(fu.lat)) * cos(radians(fu.lng) - radians(user_lng)) + sin(radians(user_lat)) * sin(radians(fu.lat)))
            ELSE 999999
        END as distance_km
    FROM public.fake_users fu
    WHERE fu.is_active = true
        AND fu.is_dating_active = true
        AND (fu.age IS NULL OR (fu.age >= min_age AND fu.age <= max_age))
        AND (gender_pref = 'all' OR fu.gender = gender_pref)
    ORDER BY 
        CASE 
            WHEN fu.lat IS NULL OR fu.lng IS NULL THEN 1
            ELSE 0
        END,
        distance_km NULLS LAST, 
        fu.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_conversation_with_fake_user(real_user_id uuid, fake_user_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  conversation_id uuid;
BEGIN
  -- Check if conversation already exists
  SELECT id INTO conversation_id
  FROM conversations
  WHERE user_real_id = real_user_id AND user_fake_id = fake_user_id;
  
  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (user_real_id, user_fake_id)
    VALUES (real_user_id, fake_user_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$function$;