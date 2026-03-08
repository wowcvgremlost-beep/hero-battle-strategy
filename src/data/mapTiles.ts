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

// 48-tile hex map (8 columns x 6 rows, but represented as linear array)
export const MAP_TILES: MapTile[] = [
  // Row 0
  { id: 0, type: 'city', name: 'Ваш город', passable: true },
  { id: 1, type: 'road', name: 'Дорога', passable: true },
  { id: 2, type: 'grass', name: 'Равнина', passable: true },
  { id: 3, type: 'treasure', name: 'Сундук', goldReward: 500, passable: true },
  { id: 4, type: 'grass', name: 'Равнина', passable: true },
  { id: 5, type: 'forest', name: 'Лес', passable: true },
  { id: 6, type: 'monster', name: 'Логово гоблинов', monsterPower: 50, goldReward: 300, expReward: 50, passable: true },
  { id: 7, type: 'grass', name: 'Равнина', passable: true },
  
  // Row 1
  { id: 8, type: 'road', name: 'Дорога', passable: true },
  { id: 9, type: 'grass', name: 'Равнина', passable: true },
  { id: 10, type: 'forest', name: 'Густой лес', passable: true },
  { id: 11, type: 'grass', name: 'Равнина', passable: true },
  { id: 12, type: 'mine', name: 'Золотая шахта', goldReward: 1000, passable: true },
  { id: 13, type: 'mountain', name: 'Горы', passable: false },
  { id: 14, type: 'grass', name: 'Равнина', passable: true },
  { id: 15, type: 'treasure', name: 'Руины', goldReward: 800, expReward: 30, passable: true },
  
  // Row 2
  { id: 16, type: 'grass', name: 'Равнина', passable: true },
  { id: 17, type: 'monster', name: 'Пещера троллей', monsterPower: 100, goldReward: 600, expReward: 100, passable: true },
  { id: 18, type: 'grass', name: 'Равнина', passable: true },
  { id: 19, type: 'water', name: 'Озеро', passable: false },
  { id: 20, type: 'water', name: 'Озеро', passable: false },
  { id: 21, type: 'grass', name: 'Равнина', passable: true },
  { id: 22, type: 'forest', name: 'Эльфийский лес', passable: true },
  { id: 23, type: 'monster', name: 'Логово орков', monsterPower: 150, goldReward: 900, expReward: 150, passable: true },
  
  // Row 3
  { id: 24, type: 'treasure', name: 'Алтарь', expReward: 100, passable: true },
  { id: 25, type: 'grass', name: 'Равнина', passable: true },
  { id: 26, type: 'road', name: 'Дорога', passable: true },
  { id: 27, type: 'road', name: 'Перекрёсток', passable: true },
  { id: 28, type: 'road', name: 'Дорога', passable: true },
  { id: 29, type: 'grass', name: 'Равнина', passable: true },
  { id: 30, type: 'mine', name: 'Рудник кристаллов', goldReward: 1500, passable: true },
  { id: 31, type: 'mountain', name: 'Горный хребет', passable: false },
  
  // Row 4
  { id: 32, type: 'forest', name: 'Тёмный лес', passable: true },
  { id: 33, type: 'monster', name: 'Драконье логово', monsterPower: 300, goldReward: 2000, expReward: 300, passable: true },
  { id: 34, type: 'grass', name: 'Равнина', passable: true },
  { id: 35, type: 'treasure', name: 'Артефакт', goldReward: 1200, expReward: 80, passable: true },
  { id: 36, type: 'grass', name: 'Равнина', passable: true },
  { id: 37, type: 'forest', name: 'Лес', passable: true },
  { id: 38, type: 'grass', name: 'Равнина', passable: true },
  { id: 39, type: 'monster', name: 'Башня мага', monsterPower: 200, goldReward: 1500, expReward: 200, passable: true },
  
  // Row 5
  { id: 40, type: 'grass', name: 'Равнина', passable: true },
  { id: 41, type: 'grass', name: 'Равнина', passable: true },
  { id: 42, type: 'treasure', name: 'Заброшенный храм', goldReward: 1000, expReward: 50, passable: true },
  { id: 43, type: 'monster', name: 'Некрополь', monsterPower: 250, goldReward: 1800, expReward: 250, passable: true },
  { id: 44, type: 'grass', name: 'Равнина', passable: true },
  { id: 45, type: 'water', name: 'Река', passable: false },
  { id: 46, type: 'grass', name: 'Равнина', passable: true },
  { id: 47, type: 'city', name: 'Нейтральный город', passable: true },
];

export const MAP_COLS = 8;
export const MAP_ROWS = 6;

export function getTileById(id: number): MapTile | undefined {
  return MAP_TILES.find(t => t.id === id);
}

export function getAdjacentTiles(position: number): number[] {
  const row = Math.floor(position / MAP_COLS);
  const col = position % MAP_COLS;
  const isOddRow = row % 2 === 1;
  
  const adjacent: number[] = [];
  
  // Hex grid adjacency (pointy-top)
  const directions = isOddRow
    ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
    : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < MAP_ROWS && newCol >= 0 && newCol < MAP_COLS) {
      adjacent.push(newRow * MAP_COLS + newCol);
    }
  }
  
  return adjacent;
}

// Get tiles reachable within N steps
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
