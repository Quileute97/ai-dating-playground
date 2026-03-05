
-- Table to store user star balances
CREATE TABLE public.user_stars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  last_daily_claim timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table to store star transactions (purchases, donations, daily claims)
CREATE TABLE public.star_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL,
  amount integer NOT NULL,
  related_user_id text,
  related_post_id uuid,
  order_code text,
  note text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.star_transactions ENABLE ROW LEVEL SECURITY;

-- user_stars policies
CREATE POLICY "Users can view any star balance"
  ON public.user_stars FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own star record"
  ON public.user_stars FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users can update their own star balance"
  ON public.user_stars FOR UPDATE
  TO authenticated
  USING (user_id = (auth.uid())::text);

-- star_transactions policies
CREATE POLICY "Users can view their own transactions"
  ON public.star_transactions FOR SELECT
  TO authenticated
  USING (user_id = (auth.uid())::text OR related_user_id = (auth.uid())::text);

CREATE POLICY "Users can insert their own transactions"
  ON public.star_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.uid())::text);

-- Admin policies
CREATE POLICY "Admin can manage all star balances"
  ON public.user_stars FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Admin can manage all transactions"
  ON public.star_transactions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Function to donate stars (atomic operation)
CREATE OR REPLACE FUNCTION public.donate_stars(
  sender_id_param text,
  receiver_id_param text,
  amount_param integer,
  post_id_param uuid DEFAULT NULL,
  note_param text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_stars WHERE user_id = sender_id_param AND balance >= amount_param
  ) THEN
    RETURN false;
  END IF;

  UPDATE user_stars SET balance = balance - amount_param, updated_at = now()
  WHERE user_id = sender_id_param AND balance >= amount_param;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO user_stars (user_id, balance) VALUES (receiver_id_param, amount_param)
  ON CONFLICT (user_id) DO UPDATE SET balance = user_stars.balance + amount_param, updated_at = now();

  INSERT INTO star_transactions (user_id, type, amount, related_user_id, related_post_id, note)
  VALUES (sender_id_param, 'donate_sent', amount_param, receiver_id_param, post_id_param, note_param);

  INSERT INTO star_transactions (user_id, type, amount, related_user_id, related_post_id, note)
  VALUES (receiver_id_param, 'donate_received', amount_param, sender_id_param, post_id_param, note_param);

  RETURN true;
END;
$$;

-- Function to claim daily stars
CREATE OR REPLACE FUNCTION public.claim_daily_stars(user_id_param text, daily_amount integer DEFAULT 5)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_claim timestamp with time zone;
BEGIN
  INSERT INTO user_stars (user_id, balance) VALUES (user_id_param, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_daily_claim INTO last_claim FROM user_stars WHERE user_id = user_id_param;

  IF last_claim IS NOT NULL AND last_claim::date = now()::date THEN
    RETURN false;
  END IF;

  UPDATE user_stars 
  SET balance = balance + daily_amount, last_daily_claim = now(), updated_at = now()
  WHERE user_id = user_id_param;

  INSERT INTO star_transactions (user_id, type, amount, note)
  VALUES (user_id_param, 'daily_claim', daily_amount, 'Nhan sao mien phi hang ngay');

  RETURN true;
END;
$$;
