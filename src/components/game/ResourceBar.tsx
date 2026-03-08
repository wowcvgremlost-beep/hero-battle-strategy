import { Coins, Gem, Zap } from 'lucide-react';
import type { PlayerResources } from '@/types/game';

interface ResourceBarProps {
  resources: PlayerResources;
}

const ResourceBar = ({ resources }: ResourceBarProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
        <Coins className="h-4 w-4 text-gold" />
        <span className="text-sm font-semibold text-gold-light">{resources.gold.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
        <Gem className="h-4 w-4 text-arcane" />
        <span className="text-sm font-semibold text-foreground">{resources.crystals}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
        <Zap className="h-4 w-4 text-emerald" />
        <span className="text-sm font-semibold text-foreground">
          {resources.energy}/{resources.maxEnergy}
        </span>
      </div>
    </div>
  );
};

export default ResourceBar;
