import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { getTileAt, getReachableTiles, getVisibleTiles, encodePos, type MapTile, type TileCategory } from '@/data/mapTiles';
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
  map_row: number;
  map_col: number;
}

interface HexMapProps {
  diceRoll: number | null;
  onTileSelect: (tile: MapTile) => void;
  onMove: (row: number, col: number) => void;
  revealedTiles: Set<string>;
  onAttackPlayer?: (player: OtherPlayer) => void;
  playerRow: number;
  playerCol: number;
  defeatedTiles: Set<string>;
}

const TRI_SIZE = 80;
const TRI_H = TRI_SIZE * Math.sqrt(3) / 2;
const VIEW_RADIUS = 8;

const CATEGORY_FILL: Record<TileCategory, string> = {
  safe:   'hsl(140 45% 55%)',
  combat: 'hsl(0 65% 50%)',
  random: 'hsl(45 80% 55%)',
  quest:  'hsl(210 65% 55%)',
  mystic: 'hsl(280 60% 55%)',
};

const CATEGORY_FILL_DARK: Record<TileCategory, string> = {
  safe:   'hsl(140 30% 30%)',
  combat: 'hsl(0 40% 28%)',
  random: 'hsl(45 50% 30%)',
  quest:  'hsl(210 40% 30%)',
  mystic: 'hsl(280 35% 30%)',
};

const CATEGORY_STROKE: Record<TileCategory, string> = {
  safe:   'hsl(140 35% 40%)',
  combat: 'hsl(0 55% 35%)',
  random: 'hsl(45 70% 40%)',
  quest:  'hsl(210 55% 40%)',
  mystic: 'hsl(280 50% 40%)',
};

const IMPASSABLE_FILL: Record<string, string> = {
  water: 'hsl(210 50% 35%)',
  mountain: 'hsl(30 10% 40%)',
};

const TILE_ICONS: Record<string, string> = {
  city: '🏰', forest: '🌲', water: '🌊', mountain: '⛰️',
  treasure: '💰', mine: '⛏️', monster: '💀', npc: '❓',
  artifact: '🎁', dungeon: '🚪', road: '🛤️', grass: '🌿',
};

// Buffs/debuffs/effects per tile category
function getTileEffects(tile: MapTile): string[] {
  const effects: string[] = [];
  if (!tile.passable) return effects;
  
  // Combat tiles: show monster + difficulty effects
  if (tile.category === 'combat') {
    if (tile.difficulty && tile.difficulty >= 7) effects.push('🔥 Ярость');
    if (tile.difficulty && tile.difficulty >= 5) effects.push('🛡️ Бронь');
    if (tile.monsterPower && tile.monsterPower > 100) effects.push('⚡ Мощь');
    if (tile.difficulty && tile.difficulty <= 2) effects.push('😴 Слабый');
  }
  
  // Random tiles: show buff potential
  if (tile.category === 'random') {
    if (tile.goldReward && tile.goldReward > 1000) effects.push('✨ Богатый');
    if (tile.type === 'mine') effects.push('⚒️ Доход');
    else effects.push('🎲 Удача');
  }
  
  // Quest tiles
  if (tile.category === 'quest') {
    effects.push('📜 Задание');
    effects.push('⭐ Опыт');
  }
  
  // Mystic tiles: buffs/debuffs
  if (tile.category === 'mystic') {
    if (tile.artifactRarity === 'legendary' || tile.artifactRarity === 'epic') effects.push('👑 Реликвия');
    else if (tile.artifactRarity === 'rare') effects.push('💎 Редкое');
    else effects.push('🔮 Магия');
    if (tile.dungeonId) effects.push('⚠️ Опасно');
  }
  
  // Safe tiles: minor buffs
  if (tile.category === 'safe' && tile.type === 'city') {
    effects.push('💚 Отдых');
    effects.push('🏪 Торговля');
  }
  if (tile.category === 'safe' && tile.type === 'road') {
    effects.push('🏃 +Ход');
  }
  
  return effects;
}

