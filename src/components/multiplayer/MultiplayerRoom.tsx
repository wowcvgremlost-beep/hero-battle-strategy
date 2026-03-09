import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TOWNS, type TownId } from '@/data/towns';
import { HEROES } from '@/data/heroes';
import { Users, LogOut, Check, Crown, Swords, Shield, Sparkles, Copy } from 'lucide-react';
import type { RoomData, PlayerData } from '@/pages/Multiplayer';

interface Props {
  room: RoomData;
  myPlayer: PlayerData;
  allPlayers: PlayerData[];
  onLeave: () => void;
  onRefreshPlayers: () => void;
  onGameStart: (room: RoomData, player: PlayerData) => void;
}

const PLAYER_COLORS = ['text-gold', 'text-crimson', 'text-arcane', 'text-emerald', 'text-blue-400', 'text-pink-400'];

const MultiplayerRoom = ({ room, myPlayer, allPlayers, onLeave, onRefreshPlayers, onGameStart }: Props) => {
  const [charName, setCharName] = useState(myPlayer.character_name || '');
  const [selectedTown, setSelectedTown] = useState<TownId | null>(myPlayer.town as TownId | null);
  const [selectedHero, setSelectedHero] = useState<string | null>(myPlayer.hero_id);
  const [step, setStep] = useState<'name' | 'town' | 'hero' | 'ready'>(
    myPlayer.is_ready ? 'ready' : myPlayer.hero_id ? 'ready' : myPlayer.town ? 'hero' : myPlayer.character_name ? 'town' : 'name'
  );

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel(`room-${room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplayer_players', filter: `room_id=eq.${room.id}` }, () => {
        onRefreshPlayers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplayer_rooms', filter: `id=eq.${room.id}` }, async () => {
        const { data } = await supabase.from('multiplayer_rooms').select('*').eq('id', room.id).single();
        if (data && (data as any).status === 'playing') {
          const { data: myP } = await supabase.from('multiplayer_players').select('*').eq('room_id', room.id).eq('user_id', myPlayer.user_id).single();
          if (myP) onGameStart(data as unknown as RoomData, myP as unknown as PlayerData);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room.id]);

  const handleSetName = async () => {
    if (!charName.trim()) return;
    
    await supabase.from('multiplayer_players').update({ character_name: charName.trim() }).eq('id', myPlayer.id);
    
    setStep('town');
    onRefreshPlayers();
  };

  const handleSelectTown = async (townId: TownId) => {
    setSelectedTown(townId);
    
    await supabase.from('multiplayer_players').update({ town: townId }).eq('id', myPlayer.id);
    
    // Save to profile for next time
    await supabase.from('profiles').update({ town: townId }).eq('user_id', myPlayer.user_id);
    
    setStep('hero');
    onRefreshPlayers();
  };

  const handleSelectHero = async (heroId: string) => {
    const hero = HEROES.find(h => h.id === heroId);
    if (!hero) return;
    setSelectedHero(heroId);
    
    // Update multiplayer player
    await supabase.from('multiplayer_players').update({
      hero_id: heroId,
      hero_attack: hero.baseAttack,
      hero_defense: hero.baseDefense,
      hero_spellpower: hero.baseSpellpower,
      hero_knowledge: hero.baseKnowledge,
      is_ready: true,
      status: 'playing',
    }).eq('id', myPlayer.id);

    // Also save to profile for future sessions
    await supabase.from('profiles').update({
      hero_id: heroId,
      hero_attack: hero.baseAttack,
      hero_defense: hero.baseDefense,
      hero_spellpower: hero.baseSpellpower,
      hero_knowledge: hero.baseKnowledge,
    }).eq('user_id', myPlayer.user_id);

    // Give starting army
    const town = TOWNS.find(t => t.id === selectedTown);
    if (town && town.units.length > 0) {
      const startUnit = town.units[0];
      await supabase.from('multiplayer_army').upsert({
        player_id: myPlayer.id,
        unit_name: startUnit.name,
        count: startUnit.growth * 2,
      }, { onConflict: 'player_id,unit_name' });
    }

    setStep('ready');
    onRefreshPlayers();
    toast.success('Вы готовы!');
  };

  const handleStartGame = async () => {
    const readyPlayers = allPlayers.filter(p => p.is_ready);
    if (readyPlayers.length < allPlayers.length) {
      toast.error('Не все игроки готовы');
      return;
    }
    await supabase.from('multiplayer_rooms').update({ status: 'playing', current_round: 1 }).eq('id', room.id);
    toast.success('Игра начинается!');
  };

  const isCreator = room.creator_id === myPlayer.user_id;
  const allReady = allPlayers.length > 0 && allPlayers.every(p => p.is_ready);
  const townHeroes = selectedTown ? HEROES.filter(h => h.townId === selectedTown) : [];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-gold/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-gradient-gold flex items-center gap-2">
              🏰 Комната #{room.room_code}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Игроки: {allPlayers.length}/{room.max_players} | Карта: {room.map_size}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              navigator.clipboard.writeText(room.room_code);
              toast.success('Код скопирован!');
            }} className="text-muted-foreground hover:text-foreground">
              <Copy className="h-4 w-4" />
            </button>
            <button onClick={onLeave} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4">
        {/* Players list */}
        <div className="rounded-xl border border-border bg-gradient-card p-3 space-y-2">
          <h3 className="font-display text-sm font-bold text-foreground uppercase flex items-center gap-2">
            <Users className="h-4 w-4" /> Игроки
          </h3>
          {allPlayers.map(p => (
            <div key={p.id} className={`flex items-center justify-between rounded-lg bg-secondary/50 p-2 ${
              p.user_id === myPlayer.user_id ? 'border border-gold/20' : ''
            }`}>
              <div className="flex items-center gap-2">
                <span className={`font-display text-sm font-bold ${PLAYER_COLORS[p.player_number - 1]}`}>
                  P{p.player_number}
                </span>
                {p.user_id === room.creator_id && <Crown className="h-3 w-3 text-gold" />}
                <span className="text-sm text-foreground">
                  {p.character_name || '...'}
                </span>
                {p.town && (
                  <span className="text-[10px] text-muted-foreground">
                    [{TOWNS.find(t => t.id === p.town)?.name || p.town}]
                  </span>
                )}
              </div>
              {p.is_ready ? (
                <Check className="h-4 w-4 text-emerald" />
              ) : (
                <span className="text-[10px] text-muted-foreground">Не готов</span>
              )}
            </div>
          ))}
        </div>

        {/* Setup steps */}
        {step === 'name' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gold/20 bg-gradient-card p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-gold uppercase">Имя персонажа</h3>
            <input value={charName} onChange={e => setCharName(e.target.value)} maxLength={20}
              placeholder="Введите имя героя"
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground border-none outline-none" />
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSetName}
              disabled={!charName.trim()}
              className="w-full rounded-xl bg-gradient-gold p-3 font-display text-sm font-bold text-primary-foreground disabled:opacity-40 shadow-gold">
              ДАЛЕЕ →
            </motion.button>
          </motion.div>
        )}

        {step === 'town' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gold/20 bg-gradient-card p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-gold uppercase">Выберите город</h3>
            <div className="grid grid-cols-2 gap-2">
              {TOWNS.map(town => (
                <motion.button key={town.id} whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectTown(town.id)}
                  className="rounded-lg bg-secondary/50 p-3 text-left hover:bg-secondary transition-all">
                  <p className="font-display text-sm font-bold text-foreground">{town.name}</p>
                  <p className="text-[10px] text-muted-foreground">{town.alignment === 'good' ? '✨' : town.alignment === 'evil' ? '🔥' : '⚖️'} {town.magicSchool}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'hero' && selectedTown && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gold/20 bg-gradient-card p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-gold uppercase">Выберите героя</h3>
            <div className="space-y-2">
              {townHeroes.map(hero => (
                <motion.button key={hero.id} whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectHero(hero.id)}
                  className="w-full rounded-lg bg-secondary/50 p-3 text-left hover:bg-secondary transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{hero.portrait}</span>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{hero.name}</p>
                      <p className="text-[10px] text-muted-foreground">{hero.class === 'warrior' ? '⚔️ Воин' : '✨ Маг'}</p>
                      <div className="flex gap-2 text-[10px] mt-0.5">
                        <span className="text-crimson flex items-center gap-0.5"><Swords className="h-3 w-3" />{hero.baseAttack}</span>
                        <span className="text-gold flex items-center gap-0.5"><Shield className="h-3 w-3" />{hero.baseDefense}</span>
                        <span className="text-arcane flex items-center gap-0.5"><Sparkles className="h-3 w-3" />{hero.baseSpellpower}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'ready' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald/20 bg-gradient-card p-4 text-center space-y-3">
            <Check className="h-10 w-10 text-emerald mx-auto" />
            <p className="font-display text-sm font-bold text-foreground">Вы готовы!</p>
            <p className="text-xs text-muted-foreground">Ожидание остальных игроков...</p>

            {isCreator && allReady && allPlayers.length >= 1 && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleStartGame}
                className="w-full rounded-xl bg-gradient-crimson p-4 font-display text-sm font-bold text-accent-foreground shadow-crimson">
                ⚔️ НАЧАТЬ ИГРУ!
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerRoom;
