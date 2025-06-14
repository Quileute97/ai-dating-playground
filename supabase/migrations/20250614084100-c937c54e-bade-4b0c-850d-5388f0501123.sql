
-- 1. Tạo bảng profiles để lưu thông tin khách hàng (bao gồm vị trí)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,                       -- id này map với id trong auth hoặc logic của bạn
  name TEXT,
  avatar TEXT,
  age INTEGER,
  gender TEXT,
  lat DOUBLE PRECISION,                      -- vị trí latitude của user (nullable)
  lng DOUBLE PRECISION,                      -- vị trí longitude của user (nullable)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cho phép đọc profiles: ai cũng có thể xem được user quanh đây (dùng cho "Nearby")
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow everyone to read profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert/update their own profile"
  ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE USING (true);

-- Nếu đã có bảng này thì chỉ cần thêm trường lat, lng:
-- ALTER TABLE public.profiles ADD COLUMN lat DOUBLE PRECISION;
-- ALTER TABLE public.profiles ADD COLUMN lng DOUBLE PRECISION;
