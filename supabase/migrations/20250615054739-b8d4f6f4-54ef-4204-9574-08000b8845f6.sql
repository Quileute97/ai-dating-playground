
-- Xoá policy cũ
DROP POLICY IF EXISTS "Chỉ user được phép xem/gửi message" ON public.messages;

-- Thêm policy cho phép user login hoặc anonymous (auth.uid() IS NULL) được phép thao tác
CREATE POLICY "Owner or Anonymous can send/view message"
  ON public.messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_real_id = auth.uid() OR auth.uid() IS NULL
    )
  );
