import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Heart, Sparkles, Trophy, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
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

const BattleSystem = ({ monsterPower, monsterName, goldReward, expReward, onClose, onVictory }: BattleSystemProps) => {
  const { user, profile, army, updateGold, updateHeroStats, refreshProfile } = useAuth();
  const [battleState, setBattleState] = useState<'ready' | 'fighting' | 'victory' | 'defeat'>('ready');
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const town = TOWNS.find((t) => t.id === profile?.town);

  // Calculate player power: Hero stats + Army value
  const heroAttack = profile?.hero_attack || 1;
  const heroDefense = profile?.hero_defense || 1;
  const heroSpellpower = profile?.hero_spellpower || 1;

  // Army power calculation
  const armyPower = army.reduce((total, unit) => {
    const unitData = town?.units.find(u => u.name === unit.unit_name);
    if (unitData) {
      // Power = count * (attack + defense + value/10)
      return total + unit.count * (unitData.attack + unitData.defense + Math.floor(unitData.value / 10));
    }
    return total;
  }, 0);

  const totalAttack = heroAttack * 5 + heroSpellpower * 3 + armyPower;
  const totalDefense = heroDefense * 5 + armyPower * 0.5;
  const playerPower = Math.floor(totalAttack + totalDefense);

  const startBattle = async () => {
    setBattleState('fighting');
    const logs: string[] = [];

    logs.push(`⚔️ Бой начался против ${monsterName}!`);
    logs.push(`Ваша сила: ${playerPower} | Враг: ${monsterPower}`);

    // Simulate battle rounds
    let playerHP = playerPower;
    let monsterHP = monsterPower;
    let round = 1;

    while (playerHP > 0 && monsterHP > 0 && round <= 10) {
      // Player attacks
      const playerDamage = Math.floor(totalAttack * (0.8 + Math.random() * 0.4));
      monsterHP -= playerDamage;
      logs.push(`Раунд ${round}: Вы наносите ${playerDamage} урона.`);

      if (monsterHP <= 0) break;

      // Monster attacks
      const monsterDamage = Math.floor(monsterPower * 0.3 * (0.8 + Math.random() * 0.4));
      const actualDamage = Math.max(1, monsterDamage - Math.floor(totalDefense * 0.1));
      playerHP -= actualDamage;
      logs.push(`Враг наносит ${actualDamage} урона.`);

      round++;
    }

    setBattleLog(logs);

    // Determine outcome
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (monsterHP <= 0) {
      setBattleState('victory');
      logs.push(`🏆 ПОБЕДА! Получено: ${goldReward} золота, ${expReward} опыта.`);
      setBattleLog([...logs]);

      // Award rewards
      if (user && profile) {
        await updateGold((profile.gold || 0) + goldReward);
        
        const newExp = (profile.hero_experience || 0) + expReward;
        await updateHeroStats({ hero_experience: newExp });

        // Record battle
        await supabase.from('battles').insert({
          attacker_id: user.id,
          is_pve: true,
          attacker_power: playerPower,
          defender_power: monsterPower,
          winner_id: user.id,
          gold_reward: goldReward,
          exp_reward: expReward,
        });
      }
    } else {
      setBattleState('defeat');
      logs.push(`💀 ПОРАЖЕНИЕ! Враг оказался сильнее.`);
      setBattleLog([...logs]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
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
              Атака: {totalAttack.toFixed(0)} | Защита: {totalDefense.toFixed(0)}
            </div>
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
          <div className="rounded-lg bg-secondary/30 p-3 mb-4 max-h-32 overflow-y-auto">
            {battleLog.map((log, i) => (
              <p key={i} className="text-xs text-muted-foreground">{log}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        {battleState === 'ready' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={startBattle}
            className="w-full rounded-xl bg-gradient-crimson p-4 shadow-crimson font-display font-bold text-accent-foreground"
          >
            ⚔️ НАЧАТЬ БОЙ
          </motion.button>
        )}

        {battleState === 'fighting' && (
          <div className="text-center py-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="inline-block"
            >
              <Swords className="h-8 w-8 text-crimson" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">Идёт бой...</p>
          </div>
        )}

        {battleState === 'victory' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onVictory}
            className="w-full rounded-xl bg-gradient-gold p-4 shadow-gold font-display font-bold text-primary-foreground flex items-center justify-center gap-2"
          >
            <Trophy className="h-5 w-5" />
            ЗАБРАТЬ НАГРАДУ
          </motion.button>
        )}

        {battleState === 'defeat' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full rounded-xl bg-secondary p-4 font-display font-bold text-muted-foreground"
          >
            ОТСТУПИТЬ
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BattleSystem;
