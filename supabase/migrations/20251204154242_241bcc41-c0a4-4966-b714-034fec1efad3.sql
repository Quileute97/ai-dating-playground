-- Create fake_post_likes table
CREATE TABLE public.fake_post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.fake_user_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create fake_post_comments table
CREATE TABLE public.fake_post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.fake_user_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  content text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fake_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fake_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for fake_post_likes
CREATE POLICY "Anyone can view fake post likes" ON public.fake_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like fake posts" ON public.fake_post_likes
  FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can unlike fake posts" ON public.fake_post_likes
  FOR DELETE USING ((auth.uid())::text = user_id);

-- RLS policies for fake_post_comments  
CREATE POLICY "Anyone can view fake post comments" ON public.fake_post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can comment on fake posts" ON public.fake_post_comments
  FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete own comments" ON public.fake_post_comments
  FOR DELETE USING ((auth.uid())::text = user_id);

-- Update get_timeline_with_fake_posts to include fake post likes/comments count
CREATE OR REPLACE FUNCTION public.get_timeline_with_fake_posts(user_id_param text DEFAULT NULL::text, limit_param integer DEFAULT 20, offset_param integer DEFAULT 0)
 RETURNS TABLE(id uuid, content text, media_url text, media_type text, location jsonb, sticker jsonb, created_at timestamp with time zone, user_id text, user_name text, user_avatar text, user_age integer, user_gender text, is_fake_user boolean, like_count bigint, comment_count bigint, user_has_liked boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
    
    -- Fake user posts with proper like/comment counts
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
        COALESCE(fake_like_counts.like_count, 0)::bigint as like_count,
        COALESCE(fake_comment_counts.comment_count, 0)::bigint as comment_count,
        CASE WHEN fake_user_likes.id IS NOT NULL THEN true ELSE false END as user_has_liked
    FROM public.fake_user_posts fup
    LEFT JOIN public.fake_users fu ON fup.fake_user_id = fu.id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
        FROM public.fake_post_likes
        GROUP BY post_id
    ) fake_like_counts ON fup.id = fake_like_counts.post_id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as comment_count
        FROM public.fake_post_comments
        GROUP BY post_id
    ) fake_comment_counts ON fup.id = fake_comment_counts.post_id
    LEFT JOIN public.fake_post_likes fake_user_likes ON fup.id = fake_user_likes.post_id AND fake_user_likes.user_id = user_id_param
    WHERE fu.is_active = true
    
    ORDER BY created_at DESC
    LIMIT limit_param OFFSET offset_param;
END;
$function$;