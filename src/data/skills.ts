// Hero skills system
// At each level-up, player picks 1 of 2 random skills to upgrade

export interface SkillDef {
  id: string;
  name: string;
  icon: string; // emoji
  description: string;
  maxLevel: number;
  effect: (level: number) => string;
}

export const SKILLS: SkillDef[] = [
  {
    id: 'attack',
    name: 'Атака',
    icon: '⚔️',
    description: 'Увеличивает урон армии',
    maxLevel: 10,
    effect: (lvl) => `+${lvl * 2} к атаке героя`,
  },
  {
    id: 'defense',
    name: 'Защита',
    icon: '🛡️',
    description: 'Уменьшает получаемый урон',
    maxLevel: 10,
    effect: (lvl) => `+${lvl * 2} к защите героя`,
  },
  {
    id: 'sorcery',
    name: 'Колдовство',
    icon: '🔮',
    description: 'Усиливает заклинания',
    maxLevel: 10,
    effect: (lvl) => `+${lvl * 2} к силе магии`,
  },
  {
    id: 'wisdom',
    name: 'Мудрость',
    icon: '📖',
    description: 'Увеличивает запас маны',
    maxLevel: 10,
    effect: (lvl) => `+${lvl * 2} к знаниям, +${lvl * 10} маны`,
  },
  {
    id: 'logistics',
    name: 'Логистика',
    icon: '🗺️',
    description: 'Бонус к движению на карте',
    maxLevel: 5,
    effect: (lvl) => `+${lvl} к броску кубика`,
  },
  {
    id: 'luck',
    name: 'Удача',
    icon: '🍀',
    description: 'Шанс критического удара в бою',
    maxLevel: 5,
    effect: (lvl) => `${lvl * 5}% шанс двойного урона`,
  },
];

// Experience needed to reach next level
export function expForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Get 2 random distinct skills for level-up choice
export function getRandomSkillChoices(currentSkills: Record<string, number>): SkillDef[] {
  // Filter skills that haven't reached max level
  const available = SKILLS.filter(s => (currentSkills[s.id] || 0) < s.maxLevel);
  if (available.length <= 2) return available;
  
  // Shuffle and pick 2
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

// Apply skill bonuses to hero stats
export function getSkillBonuses(skills: Record<string, number>) {
  return {
    bonusAttack: (skills['attack'] || 0) * 2,
    bonusDefense: (skills['defense'] || 0) * 2,
    bonusSpellpower: (skills['sorcery'] || 0) * 2,
    bonusKnowledge: (skills['wisdom'] || 0) * 2,
    bonusMana: (skills['wisdom'] || 0) * 10,
    bonusMove: skills['logistics'] || 0,
    luckChance: (skills['luck'] || 0) * 5,
  };
}
