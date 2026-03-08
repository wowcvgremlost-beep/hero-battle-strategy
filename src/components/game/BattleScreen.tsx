import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Zap, Shield } from 'lucide-react';
import HeroCard from './HeroCard';
import type { Hero } from '@/types/game';

interface BattleScreenProps {
  heroes: Hero[];
  selectedHeroes: string[];
}

const BattleScreen = ({ heroes, selectedHeroes }: BattleScreenProps) => {
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const team = heroes.filter((h) => selectedHeroes.includes(h.id));

  const startBattle = () => {
    setBattleStarted(true);
    const logs = [
      '⚔️ Битва началась!',
      `${team[0]?.name || 'Герой'} наносит мощный удар!`,
      '🛡️ Противник защищается...',
      `${team[1]?.name || 'Герой'} использует способность!`,
      '💥 Критический удар!',
      '🏆 Победа! +250 золота, +15 опыта',
    ];
    logs.forEach((log, i) => {
      setTimeout(() => {
        setBattleLog((prev) => [...prev, log]);
      }, (i + 1) * 800);
    });
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
        <h2 className="font-display text-2xl font-bold text-gradient-gold">АРЕНА</h2>
        <p className="text-sm text-muted-foreground mt-1">Выбери команду и сражайся</p>
      </motion.div>

      {/* Team display */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">Твоя команда</p>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((slot) => {
            const hero = team[slot];
            return hero ? (
              <HeroCard key={hero.id} hero={hero} compact />
            ) : (
              <div
                key={slot}
                className="h-20 w-16 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
              >
                <span className="text-[10px] text-muted-foreground">Пусто</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Opponent */}
      <div className="mb-6 rounded-xl border border-crimson/20 bg-gradient-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-crimson font-semibold">ПРОТИВНИК</p>
            <p className="font-display text-lg text-foreground font-bold mt-1">Тёмный Легион</p>
            <p className="text-xs text-muted-foreground">Сила: 4200</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Swords className="h-4 w-4 text-crimson" />
              <span className="text-sm font-bold text-foreground">680</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-gold" />
              <span className="text-sm font-bold text-foreground">520</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle button */}
      {!battleStarted && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startBattle}
          disabled={team.length === 0}
          className="w-full rounded-xl bg-gradient-crimson p-4 shadow-crimson disabled:opacity-40 disabled:shadow-none"
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-accent-foreground" />
            <span className="font-display text-lg font-bold text-accent-foreground">
              {team.length === 0 ? 'ВЫБЕРИ ГЕРОЕВ' : 'НАЧАТЬ БИТВУ'}
            </span>
          </div>
          <p className="text-xs text-accent-foreground/60 mt-1">Стоимость: 5 энергии</p>
        </motion.button>
      )}

      {/* Battle log */}
      <AnimatePresence>
        {battleLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-gold/10 bg-gradient-card p-4 space-y-2"
          >
            {battleLog.map((log, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-sm ${
                  i === battleLog.length - 1 && log.includes('Победа')
                    ? 'text-gold font-bold font-display'
                    : 'text-foreground'
                }`}
              >
                {log}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BattleScreen;
