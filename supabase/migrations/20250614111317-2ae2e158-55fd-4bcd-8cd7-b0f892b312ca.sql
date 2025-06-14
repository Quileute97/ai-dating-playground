
-- Tạo bucket cho ảnh/video của timeline
insert into storage.buckets (id, name, public) values ('timeline-media', 'timeline-media', true);

-- Public policy cho phép bất kỳ ai upload/read file
-- Cho phép upload/insert file
create policy "Public upload to timeline-media" on storage.objects for insert
  with check (bucket_id = 'timeline-media');

-- Cho phép mọi người đọc file
create policy "Public read access to timeline-media" on storage.objects for select
  using (bucket_id = 'timeline-media');
