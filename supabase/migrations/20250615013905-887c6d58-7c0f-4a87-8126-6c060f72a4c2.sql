
-- Bật RLS cho bảng stranger_queue (nếu chưa bật)
ALTER TABLE public.stranger_queue ENABLE ROW LEVEL SECURITY;

-- Xóa tất cả policies cũ trên stranger_queue
DROP POLICY IF EXISTS "Owner or Anonymous can select queue entry" ON public.stranger_queue;
DROP POLICY IF EXISTS "Owner or Anonymous can insert queue entry" ON public.stranger_queue;
DROP POLICY IF EXISTS "Owner or Anonymous can delete queue entry" ON public.stranger_queue;

-- Tạo policy cho phép ai cũng SELECT/INSERT/DELETE trên stranger_queue
CREATE POLICY "Public select queue" ON public.stranger_queue
    FOR SELECT USING (true);
CREATE POLICY "Public insert queue" ON public.stranger_queue
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete queue" ON public.stranger_queue
    FOR DELETE USING (true);

-- Bật RLS cho bảng conversations (nếu chưa bật)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Xóa tất cả policies cũ trên conversations
DROP POLICY IF EXISTS "Owner or Anonymous can select conversation" ON public.conversations;
DROP POLICY IF EXISTS "Owner or Anonymous can insert conversation" ON public.conversations;
DROP POLICY IF EXISTS "Owner or Anonymous can delete conversation" ON public.conversations;
DROP POLICY IF EXISTS "Owner or Anonymous can update conversation" ON public.conversations;
DROP POLICY IF EXISTS "User chỉ xem/gửi hội thoại của mình" ON public.conversations;

-- Cho phép ai cũng SELECT/INSERT/UPDATE/DELETE mọi conversations (ai chat cũng match được)
CREATE POLICY "Public select conversations" ON public.conversations
    FOR SELECT USING (true);
CREATE POLICY "Public insert conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update conversations" ON public.conversations
    FOR UPDATE USING (true);
CREATE POLICY "Public delete conversations" ON public.conversations
    FOR DELETE USING (true);
