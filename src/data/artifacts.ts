export type ArtifactSlot = 'helmet' | 'armor' | 'weapon' | 'accessory';
export type ArtifactRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Artifact {
  id: string;
  name: string;
  description: string;
  slot: ArtifactSlot;
  rarity: ArtifactRarity;
  icon: string;
  bonuses: {
    attack?: number;
    defense?: number;
    spellpower?: number;
    knowledge?: number;
    leadership?: number;
  };
}

export const ARTIFACT_RARITY_COLORS: Record<ArtifactRarity, string> = {
  common: 'hsl(var(--muted-foreground))',
  uncommon: 'hsl(var(--emerald))',
  rare: 'hsl(210 80% 60%)',
  epic: 'hsl(var(--arcane))',
  legendary: 'hsl(var(--gold))',
};

export const ARTIFACT_RARITY_NAMES: Record<ArtifactRarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
};

export const ARTIFACTS: Artifact[] = [
  // Helmets
  {
    id: 'helm_courage',
    name: 'Шлем Храбрости',
    description: 'Простой стальной шлем, придающий уверенность в бою',
    slot: 'helmet',
    rarity: 'common',
    icon: '🪖',
    bonuses: { attack: 1 },
  },
  {
    id: 'helm_wisdom',
    name: 'Корона Мудреца',
    description: 'Древняя корона с рунами знаний',
    slot: 'helmet',
    rarity: 'uncommon',
    icon: '👑',
    bonuses: { knowledge: 2 },
  },
  {
    id: 'helm_dragon',
    name: 'Шлем Драконоборца',
    description: 'Выкован из чешуи древнего дракона',
    slot: 'helmet',
    rarity: 'rare',
    icon: '⛑️',
    bonuses: { attack: 2, defense: 1 },
  },
  {
    id: 'helm_archmage',
    name: 'Тиара Архимага',
    description: 'Сверкает магической энергией',
    slot: 'helmet',
    rarity: 'epic',
    icon: '💎',
    bonuses: { spellpower: 3, knowledge: 2 },
  },
  {
    id: 'helm_gods',
    name: 'Венец Богов',
    description: 'Легендарный артефакт божественного происхождения',
    slot: 'helmet',
    rarity: 'legendary',
    icon: '✨',
    bonuses: { attack: 3, defense: 2, spellpower: 2, knowledge: 2, leadership: 80 },
  },

  // Armor
  {
    id: 'armor_leather',
    name: 'Кожаная Броня',
    description: 'Крепкая кожаная броня',
    slot: 'armor',
    rarity: 'common',
    icon: '🦺',
    bonuses: { defense: 1 },
  },
  {
    id: 'armor_chainmail',
    name: 'Кольчуга Рыцаря',
    description: 'Надёжная кольчужная броня',
    slot: 'armor',
    rarity: 'uncommon',
    icon: '🛡️',
    bonuses: { defense: 2 },
  },
  {
    id: 'armor_mithril',
    name: 'Мифриловый Доспех',
    description: 'Лёгкий и прочный мифриловый доспех',
    slot: 'armor',
    rarity: 'rare',
    icon: '🔷',
    bonuses: { defense: 3, attack: 1 },
  },
  {
    id: 'armor_titan',
    name: 'Панцирь Титана',
    description: 'Древний доспех падшего титана',
    slot: 'armor',
    rarity: 'epic',
    icon: '🏛️',
    bonuses: { defense: 4, attack: 2, leadership: 5 },
  },
  {
    id: 'armor_invincible',
    name: 'Неуязвимый Доспех',
    description: 'Говорят, его никто не смог пробить',
    slot: 'armor',
    rarity: 'legendary',
    icon: '⚜️',
    bonuses: { defense: 6, attack: 2, spellpower: 1, leadership: 8 },
  },

  // Weapons
  {
    id: 'weapon_sword',
    name: 'Стальной Меч',
    description: 'Надёжное стальное оружие',
    slot: 'weapon',
    rarity: 'common',
    icon: '⚔️',
    bonuses: { attack: 1 },
  },
  {
    id: 'weapon_flaming',
    name: 'Пылающий Клинок',
    description: 'Меч, пылающий вечным огнём',
    slot: 'weapon',
    rarity: 'uncommon',
    icon: '🔥',
    bonuses: { attack: 2, spellpower: 1 },
  },
  {
    id: 'weapon_ice',
    name: 'Ледяной Жезл',
    description: 'Магический жезл с ледяным сердцем',
    slot: 'weapon',
    rarity: 'rare',
    icon: '❄️',
    bonuses: { spellpower: 3, knowledge: 1 },
  },
  {
    id: 'weapon_doom',
    name: 'Клинок Рока',
    description: 'Тёмное оружие невероятной силы',
    slot: 'weapon',
    rarity: 'epic',
    icon: '🗡️',
    bonuses: { attack: 5, spellpower: 2 },
  },
  {
    id: 'weapon_armageddon',
    name: 'Меч Армагеддона',
    description: 'Легендарное оружие конца времён',
    slot: 'weapon',
    rarity: 'legendary',
    icon: '⚡',
    bonuses: { attack: 7, spellpower: 3, defense: 1 },
  },

  // Accessories
  {
    id: 'acc_ring_power',
    name: 'Кольцо Силы',
    description: 'Простое кольцо с малым зачарованием',
    slot: 'accessory',
    rarity: 'common',
    icon: '💍',
    bonuses: { attack: 1 },
  },
  {
    id: 'acc_amulet_mana',
    name: 'Амулет Маны',
    description: 'Увеличивает магический потенциал',
    slot: 'accessory',
    rarity: 'uncommon',
    icon: '📿',
    bonuses: { knowledge: 2, spellpower: 1 },
  },
  {
    id: 'acc_cloak_shadows',
    name: 'Плащ Теней',
    description: 'Позволяет скрываться от врагов',
    slot: 'accessory',
    rarity: 'rare',
    icon: '🧥',
    bonuses: { defense: 2, attack: 2 },
  },
  {
    id: 'acc_orb_elements',
    name: 'Сфера Стихий',
    description: 'Содержит силу четырёх стихий',
    slot: 'accessory',
    rarity: 'epic',
    icon: '🔮',
    bonuses: { spellpower: 4, knowledge: 3 },
  },
  {
    id: 'acc_grail',
    name: 'Священный Грааль',
    description: 'Легендарная реликвия невероятной силы',
    slot: 'accessory',
    rarity: 'legendary',
    icon: '🏆',
    bonuses: { attack: 3, defense: 3, spellpower: 4, knowledge: 4, leadership: 15 },
  },
  // Leadership-focused artifacts
  {
    id: 'acc_banner_command',
    name: 'Знамя Командира',
    description: 'Под этим знаменем армии шли за своим полководцем',
    slot: 'accessory',
    rarity: 'uncommon',
    icon: '🚩',
    bonuses: { leadership: 10 },
  },
  {
    id: 'helm_warlord',
    name: 'Шлем Полководца',
    description: 'Внушает уважение и подчинение',
    slot: 'helmet',
    rarity: 'rare',
    icon: '🎖️',
    bonuses: { attack: 1, leadership: 12 },
  },
];

