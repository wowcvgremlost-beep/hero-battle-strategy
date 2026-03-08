import { useState } from 'react';
import { motion } from 'framer-motion';
import { getHeroesForTown, type Hero } from '@/data/heroes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Swords, Shield, Sparkles, BookOpen, Check } from 'lucide-react';
import type { TownId } from '@/data/towns';

interface HeroSelectionProps {
  townId: TownId;
  onSelect: () => void;
}

const HeroSelection = ({ townId, onSelect }: HeroSelectionProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const heroes = getHeroesForTown(townId);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(false);

  const selectHero = async () => {
    if (!user || !selectedHero || loading) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('profiles').update({
        hero_id: selectedHero.id,
        hero_attack: selectedHero.baseAttack + (selectedHero.skill.bonusAttack || 0),
        hero_defense: selectedHero.baseDefense + (selectedHero.skill.bonusDefense || 0),
        hero_spellpower: selectedHero.baseSpellpower + (selectedHero.skill.bonusSpellpower || 0),
        hero_knowledge: selectedHero.baseKnowledge + (selectedHero.skill.bonusKnowledge || 0),
      }).eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success(`Герой ${selectedHero.name} выбран!`);
      onSelect();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold text-gradient-gold text-center">ВЫБЕРИ ГЕРОЯ</h2>
      
      <div className="space-y-3">
        {heroes.map((hero, i) => (
          <motion.div
            key={hero.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedHero(hero)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              selectedHero?.id === hero.id
                ? 'border-gold/50 bg-gold/10 shadow-gold'
                : 'border-border bg-gradient-card hover:border-gold/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-2xl">
                {hero.portrait}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-foreground">{hero.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    hero.class === 'warrior' ? 'bg-crimson/20 text-crimson' : 'bg-arcane/20 text-arcane'
                  }`}>
                    {hero.class === 'warrior' ? 'Воин' : 'Маг'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{hero.description}</p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Swords className="h-3 w-3 text-crimson" />
                    <span className="text-xs text-foreground">{hero.baseAttack}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-gold" />
                    <span className="text-xs text-foreground">{hero.baseDefense}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-arcane" />
                    <span className="text-xs text-foreground">{hero.baseSpellpower}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-emerald" />
                    <span className="text-xs text-foreground">{hero.baseKnowledge}</span>
                  </div>
                </div>

                {/* Skill */}
                <div className="mt-2 rounded-lg bg-secondary/50 px-2 py-1">
                  <p className="text-[10px] text-gold font-semibold">{hero.skill.name}</p>
                  <p className="text-[10px] text-muted-foreground">{hero.skill.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedHero && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={selectHero}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-gold p-4 shadow-gold font-display font-bold text-primary-foreground flex items-center justify-center gap-2"
        >
          <Check className="h-5 w-5" />
          {loading ? 'ВЫБОР...' : 'ВЫБРАТЬ ГЕРОЯ'}
        </motion.button>
      )}
    </div>
  );
};

export default HeroSelection;
