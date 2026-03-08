import type { TownId } from './towns';

export type BuildingClass = 'common' | 'creature';

export interface Building {
  id: string;
  name: string;
  cost: number;
  buildingClass: BuildingClass;
  requirements: string[];
  description: string;
  townId?: TownId; // undefined = common (all towns)
}

// ─── Common buildings (available in every town) ───

export const COMMON_BUILDINGS: Building[] = [
  {
    id: 'prefecture',
    name: 'Префектура',
    cost: 2500,
    buildingClass: 'common',
    requirements: [],
    description: 'Ежедневно приносит в городскую казну 1000 золотых. (Заменяет сельскую управу)',
  },
  {
    id: 'municipality',
    name: 'Муниципалитет',
    cost: 5000,
    buildingClass: 'common',
    requirements: ['Префектура', 'Рынок', 'Гильдия магов 1-го уровня', 'Кузница'],
    description: 'Ежедневно приносит в городскую казну 2000 золотых. (Заменяет префектуру)',
  },
  {
    id: 'capitol',
    name: 'Капитолий',
    cost: 10000,
    buildingClass: 'common',
    requirements: ['Муниципалитет'],
    description: 'Ежедневно приносит в городскую казну 4000 золотых. У игрока может быть только один город со построенным Капитолием. (Заменяет Муниципалитет)',
  },
  {
    id: 'fort',
    name: 'Форт',
    cost: 5000,
    buildingClass: 'common',
    requirements: [],
    description: 'Позволяет строить жилища для существ. В Форте можно посмотреть количество скопившихся существ и купить их. При обороне города появляются стены.',
  },
  {
    id: 'citadel',
    name: 'Цитадель',
    cost: 2500,
    buildingClass: 'common',
    requirements: ['Форт'],
    description: 'Увеличивает прирост всех существ на 50% (с округлением в меньшую сторону). Дает городу ров и центральную стрелковую башню для обороны.',
  },
  {
    id: 'castle_building',
    name: 'Замок',
    cost: 5000,
    buildingClass: 'common',
    requirements: ['Цитадель'],
    description: 'Увеличивает прирост всех существ на 50% (с Цитаделью — на 100% от базового значения). При обороне дает еще две боковые стрелковые башни.',
  },
  {
    id: 'marketplace',
    name: 'Рынок',
    cost: 500,
    buildingClass: 'common',
    requirements: [],
    description: 'Дает возможность покупать, продавать и обменивать оружие, экипировку, бижутерию, предметы для крафта и другие вещи.',
  },
  {
    id: 'mage_guild_1',
    name: 'Гильдия магов 1-го уровня',
    cost: 2000,
    buildingClass: 'common',
    requirements: [],
    description: 'Позволяет героям приобрести Книгу магии за 500 золотых. Герои, посетившие город, изучают 5 заклинаний 1-го уровня.',
  },
  {
    id: 'mage_guild_2',
    name: 'Гильдия магов 2-го уровня',
    cost: 1000,
    buildingClass: 'common',
    requirements: ['Гильдия магов 1-го уровня'],
    description: 'Позволяет героям выучить 4 заклинания 2-го уровня.',
  },
  {
    id: 'mage_guild_3',
    name: 'Гильдия магов 3-го уровня',
    cost: 1000,
    buildingClass: 'common',
    requirements: ['Гильдия магов 2-го уровня'],
    description: 'Позволяет героям выучить 3 заклинания 3-го уровня (требуется навык «Мудрость» базового уровня).',
  },
  {
    id: 'mage_guild_4',
    name: 'Гильдия магов 4-го уровня',
    cost: 1000,
    buildingClass: 'common',
    requirements: ['Гильдия магов 3-го уровня'],
    description: 'Позволяет героям выучить 2 заклинания 4-го уровня (требуется навык «Мудрость» продвинутого уровня).',
  },
  {
    id: 'blacksmith',
    name: 'Кузница',
    cost: 1000,
    buildingClass: 'common',
    requirements: [],
    description: 'Позволяет делать экипировку и бижутерию, оружие и броню.',
  },
];

// ─── Town-specific creature generator buildings ───

