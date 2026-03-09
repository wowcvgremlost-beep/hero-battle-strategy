import type { ArtifactRarity } from './artifacts';

// Grid dimensions for each floor
export const FLOOR_COLS = 50;
export const FLOOR_ROWS = 50;

// Respawn times in minutes
export const BOSS_RESPAWN_MINUTES = 60;
export const MOB_RESPAWN_MINUTES = 5;
// Mob shuffle interval in minutes
export const MOB_SHUFFLE_MINUTES = 3;

export type TileType = 'empty' | 'monster' | 'boss' | 'trap' | 'quest' | 'treasure' | 'entrance' | 'exit' | 'wall';

export interface TowerMonster {
  id: string;
  name: string;
  icon: string;
  power: number;
  goldReward: number;
  expReward: number;
  isBoss: boolean;
}

export interface FloorTrap {
  id: string;
  name: string;
  icon: string;
  damage: number; // gold lost
  description: string;
}

export interface FloorQuest {
  id: string;
  name: string;
  icon: string;
  description: string;
  goldReward: number;
  expReward: number;
}

export interface TowerFloor {
  id: number;
  name: string;
  icon: string;
  description: string;
  minLevel: number;
  theme: string;
  /** Static layout: walls and fixed positions */
  walls: [number, number][];
  /** Entry point (player spawn) */
  entrance: [number, number];
  /** Exit point (boss stands here) */
  exit: [number, number];
  /** Monsters (placed dynamically, shuffle over time) */
  monsters: TowerMonster[];
  boss: TowerMonster;
  traps: FloorTrap[];
  quests: FloorQuest[];
  treasureGold: number;
}

// Seeded random for deterministic mob placement
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Get mob positions based on time-based shuffle seed */
export function getMobPositions(
  floor: TowerFloor,
  nowMs: number,
  walls: Set<string>,
  bossPos: [number, number],
  entrancePos: [number, number]
): Map<string, TowerMonster> {
  const shufflePeriod = MOB_SHUFFLE_MINUTES * 60 * 1000;
  const seed = floor.id * 10000 + Math.floor(nowMs / shufflePeriod);
  const rng = seededRandom(seed);

  // Collect available positions (not wall, not boss, not entrance)
  const available: [number, number][] = [];
  for (let r = 0; r < FLOOR_ROWS; r++) {
    for (let c = 0; c < FLOOR_COLS; c++) {
      const key = `${r},${c}`;
      if (walls.has(key)) continue;
      if (r === bossPos[0] && c === bossPos[1]) continue;
      if (r === entrancePos[0] && c === entrancePos[1]) continue;
      available.push([r, c]);
    }
  }

  // Shuffle available positions
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const result = new Map<string, TowerMonster>();
  floor.monsters.forEach((m, idx) => {
    if (idx < available.length) {
      const [r, c] = available[idx];
      result.set(`${r},${c}`, m);
    }
  });

  return result;
}

/** Get trap positions (also shuffled but less frequently) */
export function getTrapPositions(
  floor: TowerFloor,
  nowMs: number,
  walls: Set<string>,
  occupiedKeys: Set<string>
): Map<string, FloorTrap> {
  const shufflePeriod = MOB_SHUFFLE_MINUTES * 2 * 60 * 1000;
  const seed = floor.id * 90000 + Math.floor(nowMs / shufflePeriod);
  const rng = seededRandom(seed);

  const available: [number, number][] = [];
  for (let r = 0; r < FLOOR_ROWS; r++) {
    for (let c = 0; c < FLOOR_COLS; c++) {
      const key = `${r},${c}`;
      if (walls.has(key) || occupiedKeys.has(key)) continue;
      available.push([r, c]);
    }
  }

  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const result = new Map<string, FloorTrap>();
  floor.traps.forEach((t, idx) => {
    if (idx < available.length) {
      result.set(`${available[idx][0]},${available[idx][1]}`, t);
    }
  });
  return result;
}

