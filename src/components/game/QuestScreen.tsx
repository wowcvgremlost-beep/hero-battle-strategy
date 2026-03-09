import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, CheckCircle2, Clock, Gift, Swords, Coins, Sparkles } from 'lucide-react';
import { QUESTS, type QuestDef } from '@/data/quests';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlayerQuest {
  id: string;
  quest_id: string;
  status: string;
  progress: number;
  target: number;
}

interface QuestScreenProps {
  onQuestsChange?: () => void;
  onLeadershipReward?: (amount: number) => void;
}

const QuestScreen = ({ onQuestsChange, onLeadershipReward }: QuestScreenProps) => {
  const { user, profile, updateGold, updateHeroStats, refreshProfile } = useAuth();
  const [quests, setQuests] = useState<PlayerQuest[]>([]);
  const [loading, setLoading] = useState(true);

  const heroLevel = profile?.hero_level || 1;

  const fetchQuests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('player_quests')
      .select('id, quest_id, status, progress, target')
      .eq('user_id', user.id);
    setQuests((data as PlayerQuest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuests();
  }, [user]);

  const availableQuests = QUESTS.filter(q => {
    if (q.minLevel > heroLevel) return false;
    const pq = quests.find(pq => pq.quest_id === q.id);
    if (pq && pq.status === 'completed') return false;
    return true;
  });

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  const acceptQuest = async (quest: QuestDef) => {
    if (!user) return;
    const existing = quests.find(q => q.quest_id === quest.id);
    if (existing) return;

    await supabase.from('player_quests').insert({
      user_id: user.id,
      quest_id: quest.id,
      status: 'active',
      progress: 0,
      target: quest.target,
    });
    toast.success(`Квест принят: ${quest.name}`);
    await fetchQuests();
    onQuestsChange?.();
  };

  const claimReward = async (quest: QuestDef) => {
    if (!user || !profile) return;
    const pq = quests.find(q => q.quest_id === quest.id);
    if (!pq || pq.progress < pq.target) return;

    await supabase.from('player_quests')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('quest_id', quest.id);

    await updateGold((profile.gold || 0) + quest.goldReward);
    if (quest.expReward) {
      const newExp = (profile.hero_experience || 0) + quest.expReward;
      await updateHeroStats({ hero_experience: newExp });
    }

    toast.success(`Награда получена! +${quest.goldReward}💰 +${quest.expReward}✨`);
    await fetchQuests();
    onQuestsChange?.();
  };

  if (loading) {
    return <div className="text-center text-muted-foreground text-sm py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Active quests */}
      {activeQuests.length > 0 && (
        <>
          <h3 className="font-display text-sm font-bold text-gold uppercase flex items-center gap-2">
            <Clock className="h-4 w-4" /> Активные квесты ({activeQuests.length})
          </h3>
          <div className="space-y-2">
            {activeQuests.map(pq => {
              const def = QUESTS.find(q => q.id === pq.quest_id);
              if (!def) return null;
              const isReady = pq.progress >= pq.target;
              const pct = Math.min(100, Math.floor((pq.progress / pq.target) * 100));
              return (
                <motion.div
                  key={pq.quest_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-xl border p-3 ${isReady ? 'border-gold/40 bg-gold/5' : 'border-border bg-gradient-card'}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{def.npcEmoji}</span>
                    <div className="flex-1">
                      <p className="font-display text-sm font-bold text-foreground">{def.name}</p>
                      <p className="text-[10px] text-muted-foreground">{def.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">NPC: {def.npcName}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">{pq.progress}/{pq.target}</span>
                          <span className="text-gold">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isReady ? 'bg-gold' : 'bg-crimson/70'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[10px]">
                        <span className="text-gold flex items-center gap-0.5"><Coins className="h-2.5 w-2.5" />{def.goldReward}</span>
                        <span className="text-arcane flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" />{def.expReward}</span>
                      </div>
                    </div>
                  </div>
                  {isReady && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => claimReward(def)}
                      className="w-full mt-2 rounded-lg bg-gradient-gold px-3 py-2 font-display text-[10px] font-bold text-primary-foreground flex items-center justify-center gap-1"
                    >
                      <Gift className="h-3 w-3" /> ЗАБРАТЬ НАГРАДУ
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Available quests */}
      <h3 className="font-display text-sm font-bold text-foreground uppercase flex items-center gap-2">
        <ScrollText className="h-4 w-4" /> Доступные квесты
      </h3>
      <div className="space-y-2">
        {availableQuests.filter(q => !activeQuests.some(a => a.quest_id === q.id)).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {completedQuests.length === QUESTS.length ? 'Все квесты выполнены! 🎉' : 'Нет доступных квестов на вашем уровне'}
          </p>
        )}
        {availableQuests.filter(q => !activeQuests.some(a => a.quest_id === q.id)).map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-gradient-card p-3"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{quest.npcEmoji}</span>
              <div className="flex-1">
                <p className="font-display text-sm font-bold text-foreground">{quest.name}</p>
                <p className="text-[10px] text-muted-foreground">{quest.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">NPC: {quest.npcName} • Мин. ур. {quest.minLevel}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                  <span className="text-gold flex items-center gap-0.5"><Coins className="h-2.5 w-2.5" />{quest.goldReward}</span>
                  <span className="text-arcane flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" />{quest.expReward}</span>
                </div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => acceptQuest(quest)}
              className="w-full mt-2 rounded-lg bg-gradient-crimson px-3 py-2 font-display text-[10px] font-bold text-accent-foreground flex items-center justify-center gap-1"
            >
              <ScrollText className="h-3 w-3" /> ПРИНЯТЬ КВЕСТ
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Completed */}
      {completedQuests.length > 0 && (
        <>
          <h3 className="font-display text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Завершено ({completedQuests.length})
          </h3>
          <div className="space-y-1">
            {completedQuests.map(pq => {
              const def = QUESTS.find(q => q.id === pq.quest_id);
              if (!def) return null;
              return (
                <div key={pq.quest_id} className="rounded-lg border border-border/50 bg-secondary/30 p-2 flex items-center gap-2 opacity-60">
                  <CheckCircle2 className="h-3 w-3 text-emerald" />
                  <span className="text-xs text-muted-foreground">{def.name}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestScreen;