function getTileDetails(tile: MapTile, isDefeated: boolean): { icon: string; label: string; sub: string; effects: string[] } {
  const effects = getTileEffects(tile);
  
  if (!tile.passable) {
    return { icon: TILE_ICONS[tile.type] || '🚫', label: tile.name, sub: '', effects: [] };
  }
  if (isDefeated && tile.category === 'combat') {
    return { icon: '✅', label: 'Побеждено', sub: '', effects: ['💚 Безопасно'] };
  }
  switch (tile.category) {
    case 'combat':
      return {
        icon: '💀',
        label: tile.name,
        sub: tile.difficulty ? `⚔${tile.difficulty} 💪${tile.monsterPower || '?'}` : '',
        effects,
      };
    case 'random':
      return {
        icon: tile.type === 'mine' ? '⛏️' : '💰',
        label: tile.name,
        sub: tile.goldReward ? `${tile.goldReward}g` : '',
        effects,
      };
    case 'quest':
      return {
        icon: '📜',
        label: tile.name,
        sub: 'Задание',
        effects,
      };
    case 'mystic':
      return {
        icon: tile.type === 'dungeon' ? '🚪' : '🎁',
        label: tile.name,
        sub: tile.artifactRarity || (tile.dungeonId ? 'Данж' : ''),
        effects,
      };
    case 'safe':
    default:
      return {
        icon: TILE_ICONS[tile.type] || '🌿',
        label: tile.name,
        sub: '',
        effects,
      };
  }
}

function trianglePoints(row: number, col: number, offsetX: number, offsetY: number): string {
  const isUp = (row + col) % 2 === 0;
  const x = col * TRI_SIZE / 2 + offsetX;
  const y = row * TRI_H + offsetY;
  if (isUp) {
    return `${x},${y + TRI_H} ${x + TRI_SIZE / 2},${y} ${x + TRI_SIZE},${y + TRI_H}`;
  }
  return `${x},${y} ${x + TRI_SIZE / 2},${y + TRI_H} ${x + TRI_SIZE},${y}`;
}

function triangleCenter(row: number, col: number, offsetX: number, offsetY: number): { x: number; y: number } {
  const isUp = (row + col) % 2 === 0;
  const x = col * TRI_SIZE / 2 + TRI_SIZE / 2 + offsetX;
  const y = row * TRI_H + (isUp ? TRI_H * 2 / 3 : TRI_H / 3) + offsetY;
  return { x, y };
}

const FOG_FILL = 'hsl(220 15% 12%)';

