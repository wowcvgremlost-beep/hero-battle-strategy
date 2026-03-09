export type TileCategory = 'safe' | 'combat' | 'random' | 'quest' | 'mystic';

export interface MapTile {
  id: number; // encoded as row * 10000 + col
  row: number;
  col: number;
  category: TileCategory;
  type: string;
  name: string;
  goldReward?: number;
  expReward?: number;
  monsterPower?: number;
  passable: boolean;
  npcQuestId?: string;
  artifactRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  dungeonId?: string;
  difficulty?: number; // 1-10 for combat tiles
}

// Encode/decode position
export function encodePos(row: number, col: number): number {
  // Support negative coords: offset by 50000
  return (row + 50000) * 100000 + (col + 50000);
}
export function decodePos(id: number): { row: number; col: number } {
  const col = (id % 100000) - 50000;
  const row = Math.floor(id / 100000) - 50000;
  return { row, col };
}

// Deterministic hash for any coordinate
function hashCoord(row: number, col: number, seed: number = 42): number {
  let h = seed;
  h = ((h << 5) + h + row) | 0;
  h = ((h << 5) + h + col) | 0;
  h = ((h * 2654435761) >>> 0);
  return h;
}

function hashFloat(row: number, col: number, seed: number = 42): number {
  return (hashCoord(row, col, seed) % 10000) / 10000;
}

// Distance from origin for scaling difficulty
function distFromOrigin(row: number, col: number): number {
  return Math.sqrt(row * row + col * col);
}

// Fixed landmarks (cities, dungeons, key NPCs)
const LANDMARKS: Record<string, Partial<MapTile>> = {};

function addLandmark(row: number, col: number, data: Partial<MapTile>) {
  LANDMARKS[`${row},${col}`] = data;
}

// Cities
const CITIES: [number, number, string][] = [
  [0, 0, 'Замок Света'],
  [15, 40, 'Крепость Тьмы'],
  [-20, 30, 'Торговый пост'],
  [25, -15, 'Портовый город'],
  [-10, -25, 'Эльфийская столица'],
  [30, 20, 'Горная цитадель'],
  [-30, -10, 'Подземный город'],
  [10, -35, 'Башня магов'],
  [-15, 45, 'Древний храм'],
  [40, -30, 'Северная крепость'],
  [-40, 20, 'Южный оазис'],
  [20, 50, 'Восточные врата'],
];
for (const [r, c, name] of CITIES) {
  addLandmark(r, c, { category: 'safe', type: 'city', name, passable: true });
}

// Dungeons
const DUNGEONS: [number, number, string, string][] = [
  [8, 12, '🕳️ Пещеры Гоблинов', 'goblin_caves'],
  [-12, 35, '⚰️ Склеп Нежити', 'undead_crypt'],
  [22, -8, '🌋 Логово Дракона', 'dragon_lair'],
  [-25, -18, '🏚️ Крепость Демонов', 'demon_fortress'],
  [35, 30, '🌀 Храм Бездны', 'void_temple'],
];
for (const [r, c, name, id] of DUNGEONS) {
  addLandmark(r, c, { category: 'mystic', type: 'dungeon', name, dungeonId: id, passable: true });
}

// NPCs
const NPCS: [number, number, string, string][] = [
  [3, 8, 'Староста', 'kill_goblins'],
  [-5, 20, 'Купец', 'collect_gold_1'],
  [10, -10, 'Следопыт', 'explore_tiles'],
  [-8, -15, 'Архитектор', 'build_first'],
  [18, 25, 'Генерал', 'hire_army'],
  [-18, 10, 'Охотник', 'kill_strong'],
  [28, -20, 'Банкир', 'collect_gold_2'],
  [-28, 35, 'Мудрец', 'explore_far'],
  [38, 15, 'Мастер', 'build_many'],
  [-35, -25, 'Маршал', 'hire_legion'],
  [5, -30, 'Оракул', 'kill_bosses'],
  [-15, 50, 'Странник', 'explore_world'],
];
for (const [r, c, name, qid] of NPCS) {
  addLandmark(r, c, { category: 'quest', type: 'npc', name: `NPC: ${name}`, npcQuestId: qid, passable: true });
}

// Artifact spots
const ARTIFACTS: [number, number, string, 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'][] = [
  [4, 6, 'Старый сундук', 'common'],
  [-7, 18, 'Забытый тайник', 'common'],
  [12, -5, 'Разрушенная повозка', 'common'],
  [-20, 40, 'Заброшенный лагерь', 'common'],
  [6, -22, 'Могила героя', 'uncommon'],
  [-14, 28, 'Заколдованный грот', 'uncommon'],
  [24, 8, 'Склеп рыцаря', 'uncommon'],
  [-9, -30, 'Древний храм', 'rare'],
  [30, -12, 'Гробница короля', 'rare'],
  [16, 35, 'Башня архимага', 'epic'],
  [-32, 15, 'Портал в бездну', 'epic'],
  [0, 25, 'Алтарь богов', 'legendary'],
];
for (const [r, c, name, rarity] of ARTIFACTS) {
  addLandmark(r, c, { category: 'mystic', type: 'artifact', name, artifactRarity: rarity, passable: true });
}

