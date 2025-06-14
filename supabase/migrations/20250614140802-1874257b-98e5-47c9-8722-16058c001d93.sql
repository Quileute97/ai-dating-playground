
-- Xoá tất cả dữ liệu liên quan đến profiles có id không phải uuid hợp lệ, dùng ép kiểu uuid cho các giá trị IN
DELETE FROM public.comments WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id::text !~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$'
);

DELETE FROM public.posts WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id::text !~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$'
);

DELETE FROM public.post_likes WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id::text !~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$'
);

DELETE FROM public.friends WHERE user_id IN (
  SELECT id::uuid FROM public.profiles WHERE id::text !~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$'
)
OR friend_id IN (
  SELECT id::uuid FROM public.profiles WHERE id::text !~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$'
);

DELETE FROM public.upgrade_requests WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id::text !~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$'
);

-- Cuối cùng xoá các bản ghi profiles không phải uuid hợp lệ
DELETE FROM public.profiles WHERE id::text !~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$';