export function getArtifactById(id: string): Artifact | undefined {
  return ARTIFACTS.find(a => a.id === id);
}

export function getArtifactsBySlot(slot: ArtifactSlot): Artifact[] {
  return ARTIFACTS.filter(a => a.slot === slot);
}

// Get random artifact based on rarity weights
export function getRandomArtifact(minRarity: ArtifactRarity = 'common'): Artifact {
  const rarityOrder: ArtifactRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const minIndex = rarityOrder.indexOf(minRarity);
  
  // Weighted random selection
  const weights: Record<ArtifactRarity, number> = {
    common: 40,
    uncommon: 30,
    rare: 18,
    epic: 9,
    legendary: 3,
  };

  const eligible = ARTIFACTS.filter(a => rarityOrder.indexOf(a.rarity) >= minIndex);
  const totalWeight = eligible.reduce((sum, a) => sum + weights[a.rarity], 0);
  
  let random = Math.random() * totalWeight;
  for (const artifact of eligible) {
    random -= weights[artifact.rarity];
    if (random <= 0) return artifact;
  }
  
  return eligible[0];
}

export const SLOT_NAMES: Record<ArtifactSlot, string> = {
  helmet: 'Шлем',
  armor: 'Броня',
  weapon: 'Оружие',
  accessory: 'Аксессуар',
};

export const SLOT_ICONS: Record<ArtifactSlot, string> = {
  helmet: '🪖',
  armor: '🛡️',
  weapon: '⚔️',
  accessory: '💍',
};
