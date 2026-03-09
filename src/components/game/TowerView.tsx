import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, Users, Skull, Crown } from 'lucide-react';
import { TOWER_FLOORS, type TowerFloor } from '@/data/tower';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import TowerFloorMap from './TowerFloorMap';

const TowerView = () => {
  const { user, profile } = useAuth();
  const [unlockedFloors, setUnlockedFloors] = useState<Set<number>>(new Set([1]));
  const [selectedFloor, setSelectedFloor] = useState<TowerFloor | null>(null);
  const [playersOnFloors, setPlayersOnFloors] = useState<Record<number, number>>({});

  // Load unlocked floors
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('tower_progress')
        .select('floor_id')
        .eq('user_id', user.id);
      const set = new Set([1]); // floor 1 always unlocked
      data?.forEach(d => set.add(d.floor_id));
      setUnlockedFloors(set);
    };
    load();

    // Realtime
    const ch = supabase.channel('tower-progress-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tower_progress', filter: `user_id=eq.${user.id}` }, (p) => {
        setUnlockedFloors(prev => new Set([...prev, (p.new as any).floor_id]));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  // Load player counts per floor
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('current_floor')
        .eq('character_created', true);
      if (data) {
        const counts: Record<number, number> = {};
        data.forEach(p => {
          const f = (p as any).current_floor || 1;
          counts[f] = (counts[f] || 0) + 1;
        });
        setPlayersOnFloors(counts);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (selectedFloor) {
    return (
      <TowerFloorMap
        floor={selectedFloor}
        onBack={() => setSelectedFloor(null)}
        unlockedFloors={unlockedFloors}
        onUnlockFloor={(floorId) => setUnlockedFloors(prev => new Set([...prev, floorId]))}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="text-center mb-2">
        <h2 className="font-display text-lg font-bold text-gradient-gold">🏰 БАШНЯ</h2>
        <p className="text-[10px] text-muted-foreground">Покоряйте этажи, побеждайте боссов</p>
      </div>

      <div className="space-y-2">
        {[...TOWER_FLOORS].reverse().map((floor) => {
          const unlocked = unlockedFloors.has(floor.id);
          const canAccess = unlocked && (profile?.hero_level || 1) >= floor.minLevel;
          const playerCount = playersOnFloors[floor.id] || 0;
          const isCurrentFloor = (profile as any)?.current_floor === floor.id;

          return (
            <motion.button
              key={floor.id}
              whileTap={canAccess ? { scale: 0.97 } : undefined}
              onClick={() => canAccess && setSelectedFloor(floor)}
              disabled={!canAccess}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                isCurrentFloor
                  ? 'border-gold/50 bg-gold/10 shadow-gold'
                  : unlocked
                    ? 'border-border bg-gradient-card hover:border-gold/30'
                    : 'border-border/30 bg-secondary/30 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  unlocked ? 'bg-gradient-to-br ' + floor.theme : 'bg-secondary'
                }`}>
                  {unlocked ? floor.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-foreground">
                      {floor.id}F — {floor.name}
                    </span>
                    {floor.monsters.find(m => m.isBoss) && (
                      <Crown className="h-3 w-3 text-gold" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{floor.description}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      <Skull className="h-3 w-3 inline mr-0.5" />
                      {floor.monsters.length} монстров
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Ур. {floor.minLevel}+
                    </span>
                    {playerCount > 0 && (
                      <span className="text-[10px] text-emerald">
                        <Users className="h-3 w-3 inline mr-0.5" />
                        {playerCount}
                      </span>
                    )}
                  </div>
                </div>
                {canAccess && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                {!unlocked && (
                  <span className="text-[9px] text-muted-foreground">🔒</span>
                )}
                {unlocked && !canAccess && (
                  <span className="text-[9px] text-crimson">Ур. {floor.minLevel}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TowerView;
