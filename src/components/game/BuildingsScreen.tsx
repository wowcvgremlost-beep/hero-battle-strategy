import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuildingsForTown, type Building } from '@/data/buildings';
import type { TownId } from '@/data/towns';
import { Coins, Home, Info, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface BuildingsScreenProps {
  townId: TownId;
}

type Tab = 'common' | 'creature';

const BuildingCard = ({ building, index }: { building: Building; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-xl border border-border bg-gradient-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Home className="h-3.5 w-3.5 text-gold shrink-0" />
            <h3 className="font-display text-sm font-bold text-foreground truncate">{building.name}</h3>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-gold" />
              <span className="text-xs text-gold font-semibold">{building.cost.toLocaleString()}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {building.buildingClass === 'common' ? 'Общее' : 'Существа'}
            </span>
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
                      <span
                        key={req}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                      >
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BuildingsScreen = ({ townId }: BuildingsScreenProps) => {
  const [tab, setTab] = useState<Tab>('creature');
  const { common, creature } = getBuildingsForTown(townId);

  const buildings = tab === 'common' ? common : creature;

  return (
    <div className="space-y-4">
      {/* Tabs */}
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

      {/* Building list */}
      <div className="space-y-2">
        {buildings.map((b, i) => (
          <BuildingCard key={b.id} building={b} index={i} />
        ))}
      </div>
    </div>
  );
};

export default BuildingsScreen;
