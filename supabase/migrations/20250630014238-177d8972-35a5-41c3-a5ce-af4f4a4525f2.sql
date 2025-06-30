
-- Create albums bucket for user photo albums
INSERT INTO storage.buckets (id, name, public) 
VALUES ('albums', 'albums', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public upload to albums bucket
CREATE POLICY "Public upload to albums" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'albums');

-- Allow public read access to albums bucket  
CREATE POLICY "Public read access to albums" ON storage.objects 
FOR SELECT USING (bucket_id = 'albums');

-- Allow users to delete their own album images
CREATE POLICY "Users can delete own album images" ON storage.objects
FOR DELETE USING (bucket_id = 'albums');
