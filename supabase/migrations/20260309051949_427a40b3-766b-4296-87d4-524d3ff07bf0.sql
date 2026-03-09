CREATE OR REPLACE FUNCTION public.advance_multiplayer_round(_room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_room public.multiplayer_rooms%rowtype;
  v_all_ended boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_room FROM public.multiplayer_rooms WHERE id = _room_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Room not found'; END IF;
  IF v_room.creator_id <> v_uid THEN RAISE EXCEPTION 'Only creator can advance round'; END IF;

  -- Check all active players have ended turn
  SELECT NOT EXISTS (
    SELECT 1 FROM public.multiplayer_players
    WHERE room_id = _room_id AND status = 'playing' AND has_ended_turn = false
  ) INTO v_all_ended;

  IF NOT v_all_ended THEN
    RAISE EXCEPTION 'Not all players have ended their turn';
  END IF;

  -- Advance round
  UPDATE public.multiplayer_rooms SET current_round = current_round + 1 WHERE id = _room_id;

  -- Reset all players
  UPDATE public.multiplayer_players
  SET has_ended_turn = false, day = day + 1
  WHERE room_id = _room_id AND status = 'playing';
END;
$$;