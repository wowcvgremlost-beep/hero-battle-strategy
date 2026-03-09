import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Gift, Check, Star, Flame, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  getCurrentWeeklyTournament,
  getCurrentSeasonalEvent,
  getDaysRemainingInWeek,
  type GameEvent,
  type EventTask,
} from '@/data/events';

type EventTab = 'weekly' | 'seasonal';

const EventsScreen = () => {
  const { user, profile, buildings, army, spells, heroSkills, updateGold, updateMana, updateHeroStats } = useAuth();
  const [eventTab, setEventTab] = useState<EventTab>('weekly');
  const [progressMap, setProgressMap] = useState<Record<string, { progress: number; claimed: boolean }>>({});
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const weeklyEvent = getCurrentWeeklyTournament();
  const seasonalEvent = getCurrentSeasonalEvent();

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, profile, buildings, army, spells, heroSkills]);

  const loadData = async () => {
    if (!user || !profile) return;
    setLoading(true);

    const [progressRes, battlesRes, streakRes, artifactsRes, questsRes] = await Promise.all([
      supabase.from('player_event_progress').select('event_id, progress, claimed').eq('user_id', user.id),
      supabase.from('battles').select('winner_id, is_pve, attacker_id, defender_id').or(`attacker_id.eq.${user.id},defender_id.eq.${user.id}`),
      supabase.from('daily_rewards').select('streak').eq('user_id', user.id).single(),
      supabase.from('player_artifacts').select('id').eq('user_id', user.id),
      supabase.from('player_quests').select('id').eq('user_id', user.id).eq('status', 'completed'),
    ]);

    const pMap: Record<string, { progress: number; claimed: boolean }> = {};
    (progressRes.data || []).forEach((p: any) => {
      pMap[p.event_id] = { progress: p.progress, claimed: p.claimed };
    });
    setProgressMap(pMap);

    const battles = battlesRes.data || [];
    const totalWins = battles.filter((b: any) => b.winner_id === user.id).length;
    const pvpBattles = battles.filter((b: any) => !b.is_pve);
    const pvpWins = pvpBattles.filter((b: any) => b.winner_id === user.id).length;
    const pvpTotal = pvpBattles.length;
    const armyTotal = army.reduce((s, u) => s + u.count, 0);
    const skillsTotal = heroSkills.reduce((s, sk) => s + sk.skill_level, 0);

    setStats({
      pvp_wins: pvpWins,
      pvp_battles: pvpTotal,
      battles: totalWins,
      gold_current: profile.gold || 0,
      buildings: buildings.length,
      spells: spells.length,
      hero_level: profile.hero_level || 1,
      army_total: armyTotal,
      skills_total: skillsTotal,
      streak: streakRes.data?.streak || 0,
      artifacts: (artifactsRes.data || []).length,
      quests: (questsRes.data || []).length,
    });

    setLoading(false);
  };

  const getTaskProgress = (task: EventTask): number => {
    return stats[task.trackType] || 0;
  };

  const isTaskComplete = (task: EventTask): boolean => {
    return getTaskProgress(task) >= task.target;
  };

  const isTaskClaimed = (taskId: string): boolean => {
    return progressMap[taskId]?.claimed || false;
  };

  const claimTaskReward = async (event: GameEvent, task: EventTask) => {
    if (!user || !profile) return;

    const { error } = await supabase.from('player_event_progress').upsert({
      user_id: user.id,
      event_id: task.id,
      progress: getTaskProgress(task),
      claimed: true,
    }, { onConflict: 'user_id,event_id' });

    if (error) {
      toast.error('Ошибка при получении награды');
      return;
    }

    if (task.goldReward > 0) await updateGold((profile.gold || 0) + task.goldReward);
    if (task.manaReward > 0) await updateMana((profile.mana || 0) + task.manaReward);
    if (task.expReward > 0) await updateHeroStats({ hero_experience: (profile.hero_experience || 0) + task.expReward });

    setProgressMap(prev => ({ ...prev, [task.id]: { progress: getTaskProgress(task), claimed: true } }));

    const parts: string[] = [];
    if (task.goldReward > 0) parts.push(`${task.goldReward}💰`);
    if (task.manaReward > 0) parts.push(`${task.manaReward}✨`);
    if (task.expReward > 0) parts.push(`${task.expReward}⭐`);

    toast.success(
      <div className="flex items-center gap-2">
        <span className="text-2xl">{event.icon}</span>
        <div>
          <p className="font-bold">{task.name}</p>
          <p className="text-xs">{parts.join(' ')}</p>
        </div>
      </div>
    );
  };

  const renderEventTasks = (event: GameEvent) => (
    <div className="space-y-2">
      {event.tasks.map((task, idx) => {
        const current = getTaskProgress(task);
        const complete = isTaskComplete(task);
        const claimed = isTaskClaimed(task.id);
        const pct = Math.min(100, Math.round((current / task.target) * 100));

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl border p-3 ${
              claimed
                ? 'border-emerald/30 bg-emerald/5'
                : complete
                ? 'border-gold/40 bg-gold/5 ring-1 ring-gold/20'
                : 'border-border bg-gradient-card'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex-1 min-w-0">
                <p className={`font-display text-sm font-bold truncate ${
                  claimed ? 'text-emerald' : complete ? 'text-gold' : 'text-foreground'
                }`}>
                  {task.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{task.description}</p>
              </div>
              {claimed ? (
                <Check className="h-5 w-5 text-emerald shrink-0" />
              ) : complete ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => claimTaskReward(event, task)}
                  className="shrink-0 rounded-lg bg-gold/20 border border-gold/30 px-3 py-1.5 font-display text-[10px] font-bold text-gold hover:bg-gold/30 transition-colors flex items-center gap-1"
                >
                  <Gift className="h-3.5 w-3.5" />
                  Забрать
                </motion.button>
              ) : null}
            </div>

            {/* Progress bar */}
            <div className="rounded-full bg-secondary h-1.5 overflow-hidden mb-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                className={`h-full rounded-full ${claimed ? 'bg-emerald' : complete ? 'bg-gold' : 'bg-crimson/60'}`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {current}/{task.target} ({pct}%)
              </span>
              <div className="flex gap-1.5 text-[9px] text-gold/70">
                {task.goldReward > 0 && <span>{task.goldReward}💰</span>}
                {task.manaReward > 0 && <span>{task.manaReward}✨</span>}
                {task.expReward > 0 && <span>{task.expReward}⭐</span>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  if (loading) {
    return <div className="text-center text-muted-foreground text-sm py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-5 w-5 text-gold" />
        <h2 className="font-display text-lg font-bold text-gradient-gold">События</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setEventTab('weekly')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 font-display text-xs font-bold transition-all ${
            eventTab === 'weekly'
              ? 'bg-crimson/20 text-crimson border border-crimson/30'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          Еженедельный
        </button>
        <button
          onClick={() => setEventTab('seasonal')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 font-display text-xs font-bold transition-all ${
            eventTab === 'seasonal'
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          Сезонный
        </button>
      </div>

      {/* Weekly tournament */}
      {eventTab === 'weekly' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="rounded-xl border border-crimson/20 bg-gradient-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{weeklyEvent.icon}</span>
              <div>
                <p className="font-display text-sm font-bold text-foreground">{weeklyEvent.name}</p>
                <p className="text-[10px] text-muted-foreground">{weeklyEvent.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Осталось {getDaysRemainingInWeek()} дн. до обновления</span>
            </div>
          </div>
          {renderEventTasks(weeklyEvent)}
        </motion.div>
      )}

      {/* Seasonal event */}
      {eventTab === 'seasonal' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {seasonalEvent ? (
            <>
              <div className="rounded-xl border border-gold/20 bg-gradient-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{seasonalEvent.icon}</span>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{seasonalEvent.name}</p>
                    <p className="text-[10px] text-muted-foreground">{seasonalEvent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-gold">
                  <Flame className="h-3 w-3" />
                  <span>Сезонное событие активно!</span>
                </div>
              </div>
              {renderEventTasks(seasonalEvent)}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🕐</p>
              <p className="text-sm text-muted-foreground">Сейчас нет активных сезонных событий</p>
              <p className="text-[10px] text-muted-foreground mt-1">Следующее событие скоро начнётся</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EventsScreen;
