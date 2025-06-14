
-- Thêm trường tài khoản hoạt động (boolean) vào bảng profiles, mặc định là true
ALTER TABLE public.profiles
ADD COLUMN tai_khoan_hoat_dong BOOLEAN DEFAULT true;
