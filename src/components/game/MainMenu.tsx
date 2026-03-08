import { motion } from 'framer-motion';
import { Swords, Users, Trophy, Star } from 'lucide-react';
import type { GameScreen } from '@/types/game';

interface MainMenuProps {
  onNavigate: (screen: GameScreen) => void;
  playerLevel: number;
}

const MainMenu = ({ onNavigate, playerLevel }: MainMenuProps) => {
  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-24">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-center"
      >
        <h1 className="font-display text-4xl font-black text-gradient-gold tracking-wider">
          БИТВА
        </h1>
        <h2 className="font-display text-2xl font-bold text-foreground -mt-1 tracking-widest">
          ГЕРОЕВ
        </h2>
      </motion.div>

      {/* Player info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex items-center gap-2"
      >
        <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
          <Star className="h-4 w-4 text-gold" />
          <span className="text-sm font-semibold text-foreground">Уровень {playerLevel}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
          <Trophy className="h-4 w-4 text-gold" />
          <span className="text-sm font-semibold text-foreground">Ранг: Серебро</span>
        </div>
      </motion.div>

      {/* Menu buttons */}
      <div className="w-full max-w-sm space-y-3">
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('battle')}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-crimson p-4 shadow-crimson"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-accent-foreground/10 p-3">
              <Swords className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-display text-lg font-bold text-accent-foreground">В БОЙ!</h3>
              <p className="text-xs text-accent-foreground/70">Сразись с противниками</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('heroes')}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-card border border-gold/20 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gold/10 p-3">
              <Users className="h-8 w-8 text-gold" />
            </div>
            <div className="text-left">
              <h3 className="font-display text-lg font-bold text-foreground">МОИ ГЕРОИ</h3>
              <p className="text-xs text-muted-foreground">Управляй командой</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('shop')}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-card border border-arcane/20 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-arcane/10 p-3">
              <Trophy className="h-8 w-8 text-arcane" />
            </div>
            <div className="text-left">
              <h3 className="font-display text-lg font-bold text-foreground">МАГАЗИН</h3>
              <p className="text-xs text-muted-foreground">Улучшения и предметы</p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Daily quest teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 w-full max-w-sm rounded-xl border border-gold/20 bg-gradient-card p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gold font-semibold">ЕЖЕДНЕВНОЕ ЗАДАНИЕ</p>
            <p className="text-sm text-foreground mt-1">Победи 3 противников</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gold">1/3</p>
            <div className="mt-1 h-1.5 w-20 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-gradient-gold" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MainMenu;
