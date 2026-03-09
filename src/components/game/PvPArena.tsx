import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Shield, Trophy, Crown, Flame, Search, History, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TOWNS } from '@/data/towns';
import PvPBattle from './PvPBattle';

interface ArenaPlayer {
  user_id: string;
  character_name: string | null;
  town: string | null;
  hero_level: number;
  hero_attack: number;
  hero_defense: number;
  hero_spellpower: number;
  gold: number;
}

interface BattleRecord {
  id: string;
  attacker_id: string;
  defender_id: string | null;
  attacker_power: number;
  defender_power: number;
  winner_id: string | null;
  gold_reward: number;
  exp_reward: number;
  created_at: string;
}

type ArenaTab = 'opponents' | 'history' | 'rankings';

const PvPArena = () => {
  const { user, profile } = useAuth();
  const [arenaTab, setArenaTab] = useState<ArenaTab>('opponents');
  const [opponents, setOpponents] = useState<ArenaPlayer[]>([]);
  const [battleHistory, setBattleHistory] = useState<BattleRecord[]>([]);
  const [rankings, setRankings] = useState<{ user_id: string; character_name: string | null; town: string | null; hero_level: number; wins: number; losses: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [pvpTarget, setPvpTarget] = useState<ArenaPlayer | null>(null);
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (arenaTab === 'opponents') loadOpponents();
    else if (arenaTab === 'history') loadHistory();
    else if (arenaTab === 'rankings') loadRankings();
  }, [arenaTab, user]);

  const loadOpponents = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('user_id, character_name, town, hero_level, hero_attack, hero_defense, hero_spellpower, gold')
      .eq('character_created', true)
      .neq('user_id', user.id)
      .order('hero_level', { ascending: false })
      .limit(20);
    setOpponents((data as ArenaPlayer[]) || []);
    setLoading(false);
  };

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('battles')
      .select('*')
      .eq('is_pve', false)
      .or(`attacker_id.eq.${user.id},defender_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(30);
    const records = (data as BattleRecord[]) || [];
    setBattleHistory(records);

    // Fetch names for all participants
    const ids = new Set<string>();
    records.forEach(r => { ids.add(r.attacker_id); if (r.defender_id) ids.add(r.defender_id); });
    if (ids.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, character_name')
        .in('user_id', Array.from(ids));
      const names: Record<string, string> = {};
      profiles?.forEach((p: any) => { names[p.user_id] = p.character_name || 'Безымянный'; });
      setPlayerNames(names);
    }
    setLoading(false);
  };

  const loadRankings = async () => {
    if (!user) return;
    setLoading(true);
    // Get all PvP battles
    const { data: battles } = await supabase
      .from('battles')
      .select('attacker_id, defender_id, winner_id')
      .eq('is_pve', false);

    // Count wins/losses per player
    const stats: Record<string, { wins: number; losses: number }> = {};
    (battles || []).forEach((b: any) => {
      [b.attacker_id, b.defender_id].filter(Boolean).forEach(id => {
        if (!stats[id]) stats[id] = { wins: 0, losses: 0 };
        if (b.winner_id === id) stats[id].wins++;
        else stats[id].losses++;
      });
    });

    const playerIds = Object.keys(stats);
    if (playerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, character_name, town, hero_level')
        .in('user_id', playerIds);

      const ranked = (profiles || []).map((p: any) => ({
        user_id: p.user_id,
        character_name: p.character_name,
        town: p.town,
        hero_level: p.hero_level,
        wins: stats[p.user_id]?.wins || 0,
        losses: stats[p.user_id]?.losses || 0,
      })).sort((a, b) => b.wins - a.wins || a.losses - b.losses);

      setRankings(ranked.slice(0, 30));
    } else {
      setRankings([]);
    }
    setLoading(false);
  };

  const getPowerEstimate = (p: ArenaPlayer) => {
    return Math.floor((p.hero_attack * 5 + p.hero_spellpower * 3 + p.hero_defense * 5) * (1 + p.hero_level * 0.3));
  };

  const getDifficultyColor = (p: ArenaPlayer) => {
    const myLevel = profile?.hero_level || 1;
    const diff = p.hero_level - myLevel;
    if (diff >= 3) return 'text-destructive';
    if (diff >= 1) return 'text-orange-400';
    if (diff <= -3) return 'text-emerald';
    return 'text-gold';
  };

  const getDifficultyLabel = (p: ArenaPlayer) => {
    const myLevel = profile?.hero_level || 1;
    const diff = p.hero_level - myLevel;
    if (diff >= 3) return 'Смертельно';
    if (diff >= 1) return 'Опасно';
    if (diff <= -3) return 'Легко';
    if (diff <= -1) return 'Просто';
    return 'Равный';
  };

  const getMedal = (idx: number) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `${idx + 1}`;
  };

  const myStats = rankings.find(r => r.user_id === user?.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="h-5 w-5 text-crimson" />
        <h2 className="font-display text-lg font-bold text-gradient-gold">PvP Арена</h2>
      </div>

      {/* My PvP stats */}
      {myStats && (
        <div className="rounded-xl border border-gold/20 bg-gradient-card p-3 flex items-center gap-4">
          <Star className="h-5 w-5 text-gold" />
          <div className="flex-1">
            <p className="font-display text-sm font-bold text-foreground">Ваш рейтинг</p>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="text-emerald">Побед: {myStats.wins}</span>
              <span className="text-destructive">Поражений: {myStats.losses}</span>
              <span className="text-gold">
                Винрейт: {myStats.wins + myStats.losses > 0 ? Math.round((myStats.wins / (myStats.wins + myStats.losses)) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {([
          { id: 'opponents' as ArenaTab, icon: Search, label: 'Противники' },
          { id: 'history' as ArenaTab, icon: History, label: 'История' },
          { id: 'rankings' as ArenaTab, icon: Crown, label: 'Рейтинг' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setArenaTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 font-display text-xs font-bold transition-all ${
              arenaTab === t.id
                ? 'bg-crimson/20 text-crimson border border-crimson/30'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground text-center py-8">Загрузка...</p>}

      {/* Opponents list */}
      {!loading && arenaTab === 'opponents' && (
        <div className="space-y-2">
          {opponents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Нет доступных противников</p>
          )}
          {opponents.map((opp, idx) => (
            <motion.div
              key={opp.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl border border-border bg-gradient-card p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-bold text-foreground truncate">
                    {opp.character_name || 'Безымянный'}
                  </p>
                  <span className={`text-[10px] font-bold ${getDifficultyColor(opp)}`}>
                    {getDifficultyLabel(opp)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span>{opp.town}</span>
                  <span>Ур.{opp.hero_level}</span>
                  <span className="flex items-center gap-0.5">
                    <Swords className="h-2.5 w-2.5" />{opp.hero_attack}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Shield className="h-2.5 w-2.5" />{opp.hero_defense}
                  </span>
                  <span className="text-gold">~{getPowerEstimate(opp)}⚡</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPvpTarget(opp)}
                className="rounded-lg bg-crimson/20 border border-crimson/30 px-3 py-2 font-display text-xs font-bold text-crimson hover:bg-crimson/30 transition-colors"
              >
                ⚔️ Бой
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Battle history */}
      {!loading && arenaTab === 'history' && (
        <div className="space-y-2">
          {battleHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Нет PvP боёв</p>
          )}
          {battleHistory.map((b, idx) => {
            const isAttacker = b.attacker_id === user?.id;
            const isWinner = b.winner_id === user?.id;
            const opponentId = isAttacker ? b.defender_id : b.attacker_id;
            const opponentName = opponentId ? (playerNames[opponentId] || 'Неизвестный') : 'Неизвестный';
            const date = new Date(b.created_at);

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-xl border p-3 ${
                  isWinner
                    ? 'border-emerald/30 bg-emerald/5'
                    : 'border-destructive/30 bg-destructive/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isWinner ? (
                      <Trophy className="h-4 w-4 text-gold" />
                    ) : (
                      <Swords className="h-4 w-4 text-destructive" />
                    )}
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">
                        {isAttacker ? 'Атака на' : 'Защита от'} {opponentName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {date.toLocaleDateString('ru')} {date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-xs font-bold ${isWinner ? 'text-emerald' : 'text-destructive'}`}>
                      {isWinner ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ'}
                    </p>
                    {isWinner && b.gold_reward > 0 && (
                      <p className="text-[10px] text-gold">+{b.gold_reward}💰 +{b.exp_reward}⭐</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rankings */}
      {!loading && arenaTab === 'rankings' && (
        <div className="space-y-2">
          {rankings.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Нет данных рейтинга</p>
          )}
          {rankings.map((r, idx) => {
            const isMe = r.user_id === user?.id;
            const winrate = r.wins + r.losses > 0 ? Math.round((r.wins / (r.wins + r.losses)) * 100) : 0;

            return (
              <motion.div
                key={r.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-xl border p-3 flex items-center gap-3 ${
                  isMe ? 'border-gold/40 bg-gold/5' : 'border-border bg-gradient-card'
                }`}
              >
                <span className="font-display text-lg font-bold w-8 text-center">{getMedal(idx)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-display text-sm font-bold truncate ${isMe ? 'text-gold' : 'text-foreground'}`}>
                    {r.character_name || 'Безымянный'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{r.town}</span>
                    <span>Ур.{r.hero_level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald font-bold">{r.wins}W</span>
                    <span className="text-destructive font-bold">{r.losses}L</span>
                  </div>
                  <p className="text-[10px] text-gold font-bold">{winrate}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {pvpTarget && (
        <PvPBattle
          target={pvpTarget}
          onClose={() => {
            setPvpTarget(null);
            if (arenaTab === 'history') loadHistory();
            if (arenaTab === 'rankings') loadRankings();
          }}
        />
      )}
    </div>
  );
};

export default PvPArena;
