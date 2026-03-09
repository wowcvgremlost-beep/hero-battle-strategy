import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Shield, Trophy, X, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
import { getSkillBonuses, UNIT_LEADERSHIP_COST } from '@/data/skills';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BattleSystemProps {
  monsterPower: number;
  monsterName: string;
  goldReward: number;
  expReward: number;
  onClose: () => void;
  onVictory: () => void;
}

interface ArmyStack {
  unit_name: string;
  count: number;
  hp: number; // total HP of the stack
  maxHpPerUnit: number;
  level: number;
  attack: number;
  defense: number;
  damage: number; // avg damage per unit
}

const BattleSystem = ({ monsterPower, monsterName, goldReward, expReward, onClose, onVictory }: BattleSystemProps) => {
  const { user, profile, army, heroSkills, updateGold, updateHeroStats, refreshArmy } = useAuth();
  const [battleState, setBattleState] = useState<'ready' | 'fighting' | 'victory' | 'defeat'>('ready');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [losses, setLosses] = useState<Record<string, number>>({});

  const town = TOWNS.find((t) => t.id === profile?.town);

  const skillsMap: Record<string, number> = {};
  heroSkills.forEach(s => { skillsMap[s.skill_id] = s.skill_level; });
  const bonuses = getSkillBonuses(skillsMap);

  const heroAttack = (profile?.hero_attack || 1) + bonuses.bonusAttack;
  const heroDefense = (profile?.hero_defense || 1) + bonuses.bonusDefense;
  const luckChance = bonuses.luckChance;

  // Build army stacks — hero stats apply as % multiplier, not flat per-unit
  const buildStacks = (): ArmyStack[] => {
    if (!town) return [];
    return army
      .filter(a => a.count > 0)
      .map(a => {
        const unitData = town.units.find(u => u.name === a.unit_name);
        if (!unitData) return null;
        const dmgParts = unitData.damage.split('-').map(Number);
        const avgDmg = dmgParts.length === 2 ? (dmgParts[0] + dmgParts[1]) / 2 : dmgParts[0] || 1;
        return {
          unit_name: a.unit_name,
          count: a.count,
          hp: a.count * unitData.health,
          maxHpPerUnit: unitData.health,
          level: unitData.level,
          attack: unitData.attack,
          defense: unitData.defense,
          damage: avgDmg,
        };
      })
      .filter(Boolean) as ArmyStack[];
  };

  // Army power for display
  const totalArmyPower = army.reduce((total, unit) => {
    const unitData = town?.units.find(u => u.name === unit.unit_name);
    if (unitData) return total + unit.count * (unitData.attack + unitData.defense + Math.floor(unitData.value / 10));
    return total;
  }, 0);

  const playerPower = Math.floor(heroAttack * 5 + heroDefense * 5 + totalArmyPower);

  // Hero multipliers for battle
  const heroAtkMultiplier = 1 + heroAttack * 0.03; // +3% damage per hero attack point
  const heroDefReduction = Math.min(0.7, heroDefense * 0.02); // up to 70% damage reduction

  const startBattle = async () => {
    setBattleState('fighting');
    const logs: string[] = [];
    let crits = 0;
    const stacks = buildStacks();

    logs.push(`⚔️ Бой начался против ${monsterName}!`);
    logs.push(`Ваши стаки: ${stacks.map(s => `${s.unit_name}(${s.count})`).join(', ')}`);

    // Monster HP is separate from damage output — HP pool is 3x monsterPower
    let monsterHP = monsterPower * 3;
    let round = 1;

    while (monsterHP > 0 && stacks.some(s => s.count > 0) && round <= 12) {
      // Each stack attacks — damage = count * baseDmg * heroMultiplier
      for (const stack of stacks) {
        if (stack.count <= 0 || monsterHP <= 0) continue;
        const isCrit = Math.random() * 100 < luckChance;
        const critMul = isCrit ? 2 : 1;
        const stackDmg = Math.floor(
          stack.count * stack.damage * heroAtkMultiplier * (0.85 + Math.random() * 0.3) * critMul
        );
        monsterHP -= stackDmg;
        if (isCrit) {
          crits++;
          logs.push(`R${round}: 🍀 КРИТ! ${stack.unit_name}(${stack.count}) → ${stackDmg} урона`);
        } else {
          logs.push(`R${round}: ${stack.unit_name}(${stack.count}) → ${stackDmg} урона`);
        }
      }

      if (monsterHP <= 0) break;

      // Monster attacks — base damage scales with monsterPower
      const rawMonsterDmg = Math.floor(monsterPower * 0.15 * (0.85 + Math.random() * 0.3));
      // Apply hero defense reduction
      const monsterDmg = Math.max(1, Math.floor(rawMonsterDmg * (1 - heroDefReduction)));
      const aliveStacks = stacks.filter(s => s.count > 0);
      const stackCount = aliveStacks.length;

      if (stackCount > 0) {
        const dmgPerStack = Math.max(1, Math.floor(monsterDmg / stackCount));

        for (const stack of aliveStacks) {
          // Unit defense gives flat reduction
          const finalDmg = Math.max(1, dmgPerStack - Math.floor(stack.defense * 0.5));
          
          stack.hp -= finalDmg;
          if (stack.hp <= 0) {
            const lost = stack.count;
            stack.count = 0;
            stack.hp = 0;
            logs.push(`R${round}: 💀 ${stack.unit_name} потеряно ${lost} ед.`);
          } else {
            const newCount = Math.ceil(stack.hp / stack.maxHpPerUnit);
            const lost = stack.count - newCount;
            if (lost > 0) {
              logs.push(`R${round}: ${stack.unit_name} потеряно ${lost} ед. (осталось ${newCount})`);
            }
            stack.count = newCount;
          }
        }
      }

      round++;
    }

    setBattleLog(logs);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate losses
    const unitLosses: Record<string, number> = {};
    for (const origUnit of army) {
      const stack = stacks.find(s => s.unit_name === origUnit.unit_name);
      const remaining = stack ? stack.count : origUnit.count;
      const lost = origUnit.count - remaining;
      if (lost > 0) unitLosses[origUnit.unit_name] = lost;
    }
    setLosses(unitLosses);

    if (monsterHP <= 0) {
      setBattleState('victory');
      logs.push(`🏆 ПОБЕДА! +${goldReward}💰 +${expReward}✨`);
      if (Object.keys(unitLosses).length > 0) {
        logs.push(`⚰️ Потери: ${Object.entries(unitLosses).map(([n, c]) => `${n}: -${c}`).join(', ')}`);
      } else {
        logs.push(`✨ Потерь нет!`);
      }
      setBattleLog([...logs]);

      // Apply losses to DB and award rewards
      if (user && profile) {
        for (const [unitName, lost] of Object.entries(unitLosses)) {
          const orig = army.find(a => a.unit_name === unitName);
          if (orig) {
            const newCount = orig.count - lost;
            if (newCount <= 0) {
              await supabase.from('player_army').delete().eq('user_id', user.id).eq('unit_name', unitName);
            } else {
              await supabase.from('player_army').update({ count: newCount }).eq('user_id', user.id).eq('unit_name', unitName);
            }
          }
        }
        await updateGold((profile.gold || 0) + goldReward);
        await updateHeroStats({ hero_experience: (profile.hero_experience || 0) + expReward });
        await supabase.from('battles').insert({
          attacker_id: user.id, is_pve: true, attacker_power: playerPower,
          defender_power: monsterPower, winner_id: user.id, gold_reward: goldReward, exp_reward: expReward,
        });
        await refreshArmy();
      }
    } else {
      setBattleState('defeat');
      logs.push(`💀 ПОРАЖЕНИЕ!`);
      if (Object.keys(unitLosses).length > 0) {
        logs.push(`⚰️ Потери: ${Object.entries(unitLosses).map(([n, c]) => `${n}: -${c}`).join(', ')}`);
      }
      setBattleLog([...logs]);

      // Apply losses even on defeat
      if (user) {
        for (const [unitName, lost] of Object.entries(unitLosses)) {
          const orig = army.find(a => a.unit_name === unitName);
          if (orig) {
            const newCount = orig.count - lost;
            if (newCount <= 0) {
              await supabase.from('player_army').delete().eq('user_id', user.id).eq('unit_name', unitName);
            } else {
              await supabase.from('player_army').update({ count: newCount }).eq('user_id', user.id).eq('unit_name', unitName);
            }
          }
        }
        await refreshArmy();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-xl border border-crimson/30 bg-gradient-card p-6 shadow-crimson"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-gradient-gold flex items-center gap-2">
            <Swords className="h-5 w-5 text-crimson" />
            {monsterName}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Ваша сила</p>
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-gold" />
              <span className="font-display font-bold text-gold">{playerPower}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Стаков: {army.filter(a => a.count > 0).length} | Юнитов: {army.reduce((s, a) => s + a.count, 0)}
            </div>
            {luckChance > 0 && (
              <div className="text-[10px] text-emerald mt-1 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Крит: {luckChance}%
              </div>
            )}
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Сила врага</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-crimson" />
              <span className="font-display font-bold text-crimson">{monsterPower}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Награда: {goldReward}💰 {expReward}✨
            </div>
          </div>
        </div>

        {/* Battle log */}
        {battleLog.length > 0 && (
          <div className="rounded-lg bg-secondary/30 p-3 mb-4 max-h-40 overflow-y-auto">
            {battleLog.map((log, i) => (
              <p key={i} className={`text-xs ${
                log.includes('КРИТ') ? 'text-emerald font-bold' :
                log.includes('💀') || log.includes('потеряно') ? 'text-crimson' :
                log.includes('ПОБЕДА') ? 'text-gold font-bold' :
                'text-muted-foreground'
              }`}>
                {log}
              </p>
            ))}
          </div>
        )}

        {/* Losses summary */}
        {Object.keys(losses).length > 0 && (battleState === 'victory' || battleState === 'defeat') && (
          <div className="rounded-lg bg-crimson/10 border border-crimson/20 p-3 mb-4">
            <p className="text-[10px] text-crimson uppercase font-bold mb-1">⚰️ Потери в бою</p>
            {Object.entries(losses).map(([name, count]) => (
              <p key={name} className="text-xs text-crimson">
                {name}: -{count} ед.
              </p>
            ))}
          </div>
        )}

        {battleState === 'ready' && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={startBattle}
            disabled={army.filter(a => a.count > 0).length === 0}
            className="w-full rounded-xl bg-gradient-crimson p-4 shadow-crimson font-display font-bold text-accent-foreground disabled:opacity-40">
            ⚔️ НАЧАТЬ БОЙ
          </motion.button>
        )}

        {battleState === 'fighting' && (
          <div className="text-center py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block">
              <Swords className="h-8 w-8 text-crimson" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">Идёт бой...</p>
          </div>
        )}

        {battleState === 'victory' && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={onVictory}
            className="w-full rounded-xl bg-gradient-gold p-4 shadow-gold font-display font-bold text-primary-foreground flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5" /> ЗАБРАТЬ НАГРАДУ
          </motion.button>
        )}

        {battleState === 'defeat' && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="w-full rounded-xl bg-secondary p-4 font-display font-bold text-muted-foreground">
            ОТСТУПИТЬ
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BattleSystem;
