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
  { id: 'luck', name: 'Удача', description: '+1 к удаче армии', bonusAttack: 1, bonusDefense: 1 },
  { id: 'diplomacy', name: 'Дипломатия', description: 'Шанс присоединения нейтральных существ', bonusKnowledge: 1 },
  { id: 'estates', name: 'Поместья', description: '+250 золота в день', bonusDefense: 1 },
  { id: 'learning', name: 'Обучение', description: '+5% к получаемому опыту', bonusKnowledge: 1 },
  { id: 'navigation', name: 'Навигация', description: '+50% к скорости на воде', bonusAttack: 1 },
  { id: 'pathfinding', name: 'Следопыт', description: 'Снижает штраф местности', bonusDefense: 1 },
  { id: 'scouting', name: 'Разведка', description: 'Увеличивает радиус обзора', bonusKnowledge: 1 },
  { id: 'ballistics', name: 'Баллистика', description: 'Улучшает осадные орудия', bonusAttack: 2 },
  { id: 'first_aid', name: 'Первая помощь', description: 'Палатка лечит больше HP', bonusKnowledge: 1 },
  { id: 'scholar', name: 'Учёность', description: 'Обмен заклинаниями с другими героями', bonusSpellpower: 1, bonusKnowledge: 1 },
  { id: 'eagle_eye', name: 'Орлиный глаз', description: 'Шанс выучить заклинание врага', bonusSpellpower: 1 },
];

const S = HERO_SKILLS;

