import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Shield, Trophy, X, Skull } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PvPTarget {
  user_id: string;
  character_name: string | null;
  town: string | null;
  hero_level: number;
  hero_attack: number;
  hero_defense: number;
  hero_spellpower: number;
  gold: number;
}

interface PvPBattleProps {
  target: PvPTarget;
  onClose: () => void;
}

const PvPBattle = ({ target, onClose }: PvPBattleProps) => {
  const { user, profile, army, updateGold, updateHeroStats, refreshProfile } = useAuth();
  const [battleState, setBattleState] = useState<'ready' | 'fighting' | 'victory' | 'defeat'>('ready');
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const myTown = TOWNS.find(t => t.id === profile?.town);

  // Calculate power using % multiplier from hero stats
  const heroAtkMul = 1 + (profile?.hero_attack || 1) * 0.03;
  const heroDefReduction = Math.min(0.7, (profile?.hero_defense || 1) * 0.02);

  const myArmyPower = army.reduce((total, unit) => {
    const unitData = myTown?.units.find(u => u.name === unit.unit_name);
    if (unitData) {
      return total + unit.count * (unitData.attack + unitData.defense + Math.floor(unitData.value / 10));
    }
    return total;
  }, 0);

  const myPower = Math.floor((profile?.hero_attack || 1) * 5 + (profile?.hero_defense || 1) * 5 + myArmyPower);

  // Estimate enemy power
  const enemyEstimate = Math.floor(
    (target.hero_attack * 5 + target.hero_spellpower * 3 + target.hero_defense * 5) * (1 + target.hero_level * 0.2)
  );

  const startBattle = async () => {
    setBattleState('fighting');
    const logs: string[] = [];

    logs.push(`⚔️ Атака на ${target.character_name}!`);
    logs.push(`Ваша сила: ${myPower} | Оценка противника: ~${enemyEstimate}`);

    let myHP = myPower;
    let enemyHP = enemyEstimate;
    let round = 1;

    while (myHP > 0 && enemyHP > 0 && round <= 10) {
      const myDmg = Math.floor(myAttack * (0.7 + Math.random() * 0.6));
      enemyHP -= myDmg;
      logs.push(`Раунд ${round}: Вы наносите ${myDmg} урона.`);

      if (enemyHP <= 0) break;

      const eDmg = Math.max(1, Math.floor(enemyBasePower * (0.7 + Math.random() * 0.6) - myDefense * 0.1));
      myHP -= eDmg;
      logs.push(`${target.character_name} наносит ${eDmg} урона.`);
      round++;
    }

    setBattleLog(logs);
    await new Promise(r => setTimeout(r, 1500));

    const goldSteal = Math.floor(Math.min(target.gold * 0.1, 500 * target.hero_level));
    const expGain = 50 + target.hero_level * 30;

    if (enemyHP <= 0 && user && profile) {
      setBattleState('victory');
      logs.push(`🏆 ПОБЕДА! Украдено ${goldSteal} золота, +${expGain} опыта.`);
      setBattleLog([...logs]);

      await updateGold((profile.gold || 0) + goldSteal);
      const newExp = (profile.hero_experience || 0) + expGain;
      await updateHeroStats({ hero_experience: newExp });

      await supabase.from('battles').insert({
        attacker_id: user.id,
        defender_id: target.user_id,
        is_pve: false,
        attacker_power: myPower,
        defender_power: enemyEstimate,
        winner_id: user.id,
        gold_reward: goldSteal,
        exp_reward: expGain,
      });
    } else {
      setBattleState('defeat');
      logs.push(`💀 ПОРАЖЕНИЕ! ${target.character_name} оказался сильнее.`);
      setBattleLog([...logs]);

      if (user && profile) {
        const goldLost = Math.floor(profile.gold * 0.05);
        await updateGold(Math.max(0, (profile.gold || 0) - goldLost));

        await supabase.from('battles').insert({
          attacker_id: user.id,
          defender_id: target.user_id,
          is_pve: false,
          attacker_power: myPower,
          defender_power: enemyEstimate,
          winner_id: target.user_id,
          gold_reward: 0,
          exp_reward: 0,
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
            PvP: {target.character_name}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Вы</p>
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-gold" />
              <span className="font-display font-bold text-gold">{myPower}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Ур.{profile?.hero_level}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">{target.character_name}</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-crimson" />
              <span className="font-display font-bold text-crimson">~{enemyEstimate}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Ур.{target.hero_level} • {target.town}</p>
          </div>
        </div>

        {battleLog.length > 0 && (
          <div className="rounded-lg bg-secondary/30 p-3 mb-4 max-h-32 overflow-y-auto">
            {battleLog.map((log, i) => (
              <p key={i} className="text-xs text-muted-foreground">{log}</p>
            ))}
          </div>
        )}

        {battleState === 'ready' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={startBattle}
            className="w-full rounded-xl bg-gradient-crimson p-4 shadow-crimson font-display font-bold text-accent-foreground"
          >
            ⚔️ АТАКОВАТЬ
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
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-gold p-4 shadow-gold font-display font-bold text-primary-foreground flex items-center justify-center gap-2"
          >
            <Trophy className="h-5 w-5" />
            ПОБЕДА!
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

export default PvPBattle;
