import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ALL_SPELLS, getSpellsByLevel, type Spell } from '@/data/spells';
import { Sparkles, BookOpen, Flame, Droplets, Mountain, Wind, Star, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SCHOOL_ICONS: Record<string, React.ReactNode> = {
  fire: <Flame className="h-3 w-3 text-orange-500" />,
  water: <Droplets className="h-3 w-3 text-blue-400" />,
  earth: <Mountain className="h-3 w-3 text-amber-600" />,
  air: <Wind className="h-3 w-3 text-cyan-400" />,
  neutral: <Star className="h-3 w-3 text-gray-400" />,
};

interface SpellsScreenProps {
  mageGuildLevel: number; // 0-4 based on buildings
}

const SpellsScreen = ({ mageGuildLevel }: SpellsScreenProps) => {
  const { user, profile, spells, buildings, refreshSpells, updateGold, updateMana } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4>(1);
  const [learning, setLearning] = useState(false);

  const hasSpellbook = buildings.some(b => b.building_id === 'spellbook');
  const learnedSpellIds = spells.map(s => s.spell_id);

  const availableSpells = getSpellsByLevel(selectedLevel);
  const maxLevel = mageGuildLevel as 1 | 2 | 3 | 4;

  const canLearnLevel = (level: number) => {
    if (level > mageGuildLevel) return false;
    if (level >= 3 && !buildings.some(b => b.building_id === 'wisdom_basic')) return false;
    if (level >= 4 && !buildings.some(b => b.building_id === 'wisdom_advanced')) return false;
    return true;
  };

  const learnSpell = async (spell: Spell) => {
    if (!user || learning) return;
    if (learnedSpellIds.includes(spell.id)) {
      toast.info('Заклинание уже изучено');
      return;
    }

    const cost = spell.level * 100;
    if ((profile?.gold || 0) < cost) {
      toast.error(`Недостаточно золота (${cost})`);
      return;
    }

    setLearning(true);
    try {
      await supabase.from('player_spells').insert({
        user_id: user.id,
        spell_id: spell.id,
      });
      await updateGold((profile?.gold || 0) - cost);
      await refreshSpells();
      toast.success(`Изучено: ${spell.name}`);
    } catch (err) {
      toast.error('Ошибка изучения');
    } finally {
      setLearning(false);
    }
  };

  if (mageGuildLevel === 0) {
    return (
      <div className="rounded-xl border border-border bg-gradient-card p-6 text-center">
        <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Постройте Гильдию магов для изучения заклинаний</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level tabs */}
      <div className="flex gap-2">
        {([1, 2, 3, 4] as const).map((level) => {
          const locked = level > mageGuildLevel;
          return (
            <button
              key={level}
              onClick={() => !locked && setSelectedLevel(level)}
              disabled={locked}
              className={`flex-1 rounded-lg py-2 px-3 font-display text-xs font-bold transition-all ${
                selectedLevel === level && !locked
                  ? 'bg-gradient-arcane text-white shadow-lg'
                  : locked
                  ? 'bg-secondary/50 text-muted-foreground/50 cursor-not-allowed'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {locked ? <Lock className="h-3 w-3 mx-auto" /> : `Ур.${level}`}
            </button>
          );
        })}
      </div>

      {/* Requirements notice */}
      {selectedLevel >= 3 && !canLearnLevel(selectedLevel) && (
        <div className="rounded-lg bg-crimson/10 border border-crimson/20 p-2 text-xs text-crimson">
          Требуется навык «Мудрость» {selectedLevel === 3 ? 'базового' : 'продвинутого'} уровня
        </div>
      )}

      {/* Spells list */}
      <div className="space-y-2">
        {availableSpells.map((spell, i) => {
          const isLearned = learnedSpellIds.includes(spell.id);
          const canLearn = canLearnLevel(spell.level);

          return (
            <motion.div
              key={spell.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-3 ${
                isLearned
                  ? 'border-arcane/40 bg-arcane/10'
                  : 'border-border bg-gradient-card'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {SCHOOL_ICONS[spell.school]}
                  <h4 className="font-display text-sm font-bold text-foreground">{spell.name}</h4>
                  {isLearned && <Sparkles className="h-3 w-3 text-arcane" />}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {spell.manaCost} 💧
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{spell.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-arcane">{spell.effect}</span>
                {!isLearned && canLearn && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => learnSpell(spell)}
                    disabled={learning}
                    className="rounded-lg bg-gradient-arcane px-3 py-1 text-[10px] font-bold text-white"
                  >
                    {spell.level * 100}💰 ИЗУЧИТЬ
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SpellsScreen;
