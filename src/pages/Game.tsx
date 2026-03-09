import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
import { HEROES } from '@/data/heroes';
import { TOWN_BUILDINGS, COMMON_BUILDINGS } from '@/data/buildings';
import { getTileById, getVisibleTiles, getRandomSpawnPosition, type MapTile } from '@/data/mapTiles';
import { getCalendar, isNewWeek, formatDate, getWeekNumber } from '@/data/calendar';
import { getRandomArtifact, getArtifactById, ARTIFACT_RARITY_NAMES, type ArtifactRarity } from '@/data/artifacts';
import { getDungeonById, type Dungeon } from '@/data/dungeons';
import { Shield, Swords, LogOut, Building2, Users, Map, Sparkles, Coins, BookOpen, Dice6, Trash2, Calendar, TrendingUp, Trophy, ScrollText, Package } from 'lucide-react';
import BuildingsScreen from '@/components/game/BuildingsScreen';
import SpellsScreen from '@/components/game/SpellsScreen';
import HeroSelection from '@/components/game/HeroSelection';
import HexMap from '@/components/game/HexMap';
import DiceRoller from '@/components/game/DiceRoller';
import BattleSystem from '@/components/game/BattleSystem';
import ArmyScreen from '@/components/game/ArmyScreen';
import HeroSkillsScreen from '@/components/game/HeroSkillsScreen';
import LevelUpModal from '@/components/game/LevelUpModal';
import Leaderboard from '@/components/game/Leaderboard';
import PvPBattle from '@/components/game/PvPBattle';
import QuestScreen from '@/components/game/QuestScreen';
import EquipmentScreen from '@/components/game/EquipmentScreen';
import DungeonScreen from '@/components/game/DungeonScreen';
import { expForLevel, getRandomSkillChoices, SKILLS, getSkillBonuses } from '@/data/skills';
import { getScaledMonsterPower, getScaledRewards } from '@/data/quests';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TownId } from '@/data/towns';

type GameTab = 'army' | 'buildings' | 'map' | 'spells' | 'skills' | 'leaderboard' | 'quests' | 'equipment';

// Calculate weekly growth for a unit based on buildings
function calculateGrowth(baseGrowth: number, hasCitadel: boolean, hasCastle: boolean): number {
  let growth = baseGrowth;
  if (hasCastle) {
    growth = baseGrowth * 2; // +100% from base
  } else if (hasCitadel) {
    growth = baseGrowth + Math.floor(baseGrowth * 0.5); // +50%
  }
  return growth;
}

