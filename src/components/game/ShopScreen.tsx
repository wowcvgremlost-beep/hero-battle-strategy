import { motion } from 'framer-motion';
import { Gem, Package, Sparkles } from 'lucide-react';

const shopItems = [
  {
    id: '1',
    name: 'Сундук Героя',
    description: 'Случайный герой редкости Редкий+',
    price: 500,
    currency: 'crystals' as const,
    icon: Package,
  },
  {
    id: '2',
    name: 'Свиток Опыта',
    description: '+500 опыта для героя',
    price: 2000,
    currency: 'gold' as const,
    icon: Sparkles,
  },
  {
    id: '3',
    name: 'Кристаллы x100',
    description: 'Набор кристаллов',
    price: 5000,
    currency: 'gold' as const,
    icon: Gem,
  },
];

const ShopScreen = () => {
  return (
    <div className="px-4 pt-4 pb-24">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
        <h2 className="font-display text-2xl font-bold text-gradient-gold">МАГАЗИН</h2>
        <p className="text-sm text-muted-foreground mt-1">Усиль свою команду</p>
      </motion.div>

      <div className="space-y-3">
        {shopItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-gold/10 bg-gradient-card p-4"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-gold/10 p-3">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <button className="rounded-lg bg-gradient-gold px-4 py-2 shadow-gold">
                  <span className="text-sm font-bold text-primary-foreground">
                    {item.price.toLocaleString()}
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopScreen;
