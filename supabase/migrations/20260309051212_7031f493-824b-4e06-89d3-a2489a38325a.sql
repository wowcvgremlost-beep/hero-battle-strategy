-- Fix multiplayer join race/RLS issues by allocating player_number server-side and ensuring player_count stays updated

-- 1) Ensure room player_count is always maintained
DROP TRIGGER IF EXISTS trg_multiplayer_players_room_count ON public.multiplayer_players;
CREATE TRIGGER trg_multiplayer_players_room_count
AFTER INSERT OR UPDATE OR DELETE ON public.multiplayer_players
FOR EACH ROW
EXECUTE FUNCTION public.multiplayer_players_room_count_trigger();

-- 2) Atomic join function (avoids client-side SELECT blocked by RLS + avoids player_number collisions)
CREATE OR REPLACE FUNCTION public.join_multiplayer_room(_room_code text, _password text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_room public.multiplayer_rooms%rowtype;
  v_room2 public.multiplayer_rooms%rowtype;
  v_player public.multiplayer_players%rowtype;
  v_player_number int;
  v_radius int;
  v_angle double precision;
  v_row int;
  v_col int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the room row to make join atomic
  SELECT * INTO v_room
  FROM public.multiplayer_rooms
  WHERE room_code = _room_code
    AND status = 'waiting'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found or already started';
  END IF;

  -- Password check (empty string means no password)
  IF COALESCE(v_room.password, '') <> '' THEN
    IF _password IS NULL OR _password <> v_room.password THEN
      RAISE EXCEPTION 'Invalid room password';
    END IF;
  END IF;

  -- Re-join if already present
  SELECT * INTO v_player
  FROM public.multiplayer_players
  WHERE room_id = v_room.id
    AND user_id = v_uid
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object('room', to_jsonb(v_room), 'player', to_jsonb(v_player));
  END IF;

  -- Allocate smallest free player number within max_players
  SELECT n INTO v_player_number
  FROM generate_series(1, v_room.max_players) AS n
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.multiplayer_players p
    WHERE p.room_id = v_room.id
      AND p.player_number = n
  )
  ORDER BY n
  LIMIT 1;

  IF v_player_number IS NULL THEN
    RAISE EXCEPTION 'Room is full';
  END IF;

  -- Spawn position (matches client algorithm: 6 evenly spaced positions)
  v_radius := floor(v_room.map_size * 0.35)::int;
  v_angle := ((v_player_number - 1) * 2 * pi()) / 6.0;
  v_row := floor(cos(v_angle) * v_radius)::int;
  v_col := floor(sin(v_angle) * v_radius)::int;

  INSERT INTO public.multiplayer_players (
    room_id,
    user_id,
    player_number,
    map_row,
    map_col,
    status,
    is_ready
  )
  VALUES (
    v_room.id,
    v_uid,
    v_player_number,
    v_row,
    v_col,
    'setup',
    false
  )
  RETURNING * INTO v_player;

  -- Keep room.player_count in sync (UI relies on it)
  PERFORM public.recompute_room_player_count(v_room.id);
  SELECT * INTO v_room2 FROM public.multiplayer_rooms WHERE id = v_room.id;

  RETURN jsonb_build_object('room', to_jsonb(v_room2), 'player', to_jsonb(v_player));
END;
$$;