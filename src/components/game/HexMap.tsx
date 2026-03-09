import { useState, useRef, useEffect, useMemo } from 'react';
import { MAP_TILES, MAP_COLS, MAP_ROWS, getReachableTiles, getVisibleTiles, type MapTile } from '@/data/mapTiles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OtherPlayer {
  user_id: string;
  character_name: string | null;
  town: string | null;
  hero_level: number;
  hero_attack: number;
  hero_defense: number;
  hero_spellpower: number;
  gold: number;
  map_position: number;
}

interface HexMapProps {
  diceRoll: number | null;
  onTileSelect: (tile: MapTile) => void;
  onMove: (tileId: number) => void;
  revealedTiles: Set<number>;
  onAttackPlayer?: (player: OtherPlayer) => void;
}

const TRI_SIZE = 22;
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
  npc: 'hsl(180 60% 50%)',
  artifact: 'hsl(270 70% 60%)',
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
  npc: 'hsl(180 50% 35%)',
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
  npc: '❓',
  empty: '',
};

function trianglePoints(row: number, col: number): string {
  const isUp = (row + col) % 2 === 0;
  const x = col * TRI_SIZE / 2;
  const y = row * TRI_H;
  if (isUp) {
    return `${x},${y + TRI_H} ${x + TRI_SIZE / 2},${y} ${x + TRI_SIZE},${y + TRI_H}`;
  } else {
    return `${x},${y} ${x + TRI_SIZE / 2},${y + TRI_H} ${x + TRI_SIZE},${y}`;
  }
}

function triangleCenter(row: number, col: number): { x: number; y: number } {
  const isUp = (row + col) % 2 === 0;
  const x = col * TRI_SIZE / 2 + TRI_SIZE / 2;
  const y = row * TRI_H + (isUp ? TRI_H * 2 / 3 : TRI_H / 3);
  return { x, y };
}

const FOG_FILL = 'hsl(220 15% 12%)';

const HexMap = ({ diceRoll, onTileSelect, onMove, revealedTiles, onAttackPlayer }: HexMapProps) => {
  const { profile, user } = useAuth();
  const currentPosition = profile?.map_position ?? 0;
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [otherPlayers, setOtherPlayers] = useState<OtherPlayer[]>([]);

  const reachableTiles = diceRoll ? getReachableTiles(currentPosition, diceRoll) : [];
  const currentlyVisible = useMemo(() => getVisibleTiles(currentPosition, 4), [currentPosition]);

  // Fetch other players and subscribe to realtime
  useEffect(() => {
    if (!user) return;

    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, character_name, town, hero_level, hero_attack, hero_defense, hero_spellpower, gold, map_position')
        .eq('character_created', true)
        .neq('user_id', user.id);
      setOtherPlayers((data as OtherPlayer[]) || []);
    };

    fetchPlayers();

    const channel = supabase
      .channel('players-map')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
      }, () => {
        fetchPlayers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Build map of tile -> player for quick lookup
  const playersByTile = useMemo(() => {
    const map = new Map<number, OtherPlayer[]>();
    otherPlayers.forEach(p => {
      if (!map.has(p.map_position)) map.set(p.map_position, []);
      map.get(p.map_position)!.push(p);
    });
    return map;
  }, [otherPlayers]);

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
    if (!revealedTiles.has(tile.id)) return;

    // Check if there's a player on this tile and it's reachable
    const playersOnTile = playersByTile.get(tile.id);
    if (playersOnTile && playersOnTile.length > 0 && reachableTiles.includes(tile.id) && onAttackPlayer) {
      onAttackPlayer(playersOnTile[0]);
      return;
    }

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
          const isRevealed = revealedTiles.has(tile.id);
          const isVisible = currentlyVisible.has(tile.id);
          const isCurrentPos = tile.id === currentPosition;
          const isReachable = reachableTiles.includes(tile.id);
          const isSelected = selectedTile === tile.id;
          const playersHere = playersByTile.get(tile.id);
          const hasEnemy = playersHere && playersHere.length > 0 && isVisible;

          if (!isRevealed) {
            return (
              <polygon
                key={tile.id}
                points={points}
                fill={FOG_FILL}
                stroke="hsl(220 10% 18%)"
                strokeWidth={0.5}
                opacity={1}
              />
            );
          }

          let fill = TILE_FILL[tile.type] || TILE_FILL.empty;
          let stroke = TILE_STROKE[tile.type] || TILE_STROKE.empty;
          let strokeWidth = 0.8;
          let tileOpacity = isVisible ? 1 : 0.5;

          if (isReachable) {
            stroke = 'hsl(140 70% 50%)';
            strokeWidth = 2;
          }
          if (hasEnemy && isReachable) {
            stroke = 'hsl(0 80% 55%)';
            strokeWidth = 2.5;
          }
          if (isSelected) {
            stroke = 'hsl(280 70% 60%)';
            strokeWidth = 2;
          }
          if (isCurrentPos) {
            stroke = 'hsl(45 90% 50%)';
            strokeWidth = 2.5;
          }
          if (!tile.passable) {
            tileOpacity = isVisible ? 0.7 : 0.35;
          }

          const icon = TILE_ICONS[tile.type];

          return (
            <g
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              style={{ cursor: tile.passable && isRevealed ? 'pointer' : 'default' }}
            >
              <polygon
                points={points}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={tileOpacity}
              />
              {isReachable && (
                <polygon
                  points={points}
                  fill="hsl(140 70% 50%)"
                  opacity={0.18}
                  stroke="none"
                />
              )}
              {isCurrentPos && (
                <circle cx={x} cy={y} r={4} fill="hsl(45 90% 50%)" stroke="hsl(0 0% 10%)" strokeWidth={1.2} />
              )}
              {hasEnemy && !isCurrentPos && (
                <>
                  <circle cx={x} cy={y} r={4} fill="hsl(0 70% 50%)" stroke="hsl(0 0% 100%)" strokeWidth={0.8} />
                  <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={5} fill="white" fontWeight="bold">
                    ⚔
                  </text>
                </>
              )}
              {icon && !isCurrentPos && !hasEnemy && isVisible && (
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={8}>
                  {icon}
                </text>
              )}
              <title>
                {tile.name}
                {tile.monsterPower ? ` (⚔${tile.monsterPower})` : ''}
                {tile.goldReward ? ` (💰${tile.goldReward})` : ''}
                {hasEnemy ? ` 👤${playersHere![0].character_name} Ур.${playersHere![0].hero_level}` : ''}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HexMap;
