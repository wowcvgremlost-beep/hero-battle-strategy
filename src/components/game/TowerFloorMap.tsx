import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Clock, Crown, Skull, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  FLOOR_COLS, FLOOR_ROWS, BOSS_RESPAWN_MINUTES, MOB_RESPAWN_MINUTES,
  getWalls, getMobPositions, getTrapPositions, getQuestPositions,
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

const CELL_SIZE = 48;
const VIEWPORT_CELLS = 6; // visible cells in each direction

const TowerFloorMap = ({ floor, onBack, unlockedFloors, onUnlockFloor }: TowerFloorMapProps) => {
  const { user, profile, heroSkills, updateGold, updateHeroStats } = useAuth();
  const [kills, setKills] = useState<KillRecord[]>([]);
  const [battleMonster, setBattleMonster] = useState<TowerMonster | null>(null);
  const [playersOnFloor, setPlayersOnFloor] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const [playerPos, setPlayerPos] = useState<[number, number]>(floor.entrance);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const wallsSet = useMemo(() => getWalls(floor), [floor]);

  // Reveal tiles around player (radius 2)
  const revealAround = useCallback((r: number, c: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
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

  // Initial reveal
  useEffect(() => {
    revealAround(playerPos[0], playerPos[1]);
  }, []);

  // Scroll to player
  useEffect(() => {
    if (scrollRef.current) {
      const left = playerPos[1] * CELL_SIZE - (scrollRef.current.clientWidth / 2) + CELL_SIZE / 2;
      const top = playerPos[0] * CELL_SIZE - (scrollRef.current.clientHeight / 2) + CELL_SIZE / 2;
      scrollRef.current.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: 'smooth' });
    }
  }, [playerPos]);

  // Update current floor
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

  // Dynamic positions
  const mobPositions = useMemo(() => getMobPositions(floor, now, wallsSet), [floor, now, wallsSet]);

  const mobOccupied = useMemo(() => {
    const s = new Set<string>();
    mobPositions.forEach((_, key) => s.add(key));
    s.add(`${floor.exit[0]},${floor.exit[1]}`);
    s.add(`${floor.entrance[0]},${floor.entrance[1]}`);
    return s;
  }, [mobPositions, floor]);

  const trapPositions = useMemo(() => getTrapPositions(floor, now, wallsSet, mobOccupied), [floor, now, wallsSet, mobOccupied]);

  const questPositions = useMemo(() => {
    const allOcc = new Set(mobOccupied);
    trapPositions.forEach((_, k) => allOcc.add(k));
    return getQuestPositions(floor, wallsSet, allOcc);
  }, [floor, wallsSet, mobOccupied, trapPositions]);

  // Visible range for rendering (only render cells near player for performance)
  const viewRange = VIEWPORT_CELLS + 2;
  const minR = Math.max(0, playerPos[0] - viewRange);
  const maxR = Math.min(FLOOR_ROWS - 1, playerPos[0] + viewRange);
  const minC = Math.max(0, playerPos[1] - viewRange);
  const maxC = Math.min(FLOOR_COLS - 1, playerPos[1] + viewRange);

  const handleCellClick = (r: number, c: number) => {
    if (battleMonster) return;
    const key = `${r},${c}`;
    const dr = Math.abs(r - playerPos[0]);
    const dc = Math.abs(c - playerPos[1]);
    if (dr + dc !== 1) return;
    if (wallsSet.has(key)) return;

    // Monster
    const monster = mobPositions.get(key);
    if (monster && !isMonsterDead(monster.id, monster.isBoss)) {
      setPlayerPos([r, c]);
      revealAround(r, c);
      setBattleMonster(monster);
      return;
    }

    // Boss at exit
    if (r === floor.exit[0] && c === floor.exit[1] && !isMonsterDead(floor.boss.id, true)) {
      setPlayerPos([r, c]);
      revealAround(r, c);
      setBattleMonster(floor.boss);
      return;
    }

    // Move
    setPlayerPos([r, c]);
    revealAround(r, c);

    // Trap
    const trap = trapPositions.get(key);
    if (trap && !triggeredTraps.has(key)) {
      setTriggeredTraps(prev => new Set([...prev, key]));
      if (profile && user) {
        updateGold(Math.max(0, (profile.gold || 0) - trap.damage));
        toast.error(`${trap.icon} ${trap.name}: ${trap.description}`);
      }
    }

    // Quest
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
    // Record kill (battle record is already handled by BattleSystem)
    await supabase.from('tower_kills').insert({
      user_id: user.id, floor_id: floor.id, monster_id: battleMonster.id,
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

  // Build visible cells
  const cells: React.ReactNode[] = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const key = `${r},${c}`;
      const isRevealed = revealed.has(key);
      const isPlayer = r === playerPos[0] && c === playerPos[1];
      const isWall = wallsSet.has(key);
      const isEntrance = r === floor.entrance[0] && c === floor.entrance[1];
      const isExit = r === floor.exit[0] && c === floor.exit[1];
      const monster = mobPositions.get(key);
      const bossDead = isMonsterDead(floor.boss.id, true);
      const monsterDead = monster ? isMonsterDead(monster.id, monster.isBoss) : false;
      const trap = trapPositions.get(key);
      const quest = questPositions.get(key);

      const dr = Math.abs(r - playerPos[0]);
      const dc = Math.abs(c - playerPos[1]);
      const isAdjacent = dr + dc === 1;

      let content: React.ReactNode = null;
      let bg = 'bg-secondary/20';
      let border = 'border-border/10';

      if (!isRevealed) {
        bg = 'bg-muted/90';
        border = 'border-muted/40';
      } else if (isPlayer) {
        content = <span className="text-xs">🧙</span>;
        bg = 'bg-arcane/25';
        border = 'border-arcane/50';
      } else if (isWall) {
        content = <span className="text-[8px] opacity-30">🧱</span>;
        bg = 'bg-muted/60';
        border = 'border-muted/30';
      } else if (isExit && !bossDead) {
        content = <span className="text-xs">{floor.boss.icon}</span>;
        bg = 'bg-gold/15';
        border = 'border-gold/40';
      } else if (isExit && bossDead) {
        content = <span className="text-[8px]">🚪</span>;
        bg = 'bg-emerald/15';
        border = 'border-emerald/30';
      } else if (isEntrance) {
        content = <span className="text-[8px]">🔽</span>;
        bg = 'bg-secondary/40';
      } else if (monster && !monsterDead) {
        content = <span className="text-xs">{monster.icon}</span>;
        bg = 'bg-crimson/10';
        border = 'border-crimson/25';
      } else if (monster && monsterDead) {
        content = <span className="text-[6px]">💤</span>;
        bg = 'bg-secondary/10 opacity-30';
      } else if (quest && !completedQuests.has(quest.id)) {
        content = <span className="text-xs">{quest.icon}</span>;
        bg = 'bg-gold/10';
        border = 'border-gold/20';
      } else if (quest && completedQuests.has(quest.id)) {
        content = <span className="text-[7px] opacity-30">✓</span>;
      }
      // Traps stay hidden

      cells.push(
        <div
          key={key}
          onClick={() => isRevealed && handleCellClick(r, c)}
          style={{
            position: 'absolute',
            left: c * CELL_SIZE,
            top: r * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
          className={`border flex items-center justify-center ${bg} ${border} ${
            isRevealed && isAdjacent && !isWall && !isPlayer ? 'cursor-pointer hover:brightness-150 ring-1 ring-foreground/5' : ''
          }`}
        >
          {content}
        </div>
      );
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
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

      {/* Players */}
      {playersOnFloor.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {playersOnFloor.map((p, i) => (
            <span key={i} className="text-[9px] bg-emerald/10 border border-emerald/20 rounded-full px-2 py-0.5 text-emerald">
              {p.character_name} Ур.{p.hero_level}
            </span>
          ))}
        </div>
      )}

      {/* Scrollable map */}
      <div
        ref={scrollRef}
        className="relative overflow-auto rounded-xl border border-border/30 bg-background/50"
        style={{ height: `${VIEWPORT_CELLS * 2 * CELL_SIZE}px` }}
      >
        <div
          style={{
            position: 'relative',
            width: FLOOR_COLS * CELL_SIZE,
            height: FLOOR_ROWS * CELL_SIZE,
          }}
        >
          {cells}
        </div>
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
