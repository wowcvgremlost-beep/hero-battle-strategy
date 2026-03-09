
CREATE TABLE public.player_event_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE public.player_event_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own event progress" ON public.player_event_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event progress" ON public.player_event_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own event progress" ON public.player_event_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
