import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, Gift, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ACHIEVEMENTS, CATEGORY_NAMES, type AchievementStats } from '@/data/achievements';

const AchievementsScreen = () => {
  const { user, profile, buildings, army, spells, heroSkills, updateGold, updateMana, updateHeroStats } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, profile, buildings, army, spells, heroSkills]);

  const loadData = async () => {
    if (!user || !profile) return;
    setLoading(true);

    // Fetch unlocked achievements, battle stats, daily streak, guild, artifacts, quests in parallel
    const [achievementsRes, battlesRes, streakRes, guildRes, artifactsRes, questsRes] = await Promise.all([
      supabase.from('player_achievements').select('achievement_id').eq('user_id', user.id),
      supabase.from('battles').select('winner_id, is_pve').or(`attacker_id.eq.${user.id},defender_id.eq.${user.id}`),
      supabase.from('daily_rewards').select('streak').eq('user_id', user.id).single(),
      supabase.from('guild_members').select('id').eq('user_id', user.id).limit(1),
      supabase.from('player_artifacts').select('id').eq('user_id', user.id),
      supabase.from('player_quests').select('id').eq('user_id', user.id).eq('status', 'completed'),
    ]);

    setUnlockedIds(new Set((achievementsRes.data || []).map((a: any) => a.achievement_id)));

    const battles = battlesRes.data || [];
    const totalBattles = battles.filter((b: any) => b.winner_id === user.id).length;
    const pvpBattles = battles.filter((b: any) => !b.is_pve);
    const pvpWins = pvpBattles.filter((b: any) => b.winner_id === user.id).length;
    const pvpLosses = pvpBattles.filter((b: any) => b.winner_id !== user.id).length;

    const totalArmyCount = army.reduce((sum, u) => sum + u.count, 0);
    const totalSkillsCount = heroSkills.reduce((sum, s) => sum + s.skill_level, 0);

    setStats({
      heroLevel: profile.hero_level || 1,
      gold: profile.gold || 0,
      mana: profile.mana || 0,
      totalBuildings: buildings.length,
      totalArmy: totalArmyCount,
      totalSpells: spells.length,
      totalSkills: totalSkillsCount,
      pvpWins,
      pvpLosses,
      totalBattles,
      day: profile.day || 1,
      streak: streakRes.data?.streak || 0,
      guildMember: (guildRes.data || []).length > 0,
      artifactCount: (artifactsRes.data || []).length,
      questsCompleted: (questsRes.data || []).length,
    });

    setLoading(false);
  };

  const claimAchievement = async (achievementId: string) => {
    if (!user || !profile) return;
    const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!ach) return;

    setClaiming(achievementId);

    const { error } = await supabase.from('player_achievements').insert({
      user_id: user.id,
      achievement_id: achievementId,
    });

    if (error) {
      toast.error('Ошибка при получении достижения');
      setClaiming(null);
      return;
    }

    // Give rewards
    if (ach.goldReward > 0) await updateGold((profile.gold || 0) + ach.goldReward);
    if (ach.manaReward > 0) await updateMana((profile.mana || 0) + ach.manaReward);
    if (ach.expReward > 0) await updateHeroStats({ hero_experience: (profile.hero_experience || 0) + ach.expReward });

    setUnlockedIds(prev => new Set([...prev, achievementId]));
    setClaiming(null);

    const rewardParts: string[] = [];
    if (ach.goldReward > 0) rewardParts.push(`${ach.goldReward}💰`);
    if (ach.manaReward > 0) rewardParts.push(`${ach.manaReward}✨`);
    if (ach.expReward > 0) rewardParts.push(`${ach.expReward}⭐`);

    toast.success(
      <div className="flex items-center gap-2">
        <span className="text-2xl">{ach.icon}</span>
        <div>
          <p className="font-bold">Достижение: {ach.name}!</p>
          <p className="text-xs">{rewardParts.join(' ')}</p>
        </div>
      </div>
    );
  };

  if (loading || !stats) {
    return <div className="text-center text-muted-foreground text-sm py-8">Загрузка...</div>;
  }

  const totalUnlocked = unlockedIds.size;
  const totalAchievements = ACHIEVEMENTS.length;

  const categories = ['all', ...Object.keys(CATEGORY_NAMES)];

  const filtered = filter === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="font-display text-lg font-bold text-gradient-gold">Достижения</h2>
        <span className="ml-auto text-xs text-muted-foreground font-bold">
          {totalUnlocked}/{totalAchievements}
        </span>
      </div>

      {/* Progress bar */}
      <div className="rounded-full bg-secondary h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(totalUnlocked / totalAchievements) * 100}%` }}
          className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 font-display text-[10px] font-bold transition-all ${
              filter === cat
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {cat === 'all' ? 'Все' : CATEGORY_NAMES[cat]}
          </button>
        ))}
      </div>

      {/* Achievements list */}
      <div className="space-y-2">
        {filtered.map((ach, idx) => {
          const isUnlocked = unlockedIds.has(ach.id);
          const canClaim = !isUnlocked && stats && ach.condition(stats);

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`rounded-xl border p-3 flex items-center gap-3 ${
                isUnlocked
                  ? 'border-emerald/30 bg-emerald/5'
                  : canClaim
                  ? 'border-gold/40 bg-gold/5 ring-1 ring-gold/20'
                  : 'border-border bg-gradient-card opacity-60'
              }`}
            >
              <span className="text-2xl w-8 text-center">{ach.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-display text-sm font-bold truncate ${
                  isUnlocked ? 'text-emerald' : canClaim ? 'text-gold' : 'text-foreground'
                }`}>
                  {ach.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{ach.description}</p>
                <div className="flex gap-2 mt-0.5 text-[9px] text-gold/70">
                  {ach.goldReward > 0 && <span>{ach.goldReward}💰</span>}
                  {ach.manaReward > 0 && <span>{ach.manaReward}✨</span>}
                  {ach.expReward > 0 && <span>{ach.expReward}⭐</span>}
                </div>
              </div>
              {isUnlocked ? (
                <Check className="h-5 w-5 text-emerald shrink-0" />
              ) : canClaim ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => claimAchievement(ach.id)}
                  disabled={claiming === ach.id}
                  className="shrink-0 rounded-lg bg-gold/20 border border-gold/30 px-3 py-1.5 font-display text-[10px] font-bold text-gold hover:bg-gold/30 transition-colors"
                >
                  <Gift className="h-3.5 w-3.5" />
                </motion.button>
              ) : (
                <Star className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsScreen;
