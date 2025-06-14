
-- Bảng lưu các lượt "thích" giữa các user
CREATE TABLE public.user_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id TEXT NOT NULL,         -- user nào đã bấm thích (có thể là user thật/tạm thời)
  liked_id TEXT NOT NULL,         -- user được thích
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chỉ cho phép user tạo like cho bất kỳ ai
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Ai cũng được phép insert (demo, để kiểm tra nhanh)
CREATE POLICY "Anyone can add likes"
  ON public.user_likes
  FOR INSERT
  WITH CHECK (true);

-- Policy: Người dùng chỉ xem được các lượt like của mình (hoặc có thể mở rộng cho mọi người xem hết để debug)
CREATE POLICY "Anyone can read likes"
  ON public.user_likes
  FOR SELECT
  USING (true);

-- (Tùy chọn có thể chỉnh lại sau: update/delete)
