
-- Bảng conversations lưu cuộc hội thoại giữa User thật và User ảo
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_real_id UUID NOT NULL,  -- user thật (tham chiếu auth.users)
  user_fake_id TEXT NOT NULL,   -- id của user ảo (dạng text, quản lý bên app)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message TEXT,
  last_message_at TIMESTAMPTZ
);

-- Chỉ cho phép user xem/gửi cuộc hội thoại của chính mình
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User chỉ xem/gửi hội thoại của mình"
  ON public.conversations
  FOR ALL
  USING (auth.uid() = user_real_id);

-- Bảng messages lưu chi tiết từng tin nhắn
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'real' | 'fake' | 'admin'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chỉ user_real_id được insert/query message của conversation đó
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chỉ user được phép xem/gửi message"
  ON public.messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_real_id = auth.uid()
    )
  );
