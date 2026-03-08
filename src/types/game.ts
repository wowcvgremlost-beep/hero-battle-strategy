export interface Hero {
  id: string;
  name: string;
  class: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level: number;
  maxLevel: number;
  attack: number;
  defense: number;
  hp: number;
  maxHp: number;
  image: string;
  selected?: boolean;
}

export interface PlayerResources {
  gold: number;
  crystals: number;
  energy: number;
  maxEnergy: number;
}

export type GameScreen = 'main' | 'heroes' | 'battle' | 'shop';
