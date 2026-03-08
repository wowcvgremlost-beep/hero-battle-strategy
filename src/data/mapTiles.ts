export type TileType = 'grass' | 'forest' | 'mountain' | 'water' | 'road' | 'city' | 'mine' | 'treasure' | 'monster' | 'empty';

export interface MapTile {
  id: number;
  type: TileType;
  name: string;
  goldReward?: number;
  expReward?: number;
  monsterPower?: number;
  passable: boolean;
}

export const MAP_COLS = 20;
export const MAP_ROWS = 16;

function generateMap(): MapTile[] {
  const tiles: MapTile[] = [];
  const total = MAP_COLS * MAP_ROWS;

  const specific: Record<number, Partial<MapTile>> = {
    0: { type: 'city', name: 'Ваш город' },
    1: { type: 'road', name: 'Дорога' },
    20: { type: 'road', name: 'Дорога' },
    21: { type: 'road', name: 'Дорога' },
    5: { type: 'treasure', name: 'Сундук', goldReward: 500 },
    34: { type: 'treasure', name: 'Руины', goldReward: 800, expReward: 30 },
    67: { type: 'treasure', name: 'Алтарь', expReward: 100 },
    112: { type: 'treasure', name: 'Артефакт', goldReward: 1200, expReward: 80 },
    156: { type: 'treasure', name: 'Заброшенный храм', goldReward: 1000, expReward: 50 },
    203: { type: 'treasure', name: 'Древний свиток', expReward: 150 },
    245: { type: 'treasure', name: 'Золотой идол', goldReward: 1500 },
    289: { type: 'treasure', name: 'Магический кристалл', expReward: 200 },
    12: { type: 'mine', name: 'Золотая шахта', goldReward: 1000 },
    55: { type: 'mine', name: 'Рудник кристаллов', goldReward: 1500 },
    130: { type: 'mine', name: 'Серебряный рудник', goldReward: 1200 },
    210: { type: 'mine', name: 'Алмазная копь', goldReward: 2000 },
    8: { type: 'monster', name: 'Логово гоблинов', monsterPower: 50, goldReward: 300, expReward: 50 },
    28: { type: 'monster', name: 'Пещера троллей', monsterPower: 100, goldReward: 600, expReward: 100 },
    47: { type: 'monster', name: 'Логово орков', monsterPower: 150, goldReward: 900, expReward: 150 },
    73: { type: 'monster', name: 'Башня мага', monsterPower: 200, goldReward: 1500, expReward: 200 },
    99: { type: 'monster', name: 'Некрополь', monsterPower: 250, goldReward: 1800, expReward: 250 },
    140: { type: 'monster', name: 'Драконье логово', monsterPower: 300, goldReward: 2000, expReward: 300 },
    178: { type: 'monster', name: 'Замок демонов', monsterPower: 350, goldReward: 2500, expReward: 350 },
    220: { type: 'monster', name: 'Цитадель нежити', monsterPower: 400, goldReward: 3000, expReward: 400 },
    260: { type: 'monster', name: 'Логово гидры', monsterPower: 450, goldReward: 3500, expReward: 450 },
    300: { type: 'monster', name: 'Чёрная башня', monsterPower: 500, goldReward: 4000, expReward: 500 },
    44: { type: 'water', name: 'Озеро' },
    45: { type: 'water', name: 'Озеро' },
    64: { type: 'water', name: 'Озеро' },
    65: { type: 'water', name: 'Озеро' },
    85: { type: 'water', name: 'Река' },
    86: { type: 'water', name: 'Река' },
    105: { type: 'water', name: 'Река' },
    145: { type: 'water', name: 'Море' },
    146: { type: 'water', name: 'Море' },
    165: { type: 'water', name: 'Море' },
    166: { type: 'water', name: 'Море' },
    185: { type: 'water', name: 'Море' },
    186: { type: 'water', name: 'Море' },
    37: { type: 'mountain', name: 'Горы' },
    38: { type: 'mountain', name: 'Горы' },
    57: { type: 'mountain', name: 'Горный хребет' },
    58: { type: 'mountain', name: 'Горный хребет' },
    77: { type: 'mountain', name: 'Горы' },
    118: { type: 'mountain', name: 'Горный пик' },
    119: { type: 'mountain', name: 'Горный пик' },
    158: { type: 'mountain', name: 'Скалы' },
    198: { type: 'mountain', name: 'Скалы' },
    238: { type: 'mountain', name: 'Утёсы' },
    3: { type: 'forest', name: 'Лес' },
    4: { type: 'forest', name: 'Лес' },
    15: { type: 'forest', name: 'Густой лес' },
    23: { type: 'forest', name: 'Эльфийский лес' },
    24: { type: 'forest', name: 'Лес' },
    42: { type: 'forest', name: 'Тёмный лес' },
    43: { type: 'forest', name: 'Тёмный лес' },
    62: { type: 'forest', name: 'Лес' },
    83: { type: 'forest', name: 'Чаща' },
    103: { type: 'forest', name: 'Чаща' },
    123: { type: 'forest', name: 'Чаща' },
    163: { type: 'forest', name: 'Дремучий лес' },
    193: { type: 'forest', name: 'Дремучий лес' },
    233: { type: 'forest', name: 'Лес' },
    273: { type: 'forest', name: 'Лес' },
    40: { type: 'road', name: 'Дорога' },
    41: { type: 'road', name: 'Перекрёсток' },
    60: { type: 'road', name: 'Дорога' },
    61: { type: 'road', name: 'Дорога' },
    80: { type: 'road', name: 'Дорога' },
    100: { type: 'road', name: 'Дорога' },
    120: { type: 'road', name: 'Дорога' },
    319: { type: 'city', name: 'Нейтральный город' },
    160: { type: 'city', name: 'Торговый пост' },
  };

  for (let i = 0; i < total; i++) {
    if (specific[i]) {
      const s = specific[i];
      tiles.push({
        id: i,
        type: s.type || 'grass',
        name: s.name || 'Равнина',
        goldReward: s.goldReward,
        expReward: s.expReward,
        monsterPower: s.monsterPower,
        passable: s.type !== 'water' && s.type !== 'mountain',
      });
    } else {
      tiles.push({
        id: i,
        type: 'grass',
        name: 'Равнина',
        passable: true,
      });
    }
  }

  return tiles;
}

