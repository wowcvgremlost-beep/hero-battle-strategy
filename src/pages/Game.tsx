import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
import { HEROES } from '@/data/heroes';
import { getTileById, getVisibleTiles, getRandomSpawnPosition, type MapTile } from '@/data/mapTiles';
import { Shield, Swords, LogOut, Star, Building2, Users, Map, Sparkles, Coins, BookOpen, Dice6, Trash2 } from 'lucide-react';
import BuildingsScreen from '@/components/game/BuildingsScreen';
import SpellsScreen from '@/components/game/SpellsScreen';
import HeroSelection from '@/components/game/HeroSelection';
import HexMap from '@/components/game/HexMap';
import DiceRoller from '@/components/game/DiceRoller';
import BattleSystem from '@/components/game/BattleSystem';
import ArmyScreen from '@/components/game/ArmyScreen';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TownId } from '@/data/towns';

type GameTab = 'army' | 'buildings' | 'map' | 'spells';

const Game = () => {
  const { user, profile, buildings, army, spells, signOut, updateMapPosition, updateDay, updateGold, refreshProfile, refreshBuildings, refreshArmy, refreshSpells } = useAuth();
  const town = TOWNS.find((t) => t.id === profile?.town);
  const hero = HEROES.find(h => h.id === profile?.hero_id);
  const [tab, setTab] = useState<GameTab>('map');
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [battleData, setBattleData] = useState<{ monsterPower: number; monsterName: string; goldReward: number; expReward: number } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fog of war: track all revealed tile IDs (persisted in localStorage)
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(() => {
    if (!user) return new Set<number>();
    try {
      const saved = localStorage.getItem(`fog_${user.id}`);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set<number>();
  });

  // On first load or spawn, reveal tiles around current position
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

  // Random spawn on first game (position 0 means not yet placed)
  useEffect(() => {
    if (profile && profile.map_position === 0 && profile.character_created && user) {
      const spawn = getRandomSpawnPosition();
      updateMapPosition(spawn);
    }
  }, [profile?.character_created]);

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
  };

  const handleTileSelect = (tile: MapTile) => {};

  const handleMove = async (tileId: number) => {
    const tile = getTileById(tileId);
    if (!tile) return;

    await updateMapPosition(tileId);
    setDiceRoll(null);

    // Reveal new tiles
    const visible = getVisibleTiles(tileId, 4);
    setRevealedTiles(prev => {
      const next = new Set(prev);
      visible.forEach(id => next.add(id));
      if (user) localStorage.setItem(`fog_${user.id}`, JSON.stringify([...next]));
      return next;
    });

    if (tile.type === 'monster' && tile.monsterPower) {
      setBattleData({
        monsterPower: tile.monsterPower,
        monsterName: tile.name,
        goldReward: tile.goldReward || 0,
        expReward: tile.expReward || 0,
      });
    } else if ((tile.type === 'treasure' || tile.type === 'mine') && tile.goldReward) {
      const newGold = (profile?.gold || 0) + tile.goldReward;
      await updateGold(newGold);
      toast.success(`Найдено: ${tile.goldReward} золота!${tile.expReward ? ` +${tile.expReward} опыта` : ''}`);
    }
  };

  const handleEndTurn = async () => {
    if (!profile) return;
    const income = calculateDailyIncome();
    if (income > 0) {
      await updateGold((profile.gold || 0) + income);
      toast.success(`Доход: +${income} золота`);
    }
    await updateDay((profile.day || 1) + 1);
    setDiceRoll(null);
  };

  const handleDeleteCharacter = async () => {
    if (!user) return;
    // Delete all player data
    await Promise.all([
      supabase.from('player_buildings').delete().eq('user_id', user.id),
      supabase.from('player_army').delete().eq('user_id', user.id),
      supabase.from('player_spells').delete().eq('user_id', user.id),
      supabase.from('battles').delete().eq('attacker_id', user.id),
    ]);
    // Reset profile
    await supabase.from('profiles').update({
      character_created: false,
      character_name: null,
      town: null,
      hero_id: null,
      gold: 10000,
      mana: 50,
      hero_attack: 1,
      hero_defense: 1,
      hero_spellpower: 1,
      hero_knowledge: 1,
      hero_level: 1,
      hero_experience: 0,
      map_position: 0,
      day: 1,
      built_this_turn: false,
    }).eq('user_id', user.id);
    // Clear fog
    localStorage.removeItem(`fog_${user.id}`);
    setRevealedTiles(new Set());
    setShowDeleteConfirm(false);
    // Refresh
    await refreshProfile();
    await refreshBuildings();
    await refreshArmy();
    await refreshSpells();
    toast.success('Персонаж удалён. Создайте нового!');
  };

  const currentTile = getTileById(profile?.map_position || 0);

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

        <div className="flex items-center gap-4 mt-1 pb-1">
          <div className="flex items-center gap-1">
            <Swords className="h-3 w-3 text-crimson" />
            <span className="text-[10px] text-foreground">{profile?.hero_attack}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-gold" />
            <span className="text-[10px] text-foreground">{profile?.hero_defense}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-arcane" />
            <span className="text-[10px] text-foreground">{profile?.hero_spellpower}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-emerald" />
            <span className="text-[10px] text-foreground">{profile?.hero_knowledge}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-auto">День {profile?.day || 1}</span>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-destructive/30 rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
          >
            <Trash2 className="h-10 w-10 text-destructive mx-auto" />
            <h3 className="font-display text-lg font-bold text-foreground">Удалить персонажа?</h3>
            <p className="text-sm text-muted-foreground">
              Все данные будут удалены: здания, армия, заклинания, прогресс. Это действие необратимо.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl bg-secondary py-2.5 font-display text-sm font-bold text-foreground"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteCharacter}
                className="flex-1 rounded-xl bg-destructive py-2.5 font-display text-sm font-bold text-destructive-foreground"
              >
                Удалить
              </button>
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
            { id: 'spells' as GameTab, icon: Sparkles, label: 'МАГИЯ' },
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
            {currentTile && (
              <div className="rounded-xl border border-gold/20 bg-gradient-card p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Текущая позиция</p>
                <p className="font-display text-sm font-bold text-foreground">{currentTile.name}</p>
              </div>
            )}

            <HexMap diceRoll={diceRoll} onTileSelect={handleTileSelect} onMove={handleMove} revealedTiles={revealedTiles} />

            <DiceRoller onRoll={handleDiceRoll} disabled={diceRoll !== null} />

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleEndTurn}
              className="w-full rounded-xl bg-gradient-gold p-3 shadow-gold font-display text-sm font-bold text-primary-foreground flex items-center justify-center gap-2"
            >
              <Dice6 className="h-4 w-4" />
              ЗАВЕРШИТЬ ХОД (День {(profile?.day || 1) + 1})
            </motion.button>
          </motion.div>
        )}

        {tab === 'army' && town && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ArmyScreen townId={town.id as TownId} />
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
      </div>

      {battleData && (
        <BattleSystem
          monsterPower={battleData.monsterPower}
          monsterName={battleData.monsterName}
          goldReward={battleData.goldReward}
          expReward={battleData.expReward}
          onClose={() => setBattleData(null)}
          onVictory={() => setBattleData(null)}
        />
      )}
    </div>
  );
};

export default Game;
