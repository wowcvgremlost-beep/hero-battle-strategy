import type { TownId } from './towns';

export interface HeroSkill {
  id: string;
  name: string;
  description: string;
  bonusAttack?: number;
  bonusDefense?: number;
  bonusSpellpower?: number;
  bonusKnowledge?: number;
  bonusMana?: number;
}

export interface Hero {
  id: string;
  name: string;
  class: 'warrior' | 'mage';
  townId: TownId;
  portrait: string;
  baseAttack: number;
  baseDefense: number;
  baseSpellpower: number;
  baseKnowledge: number;
  skill: HeroSkill;
  description: string;
}

export const HERO_SKILLS: HeroSkill[] = [
  { id: 'leadership', name: 'Лидерство', description: '+1 к боевому духу армии', bonusAttack: 2 },
  { id: 'archery', name: 'Стрельба', description: '+10% к урону стрелков', bonusAttack: 1 },
  { id: 'offense', name: 'Нападение', description: '+2 к атаке всех существ', bonusAttack: 3 },
  { id: 'armorer', name: 'Доспехи', description: '+2 к защите всех существ', bonusDefense: 3 },
  { id: 'tactics', name: 'Тактика', description: 'Выбор позиции в начале боя', bonusAttack: 1, bonusDefense: 1 },
  { id: 'resistance', name: 'Сопротивление', description: '+5% к защите от магии', bonusDefense: 2 },
  { id: 'wisdom', name: 'Мудрость', description: 'Изучение заклинаний 3+ уровня', bonusKnowledge: 2 },
  { id: 'intelligence', name: 'Интеллект', description: '+25% к максимальной мане', bonusMana: 25 },
  { id: 'sorcery', name: 'Колдовство', description: '+5% к силе заклинаний', bonusSpellpower: 2 },
  { id: 'mysticism', name: 'Мистицизм', description: '+2 маны в день', bonusKnowledge: 1, bonusMana: 10 },
  { id: 'earth_magic', name: 'Магия Земли', description: 'Усиление заклинаний Земли', bonusSpellpower: 1 },
  { id: 'fire_magic', name: 'Магия Огня', description: 'Усиление заклинаний Огня', bonusSpellpower: 1 },
  { id: 'water_magic', name: 'Магия Воды', description: 'Усиление заклинаний Воды', bonusSpellpower: 1 },
  { id: 'air_magic', name: 'Магия Воздуха', description: 'Усиление заклинаний Воздуха', bonusSpellpower: 1 },
  { id: 'necromancy', name: 'Некромантия', description: 'Воскрешение скелетов после боя', bonusSpellpower: 2 },
  { id: 'logistics', name: 'Логистика', description: '+10% к перемещению героя', bonusAttack: 1 },
];