export const MAP_TILES: MapTile[] = generateMap();

export function getTileById(id: number): MapTile | undefined {
  return MAP_TILES[id];
}

// Triangle grid adjacency: each triangle shares edges with 3 neighbors
export function getAdjacentTiles(position: number): number[] {
  const row = Math.floor(position / MAP_COLS);
  const col = position % MAP_COLS;
  const isUp = (row + col) % 2 === 0;
  const adjacent: number[] = [];

  // Left and right neighbors (same row)
  if (col > 0) adjacent.push(row * MAP_COLS + (col - 1));
  if (col < MAP_COLS - 1) adjacent.push(row * MAP_COLS + (col + 1));

  // Third neighbor: up-triangle shares bottom with row+1, down-triangle shares top with row-1
  if (isUp) {
    // Upward triangle: bottom edge neighbor is at (row+1, col)
    if (row < MAP_ROWS - 1) adjacent.push((row + 1) * MAP_COLS + col);
  } else {
    // Downward triangle: top edge neighbor is at (row-1, col)
    if (row > 0) adjacent.push((row - 1) * MAP_COLS + col);
  }

  return adjacent;
}

export function getReachableTiles(startPosition: number, steps: number): number[] {
  const visited = new Set<number>([startPosition]);
  let frontier = [startPosition];

  for (let i = 0; i < steps; i++) {
    const nextFrontier: number[] = [];
    for (const pos of frontier) {
      const neighbors = getAdjacentTiles(pos);
      for (const n of neighbors) {
        const tile = getTileById(n);
        if (tile && tile.passable && !visited.has(n)) {
          visited.add(n);
          nextFrontier.push(n);
        }
      }
    }
    frontier = nextFrontier;
  }

  visited.delete(startPosition);
  return Array.from(visited);
}
