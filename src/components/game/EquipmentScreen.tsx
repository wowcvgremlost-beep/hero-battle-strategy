import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  ARTIFACTS, 
  getArtifactById, 
  SLOT_NAMES, 
  SLOT_ICONS, 
  ARTIFACT_RARITY_COLORS, 
  ARTIFACT_RARITY_NAMES,
  type ArtifactSlot,
  type Artifact
} from '@/data/artifacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Swords, Shield, Sparkles, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface PlayerArtifact {
  id: string;
  artifact_id: string;
  is_equipped: boolean;
  slot: string;
}

const SLOTS: ArtifactSlot[] = ['helmet', 'armor', 'weapon', 'accessory'];

const EquipmentScreen = () => {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<PlayerArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlot, setExpandedSlot] = useState<ArtifactSlot | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchArtifacts();

    const channel = supabase
      .channel('artifacts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'player_artifacts',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchArtifacts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchArtifacts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('player_artifacts')
      .select('*')
      .eq('user_id', user.id);
    setArtifacts((data as PlayerArtifact[]) || []);
    setLoading(false);
  };

  const equippedBySlot: Record<ArtifactSlot, PlayerArtifact | null> = {
    helmet: null,
    armor: null,
    weapon: null,
    accessory: null,
  };

  const inventory: PlayerArtifact[] = [];

  artifacts.forEach(pa => {
    if (pa.is_equipped) {
      equippedBySlot[pa.slot as ArtifactSlot] = pa;
    } else {
      inventory.push(pa);
    }
  });

  // Calculate total bonuses from equipped artifacts
  const totalBonuses = { attack: 0, defense: 0, spellpower: 0, knowledge: 0 };
  Object.values(equippedBySlot).forEach(pa => {
    if (pa) {
      const artifact = getArtifactById(pa.artifact_id);
      if (artifact) {
        totalBonuses.attack += artifact.bonuses.attack || 0;
        totalBonuses.defense += artifact.bonuses.defense || 0;
        totalBonuses.spellpower += artifact.bonuses.spellpower || 0;
        totalBonuses.knowledge += artifact.bonuses.knowledge || 0;
      }
    }
  });

  const handleEquip = async (playerArtifact: PlayerArtifact) => {
    if (!user) return;
    const slot = playerArtifact.slot as ArtifactSlot;
    const currentEquipped = equippedBySlot[slot];

    // Unequip current if exists
    if (currentEquipped) {
      await supabase
        .from('player_artifacts')
        .update({ is_equipped: false })
        .eq('id', currentEquipped.id);
    }

    // Equip new
    await supabase
      .from('player_artifacts')
      .update({ is_equipped: true })
      .eq('id', playerArtifact.id);

    const artifact = getArtifactById(playerArtifact.artifact_id);
    toast.success(`${artifact?.name || 'Артефакт'} экипирован!`);
  };

  const handleUnequip = async (playerArtifact: PlayerArtifact) => {
    if (!user) return;
    await supabase
      .from('player_artifacts')
      .update({ is_equipped: false })
      .eq('id', playerArtifact.id);

    const artifact = getArtifactById(playerArtifact.artifact_id);
    toast.info(`${artifact?.name || 'Артефакт'} снят`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total bonuses */}
      <Card className="border-gold/20 bg-gradient-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-gold" />
            Бонусы от артефактов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-crimson/10 border border-crimson/20">
              <Swords className="h-4 w-4 text-crimson mx-auto mb-1" />
              <span className="text-xs font-bold text-crimson">+{totalBonuses.attack}</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-gold/10 border border-gold/20">
              <Shield className="h-4 w-4 text-gold mx-auto mb-1" />
              <span className="text-xs font-bold text-gold">+{totalBonuses.defense}</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-arcane/10 border border-arcane/20">
              <Sparkles className="h-4 w-4 text-arcane mx-auto mb-1" />
              <span className="text-xs font-bold text-arcane">+{totalBonuses.spellpower}</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-emerald/10 border border-emerald/20">
              <BookOpen className="h-4 w-4 text-emerald mx-auto mb-1" />
              <span className="text-xs font-bold text-emerald">+{totalBonuses.knowledge}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment slots */}
      <Card className="border-border bg-gradient-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Экипировка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SLOTS.map(slot => {
            const equipped = equippedBySlot[slot];
            const artifact = equipped ? getArtifactById(equipped.artifact_id) : null;
            const slotInventory = inventory.filter(pa => pa.slot === slot);
            const isExpanded = expandedSlot === slot;

            return (
              <div key={slot} className="space-y-1">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpandedSlot(isExpanded ? null : slot)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    equipped 
                      ? 'border-gold/30 bg-gold/5' 
                      : 'border-border bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  <div className="text-2xl">{artifact?.icon || SLOT_ICONS[slot]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase">{SLOT_NAMES[slot]}</p>
                    {artifact ? (
                      <>
                        <p className="font-display text-sm font-bold truncate" style={{ color: ARTIFACT_RARITY_COLORS[artifact.rarity] }}>
                          {artifact.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{ARTIFACT_RARITY_NAMES[artifact.rarity]}</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Пусто</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {slotInventory.length > 0 && (
                      <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">
                        {slotInventory.length}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-1 pt-1">
                        {/* Current equipped - unequip option */}
                        {equipped && artifact && (
                          <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUnequip(equipped)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-crimson/10 border border-crimson/20 cursor-pointer"
                          >
                            <span className="text-lg">{artifact.icon}</span>
                            <div className="flex-1">
                              <p className="text-xs font-bold" style={{ color: ARTIFACT_RARITY_COLORS[artifact.rarity] }}>
                                {artifact.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{artifact.description}</p>
                            </div>
                            <span className="text-[10px] text-crimson font-bold">СНЯТЬ</span>
                          </motion.div>
                        )}

                        {/* Inventory items for this slot */}
                        {slotInventory.map(pa => {
                          const art = getArtifactById(pa.artifact_id);
                          if (!art) return null;
                          return (
                            <motion.div
                              key={pa.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleEquip(pa)}
                              className="flex items-center gap-2 p-2 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer border border-border"
                            >
                              <span className="text-lg">{art.icon}</span>
                              <div className="flex-1">
                                <p className="text-xs font-bold" style={{ color: ARTIFACT_RARITY_COLORS[art.rarity] }}>
                                  {art.name}
                                </p>
                                <div className="flex gap-2 text-[10px] text-muted-foreground">
                                  {art.bonuses.attack && <span className="text-crimson">+{art.bonuses.attack}⚔</span>}
                                  {art.bonuses.defense && <span className="text-gold">+{art.bonuses.defense}🛡</span>}
                                  {art.bonuses.spellpower && <span className="text-arcane">+{art.bonuses.spellpower}✨</span>}
                                  {art.bonuses.knowledge && <span className="text-emerald">+{art.bonuses.knowledge}📖</span>}
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald font-bold">НАДЕТЬ</span>
                            </motion.div>
                          );
                        })}

                        {slotInventory.length === 0 && !equipped && (
                          <p className="text-[10px] text-muted-foreground p-2">Нет артефактов для этого слота</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Full inventory */}
      <Card className="border-border bg-gradient-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Инвентарь ({inventory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Ваш инвентарь пуст. Ищите артефакты на карте!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {inventory.map(pa => {
                const art = getArtifactById(pa.artifact_id);
                if (!art) return null;
                return (
                  <motion.div
                    key={pa.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEquip(pa)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer border border-border"
                  >
                    <span className="text-xl">{art.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold truncate" style={{ color: ARTIFACT_RARITY_COLORS[art.rarity] }}>
                        {art.name}
                      </p>
                      <p className="text-[8px] text-muted-foreground">{SLOT_NAMES[art.slot]}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentScreen;