export const HEROES: Hero[] = [
  // ═══════════════════ CASTLE (19 heroes) ═══════════════════
  { id: 'castle_w1', name: 'Сэр Кристиан', class: 'warrior', townId: 'castle', portrait: '🗡️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[0], description: 'Рыцарь-крестоносец с навыком Лидерство.' },
  { id: 'castle_w2', name: 'Лорд Хаарт', class: 'warrior', townId: 'castle', portrait: '⚔️', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Опытный паладин, мастер защиты.' },
  { id: 'castle_w3', name: 'Тирануэль', class: 'warrior', townId: 'castle', portrait: '🛡️', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[4], description: 'Ветеран крестовых походов, тактик.' },
  { id: 'castle_w4', name: 'Роланд', class: 'warrior', townId: 'castle', portrait: '👑', baseAttack: 4, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 1, skill: S[2], description: 'Король Эрафии, грозный воин.' },
  { id: 'castle_w5', name: 'Вальдор', class: 'warrior', townId: 'castle', portrait: '🏰', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[0], description: 'Капитан стражи замка.' },
  { id: 'castle_w6', name: 'Сорша', class: 'warrior', townId: 'castle', portrait: '⚜️', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[2], description: 'Отважная рыцарь-воительница.' },
  { id: 'castle_w7', name: 'Джентар', class: 'warrior', townId: 'castle', portrait: '🦅', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[18], description: 'Благородный лорд с поместьями.' },
  { id: 'castle_w8', name: 'Эдрик', class: 'warrior', townId: 'castle', portrait: '⚔️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[15], description: 'Странствующий рыцарь-логист.' },
  { id: 'castle_w9', name: 'Сильвия', class: 'warrior', townId: 'castle', portrait: '🏹', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[1], description: 'Мастер стрельбы из арбалета.' },
  { id: 'castle_w10', name: 'Ортин', class: 'warrior', townId: 'castle', portrait: '🗡️', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[23], description: 'Мастер осадного дела.' },
  { id: 'castle_m1', name: 'Аделаида', class: 'mage', townId: 'castle', portrait: '✨', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[12], description: 'Клирик с талантом к магии Воды.' },
  { id: 'castle_m2', name: 'Ридделл', class: 'mage', townId: 'castle', portrait: '📖', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[6], description: 'Мудрый монах-учёный.' },
  { id: 'castle_m3', name: 'Катерина', class: 'mage', townId: 'castle', portrait: '👸', baseAttack: 1, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 2, skill: S[0], description: 'Королева-чародейка Эрафии.' },
  { id: 'castle_m4', name: 'Лорагель', class: 'mage', townId: 'castle', portrait: '🕊️', baseAttack: 0, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 4, skill: S[24], description: 'Целительница с даром первой помощи.' },
  { id: 'castle_m5', name: 'Калид', class: 'mage', townId: 'castle', portrait: '🌟', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[19], description: 'Учёный-богослов.' },
  { id: 'castle_m6', name: 'Сейра', class: 'mage', townId: 'castle', portrait: '💫', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[8], description: 'Колдунья света.' },
  { id: 'castle_m7', name: 'Ирина', class: 'mage', townId: 'castle', portrait: '🔮', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[25], description: 'Учёная магесса.' },
  { id: 'castle_m8', name: 'Адела', class: 'mage', townId: 'castle', portrait: '⛪', baseAttack: 0, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 3, skill: S[17], description: 'Дипломат при дворе.' },
  { id: 'castle_m9', name: 'Цутин', class: 'mage', townId: 'castle', portrait: '📜', baseAttack: 1, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 2, skill: S[7], description: 'Интеллектуал с огромной маной.' },

  // ═══════════════════ RAMPART (19 heroes) ═══════════════════
  { id: 'rampart_w1', name: 'Мефала', class: 'warrior', townId: 'rampart', portrait: '🏹', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[1], description: 'Рейнджер, мастер стрельбы.' },
  { id: 'rampart_w2', name: 'Клэнси', class: 'warrior', townId: 'rampart', portrait: '🌲', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[5], description: 'Страж леса, устойчив к магии.' },
  { id: 'rampart_w3', name: 'Ивор', class: 'warrior', townId: 'rampart', portrait: '🍃', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[1], description: 'Эльфийский лучник.' },
  { id: 'rampart_w4', name: 'Кирре', class: 'warrior', townId: 'rampart', portrait: '🦄', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[15], description: 'Наездница на единороге.' },
  { id: 'rampart_w5', name: 'Рисса', class: 'warrior', townId: 'rampart', portrait: '🌿', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[2], description: 'Дева леса с яростной атакой.' },
  { id: 'rampart_w6', name: 'Дженова', class: 'warrior', townId: 'rampart', portrait: '🌸', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Хранительница дубрав.' },
  { id: 'rampart_w7', name: 'Тиерус', class: 'warrior', townId: 'rampart', portrait: '🐺', baseAttack: 3, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 2, skill: S[4], description: 'Лесной тактик.' },
  { id: 'rampart_w8', name: 'Алеталь', class: 'warrior', townId: 'rampart', portrait: '🦌', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[21], description: 'Следопыт из глубоких чащ.' },
  { id: 'rampart_w9', name: 'Элдриан', class: 'warrior', townId: 'rampart', portrait: '🌳', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[16], description: 'Удачливый воин леса.' },
  { id: 'rampart_w10', name: 'Файнор', class: 'warrior', townId: 'rampart', portrait: '🍂', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[22], description: 'Разведчик из Авли.' },
  { id: 'rampart_m1', name: 'Джем', class: 'mage', townId: 'rampart', portrait: '🌿', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[9], description: 'Друид с даром мистицизма.' },
  { id: 'rampart_m2', name: 'Аэрис', class: 'mage', townId: 'rampart', portrait: '🦋', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[6], description: 'Мудрая друидесса.' },
  { id: 'rampart_m3', name: 'Коронар', class: 'mage', townId: 'rampart', portrait: '🌾', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[25], description: 'Учёный-натуралист.' },
  { id: 'rampart_m4', name: 'Мелиссия', class: 'mage', townId: 'rampart', portrait: '🌺', baseAttack: 0, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 3, skill: S[24], description: 'Целительница природы.' },
  { id: 'rampart_m5', name: 'Уланд', class: 'mage', townId: 'rampart', portrait: '🌙', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[12], description: 'Маг водной стихии.' },
  { id: 'rampart_m6', name: 'Террин', class: 'mage', townId: 'rampart', portrait: '🍀', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[10], description: 'Маг земли и корней.' },
  { id: 'rampart_m7', name: 'Элиссия', class: 'mage', townId: 'rampart', portrait: '💐', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[8], description: 'Колдунья леса.' },
  { id: 'rampart_m8', name: 'Верднат', class: 'mage', townId: 'rampart', portrait: '🌱', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[7], description: 'Друид с огромным запасом маны.' },
  { id: 'rampart_m9', name: 'Таронель', class: 'mage', townId: 'rampart', portrait: '🧝', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[17], description: 'Эльфийский дипломат-маг.' },

  // ═══════════════════ TOWER (19 heroes) ═══════════════════
  { id: 'tower_w1', name: 'Фиона', class: 'warrior', townId: 'tower', portrait: '❄️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Алхимик-воин с мощной атакой.' },
  { id: 'tower_w2', name: 'Нэндо', class: 'warrior', townId: 'tower', portrait: '🔩', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Мастер защитных конструкций.' },
  { id: 'tower_w3', name: 'Риссан', class: 'warrior', townId: 'tower', portrait: '⚗️', baseAttack: 3, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 2, skill: S[4], description: 'Тактик-инженер.' },
  { id: 'tower_w4', name: 'Тодд', class: 'warrior', townId: 'tower', portrait: '🏔️', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[18], description: 'Управляющий поместьями.' },
  { id: 'tower_w5', name: 'Нива', class: 'warrior', townId: 'tower', portrait: '🌬️', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[1], description: 'Мастер баллист.' },
  { id: 'tower_w6', name: 'Киар', class: 'warrior', townId: 'tower', portrait: '🧊', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[0], description: 'Командир гарнизона Башни.' },
  { id: 'tower_w7', name: 'Лейла', class: 'warrior', townId: 'tower', portrait: '⭐', baseAttack: 3, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 2, skill: S[15], description: 'Алхимик-логист.' },
  { id: 'tower_w8', name: 'Тельсин', class: 'warrior', townId: 'tower', portrait: '🔬', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[23], description: 'Мастер осадных машин.' },
  { id: 'tower_w9', name: 'Гельмар', class: 'warrior', townId: 'tower', portrait: '🧲', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[5], description: 'Страж со стойкостью к магии.' },
  { id: 'tower_m1', name: 'Солмир', class: 'mage', townId: 'tower', portrait: '⚡', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: S[13], description: 'Легендарный маг воздуха.' },
  { id: 'tower_m2', name: 'Эйн', class: 'mage', townId: 'tower', portrait: '🔮', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[6], description: 'Алхимик с глубокой мудростью.' },
  { id: 'tower_m3', name: 'Астрал', class: 'mage', townId: 'tower', portrait: '💎', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[8], description: 'Могущественный колдун Башни.' },
  { id: 'tower_m4', name: 'Хейлин', class: 'mage', townId: 'tower', portrait: '📘', baseAttack: 0, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 4, skill: S[25], description: 'Учёный-энциклопедист.' },
  { id: 'tower_m5', name: 'Теодор', class: 'mage', townId: 'tower', portrait: '🧙', baseAttack: 1, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 2, skill: S[23], description: 'Маг-изобретатель баллист.' },
  { id: 'tower_m6', name: 'Цирвен', class: 'mage', townId: 'tower', portrait: '🌀', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[7], description: 'Маг с огромной маной.' },
  { id: 'tower_m7', name: 'Джосефина', class: 'mage', townId: 'tower', portrait: '✨', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[9], description: 'Мистик из Бракады.' },
  { id: 'tower_m8', name: 'Серена', class: 'mage', townId: 'tower', portrait: '🔵', baseAttack: 0, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 3, skill: S[26], description: 'Маг с орлиным глазом.' },
  { id: 'tower_m9', name: 'Драго', class: 'mage', townId: 'tower', portrait: '🌊', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[12], description: 'Водный маг из Башни.' },
  { id: 'tower_m10', name: 'Мейнар', class: 'mage', townId: 'tower', portrait: '⚡', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: S[19], description: 'Быстро обучаемый маг.' },

  // ═══════════════════ INFERNO (19 heroes) ═══════════════════
  { id: 'inferno_w1', name: 'Ксерон', class: 'warrior', townId: 'inferno', portrait: '🔥', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Демон-командир с яростной атакой.' },
  { id: 'inferno_w2', name: 'Рашка', class: 'warrior', townId: 'inferno', portrait: '😈', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Демон-рыцарь разрушения.' },
  { id: 'inferno_w3', name: 'Фиур', class: 'warrior', townId: 'inferno', portrait: '🔱', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[2], description: 'Демон огненного легиона.' },
  { id: 'inferno_w4', name: 'Игнатиус', class: 'warrior', townId: 'inferno', portrait: '🌋', baseAttack: 4, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 1, skill: S[4], description: 'Тактик преисподней.' },
  { id: 'inferno_w5', name: 'Октавия', class: 'warrior', townId: 'inferno', portrait: '🦇', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[15], description: 'Демоница-скаут.' },
  { id: 'inferno_w6', name: 'Мариус', class: 'warrior', townId: 'inferno', portrait: '💢', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[3], description: 'Падший рыцарь в доспехах.' },
  { id: 'inferno_w7', name: 'Каледон', class: 'warrior', townId: 'inferno', portrait: '🗡️', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[0], description: 'Командир демонических легионов.' },
  { id: 'inferno_w8', name: 'Нихон', class: 'warrior', townId: 'inferno', portrait: '⚔️', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[23], description: 'Осадный мастер инферно.' },
  { id: 'inferno_w9', name: 'Пир', class: 'warrior', townId: 'inferno', portrait: '🔥', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[1], description: 'Снайпер из бездны.' },
  { id: 'inferno_w10', name: 'Готар', class: 'warrior', townId: 'inferno', portrait: '💀', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[16], description: 'Удачливый рыцарь ада.' },
  { id: 'inferno_m1', name: 'Зидар', class: 'mage', townId: 'inferno', portrait: '🔥', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[11], description: 'Еретик, мастер магии огня.' },
  { id: 'inferno_m2', name: 'Кальк', class: 'mage', townId: 'inferno', portrait: '💥', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: S[11], description: 'Огненный маг разрушитель.' },
  { id: 'inferno_m3', name: 'Ашар', class: 'mage', townId: 'inferno', portrait: '⚗️', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[8], description: 'Колдун инферно.' },
  { id: 'inferno_m4', name: 'Олема', class: 'mage', townId: 'inferno', portrait: '🌑', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[6], description: 'Мудрая ведьма бездны.' },
  { id: 'inferno_m5', name: 'Ксарфакс', class: 'mage', townId: 'inferno', portrait: '💠', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[7], description: 'Маг с безграничной маной.' },
  { id: 'inferno_m6', name: 'Раскас', class: 'mage', townId: 'inferno', portrait: '🔴', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[9], description: 'Мистик огня.' },
  { id: 'inferno_m7', name: 'Аксис', class: 'mage', townId: 'inferno', portrait: '⚫', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[25], description: 'Учёный-демонолог.' },
  { id: 'inferno_m8', name: 'Аюра', class: 'mage', townId: 'inferno', portrait: '🌙', baseAttack: 0, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 3, skill: S[17], description: 'Дипломат из бездны.' },
  { id: 'inferno_m9', name: 'Нирулл', class: 'mage', townId: 'inferno', portrait: '🕯️', baseAttack: 1, baseDefense: 0, baseSpellpower: 4, baseKnowledge: 2, skill: S[26], description: 'Ведьмак с орлиным глазом.' },

  // ═══════════════════ NECROPOLIS (19 heroes) ═══════════════════
  { id: 'necro_w1', name: 'Тамика', class: 'warrior', townId: 'necropolis', portrait: '⚰️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Рыцарь смерти.' },
  { id: 'necro_w2', name: 'Иштван', class: 'warrior', townId: 'necropolis', portrait: '🧛', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Вампирский лорд-воин.' },
  { id: 'necro_w3', name: 'Карон', class: 'warrior', townId: 'necropolis', portrait: '💀', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[3], description: 'Защитник склепов.' },
  { id: 'necro_w4', name: 'Мортлин', class: 'warrior', townId: 'necropolis', portrait: '🗡️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[4], description: 'Тёмный тактик.' },
  { id: 'necro_w5', name: 'Чёрный рыцарь', class: 'warrior', townId: 'necropolis', portrait: '🏴', baseAttack: 4, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 1, skill: S[0], description: 'Лидер нежити.' },
  { id: 'necro_w6', name: 'Кальдор', class: 'warrior', townId: 'necropolis', portrait: '⚔️', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[15], description: 'Логист тёмной армии.' },
  { id: 'necro_w7', name: 'Стронн', class: 'warrior', townId: 'necropolis', portrait: '🛡️', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[5], description: 'Страж с сопротивлением к магии.' },
  { id: 'necro_w8', name: 'Нагаш', class: 'warrior', townId: 'necropolis', portrait: '☠️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[23], description: 'Осадный мастер нежити.' },
  { id: 'necro_w9', name: 'Вокиал', class: 'warrior', townId: 'necropolis', portrait: '🦇', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[1], description: 'Тёмный стрелок.' },
  { id: 'necro_m1', name: 'Сандро', class: 'mage', townId: 'necropolis', portrait: '💀', baseAttack: 1, baseDefense: 0, baseSpellpower: 2, baseKnowledge: 4, skill: S[14], description: 'Могущественный некромант.' },
  { id: 'necro_m2', name: 'Видомина', class: 'mage', townId: 'necropolis', portrait: '⚰️', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[14], description: 'Некромантка с талантом к воскрешению.' },
  { id: 'necro_m3', name: 'Зантари', class: 'mage', townId: 'necropolis', portrait: '🌑', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[14], description: 'Древний некромант.' },
  { id: 'necro_m4', name: 'Морпас', class: 'mage', townId: 'necropolis', portrait: '🔮', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[10], description: 'Маг земли и смерти.' },
  { id: 'necro_m5', name: 'Серра', class: 'mage', townId: 'necropolis', portrait: '🕯️', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[26], description: 'Видящая смерть.' },
  { id: 'necro_m6', name: 'Нимбус', class: 'mage', townId: 'necropolis', portrait: '⚗️', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[8], description: 'Колдун некрополиса.' },
  { id: 'necro_m7', name: 'Велмира', class: 'mage', townId: 'necropolis', portrait: '👻', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[6], description: 'Мудрая некромантка.' },
  { id: 'necro_m8', name: 'Сатар', class: 'mage', townId: 'necropolis', portrait: '🌘', baseAttack: 1, baseDefense: 0, baseSpellpower: 4, baseKnowledge: 2, skill: S[7], description: 'Маг с безграничной маной.' },
  { id: 'necro_m9', name: 'Искра', class: 'mage', townId: 'necropolis', portrait: '⚡', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[9], description: 'Мистик из склепов.' },
  { id: 'necro_m10', name: 'Галтран', class: 'mage', townId: 'necropolis', portrait: '📖', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[25], description: 'Учёный-некролог.' },

  // ═══════════════════ DUNGEON (19 heroes) ═══════════════════
  { id: 'dungeon_w1', name: 'Мутара', class: 'warrior', townId: 'dungeon', portrait: '🐉', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[4], description: 'Повелительница драконов.' },
  { id: 'dungeon_w2', name: 'Шакти', class: 'warrior', townId: 'dungeon', portrait: '🦂', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Владычица подземелий.' },
  { id: 'dungeon_w3', name: 'Синрит', class: 'warrior', townId: 'dungeon', portrait: '🌑', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[0], description: 'Полководец Темницы.' },
  { id: 'dungeon_w4', name: 'Лоренлин', class: 'warrior', townId: 'dungeon', portrait: '🕷️', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[15], description: 'Разведчица подземелий.' },
  { id: 'dungeon_w5', name: 'Гунар', class: 'warrior', townId: 'dungeon', portrait: '🗡️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Страж пещер.' },
  { id: 'dungeon_w6', name: 'Дарнаг', class: 'warrior', townId: 'dungeon', portrait: '⚔️', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[1], description: 'Подземный стрелок.' },
  { id: 'dungeon_w7', name: 'Зарек', class: 'warrior', townId: 'dungeon', portrait: '🦇', baseAttack: 4, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 1, skill: S[23], description: 'Мастер осады Темницы.' },
  { id: 'dungeon_w8', name: 'Ролтэн', class: 'warrior', townId: 'dungeon', portrait: '🐍', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[5], description: 'Стойкий к магии.' },
  { id: 'dungeon_w9', name: 'Ниваль', class: 'warrior', townId: 'dungeon', portrait: '🔱', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[16], description: 'Удачливый наёмник.' },
  { id: 'dungeon_w10', name: 'Тредан', class: 'warrior', townId: 'dungeon', portrait: '🛡️', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[18], description: 'Управляющий подземными поместьями.' },
  { id: 'dungeon_m1', name: 'Джеддит', class: 'mage', townId: 'dungeon', portrait: '🌑', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[10], description: 'Чернокнижник, мастер магии земли.' },
  { id: 'dungeon_m2', name: 'Алагар', class: 'mage', townId: 'dungeon', portrait: '🔮', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: S[8], description: 'Могущественный чернокнижник.' },
  { id: 'dungeon_m3', name: 'Деемер', class: 'mage', townId: 'dungeon', portrait: '⚡', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[13], description: 'Маг воздуха из подземелий.' },
  { id: 'dungeon_m4', name: 'Малекит', class: 'mage', townId: 'dungeon', portrait: '💜', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[8], description: 'Тёмный колдун.' },
  { id: 'dungeon_m5', name: 'Серафин', class: 'mage', townId: 'dungeon', portrait: '📖', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[6], description: 'Мудрый чернокнижник.' },
  { id: 'dungeon_m6', name: 'Нириль', class: 'mage', townId: 'dungeon', portrait: '🕯️', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[7], description: 'Маг с огромной маной.' },
  { id: 'dungeon_m7', name: 'Кальдера', class: 'mage', townId: 'dungeon', portrait: '🌀', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[11], description: 'Маг огня из глубин.' },
  { id: 'dungeon_m8', name: 'Тесса', class: 'mage', townId: 'dungeon', portrait: '✨', baseAttack: 0, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 3, skill: S[26], description: 'Провидица Темницы.' },
  { id: 'dungeon_m9', name: 'Горлен', class: 'mage', townId: 'dungeon', portrait: '🧙', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[9], description: 'Мистик подземелий.' },

  // ═══════════════════ STRONGHOLD (19 heroes) ═══════════════════
  { id: 'strong_w1', name: 'Крэг Хак', class: 'warrior', townId: 'stronghold', portrait: '🪓', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Легендарный варвар с бешеной атакой.' },
  { id: 'strong_w2', name: 'Гурниссон', class: 'warrior', townId: 'stronghold', portrait: '🛡️', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Варвар-защитник.' },
  { id: 'strong_w3', name: 'Тарнум', class: 'warrior', townId: 'stronghold', portrait: '⚔️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[4], description: 'Бессмертный варвар-вождь.' },
  { id: 'strong_w4', name: 'Грелок', class: 'warrior', townId: 'stronghold', portrait: '🐗', baseAttack: 4, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 1, skill: S[2], description: 'Свирепый орк-берсерк.' },
  { id: 'strong_w5', name: 'Ша-Хан', class: 'warrior', townId: 'stronghold', portrait: '🏹', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[1], description: 'Орк-стрелок из степей.' },
  { id: 'strong_w6', name: 'Брут', class: 'warrior', townId: 'stronghold', portrait: '💪', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[0], description: 'Вождь орков.' },
  { id: 'strong_w7', name: 'Коргон', class: 'warrior', townId: 'stronghold', portrait: '🔥', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[15], description: 'Варвар-логист.' },
  { id: 'strong_w8', name: 'Монера', class: 'warrior', townId: 'stronghold', portrait: '⚡', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[16], description: 'Удачливая воительница.' },
  { id: 'strong_w9', name: 'Загрод', class: 'warrior', townId: 'stronghold', portrait: '🗡️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[23], description: 'Осадный мастер.' },
  { id: 'strong_w10', name: 'Тырак', class: 'warrior', townId: 'stronghold', portrait: '🏔️', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[21], description: 'Следопыт степей.' },
  { id: 'strong_m1', name: 'Зунда', class: 'mage', townId: 'stronghold', portrait: '🌀', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[6], description: 'Мудрый шаман.' },
  { id: 'strong_m2', name: 'Кольт', class: 'mage', townId: 'stronghold', portrait: '⚡', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[13], description: 'Шаман бурь.' },
  { id: 'strong_m3', name: 'Ярула', class: 'mage', townId: 'stronghold', portrait: '🔮', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[11], description: 'Шаманка огня.' },
  { id: 'strong_m4', name: 'Войн', class: 'mage', townId: 'stronghold', portrait: '🌍', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[10], description: 'Шаман земли.' },
  { id: 'strong_m5', name: 'Дрога', class: 'mage', townId: 'stronghold', portrait: '🌊', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[12], description: 'Шаман воды.' },
  { id: 'strong_m6', name: 'Нилка', class: 'mage', townId: 'stronghold', portrait: '🌟', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[8], description: 'Колдунья степей.' },
  { id: 'strong_m7', name: 'Ругар', class: 'mage', townId: 'stronghold', portrait: '🧙', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[9], description: 'Мистик Цитадели.' },
  { id: 'strong_m8', name: 'Годра', class: 'mage', townId: 'stronghold', portrait: '💎', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[7], description: 'Шаманка с огромной маной.' },
  { id: 'strong_m9', name: 'Тесля', class: 'mage', townId: 'stronghold', portrait: '📖', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[19], description: 'Быстро обучаемый шаман.' },

  // ═══════════════════ FORTRESS (19 heroes) ═══════════════════
  { id: 'fort_w1', name: 'Тазар', class: 'warrior', townId: 'fortress', portrait: '🐊', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Зверолов из болот.' },
  { id: 'fort_w2', name: 'Бронт', class: 'warrior', townId: 'fortress', portrait: '🐍', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Страж болотных врат.' },
  { id: 'fort_w3', name: 'Кор', class: 'warrior', townId: 'fortress', portrait: '🦎', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[4], description: 'Тактик болот.' },
  { id: 'fort_w4', name: 'Дракон', class: 'warrior', townId: 'fortress', portrait: '🐲', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Яростный охотник.' },
  { id: 'fort_w5', name: 'Вигра', class: 'warrior', townId: 'fortress', portrait: '🛡️', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[5], description: 'Стойкая к магии.' },
  { id: 'fort_w6', name: 'Алкин', class: 'warrior', townId: 'fortress', portrait: '🏹', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[1], description: 'Болотный стрелок.' },
  { id: 'fort_w7', name: 'Кроган', class: 'warrior', townId: 'fortress', portrait: '⚔️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[0], description: 'Лидер Крепости.' },
  { id: 'fort_w8', name: 'Страггл', class: 'warrior', townId: 'fortress', portrait: '🗡️', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[15], description: 'Болотный логист.' },
  { id: 'fort_w9', name: 'Вернак', class: 'warrior', townId: 'fortress', portrait: '🐸', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[21], description: 'Следопыт болот.' },
  { id: 'fort_w10', name: 'Грок', class: 'warrior', townId: 'fortress', portrait: '💀', baseAttack: 4, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 1, skill: S[23], description: 'Мастер осад.' },
  { id: 'fort_m1', name: 'Адриенна', class: 'mage', townId: 'fortress', portrait: '🔥', baseAttack: 1, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 2, skill: S[11], description: 'Ведьма с талантом к огню.' },
  { id: 'fort_m2', name: 'Вердана', class: 'mage', townId: 'fortress', portrait: '🌿', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[24], description: 'Целительница болот.' },
  { id: 'fort_m3', name: 'Зелда', class: 'mage', townId: 'fortress', portrait: '🌙', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[6], description: 'Мудрая ведьма.' },
  { id: 'fort_m4', name: 'Мирелла', class: 'mage', townId: 'fortress', portrait: '🔮', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[12], description: 'Водная ведьма.' },
  { id: 'fort_m5', name: 'Рокса', class: 'mage', townId: 'fortress', portrait: '⚡', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[10], description: 'Ведьма земли.' },
  { id: 'fort_m6', name: 'Тайна', class: 'mage', townId: 'fortress', portrait: '🕯️', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: S[8], description: 'Могущественная колдунья.' },
  { id: 'fort_m7', name: 'Серпентра', class: 'mage', townId: 'fortress', portrait: '🐍', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[9], description: 'Мистик из трясин.' },
  { id: 'fort_m8', name: 'Нала', class: 'mage', townId: 'fortress', portrait: '💧', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[7], description: 'Ведьма с огромной маной.' },
  { id: 'fort_m9', name: 'Казра', class: 'mage', townId: 'fortress', portrait: '📖', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[25], description: 'Учёная ведьма.' },

  // ═══════════════════ CONFLUX (19 heroes) ═══════════════════
  { id: 'conflux_w1', name: 'Эрдамон', class: 'warrior', townId: 'conflux', portrait: '🌍', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[4], description: 'Элементаль земли, тактик.' },
  { id: 'conflux_w2', name: 'Фирагот', class: 'warrior', townId: 'conflux', portrait: '🔥', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Огненный элементаль-воин.' },
  { id: 'conflux_w3', name: 'Аквар', class: 'warrior', townId: 'conflux', portrait: '💧', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Водный элементаль-страж.' },
  { id: 'conflux_w4', name: 'Вентус', class: 'warrior', townId: 'conflux', portrait: '🌬️', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[15], description: 'Воздушный скаут.' },
  { id: 'conflux_w5', name: 'Тэрракс', class: 'warrior', townId: 'conflux', portrait: '🏔️', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[3], description: 'Каменный страж.' },
  { id: 'conflux_w6', name: 'Пирокс', class: 'warrior', townId: 'conflux', portrait: '🌋', baseAttack: 4, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 1, skill: S[2], description: 'Магмовый берсерк.' },
  { id: 'conflux_w7', name: 'Глассиор', class: 'warrior', townId: 'conflux', portrait: '❄️', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[0], description: 'Ледяной командир.' },
  { id: 'conflux_w8', name: 'Стормрэд', class: 'warrior', townId: 'conflux', portrait: '⚡', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[1], description: 'Грозовой стрелок.' },
  { id: 'conflux_w9', name: 'Кварцит', class: 'warrior', townId: 'conflux', portrait: '💎', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[5], description: 'Кристальный страж.' },
  { id: 'conflux_w10', name: 'Эфирон', class: 'warrior', townId: 'conflux', portrait: '✨', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[16], description: 'Удачливый элементаль.' },
  { id: 'conflux_m1', name: 'Луна', class: 'mage', townId: 'conflux', portrait: '🌙', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: S[11], description: 'Элементалист огня.' },
  { id: 'conflux_m2', name: 'Ариэль', class: 'mage', townId: 'conflux', portrait: '🌊', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[12], description: 'Маг водной стихии.' },
  { id: 'conflux_m3', name: 'Эолас', class: 'mage', townId: 'conflux', portrait: '🌀', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[13], description: 'Маг воздуха.' },
  { id: 'conflux_m4', name: 'Геодан', class: 'mage', townId: 'conflux', portrait: '🌍', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[10], description: 'Маг земли.' },
  { id: 'conflux_m5', name: 'Примагель', class: 'mage', townId: 'conflux', portrait: '🔮', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: S[8], description: 'Архимаг стихий.' },
  { id: 'conflux_m6', name: 'Нолар', class: 'mage', townId: 'conflux', portrait: '⚗️', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[6], description: 'Мудрый элементалист.' },
  { id: 'conflux_m7', name: 'Вулканис', class: 'mage', townId: 'conflux', portrait: '🔥', baseAttack: 1, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 2, skill: S[7], description: 'Маг с запасом маны.' },
  { id: 'conflux_m8', name: 'Бореас', class: 'mage', townId: 'conflux', portrait: '❄️', baseAttack: 0, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 3, skill: S[9], description: 'Мистик зимы.' },
  { id: 'conflux_m9', name: 'Сильфида', class: 'mage', townId: 'conflux', portrait: '🦋', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[25], description: 'Учёная элементалистка.' },

  // ═══════════════════ COVE (19 heroes) ═══════════════════
  { id: 'cove_w1', name: 'Кассиопея', class: 'warrior', townId: 'cove', portrait: '🦑', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[15], description: 'Капитан пиратов.' },
  { id: 'cove_w2', name: 'Коркес', class: 'warrior', townId: 'cove', portrait: '🏴‍☠️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Пиратский адмирал.' },
  { id: 'cove_w3', name: 'Джереми', class: 'warrior', townId: 'cove', portrait: '⚓', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[20], description: 'Морской навигатор.' },
  { id: 'cove_w4', name: 'Торак', class: 'warrior', townId: 'cove', portrait: '🗡️', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Свирепый абордажник.' },
  { id: 'cove_w5', name: 'Сайрин', class: 'warrior', townId: 'cove', portrait: '🧜', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Морской страж.' },
  { id: 'cove_w6', name: 'Дрейк', class: 'warrior', townId: 'cove', portrait: '⛵', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[4], description: 'Корсар-тактик.' },
  { id: 'cove_w7', name: 'Морган', class: 'warrior', townId: 'cove', portrait: '💰', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[18], description: 'Богатый пират с поместьями.' },
  { id: 'cove_w8', name: 'Нептуна', class: 'warrior', townId: 'cove', portrait: '🔱', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[0], description: 'Командир морского флота.' },
  { id: 'cove_w9', name: 'Блэкбирд', class: 'warrior', townId: 'cove', portrait: '🦜', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[1], description: 'Стрелок с пистолетами.' },
  { id: 'cove_w10', name: 'Рок', class: 'warrior', townId: 'cove', portrait: '⚔️', baseAttack: 4, baseDefense: 2, baseSpellpower: 0, baseKnowledge: 1, skill: S[16], description: 'Удачливый флибустьер.' },
  { id: 'cove_m1', name: 'Андовер', class: 'mage', townId: 'cove', portrait: '🌊', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[12], description: 'Маг морской стихии.' },
  { id: 'cove_m2', name: 'Миранда', class: 'mage', townId: 'cove', portrait: '🐚', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[6], description: 'Мудрая морская ведьма.' },
  { id: 'cove_m3', name: 'Лелиан', class: 'mage', townId: 'cove', portrait: '🧿', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[8], description: 'Колдун глубин.' },
  { id: 'cove_m4', name: 'Тайдрина', class: 'mage', townId: 'cove', portrait: '🌀', baseAttack: 0, baseDefense: 1, baseSpellpower: 4, baseKnowledge: 2, skill: S[13], description: 'Маг штормов.' },
  { id: 'cove_m5', name: 'Коралла', class: 'mage', townId: 'cove', portrait: '🪸', baseAttack: 0, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 3, skill: S[24], description: 'Целительница океана.' },
  { id: 'cove_m6', name: 'Навигус', class: 'mage', townId: 'cove', portrait: '🧭', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[20], description: 'Маг-навигатор.' },
  { id: 'cove_m7', name: 'Пирель', class: 'mage', townId: 'cove', portrait: '💎', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[7], description: 'Маг с огромной маной.' },
  { id: 'cove_m8', name: 'Тритон', class: 'mage', townId: 'cove', portrait: '🐟', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[9], description: 'Мистик глубин.' },
  { id: 'cove_m9', name: 'Мауи', class: 'mage', townId: 'cove', portrait: '🌴', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[25], description: 'Учёный из тропиков.' },

  // ═══════════════════ FACTORY (19 heroes) ═══════════════════
  { id: 'factory_w1', name: 'Фредерик', class: 'warrior', townId: 'factory', portrait: '⚙️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[4], description: 'Инженер-командир.' },
  { id: 'factory_w2', name: 'Тодрос', class: 'warrior', townId: 'factory', portrait: '🔧', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[3], description: 'Мастер-механик.' },
  { id: 'factory_w3', name: 'Каликс', class: 'warrior', townId: 'factory', portrait: '⛏️', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[23], description: 'Осадный инженер.' },
  { id: 'factory_w4', name: 'Дизель', class: 'warrior', townId: 'factory', portrait: '🏭', baseAttack: 4, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 1, skill: S[2], description: 'Грубый работяга с мощной атакой.' },
  { id: 'factory_w5', name: 'Регина', class: 'warrior', townId: 'factory', portrait: '👸', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[0], description: 'Директор Фабрики.' },
  { id: 'factory_w6', name: 'Стил', class: 'warrior', townId: 'factory', portrait: '🗡️', baseAttack: 3, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 1, skill: S[15], description: 'Разведчик-логист.' },
  { id: 'factory_w7', name: 'Болтрус', class: 'warrior', townId: 'factory', portrait: '🔩', baseAttack: 2, baseDefense: 3, baseSpellpower: 1, baseKnowledge: 1, skill: S[5], description: 'Стальной защитник.' },
  { id: 'factory_w8', name: 'Харвест', class: 'warrior', townId: 'factory', portrait: '🌾', baseAttack: 2, baseDefense: 2, baseSpellpower: 1, baseKnowledge: 2, skill: S[18], description: 'Управляющий поместьями.' },
  { id: 'factory_w9', name: 'Курьер', class: 'warrior', townId: 'factory', portrait: '📦', baseAttack: 3, baseDefense: 1, baseSpellpower: 1, baseKnowledge: 2, skill: S[1], description: 'Мастер дальних перевозок.' },
  { id: 'factory_w10', name: 'Ферро', class: 'warrior', townId: 'factory', portrait: '🛡️', baseAttack: 3, baseDefense: 3, baseSpellpower: 0, baseKnowledge: 1, skill: S[16], description: 'Удачливый инженер.' },
  { id: 'factory_m1', name: 'Жизель', class: 'mage', townId: 'factory', portrait: '🔧', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[6], description: 'Изобретательница с мудростью.' },
  { id: 'factory_m2', name: 'Элеонора', class: 'mage', townId: 'factory', portrait: '⚗️', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[8], description: 'Алхимик-колдунья.' },
  { id: 'factory_m3', name: 'Тесла', class: 'mage', townId: 'factory', portrait: '⚡', baseAttack: 1, baseDefense: 0, baseSpellpower: 4, baseKnowledge: 2, skill: S[13], description: 'Гений электричества.' },
  { id: 'factory_m4', name: 'Механика', class: 'mage', townId: 'factory', portrait: '🤖', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[7], description: 'Маг с бездонной маной.' },
  { id: 'factory_m5', name: 'Формула', class: 'mage', townId: 'factory', portrait: '📐', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[25], description: 'Учёная-изобретательница.' },
  { id: 'factory_m6', name: 'Парус', class: 'mage', townId: 'factory', portrait: '💨', baseAttack: 1, baseDefense: 0, baseSpellpower: 3, baseKnowledge: 3, skill: S[13], description: 'Маг воздуха с Фабрики.' },
  { id: 'factory_m7', name: 'Оптика', class: 'mage', townId: 'factory', portrait: '🔬', baseAttack: 0, baseDefense: 1, baseSpellpower: 3, baseKnowledge: 3, skill: S[26], description: 'Провидица фабрики.' },
  { id: 'factory_m8', name: 'Литера', class: 'mage', townId: 'factory', portrait: '📖', baseAttack: 1, baseDefense: 1, baseSpellpower: 2, baseKnowledge: 3, skill: S[19], description: 'Быстро обучаемая маг.' },
  { id: 'factory_m9', name: 'Нефтида', class: 'mage', townId: 'factory', portrait: '🌀', baseAttack: 0, baseDefense: 2, baseSpellpower: 2, baseKnowledge: 3, skill: S[9], description: 'Мистик Фабрики.' },
];

export function getHeroesForTown(townId: TownId): Hero[] {
  return HEROES.filter(h => h.townId === townId);
}
