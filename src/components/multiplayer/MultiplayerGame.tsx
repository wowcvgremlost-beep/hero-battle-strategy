import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TOWNS, type TownId } from '@/data/towns';
import { HEROES } from '@/data/heroes';
import { getTileAt, getVisibleTiles, getReachableTiles, type MapTile } from '@/data/mapTiles';
import { getScaledMonsterPower, getScaledRewards } from '@/data/quests';
import { getSkillBonuses } from '@/data/skills';
import { Shield, Swords, Sparkles, Coins, Dice6, LogOut, MessageSquare, ArrowLeftRight, Users, Crown, Send } from 'lucide-react';
import type { RoomData, PlayerData } from '@/pages/Multiplayer';
import HexMap from '@/components/game/HexMap';
import DiceRoller from '@/components/game/DiceRoller';
import BattleSystem from '@/components/game/BattleSystem';

type MPTab = 'map' | 'chat' | 'players';

interface ChatMessage {
  id: string;
  user_id: string;
  player_name: string | null;
  message: string;
  created_at: string;
}

interface ArmyUnit {
  id: string;
  unit_name: string;
  count: number;
}

interface Props {
  room: RoomData;
  myPlayer: PlayerData;
  allPlayers: PlayerData[];
  onLeave: () => void;
  onRefreshPlayers: () => void;
  onUpdatePlayer: (p: PlayerData) => void;
  onUpdateRoom: (r: RoomData) => void;
}

const PLAYER_COLORS_HEX = ['hsl(45 90% 55%)', 'hsl(0 70% 50%)', 'hsl(280 60% 55%)', 'hsl(140 45% 55%)', 'hsl(210 65% 55%)', 'hsl(330 60% 55%)'];

