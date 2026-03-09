import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS, type TownId } from '@/data/towns';
import { TOWN_BUILDINGS } from '@/data/buildings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Swords, Shield, Heart, Zap, Coins, ShoppingCart, Lock, Info, Ban, Minus, Plus } from 'lucide-react';

interface ArmyScreenProps {
  townId: TownId;
  creaturePool: Record<string, number>;
  onHire: (unitName: string, amount?: number) => void;
  hasFort: boolean;
  armyCapacity: number;
}

const ArmyScreen = ({ townId, creaturePool, onHire, hasFort, armyCapacity }: ArmyScreenProps) => {
  const { user, profile, army, buildings, refreshArmy, updateGold } = useAuth();
  const town = TOWNS.find(t => t.id === townId);
  const [buying, setBuying] = useState(false);
  const [hireAmounts, setHireAmounts] = useState<Record<string, number>>({});

  if (!town) return null;

  if (!hasFort) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gold/20 bg-gradient-card p-6 text-center space-y-3">
          <Ban className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-display text-sm font-bold text-foreground">Форт не построен</h3>
          <p className="text-xs text-muted-foreground">Постройте Форт в разделе «Город» → «Общие», чтобы нанимать существ и видеть их прирост.</p>
        </div>
      </div>
    );
  }

  const builtBuildingIds = buildings.map(b => b.building_id);
  const townCreatureBuildings = TOWN_BUILDINGS[townId] || [];

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

  const getAvailable = (unitName: string): number => {
    return creaturePool[unitName] || 0;
  };

  const getHireAmount = (unitName: string): number => {
    return hireAmounts[unitName] || 1;
  };

  const setHireAmount = (unitName: string, val: number) => {
    setHireAmounts(prev => ({ ...prev, [unitName]: val }));
  };

  const handleHireAmountChange = (unitName: string, input: string) => {
    const num = parseInt(input);
    if (isNaN(num) || num < 0) {
      setHireAmount(unitName, 0);
      return;
    }
    const available = getAvailable(unitName);
    setHireAmount(unitName, Math.min(num, available));
  };

  const hireUnit = async (unitName: string, costPerUnit: number, amount: number) => {
    if (!user || !profile || buying || amount <= 0) return;
    const totalUnits = army.reduce((s, a) => s + a.count, 0);
    const capacityLeft = armyCapacity - totalUnits;
    if (capacityLeft <= 0) {
      toast.error('Армия переполнена! Повысьте Лидерство.');
      return;
    }
    const available = getAvailable(unitName);
    const actualAmount = Math.min(amount, available, capacityLeft);
    if (actualAmount <= 0) {
      toast.error('Нет доступных существ!');
      return;
    }
    const totalCost = costPerUnit * actualAmount;
    if (profile.gold < totalCost) {
      toast.error('Недостаточно золота!');
      return;
    }

    setBuying(true);
    try {
      const existing = army.find(a => a.unit_name === unitName);
      if (existing) {
        await supabase.from('player_army')
          .update({ count: existing.count + actualAmount, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('unit_name', unitName);
      } else {
        await supabase.from('player_army').insert({
          user_id: user.id,
          unit_name: unitName,
          count: actualAmount,
        });
      }

      await updateGold(profile.gold - totalCost);
      onHire(unitName, actualAmount);
      await refreshArmy();
      setHireAmount(unitName, 1);
      toast.success(`Нанято: ${actualAmount}x ${unitName} (${totalCost.toLocaleString()} золота)`);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка найма');
    } finally {
      setBuying(false);
    }
  };

  const hireAll = async (unitName: string, costPerUnit: number) => {
    const available = getAvailable(unitName);
    if (!profile || available <= 0) return;
    const maxAffordable = Math.floor(profile.gold / costPerUnit);
    const amount = Math.min(available, maxAffordable);
    if (amount <= 0) {
      toast.error('Недостаточно золота!');
      return;
    }
    await hireUnit(unitName, costPerUnit, amount);
  };

  const totalPower = army.reduce((sum, unit) => {
    const unitData = town.units.find(u => u.name === unit.unit_name);
    return sum + (unitData ? unit.count * unitData.value : 0);
  }, 0);

  const totalUnits = army.reduce((s, a) => s + a.count, 0);
  const capacityLeft = armyCapacity - totalUnits;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gold/20 bg-gradient-card p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Мощь армии</p>
          <p className="font-display text-lg font-bold text-gold">{totalPower.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Юнитов</p>
          <p className={`font-display text-lg font-bold ${totalUnits >= armyCapacity ? 'text-crimson' : 'text-foreground'}`}>
            {totalUnits} / {armyCapacity}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">👑 Лидерство</p>
          <p className="font-display text-lg font-bold text-arcane">{armyCapacity}</p>
        </div>
      </div>

      <h3 className="font-display text-sm font-bold text-gold uppercase">Найм юнитов (через Форт)</h3>
      <div className="space-y-2">
        {town.units.map((u, i) => {
          const count = getUnitCount(u.name);
          const available = getAvailable(u.name);
          const unlocked = isUnitUnlocked(u.level);
          const buildingName = getUnitBuildingName(u.level);
          const hireAmt = getHireAmount(u.name);
          const totalCost = u.cost * hireAmt;
          const affordable = (profile?.gold || 0) >= totalCost && hireAmt > 0;

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
                      В армии: {count}
                    </span>
                  )}
                  {unlocked && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${available > 0 ? 'bg-gold/20 text-gold' : 'bg-secondary text-muted-foreground'}`}>
                      Доступно: {available}
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
                <span className="text-[10px] text-muted-foreground">🏃 {u.speed}</span>
              </div>
              {u.abilities && (
                <div className="flex items-start gap-1 mb-2">
                  <Info className="h-3 w-3 text-arcane shrink-0 mt-0.5" />
                  <p className="text-[10px] text-arcane leading-tight">{u.abilities}</p>
                </div>
              )}
              <div className="text-[10px] text-muted-foreground mb-1.5">
                Прирост: {u.growth}/нед. | {u.movement} | {u.status}
              </div>
              
              {unlocked ? (
                available > 0 ? (
                  <div className="space-y-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <button
                          onClick={() => setHireAmount(u.name, Math.max(1, hireAmt - 1))}
                          className="rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={available}
                          value={hireAmt}
                          onChange={(e) => handleHireAmountChange(u.name, e.target.value)}
                          className="w-14 text-center rounded-lg bg-secondary border border-border px-1 py-1 text-xs font-bold text-foreground focus:outline-none focus:border-gold/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setHireAmount(u.name, Math.min(available, hireAmt + 1))}
                          className="rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-gold" />
                        <span className={`text-xs font-semibold ${affordable ? 'text-gold' : 'text-crimson'}`}>
                          {totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {/* Hire buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => hireUnit(u.name, u.cost, hireAmt)}
                        disabled={!affordable || buying}
                        className="flex-1 rounded-lg bg-gradient-crimson px-3 py-2 font-display text-[10px] font-bold text-accent-foreground disabled:opacity-40 flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        НАНЯТЬ {hireAmt}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => hireAll(u.name, u.cost)}
                        disabled={buying || (profile?.gold || 0) < u.cost}
                        className="rounded-lg bg-gradient-gold px-3 py-2 font-display text-[10px] font-bold text-primary-foreground disabled:opacity-40"
                      >
                        ВСЕ
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="h-3 w-3 text-gold" />
                      <span className="text-xs font-semibold text-gold">{u.cost.toLocaleString()} за ед.</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Пул пуст (ждите неделю)</span>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-gold" />
                    <span className="text-xs font-semibold text-muted-foreground">{u.cost.toLocaleString()} за ед.</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span className="text-[10px]">Постройте: {buildingName}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ArmyScreen;
