
-- Xóa policy cũ (nếu đã có, sẽ không lỗi nếu chưa cài)
DROP POLICY IF EXISTS "Only the owner can select queue entry" ON public.stranger_queue;
DROP POLICY IF EXISTS "Only the owner can insert queue entry" ON public.stranger_queue;
DROP POLICY IF EXISTS "Only the owner can delete queue entry" ON public.stranger_queue;

-- Bật lại RLS để chắc chắn
ALTER TABLE public.stranger_queue ENABLE ROW LEVEL SECURITY;

-- Policy cho phép user thật (login) hoặc anonymous đều thao tác trên chính họ
CREATE POLICY "Owner or Anonymous can select queue entry"
  ON public.stranger_queue
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Owner or Anonymous can insert queue entry"
  ON public.stranger_queue
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Owner or Anonymous can delete queue entry"
  ON public.stranger_queue
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() IS NULL);
