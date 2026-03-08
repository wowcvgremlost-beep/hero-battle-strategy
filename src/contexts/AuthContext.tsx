import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  character_name: string | null;
  town: string | null;
  character_created: boolean;
  gold: number;
  mana: number;
  hero_id: string | null;
  hero_attack: number;
  hero_defense: number;
  hero_spellpower: number;
  hero_knowledge: number;
  hero_level: number;
  hero_experience: number;
  map_position: number;
  day: number;
  built_this_turn: boolean;
}

interface PlayerBuilding {
  id: string;
  building_id: string;
}

interface PlayerArmy {
  id: string;
  unit_name: string;
  count: number;
}

interface PlayerSpell {
  id: string;
  spell_id: string;
}

interface HeroSkill {
  id: string;
  skill_id: string;
  skill_level: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  buildings: PlayerBuilding[];
  army: PlayerArmy[];
  spells: PlayerSpell[];
  heroSkills: HeroSkill[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshBuildings: () => Promise<void>;
  refreshArmy: () => Promise<void>;
  refreshSpells: () => Promise<void>;
  refreshHeroSkills: () => Promise<void>;
  updateGold: (newGold: number) => Promise<void>;
  updateMana: (newMana: number) => Promise<void>;
  updateMapPosition: (newPosition: number) => Promise<void>;
  updateDay: (newDay: number) => Promise<void>;
  updateHeroStats: (stats: Partial<Pick<Profile, 'hero_attack' | 'hero_defense' | 'hero_spellpower' | 'hero_knowledge' | 'hero_level' | 'hero_experience'>>) => Promise<void>;
  setBuiltThisTurn: (val: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [buildings, setBuildings] = useState<PlayerBuilding[]>([]);
  const [army, setArmy] = useState<PlayerArmy[]>([]);
  const [spells, setSpells] = useState<PlayerSpell[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    setProfile(data as Profile | null);
  };

  const fetchBuildings = async (userId: string) => {
    const { data } = await supabase
      .from('player_buildings')
      .select('id, building_id')
      .eq('user_id', userId);
    setBuildings((data as PlayerBuilding[]) || []);
  };

  const fetchArmy = async (userId: string) => {
    const { data } = await supabase
      .from('player_army')
      .select('id, unit_name, count')
      .eq('user_id', userId);
    setArmy((data as PlayerArmy[]) || []);
  };

  const fetchSpells = async (userId: string) => {
    const { data } = await supabase
      .from('player_spells')
      .select('id, spell_id')
      .eq('user_id', userId);
    setSpells((data as PlayerSpell[]) || []);
  };

  const refreshProfile = async () => { if (user) await fetchProfile(user.id); };
  const refreshBuildings = async () => { if (user) await fetchBuildings(user.id); };
  const refreshArmy = async () => { if (user) await fetchArmy(user.id); };
  const refreshSpells = async () => { if (user) await fetchSpells(user.id); };

  const updateGold = async (newGold: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ gold: newGold }).eq('user_id', user.id);
    await refreshProfile();
  };

  const updateMana = async (newMana: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ mana: newMana }).eq('user_id', user.id);
    await refreshProfile();
  };

  const updateMapPosition = async (newPosition: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ map_position: newPosition }).eq('user_id', user.id);
    await refreshProfile();
  };

  const updateDay = async (newDay: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ day: newDay, built_this_turn: false }).eq('user_id', user.id);
    await refreshProfile();
  };

  const updateHeroStats = async (stats: Partial<Pick<Profile, 'hero_attack' | 'hero_defense' | 'hero_spellpower' | 'hero_knowledge' | 'hero_level' | 'hero_experience'>>) => {
    if (!user) return;
    await supabase.from('profiles').update(stats).eq('user_id', user.id);
    await refreshProfile();
  };

  const setBuiltThisTurn = async (val: boolean) => {
    if (!user) return;
    await supabase.from('profiles').update({ built_this_turn: val }).eq('user_id', user.id);
    await refreshProfile();
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchBuildings(session.user.id);
            fetchArmy(session.user.id);
            fetchSpells(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setBuildings([]);
          setArmy([]);
          setSpells([]);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchBuildings(session.user.id);
        fetchArmy(session.user.id);
        fetchSpells(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setBuildings([]);
    setArmy([]);
    setSpells([]);
  };

  return (
    <AuthContext.Provider value={{ 
      user, session, profile, buildings, army, spells, loading, 
      signOut, refreshProfile, refreshBuildings, refreshArmy, refreshSpells,
      updateGold, updateMana, updateMapPosition, updateDay, updateHeroStats, setBuiltThisTurn
    }}>
      {children}
    </AuthContext.Provider>
  );
};
