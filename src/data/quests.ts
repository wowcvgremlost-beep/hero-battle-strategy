// Quest system data

export type QuestType = 'kill' | 'collect_gold' | 'explore' | 'build' | 'hire';

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  target: number; // how many to complete
  goldReward: number;
  expReward: number;
  leadershipReward?: number; // bonus to permanent leadership
  npcName: string;
  npcEmoji: string;
  minLevel: number; // minimum hero level to see this quest
}

export const QUESTS: QuestDef[] = [
  // Beginner quests
  { id: 'kill_goblins', name: 'Очистить округу', description: 'Победите 2 монстров на карте', type: 'kill', target: 2, goldReward: 500, expReward: 80, npcName: 'Староста', npcEmoji: '👴', minLevel: 1 },
  { id: 'collect_gold_1', name: 'Казна деревни', description: 'Соберите 3000 золота', type: 'collect_gold', target: 3000, goldReward: 800, expReward: 50, npcName: 'Купец', npcEmoji: '🧔', minLevel: 1 },
  { id: 'explore_tiles', name: 'Разведчик', description: 'Исследуйте 20 клеток карты', type: 'explore', target: 20, goldReward: 400, expReward: 100, npcName: 'Следопыт', npcEmoji: '🏹', minLevel: 1 },
  { id: 'build_first', name: 'Строитель', description: 'Постройте 3 здания в городе', type: 'build', target: 3, goldReward: 600, expReward: 60, npcName: 'Архитектор', npcEmoji: '👷', minLevel: 1 },
  { id: 'hire_army', name: 'Командир', description: 'Наймите 10 юнитов', type: 'hire', target: 10, goldReward: 500, expReward: 70, leadershipReward: 5, npcName: 'Генерал', npcEmoji: '⚔️', minLevel: 1 },

  // Mid-game quests
  { id: 'kill_strong', name: 'Охотник за монстрами', description: 'Победите 5 монстров', type: 'kill', target: 5, goldReward: 1500, expReward: 200, npcName: 'Охотник', npcEmoji: '🗡️', minLevel: 3 },
  { id: 'collect_gold_2', name: 'Богатство королевства', description: 'Накопите 10000 золота', type: 'collect_gold', target: 10000, goldReward: 2000, expReward: 150, npcName: 'Банкир', npcEmoji: '💰', minLevel: 3 },
  { id: 'explore_far', name: 'Картограф', description: 'Исследуйте 50 клеток', type: 'explore', target: 50, goldReward: 1000, expReward: 250, npcName: 'Мудрец', npcEmoji: '🧙', minLevel: 3 },
  { id: 'build_many', name: 'Великий строитель', description: 'Постройте 8 зданий', type: 'build', target: 8, goldReward: 1500, expReward: 180, npcName: 'Мастер', npcEmoji: '🔨', minLevel: 3 },
  { id: 'hire_legion', name: 'Легион', description: 'Наймите 30 юнитов', type: 'hire', target: 30, goldReward: 1200, expReward: 200, leadershipReward: 10, npcName: 'Маршал', npcEmoji: '🛡️', minLevel: 3 },

  // Late-game quests
  { id: 'kill_bosses', name: 'Истребитель', description: 'Победите 10 монстров', type: 'kill', target: 10, goldReward: 3000, expReward: 500, npcName: 'Оракул', npcEmoji: '🔮', minLevel: 5 },
  { id: 'collect_gold_3', name: 'Сокровище дракона', description: 'Накопите 25000 золота', type: 'collect_gold', target: 25000, goldReward: 5000, expReward: 400, npcName: 'Дракон', npcEmoji: '🐉', minLevel: 5 },
  { id: 'explore_world', name: 'Первооткрыватель', description: 'Исследуйте 100 клеток', type: 'explore', target: 100, goldReward: 2500, expReward: 600, npcName: 'Странник', npcEmoji: '🌍', minLevel: 5 },
  { id: 'hire_horde', name: 'Орда', description: 'Наймите 60 юнитов', type: 'hire', target: 60, goldReward: 3000, expReward: 500, npcName: 'Полководец', npcEmoji: '👑', minLevel: 5 },
];

// NPC tile positions on map (deterministic based on quest index)
export function getNpcTilePositions(): Map<number, QuestDef> {
  const map = new Map<number, QuestDef>();
  // Place NPCs at specific known-passable spots spread across the map
  const npcPositions = [
    3 * 60 + 10, 7 * 60 + 40, 12 * 60 + 25, 18 * 60 + 8, 22 * 60 + 45,
    28 * 60 + 15, 33 * 60 + 50, 38 * 60 + 30, 42 * 60 + 12, 46 * 60 + 38,
    6 * 60 + 20, 14 * 60 + 48, 26 * 60 + 5, 36 * 60 + 42,
  ];
  QUESTS.forEach((q, i) => {
    if (i < npcPositions.length) {
      map.set(npcPositions[i], q);
    }
  });
  return map;
}

// Get monster power scaled by week
export function getScaledMonsterPower(basePower: number, weekNumber: number): number {
  // +15% per week, starting from week 2
  const scaling = 1 + Math.max(0, weekNumber - 1) * 0.15;
  return Math.floor(basePower * scaling);
}

export function getScaledRewards(baseGold: number, baseExp: number, weekNumber: number) {
  const scaling = 1 + Math.max(0, weekNumber - 1) * 0.1;
  return {
    gold: Math.floor(baseGold * scaling),
    exp: Math.floor(baseExp * scaling),
  };
}
