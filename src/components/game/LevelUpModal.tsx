import { motion } from 'framer-motion';
import { TrendingUp, Sparkles } from 'lucide-react';
import type { SkillDef } from '@/data/skills';

interface LevelUpModalProps {
  level: number;
  choices: SkillDef[];
  currentSkills: Record<string, number>;
  onChoose: (skillId: string) => void;
}

const LevelUpModal = ({ level, choices, currentSkills, onChoose }: LevelUpModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-xl border border-gold/30 bg-gradient-card p-6 shadow-gold"
      >
        <div className="text-center mb-5">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
          >
            <TrendingUp className="h-10 w-10 text-gold mx-auto" />
          </motion.div>
          <h2 className="font-display text-xl font-bold text-gradient-gold mt-2">
            Уровень {level}!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Выберите навык для улучшения</p>
        </div>

        <div className="space-y-3">
          {choices.map((skill) => {
            const currentLevel = currentSkills[skill.id] || 0;
            const nextLevel = currentLevel + 1;
            return (
              <motion.button
                key={skill.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChoose(skill.id)}
                className="w-full rounded-xl border border-gold/20 bg-secondary/50 p-4 text-left hover:border-gold/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{skill.icon}</span>
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-foreground">{skill.name}</p>
                    <p className="text-[10px] text-muted-foreground">{skill.description}</p>
                    <p className="text-xs text-gold mt-1">
                      Ур. {currentLevel} → {nextLevel}: {skill.effect(nextLevel)}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LevelUpModal;
