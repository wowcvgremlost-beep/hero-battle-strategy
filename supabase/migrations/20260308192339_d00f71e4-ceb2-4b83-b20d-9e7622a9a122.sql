
-- Allow all authenticated users to see other players' public info (for map & leaderboard)
CREATE POLICY "Anyone can view all profiles for map"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- Drop the old restrictive select policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Enable realtime for profiles so we can see other players moving
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Allow delete on battles for character reset
CREATE POLICY "Users can delete their own battles"
ON public.battles FOR DELETE TO authenticated
USING (auth.uid() = attacker_id);
