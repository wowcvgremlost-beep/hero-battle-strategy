import { getRandomArtifact, type ArtifactRarity } from './artifacts';

export interface DungeonFloor {
  level: number;
  monsterName: string;
  monsterIcon: string;
  monsterPower: number;
  goldReward: number;
  expReward: number;
  isBoss: boolean;
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  icon: string;
  floors: DungeonFloor[];
  bossArtifactRarity: ArtifactRarity;
  minHeroLevel: number;
}

export const DUNGEONS: Dungeon[] = [
  {
    id: 'goblin_caves',
    name: 'Пещеры Гоблинов',
    description: 'Тёмные пещеры, кишащие гоблинами и их вождём',
    icon: '🕳️',
    minHeroLevel: 1,
    bossArtifactRarity: 'common',
    floors: [
      { level: 1, monsterName: 'Гоблин-разведчик', monsterIcon: '👺', monsterPower: 30, goldReward: 200, expReward: 30, isBoss: false },
      { level: 2, monsterName: 'Гоблины-воины', monsterIcon: '👹', monsterPower: 60, goldReward: 350, expReward: 50, isBoss: false },
      { level: 3, monsterName: 'Вождь Гоблинов', monsterIcon: '👑', monsterPower: 120, goldReward: 800, expReward: 150, isBoss: true },
    ],
  },
  {
    id: 'undead_crypt',
    name: 'Склеп Нежити',
    description: 'Древний склеп, где обитают ожившие мертвецы',
    icon: '⚰️',
    minHeroLevel: 3,
    bossArtifactRarity: 'uncommon',
    floors: [
      { level: 1, monsterName: 'Скелеты', monsterIcon: '💀', monsterPower: 80, goldReward: 400, expReward: 60, isBoss: false },
      { level: 2, monsterName: 'Зомби-стража', monsterIcon: '🧟', monsterPower: 150, goldReward: 600, expReward: 100, isBoss: false },
      { level: 3, monsterName: 'Призраки', monsterIcon: '👻', monsterPower: 220, goldReward: 800, expReward: 150, isBoss: false },
      { level: 4, monsterName: 'Лич-Повелитель', monsterIcon: '🧙', monsterPower: 350, goldReward: 1500, expReward: 300, isBoss: true },
    ],
  },
  {
    id: 'dragon_lair',
    name: 'Логово Дракона',
    description: 'Вулканическая пещера древнего дракона',
    icon: '🌋',
    minHeroLevel: 5,
    bossArtifactRarity: 'rare',
    floors: [
      { level: 1, monsterName: 'Огненные элементали', monsterIcon: '🔥', monsterPower: 200, goldReward: 600, expReward: 100, isBoss: false },
      { level: 2, monsterName: 'Драконлинги', monsterIcon: '🦎', monsterPower: 350, goldReward: 900, expReward: 180, isBoss: false },
      { level: 3, monsterName: 'Стража дракона', monsterIcon: '⚔️', monsterPower: 500, goldReward: 1200, expReward: 250, isBoss: false },
      { level: 4, monsterName: 'Красный дракон', monsterIcon: '🐉', monsterPower: 800, goldReward: 3000, expReward: 500, isBoss: true },
    ],
  },
  {
    id: 'demon_fortress',
    name: 'Крепость Демонов',
    description: 'Врата в Инферно, охраняемые легионами демонов',
    icon: '🏚️',
    minHeroLevel: 8,
    bossArtifactRarity: 'epic',
    floors: [
      { level: 1, monsterName: 'Бесы', monsterIcon: '😈', monsterPower: 400, goldReward: 1000, expReward: 200, isBoss: false },
      { level: 2, monsterName: 'Демоны-стражи', monsterIcon: '👿', monsterPower: 600, goldReward: 1500, expReward: 300, isBoss: false },
      { level: 3, monsterName: 'Суккубы и инкубы', monsterIcon: '🦇', monsterPower: 900, goldReward: 2000, expReward: 400, isBoss: false },
      { level: 4, monsterName: 'Балрог', monsterIcon: '🔥', monsterPower: 1200, goldReward: 3000, expReward: 600, isBoss: false },
      { level: 5, monsterName: 'Архидемон', monsterIcon: '💀', monsterPower: 1800, goldReward: 5000, expReward: 1000, isBoss: true },
    ],
  },
  {
    id: 'void_temple',
    name: 'Храм Бездны',
    description: 'Мистическое измерение за гранью реальности',
    icon: '🌀',
    minHeroLevel: 12,
    bossArtifactRarity: 'legendary',
    floors: [
      { level: 1, monsterName: 'Тени Бездны', monsterIcon: '🌑', monsterPower: 800, goldReward: 2000, expReward: 400, isBoss: false },
      { level: 2, monsterName: 'Хранители Пустоты', monsterIcon: '🌌', monsterPower: 1200, goldReward: 3000, expReward: 600, isBoss: false },
      { level: 3, monsterName: 'Воплощения Хаоса', monsterIcon: '💫', monsterPower: 1800, goldReward: 4000, expReward: 800, isBoss: false },
      { level: 4, monsterName: 'Титан Пустоты', monsterIcon: '🕳️', monsterPower: 2500, goldReward: 6000, expReward: 1200, isBoss: false },
      { level: 5, monsterName: 'Бог Бездны', monsterIcon: '👁️', monsterPower: 4000, goldReward: 10000, expReward: 2000, isBoss: true },
    ],
  },
];

export function getDungeonById(id: string): Dungeon | undefined {
  return DUNGEONS.find(d => d.id === id);
}
