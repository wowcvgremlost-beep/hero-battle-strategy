import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
import { Shield, Swords, Heart, Zap, LogOut, Star } from 'lucide-react';

const Game = () => {
  const { profile, signOut } = useAuth();
  const town = TOWNS.find((t) => t.id === profile?.town);

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-gold/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gold" />
            <span className="font-display text-sm font-bold text-foreground">{profile?.character_name}</span>
            <span className="text-xs text-muted-foreground">• {town?.name}</span>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-black text-gradient-gold text-center mb-2">БИТВА ГЕРОЕВ</h1>
          <p className="text-center text-sm text-muted-foreground mb-6">Добро пожаловать, {profile?.character_name}!</p>
        </motion.div>

        {/* Town info */}
        {town && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-gold/20 bg-gradient-card p-4 mb-4"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-1">{town.name}</h2>
            <p className="text-xs text-muted-foreground mb-3">{town.description}</p>
            <p className="text-xs text-arcane font-semibold">Школа магии: {town.magicSchool}</p>
          </motion.div>
        )}

        {/* Army */}
        {town && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display text-sm font-bold text-gold mb-3 uppercase">Твоя армия</h3>
            <div className="space-y-2">
              {town.units.map((u, i) => (
                <motion.div
                  key={u.name}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="rounded-lg border border-border bg-gradient-card p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-display text-sm font-bold text-foreground">{u.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      Ур. {u.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex items-center gap-1">
                      <Swords className="h-3 w-3 text-crimson" />
                      <span className="text-xs text-foreground">{u.attack}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-gold" />
                      <span className="text-xs text-foreground">{u.defense}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-emerald" />
                      <span className="text-xs text-foreground">{u.health}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-arcane" />
                      <span className="text-xs text-foreground">{u.damage}</span>
                    </div>
                    {u.shots && (
                      <span className="text-[10px] text-muted-foreground">🎯 {u.shots}</span>
                    )}
                  </div>
                  {u.abilities && (
                    <p className="text-[10px] text-muted-foreground leading-tight">{u.abilities}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Placeholder for future features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 rounded-xl border border-arcane/20 bg-gradient-card p-4 text-center"
        >
          <p className="text-xs text-muted-foreground">🏗️ Постройки, битвы и магазин — скоро!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Game;
