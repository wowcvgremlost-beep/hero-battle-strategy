-- Add resources to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gold INTEGER NOT NULL DEFAULT 10000,
ADD COLUMN IF NOT EXISTS mana INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS hero_id TEXT,
ADD COLUMN IF NOT EXISTS hero_attack INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS hero_defense INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS hero_spellpower INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS hero_knowledge INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS hero_level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS hero_experience INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS map_position INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS day INTEGER NOT NULL DEFAULT 1;

-- Create player buildings table
CREATE TABLE IF NOT EXISTS public.player_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  building_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, building_id)
);

ALTER TABLE public.player_buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own buildings" ON public.player_buildings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own buildings" ON public.player_buildings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buildings" ON public.player_buildings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create player army table
CREATE TABLE IF NOT EXISTS public.player_army (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unit_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, unit_name)
);

ALTER TABLE public.player_army ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own army" ON public.player_army
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own army" ON public.player_army
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own army" ON public.player_army
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own army" ON public.player_army
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create player spells table
CREATE TABLE IF NOT EXISTS public.player_spells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spell_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, spell_id)
);

ALTER TABLE public.player_spells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own spells" ON public.player_spells
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spells" ON public.player_spells
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create battles history table
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  defender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_pve BOOLEAN NOT NULL DEFAULT true,
  attacker_power INTEGER NOT NULL,
  defender_power INTEGER NOT NULL,
  winner_id UUID,
  gold_reward INTEGER NOT NULL DEFAULT 0,
  exp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their battles" ON public.battles
  FOR SELECT TO authenticated USING (auth.uid() = attacker_id OR auth.uid() = defender_id);

CREATE POLICY "Users can insert battles" ON public.battles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = attacker_id);