const MultiplayerGame = ({ room, myPlayer, allPlayers, onLeave, onRefreshPlayers, onUpdatePlayer, onUpdateRoom }: Props) => {
  const [tab, setTab] = useState<MPTab>('map');
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [diceUsed, setDiceUsed] = useState(myPlayer.has_ended_turn);

  // Reset dice when turn resets (new round)
  useEffect(() => {
    if (!myPlayer.has_ended_turn) {
      setDiceUsed(false);
      setDiceRoll(null);
    }
  }, [myPlayer.has_ended_turn]);
  const [battleData, setBattleData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [defeatedTiles, setDefeatedTiles] = useState<Set<string>>(new Set());
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(() => {
    const visible = getVisibleTiles(myPlayer.map_row, myPlayer.map_col, 4);
    return visible;
  });
  const [myArmy, setMyArmy] = useState<ArmyUnit[]>([]);

  const town = TOWNS.find(t => t.id === myPlayer.town);
  const hero = HEROES.find(h => h.id === myPlayer.hero_id);

  // Fetch army
  useEffect(() => {
    fetchArmy();
  }, [myPlayer.id]);

  const fetchArmy = async () => {
    const { data } = await supabase.from('multiplayer_army').select('id, unit_name, count').eq('player_id', myPlayer.id);
    setMyArmy((data as ArmyUnit[]) || []);
  };

  // Fetch defeated tiles
  useEffect(() => {
    const fetchDefeated = async () => {
      const { data } = await supabase.from('multiplayer_defeated_tiles').select('tile_key').eq('room_id', room.id);
      if (data) setDefeatedTiles(new Set(data.map(d => d.tile_key)));
    };
    fetchDefeated();
  }, [room.id]);

  // Fetch chat
  useEffect(() => {
    const fetchChat = async () => {
      const { data } = await supabase.from('multiplayer_chat').select('*').eq('room_id', room.id).order('created_at', { ascending: true }).limit(100);
      setChatMessages((data as ChatMessage[]) || []);
    };
    fetchChat();
  }, [room.id]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase.channel(`mp-game-${room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplayer_players', filter: `room_id=eq.${room.id}` }, () => {
        onRefreshPlayers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplayer_rooms', filter: `id=eq.${room.id}` }, async () => {
        const { data } = await supabase.from('multiplayer_rooms').select('*').eq('id', room.id).single();
        if (data) onUpdateRoom(data as unknown as RoomData);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'multiplayer_chat', filter: `room_id=eq.${room.id}` }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'multiplayer_defeated_tiles', filter: `room_id=eq.${room.id}` }, (payload) => {
        setDefeatedTiles(prev => new Set([...prev, (payload.new as any).tile_key]));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [room.id]);

  // Check if all players ended turn → advance round
  useEffect(() => {
    const checkRoundEnd = async () => {
      const activePlayers = allPlayers.filter(p => p.status === 'playing');
      if (activePlayers.length > 0 && activePlayers.every(p => p.has_ended_turn)) {
        if (room.creator_id === myPlayer.user_id) {
          // Creator advances the round
          const newRound = room.current_round + 1;
          await supabase.from('multiplayer_rooms').update({ current_round: newRound }).eq('id', room.id);
          // Reset all players' turn flags
          for (const p of activePlayers) {
            await supabase.from('multiplayer_players').update({
              has_ended_turn: false,
              day: p.day + 1,
            }).eq('id', p.id);
          }
          toast.info(`🔄 Раунд ${newRound}!`);
        }
      }
    };
    checkRoundEnd();
  }, [allPlayers]);

  const updateMyPlayer = async (updates: Partial<PlayerData>) => {
    await supabase.from('multiplayer_players').update(updates).eq('id', myPlayer.id);
    onUpdatePlayer({ ...myPlayer, ...updates });
  };

  const handleDiceRoll = (value: number) => {
    setDiceRoll(value);
    setDiceUsed(true);
  };

  const handleMove = async (row: number, col: number) => {
    const tile = getTileAt(row, col);
    if (!tile) return;

    await updateMyPlayer({ map_row: row, map_col: col });
    setDiceRoll(null);

    const visible = getVisibleTiles(row, col, 4);
    setRevealedTiles(prev => {
      const next = new Set(prev);
      visible.forEach(key => next.add(key));
      return next;
    });

    const tileKey = `${row},${col}`;

    if (tile.category === 'combat' && tile.monsterPower && !defeatedTiles.has(tileKey)) {
      const scaledPower = getScaledMonsterPower(tile.monsterPower, Math.ceil(room.current_round / 7));
      const { gold, exp } = getScaledRewards(tile.goldReward || 0, tile.expReward || 0, Math.ceil(room.current_round / 7));
      setBattleData({
        monsterPower: scaledPower,
        monsterName: `${tile.name} [☠${tile.difficulty || '?'}]`,
        goldReward: gold,
        expReward: exp,
      });
    } else if ((tile.type === 'treasure' || tile.type === 'mine') && tile.goldReward && !defeatedTiles.has(tileKey)) {
      const newGold = myPlayer.gold + tile.goldReward;
      await updateMyPlayer({ gold: newGold });
      await supabase.from('multiplayer_defeated_tiles').insert({ room_id: room.id, tile_key: tileKey, killed_by: myPlayer.user_id });
      toast.success(`Найдено: ${tile.goldReward} золота!`);
    }
  };

  const handleBattleVictory = async () => {
    const tileKey = `${myPlayer.map_row},${myPlayer.map_col}`;
    await supabase.from('multiplayer_defeated_tiles').insert({ room_id: room.id, tile_key: tileKey, killed_by: myPlayer.user_id });
    // Refresh player data (gold/exp were updated by BattleSystem through AuthContext... but in MP we need manual)
    if (battleData) {
      await updateMyPlayer({
        gold: myPlayer.gold + battleData.goldReward,
        hero_experience: myPlayer.hero_experience + battleData.expReward,
      });
    }
    setBattleData(null);
  };

  const handleEndTurn = async () => {
    await updateMyPlayer({ has_ended_turn: true });
    setDiceRoll(null);
    setDiceUsed(true);
    toast.info('Ход завершён. Ожидание других игроков...');
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    await supabase.from('multiplayer_chat').insert({
      room_id: room.id,
      user_id: myPlayer.user_id,
      player_name: myPlayer.character_name,
      message: chatInput.trim(),
    });
    setChatInput('');
  };

  const isMyTurn = !myPlayer.has_ended_turn;
  const waitingForPlayers = allPlayers.filter(p => p.status === 'playing' && !p.has_ended_turn);

  // Convert allPlayers to format HexMap expects for otherPlayers display
  const playerRow = myPlayer.map_row;
  const playerCol = myPlayer.map_col;

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-gold/10 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hero && <span className="text-lg">{hero.portrait}</span>}
            <div>
              <span className="font-display text-sm font-bold text-foreground">{myPlayer.character_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">#{room.room_code}</span>
                <span className="text-[10px] text-gold">Раунд {room.current_round}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-gold" />
              <span className="text-xs font-bold text-gold">{myPlayer.gold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-arcane" />
              <span className="text-xs font-bold text-arcane">{myPlayer.mana}</span>
            </div>
            <button onClick={onLeave} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Swords className="h-3 w-3 text-crimson" />
            <span className="text-[10px] text-foreground">{myPlayer.hero_attack}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-gold" />
            <span className="text-[10px] text-foreground">{myPlayer.hero_defense}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-arcane" />
            <span className="text-[10px] text-foreground">{myPlayer.hero_spellpower}</span>
          </div>
          {!isMyTurn && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              ⏳ Ожидание: {waitingForPlayers.map(p => p.character_name || `P${p.player_number}`).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        <div className="flex gap-1 mb-4">
          {([
            { id: 'map' as MPTab, icon: Dice6, label: 'КАРТА' },
            { id: 'chat' as MPTab, icon: MessageSquare, label: 'ЧАТ' },
            { id: 'players' as MPTab, icon: Users, label: 'ИГРОКИ' },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2.5 font-display text-xs font-bold transition-all ${
                tab === t.id ? 'bg-gradient-crimson text-accent-foreground shadow-crimson' : 'bg-secondary text-muted-foreground'
              }`}>
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Map tab */}
        {tab === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <HexMap
              diceRoll={isMyTurn ? diceRoll : null}
              onTileSelect={() => {}}
              onMove={handleMove}
              revealedTiles={revealedTiles}
              playerRow={playerRow}
              playerCol={playerCol}
              defeatedTiles={defeatedTiles}
            />

            {isMyTurn && (
              <>
                <DiceRoller onRoll={handleDiceRoll} disabled={diceUsed} logisticsBonus={0} />
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleEndTurn}
                  className="w-full rounded-xl bg-gradient-gold p-3 shadow-gold font-display text-sm font-bold text-primary-foreground flex items-center justify-center gap-2">
                  <Dice6 className="h-4 w-4" />
                  ЗАВЕРШИТЬ ХОД
                </motion.button>
              </>
            )}

            {!isMyTurn && (
              <div className="rounded-xl border border-border bg-gradient-card p-4 text-center">
                <p className="text-sm text-muted-foreground">⏳ Ожидание завершения хода...</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {waitingForPlayers.map(p => p.character_name || `P${p.player_number}`).join(', ')}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Chat tab */}
        {tab === 'chat' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="rounded-xl border border-border bg-gradient-card p-3 max-h-[60vh] overflow-y-auto space-y-1">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Нет сообщений</p>
              ) : chatMessages.map(msg => {
                const isMe = msg.user_id === myPlayer.user_id;
                return (
                  <div key={msg.id} className={`text-xs ${isMe ? 'text-right' : 'text-left'}`}>
                    <span className={`font-bold ${isMe ? 'text-gold' : 'text-crimson'}`}>
                      {msg.player_name || 'Игрок'}:
                    </span>{' '}
                    <span className="text-foreground">{msg.message}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Сообщение..."
                className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground border-none outline-none" />
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleSendChat}
                disabled={!chatInput.trim()}
                className="rounded-lg bg-gradient-gold px-3 py-2 text-primary-foreground disabled:opacity-40">
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Players tab */}
        {tab === 'players' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {allPlayers.map(p => {
              const pTown = TOWNS.find(t => t.id === p.town);
              const pHero = HEROES.find(h => h.id === p.hero_id);
              const isMe = p.user_id === myPlayer.user_id;
              return (
                <div key={p.id} className={`rounded-xl border p-3 ${
                  isMe ? 'border-gold/20 bg-gold/5' : 'border-border bg-gradient-card'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pHero && <span className="text-xl">{pHero.portrait}</span>}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-display text-sm font-bold text-foreground">{p.character_name}</span>
                          {p.user_id === room.creator_id && <Crown className="h-3 w-3 text-gold" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{pTown?.name} | Ур. {p.hero_level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-gold" />
                        <span className="text-xs font-bold text-gold">{p.gold.toLocaleString()}</span>
                      </div>
                      <span className={`text-[10px] ${p.has_ended_turn ? 'text-emerald' : 'text-crimson'}`}>
                        {p.has_ended_turn ? '✅ Готов' : '⏳ Ходит'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px]">
                    <span className="text-crimson">⚔️{p.hero_attack}</span>
                    <span className="text-gold">🛡️{p.hero_defense}</span>
                    <span className="text-arcane">✨{p.hero_spellpower}</span>
                    <span className="text-emerald">📖{p.hero_knowledge}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Battle modal - using simplified version for MP */}
      {battleData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="w-full max-w-md rounded-xl border border-crimson/30 bg-gradient-card p-6 shadow-crimson space-y-4">
            <h2 className="font-display text-xl font-bold text-gradient-gold flex items-center gap-2">
              <Swords className="h-5 w-5 text-crimson" />
              {battleData.monsterName}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Ваша сила</p>
                <p className="font-display font-bold text-gold">{myPlayer.hero_attack * 5 + myPlayer.hero_defense * 5}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] text-muted-foreground uppercase">Враг</p>
                <p className="font-display font-bold text-crimson">{battleData.monsterPower}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Награда: {battleData.goldReward}💰 {battleData.expReward}✨
            </p>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
                // Simple win/lose calculation
                const power = myPlayer.hero_attack * 10 + myPlayer.hero_defense * 5 + myArmy.reduce((s, u) => s + u.count * 5, 0);
                if (power >= battleData.monsterPower * 0.7) {
                  handleBattleVictory();
                  toast.success(`🏆 ПОБЕДА! +${battleData.goldReward}💰 +${battleData.expReward}✨`);
                } else {
                  setBattleData(null);
                  toast.error('💀 ПОРАЖЕНИЕ! Ваша армия слишком слаба.');
                }
              }}
                className="flex-1 rounded-xl bg-gradient-crimson p-3 font-display text-sm font-bold text-accent-foreground shadow-crimson">
                ⚔️ АТАКОВАТЬ
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setBattleData(null)}
                className="flex-1 rounded-xl bg-secondary p-3 font-display text-sm font-bold text-muted-foreground">
                ОТСТУПИТЬ
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MultiplayerGame;
