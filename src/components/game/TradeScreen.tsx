import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  ARTIFACTS, getArtifactById, ARTIFACT_RARITY_COLORS, ARTIFACT_RARITY_NAMES,
  type Artifact, type ArtifactRarity,
} from '@/data/artifacts';
import { toast } from 'sonner';
import { Coins, ShoppingCart, ArrowLeftRight, Tag, Store } from 'lucide-react';

// Shop inventory — rotating selection of artifacts for sale
const SELL_PRICE_MULTIPLIER: Record<ArtifactRarity, number> = {
  common: 0.4,
  uncommon: 0.5,
  rare: 0.5,
  epic: 0.6,
  legendary: 0.7,
};

const BUY_PRICE: Record<ArtifactRarity, number> = {
  common: 500,
  uncommon: 1500,
  rare: 4000,
  epic: 10000,
  legendary: 25000,
};

// Resources you can buy
interface Resource {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  effect: string;
  type: 'mana' | 'gold';
  amount: number;
}

const SHOP_RESOURCES: Resource[] = [
  { id: 'mana_potion_s', name: 'Малое зелье маны', icon: '🧪', description: 'Восстанавливает ману', price: 300, effect: '+20 маны', type: 'mana', amount: 20 },
  { id: 'mana_potion_m', name: 'Среднее зелье маны', icon: '⚗️', description: 'Восстанавливает много маны', price: 800, effect: '+50 маны', type: 'mana', amount: 50 },
  { id: 'mana_potion_l', name: 'Большое зелье маны', icon: '🏺', description: 'Полное восстановление маны', price: 2000, effect: '+150 маны', type: 'mana', amount: 150 },
];

// Generate shop inventory based on day (rotates)
function getShopArtifacts(day: number): Artifact[] {
  const seed = Math.floor(day / 7); // Changes weekly
  const shuffled = [...ARTIFACTS].sort((a, b) => {
    const ha = ((seed * 31 + a.id.charCodeAt(0)) % 100);
    const hb = ((seed * 31 + b.id.charCodeAt(0)) % 100);
    return ha - hb;
  });
  return shuffled.slice(0, 6);
}

interface PlayerArtifact {
  id: string;
  artifact_id: string;
  is_equipped: boolean;
  slot: string;
}

