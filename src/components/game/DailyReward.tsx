import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Flame, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DailyRewardDef {
  day: number;
  gold: number;
  mana: number;
  label: string;
  icon: string;
}

const DAILY_REWARDS: DailyRewardDef[] = [
  { day: 1, gold: 200, mana: 0, label: '200💰', icon: '🎁' },
  { day: 2, gold: 400, mana: 10, label: '400💰 10✨', icon: '🎁' },
  { day: 3, gold: 600, mana: 15, label: '600💰 15✨', icon: '🎁' },
  { day: 4, gold: 1000, mana: 20, label: '1000💰 20✨', icon: '🎀' },
  { day: 5, gold: 1500, mana: 25, label: '1500💰 25✨', icon: '🎀' },
  { day: 6, gold: 2000, mana: 30, label: '2000💰 30✨', icon: '🏆' },
  { day: 7, gold: 5000, mana: 50, label: '5000💰 50✨', icon: '👑' },
];

const DailyReward = () => {
  const { user, profile, updateGold, updateMana } = useAuth();
  const [streak, setStreak] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkDailyReward();
  }, [user]);

  const checkDailyReward = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!data) {
      // First time — can claim day 1
      setStreak(0);
      setCanClaim(true);
      setShowModal(true);
    } else {
      const lastClaim = new Date(data.last_claim_date + 'T00:00:00Z');
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already claimed today
        setStreak(data.streak);
        setCanClaim(false);
      } else if (diffDays === 1) {
        // Consecutive day
        setStreak(data.streak);
        setCanClaim(true);
        setShowModal(true);
      } else {
        // Streak broken
        setStreak(0);
        setCanClaim(true);
        setShowModal(true);
      }
    }
    setLoading(false);
  };

  const claimReward = async () => {
    if (!user || !profile || !canClaim) return;

    const newStreak = streak + 1;
    const rewardIndex = ((newStreak - 1) % 7);
    const reward = DAILY_REWARDS[rewardIndex];

    // Update/insert streak
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('daily_rewards')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase.from('daily_rewards').update({
        streak: newStreak,
        last_claim_date: today,
      }).eq('user_id', user.id);
    } else {
      await supabase.from('daily_rewards').insert({
        user_id: user.id,
        streak: newStreak,
        last_claim_date: today,
      });
    }

    // Give rewards
    await updateGold((profile.gold || 0) + reward.gold);
    if (reward.mana > 0) {
      await updateMana((profile.mana || 0) + reward.mana);
    }

    setStreak(newStreak);
    setCanClaim(false);
    setClaimed(true);

    toast.success(
      <div className="flex items-center gap-2">
        <span className="text-2xl">{reward.icon}</span>
        <div>
          <p className="font-bold">Ежедневная награда! (День {rewardIndex + 1})</p>
          <p className="text-xs">{reward.label}</p>
        </div>
      </div>
    );
  };

  if (loading || !showModal) return null;

  const currentDay = (streak % 7) + 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl border border-gold/30 bg-gradient-card p-5 shadow-gold"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-gradient-gold flex items-center gap-2">
              <Gift className="h-5 w-5 text-gold" />
              Ежедневная награда
            </h2>
            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Streak indicator */}
          <div className="flex items-center gap-2 mb-4 rounded-lg bg-secondary/50 p-2">
            <Flame className="h-4 w-4 text-crimson" />
            <span className="font-display text-sm font-bold text-foreground">
              Серия: {streak} {streak >= 7 ? '🔥' : ''}
            </span>
            {streak >= 7 && (
              <span className="text-[10px] text-gold ml-auto">Цикл {Math.floor(streak / 7) + 1}</span>
            )}
          </div>

          {/* Reward grid */}
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {DAILY_REWARDS.map((reward, idx) => {
              const dayNum = idx + 1;
              const isPast = dayNum < currentDay || claimed;
              const isCurrent = dayNum === currentDay && canClaim && !claimed;
              const isFuture = dayNum > currentDay && !claimed;

              return (
                <motion.div
                  key={dayNum}
                  whileHover={isCurrent ? { scale: 1.05 } : {}}
                  className={`rounded-lg p-1.5 text-center border transition-all ${
                    isCurrent
                      ? 'border-gold/50 bg-gold/10 shadow-gold ring-1 ring-gold/30'
                      : isPast
                      ? 'border-emerald/30 bg-emerald/5'
                      : 'border-border bg-secondary/30 opacity-50'
                  }`}
                >
                  <p className="text-[9px] text-muted-foreground font-bold">Д{dayNum}</p>
                  <p className="text-base leading-none my-0.5">
                    {isPast && !isCurrent ? '✅' : reward.icon}
                  </p>
                  <p className="text-[8px] text-gold font-bold">{reward.gold}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Current reward detail */}
          {canClaim && !claimed && (
            <div className="rounded-lg bg-gold/5 border border-gold/20 p-3 mb-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Награда за день {currentDay}</p>
              <p className="font-display text-lg font-bold text-gold mt-1">
                {DAILY_REWARDS[currentDay - 1].label}
              </p>
            </div>
          )}

          {/* Claim button */}
          {canClaim && !claimed ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={claimReward}
              className="w-full rounded-xl bg-gradient-gold p-3.5 shadow-gold font-display font-bold text-primary-foreground flex items-center justify-center gap-2"
            >
              <Star className="h-5 w-5" />
              ЗАБРАТЬ НАГРАДУ
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(false)}
              className="w-full rounded-xl bg-secondary p-3.5 font-display font-bold text-foreground flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5 text-emerald" />
              {claimed ? 'Получено! Закрыть' : 'Уже получено сегодня'}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyReward;
