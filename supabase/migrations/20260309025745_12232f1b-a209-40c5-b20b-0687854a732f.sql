
CREATE TABLE public.daily_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  streak integer NOT NULL DEFAULT 1,
  last_claim_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX daily_rewards_user_id_idx ON public.daily_rewards (user_id);

ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON public.daily_rewards
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards" ON public.daily_rewards
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards" ON public.daily_rewards
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
