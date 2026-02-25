
-- Fix 1: CLIENT_SIDE_AUTH - Replace misleading "admin" policies that use USING(true)

-- fake_users: Fix admin policy
DROP POLICY IF EXISTS "Admin can manage fake users" ON fake_users;
CREATE POLICY "Admin can manage fake users" ON fake_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- fake_user_posts: Fix admin policy
DROP POLICY IF EXISTS "Admin can manage fake user posts" ON fake_user_posts;
CREATE POLICY "Admin can manage fake user posts" ON fake_user_posts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- admin_messages: Fix admin policy
DROP POLICY IF EXISTS "Admin can manage admin messages" ON admin_messages;
CREATE POLICY "Admin can manage admin messages" ON admin_messages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- ai_prompts: Fix both policies
DROP POLICY IF EXISTS "Anon can manage ai_prompts" ON ai_prompts;
DROP POLICY IF EXISTS "Anon can read ai_prompts" ON ai_prompts;
CREATE POLICY "Admin can manage ai_prompts" ON ai_prompts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Fix 2: PUBLIC_DATA_EXPOSURE - Tighten critical policies

-- bank_info: Restrict to admin only
DROP POLICY IF EXISTS "Bank info readable" ON bank_info;
CREATE POLICY "Admin can read bank info" ON bank_info
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- bank_info: Fix insert/update to admin only
DROP POLICY IF EXISTS "Bank info insertable" ON bank_info;
DROP POLICY IF EXISTS "Bank info updatable" ON bank_info;
CREATE POLICY "Admin can insert bank info" ON bank_info
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
CREATE POLICY "Admin can update bank info" ON bank_info
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- upgrade_requests: Fix "Admin can select all" to actually check admin
DROP POLICY IF EXISTS "Admin can select all" ON upgrade_requests;
CREATE POLICY "Admin can select all upgrade requests" ON upgrade_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- upgrade_requests: Fix admin update/delete too
DROP POLICY IF EXISTS "Admin can update any" ON upgrade_requests;
DROP POLICY IF EXISTS "Admin can delete any" ON upgrade_requests;
CREATE POLICY "Admin can update upgrade requests" ON upgrade_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
CREATE POLICY "Admin can delete upgrade requests" ON upgrade_requests
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
