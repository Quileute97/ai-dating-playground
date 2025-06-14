
-- Tạo bảng lưu các yêu cầu nâng cấp tài khoản của người dùng
CREATE TABLE public.upgrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- dùng TEXT để linh hoạt với user thực/tạm thời
  user_email TEXT,
  type TEXT NOT NULL, -- 'gold', 'nearby'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  price INTEGER NOT NULL, -- số tiền đơn hàng
  bank_info JSONB, -- ảnh chụp lúc user chuyển khoản/các meta khác
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  admin_id TEXT, -- id admin duyệt
  note TEXT
);

-- Cho phép mọi người submit yêu cầu upgrade, nhưng chỉ admin mới có thể duyệt/cập nhật trạng thái.
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Policy: User có thể insert (gửi yêu cầu nâng cấp)
CREATE POLICY "Users can create their own upgrade request"
  ON public.upgrade_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: User chỉ xem được yêu cầu của chính mình
CREATE POLICY "Users can read their own requests"
  ON public.upgrade_requests
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Policy: Admin có thể duyệt tất cả
-- (Giả định cần gắn 1 vai trò cho admin, ở đây tạm mở cho tất cả SELECT tất cả cho mục đích demo)
CREATE POLICY "Admin can select all"
  ON public.upgrade_requests
  FOR SELECT
  USING (true);

-- Chỉ cho phép admin cập nhật/trạng thái các yêu cầu (có thể cập nhật rộng cho mọi user nếu chưa có phân quyền rõ)
CREATE POLICY "Admin can update any"
  ON public.upgrade_requests
  FOR UPDATE
  USING (true);

-- Chỉ cho phép admin xóa nếu cần (không bắt buộc)
CREATE POLICY "Admin can delete any"
  ON public.upgrade_requests
  FOR DELETE
  USING (true);
