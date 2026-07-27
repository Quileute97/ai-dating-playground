
-- =========================
-- Conversations
-- =========================
DROP POLICY IF EXISTS "Public delete conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public select conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public update conversations" ON public.conversations;

-- =========================
-- Messages
-- =========================
DROP POLICY IF EXISTS "Owner or Anonymous can send/view message" ON public.messages;

-- =========================
-- PayOS invoices
-- =========================
DROP POLICY IF EXISTS "Anyone can insert invoices" ON public.payos_invoices;
DROP POLICY IF EXISTS "System can update invoices" ON public.payos_invoices;

CREATE POLICY "Users insert their own invoices"
  ON public.payos_invoices FOR INSERT TO authenticated
  WITH CHECK (user_id = (auth.uid())::text);

-- Updates are performed by service role (bypasses RLS). No public UPDATE policy.

-- =========================
-- Upgrade requests
-- =========================
DROP POLICY IF EXISTS "Users can create their own upgrade request" ON public.upgrade_requests;

CREATE POLICY "Users can create their own upgrade request"
  ON public.upgrade_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = (auth.uid())::text);

-- =========================
-- User likes
-- =========================
DROP POLICY IF EXISTS "Anyone can read likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can view all user likes" ON public.user_likes;
DROP POLICY IF EXISTS "Anyone can add likes" ON public.user_likes;

CREATE POLICY "Users can view likes involving them"
  ON public.user_likes FOR SELECT TO authenticated
  USING (liker_id = (auth.uid())::text OR liked_id = (auth.uid())::text);

-- =========================
-- User roles - prevent self admin assignment
-- =========================
DROP POLICY IF EXISTS "Users can insert own user_roles" ON public.user_roles;

CREATE POLICY "Users can insert own non-admin role"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role <> 'admin'::app_role);

-- =========================
-- User stars - remove direct writes; go through RPC
-- =========================
DROP POLICY IF EXISTS "Users can update their own star balance" ON public.user_stars;
DROP POLICY IF EXISTS "Users can insert their own star record" ON public.user_stars;
DROP POLICY IF EXISTS "Users can view any star balance" ON public.user_stars;

CREATE POLICY "Users can view their own star balance"
  ON public.user_stars FOR SELECT TO authenticated
  USING (user_id = (auth.uid())::text);

-- =========================
-- User subscriptions - drop blanket policy
-- =========================
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.user_subscriptions;
-- Owner SELECT policy remains. Writes are performed by service role in edge functions.

-- =========================
-- Profiles - restrict full row (including GPS) to authenticated
-- =========================
DROP POLICY IF EXISTS "Allow everyone to read active dating profiles" ON public.profiles;

CREATE POLICY "Authenticated users can read active dating profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (is_dating_active = true OR id = (auth.uid())::text);

-- =========================
-- Storage: enforce ownership on upload; restrict deletes to owner
-- =========================
DROP POLICY IF EXISTS "Public upload to albums" ON storage.objects;
DROP POLICY IF EXISTS "Public upload to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public upload to timeline-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own album images" ON storage.objects;

CREATE POLICY "Authenticated upload to albums"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'albums' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Authenticated upload to avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Authenticated upload to timeline-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'timeline-media' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Owners can delete own album images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'albums' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Owners can delete own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Owners can delete own timeline media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'timeline-media' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- =========================
-- Function search_path fixes
-- =========================
ALTER FUNCTION public.handle_new_profile() SET search_path = public;

-- =========================
-- Revoke EXECUTE from public/anon on internal SECURITY DEFINER functions
-- =========================
REVOKE EXECUTE ON FUNCTION public.handle_new_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_subscription() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_admin_settings_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sitemap_ping() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.like_fake_user(text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.donate_stars(text, text, integer, uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_daily_stars(text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.like_fake_post(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.comment_on_fake_post(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.send_friend_request_to_fake_user(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_conversation_with_fake_user(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_fake_users_for_dating(double precision, double precision, integer, integer, integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_timeline_with_fake_posts(text, integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
