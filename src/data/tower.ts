export interface TowerMonster {
  id: string;
  name: string;
  icon: string;
  power: number;
  goldReward: number;
  expReward: number;
  isBoss: boolean;
  /** Position on floor grid (0-based) */
  gridX: number;
  gridY: number;
}

export interface TowerFloor {
  id: number; // 1-10
  name: string;
  icon: string;
  description: string;
  minLevel: number;
  monsters: TowerMonster[];
  /** Background color theme */
  theme: string;
}

// Respawn times in minutes
export const BOSS_RESPAWN_MINUTES = 60;
export const MOB_RESPAWN_MINUTES = 5;

function mob(id: string, name: string, icon: string, power: number, gold: number, exp: number, gx: number, gy: number): TowerMonster {
  return { id, name, icon, power, goldReward: gold, expReward: exp, isBoss: false, gridX: gx, gridY: gy };
}
function boss(id: string, name: string, icon: string, power: number, gold: number, exp: number, gx: number, gy: number): TowerMonster {
  return { id, name, icon, power, goldReward: gold, expReward: exp, isBoss: true, gridX: gx, gridY: gy };
}

export const TOWER_FLOORS: TowerFloor[] = [
  {
    id: 1, name: 'Подвал', icon: '🏚️', description: 'Тёмный подвал с крысами и пауками', minLevel: 1,
    theme: 'from-stone-900 to-stone-800',
    monsters: [
      mob('f1_m1', 'Крыса', '🐀', 10, 50, 10, 0, 0),
      mob('f1_m2', 'Паук', '🕷️', 15, 70, 15, 2, 0),
      mob('f1_m3', 'Летучая мышь', '🦇', 12, 60, 12, 1, 1),
      mob('f1_m4', 'Слизень', '🟢', 18, 80, 18, 3, 1),
      mob('f1_m5', 'Скелет', '💀', 25, 100, 25, 0, 2),
      boss('f1_boss', 'Гигантский Паук', '🕸️', 50, 300, 80, 2, 3),
    ],
  },
  {
    id: 2, name: 'Пещеры', icon: '🕳️', description: 'Извилистые пещеры гоблинов', minLevel: 2,
    theme: 'from-emerald-950 to-stone-900',
    monsters: [
      mob('f2_m1', 'Гоблин', '👺', 25, 100, 25, 0, 0),
      mob('f2_m2', 'Гоблин-лучник', '🏹', 30, 120, 30, 2, 0),
      mob('f2_m3', 'Гоблин-воин', '⚔️', 35, 140, 35, 3, 0),
      mob('f2_m4', 'Тролль', '🧌', 45, 180, 45, 1, 1),
      mob('f2_m5', 'Пещерный волк', '🐺', 40, 160, 40, 0, 2),
      mob('f2_m6', 'Гоблин-шаман', '🔮', 50, 200, 50, 3, 2),
      boss('f2_boss', 'Вождь Гоблинов', '👑', 100, 600, 180, 2, 3),
    ],
  },
  {
    id: 3, name: 'Склеп', icon: '⚰️', description: 'Древний склеп нежити', minLevel: 3,
    theme: 'from-violet-950 to-gray-900',
    monsters: [
      mob('f3_m1', 'Скелет-воин', '💀', 50, 200, 50, 0, 0),
      mob('f3_m2', 'Зомби', '🧟', 55, 220, 55, 2, 0),
      mob('f3_m3', 'Призрак', '👻', 60, 240, 60, 1, 1),
      mob('f3_m4', 'Банши', '😱', 70, 280, 70, 3, 1),
      mob('f3_m5', 'Мумия', '🧱', 75, 300, 75, 0, 2),
      mob('f3_m6', 'Вампир', '🧛', 85, 340, 85, 3, 2),
      boss('f3_boss', 'Лич', '🧙', 180, 1200, 360, 2, 3),
    ],
  },
  {
    id: 4, name: 'Лес Теней', icon: '🌲', description: 'Зачарованный тёмный лес', minLevel: 4,
    theme: 'from-green-950 to-emerald-950',
    monsters: [
      mob('f4_m1', 'Волк', '🐺', 80, 320, 80, 0, 0),
      mob('f4_m2', 'Энт', '🌳', 90, 360, 90, 2, 0),
      mob('f4_m3', 'Дриада', '🧚', 85, 340, 85, 1, 1),
      mob('f4_m4', 'Виверна', '🦅', 100, 400, 100, 3, 1),
      mob('f4_m5', 'Василиск', '🐍', 110, 440, 110, 0, 2),
      mob('f4_m6', 'Тёмный Эльф', '🏴', 120, 480, 120, 3, 2),
      boss('f4_boss', 'Хозяин Леса', '🦌', 280, 1800, 540, 2, 3),
    ],
  },
  {
    id: 5, name: 'Руины Храма', icon: '🏛️', description: 'Разрушенный древний храм', minLevel: 5,
    theme: 'from-amber-950 to-stone-900',
    monsters: [
      mob('f5_m1', 'Горгулья', '🗿', 120, 480, 120, 0, 0),
      mob('f5_m2', 'Минотавр', '🐂', 140, 560, 140, 2, 0),
      mob('f5_m3', 'Химера', '🐲', 150, 600, 150, 1, 1),
      mob('f5_m4', 'Медуза', '🐍', 160, 640, 160, 3, 1),
      mob('f5_m5', 'Голем', '🪨', 170, 680, 170, 0, 2),
      mob('f5_m6', 'Страж Храма', '⚔️', 180, 720, 180, 3, 2),
      boss('f5_boss', 'Титан', '🏛️', 400, 3000, 800, 2, 3),
    ],
  },
  {
    id: 6, name: 'Вулканическая Кузня', icon: '🌋', description: 'Жаркие пещеры под вулканом', minLevel: 7,
    theme: 'from-red-950 to-orange-950',
    monsters: [
      mob('f6_m1', 'Огненный элементаль', '🔥', 200, 800, 200, 0, 0),
      mob('f6_m2', 'Лавовый голем', '🪨', 220, 880, 220, 2, 0),
      mob('f6_m3', 'Ифрит', '🧞', 240, 960, 240, 1, 1),
      mob('f6_m4', 'Саламандра', '🦎', 260, 1040, 260, 3, 1),
      mob('f6_m5', 'Адский пёс', '🐕', 230, 920, 230, 0, 2),
      mob('f6_m6', 'Огненный маг', '🧙‍♂️', 270, 1080, 270, 3, 2),
      boss('f6_boss', 'Красный Дракон', '🐉', 600, 5000, 1200, 2, 3),
    ],
  },
  {
    id: 7, name: 'Ледяная Крепость', icon: '🏔️', description: 'Замёрзшая крепость на вершине', minLevel: 9,
    theme: 'from-blue-950 to-cyan-950',
    monsters: [
      mob('f7_m1', 'Ледяной голем', '🧊', 300, 1200, 300, 0, 0),
      mob('f7_m2', 'Снежный тролль', '❄️', 320, 1280, 320, 2, 0),
      mob('f7_m3', 'Йети', '🦍', 340, 1360, 340, 1, 1),
      mob('f7_m4', 'Ледяная ведьма', '🧙‍♀️', 360, 1440, 360, 3, 1),
      mob('f7_m5', 'Фрост Драконлинг', '🐲', 380, 1520, 380, 0, 2),
      mob('f7_m6', 'Ледяной рыцарь', '🛡️', 400, 1600, 400, 3, 2),
      boss('f7_boss', 'Ледяной Король', '👑', 900, 7000, 1800, 2, 3),
    ],
  },
  {
    id: 8, name: 'Крепость Демонов', icon: '🏚️', description: 'Врата в измерение демонов', minLevel: 11,
    theme: 'from-rose-950 to-red-950',
    monsters: [
      mob('f8_m1', 'Бес', '😈', 400, 1600, 400, 0, 0),
      mob('f8_m2', 'Суккуб', '💋', 430, 1720, 430, 2, 0),
      mob('f8_m3', 'Демон-страж', '👿', 460, 1840, 460, 1, 1),
      mob('f8_m4', 'Адское пламя', '🔥', 490, 1960, 490, 3, 1),
      mob('f8_m5', 'Демон-маг', '🧙', 520, 2080, 520, 0, 2),
      mob('f8_m6', 'Балрог', '⚡', 550, 2200, 550, 3, 2),
      boss('f8_boss', 'Архидемон', '💀', 1300, 10000, 2500, 2, 3),
    ],
  },
  {
    id: 9, name: 'Храм Бездны', icon: '🌀', description: 'Мистическое измерение хаоса', minLevel: 13,
    theme: 'from-purple-950 to-indigo-950',
    monsters: [
      mob('f9_m1', 'Тень Бездны', '🌑', 550, 2200, 550, 0, 0),
      mob('f9_m2', 'Хранитель Пустоты', '🌌', 600, 2400, 600, 2, 0),
      mob('f9_m3', 'Воплощение Хаоса', '💫', 650, 2600, 650, 1, 1),
      mob('f9_m4', 'Пожиратель душ', '👁️', 700, 2800, 700, 3, 1),
      mob('f9_m5', 'Титан Пустоты', '🕳️', 750, 3000, 750, 0, 2),
      mob('f9_m6', 'Аватар Хаоса', '✨', 800, 3200, 800, 3, 2),
      boss('f9_boss', 'Бог Бездны', '👁️‍🗨️', 1800, 15000, 4000, 2, 3),
    ],
  },
  {
    id: 10, name: 'Трон Вечности', icon: '👑', description: 'Последний рубеж — Трон Создателя', minLevel: 15,
    theme: 'from-yellow-950 to-amber-950',
    monsters: [
      mob('f10_m1', 'Серафим', '😇', 800, 3200, 800, 0, 0),
      mob('f10_m2', 'Архангел', '⚔️', 900, 3600, 900, 2, 0),
      mob('f10_m3', 'Страж Вечности', '🛡️', 1000, 4000, 1000, 1, 1),
      mob('f10_m4', 'Хронос', '⏳', 1100, 4400, 1100, 3, 1),
      mob('f10_m5', 'Фатум', '🎭', 1200, 4800, 1200, 0, 2),
      mob('f10_m6', 'Немезида', '⚡', 1300, 5200, 1300, 3, 2),
      boss('f10_boss', 'Создатель', '🌟', 2500, 25000, 6000, 2, 3),
    ],
  },
];

export function getTowerFloor(floorId: number): TowerFloor | undefined {
  return TOWER_FLOORS.find(f => f.id === floorId);
}
