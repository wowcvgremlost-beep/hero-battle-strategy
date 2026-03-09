
-- Auto-delete room when player_count drops to 0
CREATE OR REPLACE FUNCTION public.auto_cleanup_empty_rooms()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- After player count recompute, check if room is empty
  IF EXISTS (
    SELECT 1 FROM public.multiplayer_rooms
    WHERE id = OLD.room_id
    AND NOT EXISTS (
      SELECT 1 FROM public.multiplayer_players WHERE room_id = OLD.room_id
    )
  ) THEN
    DELETE FROM public.multiplayer_rooms WHERE id = OLD.room_id;
  END IF;
  RETURN OLD;
END;
$$;

-- Trigger on player delete to clean empty rooms
DROP TRIGGER IF EXISTS trg_cleanup_empty_rooms ON public.multiplayer_players;
CREATE TRIGGER trg_cleanup_empty_rooms
  AFTER DELETE ON public.multiplayer_players
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_cleanup_empty_rooms();
