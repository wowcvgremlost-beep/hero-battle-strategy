import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TOWNS, type TownId } from '@/data/towns';
import { toast } from 'sonner';
import { Shield, Swords, Heart, Zap, ArrowRight, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

type Step = 'name' | 'town' | 'confirm';

const alignmentLabels = {
  good: { text: 'Добро', color: 'text-gold' },
  evil: { text: 'Зло', color: 'text-crimson' },
  neutral: { text: 'Нейтрал', color: 'text-arcane' },
};

const CharacterCreate = () => {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>('name');
  const [characterName, setCharacterName] = useState('');
  const [selectedTown, setSelectedTown] = useState<TownId | null>(null);
  const [expandedTown, setExpandedTown] = useState<TownId | null>(null);
  const [loading, setLoading] = useState(false);

  const town = TOWNS.find((t) => t.id === selectedTown);

  const handleCreate = async () => {
    if (!user || !selectedTown || !characterName.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          character_name: characterName.trim(),
          town: selectedTown,
          character_created: true,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Персонаж создан!');
    } catch (err: any) {
      toast.error(err.message || 'Ошибка создания персонажа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
          <h1 className="font-display text-3xl font-black text-gradient-gold">СОЗДАНИЕ ГЕРОЯ</h1>
          <div className="flex justify-center gap-2 mt-3">
            {(['name', 'town', 'confirm'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 w-12 rounded-full transition-colors ${
                  step === s ? 'bg-gradient-gold' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Name */}
          {step === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-gold/10 bg-gradient-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">ИМЯ ГЕРОЯ</h2>
                <input
                  type="text"
                  placeholder="Введите имя..."
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-display text-lg"
                />
                <p className="text-xs text-muted-foreground mt-2">{characterName.length}/20 символов</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep('town')}
                disabled={!characterName.trim()}
                className="w-full rounded-xl bg-gradient-gold p-4 shadow-gold disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <span className="font-display font-bold text-primary-foreground">ДАЛЕЕ</span>
                <ArrowRight className="h-5 w-5 text-primary-foreground" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Town */}
          {step === 'town' && (
            <motion.div
              key="town"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStep('name')} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="font-display text-lg font-bold text-foreground">ВЫБЕРИ ГОРОД</h2>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {TOWNS.map((t) => {
                  const isSelected = selectedTown === t.id;
                  const isExpanded = expandedTown === t.id;
                  const align = alignmentLabels[t.alignment];

                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-gold/40 shadow-gold bg-gradient-card'
                          : 'border-border bg-gradient-card hover:border-gold/20'
                      }`}
                    >
                      <div
                        className="p-3 flex items-center justify-between"
                        onClick={() => {
                          setSelectedTown(t.id);
                          setExpandedTown(isExpanded ? null : t.id);
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-foreground">{t.name}</h3>
                            <span className={`text-[10px] font-semibold ${align.color}`}>{align.text}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Магия: {t.magicSchool}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 border-t border-border/50 pt-2">
                              <p className="text-xs text-muted-foreground mb-3">{t.description}</p>
                              <p className="text-[10px] font-semibold text-gold mb-2 uppercase">Армия ({t.units.length} юнитов)</p>
                              <div className="space-y-1.5">
                                {t.units.map((u) => (
                                  <div key={u.name} className="flex items-center justify-between rounded-lg bg-secondary/50 px-2 py-1.5">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex items-center gap-0.5">
                                          <Swords className="h-2.5 w-2.5 text-crimson" />
                                          <span className="text-[10px] text-muted-foreground">{u.attack}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                          <Shield className="h-2.5 w-2.5 text-gold" />
                                          <span className="text-[10px] text-muted-foreground">{u.defense}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                          <Heart className="h-2.5 w-2.5 text-emerald" />
                                          <span className="text-[10px] text-muted-foreground">{u.health}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                          <Zap className="h-2.5 w-2.5 text-arcane" />
                                          <span className="text-[10px] text-muted-foreground">{u.damage}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground ml-2">Ур. {u.level}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep('confirm')}
                disabled={!selectedTown}
                className="w-full rounded-xl bg-gradient-gold p-4 shadow-gold disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <span className="font-display font-bold text-primary-foreground">ДАЛЕЕ</span>
                <ArrowRight className="h-5 w-5 text-primary-foreground" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && town && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStep('town')} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="font-display text-lg font-bold text-foreground">ПОДТВЕРЖДЕНИЕ</h2>
              </div>

              <div className="rounded-xl border border-gold/20 bg-gradient-card p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Имя героя</p>
                  <p className="font-display text-xl font-bold text-gradient-gold">{characterName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Город</p>
                  <p className="font-display text-lg font-bold text-foreground">{town.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{town.description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Школа магии</p>
                  <p className="text-sm font-semibold text-arcane">{town.magicSchool}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Стартовая армия: {town.units.length} типов юнитов</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-crimson p-4 shadow-crimson disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="font-display text-lg font-bold text-accent-foreground">
                  {loading ? 'СОЗДАНИЕ...' : 'СОЗДАТЬ ГЕРОЯ'}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CharacterCreate;
