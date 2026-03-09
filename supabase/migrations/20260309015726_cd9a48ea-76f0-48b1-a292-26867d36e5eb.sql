-- Player artifacts/inventory table
CREATE TABLE public.player_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artifact_id TEXT NOT NULL,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  slot TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_artifacts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own artifacts"
  ON public.player_artifacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artifacts"
  ON public.player_artifacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artifacts"
  ON public.player_artifacts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artifacts"
  ON public.player_artifacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for artifacts
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_artifacts;