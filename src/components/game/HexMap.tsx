import { useState } from 'react';
import { motion } from 'framer-motion';
import { MAP_TILES, MAP_COLS, getReachableTiles, type MapTile } from '@/data/mapTiles';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, Sparkles, Swords, Home, TreePine, Mountain, Droplets, MapPin, Skull, Gem } from 'lucide-react';

interface HexMapProps {
  diceRoll: number | null;
  onTileSelect: (tile: MapTile) => void;
  onMove: (tileId: number) => void;
}

const TILE_ICONS: Record<string, React.ReactNode> = {
  city: <Home className="h-4 w-4" />,
  road: <MapPin className="h-3 w-3" />,
  grass: null,
  forest: <TreePine className="h-4 w-4" />,
  mountain: <Mountain className="h-4 w-4" />,
  water: <Droplets className="h-4 w-4" />,
  treasure: <Coins className="h-4 w-4" />,
  mine: <Gem className="h-4 w-4" />,
  monster: <Skull className="h-4 w-4" />,
  empty: null,
};

const TILE_COLORS: Record<string, string> = {
  city: 'bg-gold/30 border-gold/50',
  road: 'bg-secondary/80 border-border',
  grass: 'bg-emerald/10 border-emerald/20',
  forest: 'bg-emerald/25 border-emerald/40',
  mountain: 'bg-muted border-border',
  water: 'bg-blue-500/20 border-blue-500/30',
  treasure: 'bg-gold/20 border-gold/40',
  mine: 'bg-arcane/20 border-arcane/40',
  monster: 'bg-crimson/20 border-crimson/40',
  empty: 'bg-card border-border',
};

const HexMap = ({ diceRoll, onTileSelect, onMove }: HexMapProps) => {
  const { profile } = useAuth();
  const currentPosition = profile?.map_position ?? 0;
  const [selectedTile, setSelectedTile] = useState<number | null>(null);

  const reachableTiles = diceRoll ? getReachableTiles(currentPosition, diceRoll) : [];

  const handleTileClick = (tile: MapTile) => {
    if (!tile.passable) return;
    
    setSelectedTile(tile.id);
    onTileSelect(tile);

    if (diceRoll && reachableTiles.includes(tile.id)) {
      onMove(tile.id);
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div 
        className="grid gap-1"
        style={{ 
          gridTemplateColumns: `repeat(${MAP_COLS}, 44px)`,
          minWidth: `${MAP_COLS * 48}px`
        }}
      >
        {MAP_TILES.map((tile, index) => {
          const row = Math.floor(index / MAP_COLS);
          const isOddRow = row % 2 === 1;
          const isCurrentPos = tile.id === currentPosition;
          const isReachable = reachableTiles.includes(tile.id);
          const isSelected = selectedTile === tile.id;

          return (
            <motion.button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              disabled={!tile.passable}
              whileTap={tile.passable ? { scale: 0.95 } : undefined}
              className={`
                relative aspect-square rounded-lg border-2 flex items-center justify-center transition-all
                ${TILE_COLORS[tile.type]}
                ${isOddRow ? 'ml-5' : ''}
                ${isCurrentPos ? 'ring-2 ring-gold shadow-gold' : ''}
                ${isReachable ? 'ring-2 ring-emerald/70 animate-pulse' : ''}
                ${isSelected ? 'ring-2 ring-arcane' : ''}
                ${!tile.passable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}
              `}
              title={tile.name}
            >
              {isCurrentPos && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border border-background z-10" />
              )}
              <span className={tile.type === 'monster' ? 'text-crimson' : tile.type === 'treasure' || tile.type === 'mine' ? 'text-gold' : 'text-muted-foreground'}>
                {TILE_ICONS[tile.type]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default HexMap;
