
-- Create timeline_messages table for realtime messaging feature
CREATE TABLE IF NOT EXISTS public.timeline_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timeline_messages ENABLE ROW LEVEL SECURITY;

-- Policies for timeline_messages
CREATE POLICY "Users can view messages they sent or received"
  ON public.timeline_messages
  FOR SELECT
  USING (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text);

CREATE POLICY "Users can insert messages they send"
  ON public.timeline_messages
  FOR INSERT
  WITH CHECK (sender_id = auth.uid()::text);

CREATE POLICY "Users can update messages they received (mark as read)"
  ON public.timeline_messages
  FOR UPDATE
  USING (receiver_id = auth.uid()::text);

-- Add to realtime
ALTER TABLE public.timeline_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_messages;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_timeline_messages_sender_receiver ON public.timeline_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_timeline_messages_created_at ON public.timeline_messages(created_at);