/** Get quest positions (static-ish) */
export function getQuestPositions(
  floor: TowerFloor,
  walls: Set<string>,
  occupiedKeys: Set<string>
): Map<string, FloorQuest> {
  const seed = floor.id * 50000 + 42;
  const rng = seededRandom(seed);

  const available: [number, number][] = [];
  for (let r = 0; r < FLOOR_ROWS; r++) {
    for (let c = 0; c < FLOOR_COLS; c++) {
      const key = `${r},${c}`;
      if (walls.has(key) || occupiedKeys.has(key)) continue;
      available.push([r, c]);
    }
  }

  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const result = new Map<string, FloorQuest>();
  floor.quests.forEach((q, idx) => {
    if (idx < available.length) {
      result.set(`${available[idx][0]},${available[idx][1]}`, q);
    }
  });
  return result;
}

// ======================== FLOOR DATA ========================

function m(id: string, name: string, icon: string, power: number, gold: number, exp: number): TowerMonster {
  return { id, name, icon, power, goldReward: gold, expReward: exp, isBoss: false };
}
function b(id: string, name: string, icon: string, power: number, gold: number, exp: number): TowerMonster {
  return { id, name, icon, power, goldReward: gold, expReward: exp, isBoss: true };
}
function trap(id: string, name: string, icon: string, damage: number, desc: string): FloorTrap {
  return { id, name, icon, damage, description: desc };
}
function quest(id: string, name: string, icon: string, desc: string, gold: number, exp: number): FloorQuest {
  return { id, name, icon, description: desc, goldReward: gold, expReward: exp };
}

