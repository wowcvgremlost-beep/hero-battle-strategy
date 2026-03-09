
DROP POLICY IF EXISTS "Members can view players" ON public.multiplayer_players;

CREATE POLICY "Members can view players"
ON public.multiplayer_players
FOR SELECT
TO authenticated
USING (
  is_room_member(auth.uid(), room_id)
  OR user_id = auth.uid()
);
