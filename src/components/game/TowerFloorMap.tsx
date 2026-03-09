import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Swords, Shield, Users, Clock, Crown, Skull, Sparkles, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TOWER_FLOORS, BOSS_RESPAWN_MINUTES, MOB_RESPAWN_MINUTES, type TowerFloor, type TowerMonster } from '@/data/tower';
import { TOWNS } from '@/data/towns';
import { getSkillBonuses } from '@/data/skills';
import BattleSystem from './BattleSystem';

interface TowerFloorMapProps {
  floor: TowerFloor;
  onBack: () => void;
  unlockedFloors: Set<number>;
  onUnlockFloor: (floorId: number) => void;
}

interface KillRecord {
  monster_id: string;
  killed_at: string;
  user_id: string;
}

const TowerFloorMap = ({ floor, onBack, unlockedFloors, onUnlockFloor }: TowerFloorMapProps) => {
  const { user, profile, army, heroSkills, updateGold, updateHeroStats } = useAuth();
  const [kills, setKills] = useState<KillRecord[]>([]);
  const [battleMonster, setBattleMonster] = useState<TowerMonster | null>(null);
  const [playersOnFloor, setPlayersOnFloor] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());

  // Update current floor in profile
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').update({ current_floor: floor.id } as any).eq('user_id', user.id);
  }, [floor.id, user]);

  // Timer for respawn countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  // Load kills for this floor
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('tower_kills')
        .select('monster_id, killed_at, user_id')
        .eq('floor_id', floor.id);
      if (data) setKills(data);
    };
    load();

    const ch = supabase.channel(`tower-kills-${floor.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tower_kills', filter: `floor_id=eq.${floor.id}` }, (p) => {
        const rec = p.new as any;
        setKills(prev => [...prev, { monster_id: rec.monster_id, killed_at: rec.killed_at, user_id: rec.user_id }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [floor.id]);

  // Load players on this floor
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, character_name, hero_level, hero_id, town, current_floor')
        .eq('character_created', true)
        .eq('current_floor' as any, floor.id);
      if (data) setPlayersOnFloor(data.filter(p => p.user_id !== user?.id));
    };
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [floor.id, user]);

  // Check if monster is dead (respawn logic)
  const isMonsterDead = useCallback((monsterId: string, isBoss: boolean): boolean => {
    const respawnMs = (isBoss ? BOSS_RESPAWN_MINUTES : MOB_RESPAWN_MINUTES) * 60 * 1000;
    const kill = kills.find(k => k.monster_id === monsterId);
    if (!kill) return false;
    return (now - new Date(kill.killed_at).getTime()) < respawnMs;
  }, [kills, now]);

  // Get respawn time remaining
  const getRespawnTime = useCallback((monsterId: string, isBoss: boolean): string => {
    const respawnMs = (isBoss ? BOSS_RESPAWN_MINUTES : MOB_RESPAWN_MINUTES) * 60 * 1000;
    const kill = kills.find(k => k.monster_id === monsterId);
    if (!kill) return '';
    const elapsed = now - new Date(kill.killed_at).getTime();
    const remaining = respawnMs - elapsed;
    if (remaining <= 0) return '';
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [kills, now]);

  // Combat stats
  const town = TOWNS.find((t) => t.id === profile?.town);
  const skillsMap: Record<string, number> = {};
  heroSkills.forEach(s => { skillsMap[s.skill_id] = s.skill_level; });
  const bonuses = getSkillBonuses(skillsMap);
  const heroAttack = (profile?.hero_attack || 1) + bonuses.bonusAttack;
  const heroDefense = (profile?.hero_defense || 1) + bonuses.bonusDefense;

  const handleAttackMonster = (monster: TowerMonster) => {
    if (isMonsterDead(monster.id, monster.isBoss)) {
      const time = getRespawnTime(monster.id, monster.isBoss);
      toast.info(`${monster.name} ещё не воскрес. Респаун через ${time}`);
      return;
    }
    setBattleMonster(monster);
  };

  const handleVictory = async () => {
    if (!battleMonster || !user) return;
    // Record kill
    await supabase.from('tower_kills').insert({
      user_id: user.id,
      floor_id: floor.id,
      monster_id: battleMonster.id,
    });

    // Record battle
    await supabase.from('battles').insert({
      attacker_id: user.id,
      is_pve: true,
      attacker_power: heroAttack * 5,
      defender_power: battleMonster.power,
      winner_id: user.id,
      gold_reward: battleMonster.goldReward,
      exp_reward: battleMonster.expReward,
    });

    // If boss killed, unlock next floor
    if (battleMonster.isBoss) {
      const nextFloorId = floor.id + 1;
      if (nextFloorId <= 10 && !unlockedFloors.has(nextFloorId)) {
        await supabase.from('tower_progress').insert({
          user_id: user.id,
          floor_id: nextFloorId,
        });
        onUnlockFloor(nextFloorId);
        toast.success(`🏰 Этаж ${nextFloorId} открыт!`);
      }
    }

    setBattleMonster(null);
  };

  // Grid: 4 columns x 4 rows
  const gridCols = 4;
  const gridRows = 4;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-display text-sm font-bold text-gradient-gold flex items-center gap-2">
            <span>{floor.icon}</span>
            {floor.id}F — {floor.name}
          </h2>
          <p className="text-[10px] text-muted-foreground">{floor.description}</p>
        </div>
      </div>

      {/* Players on this floor */}
      {playersOnFloor.length > 0 && (
        <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-2">
          <div className="flex items-center gap-1 mb-1">
            <Users className="h-3 w-3 text-emerald" />
            <span className="text-[10px] text-emerald font-bold">Игроки на этаже</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {playersOnFloor.map((p, i) => (
              <span key={i} className="text-[10px] bg-secondary rounded-full px-2 py-0.5 text-foreground">
                {p.character_name} (Ур.{p.hero_level})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Monster grid */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: gridRows * gridCols }, (_, idx) => {
          const gx = idx % gridCols;
          const gy = Math.floor(idx / gridCols);
          const monster = floor.monsters.find(m => m.gridX === gx && m.gridY === gy);

          if (!monster) {
            return (
              <div key={idx} className="aspect-square rounded-lg bg-secondary/20 border border-border/20" />
            );
          }

          const dead = isMonsterDead(monster.id, monster.isBoss);
          const respawnTime = getRespawnTime(monster.id, monster.isBoss);

          return (
            <motion.button
              key={idx}
              whileTap={!dead ? { scale: 0.93 } : undefined}
              onClick={() => handleAttackMonster(monster)}
              disabled={dead}
              className={`aspect-square rounded-lg border p-1.5 flex flex-col items-center justify-center gap-0.5 transition-all ${
                dead
                  ? 'border-border/20 bg-secondary/20 opacity-40'
                  : monster.isBoss
                    ? 'border-gold/40 bg-gold/10 shadow-gold hover:border-gold/60'
                    : 'border-crimson/30 bg-crimson/5 hover:border-crimson/50'
              }`}
            >
              <span className={`text-lg ${dead ? 'grayscale' : ''}`}>{monster.icon}</span>
              <span className={`text-[8px] font-bold text-center leading-tight ${
                monster.isBoss ? 'text-gold' : 'text-foreground'
              }`}>
                {monster.name}
              </span>
              {dead ? (
                <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-2 w-2" />
                  {respawnTime}
                </span>
              ) : (
                <span className="text-[8px] text-crimson flex items-center gap-0.5">
                  <Swords className="h-2 w-2" />
                  {monster.power}
                </span>
              )}
              {monster.isBoss && !dead && (
                <Crown className="h-2.5 w-2.5 text-gold" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="rounded-lg bg-secondary/30 p-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Skull className="h-3 w-3" /> Мобы: {MOB_RESPAWN_MINUTES}мин
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Crown className="h-3 w-3" /> Босс: {BOSS_RESPAWN_MINUTES}мин
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground">
          {floor.monsters.filter(m => !isMonsterDead(m.id, m.isBoss)).length}/{floor.monsters.length} живы
        </span>
      </div>

      {/* Battle */}
      {battleMonster && (
        <BattleSystem
          monsterPower={battleMonster.power}
          monsterName={`${battleMonster.icon} ${battleMonster.name}${battleMonster.isBoss ? ' [БОСС]' : ''}`}
          goldReward={battleMonster.goldReward}
          expReward={battleMonster.expReward}
          onClose={() => setBattleMonster(null)}
          onVictory={handleVictory}
        />
      )}
    </motion.div>
  );
};

export default TowerFloorMap;