// Monster names by difficulty tier
const MONSTERS_BY_TIER: { name: string; basePower: number }[][] = [
  // Tier 1-2 (easy)
  [{ name: 'Гоблины', basePower: 30 }, { name: 'Крысы', basePower: 20 }, { name: 'Скелеты', basePower: 40 }],
  // Tier 3-4
  [{ name: 'Орки', basePower: 80 }, { name: 'Волки', basePower: 60 }, { name: 'Тролль', basePower: 100 }],
  // Tier 5-6
  [{ name: 'Огры', basePower: 150 }, { name: 'Нежить', basePower: 130 }, { name: 'Горгульи', basePower: 170 }],
  // Tier 7-8
  [{ name: 'Демоны', basePower: 250 }, { name: 'Циклоп', basePower: 220 }, { name: 'Гидра', basePower: 280 }],
  // Tier 9-10
  [{ name: 'Дракон', basePower: 400 }, { name: 'Лич', basePower: 350 }, { name: 'Архидемон', basePower: 500 }],
];

const TREASURE_NAMES = ['Сундук', 'Руины', 'Алтарь', 'Золотой идол', 'Сокровищница', 'Древний свиток'];
const MINE_NAMES = ['Золотая шахта', 'Рудник кристаллов', 'Серебряный рудник', 'Алмазная копь'];

const QUEST_EVENTS = ['Таинственный странник', 'Зов о помощи', 'Загадочное письмо', 'Древний знак'];
const MYSTIC_EVENTS = ['Магический источник', 'Руны силы', 'Призрачный огонь', 'Портал', 'Зачарованный круг'];

