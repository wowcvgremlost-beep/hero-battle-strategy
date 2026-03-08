
CREATE TABLE public.player_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, quest_id)
);

ALTER TABLE public.player_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests" ON public.player_quests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quests" ON public.player_quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON public.player_quests
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quests" ON public.player_quests
  FOR DELETE USING (auth.uid() = user_id);
