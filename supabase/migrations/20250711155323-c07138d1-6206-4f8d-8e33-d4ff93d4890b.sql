-- Đảm bảo table fake_users đã có đủ cột cần thiết
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS dating_preferences JSONB DEFAULT '{"distance": 50, "age_range": {"max": 35, "min": 18}, "gender_preference": "all"}'::jsonb;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS album JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS job TEXT;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS is_dating_active BOOLEAN DEFAULT true;
ALTER TABLE public.fake_users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Tạo bảng fake_user_posts để admin có thể đăng bài bằng fake users
CREATE TABLE IF NOT EXISTS public.fake_user_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    fake_user_id UUID NOT NULL REFERENCES public.fake_users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    location JSONB,
    sticker JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS cho fake_user_posts
ALTER TABLE public.fake_user_posts ENABLE ROW LEVEL SECURITY;

-- Policies cho fake_user_posts
CREATE POLICY "Admin can manage fake user posts" 
ON public.fake_user_posts 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Everyone can view fake user posts" 
ON public.fake_user_posts 
FOR SELECT 
USING (true);

-- Tạo bảng admin_messages để admin trả lời tin nhắn bằng fake users
CREATE TABLE IF NOT EXISTS public.admin_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    fake_user_id UUID NOT NULL REFERENCES public.fake_users(id) ON DELETE CASCADE,
    real_user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_from_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS cho admin_messages
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Policies cho admin_messages
CREATE POLICY "Admin can manage admin messages" 
ON public.admin_messages 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view messages sent to them" 
ON public.admin_messages 
FOR SELECT 
USING (real_user_id = (auth.uid())::text);

-- Update fake_users để có đầy đủ RLS policies
DROP POLICY IF EXISTS "Anon can manage fake_users" ON public.fake_users;
DROP POLICY IF EXISTS "Anon can read fake_users" ON public.fake_users;

CREATE POLICY "Admin can manage fake users" 
ON public.fake_users 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Everyone can view active fake users" 
ON public.fake_users 
FOR SELECT 
USING (is_active = true);

-- Function để lấy fake users cho dating
CREATE OR REPLACE FUNCTION public.get_fake_users_for_dating(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    max_distance INTEGER DEFAULT 50,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 35,
    gender_pref TEXT DEFAULT 'all'
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    avatar TEXT,
    age INTEGER,
    gender TEXT,
    bio TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    location_name TEXT,
    album JSONB,
    height INTEGER,
    job TEXT,
    education TEXT,
    interests JSONB,
    distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
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
            ELSE NULL
        END as distance_km
    FROM public.fake_users fu
    WHERE fu.is_active = true
        AND fu.is_dating_active = true
        AND (fu.age IS NULL OR (fu.age >= min_age AND fu.age <= max_age))
        AND (gender_pref = 'all' OR fu.gender = gender_pref)
        AND (
            user_lat IS NULL OR user_lng IS NULL OR fu.lat IS NULL OR fu.lng IS NULL OR
            6371 * acos(cos(radians(user_lat)) * cos(radians(fu.lat)) * cos(radians(fu.lng) - radians(user_lng)) + sin(radians(user_lat)) * sin(radians(fu.lat))) <= max_distance
        )
    ORDER BY distance_km NULLS LAST, fu.created_at DESC;
END;
$$;

-- Function để merge fake user posts vào timeline
CREATE OR REPLACE FUNCTION public.get_timeline_with_fake_posts(
    user_id_param TEXT DEFAULT NULL,
    limit_param INTEGER DEFAULT 20,
    offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    location JSONB,
    sticker JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    user_id TEXT,
    user_name TEXT,
    user_avatar TEXT,
    user_age INTEGER,
    user_gender TEXT,
    is_fake_user BOOLEAN,
    like_count BIGINT,
    comment_count BIGINT,
    user_has_liked BOOLEAN
)
LANGUAGE plpgsql
AS $$
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
$$;