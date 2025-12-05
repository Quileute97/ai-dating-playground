-- Add media support to messages table
ALTER TABLE public.messages 
ADD COLUMN media_url TEXT,
ADD COLUMN media_type TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS messages_media_type_idx ON public.messages(media_type);

-- Update RLS policies to include media columns (they should already work but let's ensure)
-- The existing policies should automatically cover the new columns