export const TOWN_BUILDINGS: Record<TownId, Building[]> = {
  castle: [
    { id: 'castle_lv1', name: 'Сторожевой пост', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать алебардщиков по 75 золотых за ед. Базовый недельный прирост: 14.', townId: 'castle' },
    { id: 'castle_lv2', name: 'Башня арбалетчиков', cost: 1000, buildingClass: 'creature', requirements: ['Сторожевой пост'], description: 'Позволяет нанимать искусных арбалетчиков по 150 золотых за ед. Базовый недельный прирост: 9.', townId: 'castle' },
    { id: 'castle_lv3', name: 'Грифонова башня', cost: 1000, buildingClass: 'creature', requirements: ['Башня арбалетчиков'], description: 'Позволяет нанимать королевских грифонов по 240 золотых за ед. Базовый недельный прирост: 7.', townId: 'castle' },
    { id: 'castle_lv4', name: 'Казармы', cost: 2000, buildingClass: 'creature', requirements: ['Грифонова башня'], description: 'Позволяет нанимать крестоносцев по 400 золотых за ед. Базовый недельный прирост: 4.', townId: 'castle' },
    { id: 'castle_lv5', name: 'Монастырь', cost: 1000, buildingClass: 'creature', requirements: ['Казармы'], description: 'Позволяет нанимать фанатиков по 450 золотых за ед. Базовый недельный прирост: 3.', townId: 'castle' },
    { id: 'castle_lv6', name: 'Манеж', cost: 3000, buildingClass: 'creature', requirements: ['Монастырь'], description: 'Позволяет нанимать чемпионов по 1200 золотых за ед. Базовый недельный прирост: 2.', townId: 'castle' },
    { id: 'castle_lv7', name: 'Портал славы', cost: 20000, buildingClass: 'creature', requirements: ['Манеж'], description: 'Позволяет нанимать архангелов по 5000 золотых за ед. Базовый недельный прирост: 1.', townId: 'castle' },
  ],
  rampart: [
    { id: 'rampart_lv1', name: 'Конюшни кентавров', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать капитанов-кентавров по 90 золотых за ед. Базовый недельный прирост: 14.', townId: 'rampart' },
    { id: 'rampart_lv2', name: 'Коттедж гномов', cost: 1000, buildingClass: 'creature', requirements: ['Конюшни кентавров'], description: 'Позволяет нанимать боевых гномов по 150 золотых за ед. Базовый недельный прирост: 9.', townId: 'rampart' },
    { id: 'rampart_lv3', name: 'Усадьба', cost: 1500, buildingClass: 'creature', requirements: ['Коттедж гномов'], description: 'Позволяет нанимать благородных эльфов по 225 золотых за ед. Базовый недельный прирост: 7.', townId: 'rampart' },
    { id: 'rampart_lv4', name: 'Зачарованный ручей', cost: 2000, buildingClass: 'creature', requirements: ['Усадьба'], description: 'Позволяет нанимать серебряных пегасов по 275 золотых за ед. Базовый недельный прирост: 5.', townId: 'rampart' },
    { id: 'rampart_lv5', name: 'Арка дендроидов', cost: 1500, buildingClass: 'creature', requirements: ['Зачарованный ручей'], description: 'Позволяет нанимать дендроидов-солдат по 425 золотых за ед. Базовый недельный прирост: 3.', townId: 'rampart' },
    { id: 'rampart_lv6', name: 'Опушка единорогов', cost: 3000, buildingClass: 'creature', requirements: ['Арка дендроидов'], description: 'Позволяет нанимать боевых единорогов по 950 золотых за ед. Базовый недельный прирост: 2.', townId: 'rampart' },
    { id: 'rampart_lv7', name: 'Драконьи скалы', cost: 20000, buildingClass: 'creature', requirements: ['Гильдия магов 3-го уровня', 'Опушка единорогов'], description: 'Позволяет нанимать золотых драконов по 4000 золотых за ед. Базовый недельный прирост: 1.', townId: 'rampart' },
  ],
  tower: [
    { id: 'tower_lv1', name: 'Мастерская', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать гремлинов-мастеров по 40 золотых за ед. Базовый недельный прирост: 16.', townId: 'tower' },
    { id: 'tower_lv2', name: 'Парапет', cost: 1500, buildingClass: 'creature', requirements: ['Мастерская'], description: 'Позволяет нанимать обсидиановых горгулий по 160 золотых за ед. Базовый недельный прирост: 9.', townId: 'tower' },
    { id: 'tower_lv3', name: 'Фабрика големов', cost: 1500, buildingClass: 'creature', requirements: ['Парапет'], description: 'Позволяет нанимать железных големов по 200 золотых за ед. Базовый недельный прирост: 6.', townId: 'tower' },
    { id: 'tower_lv4', name: 'Башня магов', cost: 2000, buildingClass: 'creature', requirements: ['Фабрика големов'], description: 'Позволяет нанимать архимагов по 450 золотых за ед. Базовый недельный прирост: 4.', townId: 'tower' },
    { id: 'tower_lv5', name: 'Алтарь желаний', cost: 2000, buildingClass: 'creature', requirements: ['Гильдия магов 1-го уровня', 'Башня магов'], description: 'Позволяет нанимать верховных джиннов по 600 золотых за ед. Базовый недельный прирост: 3.', townId: 'tower' },
    { id: 'tower_lv6', name: 'Золотой павильон', cost: 3000, buildingClass: 'creature', requirements: ['Алтарь желаний'], description: 'Позволяет нанимать королев наг по 1600 золотых за ед. Базовый недельный прирост: 2.', townId: 'tower' },
    { id: 'tower_lv7', name: 'Заоблачный храм', cost: 20000, buildingClass: 'creature', requirements: ['Золотой павильон'], description: 'Позволяет нанимать титанов по 5000 золотых за ед. Базовый недельный прирост: 1.', townId: 'tower' },
  ],
  inferno: [
    { id: 'inferno_lv1', name: 'Котел бесов', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать чертей по 60 золотых за ед. Базовый недельный прирост: 15.', townId: 'inferno' },
    { id: 'inferno_lv2', name: 'Чертоги пороков', cost: 1000, buildingClass: 'creature', requirements: ['Котел бесов'], description: 'Позволяет нанимать магогов по 175 золотых за ед. Базовый недельный прирост: 8.', townId: 'inferno' },
    { id: 'inferno_lv3', name: 'Псарни', cost: 1500, buildingClass: 'creature', requirements: ['Чертоги пороков'], description: 'Позволяет нанимать церберов по 250 золотых за ед. Базовый недельный прирост: 5.', townId: 'inferno' },
    { id: 'inferno_lv4', name: 'Врата демонов', cost: 2000, buildingClass: 'creature', requirements: ['Псарни'], description: 'Позволяет нанимать рогатых демонов по 270 золотых за ед. Базовый недельный прирост: 4.', townId: 'inferno' },
    { id: 'inferno_lv5', name: 'Провал', cost: 3000, buildingClass: 'creature', requirements: ['Гильдия магов 1-го уровня', 'Врата демонов'], description: 'Позволяет нанимать владык пропасти по 700 золотых за ед. Базовый недельный прирост: 3.', townId: 'inferno' },
    { id: 'inferno_lv6', name: 'Огненное озеро', cost: 3000, buildingClass: 'creature', requirements: ['Провал'], description: 'Позволяет нанимать ифритов-султанов по 1100 золотых за ед. Базовый недельный прирост: 2.', townId: 'inferno' },
    { id: 'inferno_lv7', name: 'Покинутый дворец', cost: 20000, buildingClass: 'creature', requirements: ['Огненное озеро'], description: 'Позволяет нанимать архидьяволов по 4500 золотых за ед. Базовый недельный прирост: 1.', townId: 'inferno' },
  ],
  necropolis: [
    { id: 'necro_lv1', name: 'Проклятый храм', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать скелетов-воинов по 70 золотых за ед. Базовый недельный прирост: 12.', townId: 'necropolis' },
    { id: 'necro_lv2', name: 'Кладбище', cost: 1000, buildingClass: 'creature', requirements: ['Проклятый храм'], description: 'Позволяет нанимать зомби по 125 золотых за ед. Базовый недельный прирост: 8.', townId: 'necropolis' },
    { id: 'necro_lv3', name: 'Пристанище душ', cost: 1500, buildingClass: 'creature', requirements: ['Кладбище'], description: 'Позволяет нанимать призраков по 230 золотых за ед. Базовый недельный прирост: 7.', townId: 'necropolis' },
    { id: 'necro_lv4', name: 'Поместье', cost: 2000, buildingClass: 'creature', requirements: ['Пристанище душ'], description: 'Позволяет нанимать лордов-вампиров по 500 золотых за ед. Базовый недельный прирост: 4.', townId: 'necropolis' },
    { id: 'necro_lv5', name: 'Мавзолей', cost: 2000, buildingClass: 'creature', requirements: ['Поместье'], description: 'Позволяет нанимать могущественных личей по 600 золотых за ед. Базовый недельный прирост: 3.', townId: 'necropolis' },
    { id: 'necro_lv6', name: 'Дворец тьмы', cost: 3000, buildingClass: 'creature', requirements: ['Мавзолей'], description: 'Позволяет нанимать рыцарей смерти по 1500 золотых за ед. Базовый недельный прирост: 2.', townId: 'necropolis' },
    { id: 'necro_lv7', name: 'Склеп драконов', cost: 15000, buildingClass: 'creature', requirements: ['Дворец тьмы'], description: 'Позволяет нанимать призрачных драконов по 3000 золотых за ед. Базовый недельный прирост: 1.', townId: 'necropolis' },
  ],
  dungeon: [
    { id: 'dungeon_lv1', name: 'Питомник', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать троглодитов-охотников по 65 золотых за ед. Базовый недельный прирост: 14.', townId: 'dungeon' },
    { id: 'dungeon_lv2', name: 'Гнездо гарпий', cost: 1000, buildingClass: 'creature', requirements: ['Питомник'], description: 'Позволяет нанимать гарпий-ведьм по 170 золотых за ед. Базовый недельный прирост: 8.', townId: 'dungeon' },
    { id: 'dungeon_lv3', name: 'Каменная бехолдерская', cost: 1000, buildingClass: 'creature', requirements: ['Гнездо гарпий'], description: 'Позволяет нанимать зловещих глаз по 280 золотых за ед. Базовый недельный прирост: 7.', townId: 'dungeon' },
    { id: 'dungeon_lv4', name: 'Зал застывших голосов', cost: 1500, buildingClass: 'creature', requirements: ['Каменная бехолдерская'], description: 'Позволяет нанимать королев-медуз по 330 золотых за ед. Базовый недельный прирост: 4.', townId: 'dungeon' },
    { id: 'dungeon_lv5', name: 'Лабиринт', cost: 3000, buildingClass: 'creature', requirements: ['Зал застывших голосов'], description: 'Позволяет нанимать королей минотавров по 575 золотых за ед. Базовый недельный прирост: 3.', townId: 'dungeon' },
    { id: 'dungeon_lv6', name: 'Логово мантикор', cost: 3000, buildingClass: 'creature', requirements: ['Лабиринт'], description: 'Позволяет нанимать скорпикор по 1050 золотых за ед. Базовый недельный прирост: 2.', townId: 'dungeon' },
    { id: 'dungeon_lv7', name: 'Пещера драконов', cost: 15000, buildingClass: 'creature', requirements: ['Гильдия магов 3-го уровня', 'Логово мантикор'], description: 'Позволяет нанимать чёрных драконов по 4000 золотых за ед. Базовый недельный прирост: 1.', townId: 'dungeon' },
  ],
  stronghold: [
    { id: 'stronghold_lv1', name: 'Казармы гоблинов', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать хобгоблинов по 50 золотых за ед. Базовый недельный прирост: 15.', townId: 'stronghold' },
    { id: 'stronghold_lv2', name: 'Волчий загон', cost: 1000, buildingClass: 'creature', requirements: ['Казармы гоблинов'], description: 'Позволяет нанимать налетчиков по 140 золотых за ед. Базовый недельный прирост: 9.', townId: 'stronghold' },
    { id: 'stronghold_lv3', name: 'Башня орков', cost: 1000, buildingClass: 'creature', requirements: ['Кузница', 'Волчий загон'], description: 'Позволяет нанимать вождей орков по 165 золотых за ед. Базовый недельный прирост: 7.', townId: 'stronghold' },
    { id: 'stronghold_lv4', name: 'Форт огров', cost: 2000, buildingClass: 'creature', requirements: ['Гильдия магов 1-го уровня', 'Башня орков'], description: 'Позволяет нанимать огров-магов по 400 золотых за ед. Базовый недельный прирост: 4.', townId: 'stronghold' },
    { id: 'stronghold_lv5', name: 'Гнездо на скале', cost: 2000, buildingClass: 'creature', requirements: ['Форт огров'], description: 'Позволяет нанимать громовых птиц по 700 золотых за ед. Базовый недельный прирост: 3.', townId: 'stronghold' },
    { id: 'stronghold_lv6', name: 'Пещера циклопов', cost: 3000, buildingClass: 'creature', requirements: ['Гнездо на скале'], description: 'Позволяет нанимать королей циклопов по 1100 золотых за ед. Базовый недельный прирост: 2.', townId: 'stronghold' },
    { id: 'stronghold_lv7', name: 'Утес Чудищ', cost: 15000, buildingClass: 'creature', requirements: ['Пещера циклопов'], description: 'Позволяет нанимать древних чудищ по 3000 золотых за ед. Базовый недельный прирост: 1.', townId: 'stronghold' },
  ],
  fortress: [
    { id: 'fortress_lv1', name: 'Хижина гноллов', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать гноллов-мародеров по 70 золотых за ед. Базовый недельный прирост: 15.', townId: 'fortress' },
    { id: 'fortress_lv2', name: 'Шалаши ящеров', cost: 1000, buildingClass: 'creature', requirements: ['Хижина гноллов'], description: 'Позволяет нанимать ящеров-воинов по 140 золотых за ед. Базовый недельный прирост: 9.', townId: 'fortress' },
    { id: 'fortress_lv3', name: 'Змиев улей', cost: 1000, buildingClass: 'creature', requirements: ['Шалаши ящеров'], description: 'Позволяет нанимать ядовитых змеев по 240 золотых за ед. Базовый недельный прирост: 8.', townId: 'fortress' },
    { id: 'fortress_lv4', name: 'Яма василисков', cost: 2000, buildingClass: 'creature', requirements: ['Змиев улей'], description: 'Позволяет нанимать великих василисков по 400 золотых за ед. Базовый недельный прирост: 4.', townId: 'fortress' },
    { id: 'fortress_lv5', name: 'Логово горгон', cost: 2000, buildingClass: 'creature', requirements: ['Яма василисков'], description: 'Позволяет нанимать могучих горгон по 600 золотых за ед. Базовый недельный прирост: 3.', townId: 'fortress' },
    { id: 'fortress_lv6', name: 'Гнездо виверн', cost: 3000, buildingClass: 'creature', requirements: ['Логово горгон'], description: 'Позволяет нанимать виверн-монархов по 1100 золотых за ед. Базовый недельный прирост: 2.', townId: 'fortress' },
    { id: 'fortress_lv7', name: 'Пруд гидр', cost: 15000, buildingClass: 'creature', requirements: ['Гнездо виверн'], description: 'Позволяет нанимать гидр хаоса по 3500 золотых за ед. Базовый недельный прирост: 1.', townId: 'fortress' },
  ],
  conflux: [
    { id: 'conflux_lv1', name: 'Волшебный фонарь', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать фей по 30 золотых за ед. Базовый недельный прирост: 20.', townId: 'conflux' },
    { id: 'conflux_lv2', name: 'Алтарь воздуха', cost: 1500, buildingClass: 'creature', requirements: ['Волшебный фонарь'], description: 'Позволяет нанимать элементалей бури по 275 золотых за ед. Базовый недельный прирост: 6.', townId: 'conflux' },
    { id: 'conflux_lv3', name: 'Алтарь воды', cost: 2000, buildingClass: 'creature', requirements: ['Алтарь воздуха'], description: 'Позволяет нанимать ледяных элементалей по 375 золотых за ед. Базовый недельный прирост: 6.', townId: 'conflux' },
    { id: 'conflux_lv4', name: 'Алтарь огня', cost: 2000, buildingClass: 'creature', requirements: ['Алтарь воздуха', 'Алтарь воды'], description: 'Позволяет нанимать элементалей энергии по 400 золотых за ед. Базовый недельный прирост: 5.', townId: 'conflux' },
    { id: 'conflux_lv5', name: 'Алтарь земли', cost: 1000, buildingClass: 'creature', requirements: ['Алтарь огня'], description: 'Позволяет нанимать элементалей магмы по 500 золотых за ед. Базовый недельный прирост: 4.', townId: 'conflux' },
    { id: 'conflux_lv6', name: 'Алтарь мысли', cost: 3000, buildingClass: 'creature', requirements: ['Гильдия магов 2-го уровня', 'Алтарь земли'], description: 'Позволяет нанимать элементалей магии по 800 золотых за ед. Базовый недельный прирост: 2.', townId: 'conflux' },
    { id: 'conflux_lv7', name: 'Погребальный костер', cost: 10000, buildingClass: 'creature', requirements: ['Алтарь мысли'], description: 'Позволяет нанимать фениксов по 2000 золотых за ед. Базовый недельный прирост: 2.', townId: 'conflux' },
  ],
  cove: [
    { id: 'cove_lv1', name: 'Водопад нимф', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать океанид по 45 золотых за ед. Базовый недельный прирост: 16.', townId: 'cove' },
    { id: 'cove_lv2', name: 'Хижины матросов', cost: 1000, buildingClass: 'creature', requirements: ['Водопад нимф'], description: 'Позволяет нанимать головорезов по 140 золотых за ед. Базовый недельный прирост: 9.', townId: 'cove' },
    { id: 'cove_lv3', name: 'Фрегат', cost: 1500, buildingClass: 'creature', requirements: ['Хижины матросов'], description: 'Позволяет нанимать корсаров по 275 золотых за ед. Базовый недельный прирост: 7.', townId: 'cove' },
    { id: 'cove_lv4', name: 'Гнездо', cost: 1500, buildingClass: 'creature', requirements: ['Гильдия магов 1-го уровня', 'Фрегат'], description: 'Позволяет нанимать ассидов по 325 золотых за ед. Базовый недельный прирост: 4.', townId: 'cove' },
    { id: 'cove_lv5', name: 'Башня морей', cost: 2000, buildingClass: 'creature', requirements: ['Гильдия магов 2-го уровня', 'Гнездо'], description: 'Позволяет нанимать заклинательниц по 565 золотых за ед. Базовый недельный прирост: 3.', townId: 'cove' },
    { id: 'cove_lv6', name: 'Форт-Никс', cost: 3000, buildingClass: 'creature', requirements: ['Башня морей'], description: 'Позволяет нанимать никс-воинов по 1300 золотых за ед. Базовый недельный прирост: 2.', townId: 'cove' },
    { id: 'cove_lv7', name: 'Водоворот змеев', cost: 15000, buildingClass: 'creature', requirements: ['Гильдия магов 2-го уровня', 'Форт-Никс'], description: 'Позволяет нанимать аспидов по 4000 золотых за ед. Базовый недельный прирост: 1.', townId: 'cove' },
  ],
  factory: [
    { id: 'factory_lv1', name: 'Хижина полуросликов', cost: 1000, buildingClass: 'creature', requirements: [], description: 'Позволяет нанимать полуросликов-гренадеров по 65 золотых за ед. Базовый недельный прирост: 15.', townId: 'factory' },
    { id: 'factory_lv2', name: 'Плавильня', cost: 1000, buildingClass: 'creature', requirements: ['Кузница', 'Хижина полуросликов'], description: 'Позволяет нанимать инженеров по 170 золотых за ед. Базовый недельный прирост: 8.', townId: 'factory' },
    { id: 'factory_lv3', name: 'Ранчо', cost: 1000, buildingClass: 'creature', requirements: ['Плавильня'], description: 'Позволяет нанимать броненосцев-вожаков по 230 золотых за ед. Базовый недельный прирост: 6.', townId: 'factory' },
    { id: 'factory_lv4', name: 'Мануфактура', cost: 2000, buildingClass: 'creature', requirements: ['Ранчо'], description: 'Позволяет нанимать автоматонов-часовых по 450 золотых за ед. Базовый недельный прирост: 5.', townId: 'factory' },
    { id: 'factory_lv5', name: 'Катакомбы', cost: 2000, buildingClass: 'creature', requirements: ['Гильдия магов 1-го уровня', 'Мануфактура'], description: 'Позволяет нанимать олгой-хорхоев по 650 золотых за ед. Базовый недельный прирост: 3.', townId: 'factory' },
    { id: 'factory_lv6', name: 'Дозорный пост', cost: 3000, buildingClass: 'creature', requirements: ['Рынок', 'Катакомбы'], description: 'Позволяет нанимать охотников за головами по 1100 золотых за ед. Базовый недельный прирост: 2.', townId: 'factory' },
    { id: 'factory_lv7', name: 'Серпентарий', cost: 15000, buildingClass: 'creature', requirements: ['Гильдия магов 2-го уровня', 'Дозорный пост'], description: 'Позволяет нанимать багровых коатлей по 3500 золотых за ед. Базовый недельный прирост: 1.', townId: 'factory' },
    { id: 'factory_lv7b', name: 'Стапель', cost: 15000, buildingClass: 'creature', requirements: ['Серпентарий'], description: 'Позволяет нанимать джаггернаутов по 4000 золотых за ед. Базовый недельный прирост: 1.', townId: 'factory' },
  ],
};

export function getBuildingsForTown(townId: TownId): { common: Building[]; creature: Building[] } {
  return {
    common: COMMON_BUILDINGS,
    creature: TOWN_BUILDINGS[townId] || [],
  };
}
