import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
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
  map_row: number;
  map_col: number;
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
  isTelegram: boolean;
  telegramUser: { id: number; first_name: string; last_name?: string; username?: string } | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshBuildings: () => Promise<void>;
  refreshArmy: () => Promise<void>;
  refreshSpells: () => Promise<void>;
  refreshHeroSkills: () => Promise<void>;
  updateGold: (newGold: number) => Promise<void>;
  updateMana: (newMana: number) => Promise<void>;
  updateMapPosition: (row: number, col: number) => Promise<void>;
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
  const [heroSkills, setHeroSkills] = useState<HeroSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const { isTelegram, initData, user: tgUser, isReady: tgReady } = useTelegramWebApp();

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    setProfile(data as Profile | null);
  };

  const fetchBuildings = async (userId: string) => {
    const { data } = await supabase.from('player_buildings').select('id, building_id').eq('user_id', userId);
    setBuildings((data as PlayerBuilding[]) || []);
  };

  const fetchArmy = async (userId: string) => {
    const { data } = await supabase.from('player_army').select('id, unit_name, count').eq('user_id', userId);
    setArmy((data as PlayerArmy[]) || []);
  };

  const fetchSpells = async (userId: string) => {
    const { data } = await supabase.from('player_spells').select('id, spell_id').eq('user_id', userId);
    setSpells((data as PlayerSpell[]) || []);
  };

  const fetchHeroSkills = async (userId: string) => {
    const { data } = await supabase.from('hero_skills').select('id, skill_id, skill_level').eq('user_id', userId);
    setHeroSkills((data as HeroSkill[]) || []);
  };

  const refreshProfile = async () => { if (user) await fetchProfile(user.id); };
  const refreshBuildings = async () => { if (user) await fetchBuildings(user.id); };
  const refreshArmy = async () => { if (user) await fetchArmy(user.id); };
  const refreshSpells = async () => { if (user) await fetchSpells(user.id); };
  const refreshHeroSkills = async () => { if (user) await fetchHeroSkills(user.id); };

  const loadAllData = async (userId: string) => {
    await fetchProfile(userId);
    fetchBuildings(userId);
    fetchArmy(userId);
    fetchSpells(userId);
    fetchHeroSkills(userId);
  };

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

  const updateMapPosition = async (row: number, col: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ map_row: row, map_col: col }).eq('user_id', user.id);
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

  // Telegram auth
  useEffect(() => {
    if (!tgReady || !isTelegram || !initData) return;

    const doTelegramAuth = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/telegram-auth`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
          }
        );
        const result = await res.json();
        if (result.error) {
          console.error('Telegram auth error:', result.error);
          setLoading(false);
          return;
        }
        if (result.session) {
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
        }
      } catch (err) {
        console.error('Telegram auth failed:', err);
        setLoading(false);
      }
    };

    doTelegramAuth();
  }, [tgReady, isTelegram, initData]);

  // Standard auth listener — single entry point to avoid lock conflicts
  useEffect(() => {
    let initialDone = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        initialDone = true;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadAllData(session.user.id);
        } else {
          setProfile(null);
          setBuildings([]);
          setArmy([]);
          setSpells([]);
          setHeroSkills([]);
        }
        setLoading(false);
      }
    );

    // Fallback: if onAuthStateChange doesn't fire within 3s (non-Telegram), resolve loading
    const timeout = setTimeout(async () => {
      if (!initialDone) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error || !session) {
            // Clear any stale/broken session
            await supabase.auth.signOut().catch(() => {});
            setSession(null);
            setUser(null);
            setProfile(null);
          } else {
            setSession(session);
            setUser(session.user);
            await loadAllData(session.user.id);
          }
        } catch {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    }, isTelegram ? 8000 : 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setBuildings([]);
    setArmy([]);
    setSpells([]);
    setHeroSkills([]);
  };

  return (
    <AuthContext.Provider value={{ 
      user, session, profile, buildings, army, spells, heroSkills, loading,
      isTelegram, telegramUser: tgUser,
      signOut, refreshProfile, refreshBuildings, refreshArmy, refreshSpells, refreshHeroSkills,
      updateGold, updateMana, updateMapPosition, updateDay, updateHeroStats, setBuiltThisTurn
    }}>
      {children}
    </AuthContext.Provider>
  );
};
