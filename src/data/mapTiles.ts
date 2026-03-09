export type TileType = 'grass' | 'forest' | 'mountain' | 'water' | 'road' | 'city' | 'mine' | 'treasure' | 'monster' | 'npc' | 'artifact' | 'dungeon' | 'empty';

export interface MapTile {
  id: number;
  type: TileType;
  name: string;
  goldReward?: number;
  expReward?: number;
  monsterPower?: number;
  passable: boolean;
  npcQuestId?: string;
  artifactRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  dungeonId?: string;
}

export const MAP_COLS = 60;
export const MAP_ROWS = 50;

// Seeded random for deterministic map
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMap(): MapTile[] {
  const tiles: MapTile[] = [];
  const total = MAP_COLS * MAP_ROWS;
  const rand = seededRandom(42);

  // Pre-place specific landmarks
  const specific: Record<number, Partial<MapTile>> = {};

  // Cities (scattered)
  const cities = [
    [0, 0, 'Замок Света'],
    [5, 55, 'Крепость Тьмы'],
    [25, 30, 'Нейтральный город'],
    [12, 15, 'Торговый пост'],
    [40, 10, 'Портовый город'],
    [45, 50, 'Горная цитадель'],
    [8, 45, 'Эльфийская столица'],
    [35, 25, 'Подземный город'],
    [20, 50, 'Башня магов'],
    [48, 30, 'Древний храм'],
  ];
  for (const [r, c, name] of cities) {
    specific[(r as number) * MAP_COLS + (c as number)] = { type: 'city', name: name as string };
  }

  // Generate water bodies (lakes, rivers)
  const waterSeeds = [[10, 25], [20, 40], [30, 15], [40, 45], [15, 50], [35, 5], [25, 10], [45, 25]];
  for (const [sr, sc] of waterSeeds) {
    const size = Math.floor(rand() * 8) + 4;
    let wr = sr, wc = sc;
    for (let i = 0; i < size; i++) {
      const id = wr * MAP_COLS + wc;
      if (wr >= 0 && wr < MAP_ROWS && wc >= 0 && wc < MAP_COLS) {
        specific[id] = { type: 'water', name: i < 3 ? 'Озеро' : 'Река' };
      }
      const dir = rand();
      if (dir < 0.33) wc += 1;
      else if (dir < 0.66) wr += 1;
      else wc -= 1;
      wr = Math.max(0, Math.min(MAP_ROWS - 1, wr));
      wc = Math.max(0, Math.min(MAP_COLS - 1, wc));
    }
  }

  // Mountain ranges
  const mountainSeeds = [[5, 30], [15, 10], [30, 45], [40, 20], [25, 55], [10, 5], [45, 40], [35, 35]];
  for (const [sr, sc] of mountainSeeds) {
    const size = Math.floor(rand() * 6) + 3;
    let mr = sr, mc = sc;
    for (let i = 0; i < size; i++) {
      const id = mr * MAP_COLS + mc;
      if (mr >= 0 && mr < MAP_ROWS && mc >= 0 && mc < MAP_COLS && !specific[id]) {
        specific[id] = { type: 'mountain', name: ['Горы', 'Горный хребет', 'Скалы', 'Утёсы', 'Горный пик'][Math.floor(rand() * 5)] };
      }
      mc += rand() < 0.5 ? 1 : -1;
      mr += rand() < 0.5 ? 1 : 0;
      mr = Math.max(0, Math.min(MAP_ROWS - 1, mr));
      mc = Math.max(0, Math.min(MAP_COLS - 1, mc));
    }
  }

  // Forests
  for (let i = 0; i < 120; i++) {
    const r = Math.floor(rand() * MAP_ROWS);
    const c = Math.floor(rand() * MAP_COLS);
    const id = r * MAP_COLS + c;
    if (!specific[id]) {
      specific[id] = { type: 'forest', name: ['Лес', 'Густой лес', 'Тёмный лес', 'Чаща', 'Дремучий лес', 'Эльфийский лес'][Math.floor(rand() * 6)] };
    }
  }

  // Treasures
  const treasureNames = [
    { name: 'Сундук', goldReward: 500 },
    { name: 'Руины', goldReward: 800, expReward: 30 },
    { name: 'Алтарь', expReward: 100 },
    { name: 'Артефакт', goldReward: 1200, expReward: 80 },
    { name: 'Заброшенный храм', goldReward: 1000, expReward: 50 },
    { name: 'Древний свиток', expReward: 150 },
    { name: 'Золотой идол', goldReward: 1500 },
    { name: 'Магический кристалл', expReward: 200 },
    { name: 'Сокровищница', goldReward: 2000, expReward: 100 },
    { name: 'Реликвия', goldReward: 1800, expReward: 120 },
  ];
  for (let i = 0; i < 40; i++) {
    const r = Math.floor(rand() * MAP_ROWS);
    const c = Math.floor(rand() * MAP_COLS);
    const id = r * MAP_COLS + c;
    if (!specific[id]) {
      const t = treasureNames[Math.floor(rand() * treasureNames.length)];
      specific[id] = { type: 'treasure', ...t };
    }
  }

  // Mines
  const mineNames = [
    { name: 'Золотая шахта', goldReward: 1000 },
    { name: 'Рудник кристаллов', goldReward: 1500 },
    { name: 'Серебряный рудник', goldReward: 1200 },
    { name: 'Алмазная копь', goldReward: 2000 },
    { name: 'Изумрудная шахта', goldReward: 1800 },
  ];
  for (let i = 0; i < 20; i++) {
    const r = Math.floor(rand() * MAP_ROWS);
    const c = Math.floor(rand() * MAP_COLS);
    const id = r * MAP_COLS + c;
    if (!specific[id]) {
      const m = mineNames[Math.floor(rand() * mineNames.length)];
      specific[id] = { type: 'mine', ...m };
    }
  }

  // Monsters (scaled by distance from center)
  const monsterNames = [
    { name: 'Логово гоблинов', monsterPower: 50, goldReward: 300, expReward: 50 },
    { name: 'Пещера троллей', monsterPower: 100, goldReward: 600, expReward: 100 },
    { name: 'Логово орков', monsterPower: 150, goldReward: 900, expReward: 150 },
    { name: 'Башня мага', monsterPower: 200, goldReward: 1500, expReward: 200 },
    { name: 'Некрополь', monsterPower: 250, goldReward: 1800, expReward: 250 },
    { name: 'Драконье логово', monsterPower: 300, goldReward: 2000, expReward: 300 },
    { name: 'Замок демонов', monsterPower: 350, goldReward: 2500, expReward: 350 },
    { name: 'Цитадель нежити', monsterPower: 400, goldReward: 3000, expReward: 400 },
    { name: 'Логово гидры', monsterPower: 450, goldReward: 3500, expReward: 450 },
    { name: 'Чёрная башня', monsterPower: 500, goldReward: 4000, expReward: 500 },
  ];
  for (let i = 0; i < 50; i++) {
    const r = Math.floor(rand() * MAP_ROWS);
    const c = Math.floor(rand() * MAP_COLS);
    const id = r * MAP_COLS + c;
    if (!specific[id]) {
      const m = monsterNames[Math.floor(rand() * monsterNames.length)];
      specific[id] = { type: 'monster', ...m };
    }
  }

  // Artifacts scattered across the map
  const artifactSpawns: { pos: number; name: string; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' }[] = [
    // Common artifacts
    { pos: 4 * MAP_COLS + 8, name: 'Старый сундук', rarity: 'common' },
    { pos: 9 * MAP_COLS + 35, name: 'Забытый тайник', rarity: 'common' },
    { pos: 16 * MAP_COLS + 12, name: 'Разрушенная повозка', rarity: 'common' },
    { pos: 22 * MAP_COLS + 52, name: 'Заброшенный лагерь', rarity: 'common' },
    { pos: 31 * MAP_COLS + 18, name: 'Скрытая пещера', rarity: 'common' },
    { pos: 38 * MAP_COLS + 42, name: 'Древний колодец', rarity: 'common' },
    { pos: 44 * MAP_COLS + 8, name: 'Руины сторожки', rarity: 'common' },
    { pos: 47 * MAP_COLS + 28, name: 'Потерянный мешок', rarity: 'common' },
    // Uncommon artifacts
    { pos: 7 * MAP_COLS + 22, name: 'Могила героя', rarity: 'uncommon' },
    { pos: 13 * MAP_COLS + 45, name: 'Заколдованный грот', rarity: 'uncommon' },
    { pos: 24 * MAP_COLS + 7, name: 'Склеп рыцаря', rarity: 'uncommon' },
    { pos: 33 * MAP_COLS + 38, name: 'Тайная комната', rarity: 'uncommon' },
    { pos: 41 * MAP_COLS + 55, name: 'Логово отшельника', rarity: 'uncommon' },
    // Rare artifacts
    { pos: 11 * MAP_COLS + 30, name: 'Древний храм', rarity: 'rare' },
    { pos: 28 * MAP_COLS + 48, name: 'Гробница короля', rarity: 'rare' },
    { pos: 37 * MAP_COLS + 15, name: 'Святилище', rarity: 'rare' },
    // Epic artifacts
    { pos: 19 * MAP_COLS + 38, name: 'Башня архимага', rarity: 'epic' },
    { pos: 43 * MAP_COLS + 25, name: 'Портал в бездну', rarity: 'epic' },
    // Legendary artifact
    { pos: 25 * MAP_COLS + 30, name: 'Алтарь богов', rarity: 'legendary' },
  ];
  for (const spawn of artifactSpawns) {
    if (!specific[spawn.pos]) {
      specific[spawn.pos] = { 
        type: 'artifact' as TileType, 
        name: spawn.name, 
        artifactRarity: spawn.rarity 
      };
    }
  }

  // Dungeon entrances
  const dungeonSpawns: { pos: number; name: string; dungeonId: string }[] = [
    { pos: 6 * MAP_COLS + 15, name: '🕳️ Пещеры Гоблинов', dungeonId: 'goblin_caves' },
    { pos: 15 * MAP_COLS + 40, name: '⚰️ Склеп Нежити', dungeonId: 'undead_crypt' },
    { pos: 30 * MAP_COLS + 20, name: '🌋 Логово Дракона', dungeonId: 'dragon_lair' },
    { pos: 40 * MAP_COLS + 48, name: '🏚️ Крепость Демонов', dungeonId: 'demon_fortress' },
    { pos: 25 * MAP_COLS + 30, name: '🌀 Храм Бездны', dungeonId: 'void_temple' },
  ];
  for (const spawn of dungeonSpawns) {
    if (!specific[spawn.pos]) {
      specific[spawn.pos] = {
        type: 'dungeon' as TileType,
        name: spawn.name,
        dungeonId: spawn.dungeonId,
      };
    }
  }

  // NPC quest givers
  const npcPositions: [number, string, string][] = [
    [3 * MAP_COLS + 10, 'Староста', 'kill_goblins'],
    [7 * MAP_COLS + 40, 'Купец', 'collect_gold_1'],
    [12 * MAP_COLS + 25, 'Следопыт', 'explore_tiles'],
    [18 * MAP_COLS + 8, 'Архитектор', 'build_first'],
    [22 * MAP_COLS + 45, 'Генерал', 'hire_army'],
    [28 * MAP_COLS + 15, 'Охотник', 'kill_strong'],
    [33 * MAP_COLS + 50, 'Банкир', 'collect_gold_2'],
    [38 * MAP_COLS + 33, 'Мудрец', 'explore_far'],
    [42 * MAP_COLS + 12, 'Мастер', 'build_many'],
    [46 * MAP_COLS + 38, 'Маршал', 'hire_legion'],
    [6 * MAP_COLS + 20, 'Оракул', 'kill_bosses'],
    [14 * MAP_COLS + 48, 'Дракон', 'collect_gold_3'],
    [26 * MAP_COLS + 5, 'Странник', 'explore_world'],
    [36 * MAP_COLS + 44, 'Полководец', 'hire_horde'],
  ];
  for (const [pos, name, questId] of npcPositions) {
    if (pos >= 0 && pos < total) {
      specific[pos] = { type: 'npc' as TileType, name: `NPC: ${name}`, npcQuestId: questId };
    }
  }

  // Roads connecting cities
  for (const [r, c] of cities) {
    const startR = r as number, startC = c as number;
    let cr = startR, cc = startC;
    const targetR = 25, targetC = 30; // toward center
    const steps = Math.abs(targetR - cr) + Math.abs(targetC - cc);
    for (let s = 0; s < Math.min(steps, 15); s++) {
      if (Math.abs(targetR - cr) > Math.abs(targetC - cc)) {
        cr += targetR > cr ? 1 : -1;
      } else {
        cc += targetC > cc ? 1 : -1;
      }
      const id = cr * MAP_COLS + cc;
      if (!specific[id]) {
        specific[id] = { type: 'road', name: 'Дорога' };
      }
    }
  }

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
        npcQuestId: s.npcQuestId,
        artifactRarity: s.artifactRarity,
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

// Get a random passable spawn position
export function getRandomSpawnPosition(): number {
  const passable = MAP_TILES.filter(t => t.passable && t.type === 'grass');
  return passable[Math.floor(Math.random() * passable.length)].id;
}

// Triangle grid adjacency
export function getAdjacentTiles(position: number): number[] {
  const row = Math.floor(position / MAP_COLS);
  const col = position % MAP_COLS;
  const isUp = (row + col) % 2 === 0;
  const adjacent: number[] = [];

  if (col > 0) adjacent.push(row * MAP_COLS + (col - 1));
  if (col < MAP_COLS - 1) adjacent.push(row * MAP_COLS + (col + 1));

  if (isUp) {
    if (row < MAP_ROWS - 1) adjacent.push((row + 1) * MAP_COLS + col);
  } else {
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

// Get all tiles within fog-of-war reveal radius
export function getVisibleTiles(position: number, radius: number = 4): Set<number> {
  const visible = new Set<number>([position]);
  let frontier = [position];

  for (let i = 0; i < radius; i++) {
    const nextFrontier: number[] = [];
    for (const pos of frontier) {
      const neighbors = getAdjacentTiles(pos);
      for (const n of neighbors) {
        if (!visible.has(n) && n >= 0 && n < MAP_COLS * MAP_ROWS) {
          visible.add(n);
          nextFrontier.push(n);
        }
      }
    }
    frontier = nextFrontier;
  }

  return visible;
}
