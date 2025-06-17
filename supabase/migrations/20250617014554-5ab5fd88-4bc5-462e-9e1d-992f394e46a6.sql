
-- Add sender_id column to messages table to track who sent each message
ALTER TABLE public.messages 
ADD COLUMN sender_id TEXT;

-- Update the RLS policy to work with sender_id
-- First drop the existing policy
DROP POLICY IF EXISTS "Chỉ user được phép xem/gửi message" ON public.messages;

-- Create new policy that checks both conversation ownership and sender_id
CREATE POLICY "User can view/send messages in their conversations"
  ON public.messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_real_id = auth.uid()
    )
  );
