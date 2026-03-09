
-- Multiplayer rooms
CREATE TABLE public.multiplayer_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text NOT NULL UNIQUE,
  password text NOT NULL DEFAULT '',
  max_players integer NOT NULL DEFAULT 2 CHECK (max_players >= 1 AND max_players <= 6),
  map_size integer NOT NULL DEFAULT 50,
  creator_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
  current_round integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rooms_code ON public.multiplayer_rooms(room_code);
CREATE INDEX idx_rooms_status ON public.multiplayer_rooms(status);

ALTER TABLE public.multiplayer_rooms ENABLE ROW LEVEL SECURITY;

-- Multiplayer players (separate character per room)
CREATE TABLE public.multiplayer_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  player_number integer NOT NULL DEFAULT 1,
  character_name text,
  town text,
  hero_id text,
  hero_level integer NOT NULL DEFAULT 1,
  hero_experience integer NOT NULL DEFAULT 0,
  hero_attack integer NOT NULL DEFAULT 1,
  hero_defense integer NOT NULL DEFAULT 1,
  hero_spellpower integer NOT NULL DEFAULT 1,
  hero_knowledge integer NOT NULL DEFAULT 1,
  gold integer NOT NULL DEFAULT 5000,
  mana integer NOT NULL DEFAULT 50,
  health integer NOT NULL DEFAULT 100,
  map_row integer NOT NULL DEFAULT 0,
  map_col integer NOT NULL DEFAULT 0,
  is_ready boolean NOT NULL DEFAULT false,
  has_ended_turn boolean NOT NULL DEFAULT false,
  day integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'setup', -- setup, playing, eliminated
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id),
  UNIQUE(room_id, player_number)
);

CREATE INDEX idx_mp_players_room ON public.multiplayer_players(room_id);
CREATE INDEX idx_mp_players_user ON public.multiplayer_players(user_id);

ALTER TABLE public.multiplayer_players ENABLE ROW LEVEL SECURITY;

-- Multiplayer army
CREATE TABLE public.multiplayer_army (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.multiplayer_players(id) ON DELETE CASCADE,
  unit_name text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  UNIQUE(player_id, unit_name)
);

ALTER TABLE public.multiplayer_army ENABLE ROW LEVEL SECURITY;

-- Multiplayer chat
CREATE TABLE public.multiplayer_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  player_name text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mp_chat_room ON public.multiplayer_chat(room_id);

ALTER TABLE public.multiplayer_chat ENABLE ROW LEVEL SECURITY;

-- Multiplayer duels
CREATE TABLE public.multiplayer_duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  challenger_id uuid NOT NULL,
  defender_id uuid NOT NULL,
  challenger_roll integer,
  defender_roll integer,
  winner_id uuid,
  gold_stake integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, active, completed, declined
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.multiplayer_duels ENABLE ROW LEVEL SECURITY;

-- Multiplayer defeated tiles (shared per room)
CREATE TABLE public.multiplayer_defeated_tiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  tile_key text NOT NULL,
  killed_by uuid NOT NULL,
  killed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mp_defeated_room ON public.multiplayer_defeated_tiles(room_id);

ALTER TABLE public.multiplayer_defeated_tiles ENABLE ROW LEVEL SECURITY;

-- Multiplayer coop raids
CREATE TABLE public.multiplayer_raids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  raid_name text NOT NULL,
  boss_power integer NOT NULL DEFAULT 500,
  total_damage integer NOT NULL DEFAULT 0,
  gold_reward integer NOT NULL DEFAULT 1000,
  exp_reward integer NOT NULL DEFAULT 200,
  status text NOT NULL DEFAULT 'active', -- active, completed
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.multiplayer_raids ENABLE ROW LEVEL SECURITY;

-- Multiplayer trade offers
CREATE TABLE public.multiplayer_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL,
  buyer_id uuid,
  item_type text NOT NULL,
  item_id text NOT NULL,
  item_count integer NOT NULL DEFAULT 1,
  price integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.multiplayer_trades ENABLE ROW LEVEL SECURITY;

