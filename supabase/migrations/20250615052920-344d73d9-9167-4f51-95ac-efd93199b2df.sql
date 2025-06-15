
-- (1) DROP các policy cũ, đề phòng trùng policy
DROP POLICY IF EXISTS "User chỉ xem/gửi hội thoại của mình" ON public.conversations;
DROP POLICY IF EXISTS "Chỉ user được phép xem/gửi message" ON public.messages;

-- (2) Policy mới cho conversations
CREATE POLICY "real và fake user đều xem/gửi được hội thoại mình tham gia"
  ON public.conversations
  FOR ALL
  USING (
    -- ROLE user: user thật hoặc khách đều có thể truy cập cuộc hội thoại của mình
    (auth.uid() = user_real_id)
    OR
    (user_fake_id::text = auth.uid()::text) -- cho phép khách với anonId dùng làm user_fake_id
  );

-- (3) Policy mới cho messages
CREATE POLICY "real hoặc fake user gửi/xem được message trong cuộc hội thoại mình tham gia"
  ON public.messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
        WHERE 
          -- user thật
          (auth.uid() = user_real_id)
          -- hoặc là user_fake_id (khách)
          OR (user_fake_id::text = auth.uid()::text)
    )
  );
