
-- Track which floors each player has unlocked
CREATE TABLE public.tower_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  floor_id integer NOT NULL DEFAULT 1,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, floor_id)
);

ALTER TABLE public.tower_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all tower progress" ON public.tower_progress
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own tower progress" ON public.tower_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Track monster/boss kills with timestamps for respawn
CREATE TABLE public.tower_kills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  floor_id integer NOT NULL,
  monster_id text NOT NULL,
  killed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tower_kills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all tower kills" ON public.tower_kills
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own tower kills" ON public.tower_kills
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tower kills" ON public.tower_kills
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Track which floor each player is currently on (for showing other players)
-- We'll reuse profiles.map_row as current_floor for simplicity, or add a column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_floor integer NOT NULL DEFAULT 1;

-- Enable realtime for tower_kills so players see others' kills
ALTER PUBLICATION supabase_realtime ADD TABLE public.tower_kills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tower_progress;
