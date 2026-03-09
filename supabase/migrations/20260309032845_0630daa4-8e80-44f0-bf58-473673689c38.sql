
-- Table to track globally defeated tiles (monsters, treasures, artifacts)
-- Monsters respawn daily at 00:00 UTC (client filters by killed_at date)
CREATE TABLE public.defeated_tiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tile_key text NOT NULL,
  killed_by uuid NOT NULL,
  killed_at timestamptz NOT NULL DEFAULT now(),
  tile_type text NOT NULL DEFAULT 'monster'
);

-- Index for fast lookups
CREATE INDEX idx_defeated_tiles_key ON public.defeated_tiles(tile_key);
CREATE INDEX idx_defeated_tiles_killed_at ON public.defeated_tiles(killed_at);

-- RLS
ALTER TABLE public.defeated_tiles ENABLE ROW LEVEL SECURITY;

-- Everyone can see defeated tiles (shared map)
CREATE POLICY "Anyone can view defeated tiles"
ON public.defeated_tiles FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own kills
CREATE POLICY "Users can insert defeated tiles"
ON public.defeated_tiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = killed_by);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.defeated_tiles;
