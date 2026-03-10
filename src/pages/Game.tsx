import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
import { HEROES } from '@/data/heroes';
import { TOWN_BUILDINGS, COMMON_BUILDINGS } from '@/data/buildings';
import { getCalendar, isNewWeek, getWeekNumber } from '@/data/calendar';
import { getArtifactById } from '@/data/artifacts';
import { Shield, Swords, LogOut, Building2, Users, Sparkles, Coins, BookOpen, Trash2, TrendingUp, Trophy, ScrollText, Package, Store, Flame, Award, CalendarDays, ArrowLeftRight, Castle, Map } from 'lucide-react';
import HexMap from '@/components/game/HexMap';
import { getTileAt, type MapTile } from '@/data/mapTiles';
import DiceRoller from '@/components/game/DiceRoller';
import BuildingsScreen from '@/components/game/BuildingsScreen';
import SpellsScreen from '@/components/game/SpellsScreen';
import HeroSelection from '@/components/game/HeroSelection';
import TowerView from '@/components/game/TowerView';
import ArmyScreen from '@/components/game/ArmyScreen';
import HeroSkillsScreen from '@/components/game/HeroSkillsScreen';
import LevelUpModal from '@/components/game/LevelUpModal';
import Leaderboard from '@/components/game/Leaderboard';
import QuestScreen from '@/components/game/QuestScreen';
import EquipmentScreen from '@/components/game/EquipmentScreen';
import TradeScreen from '@/components/game/TradeScreen';
import PlayerMarketplace from '@/components/game/PlayerMarketplace';
import GuildScreen from '@/components/game/GuildScreen';
import PvPArena from '@/components/game/PvPArena';
import DailyReward from '@/components/game/DailyReward';
import AchievementsScreen from '@/components/game/AchievementsScreen';
import EventsScreen from '@/components/game/EventsScreen';
import { expForLevel, getRandomSkillChoices, SKILLS, getSkillBonuses, BASE_ARMY_CAPACITY } from '@/data/skills';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TownId } from '@/data/towns';

type GameTab = 'map' | 'tower' | 'army' | 'buildings' | 'spells' | 'skills' | 'leaderboard' | 'quests' | 'equipment' | 'trade' | 'market' | 'guild' | 'pvp' | 'achievements' | 'events';

function calculateGrowth(baseGrowth: number, hasCitadel: boolean, hasCastle: boolean): number {
  let growth = baseGrowth;
  if (hasCastle) growth = baseGrowth * 2;
  else if (hasCitadel) growth = baseGrowth + Math.floor(baseGrowth * 0.5);
  return growth;
}

