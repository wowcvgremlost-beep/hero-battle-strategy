import type { ArtifactRarity } from './artifacts';

export const FLOOR_COLS = 50;
export const FLOOR_ROWS = 50;

export const BOSS_RESPAWN_MINUTES = 60;
export const MOB_RESPAWN_MINUTES = 5;
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
  damage: number;
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
  entrance: [number, number];
  exit: [number, number];
  monsters: TowerMonster[];
  boss: TowerMonster;
  traps: FloorTrap[];
  quests: FloorQuest[];
  treasureGold: number;
  /** Wall density 0-1 for procedural generation */
  wallDensity: number;
}

// Seeded random
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Generate walls procedurally for a floor */
export function getWalls(floor: TowerFloor): Set<string> {
  const walls = new Set<string>();
  const rng = seededRandom(floor.id * 77777);
  const entranceKey = `${floor.entrance[0]},${floor.entrance[1]}`;
  const exitKey = `${floor.exit[0]},${floor.exit[1]}`;

  // Border walls with gaps
  for (let r = 0; r < FLOOR_ROWS; r++) {
    for (let c = 0; c < FLOOR_COLS; c++) {
      const key = `${r},${c}`;
      if (key === entranceKey || key === exitKey) continue;
      // Borders
      if (r === 0 || r === FLOOR_ROWS - 1 || c === 0 || c === FLOOR_COLS - 1) {
        if (rng() < 0.7) walls.add(key);
        continue;
      }
      // Interior walls
      if (rng() < floor.wallDensity) {
        walls.add(key);
      }
    }
  }

  // Ensure entrance and exit area is clear (3x3)
  for (const pos of [floor.entrance, floor.exit]) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        walls.delete(`${pos[0] + dr},${pos[1] + dc}`);
      }
    }
  }

  // Create corridors to ensure connectivity (simple cross paths)
  const midR = Math.floor(FLOOR_ROWS / 2);
  const midC = Math.floor(FLOOR_COLS / 2);
  // Vertical corridor
  for (let r = 0; r < FLOOR_ROWS; r++) {
    walls.delete(`${r},${midC}`);
    walls.delete(`${r},${midC - 1}`);
    walls.delete(`${r},${midC + 1}`);
  }
  // Horizontal corridor
  for (let c = 0; c < FLOOR_COLS; c++) {
    walls.delete(`${midR},${c}`);
    walls.delete(`${midR - 1},${c}`);
    walls.delete(`${midR + 1},${c}`);
  }
  // Diagonal corridors
  for (let i = 0; i < Math.min(FLOOR_ROWS, FLOOR_COLS); i++) {
    walls.delete(`${i},${i}`);
    walls.delete(`${i},${FLOOR_COLS - 1 - i}`);
  }

  return walls;
}

