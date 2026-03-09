import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TOWNS, type TownId } from '@/data/towns';
import { getArtifactById, ARTIFACT_RARITY_COLORS, ARTIFACT_RARITY_NAMES } from '@/data/artifacts';
import { ALL_SPELLS } from '@/data/spells';
import { toast } from 'sonner';
import { Coins, ShoppingCart, Tag, Store, Users, ArrowLeftRight, Package, X, Plus, Minus, Search } from 'lucide-react';

interface TradeOffer {
  id: string;
  seller_id: string;
  item_type: string;
  item_id: string;
  item_count: number;
  price: number;
  status: string;
  created_at: string;
}

interface PlayerArtifactRow {
  id: string;
  artifact_id: string;
  is_equipped: boolean;
}

interface PlayerSpellRow {
  id: string;
  spell_id: string;
}

type MarketTab = 'browse' | 'sell' | 'my_offers';

const ITEM_TYPE_LABELS: Record<string, string> = {
  unit: '⚔️ Юнит',
  artifact: '🎁 Артефакт',
  spell: '✨ Заклинание',
  gold: '💰 Золото',
};

const PlayerMarketplace = () => {
  const { user, profile, army, spells: playerSpells, updateGold, refreshArmy, refreshSpells, refreshProfile } = useAuth();
  const [tab, setTab] = useState<MarketTab>('browse');
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [myOffers, setMyOffers] = useState<TradeOffer[]>([]);
  const [playerArtifacts, setPlayerArtifacts] = useState<PlayerArtifactRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Sell form state
  const [sellType, setSellType] = useState<'unit' | 'artifact' | 'spell'>('unit');
  const [sellItemId, setSellItemId] = useState('');
  const [sellCount, setSellCount] = useState(1);
  const [sellPrice, setSellPrice] = useState(100);

  const town = TOWNS.find(t => t.id === profile?.town);

  useEffect(() => {
    if (!user) return;
    fetchOffers();
    fetchMyOffers();
    fetchPlayerArtifacts();

    const channel = supabase.channel('marketplace-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trade_offers' }, () => {
        fetchOffers();
        fetchMyOffers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchOffers = async () => {
    const { data } = await supabase
      .from('trade_offers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setOffers((data as TradeOffer[]) || []);
  };

  const fetchMyOffers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('trade_offers')
      .select('*')
      .eq('seller_id', user.id)
      .in('status', ['active', 'sold'])
      .order('created_at', { ascending: false });
    setMyOffers((data as TradeOffer[]) || []);
  };

  const fetchPlayerArtifacts = async () => {
    if (!user) return;
    const { data } = await supabase.from('player_artifacts').select('id, artifact_id, is_equipped').eq('user_id', user.id);
    setPlayerArtifacts((data as PlayerArtifactRow[]) || []);
  };

  const getItemDisplayName = (type: string, id: string): string => {
    if (type === 'unit') return id;
    if (type === 'artifact') {
      const art = getArtifactById(id);
      return art ? `${art.icon} ${art.name}` : id;
    }
    if (type === 'spell') {
      const spell = ALL_SPELLS.find(s => s.id === id);
      return spell ? `${spell.icon} ${spell.name}` : id;
    }
    return id;
  };

  const handleCreateOffer = async () => {
    if (!user || !profile || loading) return;
    if (sellPrice < 1) { toast.error('Цена должна быть > 0'); return; }

    setLoading(true);
    try {
      // Validate ownership and deduct items
      if (sellType === 'unit') {
        const unitInArmy = army.find(a => a.unit_name === sellItemId);
        if (!unitInArmy || unitInArmy.count < sellCount) {
          toast.error('Недостаточно юнитов!'); setLoading(false); return;
        }
        const newCount = unitInArmy.count - sellCount;
        if (newCount <= 0) {
          await supabase.from('player_army').delete().eq('user_id', user.id).eq('unit_name', sellItemId);
        } else {
          await supabase.from('player_army').update({ count: newCount }).eq('user_id', user.id).eq('unit_name', sellItemId);
        }
        await refreshArmy();
      } else if (sellType === 'artifact') {
        const pa = playerArtifacts.find(a => a.artifact_id === sellItemId && !a.is_equipped);
        if (!pa) { toast.error('Артефакт не найден или надет!'); setLoading(false); return; }
        await supabase.from('player_artifacts').delete().eq('id', pa.id);
        await fetchPlayerArtifacts();
      } else if (sellType === 'spell') {
        const ps = playerSpells.find(s => s.spell_id === sellItemId);
        if (!ps) { toast.error('Заклинание не найдено!'); setLoading(false); return; }
        await supabase.from('player_spells').delete().eq('id', ps.id);
        await refreshSpells();
      }

      await supabase.from('trade_offers').insert({
        seller_id: user.id,
        item_type: sellType,
        item_id: sellItemId,
        item_count: sellType === 'unit' ? sellCount : 1,
        price: sellPrice,
      });

      toast.success('Лот выставлен на рынок!');
      setSellItemId('');
      setSellCount(1);
      setSellPrice(100);
      await fetchMyOffers();
    } catch {
      toast.error('Ошибка при создании лота');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyOffer = async (offer: TradeOffer) => {
    if (!user || !profile || loading) return;
    if (offer.seller_id === user.id) { toast.error('Нельзя купить свой лот!'); return; }
    if (profile.gold < offer.price) { toast.error('Недостаточно золота!'); return; }

    setLoading(true);
    try {
      // Pay gold
      await updateGold(profile.gold - offer.price);

      // Give item to buyer
      if (offer.item_type === 'unit') {
        const existing = army.find(a => a.unit_name === offer.item_id);
        if (existing) {
          await supabase.from('player_army').update({ count: existing.count + offer.item_count }).eq('user_id', user.id).eq('unit_name', offer.item_id);
        } else {
          await supabase.from('player_army').insert({ user_id: user.id, unit_name: offer.item_id, count: offer.item_count });
        }
        await refreshArmy();
      } else if (offer.item_type === 'artifact') {
        const art = getArtifactById(offer.item_id);
        if (art) {
          await supabase.from('player_artifacts').insert({ user_id: user.id, artifact_id: offer.item_id, slot: art.slot, is_equipped: false });
        }
        await fetchPlayerArtifacts();
      } else if (offer.item_type === 'spell') {
        await supabase.from('player_spells').insert({ user_id: user.id, spell_id: offer.item_id });
        await refreshSpells();
      }

      // Give gold to seller
      const { data: sellerProfile } = await supabase.from('profiles').select('gold').eq('user_id', offer.seller_id).single();
      if (sellerProfile) {
        await supabase.from('profiles').update({ gold: sellerProfile.gold + offer.price }).eq('user_id', offer.seller_id);
      }

      // Mark offer as sold
      await supabase.from('trade_offers').update({ status: 'sold', buyer_id: user.id, sold_at: new Date().toISOString() }).eq('id', offer.id);

      toast.success(`Куплено: ${getItemDisplayName(offer.item_type, offer.item_id)}!`);
      await fetchOffers();
      await refreshProfile();
    } catch {
      toast.error('Ошибка покупки');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOffer = async (offer: TradeOffer) => {
    if (!user || loading) return;
    setLoading(true);
    try {
      // Return items to seller
      if (offer.item_type === 'unit') {
        const existing = army.find(a => a.unit_name === offer.item_id);
        if (existing) {
          await supabase.from('player_army').update({ count: existing.count + offer.item_count }).eq('user_id', user.id).eq('unit_name', offer.item_id);
        } else {
          await supabase.from('player_army').insert({ user_id: user.id, unit_name: offer.item_id, count: offer.item_count });
        }
        await refreshArmy();
      } else if (offer.item_type === 'artifact') {
        const art = getArtifactById(offer.item_id);
        if (art) {
          await supabase.from('player_artifacts').insert({ user_id: user.id, artifact_id: offer.item_id, slot: art.slot, is_equipped: false });
        }
        await fetchPlayerArtifacts();
      } else if (offer.item_type === 'spell') {
        await supabase.from('player_spells').insert({ user_id: user.id, spell_id: offer.item_id });
        await refreshSpells();
      }

      await supabase.from('trade_offers').update({ status: 'cancelled' }).eq('id', offer.id);
      toast.success('Лот снят с продажи, предметы возвращены');
      await fetchOffers();
      await fetchMyOffers();
    } catch {
      toast.error('Ошибка отмены');
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = offers.filter(o => {
    if (filterType === 'all') return true;
    return o.item_type === filterType;
  }).filter(o => o.seller_id !== user?.id);

  // Available items for selling
  const availableUnits = army.filter(a => a.count > 0);
  const availableArtifacts = playerArtifacts.filter(a => !a.is_equipped);
  const availableSpells = playerSpells;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-gold/20 bg-gradient-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-gold" />
          <span className="font-display text-sm font-bold text-foreground">Рынок игроков</span>
        </div>
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-gold" />
          <span className="font-display text-lg font-bold text-gold">{(profile?.gold || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {([
          { id: 'browse' as MarketTab, icon: Search, label: 'РЫНОК' },
          { id: 'sell' as MarketTab, icon: Tag, label: 'ПРОДАТЬ' },
          { id: 'my_offers' as MarketTab, icon: Package, label: 'МОИ ЛОТЫ' },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2.5 font-display text-xs font-bold transition-all ${
              tab === t.id ? 'bg-gradient-gold text-primary-foreground shadow-gold' : 'bg-secondary text-muted-foreground'
            }`}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Browse marketplace */}
      {tab === 'browse' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {/* Filter */}
          <div className="flex gap-1 flex-wrap">
            {[
              { id: 'all', label: 'Все' },
              { id: 'unit', label: '⚔️ Юниты' },
              { id: 'artifact', label: '🎁 Артефакты' },
              { id: 'spell', label: '✨ Заклинания' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilterType(f.id)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-display font-bold transition-all ${
                  filterType === f.id ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-secondary text-muted-foreground'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {filteredOffers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нет доступных лотов</p>
          ) : (
            <div className="space-y-2">
              {filteredOffers.map(offer => {
                const canAfford = (profile?.gold || 0) >= offer.price;
                return (
                  <motion.div key={offer.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-gradient-card p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {ITEM_TYPE_LABELS[offer.item_type] || offer.item_type}
                          </span>
                          <span className="font-display text-sm font-bold text-foreground">
                            {getItemDisplayName(offer.item_type, offer.item_id)}
                          </span>
                        </div>
                        {offer.item_type === 'unit' && offer.item_count > 1 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Количество: {offer.item_count}</p>
                        )}
                        {offer.item_type === 'artifact' && (() => {
                          const art = getArtifactById(offer.item_id);
                          if (!art) return null;
                          return (
                            <div className="flex gap-1 mt-0.5 text-[10px]">
                              <span style={{ color: ARTIFACT_RARITY_COLORS[art.rarity] }}>{ARTIFACT_RARITY_NAMES[art.rarity]}</span>
                              {art.bonuses.attack && <span className="text-crimson">⚔️+{art.bonuses.attack}</span>}
                              {art.bonuses.defense && <span className="text-gold">🛡️+{art.bonuses.defense}</span>}
                            </div>
                          );
                        })()}
                      </div>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleBuyOffer(offer)}
                        disabled={!canAfford || loading}
                        className="rounded-lg bg-gradient-gold px-3 py-2 font-display text-[10px] font-bold text-primary-foreground disabled:opacity-40 flex items-center gap-1">
                        <Coins className="h-3 w-3" /> {offer.price.toLocaleString()}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Sell items */}
      {tab === 'sell' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {/* Item type selector */}
          <div className="flex gap-1">
            {([
              { id: 'unit' as const, label: '⚔️ Юнит' },
              { id: 'artifact' as const, label: '🎁 Артефакт' },
              { id: 'spell' as const, label: '✨ Заклинание' },
            ]).map(t => (
              <button key={t.id} onClick={() => { setSellType(t.id); setSellItemId(''); setSellCount(1); }}
                className={`flex-1 rounded-lg py-2 text-[10px] font-display font-bold transition-all ${
                  sellType === t.id ? 'bg-crimson/20 text-crimson border border-crimson/30' : 'bg-secondary text-muted-foreground'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Item selector */}
          <div className="rounded-lg border border-border bg-gradient-card p-3 space-y-3">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Выберите предмет</p>

            {sellType === 'unit' && (
              <div className="space-y-1">
                {availableUnits.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Нет юнитов</p>
                ) : availableUnits.map(u => (
                  <button key={u.unit_name} onClick={() => { setSellItemId(u.unit_name); setSellCount(1); }}
                    className={`w-full text-left rounded-lg p-2 text-xs transition-all ${
                      sellItemId === u.unit_name ? 'bg-crimson/15 border border-crimson/30' : 'bg-secondary/50 hover:bg-secondary'
                    }`}>
                    <span className="font-bold text-foreground">{u.unit_name}</span>
                    <span className="text-muted-foreground ml-1">(×{u.count})</span>
                  </button>
                ))}
                {sellItemId && sellType === 'unit' && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">Кол-во:</span>
                    <button onClick={() => setSellCount(Math.max(1, sellCount - 1))} className="rounded bg-secondary p-1">
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <span className="font-display font-bold text-sm text-foreground w-8 text-center">{sellCount}</span>
                    <button onClick={() => {
                      const max = army.find(a => a.unit_name === sellItemId)?.count || 1;
                      setSellCount(Math.min(max, sellCount + 1));
                    }} className="rounded bg-secondary p-1">
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {sellType === 'artifact' && (
              <div className="space-y-1">
                {availableArtifacts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Нет артефактов (снимите экипировку)</p>
                ) : availableArtifacts.map(pa => {
                  const art = getArtifactById(pa.artifact_id);
                  if (!art) return null;
                  return (
                    <button key={pa.id} onClick={() => setSellItemId(pa.artifact_id)}
                      className={`w-full text-left rounded-lg p-2 text-xs transition-all ${
                        sellItemId === pa.artifact_id ? 'bg-crimson/15 border border-crimson/30' : 'bg-secondary/50 hover:bg-secondary'
                      }`}>
                      <span className="text-lg mr-1">{art.icon}</span>
                      <span className="font-bold text-foreground">{art.name}</span>
                      <span className="ml-1" style={{ color: ARTIFACT_RARITY_COLORS[art.rarity] }}>
                        ({ARTIFACT_RARITY_NAMES[art.rarity]})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {sellType === 'spell' && (
              <div className="space-y-1">
                {availableSpells.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Нет заклинаний</p>
                ) : availableSpells.map(ps => {
                  const spell = ALL_SPELLS.find(s => s.id === ps.spell_id);
                  if (!spell) return null;
                  return (
                    <button key={ps.id} onClick={() => setSellItemId(ps.spell_id)}
                      className={`w-full text-left rounded-lg p-2 text-xs transition-all ${
                        sellItemId === ps.spell_id ? 'bg-crimson/15 border border-crimson/30' : 'bg-secondary/50 hover:bg-secondary'
                      }`}>
                      <span className="text-lg mr-1">{spell.icon}</span>
                      <span className="font-bold text-foreground">{spell.name}</span>
                      <span className="text-muted-foreground ml-1">Ур.{spell.level}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Price */}
            {sellItemId && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Цена:</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSellPrice(Math.max(10, sellPrice - 100))} className="rounded bg-secondary p-1">
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <input type="number" value={sellPrice} onChange={e => setSellPrice(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-20 text-center bg-secondary rounded px-2 py-1 text-sm font-display font-bold text-gold border-none outline-none" />
                    <button onClick={() => setSellPrice(sellPrice + 100)} className="rounded bg-secondary p-1">
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <Coins className="h-3 w-3 text-gold" />
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreateOffer}
                  disabled={loading || !sellItemId}
                  className="w-full rounded-xl bg-gradient-crimson p-3 font-display text-sm font-bold text-accent-foreground disabled:opacity-40 flex items-center justify-center gap-2">
                  <Tag className="h-4 w-4" />
                  ВЫСТАВИТЬ НА РЫНОК
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* My offers */}
      {tab === 'my_offers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {myOffers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">У вас нет активных лотов</p>
          ) : myOffers.map(offer => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-3 ${
                offer.status === 'sold' ? 'border-emerald/30 bg-emerald/5' : 'border-border bg-gradient-card'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {ITEM_TYPE_LABELS[offer.item_type]}
                    </span>
                    <span className="font-display text-sm font-bold text-foreground">
                      {getItemDisplayName(offer.item_type, offer.item_id)}
                    </span>
                  </div>
                  {offer.item_type === 'unit' && offer.item_count > 1 && (
                    <p className="text-[10px] text-muted-foreground">×{offer.item_count}</p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <Coins className="h-3 w-3 text-gold" />
                    <span className="text-xs font-bold text-gold">{offer.price.toLocaleString()}</span>
                    {offer.status === 'sold' && (
                      <span className="text-[10px] text-emerald ml-2">✅ Продано!</span>
                    )}
                  </div>
                </div>
                {offer.status === 'active' && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCancelOffer(offer)}
                    disabled={loading}
                    className="rounded-lg bg-secondary px-3 py-2 font-display text-[10px] font-bold text-muted-foreground disabled:opacity-40 flex items-center gap-1">
                    <X className="h-3 w-3" /> Снять
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default PlayerMarketplace;
