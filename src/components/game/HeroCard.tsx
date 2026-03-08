import { motion } from 'framer-motion';
import { Shield, Swords, Heart } from 'lucide-react';
import type { Hero } from '@/types/game';

interface HeroCardProps {
  hero: Hero;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

const rarityColors: Record<string, string> = {
  common: 'border-muted-foreground/30',
  rare: 'border-emerald/50',
  epic: 'border-arcane/50',
  legendary: 'border-gold/60',
};

const rarityGlow: Record<string, string> = {
  common: '',
  rare: 'shadow-[0_0_12px_hsl(145_60%_40%/0.15)]',
  epic: 'shadow-[0_0_12px_hsl(270_60%_55%/0.2)]',
  legendary: 'shadow-gold',
};

const rarityLabel: Record<string, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
};

const rarityBadgeColor: Record<string, string> = {
  common: 'bg-muted text-muted-foreground',
  rare: 'bg-emerald/20 text-emerald',
  epic: 'bg-arcane/20 text-arcane',
  legendary: 'bg-gold/20 text-gold',
};

const HeroCard = ({ hero, onClick, selected, compact }: HeroCardProps) => {
  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
          selected ? 'border-gold shadow-gold' : rarityColors[hero.rarity]
        } ${rarityGlow[hero.rarity]}`}
      >
        <img src={hero.image} alt={hero.name} className="h-20 w-16 object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-1">
          <p className="text-[10px] font-display text-center text-foreground truncate">{hero.name}</p>
        </div>
        {selected && (
          <div className="absolute inset-0 bg-gold/10 border-2 border-gold rounded-lg" />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border-2 cursor-pointer bg-gradient-card transition-all ${
        selected ? 'border-gold shadow-gold' : rarityColors[hero.rarity]
      } ${rarityGlow[hero.rarity]}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={hero.image}
          alt={hero.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rarityBadgeColor[hero.rarity]}`}>
            {rarityLabel[hero.rarity]}
          </span>
        </div>
        
        <div className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-xs font-bold text-gold">Ур. {hero.level}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-display text-lg font-bold text-foreground">{hero.name}</h3>
          <p className="text-xs text-muted-foreground">{hero.class}</p>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Swords className="h-3 w-3 text-crimson" />
              <span className="text-xs font-semibold text-foreground">{hero.attack}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-gold" />
              <span className="text-xs font-semibold text-foreground">{hero.defense}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-emerald" />
              <span className="text-xs font-semibold text-foreground">{hero.hp}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroCard;
