-- Add cached player_count to rooms so lobby can list rooms without selecting multiplayer_players (blocked by RLS)
ALTER TABLE public.multiplayer_rooms
ADD COLUMN IF NOT EXISTS player_count integer NOT NULL DEFAULT 0;

-- Backfill existing rooms
UPDATE public.multiplayer_rooms r
SET player_count = COALESCE(p.cnt, 0)
FROM (
  SELECT room_id, COUNT(*)::int AS cnt
  FROM public.multiplayer_players
  GROUP BY room_id
) p
WHERE r.id = p.room_id;

UPDATE public.multiplayer_rooms
SET player_count = 0
WHERE player_count IS NULL;

-- Function to recompute count for a room
CREATE OR REPLACE FUNCTION public.recompute_room_player_count(_room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.multiplayer_rooms
  SET player_count = (
    SELECT COUNT(*)::int
    FROM public.multiplayer_players
    WHERE room_id = _room_id
  )
  WHERE id = _room_id;
END;
$$;

-- Trigger function
CREATE OR REPLACE FUNCTION public.multiplayer_players_room_count_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recompute_room_player_count(NEW.room_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_room_player_count(OLD.room_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.room_id IS DISTINCT FROM OLD.room_id THEN
      PERFORM public.recompute_room_player_count(OLD.room_id);
      PERFORM public.recompute_room_player_count(NEW.room_id);
    ELSE
      PERFORM public.recompute_room_player_count(NEW.room_id);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS trg_multiplayer_players_room_count_ins ON public.multiplayer_players;
CREATE TRIGGER trg_multiplayer_players_room_count_ins
AFTER INSERT ON public.multiplayer_players
FOR EACH ROW
EXECUTE FUNCTION public.multiplayer_players_room_count_trigger();

DROP TRIGGER IF EXISTS trg_multiplayer_players_room_count_del ON public.multiplayer_players;
CREATE TRIGGER trg_multiplayer_players_room_count_del
AFTER DELETE ON public.multiplayer_players
FOR EACH ROW
EXECUTE FUNCTION public.multiplayer_players_room_count_trigger();

DROP TRIGGER IF EXISTS trg_multiplayer_players_room_count_upd ON public.multiplayer_players;
CREATE TRIGGER trg_multiplayer_players_room_count_upd
AFTER UPDATE OF room_id ON public.multiplayer_players
FOR EACH ROW
EXECUTE FUNCTION public.multiplayer_players_room_count_trigger();

-- Helpful index for recompute/query speed
CREATE INDEX IF NOT EXISTS idx_multiplayer_players_room_id ON public.multiplayer_players(room_id);