export const HEROES: Hero[] = [
  // Castle
  { id: 'sir_christian', name: 'Сэр Кристиан', class: 'warrior', townId: 'castle', portrait: '🗡️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[0], description: 'Рыцарь-крестоносец с навыком Лидерство.' },
  { id: 'lord_haart', name: 'Лорд Хаарт', class: 'warrior', townId: 'castle', portrait: '⚔️', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[3], description: 'Опытный паладин, мастер защиты.' },
  { id: 'adelaide', name: 'Аделаида', class: 'mage', townId: 'castle', portrait: '✨', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: HERO_SKILLS[12], description: 'Клирик с талантом к магии Воды.' },
  
  // Rampart
  { id: 'mephala', name: 'Мефала', class: 'warrior', townId: 'rampart', portrait: '🏹', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: HERO_SKILLS[1], description: 'Рейнджер, мастер стрельбы.' },
  { id: 'gem', name: 'Джем', class: 'mage', townId: 'rampart', portrait: '🌿', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: HERO_SKILLS[9], description: 'Друид с даром мистицизма.' },
  
  // Tower
  { id: 'solmyr', name: 'Солмир', class: 'mage', townId: 'tower', portrait: '⚡', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: HERO_SKILLS[13], description: 'Легендарный маг воздуха с Цепной Молнией.' },
  { id: 'aine', name: 'Эйн', class: 'mage', townId: 'tower', portrait: '🔮', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: HERO_SKILLS[6], description: 'Алхимик с глубокой мудростью.' },
  
  // Inferno
  { id: 'xeron', name: 'Ксерон', class: 'warrior', townId: 'inferno', portrait: '🔥', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[2], description: 'Демон-командир с яростной атакой.' },
  { id: 'zydar', name: 'Зидар', class: 'mage', townId: 'inferno', portrait: '💀', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: HERO_SKILLS[11], description: 'Еретик, мастер магии огня.' },
  
  // Necropolis
  { id: 'sandro', name: 'Сандро', class: 'mage', townId: 'necropolis', portrait: '💀', baseAttack: 1, baseDefense: 0, baseSpellpower: 2, baseKnowledge: 4, skill: HERO_SKILLS[14], description: 'Могущественный некромант.' },
  { id: 'vidomina', name: 'Видомина', class: 'mage', townId: 'necropolis', portrait: '⚰️', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: HERO_SKILLS[14], description: 'Некромантка с талантом к воскрешению.' },
  
  // Dungeon
  { id: 'mutare', name: 'Мутара', class: 'warrior', townId: 'dungeon', portrait: '🐉', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[4], description: 'Повелительница драконов.' },
  { id: 'jeddite', name: 'Джеддит', class: 'mage', townId: 'dungeon', portrait: '🌑', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: HERO_SKILLS[10], description: 'Чернокнижник, мастер магии земли.' },
  
  // Stronghold
  { id: 'crag_hack', name: 'Крэг Хак', class: 'warrior', townId: 'stronghold', portrait: '🪓', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[2], description: 'Легендарный варвар с бешеной атакой.' },
  { id: 'gurnisson', name: 'Гурниссон', class: 'warrior', townId: 'stronghold', portrait: '🛡️', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[3], description: 'Варвар-защитник.' },
  
  // Fortress
  { id: 'tazar', name: 'Тазар', class: 'warrior', townId: 'fortress', portrait: '🐊', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[3], description: 'Зверолов из болот.' },
  { id: 'adrienne', name: 'Адриенна', class: 'mage', townId: 'fortress', portrait: '🔥', baseAttack: 1, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 2, skill: HERO_SKILLS[11], description: 'Ведьма с талантом к огню.' },
  
  // Conflux
  { id: 'erdamon', name: 'Эрдамон', class: 'warrior', townId: 'conflux', portrait: '🌍', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: HERO_SKILLS[4], description: 'Элементаль земли, тактик.' },
  { id: 'luna', name: 'Луна', class: 'mage', townId: 'conflux', portrait: '🌙', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: HERO_SKILLS[11], description: 'Элементалист огня с заклинанием Стена Огня.' },
  
  // Cove
  { id: 'cassiopeia', name: 'Кассиопея', class: 'warrior', townId: 'cove', portrait: '🦑', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: HERO_SKILLS[15], description: 'Капитан пиратов.' },
  { id: 'corkes', name: 'Коркес', class: 'warrior', townId: 'cove', portrait: '🏴‍☠️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[2], description: 'Пиратский адмирал.' },
  
  // Factory
  { id: 'frederick', name: 'Фредерик', class: 'warrior', townId: 'factory', portrait: '⚙️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: HERO_SKILLS[4], description: 'Инженер-командир.' },
  { id: 'giselle', name: 'Жизель', class: 'mage', townId: 'factory', portrait: '🔧', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: HERO_SKILLS[6], description: 'Изобретательница с мудростью.' },
];

export function getHeroesForTown(townId: TownId): Hero[] {
  return HEROES.filter(h => h.townId === townId);
}
