import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS, type TownId } from '@/data/towns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Swords, Shield, Heart, Zap, Coins, ShoppingCart, Users } from 'lucide-react';

interface ArmyScreenProps {
  townId: TownId;
}

const ArmyScreen = ({ townId }: ArmyScreenProps) => {
  const { user, profile, army, buildings, refreshArmy, updateGold } = useAuth();
  const town = TOWNS.find(t => t.id === townId);
  const [buying, setBuying] = useState(false);

  if (!town) return null;

  // Check which creature buildings are built to determine which units can be hired
  const builtBuildingIds = buildings.map(b => b.building_id);

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

  // Calculate total army power
  const totalPower = army.reduce((sum, unit) => {
    const unitData = town.units.find(u => u.name === unit.unit_name);
    return sum + (unitData ? unit.count * unitData.value : 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Army summary */}
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

      {/* Units list */}
      <h3 className="font-display text-sm font-bold text-gold uppercase">Найм юнитов</h3>
      <div className="space-y-2">
        {town.units.map((u, i) => {
          const count = getUnitCount(u.name);
          const affordable = (profile?.gold || 0) >= u.cost;

          return (
            <motion.div
              key={u.name}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border bg-gradient-card p-3"
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
                <p className="text-[10px] text-muted-foreground leading-tight mb-2">{u.abilities}</p>
              )}
              
              {/* Hire button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-gold" />
                  <span className={`text-xs font-semibold ${affordable ? 'text-gold' : 'text-crimson'}`}>
                    {u.cost.toLocaleString()} золота
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => hireUnit(u.name, u.cost)}
                  disabled={!affordable || buying}
                  className="rounded-lg bg-gradient-crimson px-3 py-1.5 font-display text-[10px] font-bold text-accent-foreground disabled:opacity-40 flex items-center gap-1"
                >
                  <ShoppingCart className="h-3 w-3" />
                  НАНЯТЬ
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ArmyScreen;
