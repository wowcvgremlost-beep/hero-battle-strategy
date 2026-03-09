
CREATE TABLE public.player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON public.player_achievements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.player_achievements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
