import { motion } from 'framer-motion';
import { SKILLS, expForLevel, getSkillBonuses } from '@/data/skills';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp } from 'lucide-react';

interface HeroSkillsScreenProps {
  heroSkills: Record<string, number>;
}

const HeroSkillsScreen = ({ heroSkills }: HeroSkillsScreenProps) => {
  const { profile } = useAuth();
  const bonuses = getSkillBonuses(heroSkills);
  const currentExp = profile?.hero_experience || 0;
  const needed = expForLevel(profile?.hero_level || 1);
  const progress = Math.min(100, Math.floor((currentExp / needed) * 100));

  return (
    <div className="space-y-4">
      {/* Level & Experience */}
      <div className="rounded-xl border border-gold/20 bg-gradient-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold" />
            <span className="font-display text-sm font-bold text-foreground">
              Уровень {profile?.hero_level || 1}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {currentExp} / {needed} опыта
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full"
          />
        </div>
      </div>

      {/* Skill bonuses summary */}
      <div className="rounded-xl border border-border bg-gradient-card p-3">
        <p className="text-[10px] text-muted-foreground uppercase mb-2">Бонусы от навыков</p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {bonuses.bonusAttack > 0 && (
            <span className="text-crimson">⚔️ +{bonuses.bonusAttack} атака</span>
          )}
          {bonuses.bonusDefense > 0 && (
            <span className="text-gold">🛡️ +{bonuses.bonusDefense} защита</span>
          )}
          {bonuses.bonusSpellpower > 0 && (
            <span className="text-arcane">🔮 +{bonuses.bonusSpellpower} магия</span>
          )}
          {bonuses.bonusKnowledge > 0 && (
            <span className="text-emerald">📖 +{bonuses.bonusKnowledge} знания</span>
          )}
          {bonuses.bonusMove > 0 && (
            <span className="text-foreground">🗺️ +{bonuses.bonusMove} движение</span>
          )}
          {bonuses.luckChance > 0 && (
            <span className="text-foreground">🍀 {bonuses.luckChance}% крит</span>
          )}
          {Object.values(bonuses).every(v => v === 0) && (
            <span className="text-muted-foreground col-span-2">Нет навыков. Повышайте уровень!</span>
          )}
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-2">
        {SKILLS.map((skill) => {
          const level = heroSkills[skill.id] || 0;
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-border bg-gradient-card p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{skill.icon}</span>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{skill.name}</p>
                    <p className="text-[10px] text-muted-foreground">{skill.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-display text-sm font-bold ${level > 0 ? 'text-gold' : 'text-muted-foreground'}`}>
                    {level}/{skill.maxLevel}
                  </span>
                </div>
              </div>
              {/* Level pips */}
              <div className="flex gap-1 mt-2">
                {Array.from({ length: skill.maxLevel }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < level ? 'bg-gold' : 'bg-secondary'
                    }`}
                  />
                ))}
              </div>
              {level > 0 && (
                <p className="text-[10px] text-gold mt-1">{skill.effect(level)}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroSkillsScreen;