const TradeScreen = () => {
  const { user, profile, updateGold, updateMana, refreshProfile } = useAuth();
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [playerArtifacts, setPlayerArtifacts] = useState<PlayerArtifact[]>([]);
  const [buying, setBuying] = useState(false);

  const day = profile?.day || 1;
  const shopArtifacts = getShopArtifacts(day);

  useEffect(() => {
    if (!user) return;
    fetchPlayerArtifacts();
  }, [user]);

  const fetchPlayerArtifacts = async () => {
    if (!user) return;
    const { data } = await supabase.from('player_artifacts').select('id, artifact_id, is_equipped, slot').eq('user_id', user.id);
    setPlayerArtifacts((data as PlayerArtifact[]) || []);
  };

  const buyArtifact = async (artifact: Artifact) => {
    if (!user || !profile || buying) return;
    const price = BUY_PRICE[artifact.rarity];
    if (profile.gold < price) {
      toast.error('Недостаточно золота!');
      return;
    }
    setBuying(true);
    try {
      await supabase.from('player_artifacts').insert({
        user_id: user.id, artifact_id: artifact.id, slot: artifact.slot, is_equipped: false,
      });
      await updateGold(profile.gold - price);
      await fetchPlayerArtifacts();
      toast.success(`Куплен: ${artifact.icon} ${artifact.name} за ${price.toLocaleString()}💰`);
    } catch {
      toast.error('Ошибка покупки');
    } finally {
      setBuying(false);
    }
  };

  const sellArtifact = async (playerArtifact: PlayerArtifact) => {
    if (!user || !profile || buying) return;
    if (playerArtifact.is_equipped) {
      toast.error('Сначала снимите артефакт!');
      return;
    }
    const artifact = getArtifactById(playerArtifact.artifact_id);
    if (!artifact) return;
    const sellPrice = Math.floor(BUY_PRICE[artifact.rarity] * SELL_PRICE_MULTIPLIER[artifact.rarity]);
    setBuying(true);
    try {
      await supabase.from('player_artifacts').delete().eq('id', playerArtifact.id);
      await updateGold(profile.gold + sellPrice);
      await fetchPlayerArtifacts();
      toast.success(`Продан: ${artifact.icon} ${artifact.name} за ${sellPrice.toLocaleString()}💰`);
    } catch {
      toast.error('Ошибка продажи');
    } finally {
      setBuying(false);
    }
  };

  const buyResource = async (resource: Resource) => {
    if (!user || !profile || buying) return;
    if (profile.gold < resource.price) {
      toast.error('Недостаточно золота!');
      return;
    }
    setBuying(true);
    try {
      await updateGold(profile.gold - resource.price);
      if (resource.type === 'mana') {
        await updateMana((profile.mana || 0) + resource.amount);
      }
      toast.success(`Куплено: ${resource.icon} ${resource.name} (${resource.effect})`);
    } catch {
      toast.error('Ошибка покупки');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button onClick={() => setMode('buy')}
          className={`flex-1 rounded-xl py-2.5 font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'buy' ? 'bg-gradient-gold text-primary-foreground shadow-gold' : 'bg-secondary text-muted-foreground'
          }`}>
          <ShoppingCart className="h-3.5 w-3.5" /> КУПИТЬ
        </button>
        <button onClick={() => setMode('sell')}
          className={`flex-1 rounded-xl py-2.5 font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'sell' ? 'bg-gradient-crimson text-accent-foreground shadow-crimson' : 'bg-secondary text-muted-foreground'
          }`}>
          <Tag className="h-3.5 w-3.5" /> ПРОДАТЬ
        </button>
      </div>

      {/* Gold display */}
      <div className="rounded-xl border border-gold/20 bg-gradient-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-gold" />
          <span className="font-display text-sm font-bold text-foreground">Торговая лавка</span>
        </div>
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-gold" />
          <span className="font-display text-lg font-bold text-gold">{(profile?.gold || 0).toLocaleString()}</span>
        </div>
      </div>

      {mode === 'buy' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Resources */}
          <h3 className="font-display text-sm font-bold text-gold uppercase flex items-center gap-2">
            🧪 Зелья и ресурсы
          </h3>
          <div className="space-y-2">
            {SHOP_RESOURCES.map(resource => {
              const canAfford = (profile?.gold || 0) >= resource.price;
              return (
                <motion.div key={resource.id} whileTap={{ scale: 0.98 }}
                  className="rounded-lg border border-border bg-gradient-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{resource.icon}</span>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{resource.name}</p>
                      <p className="text-[10px] text-muted-foreground">{resource.description}</p>
                      <p className="text-[10px] text-emerald">{resource.effect}</p>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => buyResource(resource)}
                    disabled={!canAfford || buying}
                    className="rounded-lg bg-gradient-gold px-3 py-2 font-display text-[10px] font-bold text-primary-foreground disabled:opacity-40 flex items-center gap-1">
                    <Coins className="h-3 w-3" /> {resource.price.toLocaleString()}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* Artifacts for sale */}
          <h3 className="font-display text-sm font-bold text-gold uppercase flex items-center gap-2">
            ✨ Артефакты (обновляются каждую неделю)
          </h3>
          <div className="space-y-2">
            {shopArtifacts.map(artifact => {
              const price = BUY_PRICE[artifact.rarity];
              const canAfford = (profile?.gold || 0) >= price;
              return (
                <motion.div key={artifact.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg border border-border bg-gradient-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{artifact.icon}</span>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">{artifact.name}</p>
                        <p className="text-[10px]" style={{ color: ARTIFACT_RARITY_COLORS[artifact.rarity] }}>
                          {ARTIFACT_RARITY_NAMES[artifact.rarity]}
                        </p>
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => buyArtifact(artifact)}
                      disabled={!canAfford || buying}
                      className="rounded-lg bg-gradient-gold px-3 py-2 font-display text-[10px] font-bold text-primary-foreground disabled:opacity-40 flex items-center gap-1">
                      <Coins className="h-3 w-3" /> {price.toLocaleString()}
                    </motion.button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{artifact.description}</p>
                  <div className="flex gap-2 mt-1 text-[10px]">
                    {artifact.bonuses.attack && <span className="text-crimson">⚔️+{artifact.bonuses.attack}</span>}
                    {artifact.bonuses.defense && <span className="text-gold">🛡️+{artifact.bonuses.defense}</span>}
                    {artifact.bonuses.spellpower && <span className="text-arcane">✨+{artifact.bonuses.spellpower}</span>}
                    {artifact.bonuses.knowledge && <span className="text-emerald">📖+{artifact.bonuses.knowledge}</span>}
                    {artifact.bonuses.leadership && <span className="text-foreground">👑+{artifact.bonuses.leadership}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {mode === 'sell' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <h3 className="font-display text-sm font-bold text-crimson uppercase">Ваши артефакты</h3>
          {playerArtifacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">У вас нет артефактов для продажи</p>
          ) : (
            playerArtifacts.map(pa => {
              const artifact = getArtifactById(pa.artifact_id);
              if (!artifact) return null;
              const sellPrice = Math.floor(BUY_PRICE[artifact.rarity] * SELL_PRICE_MULTIPLIER[artifact.rarity]);
              return (
                <motion.div key={pa.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={`rounded-lg border p-3 ${pa.is_equipped ? 'border-gold/30 bg-gold/5' : 'border-border bg-gradient-card'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{artifact.icon}</span>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">
                          {artifact.name}
                          {pa.is_equipped && <span className="text-[10px] text-gold ml-1">[надет]</span>}
                        </p>
                        <p className="text-[10px]" style={{ color: ARTIFACT_RARITY_COLORS[artifact.rarity] }}>
                          {ARTIFACT_RARITY_NAMES[artifact.rarity]}
                        </p>
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => sellArtifact(pa)}
                      disabled={pa.is_equipped || buying}
                      className="rounded-lg bg-gradient-crimson px-3 py-2 font-display text-[10px] font-bold text-accent-foreground disabled:opacity-40 flex items-center gap-1">
                      <Coins className="h-3 w-3" /> {sellPrice.toLocaleString()}
                    </motion.button>
                  </div>
                  <div className="flex gap-2 mt-1 text-[10px]">
                    {artifact.bonuses.attack && <span className="text-crimson">⚔️+{artifact.bonuses.attack}</span>}
                    {artifact.bonuses.defense && <span className="text-gold">🛡️+{artifact.bonuses.defense}</span>}
                    {artifact.bonuses.spellpower && <span className="text-arcane">✨+{artifact.bonuses.spellpower}</span>}
                    {artifact.bonuses.knowledge && <span className="text-emerald">📖+{artifact.bonuses.knowledge}</span>}
                    {artifact.bonuses.leadership && <span className="text-foreground">👑+{artifact.bonuses.leadership}</span>}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TradeScreen;
