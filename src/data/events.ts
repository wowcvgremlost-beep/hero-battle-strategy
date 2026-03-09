export type EventType = 'weekly' | 'seasonal';

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: EventType;
  /** For weekly: week number (1-52). For seasonal: month range */
  startWeek?: number;
  endWeek?: number;
  /** Seasonal months (1-12) */
  startMonth?: number;
  endMonth?: number;
  tasks: EventTask[];
}

export interface EventTask {
  id: string;
  name: string;
  description: string;
  target: number;
  /** What stat to check: pvp_wins, battles, gold_spent, buildings_built, army_hired, spells_learned, quests_done, dungeons_cleared */
  trackType: string;
  goldReward: number;
  manaReward: number;
  expReward: number;
}

// Rotating weekly tournaments — based on week number modulo
export const WEEKLY_TOURNAMENTS: GameEvent[] = [
  {
    id: 'tournament_arena',
    name: 'Турнир Арены',
    description: 'Сразитесь с другими игроками в PvP',
    icon: '⚔️',
    type: 'weekly',
    tasks: [
      { id: 'arena_3', name: 'Участник', description: 'Проведите 3 PvP боя', target: 3, trackType: 'pvp_battles', goldReward: 1000, manaReward: 0, expReward: 100 },
      { id: 'arena_win_5', name: 'Чемпион', description: 'Одержите 5 PvP побед', target: 5, trackType: 'pvp_wins', goldReward: 3000, manaReward: 20, expReward: 300 },
      { id: 'arena_win_10', name: 'Гранд-чемпион', description: 'Одержите 10 PvP побед', target: 10, trackType: 'pvp_wins', goldReward: 8000, manaReward: 50, expReward: 800 },
    ],
  },
  {
    id: 'tournament_conquest',
    name: 'Неделя завоеваний',
    description: 'Побеждайте монстров и исследуйте мир',
    icon: '🗡️',
    type: 'weekly',
    tasks: [
      { id: 'conquest_5', name: 'Охотник', description: 'Победите 5 монстров', target: 5, trackType: 'battles', goldReward: 1000, manaReward: 0, expReward: 100 },
      { id: 'conquest_15', name: 'Истребитель', description: 'Победите 15 монстров', target: 15, trackType: 'battles', goldReward: 3000, manaReward: 20, expReward: 300 },
      { id: 'conquest_30', name: 'Покоритель', description: 'Победите 30 монстров', target: 30, trackType: 'battles', goldReward: 8000, manaReward: 50, expReward: 800 },
    ],
  },
  {
    id: 'tournament_economy',
    name: 'Золотая лихорадка',
    description: 'Накопите как можно больше золота',
    icon: '💰',
    type: 'weekly',
    tasks: [
      { id: 'gold_5k', name: 'Торговец', description: 'Накопите 5,000 золота', target: 5000, trackType: 'gold_current', goldReward: 1500, manaReward: 0, expReward: 100 },
      { id: 'gold_20k', name: 'Купец', description: 'Накопите 20,000 золота', target: 20000, trackType: 'gold_current', goldReward: 4000, manaReward: 25, expReward: 300 },
      { id: 'gold_50k', name: 'Казначей', description: 'Накопите 50,000 золота', target: 50000, trackType: 'gold_current', goldReward: 10000, manaReward: 50, expReward: 800 },
    ],
  },
  {
    id: 'tournament_builder',
    name: 'Неделя строительства',
    description: 'Развивайте свой город',
    icon: '🏗️',
    type: 'weekly',
    tasks: [
      { id: 'build_2', name: 'Начинающий', description: 'Постройте 2 здания', target: 2, trackType: 'buildings', goldReward: 1000, manaReward: 0, expReward: 100 },
      { id: 'build_5', name: 'Застройщик', description: 'Постройте 5 зданий', target: 5, trackType: 'buildings', goldReward: 3000, manaReward: 15, expReward: 250 },
      { id: 'build_10', name: 'Градоначальник', description: 'Постройте 10 зданий', target: 10, trackType: 'buildings', goldReward: 7000, manaReward: 40, expReward: 600 },
    ],
  },
];

