import heroWarrior from '@/assets/hero-warrior.jpg';
import heroMage from '@/assets/hero-mage.jpg';
import heroArcher from '@/assets/hero-archer.jpg';
import heroHealer from '@/assets/hero-healer.jpg';
import heroAssassin from '@/assets/hero-assassin.jpg';
import heroTank from '@/assets/hero-tank.jpg';
import type { Hero, PlayerResources } from '@/types/game';

export const HEROES: Hero[] = [
  {
    id: '1',
    name: 'Аргон',
    class: 'Воин',
    rarity: 'legendary',
    level: 15,
    maxLevel: 50,
    attack: 180,
    defense: 150,
    hp: 2400,
    maxHp: 2400,
    image: heroWarrior,
  },
  {
    id: '2',
    name: 'Эльвира',
    class: 'Маг',
    rarity: 'epic',
    level: 12,
    maxLevel: 50,
    attack: 220,
    defense: 80,
    hp: 1600,
    maxHp: 1600,
    image: heroMage,
  },
  {
    id: '3',
    name: 'Рейнар',
    class: 'Лучник',
    rarity: 'rare',
    level: 10,
    maxLevel: 50,
    attack: 195,
    defense: 95,
    hp: 1800,
    maxHp: 1800,
    image: heroArcher,
  },
  {
    id: '4',
    name: 'Селена',
    class: 'Целитель',
    rarity: 'epic',
    level: 11,
    maxLevel: 50,
    attack: 90,
    defense: 120,
    hp: 2000,
    maxHp: 2000,
    image: heroHealer,
  },
  {
    id: '5',
    name: 'Тень',
    class: 'Убийца',
    rarity: 'legendary',
    level: 14,
    maxLevel: 50,
    attack: 250,
    defense: 60,
    hp: 1400,
    maxHp: 1400,
    image: heroAssassin,
  },
  {
    id: '6',
    name: 'Бальдур',
    class: 'Танк',
    rarity: 'rare',
    level: 9,
    maxLevel: 50,
    attack: 100,
    defense: 230,
    hp: 3200,
    maxHp: 3200,
    image: heroTank,
  },
];

export const INITIAL_RESOURCES: PlayerResources = {
  gold: 12500,
  crystals: 340,
  energy: 45,
  maxEnergy: 60,
};
