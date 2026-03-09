
CREATE TABLE public.guild_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;

-- Members can view messages of their guild
CREATE OR REPLACE FUNCTION public.is_guild_member(_user_id uuid, _guild_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE user_id = _user_id AND guild_id = _guild_id
  )
$$;

CREATE POLICY "Members can view guild messages" ON public.guild_messages
  FOR SELECT TO authenticated USING (public.is_guild_member(auth.uid(), guild_id));

CREATE POLICY "Members can send messages" ON public.guild_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND public.is_guild_member(auth.uid(), guild_id)
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_messages;