const Game = () => {
  const navigate = useNavigate();
  const { user, profile, buildings, army, spells, heroSkills, signOut, updateGold, updateMana, updateHeroStats, refreshProfile, refreshBuildings, refreshArmy, refreshSpells, refreshHeroSkills } = useAuth();
  const town = TOWNS.find((t) => t.id === profile?.town);
  const hero = HEROES.find(h => h.id === profile?.hero_id);
  const [tab, setTab] = useState<GameTab>('map');
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(() => {
    if (!user) return new Set();
    try { const s = localStorage.getItem(`revealed_${user.id}`); if (s) return new Set(JSON.parse(s)); } catch {}
    return new Set();
  });
  const [defeatedTiles, setDefeatedTiles] = useState<Set<string>>(() => {
    if (!user) return new Set();
    try { const s = localStorage.getItem(`defeated_${user.id}`); if (s) return new Set(JSON.parse(s)); } catch {}
    return new Set();
  });

  // Reveal tiles around player on load and movement
  useEffect(() => {
    if (!profile || !user) return;
    const pr = profile.map_row || 0;
    const pc = profile.map_col || 0;
    setRevealedTiles(prev => {
      const next = new Set(prev);
      // Reveal in radius 4
      const queue = [{ r: pr, c: pc }];
      const visited = new Set<string>();
      visited.add(`${pr},${pc}`);
      next.add(`${pr},${pc}`);
      for (let step = 0; step < 4; step++) {
        const frontier: { r: number; c: number }[] = [];
        for (const p of queue) {
          const isUp = (p.r + p.c) % 2 === 0;
          const neighbors = [
            { r: p.r, c: p.c - 1 }, { r: p.r, c: p.c + 1 },
            isUp ? { r: p.r + 1, c: p.c } : { r: p.r - 1, c: p.c },
          ];
          for (const n of neighbors) {
            const k = `${n.r},${n.c}`;
            if (!visited.has(k)) { visited.add(k); next.add(k); frontier.push(n); }
          }
        }
        queue.length = 0;
        queue.push(...frontier);
      }
      localStorage.setItem(`revealed_${user.id}`, JSON.stringify([...next]));
      return next;
    });
  }, [profile?.map_row, profile?.map_col, user]);

  const handleMapMove = useCallback(async (row: number, col: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ map_row: row, map_col: col }).eq('user_id', user.id);
    setDiceRoll(null);
    await refreshProfile();
  }, [user, refreshProfile]);

  const handleTileSelect = useCallback((tile: MapTile) => {
    if (tile.category === 'combat' && !defeatedTiles.has(`${tile.row},${tile.col}`)) {
      toast.info(`${tile.name} — Сила: ${tile.monsterPower || '?'}`);
    } else if (tile.goldReward) {
      toast.info(`${tile.name} — 💰${tile.goldReward}`);
    }
  }, [defeatedTiles]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [levelUpPending, setLevelUpPending] = useState(false);
  const [questLeadershipBonus, setQuestLeadershipBonus] = useState<number>(() => {
    if (!user) return 0;
    try { const s = localStorage.getItem(`leadership_bonus_${user.id}`); if (s) return parseInt(s); } catch {}
    return 0;
  });
  const [equippedArtifacts, setEquippedArtifacts] = useState<any[]>([]);

  const skillsMap: Record<string, number> = {};
  heroSkills.forEach(s => { skillsMap[s.skill_id] = s.skill_level; });
  const skillBonuses = getSkillBonuses(skillsMap);

  // Fetch equipped artifacts for leadership bonus
  useEffect(() => {
    if (!user) return;
    supabase.from('player_artifacts').select('artifact_id').eq('user_id', user.id).eq('is_equipped', true)
      .then(({ data }) => setEquippedArtifacts(data || []));
  }, [user]);

  const artifactLeadershipBonus = equippedArtifacts.reduce((sum, a) => {
    const art = getArtifactById(a.artifact_id);
    return sum + (art?.bonuses.leadership || 0);
  }, 0);

  const totalArmyCapacity = skillBonuses.armyCapacity + artifactLeadershipBonus + questLeadershipBonus;

  const [creaturePool, setCreaturePool] = useState<Record<string, number>>(() => {
    if (!user) return {};
    try { const s = localStorage.getItem(`pool_${user.id}`); if (s) return JSON.parse(s); } catch {}
    return {};
  });
  const [poolWeek, setPoolWeek] = useState<number>(() => {
    if (!user) return 0;
    try { const s = localStorage.getItem(`poolWeek_${user.id}`); if (s) return parseInt(s); } catch {}
    return 0;
  });

  // Refresh creature pool on new week
  useEffect(() => {
    if (!profile || !town || !user) return;
    const currentWeek = getWeekNumber(profile.day || 1);
    if (currentWeek !== poolWeek) refreshCreaturePool(currentWeek);
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

  useEffect(() => {
    if (profile) {
      const needed = expForLevel(profile.hero_level || 1);
      if ((profile.hero_experience || 0) >= needed) setLevelUpPending(true);
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
      supabase.from('tower_kills').delete().eq('user_id', user.id),
      supabase.from('tower_progress').delete().eq('user_id', user.id),
    ]);
    await supabase.from('profiles').update({
      character_created: false, character_name: null, town: null, hero_id: null,
      gold: 10000, mana: 50, hero_attack: 1, hero_defense: 1, hero_spellpower: 1,
      hero_knowledge: 1, hero_level: 1, hero_experience: 0, map_position: 0,
      map_row: 0, map_col: 0, day: 1, built_this_turn: false,
    }).eq('user_id', user.id);
    localStorage.removeItem(`pool_${user.id}`);
    localStorage.removeItem(`poolWeek_${user.id}`);
    localStorage.removeItem(`leadership_bonus_${user.id}`);
    setCreaturePool({});
    setPoolWeek(0);
    setQuestLeadershipBonus(0);
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
    const currentLevel = skillsMap[skillId] || 0;
    await supabase.from('hero_skills').upsert({
      user_id: user.id, skill_id: skillId, skill_level: currentLevel + 1,
    }, { onConflict: 'user_id,skill_id' });
    const statsUpdate: any = { hero_level: newLevel, hero_experience: Math.max(0, leftoverExp) };
    if (skillId === 'wisdom') {
      const newMana = (profile.mana || 50) + 10;
      await updateMana(newMana);
      toast.info(`📖 Мудрость повышена! +10 маны (всего: ${newMana})`);
    }
    await updateHeroStats(statsUpdate);
    await refreshHeroSkills();
    setLevelUpPending(false);
    toast.success(`Уровень ${newLevel}! ${SKILLS.find(s => s.id === skillId)?.name || skillId} улучшен!`);
  };

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
            <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-gold transition-colors" title="Главное меню">
              <LogOut className="h-4 w-4" />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="text-muted-foreground hover:text-destructive transition-colors" title="Удалить персонажа">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

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
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-destructive/30 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
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

      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        <div className="space-y-1 mb-4">
          {[
            [
              { id: 'map' as GameTab, icon: Map, label: 'КАРТА' },
              { id: 'tower' as GameTab, icon: Castle, label: 'БАШНЯ' },
              { id: 'army' as GameTab, icon: Users, label: 'АРМИЯ' },
              { id: 'buildings' as GameTab, icon: Building2, label: 'ГОРОД' },
              { id: 'equipment' as GameTab, icon: Package, label: 'СНАРЯ' },
            ],
            [
              { id: 'skills' as GameTab, icon: TrendingUp, label: 'НАВЫКИ' },
              { id: 'quests' as GameTab, icon: ScrollText, label: 'КВЕСТЫ' },
              { id: 'trade' as GameTab, icon: Store, label: 'ЛАВКА' },
              { id: 'market' as GameTab, icon: ArrowLeftRight, label: 'РЫНОК' },
              { id: 'pvp' as GameTab, icon: Flame, label: 'PVP' },
            ],
            [
              { id: 'guild' as GameTab, icon: Shield, label: 'ГИЛЬД' },
              { id: 'achievements' as GameTab, icon: Award, label: 'ДОСТ' },
              { id: 'events' as GameTab, icon: CalendarDays, label: 'ИВЕНТ' },
              { id: 'leaderboard' as GameTab, icon: Trophy, label: 'ТОП' },
            ],
          ].map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {row.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2.5 font-display text-[10px] font-bold transition-all ${
                    tab === t.id ? 'bg-gradient-crimson text-accent-foreground shadow-crimson' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}>
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {tab === 'map' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <DiceRoller onRoll={(val) => setDiceRoll(val)} disabled={!!diceRoll} />
            <HexMap
              diceRoll={diceRoll}
              onTileSelect={handleTileSelect}
              onMove={handleMapMove}
              revealedTiles={revealedTiles}
              playerRow={profile?.map_row || 0}
              playerCol={profile?.map_col || 0}
              defeatedTiles={defeatedTiles}
            />
          </motion.div>
        )}

        {tab === 'tower' && (
          <TowerView />
        )}

        {tab === 'army' && town && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ArmyScreen townId={town.id as TownId} creaturePool={creaturePool} onHire={decrementPool} hasFort={hasFort} armyCapacity={totalArmyCapacity} />
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
            <QuestScreen onLeadershipReward={(amount) => {
              setQuestLeadershipBonus(prev => {
                const next = prev + amount;
                if (user) localStorage.setItem(`leadership_bonus_${user.id}`, String(next));
                return next;
              });
            }} />
          </motion.div>
        )}
        {tab === 'equipment' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <EquipmentScreen />
          </motion.div>
        )}
        {tab === 'trade' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <TradeScreen />
          </motion.div>
        )}
        {tab === 'market' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PlayerMarketplace />
          </motion.div>
        )}
        {tab === 'pvp' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PvPArena />
          </motion.div>
        )}
        {tab === 'guild' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GuildScreen />
          </motion.div>
        )}
        {tab === 'achievements' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AchievementsScreen />
          </motion.div>
        )}
        {tab === 'events' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <EventsScreen />
          </motion.div>
        )}
      </div>

      {levelUpPending && (
        <LevelUpModal level={(profile?.hero_level || 1) + 1} choices={getRandomSkillChoices(skillsMap)} currentSkills={skillsMap} onChoose={handleLevelUpChoice} />
      )}

      <DailyReward />
    </div>
  );
};

export default Game;
