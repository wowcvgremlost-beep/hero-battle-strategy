export type SpellSchool = 'fire' | 'water' | 'earth' | 'air' | 'neutral';
export type SpellType = 'damage' | 'buff' | 'debuff' | 'summon' | 'utility';

export interface Spell {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4;
  school: SpellSchool;
  type: SpellType;
  manaCost: number;
  baseDamage?: number; // for damage spells
  effect: string;
  description: string;
}

// Level 1 Spells (5 spells from Mage Guild 1)
export const LEVEL_1_SPELLS: Spell[] = [
  { id: 'magic_arrow', name: 'Волшебная стрела', level: 1, school: 'neutral', type: 'damage', manaCost: 5, baseDamage: 15, effect: 'damage', description: 'Наносит 10-30 урона цели.' },
  { id: 'haste', name: 'Ускорение', level: 1, school: 'air', type: 'buff', manaCost: 6, effect: '+3 к скорости', description: 'Увеличивает скорость отряда.' },
  { id: 'slow', name: 'Замедление', level: 1, school: 'earth', type: 'debuff', manaCost: 6, effect: '-50% скорости', description: 'Снижает скорость врага.' },
  { id: 'shield', name: 'Щит', level: 1, school: 'earth', type: 'buff', manaCost: 5, effect: '+30% защиты', description: 'Снижает получаемый урон.' },
  { id: 'bloodlust', name: 'Жажда крови', level: 1, school: 'fire', type: 'buff', manaCost: 5, effect: '+3 атаки', description: 'Увеличивает атаку отряда.' },
  { id: 'bless', name: 'Благословение', level: 1, school: 'water', type: 'buff', manaCost: 5, effect: 'макс. урон', description: 'Отряд наносит максимальный урон.' },
  { id: 'cure', name: 'Лечение', level: 1, school: 'water', type: 'buff', manaCost: 6, baseDamage: -20, effect: 'heal', description: 'Восстанавливает 10-40 HP отряду.' },
  { id: 'dispel', name: 'Развеивание', level: 1, school: 'water', type: 'utility', manaCost: 5, effect: 'снятие эффектов', description: 'Снимает магические эффекты.' },
];

// Level 2 Spells (4 spells from Mage Guild 2)
export const LEVEL_2_SPELLS: Spell[] = [
  { id: 'lightning_bolt', name: 'Удар молнии', level: 2, school: 'air', type: 'damage', manaCost: 10, baseDamage: 30, effect: 'damage', description: 'Наносит 25-50 урона молнией.' },
  { id: 'ice_bolt', name: 'Ледяная стрела', level: 2, school: 'water', type: 'damage', manaCost: 8, baseDamage: 25, effect: 'damage', description: 'Наносит 20-40 урона льдом.' },
  { id: 'fireball', name: 'Огненный шар', level: 2, school: 'fire', type: 'damage', manaCost: 12, baseDamage: 35, effect: 'area damage', description: 'Урон по площади 15-45.' },
  { id: 'weakness', name: 'Слабость', level: 2, school: 'water', type: 'debuff', manaCost: 8, effect: '-6 атаки', description: 'Снижает атаку врага.' },
  { id: 'precision', name: 'Точность', level: 2, school: 'air', type: 'buff', manaCost: 8, effect: '+6 атаки', description: 'Увеличивает атаку стрелков.' },
  { id: 'stone_skin', name: 'Каменная кожа', level: 2, school: 'earth', type: 'buff', manaCost: 8, effect: '+6 защиты', description: 'Сильно увеличивает защиту.' },
];

// Level 3 Spells (3 spells from Mage Guild 3, requires Wisdom)
export const LEVEL_3_SPELLS: Spell[] = [
  { id: 'chain_lightning', name: 'Цепная молния', level: 3, school: 'air', type: 'damage', manaCost: 15, baseDamage: 50, effect: 'chain damage', description: 'Бьёт несколько целей с убыванием.' },
  { id: 'frost_ring', name: 'Кольцо холода', level: 3, school: 'water', type: 'damage', manaCost: 12, baseDamage: 40, effect: 'ring damage', description: 'Урон кольцом вокруг цели.' },
  { id: 'meteor_shower', name: 'Метеоритный дождь', level: 3, school: 'earth', type: 'damage', manaCost: 16, baseDamage: 55, effect: 'area damage', description: 'Мощный урон по площади.' },
  { id: 'animate_dead', name: 'Оживление мертвецов', level: 3, school: 'earth', type: 'summon', manaCost: 15, effect: 'resurrect undead', description: 'Воскрешает павшую нежить.' },
  { id: 'anti_magic', name: 'Антимагия', level: 3, school: 'earth', type: 'buff', manaCost: 15, effect: 'magic immunity', description: 'Иммунитет к магии для отряда.' },
];

// Level 4 Spells (2 spells from Mage Guild 4, requires Advanced Wisdom)
export const LEVEL_4_SPELLS: Spell[] = [
  { id: 'armageddon', name: 'Армагеддон', level: 4, school: 'fire', type: 'damage', manaCost: 24, baseDamage: 100, effect: 'global damage', description: 'Урон ВСЕМ существам на поле.' },
  { id: 'implosion', name: 'Имплозия', level: 4, school: 'earth', type: 'damage', manaCost: 25, baseDamage: 120, effect: 'massive single', description: 'Огромный урон одной цели.' },
  { id: 'resurrection', name: 'Воскрешение', level: 4, school: 'water', type: 'summon', manaCost: 20, effect: 'resurrect living', description: 'Воскрешает павших живых существ.' },
  { id: 'prayer', name: 'Молитва', level: 4, school: 'water', type: 'buff', manaCost: 18, effect: '+4 все', description: '+4 к атаке, защите и скорости.' },
];

export const ALL_SPELLS: Spell[] = [
  ...LEVEL_1_SPELLS,
  ...LEVEL_2_SPELLS,
  ...LEVEL_3_SPELLS,
  ...LEVEL_4_SPELLS,
];

export function getSpellsByLevel(level: 1 | 2 | 3 | 4): Spell[] {
  switch (level) {
    case 1: return LEVEL_1_SPELLS;
    case 2: return LEVEL_2_SPELLS;
    case 3: return LEVEL_3_SPELLS;
    case 4: return LEVEL_4_SPELLS;
  }
}

export function getSpellById(id: string): Spell | undefined {
  return ALL_SPELLS.find(s => s.id === id);
}
