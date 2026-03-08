import { useState, useRef, useEffect } from 'react';
import { MAP_TILES, MAP_COLS, MAP_ROWS, getReachableTiles, type MapTile } from '@/data/mapTiles';
import { useAuth } from '@/contexts/AuthContext';

interface HexMapProps {
  diceRoll: number | null;
  onTileSelect: (tile: MapTile) => void;
  onMove: (tileId: number) => void;
}

// Triangle grid settings
const TRI_SIZE = 28; // side length
const TRI_H = TRI_SIZE * Math.sqrt(3) / 2;

const TILE_FILL: Record<string, string> = {
  city: 'hsl(45 80% 55%)',
  road: 'hsl(30 15% 50%)',
  grass: 'hsl(120 25% 85%)',
  forest: 'hsl(140 40% 42%)',
  mountain: 'hsl(30 10% 55%)',
  water: 'hsl(210 60% 65%)',
  treasure: 'hsl(45 90% 60%)',
  mine: 'hsl(280 50% 55%)',
  monster: 'hsl(0 60% 50%)',
  empty: 'hsl(0 0% 90%)',
};

const TILE_STROKE: Record<string, string> = {
  city: 'hsl(45 70% 40%)',
  road: 'hsl(30 10% 38%)',
  grass: 'hsl(200 40% 72%)',
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

// Returns the 3 points of a triangle given row, col in the triangle grid
// Even col = upward pointing triangle, odd col = downward pointing
function trianglePoints(row: number, col: number): string {
  const isUp = (row + col) % 2 === 0;
  const x = col * TRI_SIZE / 2;
  const y = row * TRI_H;
  
  if (isUp) {
    // ▲ pointing up
    return `${x},${y + TRI_H} ${x + TRI_SIZE / 2},${y} ${x + TRI_SIZE},${y + TRI_H}`;
  } else {
    // ▽ pointing down
    return `${x},${y} ${x + TRI_SIZE / 2},${y + TRI_H} ${x + TRI_SIZE},${y}`;
  }
}

function triangleCenter(row: number, col: number): { x: number; y: number } {
  const isUp = (row + col) % 2 === 0;
  const x = col * TRI_SIZE / 2 + TRI_SIZE / 2;
  const y = row * TRI_H + (isUp ? TRI_H * 2 / 3 : TRI_H / 3);
  return { x, y };
}

const HexMap = ({ diceRoll, onTileSelect, onMove }: HexMapProps) => {
  const { profile } = useAuth();
  const currentPosition = profile?.map_position ?? 0;
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reachableTiles = diceRoll ? getReachableTiles(currentPosition, diceRoll) : [];

  useEffect(() => {
    if (containerRef.current) {
      const row = Math.floor(currentPosition / MAP_COLS);
      const col = currentPosition % MAP_COLS;
      const { x, y } = triangleCenter(row, col);
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

  const svgW = MAP_COLS * TRI_SIZE / 2 + TRI_SIZE / 2 + 4;
  const svgH = MAP_ROWS * TRI_H + TRI_H + 4;

  return (
    <div
      ref={containerRef}
      className="overflow-auto rounded-xl border border-border bg-card/50"
      style={{ maxHeight: '55vh' }}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={`-2 -2 ${svgW} ${svgH}`}
        className="block"
      >
        {MAP_TILES.map((tile) => {
          const row = Math.floor(tile.id / MAP_COLS);
          const col = tile.id % MAP_COLS;
          const points = trianglePoints(row, col);
          const { x, y } = triangleCenter(row, col);
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
            opacity = 0.6;
          }

          const icon = TILE_ICONS[tile.type];

          return (
            <g
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              style={{ cursor: tile.passable ? 'pointer' : 'not-allowed' }}
            >
              <polygon
                points={points}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={opacity}
              />
              {isReachable && (
                <polygon
                  points={points}
                  fill="hsl(140 70% 50%)"
                  opacity={0.15}
                  stroke="none"
                />
              )}
              {isCurrentPos && (
                <circle cx={x} cy={y} r={5} fill="hsl(45 90% 50%)" stroke="hsl(0 0% 10%)" strokeWidth={1.5} />
              )}
              {icon && !isCurrentPos && (
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={11}>
                  {icon}
                </text>
              )}
              <title>{tile.name}{tile.monsterPower ? ` (⚔${tile.monsterPower})` : ''}{tile.goldReward ? ` (💰${tile.goldReward})` : ''}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HexMap;
