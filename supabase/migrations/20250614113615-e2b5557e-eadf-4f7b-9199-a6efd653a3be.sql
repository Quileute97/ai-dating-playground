
-- Tạo bảng lưu thông tin kết bạn giữa 2 user (dùng kiểu uuid)
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,              -- user gửi kết bạn
  friend_id UUID NOT NULL,            -- user được mời kết bạn
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE (user_id, friend_id)
);

-- Bật RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Ai cũng được gửi lời mời: cho phép insert nếu user là một trong hai bên
CREATE POLICY "Self can insert friend request"
  ON public.friends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Chỉ hai người liên quan xem được "friends"
CREATE POLICY "Self only can select/see friends"
  ON public.friends
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Chỉ user_id hoặc friend_id update status
CREATE POLICY "Allow update friends for both"
  ON public.friends
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Chỉ user_id hoặc friend_id xóa
CREATE POLICY "Allow delete friendship for both"
  ON public.friends
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Trigger: tự động tạo profile cho user mới (nếu chưa có)
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users;
CREATE TRIGGER create_profile_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();
