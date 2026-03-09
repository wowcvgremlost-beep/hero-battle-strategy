import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Trophy, X, Zap, ChevronRight, Skull, Gift, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
import { getSkillBonuses } from '@/data/skills';
import { getRandomArtifact, ARTIFACT_RARITY_NAMES } from '@/data/artifacts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Dungeon, DungeonFloor } from '@/data/dungeons';

interface DungeonScreenProps {
  dungeon: Dungeon;
  onClose: () => void;
  onComplete: () => void;
}

const DungeonScreen = ({ dungeon, onClose, onComplete }: DungeonScreenProps) => {
  const { user, profile, army, heroSkills, updateGold, updateHeroStats } = useAuth();
  const [currentFloor, setCurrentFloor] = useState(0);
  const [state, setState] = useState<'explore' | 'fighting' | 'victory' | 'defeat' | 'complete'>('explore');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [totalGoldEarned, setTotalGoldEarned] = useState(0);
  const [totalExpEarned, setTotalExpEarned] = useState(0);
  const [bossArtifactName, setBossArtifactName] = useState<string | null>(null);

  const town = TOWNS.find((t) => t.id === profile?.town);
  const skillsMap: Record<string, number> = {};
  heroSkills.forEach(s => { skillsMap[s.skill_id] = s.skill_level; });
  const bonuses = getSkillBonuses(skillsMap);

  const heroAttack = (profile?.hero_attack || 1) + bonuses.bonusAttack;
  const heroDefense = (profile?.hero_defense || 1) + bonuses.bonusDefense;
  const heroSpellpower = (profile?.hero_spellpower || 1) + bonuses.bonusSpellpower;
  const luckChance = bonuses.luckChance;

  const armyPower = army.reduce((total, unit) => {
    const unitData = town?.units.find(u => u.name === unit.unit_name);
    if (unitData) {
      return total + unit.count * (unitData.attack + unitData.defense + Math.floor(unitData.value / 10));
    }
    return total;
  }, 0);

  const totalAttack = heroAttack * 5 + heroSpellpower * 3 + armyPower;
  const totalDefense = heroDefense * 5 + armyPower * 0.5;
  const playerPower = Math.floor(totalAttack + totalDefense);

  const floor = dungeon.floors[currentFloor];

  const fightFloor = async () => {
    if (!floor || !user || !profile) return;
    setState('fighting');
    const logs: string[] = [];
    let crits = 0;

    logs.push(`⚔️ Этаж ${floor.level}: ${floor.monsterName}!`);
    logs.push(`Ваша сила: ${playerPower} | Враг: ${floor.monsterPower}`);

    let playerHP = playerPower;
    let monsterHP = floor.monsterPower;
    let round = 1;

    while (playerHP > 0 && monsterHP > 0 && round <= 10) {
      const isCritical = Math.random() * 100 < luckChance;
      const critMul = isCritical ? 2 : 1;
      const playerDamage = Math.floor(totalAttack * (0.8 + Math.random() * 0.4) * critMul);
      monsterHP -= playerDamage;

      if (isCritical) {
        crits++;
        logs.push(`Раунд ${round}: 🍀 КРИТ! ${playerDamage} урона!`);
      } else {
        logs.push(`Раунд ${round}: Вы наносите ${playerDamage} урона.`);
      }

      if (monsterHP <= 0) break;

      const monsterDmg = Math.floor(floor.monsterPower * 0.3 * (0.8 + Math.random() * 0.4));
      const actualDmg = Math.max(1, monsterDmg - Math.floor(totalDefense * 0.1));
      playerHP -= actualDmg;
      logs.push(`${floor.monsterIcon} Враг наносит ${actualDmg} урона.`);
      round++;
    }

    setBattleLog(logs);
    await new Promise(r => setTimeout(r, 1200));

    if (monsterHP <= 0) {
      const earnedGold = floor.goldReward;
      const earnedExp = floor.expReward;
      setTotalGoldEarned(prev => prev + earnedGold);
      setTotalExpEarned(prev => prev + earnedExp);

      await updateGold((profile.gold || 0) + earnedGold);
      const newExp = (profile.hero_experience || 0) + earnedExp;
      await updateHeroStats({ hero_experience: newExp });

      await supabase.from('battles').insert({
        attacker_id: user.id,
        is_pve: true,
        attacker_power: playerPower,
        defender_power: floor.monsterPower,
        winner_id: user.id,
        gold_reward: earnedGold,
        exp_reward: earnedExp,
      });

      if (floor.isBoss) {
        // Boss defeated — give artifact reward
        const artifact = getRandomArtifact(dungeon.bossArtifactRarity);
        await supabase.from('player_artifacts').insert({
          user_id: user.id,
          artifact_id: artifact.id,
          slot: artifact.slot,
          is_equipped: false,
        });
        setBossArtifactName(`${artifact.icon} ${artifact.name} (${ARTIFACT_RARITY_NAMES[artifact.rarity]})`);

        // Mark dungeon as completed
        localStorage.setItem(`dungeon_${dungeon.id}_${user.id}`, 'true');

        logs.push(`🏆 БОСС ПОВЕРЖЕН!`);
        logs.push(`🎁 Получен артефакт: ${artifact.name}!`);
        setBattleLog([...logs]);
        setState('complete');
      } else {
        logs.push(`✅ Этаж очищен! +${earnedGold}💰 +${earnedExp}✨`);
        setBattleLog([...logs]);
        setState('victory');
      }
    } else {
      logs.push(`💀 ПОРАЖЕНИЕ на этаже ${floor.level}!`);
      setBattleLog([...logs]);
      setState('defeat');
    }
  };

  const nextFloor = () => {
    setCurrentFloor(prev => prev + 1);
    setBattleLog([]);
    setState('explore');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-xl border border-arcane/30 bg-gradient-card p-6 shadow-arcane max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-gradient-gold flex items-center gap-2">
              <span className="text-2xl">{dungeon.icon}</span>
              {dungeon.name}
            </h2>
            <p className="text-[10px] text-muted-foreground">{dungeon.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Floor progress */}
        <div className="flex items-center gap-1 mb-4">
          {dungeon.floors.map((f, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                i < currentFloor ? 'bg-emerald/20 border-emerald/40 text-emerald' :
                i === currentFloor ? 'bg-gold/20 border-gold/40 text-gold' :
                'bg-secondary border-border text-muted-foreground'
              }`}>
                {i < currentFloor ? '✓' : f.isBoss ? <Skull className="h-3 w-3" /> : f.level}
              </div>
              {i < dungeon.floors.length - 1 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Current floor info */}
        {state === 'explore' && floor && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-secondary/50 p-4 text-center">
              <span className="text-4xl block mb-2">{floor.monsterIcon}</span>
              <p className="font-display font-bold text-foreground">{floor.monsterName}</p>
              {floor.isBoss && (
                <span className="inline-block mt-1 text-[10px] bg-crimson/20 text-crimson px-2 py-0.5 rounded-full font-bold">
                  БОСС
                </span>
              )}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <Swords className="h-4 w-4 text-crimson mx-auto" />
                  <span className="text-xs font-bold text-crimson">{floor.monsterPower}</span>
                </div>
                <div className="text-center">
                  <span className="text-sm">💰</span>
                  <span className="text-xs font-bold text-gold block">{floor.goldReward}</span>
                </div>
                <div className="text-center">
                  <span className="text-sm">✨</span>
                  <span className="text-xs font-bold text-arcane block">{floor.expReward}</span>
                </div>
              </div>
              {floor.isBoss && (
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-gold">
                  <Gift className="h-3 w-3" />
                  <span>Артефакт за победу над боссом!</span>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="text-[10px] text-muted-foreground">Ваша сила: <span className="text-gold font-bold">{playerPower}</span></p>
              {playerPower < floor.monsterPower && (
                <p className="text-[10px] text-crimson mt-1">⚠️ Враг сильнее вас! Будьте осторожны.</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={fightFloor}
              className="w-full rounded-xl bg-gradient-crimson p-4 shadow-crimson font-display font-bold text-accent-foreground"
            >
              ⚔️ {floor.isBoss ? 'СРАЗИТЬСЯ С БОССОМ' : `АТАКОВАТЬ (Этаж ${floor.level})`}
            </motion.button>
          </div>
        )}

        {/* Fighting */}
        {state === 'fighting' && (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="inline-block"
            >
              <Swords className="h-10 w-10 text-crimson" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-3">Идёт бой...</p>
          </div>
        )}

        {/* Battle log */}
        {battleLog.length > 0 && state !== 'fighting' && (
          <div className="rounded-lg bg-secondary/30 p-3 mb-4 max-h-28 overflow-y-auto">
            {battleLog.map((log, i) => (
              <p key={i} className={`text-xs ${log.includes('КРИТ') ? 'text-emerald font-bold' : log.includes('БОСС') || log.includes('артефакт') ? 'text-gold font-bold' : 'text-muted-foreground'}`}>
                {log}
              </p>
            ))}
          </div>
        )}

        {/* Victory - next floor */}
        {state === 'victory' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={nextFloor}
            className="w-full rounded-xl bg-gradient-gold p-4 shadow-gold font-display font-bold text-primary-foreground flex items-center justify-center gap-2"
          >
            <ChevronRight className="h-5 w-5" />
            СЛЕДУЮЩИЙ ЭТАЖ
          </motion.button>
        )}

        {/* Dungeon complete */}
        {state === 'complete' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-center">
              <Trophy className="h-8 w-8 text-gold mx-auto mb-2" />
              <p className="font-display font-bold text-gold">ПОДЗЕМЕЛЬЕ ПРОЙДЕНО!</p>
              <div className="flex justify-center gap-4 mt-2">
                <span className="text-sm text-gold">💰 {totalGoldEarned}</span>
                <span className="text-sm text-arcane">✨ {totalExpEarned}</span>
              </div>
              {bossArtifactName && (
                <p className="text-xs text-gold mt-2">🎁 {bossArtifactName}</p>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="w-full rounded-xl bg-gradient-gold p-4 shadow-gold font-display font-bold text-primary-foreground"
            >
              ЗАБРАТЬ ВСЕ НАГРАДЫ
            </motion.button>
          </div>
        )}

        {/* Defeat */}
        {state === 'defeat' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-crimson/30 bg-crimson/5 p-4 text-center">
              <Skull className="h-8 w-8 text-crimson mx-auto mb-2" />
              <p className="font-display font-bold text-crimson">ПОРАЖЕНИЕ</p>
              <p className="text-xs text-muted-foreground mt-1">
                Собрано: 💰 {totalGoldEarned} | ✨ {totalExpEarned}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full rounded-xl bg-secondary p-4 font-display font-bold text-muted-foreground"
            >
              ОТСТУПИТЬ
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DungeonScreen;
