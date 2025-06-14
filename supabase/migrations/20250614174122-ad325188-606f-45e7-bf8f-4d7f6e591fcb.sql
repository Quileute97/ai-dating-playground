
-- 1. Tạo bucket "avatars" cho ảnh đại diện user, cho phép public access
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
on conflict do nothing;

-- 2. Cho phép bất kỳ ai upload (insert) file vào bucket "avatars"
create policy "Public upload to avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

-- 3. Cho phép bất kỳ ai đọc file từ bucket "avatars" (xem ảnh đại diện)
create policy "Public read access to avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');