export const TOWER_FLOORS: TowerFloor[] = [
  {
    id: 1, name: 'Подвал', icon: '🏚️', description: 'Тёмный подвал с крысами и пауками', minLevel: 1,
    theme: 'from-stone-900 to-stone-800',
    walls: [[0,0],[0,3],[0,6],[2,1],[2,5],[4,2],[4,4],[6,1],[6,5]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f1_m1','Крыса','🐀',10,50,10), m('f1_m2','Паук','🕷️',15,70,15),
      m('f1_m3','Летучая мышь','🦇',12,60,12), m('f1_m4','Слизень','🟢',18,80,18),
    ],
    boss: b('f1_boss','Гигантский Паук','🕸️',50,300,80),
    traps: [trap('f1_t1','Паутина','🕸️',30,'Липкая паутина! -30 золота')],
    quests: [quest('f1_q1','Старый свиток','📜','Найти древний свиток',100,30)],
    treasureGold: 100,
  },
  {
    id: 2, name: 'Пещеры', icon: '🕳️', description: 'Извилистые пещеры гоблинов', minLevel: 2,
    theme: 'from-emerald-950 to-stone-900',
    walls: [[0,1],[0,5],[1,3],[3,0],[3,6],[5,2],[5,4],[7,1],[7,5]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f2_m1','Гоблин','👺',25,100,25), m('f2_m2','Гоблин-лучник','🏹',30,120,30),
      m('f2_m3','Тролль','🧌',45,180,45), m('f2_m4','Пещерный волк','🐺',40,160,40),
      m('f2_m5','Гоблин-шаман','🔮',50,200,50),
    ],
    boss: b('f2_boss','Вождь Гоблинов','👑',100,600,180),
    traps: [trap('f2_t1','Яма','🕳️',50,'Провалились в яму! -50 золота'), trap('f2_t2','Камнепад','🪨',40,'Камнепад! -40 золота')],
    quests: [quest('f2_q1','Пленник','🧑‍🦯','Освободить пленника из клетки',200,60)],
    treasureGold: 200,
  },
  {
    id: 3, name: 'Склеп', icon: '⚰️', description: 'Древний склеп нежити', minLevel: 3,
    theme: 'from-violet-950 to-gray-900',
    walls: [[0,0],[0,6],[1,2],[1,4],[3,1],[3,5],[5,0],[5,6],[7,2],[7,4]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f3_m1','Скелет-воин','💀',50,200,50), m('f3_m2','Зомби','🧟',55,220,55),
      m('f3_m3','Призрак','👻',60,240,60), m('f3_m4','Банши','😱',70,280,70),
      m('f3_m5','Вампир','🧛',85,340,85),
    ],
    boss: b('f3_boss','Лич','🧙',180,1200,360),
    traps: [trap('f3_t1','Проклятие','💜',60,'Проклятие мертвецов! -60 золота'), trap('f3_t2','Ловушка костей','🦴',45,'Острые кости! -45 золота')],
    quests: [quest('f3_q1','Древний артефакт','🏺','Найти артефакт некроманта',400,100)],
    treasureGold: 350,
  },
  {
    id: 4, name: 'Лес Теней', icon: '🌲', description: 'Зачарованный тёмный лес', minLevel: 4,
    theme: 'from-green-950 to-emerald-950',
    walls: [[0,1],[0,5],[2,0],[2,3],[2,6],[4,1],[4,5],[6,0],[6,6]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f4_m1','Волк','🐺',80,320,80), m('f4_m2','Энт','🌳',90,360,90),
      m('f4_m3','Виверна','🦅',100,400,100), m('f4_m4','Василиск','🐍',110,440,110),
      m('f4_m5','Тёмный Эльф','🏴',120,480,120),
    ],
    boss: b('f4_boss','Хозяин Леса','🦌',280,1800,540),
    traps: [trap('f4_t1','Ядовитые шипы','🌿',70,'Ядовитые шипы! -70 золота'), trap('f4_t2','Трясина','🟤',55,'Засасывающая трясина! -55 золота')],
    quests: [quest('f4_q1','Эльфийский клинок','🗡️','Найти легендарный клинок',500,150)],
    treasureGold: 500,
  },
  {
    id: 5, name: 'Руины Храма', icon: '🏛️', description: 'Разрушенный древний храм', minLevel: 5,
    theme: 'from-amber-950 to-stone-900',
    walls: [[0,0],[0,6],[1,1],[1,5],[3,2],[3,4],[5,1],[5,5],[7,0],[7,6]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f5_m1','Горгулья','🗿',120,480,120), m('f5_m2','Минотавр','🐂',140,560,140),
      m('f5_m3','Химера','🐲',150,600,150), m('f5_m4','Медуза','🐍',160,640,160),
      m('f5_m5','Голем','🪨',170,680,170),
    ],
    boss: b('f5_boss','Титан','🏛️',400,3000,800),
    traps: [trap('f5_t1','Ловушка храма','⚡',90,'Молния ловушки! -90 золота'), trap('f5_t2','Обвал','🏚️',80,'Стены рушатся! -80 золота')],
    quests: [quest('f5_q1','Реликвия','✨','Найти священную реликвию',800,200)],
    treasureGold: 700,
  },
  {
    id: 6, name: 'Вулканическая Кузня', icon: '🌋', description: 'Жаркие пещеры под вулканом', minLevel: 7,
    theme: 'from-red-950 to-orange-950',
    walls: [[0,2],[0,4],[1,0],[1,6],[3,1],[3,3],[3,5],[5,0],[5,6],[7,2],[7,4]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f6_m1','Огненный элементаль','🔥',200,800,200), m('f6_m2','Лавовый голем','🪨',220,880,220),
      m('f6_m3','Ифрит','🧞',240,960,240), m('f6_m4','Саламандра','🦎',260,1040,260),
      m('f6_m5','Адский пёс','🐕',230,920,230),
    ],
    boss: b('f6_boss','Красный Дракон','🐉',600,5000,1200),
    traps: [trap('f6_t1','Лавовый гейзер','🌋',120,'Лава! -120 золота'), trap('f6_t2','Огненная стена','🔥',100,'Стена огня! -100 золота')],
    quests: [quest('f6_q1','Драконий зуб','🦷','Добыть зуб дракона',1200,300)],
    treasureGold: 1000,
  },
  {
    id: 7, name: 'Ледяная Крепость', icon: '🏔️', description: 'Замёрзшая крепость на вершине', minLevel: 9,
    theme: 'from-blue-950 to-cyan-950',
    walls: [[0,0],[0,6],[2,2],[2,4],[3,0],[3,6],[5,2],[5,4],[7,0],[7,6]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f7_m1','Ледяной голем','🧊',300,1200,300), m('f7_m2','Снежный тролль','❄️',320,1280,320),
      m('f7_m3','Йети','🦍',340,1360,340), m('f7_m4','Ледяная ведьма','🧙‍♀️',360,1440,360),
      m('f7_m5','Ледяной рыцарь','🛡️',400,1600,400),
    ],
    boss: b('f7_boss','Ледяной Король','👑',900,7000,1800),
    traps: [trap('f7_t1','Ледяной шип','🧊',150,'Ледяной шип! -150 золота'), trap('f7_t2','Метель','🌨️',130,'Ослепляющая метель! -130 золота')],
    quests: [quest('f7_q1','Замёрзшее сердце','💎','Найти замёрзшее сердце',2000,500)],
    treasureGold: 1500,
  },
  {
    id: 8, name: 'Крепость Демонов', icon: '🏚️', description: 'Врата в измерение демонов', minLevel: 11,
    theme: 'from-rose-950 to-red-950',
    walls: [[0,1],[0,5],[1,3],[2,0],[2,6],[4,1],[4,5],[6,0],[6,6]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f8_m1','Бес','😈',400,1600,400), m('f8_m2','Суккуб','💋',430,1720,430),
      m('f8_m3','Демон-страж','👿',460,1840,460), m('f8_m4','Адское пламя','🔥',490,1960,490),
      m('f8_m5','Балрог','⚡',550,2200,550),
    ],
    boss: b('f8_boss','Архидемон','💀',1300,10000,2500),
    traps: [trap('f8_t1','Адское пламя','🔥',200,'Демоническое пламя! -200 золота'), trap('f8_t2','Проклятие тьмы','🌑',180,'Проклятие! -180 золота')],
    quests: [quest('f8_q1','Печать демона','🔮','Найти демоническую печать',3000,700)],
    treasureGold: 2500,
  },
  {
    id: 9, name: 'Храм Бездны', icon: '🌀', description: 'Мистическое измерение хаоса', minLevel: 13,
    theme: 'from-purple-950 to-indigo-950',
    walls: [[0,0],[0,6],[1,2],[1,4],[3,1],[3,5],[4,3],[6,2],[6,4],[7,0],[7,6]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f9_m1','Тень Бездны','🌑',550,2200,550), m('f9_m2','Хранитель Пустоты','🌌',600,2400,600),
      m('f9_m3','Воплощение Хаоса','💫',650,2600,650), m('f9_m4','Пожиратель душ','👁️',700,2800,700),
      m('f9_m5','Титан Пустоты','🕳️',750,3000,750),
    ],
    boss: b('f9_boss','Бог Бездны','👁️‍🗨️',1800,15000,4000),
    traps: [trap('f9_t1','Разрыв пространства','🌀',250,'Разрыв пространства! -250 золота'), trap('f9_t2','Хаос-волна','💫',220,'Волна хаоса! -220 золота')],
    quests: [quest('f9_q1','Осколок бездны','💠','Собрать осколок бездны',5000,1200)],
    treasureGold: 4000,
  },
  {
    id: 10, name: 'Трон Вечности', icon: '👑', description: 'Последний рубеж — Трон Создателя', minLevel: 15,
    theme: 'from-yellow-950 to-amber-950',
    walls: [[0,0],[0,6],[1,1],[1,5],[2,3],[4,0],[4,6],[5,2],[5,4],[7,1],[7,5]],
    entrance: [7, 3], exit: [0, 3],
    monsters: [
      m('f10_m1','Серафим','😇',800,3200,800), m('f10_m2','Архангел','⚔️',900,3600,900),
      m('f10_m3','Страж Вечности','🛡️',1000,4000,1000), m('f10_m4','Хронос','⏳',1100,4400,1100),
      m('f10_m5','Немезида','⚡',1300,5200,1300),
    ],
    boss: b('f10_boss','Создатель','🌟',2500,25000,6000),
    traps: [trap('f10_t1','Суд Вечности','⚖️',300,'Суд Вечности! -300 золота'), trap('f10_t2','Петля времени','⏳',280,'Петля времени! -280 золота')],
    quests: [quest('f10_q1','Корона Создателя','👑','Найти Корону Создателя',10000,3000)],
    treasureGold: 8000,
  },
];

export function getTowerFloor(floorId: number): TowerFloor | undefined {
  return TOWER_FLOORS.find(f => f.id === floorId);
}
