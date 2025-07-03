
-- Tạo bảng lưu trữ hóa đơn PayOS
CREATE TABLE public.payos_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_code BIGINT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  payos_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Thêm cột Premium cho profiles
ALTER TABLE public.profiles 
ADD COLUMN is_premium BOOLEAN DEFAULT false,
ADD COLUMN premium_expires TIMESTAMPTZ;

-- Bật RLS cho payos_invoices
ALTER TABLE public.payos_invoices ENABLE ROW LEVEL SECURITY;

-- Chính sách cho payos_invoices
CREATE POLICY "Users can view their own invoices"
  ON public.payos_invoices
  FOR SELECT
  USING (user_id = (auth.uid())::text);

CREATE POLICY "Anyone can insert invoices"
  ON public.payos_invoices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update invoices"
  ON public.payos_invoices
  FOR UPDATE
  USING (true);

-- Index cho performance
CREATE INDEX idx_payos_invoices_user_id ON public.payos_invoices(user_id);
CREATE INDEX idx_payos_invoices_order_code ON public.payos_invoices(order_code);
CREATE INDEX idx_profiles_premium_expires ON public.profiles(premium_expires);
