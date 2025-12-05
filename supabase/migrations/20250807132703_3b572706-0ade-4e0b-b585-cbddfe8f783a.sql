-- Update RLS policies for posts table to allow admin management
DROP POLICY IF EXISTS "Admin can manage all posts" ON public.posts;

CREATE POLICY "Admin can manage all posts"
ON public.posts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Update RLS policies for post_likes table to allow admin management
DROP POLICY IF EXISTS "Admin can manage all post likes" ON public.post_likes;

CREATE POLICY "Admin can manage all post likes"
ON public.post_likes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Update RLS policies for comments table to allow admin management
DROP POLICY IF EXISTS "Admin can manage all comments" ON public.comments;

CREATE POLICY "Admin can manage all comments"
ON public.comments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);