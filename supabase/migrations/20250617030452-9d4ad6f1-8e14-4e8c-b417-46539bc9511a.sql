
-- Tạo bảng stranger_queue để quản lý hàng chờ tìm người lạ
CREATE TABLE IF NOT EXISTS public.stranger_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS cho stranger_queue
ALTER TABLE public.stranger_queue ENABLE ROW LEVEL SECURITY;

-- Policy cho stranger_queue - user chỉ thấy entry của mình
CREATE POLICY "Users can manage their own queue entries"
  ON public.stranger_queue
  FOR ALL
  USING (true); -- Tạm thời cho phép tất cả để debug

-- Kích hoạt realtime cho messages và stranger_queue
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.stranger_queue REPLICA IDENTITY FULL;

-- Thêm vào realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stranger_queue;

-- Cập nhật RLS policy cho messages để hoạt động với sender_id mới
DROP POLICY IF EXISTS "User can view/send messages in their conversations" ON public.messages;

CREATE POLICY "Users can view/send messages in their conversations"
  ON public.messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_real_id = auth.uid()
    ) OR 
    sender_id = auth.uid()::text
  );

-- Thêm index để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_stranger_queue_user_id ON public.stranger_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_stranger_queue_created_at ON public.stranger_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
