
-- Guilds table
CREATE TABLE public.guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT '',
  leader_id uuid NOT NULL,
  icon text DEFAULT '⚔️',
  level integer NOT NULL DEFAULT 1,
  experience integer NOT NULL DEFAULT 0,
  max_members integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view guilds
CREATE POLICY "Anyone can view guilds" ON public.guilds
  FOR SELECT TO authenticated USING (true);

-- Leader can update their guild
CREATE POLICY "Leader can update guild" ON public.guilds
  FOR UPDATE TO authenticated USING (auth.uid() = leader_id);

-- Authenticated users can create guilds
CREATE POLICY "Users can create guilds" ON public.guilds
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);

-- Leader can delete guild
CREATE POLICY "Leader can delete guild" ON public.guilds
  FOR DELETE TO authenticated USING (auth.uid() = leader_id);

-- Guild members table
CREATE TABLE public.guild_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view members
CREATE POLICY "Anyone can view guild members" ON public.guild_members
  FOR SELECT TO authenticated USING (true);

-- Users can join (insert themselves)
CREATE POLICY "Users can join guilds" ON public.guild_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can leave (delete themselves)
CREATE POLICY "Users can leave guilds" ON public.guild_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Guild raids table
CREATE TABLE public.guild_raids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  raid_name text NOT NULL,
  raid_boss_power integer NOT NULL DEFAULT 1000,
  total_damage integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  gold_reward integer NOT NULL DEFAULT 5000,
  exp_reward integer NOT NULL DEFAULT 500,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.guild_raids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view raids" ON public.guild_raids
  FOR SELECT TO authenticated USING (true);

-- Guild raid participants
CREATE TABLE public.guild_raid_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_id uuid NOT NULL REFERENCES public.guild_raids(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  damage_dealt integer NOT NULL DEFAULT 0,
  participated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(raid_id, user_id)
);

ALTER TABLE public.guild_raid_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view raid participants" ON public.guild_raid_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can participate in raids" ON public.guild_raid_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON public.guild_raid_participants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Security definer function to check if user is guild leader
CREATE OR REPLACE FUNCTION public.is_guild_leader(_user_id uuid, _guild_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guilds
    WHERE id = _guild_id AND leader_id = _user_id
  )
$$;

-- Allow guild leaders to manage raids
CREATE POLICY "Leaders can create raids" ON public.guild_raids
  FOR INSERT TO authenticated WITH CHECK (public.is_guild_leader(auth.uid(), guild_id));

CREATE POLICY "Leaders can update raids" ON public.guild_raids
  FOR UPDATE TO authenticated USING (public.is_guild_leader(auth.uid(), guild_id));

-- Allow leaders to kick members
CREATE POLICY "Leaders can remove members" ON public.guild_members
  FOR DELETE TO authenticated USING (
    public.is_guild_leader(auth.uid(), guild_id)
  );

-- Enable realtime for guild raids
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_raids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_raid_participants;
