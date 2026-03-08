import { useState, useRef, useEffect } from 'react';
import { MAP_TILES, MAP_COLS, MAP_ROWS, getReachableTiles, type MapTile } from '@/data/mapTiles';
import { useAuth } from '@/contexts/AuthContext';

interface HexMapProps {
  diceRoll: number | null;
  onTileSelect: (tile: MapTile) => void;
  onMove: (tileId: number) => void;
}

const HEX_SIZE = 22; // radius
const HEX_W = HEX_SIZE * 2;
const HEX_H = Math.sqrt(3) * HEX_SIZE;

const TILE_FILL: Record<string, string> = {
  city: 'hsl(45 80% 55%)',
  road: 'hsl(30 15% 45%)',
  grass: 'hsl(120 25% 82%)',
  forest: 'hsl(140 40% 40%)',
  mountain: 'hsl(30 10% 55%)',
  water: 'hsl(210 60% 65%)',
  treasure: 'hsl(45 90% 60%)',
  mine: 'hsl(280 50% 55%)',
  monster: 'hsl(0 60% 50%)',
  empty: 'hsl(0 0% 90%)',
};

const TILE_STROKE: Record<string, string> = {
  city: 'hsl(45 70% 40%)',
  road: 'hsl(30 10% 35%)',
  grass: 'hsl(200 40% 75%)',
  forest: 'hsl(140 35% 30%)',
  mountain: 'hsl(30 10% 40%)',
  water: 'hsl(210 50% 50%)',
  treasure: 'hsl(45 80% 45%)',
  mine: 'hsl(280 40% 40%)',
  monster: 'hsl(0 50% 35%)',
  empty: 'hsl(0 0% 75%)',
};

const TILE_ICONS: Record<string, string> = {
  city: '🏰',
  road: '',
  grass: '',
  forest: '🌲',
  mountain: '⛰️',
  water: '🌊',
  treasure: '💰',
  mine: '⛏️',
  monster: '💀',
  empty: '',
};

function hexCorners(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return points.join(' ');
}

function hexCenter(row: number, col: number): { x: number; y: number } {
  const x = col * HEX_W * 0.75 + HEX_SIZE + 2;
  const y = row * HEX_H + (col % 2 === 1 ? HEX_H / 2 : 0) + HEX_SIZE + 2;
  return { x, y };
}

const HexMap = ({ diceRoll, onTileSelect, onMove }: HexMapProps) => {
  const { profile } = useAuth();
  const currentPosition = profile?.map_position ?? 0;
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reachableTiles = diceRoll ? getReachableTiles(currentPosition, diceRoll) : [];

  // Auto-scroll to player position
  useEffect(() => {
    if (containerRef.current) {
      const row = Math.floor(currentPosition / MAP_COLS);
      const col = currentPosition % MAP_COLS;
      const { x, y } = hexCenter(row, col);
      containerRef.current.scrollTo({
        left: x - containerRef.current.clientWidth / 2,
        top: y - containerRef.current.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [currentPosition]);

  const handleTileClick = (tile: MapTile) => {
    if (!tile.passable) return;
    setSelectedTile(tile.id);
    onTileSelect(tile);
    if (diceRoll && reachableTiles.includes(tile.id)) {
      onMove(tile.id);
    }
  };

  const svgW = MAP_COLS * HEX_W * 0.75 + HEX_SIZE + 4;
  const svgH = MAP_ROWS * HEX_H + HEX_H / 2 + 4;

  return (
    <div
      ref={containerRef}
      className="overflow-auto rounded-xl border border-border bg-card/50"
      style={{ maxHeight: '55vh' }}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="block"
      >
        {MAP_TILES.map((tile) => {
          const row = Math.floor(tile.id / MAP_COLS);
          const col = tile.id % MAP_COLS;
          const { x, y } = hexCenter(row, col);
          const isCurrentPos = tile.id === currentPosition;
          const isReachable = reachableTiles.includes(tile.id);
          const isSelected = selectedTile === tile.id;

          let fill = TILE_FILL[tile.type] || TILE_FILL.empty;
          let stroke = TILE_STROKE[tile.type] || TILE_STROKE.empty;
          let strokeWidth = 1;
          let opacity = 1;

          if (isReachable) {
            stroke = 'hsl(140 70% 50%)';
            strokeWidth = 2.5;
          }
          if (isSelected) {
            stroke = 'hsl(280 70% 60%)';
            strokeWidth = 2.5;
          }
          if (isCurrentPos) {
            stroke = 'hsl(45 90% 50%)';
            strokeWidth = 3;
          }
          if (!tile.passable) {
            opacity = 0.7;
          }

          const icon = TILE_ICONS[tile.type];

          return (
            <g
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              style={{ cursor: tile.passable ? 'pointer' : 'not-allowed' }}
            >
              <polygon
                points={hexCorners(x, y, HEX_SIZE)}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={opacity}
              />
              {/* Reachable glow */}
              {isReachable && (
                <polygon
                  points={hexCorners(x, y, HEX_SIZE - 3)}
                  fill="hsl(140 70% 50%)"
                  opacity={0.15}
                />
              )}
              {/* Player marker */}
              {isCurrentPos && (
                <circle cx={x} cy={y} r={6} fill="hsl(45 90% 50%)" stroke="hsl(0 0% 10%)" strokeWidth={1.5} />
              )}
              {/* Icon */}
              {icon && !isCurrentPos && (
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={14}>
                  {icon}
                </text>
              )}
              {/* Tooltip on hover */}
              <title>{tile.name}{tile.monsterPower ? ` (⚔${tile.monsterPower})` : ''}{tile.goldReward ? ` (💰${tile.goldReward})` : ''}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HexMap;
