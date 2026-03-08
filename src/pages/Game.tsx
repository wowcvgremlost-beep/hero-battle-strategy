import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS } from '@/data/towns';
import { HEROES } from '@/data/heroes';
import { getTileById, type MapTile } from '@/data/mapTiles';
import { Shield, Swords, Heart, Zap, LogOut, Star, Building2, Users, Map, Sparkles, Coins, BookOpen, Dice6 } from 'lucide-react';
import BuildingsScreen from '@/components/game/BuildingsScreen';
import SpellsScreen from '@/components/game/SpellsScreen';
import HeroSelection from '@/components/game/HeroSelection';
import HexMap from '@/components/game/HexMap';
import DiceRoller from '@/components/game/DiceRoller';
import BattleSystem from '@/components/game/BattleSystem';
import ArmyScreen from '@/components/game/ArmyScreen';
import type { TownId } from '@/data/towns';

type GameTab = 'army' | 'buildings' | 'map' | 'spells';

const Game = () => {
  const { profile, buildings, army, spells, signOut, updateMapPosition, updateDay, updateGold, refreshProfile } = useAuth();
  const town = TOWNS.find((t) => t.id === profile?.town);
  const hero = HEROES.find(h => h.id === profile?.hero_id);
  const [tab, setTab] = useState<GameTab>('map');
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [battleData, setBattleData] = useState<{ monsterPower: number; monsterName: string; goldReward: number; expReward: number } | null>(null);

  // Calculate mage guild level from built buildings
  const mageGuildLevel = buildings.some(b => b.building_id === 'mage_guild_4') ? 4
    : buildings.some(b => b.building_id === 'mage_guild_3') ? 3
    : buildings.some(b => b.building_id === 'mage_guild_2') ? 2
    : buildings.some(b => b.building_id === 'mage_guild_1') ? 1 : 0;

  // Calculate daily income from buildings
  const calculateDailyIncome = useCallback((): number => {
    const builtIds = buildings.map(b => b.building_id);
    let income = 0;
    if (builtIds.includes('capitol')) income = 4000;
    else if (builtIds.includes('municipality')) income = 2000;
    else if (builtIds.includes('prefecture')) income = 1000;
    return income;
  }, [buildings]);

  // If no hero selected, show hero selection
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

  const handleTileSelect = (tile: MapTile) => {
    // Info only
  };


  const handleMove = async (tileId: number) => {
    const tile = getTileById(tileId);
    if (!tile) return;

    await updateMapPosition(tileId);
    setDiceRoll(null);

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
      const { toast } = await import('sonner');
      toast.success(`Найдено: ${tile.goldReward} золота!${tile.expReward ? ` +${tile.expReward} опыта` : ''}`);
    }
  };

  const handleEndTurn = async () => {
    if (!profile) return;
    const income = calculateDailyIncome();
    if (income > 0) {
      await updateGold((profile.gold || 0) + income);
      const { toast } = await import('sonner');
      toast.success(`Доход: +${income} золота`);
    }
    await updateDay((profile.day || 1) + 1);
    setDiceRoll(null);
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
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hero stats bar */}
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

      {/* Content */}
      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        {/* Tab navigation */}
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

        {/* Map tab */}
        {tab === 'map' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Current location */}
            {currentTile && (
              <div className="rounded-xl border border-gold/20 bg-gradient-card p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Текущая позиция</p>
                <p className="font-display text-sm font-bold text-foreground">{currentTile.name}</p>
              </div>
            )}

            {/* Hex Map */}
            <HexMap diceRoll={diceRoll} onTileSelect={handleTileSelect} onMove={handleMove} />

            {/* Dice roller */}
            <DiceRoller onRoll={handleDiceRoll} disabled={diceRoll !== null} />

            {/* End turn */}
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

        {/* Army tab */}
        {tab === 'army' && town && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ArmyScreen townId={town.id as TownId} />
          </motion.div>
        )}

        {/* Buildings tab */}
        {tab === 'buildings' && town && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <BuildingsScreen townId={town.id as TownId} />
          </motion.div>
        )}

        {/* Spells tab */}
        {tab === 'spells' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SpellsScreen mageGuildLevel={mageGuildLevel} />
          </motion.div>
        )}
      </div>

      {/* Battle overlay */}
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
