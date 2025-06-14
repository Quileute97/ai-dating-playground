
-- Tạo bảng để lưu thông tin ngân hàng, chỉ có duy nhất 1 dòng
CREATE TABLE public.bank_info (
  id SERIAL PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  qr_url TEXT, -- base64 hoặc url storage
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chỉ cho admin cập nhật/lấy thông tin này
-- (bạn có thể tùy chỉnh lại policy sau, hiện tại sẽ cho tất cả authenticated users)
ALTER TABLE public.bank_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bank info readable" ON public.bank_info
  FOR SELECT
  USING (true);

CREATE POLICY "Bank info updatable" ON public.bank_info
  FOR UPDATE
  USING (true);

CREATE POLICY "Bank info insertable" ON public.bank_info
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Bank info deletable" ON public.bank_info
  FOR DELETE
  USING (false);
