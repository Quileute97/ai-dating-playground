
-- Tạo bảng AI Prompts
CREATE TABLE public.ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  prompt text NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tạo bảng Fake Users
CREATE TABLE public.fake_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar text,
  gender text,
  age integer,
  bio text,
  ai_prompt_id uuid REFERENCES public.ai_prompts(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Bật Row Level Security
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fake_users ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép tất cả đọc và ghi (đơn giản cho quản trị) -- sau này có thể thêm kiểm soát chặt chẽ hơn
CREATE POLICY "Anon can read ai_prompts" ON public.ai_prompts FOR SELECT USING (true);
CREATE POLICY "Anon can manage ai_prompts" ON public.ai_prompts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anon can read fake_users" ON public.fake_users FOR SELECT USING (true);
CREATE POLICY "Anon can manage fake_users" ON public.fake_users FOR ALL USING (true) WITH CHECK (true);
