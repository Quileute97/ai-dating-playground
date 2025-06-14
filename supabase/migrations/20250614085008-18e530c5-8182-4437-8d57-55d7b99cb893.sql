
-- Bảng lưu các bài đăng
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now(),
  location jsonb,
  media_url text,
  media_type text,
  sticker jsonb
);

-- Bảng lưu comment của mỗi bài đăng
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now()
);

-- Bảng lưu like của mỗi bài đăng
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- Bật Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- RLS cho posts: chỉ user tạo post được INSERT/DELETE, ai cũng được SELECT
CREATE POLICY "Select all posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Insert own post" ON public.posts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Delete own post" ON public.posts FOR DELETE USING (user_id = auth.uid()::text);

-- RLS cho comments: ai cũng được SELECT, chỉ user được viết hoặc xóa comment của mình
CREATE POLICY "Select all comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Insert own comment" ON public.comments FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Delete own comment" ON public.comments FOR DELETE USING (user_id = auth.uid()::text);

-- RLS cho post_likes: ai cũng được SELECT, chỉ user được insert/delete like của mình
CREATE POLICY "Select all post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Insert own like" ON public.post_likes FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Delete own like" ON public.post_likes FOR DELETE USING (user_id = auth.uid()::text);
