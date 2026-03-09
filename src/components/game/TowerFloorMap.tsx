import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Swords, Users, Clock, Crown, Skull, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  FLOOR_COLS, FLOOR_ROWS, BOSS_RESPAWN_MINUTES, MOB_RESPAWN_MINUTES,
  getMobPositions, getTrapPositions, getQuestPositions,
  type TowerFloor, type TowerMonster
} from '@/data/tower';
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
}

const TowerFloorMap = ({ floor, onBack, unlockedFloors, onUnlockFloor }: TowerFloorMapProps) => {
  const { user, profile, heroSkills, updateGold, updateHeroStats } = useAuth();
  const [kills, setKills] = useState<KillRecord[]>([]);
  const [battleMonster, setBattleMonster] = useState<TowerMonster | null>(null);
  const [playersOnFloor, setPlayersOnFloor] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const [playerPos, setPlayerPos] = useState<[number, number]>(floor.entrance);
  const [revealed, setRevealed] = useState<Set<string>>(() => {
    if (!user) return new Set();
    try {
      const s = localStorage.getItem(`tower_fog_${user.id}_${floor.id}`);
      if (s) return new Set(JSON.parse(s));
    } catch {}
    return new Set();
  });
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(() => {
    if (!user) return new Set();
    try {
      const s = localStorage.getItem(`tower_quests_${user.id}_${floor.id}`);
      if (s) return new Set(JSON.parse(s));
    } catch {}
    return new Set();
  });
  const [triggeredTraps, setTriggeredTraps] = useState<Set<string>>(new Set());

  const wallsSet = useMemo(() => {
    const s = new Set<string>();
    floor.walls.forEach(([r, c]) => s.add(`${r},${c}`));
    return s;
  }, [floor]);

  // Reveal tiles around player (radius 1)
  const revealAround = useCallback((r: number, c: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < FLOOR_ROWS && nc >= 0 && nc < FLOOR_COLS) {
            next.add(`${nr},${nc}`);
          }
        }
      }
      if (user) localStorage.setItem(`tower_fog_${user.id}_${floor.id}`, JSON.stringify([...next]));
      return next;
    });
  }, [user, floor.id]);

  // Initial reveal at spawn
  useEffect(() => {
    revealAround(playerPos[0], playerPos[1]);
  }, []);

  // Update current floor in profile
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').update({ current_floor: floor.id } as any).eq('user_id', user.id);
  }, [floor.id, user]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  // Load kills
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('tower_kills')
        .select('monster_id, killed_at')
        .eq('floor_id', floor.id);
      if (data) setKills(data);
    };
    load();

    const ch = supabase.channel(`tower-kills-${floor.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tower_kills', filter: `floor_id=eq.${floor.id}` }, (p) => {
        const rec = p.new as any;
        setKills(prev => [...prev, { monster_id: rec.monster_id, killed_at: rec.killed_at }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [floor.id]);

  // Load other players
  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase
        .from('profiles')
        .select('user_id, character_name, hero_level') as any)
        .eq('character_created', true)
        .eq('current_floor', floor.id);
      if (data) setPlayersOnFloor(data.filter((p: any) => p.user_id !== user?.id));
    };
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [floor.id, user]);

  // Monster dead check
  const isMonsterDead = useCallback((monsterId: string, isBoss: boolean): boolean => {
    const respawnMs = (isBoss ? BOSS_RESPAWN_MINUTES : MOB_RESPAWN_MINUTES) * 60 * 1000;
    const kill = kills.find(k => k.monster_id === monsterId);
    if (!kill) return false;
    return (now - new Date(kill.killed_at).getTime()) < respawnMs;
  }, [kills, now]);

  const getRespawnTime = useCallback((monsterId: string, isBoss: boolean): string => {
    const respawnMs = (isBoss ? BOSS_RESPAWN_MINUTES : MOB_RESPAWN_MINUTES) * 60 * 1000;
    const kill = kills.find(k => k.monster_id === monsterId);
    if (!kill) return '';
    const remaining = respawnMs - (now - new Date(kill.killed_at).getTime());
    if (remaining <= 0) return '';
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [kills, now]);

  // Compute dynamic positions
  const mobPositions = useMemo(() =>
    getMobPositions(floor, now, wallsSet, floor.exit, floor.entrance),
    [floor, now, wallsSet]
  );

  const mobOccupied = useMemo(() => {
    const s = new Set<string>();
    mobPositions.forEach((_, key) => s.add(key));
    s.add(`${floor.exit[0]},${floor.exit[1]}`);
    s.add(`${floor.entrance[0]},${floor.entrance[1]}`);
    return s;
  }, [mobPositions, floor]);

  const trapPositions = useMemo(() =>
    getTrapPositions(floor, now, wallsSet, mobOccupied),
    [floor, now, wallsSet, mobOccupied]
  );

  const questPositions = useMemo(() => {
    const allOccupied = new Set(mobOccupied);
    trapPositions.forEach((_, k) => allOccupied.add(k));
    return getQuestPositions(floor, wallsSet, allOccupied);
  }, [floor, wallsSet, mobOccupied, trapPositions]);

  // Player movement
  const handleCellClick = (r: number, c: number) => {
    if (battleMonster) return;
    const key = `${r},${c}`;
    // Must be adjacent
    const dr = Math.abs(r - playerPos[0]);
    const dc = Math.abs(c - playerPos[1]);
    if (dr + dc !== 1) return; // only cardinal movement
    if (wallsSet.has(key)) return;

    // Check for monster
    const monster = mobPositions.get(key);
    if (monster && !isMonsterDead(monster.id, monster.isBoss)) {
      setBattleMonster(monster);
      setPlayerPos([r, c]);
      revealAround(r, c);
      return;
    }

    // Check boss at exit
    if (r === floor.exit[0] && c === floor.exit[1]) {
      if (!isMonsterDead(floor.boss.id, true)) {
        setBattleMonster(floor.boss);
        setPlayerPos([r, c]);
        revealAround(r, c);
        return;
      }
    }

    // Move player
    setPlayerPos([r, c]);
    revealAround(r, c);

    // Check trap
    const trap = trapPositions.get(key);
    if (trap && !triggeredTraps.has(key)) {
      setTriggeredTraps(prev => new Set([...prev, key]));
      if (profile && user) {
        const newGold = Math.max(0, (profile.gold || 0) - trap.damage);
        updateGold(newGold);
        toast.error(`${trap.icon} ${trap.name}: ${trap.description}`);
      }
    }

    // Check quest
    const quest = questPositions.get(key);
    if (quest && !completedQuests.has(quest.id)) {
      setCompletedQuests(prev => {
        const next = new Set([...prev, quest.id]);
        if (user) localStorage.setItem(`tower_quests_${user.id}_${floor.id}`, JSON.stringify([...next]));
        return next;
      });
      if (profile && user) {
        updateGold((profile.gold || 0) + quest.goldReward);
        updateHeroStats({ hero_experience: (profile.hero_experience || 0) + quest.expReward });
        toast.success(`${quest.icon} ${quest.name}: +${quest.goldReward}💰 +${quest.expReward}✨`);
      }
    }
  };

  const handleVictory = async () => {
    if (!battleMonster || !user) return;
    await supabase.from('tower_kills').insert({
      user_id: user.id, floor_id: floor.id, monster_id: battleMonster.id,
    });
    await supabase.from('battles').insert({
      attacker_id: user.id, is_pve: true,
      attacker_power: (profile?.hero_attack || 1) * 5,
      defender_power: battleMonster.power,
      winner_id: user.id,
      gold_reward: battleMonster.goldReward, exp_reward: battleMonster.expReward,
    });

    if (battleMonster.isBoss) {
      const nextFloorId = floor.id + 1;
      if (nextFloorId <= 10 && !unlockedFloors.has(nextFloorId)) {
        await supabase.from('tower_progress').insert({ user_id: user.id, floor_id: nextFloorId });
        onUnlockFloor(nextFloorId);
        toast.success(`🏰 Этаж ${nextFloorId} открыт!`);
      }
    }
    setBattleMonster(null);
  };

  // Render grid
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-display text-sm font-bold text-gradient-gold flex items-center gap-2">
            <span>{floor.icon}</span> {floor.id}F — {floor.name}
          </h2>
          <p className="text-[10px] text-muted-foreground">{floor.description}</p>
        </div>
        {playersOnFloor.length > 0 && (
          <span className="text-[10px] text-emerald flex items-center gap-1">
            <Users className="h-3 w-3" /> {playersOnFloor.length}
          </span>
        )}
      </div>

      {/* Players list */}
      {playersOnFloor.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {playersOnFloor.map((p, i) => (
            <span key={i} className="text-[9px] bg-emerald/10 border border-emerald/20 rounded-full px-2 py-0.5 text-emerald">
              {p.character_name} Ур.{p.hero_level}
            </span>
          ))}
        </div>
      )}

      {/* Grid map */}
      <div className="grid gap-[2px] mx-auto" style={{
        gridTemplateColumns: `repeat(${FLOOR_COLS}, 1fr)`,
        maxWidth: `${FLOOR_COLS * 48}px`,
      }}>
        {Array.from({ length: FLOOR_ROWS * FLOOR_COLS }, (_, idx) => {
          const r = Math.floor(idx / FLOOR_COLS);
          const c = idx % FLOOR_COLS;
          const key = `${r},${c}`;
          const isRevealed = revealed.has(key);
          const isPlayer = r === playerPos[0] && c === playerPos[1];
          const isWall = wallsSet.has(key);
          const isEntrance = r === floor.entrance[0] && c === floor.entrance[1];
          const isExit = r === floor.exit[0] && c === floor.exit[1];
          const monster = mobPositions.get(key);
          const trap = trapPositions.get(key);
          const quest = questPositions.get(key);
          const bossDead = isMonsterDead(floor.boss.id, true);
          const monsterDead = monster ? isMonsterDead(monster.id, monster.isBoss) : false;

          // Adjacency for click
          const dr = Math.abs(r - playerPos[0]);
          const dc = Math.abs(c - playerPos[1]);
          const isAdjacent = dr + dc === 1;

          // Fog of war
          if (!isRevealed) {
            return (
              <div key={idx} className="aspect-square rounded-sm bg-muted/80 border border-border/10" />
            );
          }

          let content: React.ReactNode = null;
          let cellClass = 'bg-secondary/30 border-border/20';

          if (isPlayer) {
            content = <span className="text-sm">🧙</span>;
            cellClass = 'bg-arcane/20 border-arcane/40 ring-1 ring-arcane/30';
          } else if (isWall) {
            content = <span className="text-xs opacity-40">🧱</span>;
            cellClass = 'bg-muted border-muted';
          } else if (isExit) {
            if (!bossDead) {
              content = <span className="text-sm">{floor.boss.icon}</span>;
              cellClass = 'bg-gold/15 border-gold/40';
            } else {
              content = <span className="text-xs">🚪</span>;
              cellClass = 'bg-emerald/10 border-emerald/30';
            }
          } else if (isEntrance) {
            content = <span className="text-xs">🔽</span>;
            cellClass = 'bg-secondary/40 border-border/30';
          } else if (monster && !monsterDead) {
            content = <span className="text-sm">{monster.icon}</span>;
            cellClass = 'bg-crimson/10 border-crimson/30';
          } else if (monster && monsterDead) {
            content = <span className="text-[8px] text-muted-foreground"><Clock className="h-2.5 w-2.5 inline" /></span>;
            cellClass = 'bg-secondary/20 border-border/10 opacity-40';
          } else if (quest && !completedQuests.has(quest.id)) {
            content = <span className="text-sm">{quest.icon}</span>;
            cellClass = 'bg-gold/10 border-gold/20';
          } else if (trap && !triggeredTraps.has(key)) {
            // Traps are HIDDEN until stepped on — show as empty
            content = null;
            cellClass = 'bg-secondary/30 border-border/20';
          } else if (quest && completedQuests.has(quest.id)) {
            content = <span className="text-xs opacity-30">✓</span>;
          }

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(r, c)}
              disabled={!isAdjacent || isWall || isPlayer}
              className={`aspect-square rounded-sm border flex items-center justify-center transition-all ${cellClass} ${
                isAdjacent && !isWall && !isPlayer ? 'cursor-pointer hover:brightness-125 ring-1 ring-foreground/10' : ''
              }`}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="rounded-lg bg-secondary/30 p-2 flex items-center justify-between text-[9px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>🧙 Вы</span>
          <span>{floor.boss.icon} Босс</span>
          <span>🚪 Выход</span>
        </div>
        <span>
          <Eye className="h-3 w-3 inline mr-0.5" />
          {revealed.size}/{FLOOR_ROWS * FLOOR_COLS}
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
