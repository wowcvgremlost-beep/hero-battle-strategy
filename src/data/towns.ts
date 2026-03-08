export type TownId = 'castle' | 'rampart' | 'tower' | 'inferno' | 'necropolis' | 'dungeon' | 'stronghold' | 'fortress' | 'conflux' | 'cove' | 'factory';

export type MovementType = 'Ходит' | 'Летает' | 'Телепорт' | 'Под землей';
export type UnitStatus = 'Живой' | 'Нежить' | 'Элементаль' | 'Голем' | 'Горгулья' | 'Механический';

export interface Unit {
  name: string;
  level: number;
  attack: number;
  defense: number;
  damage: string;
  shots: number | null;
  health: number;
  speed: number;
  movement: MovementType;
  value: number;
  cost: number;
  growth: number;
  status: UnitStatus;
  abilities: string;
}

export interface Town {
  id: TownId;
  name: string;
  alignment: 'good' | 'evil' | 'neutral';
  description: string;
  magicSchool: string;
  units: Unit[];
}

export const TOWNS: Town[] = [
  {
    id: 'castle',
    name: 'Замок',
    alignment: 'good',
    description: 'Классический рыцарский замок, олицетворяющий силы добра. Герои-маги тяготеют к магии Воды, воины владеют Лидерством. Существа не отличаются подвижностью, но имеют хорошие Атаку, Здоровье и Защиту.',
    magicSchool: 'Вода',
    units: [
      { name: 'Алебардщик', level: 1, attack: 6, defense: 5, damage: '2-3', shots: null, health: 10, speed: 5, movement: 'Ходит', value: 115, cost: 75, growth: 14, status: 'Живой', abilities: 'Невосприимчив к дополнительному урону от «Кавалерийского рывка» чемпионов и кавалеристов.' },
      { name: 'Искусный арбалетчик', level: 2, attack: 6, defense: 3, damage: '2-3', shots: 24, health: 10, speed: 6, movement: 'Ходит', value: 184, cost: 150, growth: 9, status: 'Живой', abilities: 'Стреляет дважды.' },
      { name: 'Королевский грифон', level: 3, attack: 9, defense: 9, damage: '3-6', shots: null, health: 25, speed: 9, movement: 'Летает', value: 448, cost: 240, growth: 7, status: 'Живой', abilities: 'Отвечает на каждую атаку противника.' },
      { name: 'Крестоносец', level: 4, attack: 12, defense: 12, damage: '7-10', shots: null, health: 35, speed: 6, movement: 'Ходит', value: 558, cost: 400, growth: 4, status: 'Живой', abilities: 'Атакует дважды.' },
      { name: 'Фанатик', level: 5, attack: 12, defense: 10, damage: '10-12', shots: 24, health: 30, speed: 7, movement: 'Ходит', value: 750, cost: 450, growth: 3, status: 'Живой', abilities: 'В рукопашном бою штраф не предусмотрен.' },
      { name: 'Чемпион', level: 6, attack: 16, defense: 16, damage: '20-25', shots: null, health: 100, speed: 9, movement: 'Ходит', value: 2100, cost: 1200, growth: 2, status: 'Живой', abilities: 'Кавалерийский бонус.' },
      { name: 'Архангел', level: 7, attack: 30, defense: 30, damage: '50-50', shots: null, health: 250, speed: 18, movement: 'Летает', value: 8776, cost: 5000, growth: 1, status: 'Живой', abilities: '+1 к боевому духу всех союзных войск. Наносит 150% урона дьяволам и архидьяволам. Воскрешает союзников.' },
    ],
  },
  {
    id: 'rampart',
    name: 'Оплот',
    alignment: 'good',
    description: 'Волшебный лесной город с кентаврами, пегасами и единорогами. Существа обладают антимагическими свойствами. Герои-воины специализируются на Помехах, Доспехах и Стрельбе.',
    magicSchool: 'Вода и Земля',
    units: [
      { name: 'Капитан кентавров', level: 1, attack: 6, defense: 3, damage: '2-3', shots: null, health: 10, speed: 8, movement: 'Ходит', value: 138, cost: 90, growth: 14, status: 'Живой', abilities: '' },
      { name: 'Боевой гном', level: 2, attack: 7, defense: 7, damage: '2-4', shots: null, health: 20, speed: 5, movement: 'Ходит', value: 209, cost: 150, growth: 8, status: 'Живой', abilities: 'Имеет 40% шанс нейтрализовать вражеское заклинание.' },
      { name: 'Благородный эльф', level: 3, attack: 9, defense: 5, damage: '3-5', shots: 48, health: 15, speed: 7, movement: 'Ходит', value: 331, cost: 225, growth: 7, status: 'Живой', abilities: 'Стреляет дважды.' },
      { name: 'Серебряный пегас', level: 4, attack: 9, defense: 10, damage: '5-9', shots: null, health: 30, speed: 12, movement: 'Летает', value: 532, cost: 275, growth: 5, status: 'Живой', abilities: 'Повышает стоимость всех заклинаний противника на 2 ед. маны.' },
      { name: 'Дендроид-солдат', level: 5, attack: 9, defense: 12, damage: '10-14', shots: null, health: 65, speed: 4, movement: 'Ходит', value: 803, cost: 425, growth: 3, status: 'Живой', abilities: 'Опутывает цель корнями при ударе.' },
      { name: 'Боевой единорог', level: 6, attack: 15, defense: 14, damage: '18-22', shots: null, health: 110, speed: 9, movement: 'Ходит', value: 2030, cost: 950, growth: 2, status: 'Живой', abilities: 'С шансом 20% ослепляет цель при ударе. Союзники на соседних клетках получают 20% шанс нейтрализовать вражеское заклинание.' },
      { name: 'Золотой дракон', level: 7, attack: 27, defense: 27, damage: '40-50', shots: null, health: 250, speed: 16, movement: 'Летает', value: 8613, cost: 4000, growth: 1, status: 'Живой', abilities: 'Невосприимчив к заклинаниям 1-4 уровня. Атака по двум клеткам.' },
    ],
  },
  {
    id: 'tower',
    name: 'Башня',
    alignment: 'good',
    description: 'Снежный замок, полный магии и рукотворных существ. Все герои имеют Книгу магии и тяготеют к магии Воздуха. Сильнейшие стрелки в игре — Титаны.',
    magicSchool: 'Воздух',
    units: [
      { name: 'Гремлин-мастер', level: 1, attack: 4, defense: 4, damage: '1-2', shots: 8, health: 4, speed: 5, movement: 'Ходит', value: 66, cost: 40, growth: 16, status: 'Живой', abilities: '' },
      { name: 'Обсидиановая горгулья', level: 2, attack: 7, defense: 7, damage: '2-3', shots: null, health: 16, speed: 9, movement: 'Летает', value: 201, cost: 160, growth: 9, status: 'Горгулья', abilities: '' },
      { name: 'Железный голем', level: 3, attack: 9, defense: 10, damage: '4-5', shots: null, health: 35, speed: 5, movement: 'Ходит', value: 412, cost: 200, growth: 6, status: 'Голем', abilities: 'Поглощает 75% урона от магии.' },
      { name: 'Архимаг', level: 4, attack: 12, defense: 9, damage: '7-9', shots: 24, health: 30, speed: 7, movement: 'Ходит', value: 680, cost: 450, growth: 4, status: 'Живой', abilities: 'Нет штрафа в ближнем бою и при стрельбе через стены. Снижает стоимость заклинаний героя на 2 ед. маны.' },
      { name: 'Верховный джинн', level: 5, attack: 12, defense: 12, damage: '13-16', shots: null, health: 40, speed: 11, movement: 'Летает', value: 942, cost: 600, growth: 3, status: 'Живой', abilities: 'Наносит 150% урона Ифритам. 3 раза за бой может наложить заклинания на союзный отряд.' },
      { name: 'Королева наг', level: 6, attack: 16, defense: 13, damage: '30-30', shots: null, health: 110, speed: 7, movement: 'Ходит', value: 2840, cost: 1600, growth: 2, status: 'Живой', abilities: 'Не получает ответный удар.' },
      { name: 'Титан', level: 7, attack: 24, defense: 24, damage: '40-60', shots: 24, health: 300, speed: 11, movement: 'Ходит', value: 7500, cost: 5000, growth: 1, status: 'Живой', abilities: 'Невосприимчив к ряду заклинаний. Нет штрафа в ближнем бою. Наносит 150% урона Черным драконам.' },
    ],
  },
  {
    id: 'inferno',
    name: 'Инферно',
    alignment: 'evil',
    description: 'Пристанище демонов, чертей и сил преисподней. Герои тяготеют к магии Огня. Существа имеют множество уникальных способностей.',
    magicSchool: 'Огонь',
    units: [
      { name: 'Черт', level: 1, attack: 4, defense: 4, damage: '1-2', shots: null, health: 4, speed: 7, movement: 'Ходит', value: 60, cost: 60, growth: 15, status: 'Живой', abilities: 'Крадет ману у вражеского героя.' },
      { name: 'Магог', level: 2, attack: 7, defense: 4, damage: '2-4', shots: 24, health: 13, speed: 6, movement: 'Ходит', value: 240, cost: 175, growth: 8, status: 'Живой', abilities: 'Наносит урон по площади. Может делать прицельный выстрел.' },
      { name: 'Цербер', level: 3, attack: 10, defense: 8, damage: '2-7', shots: null, health: 25, speed: 8, movement: 'Ходит', value: 392, cost: 250, growth: 5, status: 'Живой', abilities: 'Не получает ответный удар. Бьет по 3 гексам перед собой.' },
      { name: 'Рогатый демон', level: 4, attack: 10, defense: 10, damage: '7-9', shots: null, health: 40, speed: 6, movement: 'Ходит', value: 480, cost: 270, growth: 4, status: 'Живой', abilities: '' },
      { name: 'Властитель пропасти', level: 5, attack: 13, defense: 13, damage: '13-17', shots: null, health: 45, speed: 7, movement: 'Ходит', value: 1224, cost: 700, growth: 3, status: 'Живой', abilities: 'Создает демонов из павших живых существ.' },
      { name: 'Ифрит-султан', level: 6, attack: 16, defense: 14, damage: '16-24', shots: null, health: 90, speed: 13, movement: 'Летает', value: 1848, cost: 1100, growth: 2, status: 'Живой', abilities: 'Неуязвим к магии огня. Наносит 150% урона Джиннам. Огненный щит.' },
      { name: 'Архидьявол', level: 7, attack: 26, defense: 28, damage: '30-40', shots: null, health: 200, speed: 17, movement: 'Телепорт', value: 7115, cost: 4500, growth: 1, status: 'Живой', abilities: 'Не получает ответный удар. -1 Удача противника. Наносит 150% урона Ангелам и Архангелам.' },
    ],
  },
  {
    id: 'necropolis',
    name: 'Некрополис',
    alignment: 'evil',
    description: 'Обитель оживших мертвецов и некромантов. Все герои владеют Некромантией. Нежить невосприимчива к ряду эффектов контроля.',
    magicSchool: 'Земля',
    units: [
      { name: 'Скелет-воин', level: 1, attack: 6, defense: 6, damage: '1-3', shots: null, health: 6, speed: 5, movement: 'Ходит', value: 85, cost: 70, growth: 12, status: 'Нежить', abilities: '' },
      { name: 'Зомби', level: 2, attack: 5, defense: 5, damage: '2-3', shots: null, health: 20, speed: 4, movement: 'Ходит', value: 128, cost: 125, growth: 8, status: 'Нежить', abilities: 'С 20% шансом накладывает Болезнь.' },
      { name: 'Привидение', level: 3, attack: 7, defense: 7, damage: '3-5', shots: null, health: 18, speed: 7, movement: 'Летает', value: 315, cost: 230, growth: 7, status: 'Нежить', abilities: 'Регенерация. Сжигает 2 ед. маны у вражеского героя.' },
      { name: 'Лорд вампиров', level: 4, attack: 10, defense: 10, damage: '5-8', shots: null, health: 40, speed: 9, movement: 'Летает', value: 783, cost: 500, growth: 4, status: 'Нежить', abilities: 'Не получает ответный удар. Высасывание жизни.' },
      { name: 'Могущественный лич', level: 5, attack: 13, defense: 10, damage: '11-15', shots: 24, health: 40, speed: 7, movement: 'Ходит', value: 1079, cost: 600, growth: 3, status: 'Нежить', abilities: 'Смертельное облако: урон по площади.' },
      { name: 'Рыцарь смерти', level: 6, attack: 18, defense: 18, damage: '15-30', shots: null, health: 120, speed: 9, movement: 'Ходит', value: 2382, cost: 1500, growth: 2, status: 'Нежить', abilities: 'С 25% шансом Проклятие. С 20% шансом двойной урон.' },
      { name: 'Призрачный дракон', level: 7, attack: 19, defense: 17, damage: '25-50', shots: null, health: 200, speed: 14, movement: 'Летает', value: 4696, cost: 3000, growth: 1, status: 'Нежить', abilities: '-1 Боевой дух противника. С 20% шансом Старость (-50% здоровья).' },
    ],
  },
  {
    id: 'dungeon',
    name: 'Темница',
    alignment: 'evil',
    description: 'Подземный город троглодитов, гарпий и минотавров. Много летающих существ и стрелков. Черные драконы невосприимчивы к магии.',
    magicSchool: 'Земля и Огонь',
    units: [
      { name: 'Троглодит-охотник', level: 1, attack: 5, defense: 4, damage: '1-3', shots: null, health: 6, speed: 5, movement: 'Ходит', value: 84, cost: 65, growth: 14, status: 'Живой', abilities: 'Невосприимчив к Ослеплению и Окаменению.' },
      { name: 'Гарпия-ведьма', level: 2, attack: 6, defense: 6, damage: '1-4', shots: null, health: 14, speed: 9, movement: 'Летает', value: 238, cost: 170, growth: 8, status: 'Живой', abilities: 'Возврат после удара. Не получает ответный удар.' },
      { name: 'Зловещий глаз', level: 3, attack: 10, defense: 8, damage: '3-5', shots: 24, health: 22, speed: 7, movement: 'Ходит', value: 367, cost: 280, growth: 7, status: 'Живой', abilities: 'Не имеет штрафа в ближнем бою.' },
      { name: 'Медуза-королева', level: 4, attack: 10, defense: 10, damage: '6-8', shots: 8, health: 30, speed: 6, movement: 'Ходит', value: 577, cost: 330, growth: 4, status: 'Живой', abilities: 'Окаменение: 20% шанс в ближнем бою.' },
      { name: 'Король минотавров', level: 5, attack: 15, defense: 15, damage: '12-20', shots: null, health: 50, speed: 8, movement: 'Ходит', value: 1068, cost: 575, growth: 3, status: 'Живой', abilities: '+1 к Боевому духу.' },
      { name: 'Скорпикора', level: 6, attack: 16, defense: 14, damage: '14-20', shots: null, health: 80, speed: 11, movement: 'Летает', value: 1589, cost: 1050, growth: 2, status: 'Живой', abilities: '20% шанс парализовать цель.' },
      { name: 'Черный дракон', level: 7, attack: 25, defense: 25, damage: '40-50', shots: null, health: 300, speed: 15, movement: 'Летает', value: 8721, cost: 4000, growth: 1, status: 'Живой', abilities: 'Невосприимчив к магии. Атака по двум клеткам. Наносит 150% урона Титанам.' },
    ],
  },
  {
    id: 'stronghold',
    name: 'Цитадель',
    alignment: 'neutral',
    description: 'Город орков, гоблинов и циклопов на каменистых пустошах. Существа наносят огромный урон. Дешев в постройке, силен на ранних этапах.',
    magicSchool: 'Нет приоритета',
    units: [
      { name: 'Хобгоблин', level: 1, attack: 5, defense: 3, damage: '1-2', shots: null, health: 5, speed: 7, movement: 'Ходит', value: 78, cost: 50, growth: 15, status: 'Живой', abilities: '' },
      { name: 'Налетчик', level: 2, attack: 8, defense: 5, damage: '3-4', shots: null, health: 10, speed: 8, movement: 'Ходит', value: 203, cost: 140, growth: 9, status: 'Живой', abilities: 'Атакует дважды.' },
      { name: 'Вождь орков', level: 3, attack: 8, defense: 4, damage: '2-5', shots: 24, health: 20, speed: 5, movement: 'Ходит', value: 240, cost: 165, growth: 7, status: 'Живой', abilities: '' },
      { name: 'Огр-маг', level: 4, attack: 13, defense: 7, damage: '6-12', shots: null, health: 60, speed: 5, movement: 'Ходит', value: 672, cost: 400, growth: 4, status: 'Живой', abilities: '3 раза за бой может наложить Жажду крови на союзника.' },
      { name: 'Птица грома', level: 5, attack: 13, defense: 11, damage: '11-15', shots: null, health: 60, speed: 11, movement: 'Летает', value: 1106, cost: 700, growth: 3, status: 'Живой', abilities: 'С 20% шансом Удар молнии при ударе.' },
      { name: 'Король циклопов', level: 6, attack: 17, defense: 13, damage: '16-20', shots: 24, health: 70, speed: 8, movement: 'Ходит', value: 1443, cost: 1100, growth: 2, status: 'Живой', abilities: 'Может атаковать стены как Катапульта.' },
      { name: 'Древнее чудище', level: 7, attack: 19, defense: 19, damage: '30-50', shots: null, health: 300, speed: 9, movement: 'Ходит', value: 6168, cost: 3000, growth: 1, status: 'Живой', abilities: 'Снижает броню цели при ударе.' },
    ],
  },
  {
    id: 'fortress',
    name: 'Крепость',
    alignment: 'neutral',
    description: 'Болотный город змееподобных существ. Герои склонны к обороне и навыку Доспехи. Уникальный двойной ров. Силен на ранних этапах.',
    magicSchool: 'Нет приоритета',
    units: [
      { name: 'Гнолл-мародер', level: 1, attack: 4, defense: 6, damage: '2-3', shots: null, health: 6, speed: 5, movement: 'Ходит', value: 90, cost: 70, growth: 12, status: 'Живой', abilities: '' },
      { name: 'Ящер-воин', level: 2, attack: 6, defense: 8, damage: '2-5', shots: 24, health: 15, speed: 5, movement: 'Ходит', value: 156, cost: 140, growth: 9, status: 'Живой', abilities: '' },
      { name: 'Ядовитый змий', level: 3, attack: 8, defense: 10, damage: '2-5', shots: null, health: 20, speed: 13, movement: 'Летает', value: 312, cost: 240, growth: 8, status: 'Живой', abilities: 'Снимает положительные эффекты с цели. Накладывает Слабость.' },
      { name: 'Великий василиск', level: 4, attack: 12, defense: 12, damage: '6-10', shots: null, health: 40, speed: 7, movement: 'Ходит', value: 714, cost: 400, growth: 4, status: 'Живой', abilities: 'Окаменение: 20% шанс на 3 раунда.' },
      { name: 'Могучая горгона', level: 5, attack: 11, defense: 16, damage: '12-16', shots: null, health: 70, speed: 6, movement: 'Ходит', value: 1028, cost: 525, growth: 3, status: 'Живой', abilities: 'Смертельный взгляд.' },
      { name: 'Виверна-монарх', level: 6, attack: 14, defense: 14, damage: '18-22', shots: null, health: 70, speed: 11, movement: 'Летает', value: 1518, cost: 1100, growth: 2, status: 'Живой', abilities: 'Яд: 30% шанс отравления.' },
      { name: 'Гидра хаоса', level: 7, attack: 18, defense: 20, damage: '25-45', shots: null, health: 250, speed: 7, movement: 'Ходит', value: 5931, cost: 3500, growth: 1, status: 'Живой', abilities: 'Бьет по всем гексам вокруг. Не получает ответный удар.' },
    ],
  },
  {
    id: 'conflux',
    name: 'Сопряжение',
    alignment: 'neutral',
    description: 'Средоточие четырех стихийных сил — обитель фей, элементалей и фениксов. Герои-маги владеют всеми стихиями. Фениксы — самые быстрые юниты в игре.',
    magicSchool: 'Все стихии',
    units: [
      { name: 'Фея', level: 1, attack: 2, defense: 2, damage: '1-3', shots: null, health: 3, speed: 9, movement: 'Летает', value: 95, cost: 30, growth: 20, status: 'Живой', abilities: 'Не получает ответный удар.' },
      { name: 'Элементаль шторма', level: 2, attack: 9, defense: 9, damage: '2-8', shots: 24, health: 25, speed: 8, movement: 'Ходит', value: 486, cost: 275, growth: 6, status: 'Элементаль', abilities: 'Невосприимчив к Метеоритному дождю. Накладывает Защиту от воздуха.' },
      { name: 'Элементаль льда', level: 3, attack: 8, defense: 10, damage: '3-7', shots: 24, health: 30, speed: 6, movement: 'Ходит', value: 380, cost: 375, growth: 6, status: 'Элементаль', abilities: 'Невосприимчив к Ледяной стреле. Накладывает Защиту от воды.' },
      { name: 'Элементаль энергии', level: 4, attack: 12, defense: 8, damage: '4-6', shots: null, health: 35, speed: 8, movement: 'Телепорт', value: 470, cost: 400, growth: 5, status: 'Элементаль', abilities: 'Невосприимчив к огненным заклинаниям. Накладывает Защиту от огня.' },
      { name: 'Элементаль магмы', level: 5, attack: 11, defense: 11, damage: '6-10', shots: null, health: 40, speed: 6, movement: 'Ходит', value: 490, cost: 500, growth: 4, status: 'Элементаль', abilities: 'Невосприимчив к заклинаниям молнии. Накладывает Защиту от земли.' },
      { name: 'Элементаль магии', level: 6, attack: 15, defense: 13, damage: '15-25', shots: null, health: 80, speed: 9, movement: 'Ходит', value: 2012, cost: 800, growth: 2, status: 'Элементаль', abilities: 'Не получает ответный удар. Бьет по всем гексам. Невосприимчив к магии.' },
      { name: 'Феникс', level: 7, attack: 21, defense: 18, damage: '30-40', shots: null, health: 200, speed: 21, movement: 'Летает', value: 6721, cost: 2000, growth: 2, status: 'Живой', abilities: 'Невосприимчив к магии огня. Атака по двум клеткам. Перерождение.' },
    ],
  },
  {
    id: 'cove',
    name: 'Причал',
    alignment: 'neutral',
    description: 'Форт на болотах с пиратской атмосферой. Океаниды телепортируются, Никсы поглощают урон, Аспиды — самые опасные существа 7-го уровня в открытом бою.',
    magicSchool: 'Вода',
    units: [
      { name: 'Океанида', level: 1, attack: 6, defense: 2, damage: '1-3', shots: null, health: 4, speed: 8, movement: 'Телепорт', value: 75, cost: 45, growth: 16, status: 'Живой', abilities: 'Невосприимчива к Ледяной стреле и Кольцу холода.' },
      { name: 'Головорез', level: 2, attack: 8, defense: 6, damage: '3-4', shots: null, health: 15, speed: 6, movement: 'Ходит', value: 174, cost: 140, growth: 9, status: 'Живой', abilities: '' },
      { name: 'Корсар', level: 3, attack: 10, defense: 8, damage: '3-7', shots: 4, health: 15, speed: 7, movement: 'Ходит', value: 407, cost: 275, growth: 7, status: 'Живой', abilities: 'Нет штрафа в ближнем бою. Не получает ответный удар.' },
      { name: 'Ассида', level: 4, attack: 11, defense: 8, damage: '6-10', shots: null, health: 30, speed: 11, movement: 'Летает', value: 645, cost: 325, growth: 4, status: 'Живой', abilities: 'Кровожадность: повторная атака при убийстве существа.' },
      { name: 'Заклинательница', level: 5, attack: 12, defense: 9, damage: '10-16', shots: 12, health: 35, speed: 7, movement: 'Ходит', value: 852, cost: 565, growth: 3, status: 'Живой', abilities: 'После выстрела накладывает Слабость или Разрушающий луч.' },
      { name: 'Никс-воин', level: 6, attack: 14, defense: 17, damage: '18-22', shots: null, health: 90, speed: 7, movement: 'Ходит', value: 2116, cost: 1300, growth: 2, status: 'Живой', abilities: 'Игнорирует 60% от бонуса Атаки врага.' },
      { name: 'Аспид', level: 7, attack: 29, defense: 20, damage: '30-55', shots: null, health: 300, speed: 12, movement: 'Ходит', value: 7220, cost: 4000, growth: 1, status: 'Живой', abilities: '30% шанс отравить цель. Месть.' },
    ],
  },
  {
    id: 'factory',
    name: 'Фабрика',
    alignment: 'neutral',
    description: 'Город изобретателей и полуросликов. Два типа существ 7-го уровня. Автоматоны и Дредноуты — механизмы, которые можно чинить в бою.',
    magicSchool: 'Нет приоритета',
    units: [
      { name: 'Полурослик-гренадер', level: 1, attack: 5, defense: 2, damage: '2-3', shots: 24, health: 4, speed: 6, movement: 'Ходит', value: 95, cost: 65, growth: 15, status: 'Живой', abilities: '+1 к Удаче. Игнорирует 20% Защиты противника.' },
      { name: 'Инженер', level: 2, attack: 7, defense: 5, damage: '2-5', shots: null, health: 16, speed: 7, movement: 'Ходит', value: 278, cost: 170, growth: 8, status: 'Живой', abilities: 'Атака по двум клеткам. Чинит Механических существ.' },
      { name: 'Броненосец-вожак', level: 3, attack: 5, defense: 11, damage: '3-5', shots: null, health: 25, speed: 6, movement: 'Ходит', value: 256, cost: 230, growth: 6, status: 'Живой', abilities: '' },
      { name: 'Автоматон-часовой', level: 4, attack: 12, defense: 10, damage: '9-9', shots: null, health: 30, speed: 9, movement: 'Ходит', value: 947, cost: 450, growth: 5, status: 'Механический', abilities: 'Взрывается после гибели. Не получает ответный удар.' },
      { name: 'Олгой-хорхой', level: 5, attack: 15, defense: 12, damage: '12-16', shots: null, health: 60, speed: 10, movement: 'Под землей', value: 1220, cost: 650, growth: 3, status: 'Живой', abilities: 'Невосприимчив к Ослеплению. Поглощает трупы.' },
      { name: 'Охотник за головами', level: 6, attack: 18, defense: 14, damage: '14-24', shots: 16, health: 45, speed: 8, movement: 'Ходит', value: 1454, cost: 1100, growth: 2, status: 'Живой', abilities: 'Упреждающий выстрел.' },
      { name: 'Багровый коатль', level: 7, attack: 21, defense: 21, damage: '25-45', shots: null, health: 200, speed: 15, movement: 'Летает', value: 5341, cost: 3500, growth: 1, status: 'Живой', abilities: 'Может получить временную неуязвимость без траты хода.' },
      { name: 'Джаггернаут', level: 7, attack: 23, defense: 23, damage: '40-50', shots: null, health: 300, speed: 7, movement: 'Ходит', value: 6433, cost: 4000, growth: 1, status: 'Механический', abilities: 'Может атаковать лучом без движения.' },
    ],
  },
];
