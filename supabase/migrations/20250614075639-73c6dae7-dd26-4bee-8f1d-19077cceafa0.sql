
-- Bảng lưu trạng thái chờ ghép đôi
CREATE TABLE public.stranger_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bật Row Level Security
ALTER TABLE public.stranger_queue ENABLE ROW LEVEL SECURITY;

-- Chỉ cho phép user xem trạng thái của chính mình
CREATE POLICY "Only the owner can select queue entry"
  ON public.stranger_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- Chỉ cho phép user thêm bản ghi cho chính mình
CREATE POLICY "Only the owner can insert queue entry"
  ON public.stranger_queue
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Chỉ cho phép user xóa bản ghi của chính mình
CREATE POLICY "Only the owner can delete queue entry"
  ON public.stranger_queue
  FOR DELETE
  USING (auth.uid() = user_id);
