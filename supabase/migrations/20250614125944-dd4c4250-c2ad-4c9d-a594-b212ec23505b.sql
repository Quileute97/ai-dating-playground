
-- 1. Tạo enum app_role cho các loại quyền
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Bảng user_roles để gán quyền cho user (theo user id của Supabase Auth)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

-- 3. Bật RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Cho phép user xem và thêm quyền của chính mình (có thể điều chỉnh sau)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_roles"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Hàm kiểm tra vai trò hiện tại của user
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;
