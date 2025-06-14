
-- Xóa các policy cũ nếu có để tránh xung đột
DROP POLICY IF EXISTS "Owner can select conversation" ON public.conversations;
DROP POLICY IF EXISTS "Owner can insert conversation" ON public.conversations;
DROP POLICY IF EXISTS "Owner can delete conversation" ON public.conversations;
DROP POLICY IF EXISTS "Owner can update conversation" ON public.conversations;

-- Kích hoạt lại RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policy cho phép user đăng nhập hoặc anonymous thao tác trên conversation của mình
CREATE POLICY "Owner or Anonymous can select conversation"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = user_real_id OR auth.uid() IS NULL);

CREATE POLICY "Owner or Anonymous can insert conversation"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_real_id OR auth.uid() IS NULL);

CREATE POLICY "Owner or Anonymous can update conversation"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = user_real_id OR auth.uid() IS NULL);

CREATE POLICY "Owner or Anonymous can delete conversation"
  ON public.conversations
  FOR DELETE
  USING (auth.uid() = user_real_id OR auth.uid() IS NULL);
