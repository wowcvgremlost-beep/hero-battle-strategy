import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS, type TownId } from '@/data/towns';
import { TOWN_BUILDINGS } from '@/data/buildings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Swords, Shield, Heart, Zap, Coins, ShoppingCart, Lock, Info } from 'lucide-react';

interface ArmyScreenProps {
  townId: TownId;
}

const ArmyScreen = ({ townId }: ArmyScreenProps) => {
  const { user, profile, army, buildings, refreshArmy, updateGold } = useAuth();
  const town = TOWNS.find(t => t.id === townId);
  const [buying, setBuying] = useState(false);

  if (!town) return null;

  const builtBuildingIds = buildings.map(b => b.building_id);
  const townCreatureBuildings = TOWN_BUILDINGS[townId] || [];

  // Map unit level to creature building: lv1 building unlocks level 1 unit, etc.
  const isUnitUnlocked = (unitLevel: number): boolean => {
    const building = townCreatureBuildings[unitLevel - 1];
    return building ? builtBuildingIds.includes(building.id) : false;
  };

  const getUnitBuildingName = (unitLevel: number): string => {
    const building = townCreatureBuildings[unitLevel - 1];
    return building?.name || '';
  };

  const getUnitCount = (unitName: string): number => {
    return army.find(a => a.unit_name === unitName)?.count || 0;
  };

  const hireUnit = async (unitName: string, cost: number) => {
    if (!user || !profile || buying) return;
    if (profile.gold < cost) {
      toast.error('Недостаточно золота!');
      return;
    }

    setBuying(true);
    try {
      const existing = army.find(a => a.unit_name === unitName);
      if (existing) {
        await supabase.from('player_army')
          .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('unit_name', unitName);
      } else {
        await supabase.from('player_army').insert({
          user_id: user.id,
          unit_name: unitName,
          count: 1,
        });
      }

      await updateGold(profile.gold - cost);
      await refreshArmy();
      toast.success(`Нанят: ${unitName}`);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка найма');
    } finally {
      setBuying(false);
    }
  };

  const totalPower = army.reduce((sum, unit) => {
    const unitData = town.units.find(u => u.name === unit.unit_name);
    return sum + (unitData ? unit.count * unitData.value : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gold/20 bg-gradient-card p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Мощь армии</p>
          <p className="font-display text-lg font-bold text-gold">{totalPower.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Юнитов</p>
          <p className="font-display text-lg font-bold text-foreground">
            {army.reduce((s, a) => s + a.count, 0)}
          </p>
        </div>
      </div>

      <h3 className="font-display text-sm font-bold text-gold uppercase">Найм юнитов</h3>
      <div className="space-y-2">
        {town.units.map((u, i) => {
          const count = getUnitCount(u.name);
          const affordable = (profile?.gold || 0) >= u.cost;
          const unlocked = isUnitUnlocked(u.level);
          const buildingName = getUnitBuildingName(u.level);

          return (
            <motion.div
              key={u.name}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg border p-3 ${unlocked ? 'border-border bg-gradient-card' : 'border-border/50 bg-secondary/30 opacity-70'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-display text-sm font-bold text-foreground">{u.name}</h4>
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald/20 text-emerald font-bold">
                      ×{count}
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Ур. {u.level}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex items-center gap-1">
                  <Swords className="h-3 w-3 text-crimson" />
                  <span className="text-xs text-foreground">{u.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-gold" />
                  <span className="text-xs text-foreground">{u.defense}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-emerald" />
                  <span className="text-xs text-foreground">{u.health}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-arcane" />
                  <span className="text-xs text-foreground">{u.damage}</span>
                </div>
                {u.shots && (
                  <span className="text-[10px] text-muted-foreground">🎯 {u.shots}</span>
                )}
              </div>
              {u.abilities && (
                <div className="flex items-start gap-1 mb-2">
                  <Info className="h-3 w-3 text-arcane shrink-0 mt-0.5" />
                  <p className="text-[10px] text-arcane leading-tight">{u.abilities}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-gold" />
                  <span className={`text-xs font-semibold ${affordable ? 'text-gold' : 'text-crimson'}`}>
                    {u.cost.toLocaleString()} золота
                  </span>
                </div>
                {unlocked ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => hireUnit(u.name, u.cost)}
                    disabled={!affordable || buying}
                    className="rounded-lg bg-gradient-crimson px-3 py-1.5 font-display text-[10px] font-bold text-accent-foreground disabled:opacity-40 flex items-center gap-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    НАНЯТЬ
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span className="text-[10px]">Постройте: {buildingName}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ArmyScreen;
