
-- Enable realtime for important tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.user_likes REPLICA IDENTITY FULL;
ALTER TABLE public.friends REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Add RLS policies for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all posts" 
  ON public.posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Add RLS policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" 
  ON public.comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.comments 
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Add RLS policies for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all post likes" 
  ON public.post_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own post likes" 
  ON public.post_likes 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own post likes" 
  ON public.post_likes 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Add RLS policies for user_likes
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user likes" 
  ON public.user_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own user likes" 
  ON public.user_likes 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = liker_id);

CREATE POLICY "Users can delete their own user likes" 
  ON public.user_likes 
  FOR DELETE 
  USING (auth.uid()::text = liker_id);

-- Add RLS policies for friends
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend requests" 
  ON public.friends 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" 
  ON public.friends 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests they're involved in" 
  ON public.friends 
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friend requests" 
  ON public.friends 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_real_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_real_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_real_id);

-- Add missing bio column to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'album') THEN
        ALTER TABLE public.profiles ADD COLUMN album JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE public.profiles ADD COLUMN interests JSONB DEFAULT '[]';
    END IF;
END $$;