export const SEASONAL_EVENTS: GameEvent[] = [
  {
    id: 'season_winter',
    name: 'Зимний фестиваль',
    description: 'Особые испытания зимнего сезона',
    icon: '❄️',
    type: 'seasonal',
    startMonth: 12,
    endMonth: 2,
    tasks: [
      { id: 'winter_pvp', name: 'Ледяной поединок', description: 'Выиграйте 10 PvP боёв', target: 10, trackType: 'pvp_wins', goldReward: 5000, manaReward: 30, expReward: 500 },
      { id: 'winter_army', name: 'Зимняя армия', description: 'Наберите 100 юнитов', target: 100, trackType: 'army_total', goldReward: 5000, manaReward: 30, expReward: 500 },
      { id: 'winter_gold', name: 'Сокровища Мороза', description: 'Накопите 100,000 золота', target: 100000, trackType: 'gold_current', goldReward: 15000, manaReward: 75, expReward: 1500 },
    ],
  },
  {
    id: 'season_spring',
    name: 'Весеннее пробуждение',
    description: 'Сезон роста и обновления',
    icon: '🌸',
    type: 'seasonal',
    startMonth: 3,
    endMonth: 5,
    tasks: [
      { id: 'spring_build', name: 'Цветущий город', description: 'Постройте 10 зданий', target: 10, trackType: 'buildings', goldReward: 5000, manaReward: 30, expReward: 500 },
      { id: 'spring_spells', name: 'Магия весны', description: 'Изучите 5 заклинаний', target: 5, trackType: 'spells', goldReward: 5000, manaReward: 50, expReward: 500 },
      { id: 'spring_level', name: 'Пробуждение силы', description: 'Достигните 10 уровня', target: 10, trackType: 'hero_level', goldReward: 15000, manaReward: 75, expReward: 1500 },
    ],
  },
  {
    id: 'season_summer',
    name: 'Летняя кампания',
    description: 'Завоевания жаркого сезона',
    icon: '☀️',
    type: 'seasonal',
    startMonth: 6,
    endMonth: 8,
    tasks: [
      { id: 'summer_battles', name: 'Жаркие бои', description: 'Победите 30 монстров', target: 30, trackType: 'battles', goldReward: 5000, manaReward: 30, expReward: 500 },
      { id: 'summer_quests', name: 'Летний искатель', description: 'Выполните 5 квестов', target: 5, trackType: 'quests', goldReward: 5000, manaReward: 30, expReward: 500 },
      { id: 'summer_streak', name: 'Солнечная серия', description: 'Серия входов: 14 дней', target: 14, trackType: 'streak', goldReward: 15000, manaReward: 75, expReward: 1500 },
    ],
  },
  {
    id: 'season_autumn',
    name: 'Осенний урожай',
    description: 'Время собирать плоды трудов',
    icon: '🍂',
    type: 'seasonal',
    startMonth: 9,
    endMonth: 11,
    tasks: [
      { id: 'autumn_artifacts', name: 'Сбор реликвий', description: 'Соберите 5 артефактов', target: 5, trackType: 'artifacts', goldReward: 5000, manaReward: 30, expReward: 500 },
      { id: 'autumn_gold', name: 'Золотой урожай', description: 'Накопите 75,000 золота', target: 75000, trackType: 'gold_current', goldReward: 10000, manaReward: 50, expReward: 1000 },
      { id: 'autumn_skills', name: 'Мудрость осени', description: 'Изучите 7 навыков', target: 7, trackType: 'skills_total', goldReward: 15000, manaReward: 75, expReward: 1500 },
    ],
  },
];

/** Get the current weekly tournament based on real week number */
export function getCurrentWeeklyTournament(): GameEvent {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return WEEKLY_TOURNAMENTS[weekNum % WEEKLY_TOURNAMENTS.length];
}

/** Get the current seasonal event based on real month */
export function getCurrentSeasonalEvent(): GameEvent | null {
  const month = new Date().getMonth() + 1; // 1-12
  return SEASONAL_EVENTS.find(e => {
    if (!e.startMonth || !e.endMonth) return false;
    if (e.startMonth <= e.endMonth) {
      return month >= e.startMonth && month <= e.endMonth;
    }
    // Wraps around (e.g. Dec-Feb)
    return month >= e.startMonth || month <= e.endMonth;
  }) || null;
}

/** Days remaining in current week */
export function getDaysRemainingInWeek(): number {
  const now = new Date();
  return 7 - now.getDay() || 7;
}