const Game = () => {
  const { user, profile, buildings, army, spells, heroSkills, signOut, updateMapPosition, updateDay, updateGold, updateMana, updateHeroStats, refreshProfile, refreshBuildings, refreshArmy, refreshSpells, refreshHeroSkills } = useAuth();
  const town = TOWNS.find((t) => t.id === profile?.town);
  const hero = HEROES.find(h => h.id === profile?.hero_id);
  const [tab, setTab] = useState<GameTab>('map');
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [diceUsed, setDiceUsed] = useState(false);
  const [battleData, setBattleData] = useState<{ monsterPower: number; monsterName: string; goldReward: number; expReward: number } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [levelUpPending, setLevelUpPending] = useState(false);
  const [pvpTarget, setPvpTarget] = useState<{
    user_id: string; character_name: string | null; town: string | null;
    hero_level: number; hero_attack: number; hero_defense: number;
    hero_spellpower: number; gold: number;
  } | null>(null);

  // Convert heroSkills array to a map
  const skillsMap: Record<string, number> = {};
  heroSkills.forEach(s => { skillsMap[s.skill_id] = s.skill_level; });
  const skillBonuses = getSkillBonuses(skillsMap);

  // Creature pool: how many of each unit are available to hire this week
  // Stored in localStorage, reset each week
  const [creaturePool, setCreaturePool] = useState<Record<string, number>>(() => {
    if (!user) return {};
    try {
      const saved = localStorage.getItem(`pool_${user.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [poolWeek, setPoolWeek] = useState<number>(() => {
    if (!user) return 0;
    try {
      const saved = localStorage.getItem(`poolWeek_${user.id}`);
      if (saved) return parseInt(saved);
    } catch {}
    return 0;
  });

  // Fog of war
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(() => {
    if (!user) return new Set<number>();
    try {
      const saved = localStorage.getItem(`fog_${user.id}`);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set<number>();
  });

  // Reveal tiles around current position
  useEffect(() => {
    if (profile?.map_position !== undefined) {
      const visible = getVisibleTiles(profile.map_position, 4);
      setRevealedTiles(prev => {
        const next = new Set(prev);
        visible.forEach(id => next.add(id));
        if (next.size !== prev.size) {
          if (user) localStorage.setItem(`fog_${user.id}`, JSON.stringify([...next]));
          return next;
        }
        return prev;
      });
    }
  }, [profile?.map_position, user]);

  // Random spawn
  useEffect(() => {
    if (profile && profile.map_position === 0 && profile.character_created && user) {
      const spawn = getRandomSpawnPosition();
      updateMapPosition(spawn);
    }
  }, [profile?.character_created]);

  // Refresh creature pool on new week
  useEffect(() => {
    if (!profile || !town || !user) return;
    const currentWeek = getWeekNumber(profile.day || 1);
    if (currentWeek !== poolWeek) {
      refreshCreaturePool(currentWeek);
    }
  }, [profile?.day, town, buildings, user]);

  const refreshCreaturePool = (week: number) => {
    if (!town || !user) return;
    const builtIds = buildings.map(b => b.building_id);
    const hasCitadel = builtIds.includes('citadel');
    const hasCastle = builtIds.includes('castle_building');
    const hasFort = builtIds.includes('fort');
    const townCreatureBuildings = TOWN_BUILDINGS[town.id as TownId] || [];

    const newPool: Record<string, number> = {};
    
    if (hasFort) {
      town.units.forEach((unit, idx) => {
        const building = townCreatureBuildings[idx];
        if (building && builtIds.includes(building.id)) {
          const growth = calculateGrowth(unit.growth, hasCitadel, hasCastle);
          // Add to existing pool (accumulate if not bought)
          const existing = poolWeek === 0 ? 0 : (creaturePool[unit.name] || 0);
          newPool[unit.name] = existing + growth;
        }
      });
    }

    setCreaturePool(newPool);
    setPoolWeek(week);
    localStorage.setItem(`pool_${user.id}`, JSON.stringify(newPool));
    localStorage.setItem(`poolWeek_${user.id}`, String(week));
  };

  const decrementPool = (unitName: string, amount: number = 1) => {
    if (!user) return;
    setCreaturePool(prev => {
      const next = { ...prev, [unitName]: Math.max(0, (prev[unitName] || 0) - amount) };
      localStorage.setItem(`pool_${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const mageGuildLevel = buildings.some(b => b.building_id === 'mage_guild_4') ? 4
    : buildings.some(b => b.building_id === 'mage_guild_3') ? 3
    : buildings.some(b => b.building_id === 'mage_guild_2') ? 2
    : buildings.some(b => b.building_id === 'mage_guild_1') ? 1 : 0;

  const calculateDailyIncome = useCallback((): number => {
    const builtIds = buildings.map(b => b.building_id);
    let income = 0;
    if (builtIds.includes('capitol')) income = 4000;
    else if (builtIds.includes('municipality')) income = 2000;
    else if (builtIds.includes('prefecture')) income = 1000;
    return income;
  }, [buildings]);

  // Check for pending level-up
  useEffect(() => {
    if (profile) {
      const needed = expForLevel(profile.hero_level || 1);
      if ((profile.hero_experience || 0) >= needed) {
        setLevelUpPending(true);
      }
    }
  }, [profile?.hero_experience, profile?.hero_level]);

  if (!profile?.hero_id && town) {
    return (
      <div className="min-h-screen bg-gradient-dark px-4 py-8">
        <div className="max-w-lg mx-auto">
          <HeroSelection townId={town.id as TownId} onSelect={refreshProfile} />
        </div>
      </div>
    );
  }

  const handleDiceRoll = (value: number) => {
    setDiceRoll(value);
    setDiceUsed(true);
  };

  const handleTileSelect = (tile: MapTile) => {};

  // Quest progress helper
  const updateQuestProgress = async (type: string, increment: number = 1) => {
    if (!user) return;
    const { data: activeQuests } = await supabase
      .from('player_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    if (!activeQuests) return;

    // Map quest types to quest IDs
    const typeToQuestIds: Record<string, string[]> = {
      kill: ['kill_goblins', 'kill_strong', 'kill_bosses'],
      explore: ['explore_tiles', 'explore_far', 'explore_world'],
      build: ['build_first', 'build_many'],
      hire: ['hire_army', 'hire_legion', 'hire_horde'],
      collect_gold: ['collect_gold_1', 'collect_gold_2', 'collect_gold_3'],
    };

    const relevantIds = typeToQuestIds[type] || [];
    for (const quest of activeQuests) {
      if (relevantIds.includes(quest.quest_id)) {
        const newProgress = type === 'collect_gold' 
          ? increment // absolute value for gold
          : (quest as any).progress + increment;
        await supabase.from('player_quests')
          .update({ progress: Math.min(newProgress, (quest as any).target) })
          .eq('id', (quest as any).id);
      }
    }
  };

  const weekNumber = getWeekNumber(profile?.day || 1);

  const handleMove = async (tileId: number) => {
    const tile = getTileById(tileId);
    if (!tile) return;

    await updateMapPosition(tileId);
    setDiceRoll(null);

    const visible = getVisibleTiles(tileId, 4);
    setRevealedTiles(prev => {
      const next = new Set(prev);
      visible.forEach(id => next.add(id));
      if (user) localStorage.setItem(`fog_${user.id}`, JSON.stringify([...next]));
      return next;
    });

    // Track exploration progress
    updateQuestProgress('explore', revealedTiles.size);

    if (tile.type === 'monster' && tile.monsterPower) {
      const scaledPower = getScaledMonsterPower(tile.monsterPower, weekNumber);
      const { gold, exp } = getScaledRewards(tile.goldReward || 0, tile.expReward || 0, weekNumber);
      setBattleData({
        monsterPower: scaledPower,
        monsterName: `${tile.name} (Нед.${weekNumber})`,
        goldReward: gold,
        expReward: exp,
      });
    } else if (tile.type === 'npc') {
      toast.info(`📜 ${tile.name} — откройте вкладку КВЕСТЫ для задания`);
    } else if (tile.type === 'artifact' && tile.artifactRarity) {
      // Handle artifact discovery
      await handleArtifactDiscovery(tile.artifactRarity, tile.name);
    } else if ((tile.type === 'treasure' || tile.type === 'mine') && tile.goldReward) {
      const newGold = (profile?.gold || 0) + tile.goldReward;
      await updateGold(newGold);
      updateQuestProgress('collect_gold', newGold);
      toast.success(`Найдено: ${tile.goldReward} золота!${tile.expReward ? ` +${tile.expReward} опыта` : ''}`);
    }
  };

  const handleArtifactDiscovery = async (rarity: ArtifactRarity, tileName: string) => {
    if (!user) return;
    
    // Check if already collected this artifact location
    const collectedKey = `artifact_collected_${profile?.map_position}`;
    const alreadyCollected = localStorage.getItem(`${collectedKey}_${user.id}`);
    if (alreadyCollected) {
      toast.info(`${tileName} уже обыскан`);
      return;
    }

    const artifact = getRandomArtifact(rarity);
    
    // Add to player's inventory
    await supabase.from('player_artifacts').insert({
      user_id: user.id,
      artifact_id: artifact.id,
      slot: artifact.slot,
      is_equipped: false,
    });

    // Mark as collected
    localStorage.setItem(`${collectedKey}_${user.id}`, 'true');

    toast.success(
      <div className="flex items-center gap-2">
        <span className="text-2xl">{artifact.icon}</span>
        <div>
          <p className="font-bold">Найден артефакт!</p>
          <p className="text-xs">{artifact.name} ({ARTIFACT_RARITY_NAMES[artifact.rarity]})</p>
        </div>
      </div>
    );
  };

  const handleEndTurn = async () => {
    if (!profile) return;
    const newDay = (profile.day || 1) + 1;
    const income = calculateDailyIncome();
    if (income > 0) {
      await updateGold((profile.gold || 0) + income);
      toast.success(`Доход: +${income} золота`);
    }
    
    // Check if new week starts
    if (isNewWeek(newDay)) {
      toast.info('🗓️ Новая неделя! Существа пополнены.');
    }

    await updateDay(newDay);
    setDiceRoll(null);
    setDiceUsed(false); // reset dice for next turn
  };

  const handleDeleteCharacter = async () => {
    if (!user) return;
    await Promise.all([
      supabase.from('player_buildings').delete().eq('user_id', user.id),
      supabase.from('player_army').delete().eq('user_id', user.id),
      supabase.from('player_spells').delete().eq('user_id', user.id),
      supabase.from('battles').delete().eq('attacker_id', user.id),
      supabase.from('hero_skills').delete().eq('user_id', user.id),
      supabase.from('player_quests').delete().eq('user_id', user.id),
      supabase.from('player_artifacts').delete().eq('user_id', user.id),
    ]);
    await supabase.from('profiles').update({
      character_created: false, character_name: null, town: null, hero_id: null,
      gold: 10000, mana: 50, hero_attack: 1, hero_defense: 1, hero_spellpower: 1,
      hero_knowledge: 1, hero_level: 1, hero_experience: 0, map_position: 0,
      day: 1, built_this_turn: false,
    }).eq('user_id', user.id);
    localStorage.removeItem(`fog_${user.id}`);
    localStorage.removeItem(`pool_${user.id}`);
    localStorage.removeItem(`poolWeek_${user.id}`);
    setRevealedTiles(new Set());
    setCreaturePool({});
    setPoolWeek(0);
    setShowDeleteConfirm(false);
    await refreshProfile();
    await refreshBuildings();
    await refreshArmy();
    await refreshSpells();
    await refreshHeroSkills();
    toast.success('Персонаж удалён. Создайте нового!');
  };




  const handleLevelUpChoice = async (skillId: string) => {
    if (!user || !profile) return;
    const needed = expForLevel(profile.hero_level);
    const newLevel = profile.hero_level + 1;
    const leftoverExp = (profile.hero_experience || 0) - needed;

    // Upsert skill
    const currentLevel = skillsMap[skillId] || 0;
    await supabase.from('hero_skills').upsert({
      user_id: user.id,
      skill_id: skillId,
      skill_level: currentLevel + 1,
    }, { onConflict: 'user_id,skill_id' });

    // Apply wisdom mana bonus if wisdom was chosen
    const statsUpdate: any = {
      hero_level: newLevel,
      hero_experience: Math.max(0, leftoverExp),
    };

    if (skillId === 'wisdom') {
      // +10 mana per wisdom level
      const newMana = (profile.mana || 50) + 10;
      await updateMana(newMana);
      toast.info(`📖 Мудрость повышена! +10 маны (всего: ${newMana})`);
    }

    await updateHeroStats(statsUpdate);

    await refreshHeroSkills();
    setLevelUpPending(false);
    toast.success(`Уровень ${newLevel}! ${SKILLS.find(s => s.id === skillId)?.name || skillId} улучшен!`);
  };

  const currentTile = getTileById(profile?.map_position || 0);
  const calendar = getCalendar(profile?.day || 1);
  const hasFort = buildings.some(b => b.building_id === 'fort');

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-gold/10 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hero && <span className="text-lg">{hero.portrait}</span>}
            <div>
              <span className="font-display text-sm font-bold text-foreground">{profile?.character_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{town?.name}</span>
                <span className="text-[10px] text-gold">Ур. {profile?.hero_level}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-gold" />
              <span className="text-xs font-bold text-gold">{(profile?.gold || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-arcane" />
              <span className="text-xs font-bold text-arcane">{profile?.mana || 0}</span>
            </div>
            <button onClick={() => setShowDeleteConfirm(true)} className="text-muted-foreground hover:text-destructive transition-colors" title="Удалить персонажа">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats + calendar */}
        <div className="flex items-center gap-3 mt-1 pb-1">
          <div className="flex items-center gap-1">
            <Swords className="h-3 w-3 text-crimson" />
            <span className="text-[10px] text-foreground">
              {profile?.hero_attack}
              {skillBonuses.bonusAttack > 0 && <span className="text-emerald">+{skillBonuses.bonusAttack}</span>}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-gold" />
            <span className="text-[10px] text-foreground">
              {profile?.hero_defense}
              {skillBonuses.bonusDefense > 0 && <span className="text-emerald">+{skillBonuses.bonusDefense}</span>}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-arcane" />
            <span className="text-[10px] text-foreground">
              {profile?.hero_spellpower}
              {skillBonuses.bonusSpellpower > 0 && <span className="text-emerald">+{skillBonuses.bonusSpellpower}</span>}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-emerald" />
            <span className="text-[10px] text-foreground">{profile?.hero_knowledge}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{calendar.dayName.slice(0,2)}, Нед.{calendar.weekInMonth}, {calendar.monthName.slice(0,3)}</span>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-destructive/30 rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
          >
            <Trash2 className="h-10 w-10 text-destructive mx-auto" />
            <h3 className="font-display text-lg font-bold text-foreground">Удалить персонажа?</h3>
            <p className="text-sm text-muted-foreground">Все данные будут удалены. Это действие необратимо.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl bg-secondary py-2.5 font-display text-sm font-bold text-foreground">Отмена</button>
              <button onClick={handleDeleteCharacter} className="flex-1 rounded-xl bg-destructive py-2.5 font-display text-sm font-bold text-destructive-foreground">Удалить</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        <div className="flex gap-1 mb-4">
          {([
            { id: 'map' as GameTab, icon: Map, label: 'КАРТА' },
            { id: 'army' as GameTab, icon: Users, label: 'АРМИЯ' },
            { id: 'buildings' as GameTab, icon: Building2, label: 'ГОРОД' },
            { id: 'equipment' as GameTab, icon: Package, label: 'СНАРЯ' },
            { id: 'spells' as GameTab, icon: Sparkles, label: 'МАГИЯ' },
            { id: 'skills' as GameTab, icon: TrendingUp, label: 'НАВЫКИ' },
            { id: 'quests' as GameTab, icon: ScrollText, label: 'КВЕСТЫ' },
            { id: 'leaderboard' as GameTab, icon: Trophy, label: 'ТОП' },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2.5 font-display text-[10px] font-bold transition-all ${
                tab === t.id
                  ? 'bg-gradient-crimson text-accent-foreground shadow-crimson'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'map' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Calendar display */}
            <div className="rounded-xl border border-border bg-gradient-card p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Дата</p>
                <p className="font-display text-xs font-bold text-foreground">{formatDate(profile?.day || 1)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase">День</p>
                <p className="font-display text-lg font-bold text-gold">{profile?.day || 1}</p>
              </div>
            </div>

            {currentTile && (
              <div className="rounded-xl border border-gold/20 bg-gradient-card p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Текущая позиция</p>
                <p className="font-display text-sm font-bold text-foreground">{currentTile.name}</p>
              </div>
            )}

            <HexMap diceRoll={diceRoll} onTileSelect={handleTileSelect} onMove={handleMove} revealedTiles={revealedTiles} onAttackPlayer={(p) => setPvpTarget(p)} />

            {/* Dice - disabled if already used this turn */}
            <DiceRoller onRoll={handleDiceRoll} disabled={diceUsed} logisticsBonus={skillBonuses.bonusMove} />
            {diceUsed && !diceRoll && (
              <p className="text-center text-[10px] text-muted-foreground">Вы уже бросали кубик в этот ход</p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleEndTurn}
              className="w-full rounded-xl bg-gradient-gold p-3 shadow-gold font-display text-sm font-bold text-primary-foreground flex items-center justify-center gap-2"
            >
              <Dice6 className="h-4 w-4" />
              ЗАВЕРШИТЬ ХОД
            </motion.button>
          </motion.div>
        )}

        {tab === 'army' && town && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ArmyScreen townId={town.id as TownId} creaturePool={creaturePool} onHire={decrementPool} hasFort={hasFort} />
          </motion.div>
        )}

        {tab === 'buildings' && town && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <BuildingsScreen townId={town.id as TownId} />
          </motion.div>
        )}

        {tab === 'spells' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SpellsScreen mageGuildLevel={mageGuildLevel} />
          </motion.div>
        )}

        {tab === 'skills' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HeroSkillsScreen heroSkills={skillsMap} />
          </motion.div>
        )}

        {tab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Leaderboard />
          </motion.div>
        )}

        {tab === 'quests' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <QuestScreen />
          </motion.div>
        )}

        {tab === 'equipment' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <EquipmentScreen />
          </motion.div>
        )}
      </div>

      {levelUpPending && (
        <LevelUpModal
          level={(profile?.hero_level || 1) + 1}
          choices={getRandomSkillChoices(skillsMap)}
          currentSkills={skillsMap}
          onChoose={handleLevelUpChoice}
        />
      )}

      {battleData && (
        <BattleSystem
          monsterPower={battleData.monsterPower}
          monsterName={battleData.monsterName}
          goldReward={battleData.goldReward}
          expReward={battleData.expReward}
          onClose={() => setBattleData(null)}
          onVictory={() => {
            updateQuestProgress('kill');
            setBattleData(null);
          }}
        />
      )}

      {pvpTarget && (
        <PvPBattle
          target={pvpTarget}
          onClose={() => setPvpTarget(null)}
        />
      )}
    </div>
  );
};

export default Game;