-- Helper function to check room membership
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.multiplayer_players
    WHERE user_id = _user_id AND room_id = _room_id
  )
$$;

-- RLS Policies

-- Rooms: anyone can see, creator manages
CREATE POLICY "Anyone can view rooms" ON public.multiplayer_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create rooms" ON public.multiplayer_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator can update room" ON public.multiplayer_rooms FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Creator can delete room" ON public.multiplayer_rooms FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- Players: members can see, own user manages own
CREATE POLICY "Members can view players" ON public.multiplayer_players FOR SELECT TO authenticated USING (is_room_member(auth.uid(), room_id) OR NOT EXISTS (SELECT 1 FROM public.multiplayer_players WHERE room_id = multiplayer_players.room_id));
CREATE POLICY "Users can join rooms" ON public.multiplayer_players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own player" ON public.multiplayer_players FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.multiplayer_players FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Army: through player ownership
CREATE POLICY "Members can view army" ON public.multiplayer_army FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.multiplayer_players mp WHERE mp.id = multiplayer_army.player_id AND is_room_member(auth.uid(), mp.room_id))
);
CREATE POLICY "Own player army insert" ON public.multiplayer_army FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.multiplayer_players mp WHERE mp.id = multiplayer_army.player_id AND mp.user_id = auth.uid())
);
CREATE POLICY "Own player army update" ON public.multiplayer_army FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.multiplayer_players mp WHERE mp.id = multiplayer_army.player_id AND mp.user_id = auth.uid())
);
CREATE POLICY "Own player army delete" ON public.multiplayer_army FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.multiplayer_players mp WHERE mp.id = multiplayer_army.player_id AND mp.user_id = auth.uid())
);

-- Chat: room members
CREATE POLICY "Members can view chat" ON public.multiplayer_chat FOR SELECT TO authenticated USING (is_room_member(auth.uid(), room_id));
CREATE POLICY "Members can send chat" ON public.multiplayer_chat FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_room_member(auth.uid(), room_id));

-- Duels: room members
CREATE POLICY "Members can view duels" ON public.multiplayer_duels FOR SELECT TO authenticated USING (is_room_member(auth.uid(), room_id));
CREATE POLICY "Members can create duels" ON public.multiplayer_duels FOR INSERT TO authenticated WITH CHECK (auth.uid() = challenger_id AND is_room_member(auth.uid(), room_id));
CREATE POLICY "Participants can update duels" ON public.multiplayer_duels FOR UPDATE TO authenticated USING (auth.uid() = challenger_id OR auth.uid() = defender_id);

-- Defeated tiles: room members
CREATE POLICY "Members can view defeated" ON public.multiplayer_defeated_tiles FOR SELECT TO authenticated USING (is_room_member(auth.uid(), room_id));
CREATE POLICY "Members can mark defeated" ON public.multiplayer_defeated_tiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = killed_by AND is_room_member(auth.uid(), room_id));

-- Raids: room members
CREATE POLICY "Members can view raids" ON public.multiplayer_raids FOR SELECT TO authenticated USING (is_room_member(auth.uid(), room_id));
CREATE POLICY "Members can create raids" ON public.multiplayer_raids FOR INSERT TO authenticated WITH CHECK (is_room_member(auth.uid(), room_id));
CREATE POLICY "Members can update raids" ON public.multiplayer_raids FOR UPDATE TO authenticated USING (is_room_member(auth.uid(), room_id));

-- Trades: room members
CREATE POLICY "Members can view trades" ON public.multiplayer_trades FOR SELECT TO authenticated USING (is_room_member(auth.uid(), room_id));
CREATE POLICY "Members can create trades" ON public.multiplayer_trades FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id AND is_room_member(auth.uid(), room_id));
CREATE POLICY "Members can update trades" ON public.multiplayer_trades FOR UPDATE TO authenticated USING (is_room_member(auth.uid(), room_id));
CREATE POLICY "Sellers can delete trades" ON public.multiplayer_trades FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_duels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_defeated_tiles;