const HexMap = ({ diceRoll, onTileSelect, onMove, revealedTiles, onAttackPlayer, playerRow, playerCol, defeatedTiles }: HexMapProps) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [otherPlayers, setOtherPlayers] = useState<OtherPlayer[]>([]);

  const reachable = useMemo(() => {
    if (!diceRoll) return new Set<string>();
    const tiles = getReachableTiles(playerRow, playerCol, diceRoll);
    return new Set(tiles.map(t => `${t.row},${t.col}`));
  }, [diceRoll, playerRow, playerCol]);

  const currentlyVisible = useMemo(() => getVisibleTiles(playerRow, playerCol, 4), [playerRow, playerCol]);

  const visibleCoords = useMemo(() => {
    const coords: { row: number; col: number }[] = [];
    for (let dr = -VIEW_RADIUS; dr <= VIEW_RADIUS; dr++) {
      for (let dc = -VIEW_RADIUS * 2; dc <= VIEW_RADIUS * 2; dc++) {
        coords.push({ row: playerRow + dr, col: playerCol + dc });
      }
    }
    return coords;
  }, [playerRow, playerCol]);

  useEffect(() => {
    if (!user) return;
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, character_name, town, hero_level, hero_attack, hero_defense, hero_spellpower, gold, map_row, map_col')
        .eq('character_created', true)
        .neq('user_id', user.id);
      if (data) setOtherPlayers(data as any[]);
    };
    fetchPlayers();
    const channel = supabase.channel('players-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchPlayers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const playersByTile = useMemo(() => {
    const map = new Map<string, OtherPlayer[]>();
    otherPlayers.forEach(p => {
      const key = `${p.map_row},${p.map_col}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [otherPlayers]);

  useEffect(() => {
    if (containerRef.current) {
      const svgW = (VIEW_RADIUS * 4 + 1) * TRI_SIZE / 2 + TRI_SIZE;
      const svgH = (VIEW_RADIUS * 2 + 1) * TRI_H + TRI_H;
      containerRef.current.scrollTo({
        left: svgW / 2 - containerRef.current.clientWidth / 2,
        top: svgH / 2 - containerRef.current.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [playerRow, playerCol]);

  const handleTileClick = useCallback((tile: MapTile) => {
    if (!tile.passable) return;
    const key = `${tile.row},${tile.col}`;
    if (!revealedTiles.has(key)) return;

    const playersOnTile = playersByTile.get(key);
    if (playersOnTile && playersOnTile.length > 0 && reachable.has(key) && onAttackPlayer) {
      onAttackPlayer(playersOnTile[0]);
      return;
    }

    onTileSelect(tile);
    if (diceRoll && reachable.has(key)) {
      onMove(tile.row, tile.col);
    }
  }, [diceRoll, reachable, revealedTiles, playersByTile, onAttackPlayer, onTileSelect, onMove]);

  const minRow = playerRow - VIEW_RADIUS;
  const minCol = playerCol - VIEW_RADIUS * 2;
  const offsetX = -minCol * TRI_SIZE / 2;
  const offsetY = -minRow * TRI_H;

  const svgW = (VIEW_RADIUS * 4 + 2) * TRI_SIZE / 2 + TRI_SIZE;
  const svgH = (VIEW_RADIUS * 2 + 2) * TRI_H + TRI_H;

  return (
    <div
      ref={containerRef}
      className="overflow-auto rounded-xl border border-border bg-card/80"
      style={{ maxHeight: '60vh' }}
    >
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="block">
        {visibleCoords.map(({ row, col }) => {
          const key = `${row},${col}`;
          const tile = getTileAt(row, col);
          const points = trianglePoints(row, col, offsetX, offsetY);
          const { x, y } = triangleCenter(row, col, offsetX, offsetY);
          const isRevealed = revealedTiles.has(key);
          const isVisible = currentlyVisible.has(key);
          const isCurrentPos = row === playerRow && col === playerCol;
          const isReachable = reachable.has(key);
          const playersHere = playersByTile.get(key);
          const hasEnemy = playersHere && playersHere.length > 0 && isVisible;
          const isDefeated = defeatedTiles.has(key);

          if (!isRevealed) {
            return (
              <polygon key={key} points={points} fill={FOG_FILL} stroke="hsl(220 10% 18%)" strokeWidth={0.5} />
            );
          }

          let fill: string;
          if (!tile.passable) {
            fill = IMPASSABLE_FILL[tile.type] || 'hsl(0 0% 30%)';
          } else if (isDefeated && tile.category === 'combat') {
            fill = CATEGORY_FILL.safe;
          } else {
            fill = isVisible ? CATEGORY_FILL[tile.category] : CATEGORY_FILL_DARK[tile.category];
          }

          let stroke = CATEGORY_STROKE[tile.category] || 'hsl(0 0% 40%)';
          let strokeWidth = 1;
          let tileOpacity = isVisible ? 1 : 0.5;

          if (isReachable && tile.passable) {
            stroke = 'hsl(0 0% 100%)';
            strokeWidth = 2.5;
          }
          if (hasEnemy && isReachable) {
            stroke = 'hsl(0 80% 70%)';
            strokeWidth = 3;
          }
          if (isCurrentPos) {
            stroke = 'hsl(45 90% 60%)';
            strokeWidth = 3.5;
          }
          if (!tile.passable) {
            tileOpacity = isVisible ? 0.6 : 0.3;
          }

          const details = getTileDetails(tile, isDefeated);

          return (
            <g
              key={key}
              onClick={() => handleTileClick(tile)}
              style={{ cursor: tile.passable && isRevealed ? 'pointer' : 'default' }}
            >
              <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={tileOpacity} />
              {isReachable && tile.passable && (
                <polygon points={points} fill="hsl(0 0% 100%)" opacity={0.15} stroke="none" />
              )}

              {/* Tile content — icon + label + effects */}
              {isVisible && !isCurrentPos && !hasEnemy && (
                <>
                  <text x={x} y={y - 12} textAnchor="middle" dominantBaseline="central" fontSize={18}>
                    {details.icon}
                  </text>
                  <text x={x} y={y + 4} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="hsl(0 0% 100%)" fontWeight="600" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                    {details.label.length > 12 ? details.label.slice(0, 11) + '…' : details.label}
                  </text>
                  {details.sub && (
                    <text x={x} y={y + 14} textAnchor="middle" dominantBaseline="central" fontSize={7} fill="hsl(45 80% 70%)" fontWeight="bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                      {details.sub}
                    </text>
                  )}
                  {/* Effects / buffs / debuffs */}
                  {details.effects.slice(0, 2).map((effect, ei) => (
                    <text key={ei} x={x} y={y + 23 + ei * 9} textAnchor="middle" dominantBaseline="central" fontSize={6} fill="hsl(180 60% 75%)" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                      {effect}
                    </text>
                  ))}
                </>
              )}

              {/* Current player marker */}
              {isCurrentPos && (
                <>
                  <circle cx={x} cy={y - 2} r={8} fill="hsl(45 90% 55%)" stroke="hsl(0 0% 10%)" strokeWidth={2} />
                  <text x={x} y={y - 1} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="hsl(0 0% 10%)" fontWeight="bold">⚑</text>
                </>
              )}

              {/* Enemy player */}
              {hasEnemy && !isCurrentPos && (
                <>
                  <circle cx={x} cy={y - 2} r={7} fill="hsl(0 70% 50%)" stroke="hsl(0 0% 100%)" strokeWidth={1} />
                  <text x={x} y={y - 1} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="white" fontWeight="bold">⚔</text>
                  <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="central" fontSize={5} fill="hsl(0 0% 100%)" fontWeight="bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                    {playersHere![0].character_name?.slice(0, 8) || '???'}
                  </text>
                </>
              )}

              <title>
                {tile.name}
                {tile.difficulty ? ` [Сложность: ${tile.difficulty}]` : ''}
                {tile.monsterPower ? ` (⚔${tile.monsterPower})` : ''}
                {tile.goldReward ? ` (💰${tile.goldReward})` : ''}
                {hasEnemy ? ` 👤${playersHere![0].character_name} Ур.${playersHere![0].hero_level}` : ''}
                {isDefeated ? ' ✓ Побеждено' : ''}
              </title>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-2 px-3 border-t border-border bg-card/50">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-3 h-3 rounded-sm" style={{ background: CATEGORY_FILL.safe }} /> Безопасно
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-3 h-3 rounded-sm" style={{ background: CATEGORY_FILL.combat }} /> Бой
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-3 h-3 rounded-sm" style={{ background: CATEGORY_FILL.random }} /> Случайность
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-3 h-3 rounded-sm" style={{ background: CATEGORY_FILL.quest }} /> Квест
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-3 h-3 rounded-sm" style={{ background: CATEGORY_FILL.mystic }} /> Мистика
        </span>
      </div>
    </div>
  );
};

export default HexMap;