// Generate tile for any coordinate
export function generateTile(row: number, col: number): MapTile {
  const key = `${row},${col}`;
  const id = encodePos(row, col);

  // Check landmarks first
  if (LANDMARKS[key]) {
    const lm = LANDMARKS[key];
    const dist = distFromOrigin(row, col);
    const difficulty = lm.type === 'dungeon' ? Math.min(10, Math.max(1, Math.floor(dist / 5) + 1)) : undefined;
    return {
      id, row, col,
      category: lm.category || 'safe',
      type: lm.type || 'safe',
      name: lm.name || '',
      passable: lm.passable !== false,
      goldReward: lm.goldReward,
      expReward: lm.expReward,
      monsterPower: lm.monsterPower,
      npcQuestId: lm.npcQuestId,
      artifactRarity: lm.artifactRarity,
      dungeonId: lm.dungeonId,
      difficulty,
    };
  }

  const dist = distFromOrigin(row, col);
  const h = hashFloat(row, col);
  const h2 = hashFloat(row, col, 137);
  const h3 = hashFloat(row, col, 293);

  // Water/mountain (impassable) ~8%
  if (h < 0.04) {
    return { id, row, col, category: 'safe', type: 'water', name: 'Вода', passable: false };
  }
  if (h < 0.08) {
    return { id, row, col, category: 'safe', type: 'mountain', name: 'Горы', passable: false };
  }

  // Combat tiles increase with distance ~15%
  const combatChance = Math.min(0.25, 0.10 + dist * 0.002);
  if (h < 0.08 + combatChance) {
    const difficulty = Math.min(10, Math.max(1, Math.floor(dist / 6) + 1));
    const tierIdx = Math.min(4, Math.floor((difficulty - 1) / 2));
    const tier = MONSTERS_BY_TIER[tierIdx];
    const monster = tier[Math.floor(h2 * tier.length)];
    const scaledPower = Math.floor(monster.basePower * (1 + dist * 0.03));
    const goldReward = Math.floor(scaledPower * 2 + h3 * 500);
    const expReward = Math.floor(scaledPower * 0.8 + h3 * 100);
    return {
      id, row, col, category: 'combat', type: 'monster',
      name: monster.name, passable: true,
      monsterPower: scaledPower, goldReward, expReward, difficulty,
    };
  }

  // Random (treasure/mine) ~8%
  if (h < 0.08 + combatChance + 0.08) {
    const isMine = h2 > 0.6;
    const goldReward = Math.floor(300 + dist * 30 + h3 * 1000);
    const expReward = Math.floor(20 + dist * 5 + h3 * 100);
    const names = isMine ? MINE_NAMES : TREASURE_NAMES;
    const name = names[Math.floor(h2 * names.length)];
    return {
      id, row, col, category: 'random', type: isMine ? 'mine' : 'treasure',
      name, passable: true, goldReward, expReward,
    };
  }

  // Quest/NPC ~4%
  if (h < 0.08 + combatChance + 0.08 + 0.04) {
    const name = QUEST_EVENTS[Math.floor(h2 * QUEST_EVENTS.length)];
    return {
      id, row, col, category: 'quest', type: 'npc',
      name, passable: true,
    };
  }

  // Mystic ~3%
  if (h < 0.08 + combatChance + 0.08 + 0.04 + 0.03) {
    const name = MYSTIC_EVENTS[Math.floor(h2 * MYSTIC_EVENTS.length)];
    // Random artifact rarity based on distance
    const rarities: ('common' | 'uncommon' | 'rare' | 'epic' | 'legendary')[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const maxRarityIdx = Math.min(4, Math.floor(dist / 10));
    const rarityIdx = Math.min(maxRarityIdx, Math.floor(h3 * (maxRarityIdx + 1)));
    return {
      id, row, col, category: 'mystic', type: 'artifact',
      name, passable: true, artifactRarity: rarities[rarityIdx],
    };
  }

  // Safe (grass/road/forest)
  const subtype = h2 < 0.15 ? 'road' : h2 < 0.35 ? 'forest' : 'grass';
  const forestNames = ['Лес', 'Густой лес', 'Тёмный лес', 'Чаща'];
  const name = subtype === 'road' ? 'Дорога' : subtype === 'forest' ? forestNames[Math.floor(h3 * forestNames.length)] : 'Равнина';
  return {
    id, row, col, category: 'safe', type: subtype,
    name, passable: true,
  };
}

// Tile cache for performance
const tileCache = new Map<string, MapTile>();

export function getTileAt(row: number, col: number): MapTile {
  const key = `${row},${col}`;
  if (tileCache.has(key)) return tileCache.get(key)!;
  const tile = generateTile(row, col);
  tileCache.set(key, tile);
  // Keep cache bounded
  if (tileCache.size > 10000) {
    const firstKey = tileCache.keys().next().value;
    if (firstKey) tileCache.delete(firstKey);
  }
  return tile;
}

export function getTileById(id: number): MapTile {
  const { row, col } = decodePos(id);
  return getTileAt(row, col);
}

// Triangle grid adjacency
export function getAdjacentTiles(row: number, col: number): { row: number; col: number }[] {
  const isUp = (row + col) % 2 === 0;
  const adjacent: { row: number; col: number }[] = [];
  adjacent.push({ row, col: col - 1 });
  adjacent.push({ row, col: col + 1 });
  if (isUp) {
    adjacent.push({ row: row + 1, col });
  } else {
    adjacent.push({ row: row - 1, col });
  }
  return adjacent;
}

export function getReachableTiles(startRow: number, startCol: number, steps: number): { row: number; col: number }[] {
  const visited = new Set<string>();
  visited.add(`${startRow},${startCol}`);
  let frontier = [{ row: startRow, col: startCol }];

  for (let i = 0; i < steps; i++) {
    const nextFrontier: { row: number; col: number }[] = [];
    for (const pos of frontier) {
      const neighbors = getAdjacentTiles(pos.row, pos.col);
      for (const n of neighbors) {
        const key = `${n.row},${n.col}`;
        if (!visited.has(key)) {
          const tile = getTileAt(n.row, n.col);
          if (tile.passable) {
            visited.add(key);
            nextFrontier.push(n);
          }
        }
      }
    }
    frontier = nextFrontier;
  }

  visited.delete(`${startRow},${startCol}`);
  return Array.from(visited).map(k => {
    const [r, c] = k.split(',').map(Number);
    return { row: r, col: c };
  });
}

export function getVisibleTiles(row: number, col: number, radius: number = 4): Set<string> {
  const visible = new Set<string>();
  visible.add(`${row},${col}`);
  let frontier = [{ row, col }];

  for (let i = 0; i < radius; i++) {
    const nextFrontier: { row: number; col: number }[] = [];
    for (const pos of frontier) {
      const neighbors = getAdjacentTiles(pos.row, pos.col);
      for (const n of neighbors) {
        const key = `${n.row},${n.col}`;
        if (!visible.has(key)) {
          visible.add(key);
          nextFrontier.push(n);
        }
      }
    }
    frontier = nextFrontier;
  }

  return visible;
}

// Get a random passable spawn position near origin
export function getRandomSpawnPosition(): { row: number; col: number } {
  for (let attempt = 0; attempt < 100; attempt++) {
    const r = Math.floor(Math.random() * 10) - 5;
    const c = Math.floor(Math.random() * 10) - 5;
    const tile = getTileAt(r, c);
    if (tile.passable && tile.category === 'safe') return { row: r, col: c };
  }
  return { row: 0, col: 1 }; // fallback
}

// Relocate a defeated monster to a nearby position
export function relocateMonster(row: number, col: number): { row: number; col: number } | null {
  // Find a nearby safe tile and swap conceptually
  for (let r = -3; r <= 3; r++) {
    for (let c = -3; c <= 3; c++) {
      if (r === 0 && c === 0) continue;
      const tile = getTileAt(row + r, col + c);
      if (tile.category === 'safe' && tile.passable) {
        return { row: row + r, col: col + c };
      }
    }
  }
  return null;
}

// Legacy compat
export const MAP_COLS = 100;
export const MAP_ROWS = 100;
