import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, Shield, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  user_id: string;
  character_name: string | null;
  town: string | null;
  hero_level: number;
  hero_attack: number;
  hero_defense: number;
  gold: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, character_name, town, hero_level, hero_attack, hero_defense, gold')
        .eq('character_created', true)
        .order('hero_level', { ascending: false })
        .order('gold', { ascending: false })
        .limit(50);
      setPlayers((data as LeaderboardEntry[]) || []);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const getMedal = (idx: number) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `${idx + 1}`;
  };

  if (loading) {
    return <div className="text-center text-muted-foreground text-sm py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="font-display text-lg font-bold text-gradient-gold">Таблица лидеров</h2>
      </div>

      {players.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">Пока нет игроков</p>
      )}

      {players.map((p, idx) => {
        const isMe = p.user_id === user?.id;
        return (
          <motion.div
            key={p.user_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl border p-3 flex items-center gap-3 ${
              isMe
                ? 'border-gold/40 bg-gold/5'
                : 'border-border bg-gradient-card'
            }`}
          >
            <span className="font-display text-lg font-bold w-8 text-center">
              {getMedal(idx)}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`font-display text-sm font-bold truncate ${isMe ? 'text-gold' : 'text-foreground'}`}>
                {p.character_name || 'Безымянный'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{p.town}</span>
                <span className="flex items-center gap-0.5">
                  <Swords className="h-2.5 w-2.5" />{p.hero_attack}
                </span>
                <span className="flex items-center gap-0.5">
                  <Shield className="h-2.5 w-2.5" />{p.hero_defense}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-sm font-bold text-gold">Ур.{p.hero_level}</p>
              <p className="text-[10px] text-muted-foreground">💰{p.gold.toLocaleString()}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Leaderboard;
