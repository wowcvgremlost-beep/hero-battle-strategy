export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'economy' | 'exploration' | 'army' | 'hero' | 'social';
  goldReward: number;
  manaReward: number;
  expReward: number;
  /** Check function receives player stats and returns true if unlocked */
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  heroLevel: number;
  gold: number;
  mana: number;
  totalBuildings: number;
  totalArmy: number;
  totalSpells: number;
  totalSkills: number;
  pvpWins: number;
  pvpLosses: number;
  totalBattles: number;
  day: number;
  streak: number;
  guildMember: boolean;
  artifactCount: number;
  questsCompleted: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Combat
  { id: 'first_blood', name: 'Первая кровь', description: 'Выиграйте первый бой', icon: '⚔️', category: 'combat', goldReward: 500, manaReward: 0, expReward: 50, condition: (s) => s.totalBattles >= 1 },
  { id: 'warrior_10', name: 'Воин', description: 'Выиграйте 10 боёв', icon: '🗡️', category: 'combat', goldReward: 1000, manaReward: 10, expReward: 100, condition: (s) => s.totalBattles >= 10 },
  { id: 'veteran_50', name: 'Ветеран', description: 'Выиграйте 50 боёв', icon: '🏅', category: 'combat', goldReward: 3000, manaReward: 25, expReward: 300, condition: (s) => s.totalBattles >= 50 },
  { id: 'pvp_first', name: 'Дуэлянт', description: 'Выиграйте первый PvP бой', icon: '🤺', category: 'combat', goldReward: 1000, manaReward: 0, expReward: 100, condition: (s) => s.pvpWins >= 1 },
  { id: 'pvp_10', name: 'Гладиатор', description: 'Выиграйте 10 PvP боёв', icon: '🏟️', category: 'combat', goldReward: 5000, manaReward: 30, expReward: 500, condition: (s) => s.pvpWins >= 10 },

  // Economy
  { id: 'gold_10k', name: 'Богач', description: 'Накопите 10,000 золота', icon: '💰', category: 'economy', goldReward: 1000, manaReward: 0, expReward: 50, condition: (s) => s.gold >= 10000 },
  { id: 'gold_50k', name: 'Магнат', description: 'Накопите 50,000 золота', icon: '💎', category: 'economy', goldReward: 5000, manaReward: 20, expReward: 200, condition: (s) => s.gold >= 50000 },
  { id: 'gold_100k', name: 'Крёз', description: 'Накопите 100,000 золота', icon: '👑', category: 'economy', goldReward: 10000, manaReward: 50, expReward: 500, condition: (s) => s.gold >= 100000 },

  // Hero
  { id: 'level_5', name: 'Опытный', description: 'Достигните 5 уровня', icon: '⭐', category: 'hero', goldReward: 1000, manaReward: 10, expReward: 0, condition: (s) => s.heroLevel >= 5 },
  { id: 'level_10', name: 'Мастер', description: 'Достигните 10 уровня', icon: '🌟', category: 'hero', goldReward: 3000, manaReward: 25, expReward: 0, condition: (s) => s.heroLevel >= 10 },
  { id: 'level_20', name: 'Легенда', description: 'Достигните 20 уровня', icon: '✨', category: 'hero', goldReward: 10000, manaReward: 50, expReward: 0, condition: (s) => s.heroLevel >= 20 },
  { id: 'skills_5', name: 'Учёный', description: 'Изучите 5 навыков', icon: '📚', category: 'hero', goldReward: 1000, manaReward: 15, expReward: 100, condition: (s) => s.totalSkills >= 5 },

  // Army
  { id: 'army_50', name: 'Командир', description: 'Наберите 50 юнитов в армию', icon: '🛡️', category: 'army', goldReward: 1000, manaReward: 0, expReward: 100, condition: (s) => s.totalArmy >= 50 },
  { id: 'army_200', name: 'Генерал', description: 'Наберите 200 юнитов в армию', icon: '⚜️', category: 'army', goldReward: 3000, manaReward: 20, expReward: 300, condition: (s) => s.totalArmy >= 200 },

  // Exploration
  { id: 'day_30', name: 'Путешественник', description: 'Проживите 30 дней', icon: '🗺️', category: 'exploration', goldReward: 2000, manaReward: 15, expReward: 200, condition: (s) => s.day >= 30 },
  { id: 'day_100', name: 'Исследователь', description: 'Проживите 100 дней', icon: '🧭', category: 'exploration', goldReward: 5000, manaReward: 30, expReward: 500, condition: (s) => s.day >= 100 },
  { id: 'streak_7', name: 'Постоянство', description: 'Серия входов: 7 дней', icon: '🔥', category: 'exploration', goldReward: 3000, manaReward: 25, expReward: 200, condition: (s) => s.streak >= 7 },

  // Buildings
  { id: 'builder_5', name: 'Строитель', description: 'Постройте 5 зданий', icon: '🏗️', category: 'economy', goldReward: 1000, manaReward: 0, expReward: 100, condition: (s) => s.totalBuildings >= 5 },
  { id: 'builder_15', name: 'Архитектор', description: 'Постройте 15 зданий', icon: '🏰', category: 'economy', goldReward: 5000, manaReward: 20, expReward: 300, condition: (s) => s.totalBuildings >= 15 },

  // Social
  { id: 'guild_join', name: 'Соратник', description: 'Вступите в гильдию', icon: '🤝', category: 'social', goldReward: 1000, manaReward: 10, expReward: 100, condition: (s) => s.guildMember },

  // Artifacts
  { id: 'artifact_3', name: 'Коллекционер', description: 'Соберите 3 артефакта', icon: '🎒', category: 'exploration', goldReward: 1500, manaReward: 10, expReward: 150, condition: (s) => s.artifactCount >= 3 },
  { id: 'artifact_10', name: 'Хранитель', description: 'Соберите 10 артефактов', icon: '🏛️', category: 'exploration', goldReward: 5000, manaReward: 30, expReward: 400, condition: (s) => s.artifactCount >= 10 },

  // Spells
  { id: 'spells_3', name: 'Ученик мага', description: 'Изучите 3 заклинания', icon: '🪄', category: 'hero', goldReward: 1000, manaReward: 20, expReward: 100, condition: (s) => s.totalSpells >= 3 },

  // Quests
  { id: 'quests_3', name: 'Искатель', description: 'Выполните 3 квеста', icon: '📜', category: 'exploration', goldReward: 2000, manaReward: 15, expReward: 200, condition: (s) => s.questsCompleted >= 3 },
  { id: 'quests_10', name: 'Герой', description: 'Выполните 10 квестов', icon: '🦸', category: 'exploration', goldReward: 5000, manaReward: 30, expReward: 500, condition: (s) => s.questsCompleted >= 10 },
];

export const CATEGORY_NAMES: Record<string, string> = {
  combat: 'Боевые',
  economy: 'Экономика',
  exploration: 'Исследование',
  army: 'Армия',
  hero: 'Герой',
  social: 'Социальные',
};