/** Get mob positions based on time-based shuffle seed */
export function getMobPositions(
  floor: TowerFloor,
  nowMs: number,
  walls: Set<string>
): Map<string, TowerMonster> {
  const shufflePeriod = MOB_SHUFFLE_MINUTES * 60 * 1000;
  const seed = floor.id * 10000 + Math.floor(nowMs / shufflePeriod);
  const rng = seededRandom(seed);

  const entranceKey = `${floor.entrance[0]},${floor.entrance[1]}`;
  const exitKey = `${floor.exit[0]},${floor.exit[1]}`;

  const available: [number, number][] = [];
  for (let r = 2; r < FLOOR_ROWS - 2; r++) {
    for (let c = 2; c < FLOOR_COLS - 2; c++) {
      const key = `${r},${c}`;
      if (walls.has(key) || key === entranceKey || key === exitKey) continue;
      available.push([r, c]);
    }
  }

  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const result = new Map<string, TowerMonster>();
  floor.monsters.forEach((m, idx) => {
    if (idx < available.length) {
      result.set(`${available[idx][0]},${available[idx][1]}`, m);
    }
  });
  return result;
}

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
  for (let r = 2; r < FLOOR_ROWS - 2; r++) {
    for (let c = 2; c < FLOOR_COLS - 2; c++) {
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

export function getQuestPositions(
  floor: TowerFloor,
  walls: Set<string>,
  occupiedKeys: Set<string>
): Map<string, FloorQuest> {
  const seed = floor.id * 50000 + 42;
  const rng = seededRandom(seed);

  const available: [number, number][] = [];
  for (let r = 2; r < FLOOR_ROWS - 2; r++) {
    for (let c = 2; c < FLOOR_COLS - 2; c++) {
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
    theme: 'from-stone-900 to-stone-800', wallDensity: 0.08,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f1_m1','Крыса','🐀',10,50,10), m('f1_m2','Паук','🕷️',15,70,15),
      m('f1_m3','Летучая мышь','🦇',12,60,12), m('f1_m4','Слизень','🟢',18,80,18),
      m('f1_m5','Крыса-мутант','🐀',20,90,20), m('f1_m6','Паук-прыгун','🕷️',22,95,22),
      m('f1_m7','Скорпион','🦂',14,65,14), m('f1_m8','Жук','🪲',11,55,11),
      m('f1_m9','Многоножка','🐛',16,75,16), m('f1_m10','Слизень-мутант','🟢',25,110,25),
    ],
    boss: b('f1_boss','Гигантский Паук','🕸️',50,300,80),
    traps: [
      trap('f1_t1','Паутина','🕸️',30,'Липкая паутина! -30 золота'),
      trap('f1_t2','Ржавый капкан','🪤',25,'Капкан! -25 золота'),
      trap('f1_t3','Ядовитый гриб','🍄',20,'Ядовитые споры! -20 золота'),
    ],
    quests: [
      quest('f1_q1','Старый свиток','📜','Найти древний свиток',100,30),
      quest('f1_q2','Потерянный мешок','💰','Найти мешок с золотом',150,20),
    ],
    treasureGold: 100,
  },
  {
    id: 2, name: 'Пещеры', icon: '🕳️', description: 'Извилистые пещеры гоблинов', minLevel: 2,
    theme: 'from-emerald-950 to-stone-900', wallDensity: 0.10,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f2_m1','Гоблин','👺',25,100,25), m('f2_m2','Гоблин-лучник','🏹',30,120,30),
      m('f2_m3','Тролль','🧌',45,180,45), m('f2_m4','Пещерный волк','🐺',40,160,40),
      m('f2_m5','Гоблин-шаман','🔮',50,200,50), m('f2_m6','Гоблин-вор','🗡️',35,140,35),
      m('f2_m7','Летучая крыса','🦇',28,115,28), m('f2_m8','Каменный элемент','🪨',42,170,42),
      m('f2_m9','Пещерный тролль','🧌',55,220,55), m('f2_m10','Тёмный гоблин','👺',48,195,48),
      m('f2_m11','Гоблин-берсерк','⚔️',52,210,52), m('f2_m12','Паук-охотник','🕷️',38,155,38),
    ],
    boss: b('f2_boss','Вождь Гоблинов','👑',100,600,180),
    traps: [
      trap('f2_t1','Яма','🕳️',50,'Провалились в яму! -50 золота'),
      trap('f2_t2','Камнепад','🪨',40,'Камнепад! -40 золота'),
      trap('f2_t3','Сеть','🪢',35,'Запутались в сети! -35 золота'),
      trap('f2_t4','Шипы','📌',45,'Острые шипы! -45 золота'),
    ],
    quests: [
      quest('f2_q1','Пленник','🧑‍🦯','Освободить пленника',200,60),
      quest('f2_q2','Карта пещер','🗺️','Найти карту подземелий',180,50),
    ],
    treasureGold: 200,
  },
  {
    id: 3, name: 'Склеп', icon: '⚰️', description: 'Древний склеп нежити', minLevel: 3,
    theme: 'from-violet-950 to-gray-900', wallDensity: 0.12,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f3_m1','Скелет-воин','💀',50,200,50), m('f3_m2','Зомби','🧟',55,220,55),
      m('f3_m3','Призрак','👻',60,240,60), m('f3_m4','Банши','😱',70,280,70),
      m('f3_m5','Вампир','🧛',85,340,85), m('f3_m6','Скелет-маг','💀',65,260,65),
      m('f3_m7','Костяной рыцарь','🦴',75,300,75), m('f3_m8','Гуль','🧟',58,230,58),
      m('f3_m9','Тень','🌑',62,250,62), m('f3_m10','Некромант','🧙',80,320,80),
      m('f3_m11','Мумия','🧱',72,290,72), m('f3_m12','Фантом','👻',68,270,68),
    ],
    boss: b('f3_boss','Лич','🧙',180,1200,360),
    traps: [
      trap('f3_t1','Проклятие','💜',60,'Проклятие! -60 золота'),
      trap('f3_t2','Ловушка костей','🦴',45,'Острые кости! -45 золота'),
      trap('f3_t3','Некротическая аура','💀',55,'Некро-аура! -55 золота'),
    ],
    quests: [
      quest('f3_q1','Древний артефакт','🏺','Найти артефакт',400,100),
      quest('f3_q2','Святая вода','💧','Найти святую воду',300,80),
    ],
    treasureGold: 350,
  },
  {
    id: 4, name: 'Лес Теней', icon: '🌲', description: 'Зачарованный тёмный лес', minLevel: 4,
    theme: 'from-green-950 to-emerald-950', wallDensity: 0.11,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f4_m1','Волк','🐺',80,320,80), m('f4_m2','Энт','🌳',90,360,90),
      m('f4_m3','Виверна','🦅',100,400,100), m('f4_m4','Василиск','🐍',110,440,110),
      m('f4_m5','Тёмный Эльф','🏴',120,480,120), m('f4_m6','Дриада','🧚',88,350,88),
      m('f4_m7','Волчья стая','🐺',95,380,95), m('f4_m8','Лесной тролль','🧌',105,420,105),
      m('f4_m9','Древний энт','🌳',115,460,115), m('f4_m10','Тёмный охотник','🏹',108,430,108),
      m('f4_m11','Ядовитый паук','🕷️',92,370,92), m('f4_m12','Лесной дух','🌿',98,390,98),
      m('f4_m13','Грифон','🦅',125,500,125), m('f4_m14','Единорог-мутант','🦄',130,520,130),
    ],
    boss: b('f4_boss','Хозяин Леса','🦌',280,1800,540),
    traps: [
      trap('f4_t1','Ядовитые шипы','🌿',70,'Ядовитые шипы! -70 золота'),
      trap('f4_t2','Трясина','🟤',55,'Трясина! -55 золота'),
      trap('f4_t3','Ловушка охотника','🪤',65,'Ловушка! -65 золота'),
      trap('f4_t4','Ядовитый плющ','🌿',50,'Ядовитый плющ! -50 золота'),
    ],
    quests: [
      quest('f4_q1','Эльфийский клинок','🗡️','Найти клинок',500,150),
      quest('f4_q2','Травы мудреца','🌿','Собрать редкие травы',400,120),
    ],
    treasureGold: 500,
  },
  {
    id: 5, name: 'Руины Храма', icon: '🏛️', description: 'Разрушенный древний храм', minLevel: 5,
    theme: 'from-amber-950 to-stone-900', wallDensity: 0.13,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f5_m1','Горгулья','🗿',120,480,120), m('f5_m2','Минотавр','🐂',140,560,140),
      m('f5_m3','Химера','🐲',150,600,150), m('f5_m4','Медуза','🐍',160,640,160),
      m('f5_m5','Голем','🪨',170,680,170), m('f5_m6','Каменный страж','🗿',135,540,135),
      m('f5_m7','Грифон','🦅',145,580,145), m('f5_m8','Минотавр-воин','🐂',155,620,155),
      m('f5_m9','Химера-матка','🐲',165,660,165), m('f5_m10','Горгулья-лорд','🗿',175,700,175),
      m('f5_m11','Храмовый рыцарь','⚔️',148,590,148), m('f5_m12','Каменный змей','🐍',158,630,158),
      m('f5_m13','Бронзовый голем','🪨',168,670,168), m('f5_m14','Сфинкс','🦁',180,720,180),
    ],
    boss: b('f5_boss','Титан','🏛️',400,3000,800),
    traps: [
      trap('f5_t1','Ловушка храма','⚡',90,'Молния! -90 золота'),
      trap('f5_t2','Обвал','🏚️',80,'Обвал! -80 золота'),
      trap('f5_t3','Огненная ловушка','🔥',85,'Огонь! -85 золота'),
      trap('f5_t4','Магическая мина','💥',95,'Взрыв! -95 золота'),
    ],
    quests: [
      quest('f5_q1','Реликвия','✨','Найти реликвию',800,200),
      quest('f5_q2','Записи мудреца','📜','Расшифровать записи',600,180),
      quest('f5_q3','Ключ от врат','🔑','Найти ключ',700,190),
    ],
    treasureGold: 700,
  },
  {
    id: 6, name: 'Вулканическая Кузня', icon: '🌋', description: 'Жаркие пещеры вулкана', minLevel: 7,
    theme: 'from-red-950 to-orange-950', wallDensity: 0.12,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f6_m1','Огненный элементаль','🔥',200,800,200), m('f6_m2','Лавовый голем','🪨',220,880,220),
      m('f6_m3','Ифрит','🧞',240,960,240), m('f6_m4','Саламандра','🦎',260,1040,260),
      m('f6_m5','Адский пёс','🐕',230,920,230), m('f6_m6','Огненный маг','🧙‍♂️',250,1000,250),
      m('f6_m7','Лавовый червь','🐛',210,840,210), m('f6_m8','Пепельный дракон','🐲',270,1080,270),
      m('f6_m9','Вулканический жук','🪲',215,860,215), m('f6_m10','Демон огня','😈',255,1020,255),
      m('f6_m11','Огненный феникс','🔥',245,980,245), m('f6_m12','Магма-голем','🪨',265,1060,265),
      m('f6_m13','Кузнец-демон','⚒️',235,940,235), m('f6_m14','Огненный дух','🔥',275,1100,275),
      m('f6_m15','Лавовый страж','🛡️',280,1120,280),
    ],
    boss: b('f6_boss','Красный Дракон','🐉',600,5000,1200),
    traps: [
      trap('f6_t1','Лавовый гейзер','🌋',120,'Лава! -120 золота'),
      trap('f6_t2','Огненная стена','🔥',100,'Огонь! -100 золота'),
      trap('f6_t3','Раскалённый пол','🔥',110,'Горячо! -110 золота'),
      trap('f6_t4','Серная яма','💨',90,'Серный газ! -90 золота'),
    ],
    quests: [
      quest('f6_q1','Драконий зуб','🦷','Добыть зуб дракона',1200,300),
      quest('f6_q2','Огненная руда','⛏️','Добыть редкую руду',1000,250),
    ],
    treasureGold: 1000,
  },
  {
    id: 7, name: 'Ледяная Крепость', icon: '🏔️', description: 'Замёрзшая крепость', minLevel: 9,
    theme: 'from-blue-950 to-cyan-950', wallDensity: 0.13,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f7_m1','Ледяной голем','🧊',300,1200,300), m('f7_m2','Снежный тролль','❄️',320,1280,320),
      m('f7_m3','Йети','🦍',340,1360,340), m('f7_m4','Ледяная ведьма','🧙‍♀️',360,1440,360),
      m('f7_m5','Ледяной рыцарь','🛡️',400,1600,400), m('f7_m6','Фрост-дракон','🐲',380,1520,380),
      m('f7_m7','Снежный волк','🐺',310,1240,310), m('f7_m8','Ледяной элементаль','❄️',350,1400,350),
      m('f7_m9','Замёрзший воин','⚔️',330,1320,330), m('f7_m10','Вьюга','🌪️',370,1480,370),
      m('f7_m11','Снежная гарпия','🦅',345,1380,345), m('f7_m12','Морозный маг','🧙',390,1560,390),
      m('f7_m13','Ледяной великан','🏔️',410,1640,410), m('f7_m14','Кристальный страж','💎',420,1680,420),
      m('f7_m15','Снежный феникс','❄️',395,1580,395),
    ],
    boss: b('f7_boss','Ледяной Король','👑',900,7000,1800),
    traps: [
      trap('f7_t1','Ледяной шип','🧊',150,'Ледяной шип! -150 золота'),
      trap('f7_t2','Метель','🌨️',130,'Метель! -130 золота'),
      trap('f7_t3','Ледяная ловушка','❄️',140,'Заморозка! -140 золота'),
      trap('f7_t4','Трещина во льду','🕳️',160,'Провал! -160 золота'),
    ],
    quests: [
      quest('f7_q1','Замёрзшее сердце','💎','Найти сердце',2000,500),
      quest('f7_q2','Ледяная корона','👑','Найти корону',1800,450),
      quest('f7_q3','Фрост-руна','🔮','Найти руну',1500,400),
    ],
    treasureGold: 1500,
  },
  {
    id: 8, name: 'Крепость Демонов', icon: '🏚️', description: 'Врата в измерение демонов', minLevel: 11,
    theme: 'from-rose-950 to-red-950', wallDensity: 0.11,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f8_m1','Бес','😈',400,1600,400), m('f8_m2','Суккуб','💋',430,1720,430),
      m('f8_m3','Демон-страж','👿',460,1840,460), m('f8_m4','Адское пламя','🔥',490,1960,490),
      m('f8_m5','Балрог','⚡',550,2200,550), m('f8_m6','Инкуб','😈',440,1760,440),
      m('f8_m7','Демон-маг','🧙',470,1880,470), m('f8_m8','Адская гончая','🐕',420,1680,420),
      m('f8_m9','Тёмный рыцарь','⚔️',500,2000,500), m('f8_m10','Демон-лорд','👿',530,2120,530),
      m('f8_m11','Огненный демон','🔥',510,2040,510), m('f8_m12','Теневой убийца','🗡️',480,1920,480),
      m('f8_m13','Демон-берсерк','😈',540,2160,540), m('f8_m14','Инфернальный голем','🪨',520,2080,520),
      m('f8_m15','Повелитель тьмы','🌑',560,2240,560),
    ],
    boss: b('f8_boss','Архидемон','💀',1300,10000,2500),
    traps: [
      trap('f8_t1','Адское пламя','🔥',200,'Пламя! -200 золота'),
      trap('f8_t2','Проклятие тьмы','🌑',180,'Тьма! -180 золота'),
      trap('f8_t3','Демоническая руна','🔮',190,'Руна! -190 золота'),
      trap('f8_t4','Портал боли','🌀',210,'Боль! -210 золота'),
    ],
    quests: [
      quest('f8_q1','Печать демона','🔮','Найти печать',3000,700),
      quest('f8_q2','Клинок правосудия','⚔️','Найти клинок',2500,600),
    ],
    treasureGold: 2500,
  },
  {
    id: 9, name: 'Храм Бездны', icon: '🌀', description: 'Мистическое измерение хаоса', minLevel: 13,
    theme: 'from-purple-950 to-indigo-950', wallDensity: 0.14,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f9_m1','Тень Бездны','🌑',550,2200,550), m('f9_m2','Хранитель Пустоты','🌌',600,2400,600),
      m('f9_m3','Воплощение Хаоса','💫',650,2600,650), m('f9_m4','Пожиратель душ','👁️',700,2800,700),
      m('f9_m5','Титан Пустоты','🕳️',750,3000,750), m('f9_m6','Аватар Хаоса','✨',680,2720,680),
      m('f9_m7','Бездонный червь','🐛',620,2480,620), m('f9_m8','Пустотный маг','🧙',660,2640,660),
      m('f9_m9','Ночной ужас','😱',710,2840,710), m('f9_m10','Страж Бездны','🛡️',730,2920,730),
      m('f9_m11','Тёмная сущность','🌑',670,2680,670), m('f9_m12','Пустотный дракон','🐲',740,2960,740),
      m('f9_m13','Хаос-элементаль','💫',690,2760,690), m('f9_m14','Абиссальный рыцарь','⚔️',720,2880,720),
      m('f9_m15','Пожиратель миров','🌍',760,3040,760), m('f9_m16','Тёмный серафим','😇',770,3080,770),
    ],
    boss: b('f9_boss','Бог Бездны','👁️‍🗨️',1800,15000,4000),
    traps: [
      trap('f9_t1','Разрыв пространства','🌀',250,'Разрыв! -250 золота'),
      trap('f9_t2','Хаос-волна','💫',220,'Волна! -220 золота'),
      trap('f9_t3','Пустотная ловушка','🕳️',240,'Пустота! -240 золота'),
      trap('f9_t4','Временная петля','⏳',230,'Петля! -230 золота'),
      trap('f9_t5','Абиссальный шип','🌑',260,'Шип! -260 золота'),
    ],
    quests: [
      quest('f9_q1','Осколок бездны','💠','Собрать осколок',5000,1200),
      quest('f9_q2','Печать хаоса','🔮','Найти печать',4000,1000),
      quest('f9_q3','Книга теней','📕','Расшифровать книгу',4500,1100),
    ],
    treasureGold: 4000,
  },
  {
    id: 10, name: 'Трон Вечности', icon: '👑', description: 'Последний рубеж — Трон Создателя', minLevel: 15,
    theme: 'from-yellow-950 to-amber-950', wallDensity: 0.15,
    entrance: [49, 25], exit: [0, 25],
    monsters: [
      m('f10_m1','Серафим','😇',800,3200,800), m('f10_m2','Архангел','⚔️',900,3600,900),
      m('f10_m3','Страж Вечности','🛡️',1000,4000,1000), m('f10_m4','Хронос','⏳',1100,4400,1100),
      m('f10_m5','Немезида','⚡',1300,5200,1300), m('f10_m6','Титан Света','☀️',850,3400,850),
      m('f10_m7','Вечный воин','⚔️',950,3800,950), m('f10_m8','Ангел смерти','💀',1050,4200,1050),
      m('f10_m9','Хранитель времени','⏳',1150,4600,1150), m('f10_m10','Судья душ','⚖️',1200,4800,1200),
      m('f10_m11','Вечный маг','🧙',1250,5000,1250), m('f10_m12','Фатум','🎭',1350,5400,1350),
      m('f10_m13','Космический дракон','🐉',1400,5600,1400), m('f10_m14','Страж портала','🌀',1100,4400,1100),
      m('f10_m15','Повелитель света','☀️',1450,5800,1450), m('f10_m16','Аватар вечности','✨',1500,6000,1500),
      m('f10_m17','Архонт','👑',1350,5400,1350), m('f10_m18','Небесный рыцарь','🛡️',1250,5000,1250),
    ],
    boss: b('f10_boss','Создатель','🌟',2500,25000,6000),
    traps: [
      trap('f10_t1','Суд Вечности','⚖️',300,'Суд! -300 золота'),
      trap('f10_t2','Петля времени','⏳',280,'Петля! -280 золота'),
      trap('f10_t3','Божественный огонь','🔥',320,'Огонь! -320 золота'),
      trap('f10_t4','Космический разрыв','🌌',340,'Разрыв! -340 золота'),
      trap('f10_t5','Абсолютный ноль','❄️',310,'Заморозка! -310 золота'),
    ],
    quests: [
      quest('f10_q1','Корона Создателя','👑','Найти Корону',10000,3000),
      quest('f10_q2','Сфера Вечности','🔮','Найти сферу',8000,2500),
      quest('f10_q3','Свиток Судьбы','📜','Найти свиток',9000,2800),
    ],
    treasureGold: 8000,
  },
];

export function getTowerFloor(floorId: number): TowerFloor | undefined {
  return TOWER_FLOORS.find(f => f.id === floorId);
}
