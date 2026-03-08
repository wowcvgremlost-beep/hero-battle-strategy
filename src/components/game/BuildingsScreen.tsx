import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuildingsForTown, type Building } from '@/data/buildings';
import type { TownId } from '@/data/towns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Coins, Home, Info, Lock, ChevronDown, ChevronUp, Check, ShoppingCart, Ban } from 'lucide-react';

interface BuildingsScreenProps {
  townId: TownId;
}

type Tab = 'common' | 'creature';

const BuildingCard = ({ building, index, isBuilt, canBuild, gold, builtThisTurn, onBuy }: { 
  building: Building; index: number; isBuilt: boolean; canBuild: boolean; gold: number; builtThisTurn: boolean; onBuy: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const affordable = gold >= building.cost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-xl border overflow-hidden ${
        isBuilt ? 'border-emerald/40 bg-emerald/5' : 'border-border bg-gradient-card'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isBuilt ? (
              <Check className="h-3.5 w-3.5 text-emerald shrink-0" />
            ) : (
              <Home className="h-3.5 w-3.5 text-gold shrink-0" />
            )}
            <h3 className="font-display text-sm font-bold text-foreground truncate">{building.name}</h3>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-gold" />
              <span className={`text-xs font-semibold ${affordable || isBuilt ? 'text-gold' : 'text-crimson'}`}>
                {building.cost.toLocaleString()}
              </span>
            </div>
            {isBuilt && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald/20 text-emerald">
                Построено ✓
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border/50 pt-2 space-y-2">
              {building.requirements.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Lock className="h-2.5 w-2.5 text-crimson" />
                    <span className="text-[10px] font-semibold text-crimson uppercase">Требования</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {building.requirements.map((req) => (
                      <span key={req} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Info className="h-2.5 w-2.5 text-arcane" />
                  <span className="text-[10px] font-semibold text-arcane uppercase">Описание</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{building.description}</p>
              </div>
              
              {!isBuilt && canBuild && (
                builtThisTurn ? (
                  <div className="w-full rounded-lg bg-secondary p-2 font-display text-xs font-bold text-muted-foreground flex items-center justify-center gap-2">
                    <Ban className="h-3 w-3" />
                    УЖЕ СТРОИЛИ В ЭТОТ ХОД
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); onBuy(); }}
                    disabled={!affordable}
                    className="w-full rounded-lg bg-gradient-gold p-2 font-display text-xs font-bold text-primary-foreground disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    {affordable ? 'ПОСТРОИТЬ' : 'НЕ ХВАТАЕТ ЗОЛОТА'}
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BuildingsScreen = ({ townId }: BuildingsScreenProps) => {
  const { user, profile, buildings: playerBuildings, refreshBuildings, updateGold, setBuiltThisTurn } = useAuth();
  const [tab, setTab] = useState<Tab>('creature');
  const { common, creature } = getBuildingsForTown(townId);
  const [buying, setBuying] = useState(false);

  const builtIds = playerBuildings.map(b => b.building_id);
  const buildingsList = tab === 'common' ? common : creature;

  const checkRequirements = (building: Building): boolean => {
    return building.requirements.every(req => {
      const reqBuilding = [...common, ...creature].find(b => b.name === req);
      return reqBuilding && builtIds.includes(reqBuilding.id);
    });
  };

  const handleBuy = async (building: Building) => {
    if (!user || buying || !profile) return;
    if (profile.built_this_turn) {
      toast.error('Можно строить только 1 здание за ход!');
      return;
    }
    if (profile.gold < building.cost) {
      toast.error('Недостаточно золота!');
      return;
    }
    if (!checkRequirements(building)) {
      toast.error('Требования не выполнены!');
      return;
    }

    setBuying(true);
    try {
      await supabase.from('player_buildings').insert({
        user_id: user.id,
        building_id: building.id,
      });
      await updateGold(profile.gold - building.cost);
      await setBuiltThisTurn(true);
      await refreshBuildings();
      toast.success(`${building.name} построено!`);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка строительства');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('creature')}
          className={`flex-1 rounded-lg py-2 px-3 font-display text-xs font-bold transition-all ${
            tab === 'creature'
              ? 'bg-gradient-gold text-primary-foreground shadow-gold'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          СУЩЕСТВА ({creature.length})
        </button>
        <button
          onClick={() => setTab('common')}
          className={`flex-1 rounded-lg py-2 px-3 font-display text-xs font-bold transition-all ${
            tab === 'common'
              ? 'bg-gradient-gold text-primary-foreground shadow-gold'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          ОБЩИЕ ({common.length})
        </button>
      </div>

      {profile?.built_this_turn && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-2 text-center">
          <span className="text-xs text-gold font-semibold">⚠️ Вы уже построили здание в этот ход</span>
        </div>
      )}

      <div className="space-y-2">
        {buildingsList.map((b, i) => (
          <BuildingCard
            key={b.id}
            building={b}
            index={i}
            isBuilt={builtIds.includes(b.id)}
            canBuild={checkRequirements(b)}
            gold={profile?.gold || 0}
            builtThisTurn={profile?.built_this_turn || false}
            onBuy={() => handleBuy(b)}
          />
        ))}
      </div>
    </div>
  );
};

export default BuildingsScreen;
