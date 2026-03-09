import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, LogIn, Users, Lock, Map, RefreshCw } from 'lucide-react';
import type { RoomData, PlayerData } from '@/pages/Multiplayer';

interface Props {
  userId: string;
  onJoinRoom: (room: RoomData, player: PlayerData) => void;
}

const MAP_SIZES = [
  { value: 20, label: 'Крошечная', desc: '20×20' },
  { value: 50, label: 'Малая', desc: '50×50' },
  { value: 100, label: 'Средняя', desc: '100×100' },
  { value: 200, label: 'Большая', desc: '200×200' },
  { value: 500, label: 'Огромная', desc: '500×500' },
];

function generateRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const MultiplayerLobby = ({ userId, onJoinRoom }: Props) => {
  const [rooms, setRooms] = useState<(RoomData & { player_count: number })[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Create form
  const [password, setPassword] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [mapSize, setMapSize] = useState(50);

  // Join form
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data: roomsData } = await supabase
      .from('multiplayer_rooms')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (roomsData) {
      // player_count is now a column in the table, updated by trigger
      setRooms((roomsData as (RoomData & { player_count: number })[]) || []);
    }
  };

  const handleCreate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      const { data: room, error } = await supabase
        .from('multiplayer_rooms')
        .insert({
          room_code: roomCode,
          password,
          max_players: maxPlayers,
          map_size: mapSize,
          creator_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Join as player 1 - always start fresh (no profile data)
      const spawnPos = getSpawnPosition(0, mapSize);
      const { data: player, error: pError } = await supabase
        .from('multiplayer_players')
        .insert({
          room_id: room.id,
          user_id: userId,
          player_number: 1,
          map_row: spawnPos.row,
          map_col: spawnPos.col,
          character_name: null,
          town: null,
          hero_id: null,
          hero_level: 1,
          hero_experience: 0,
          hero_attack: 1,
          hero_defense: 1,
          hero_spellpower: 1,
          hero_knowledge: 1,
          is_ready: false,
          status: 'setup',
        })
        .select()
        .single();

      if (pError) throw pError;

      toast.success(`Комната #${roomCode} создана!`);
      onJoinRoom(room as RoomData, player as unknown as PlayerData);
    } catch (e: any) {
      toast.error(e.message || 'Ошибка создания комнаты');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (loading || !joinCode) return;
    setLoading(true);
    try {
      const { data: room, error } = await supabase
        .from('multiplayer_rooms')
        .select('*')
        .eq('room_code', joinCode)
        .eq('status', 'waiting')
        .single();

      if (error || !room) {
        toast.error('Комната не найдена или игра уже началась');
        setLoading(false);
        return;
      }

      const roomData = room as RoomData;

      // Check password
      if (roomData.password && roomData.password !== joinPassword) {
        toast.error('Неверный пароль');
        setLoading(false);
        return;
      }

      // Check max players
      const { count } = await supabase
        .from('multiplayer_players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomData.id);

      if ((count || 0) >= roomData.max_players) {
        toast.error('Комната заполнена');
        setLoading(false);
        return;
      }

      // Get next player number
      const { data: existingPlayers } = await supabase
        .from('multiplayer_players')
        .select('player_number')
        .eq('room_id', roomData.id)
        .order('player_number');

      const usedNumbers = new Set((existingPlayers || []).map((p: any) => p.player_number));
      let playerNumber = 1;
      while (usedNumbers.has(playerNumber)) playerNumber++;

      // Join as new player - always start fresh (no profile data)
      const spawnPos = getSpawnPosition(playerNumber - 1, roomData.map_size);
      const { data: player, error: pError } = await supabase
        .from('multiplayer_players')
        .insert({
          room_id: roomData.id,
          user_id: userId,
          player_number: playerNumber,
          map_row: spawnPos.row,
          map_col: spawnPos.col,
          character_name: null,
          town: null,
          hero_id: null,
          hero_level: 1,
          hero_experience: 0,
          hero_attack: 1,
          hero_defense: 1,
          hero_spellpower: 1,
          hero_knowledge: 1,
          is_ready: false,
          status: 'setup',
        })
        .select()
        .single();

      if (pError) {
        if (pError.message?.includes('unique')) {
          // Already in room - fetch existing player
          const { data: existingPlayer } = await supabase
            .from('multiplayer_players')
            .select('*')
            .eq('room_id', roomData.id)
            .eq('user_id', userId)
            .single();
          if (existingPlayer) {
            onJoinRoom(roomData, existingPlayer as unknown as PlayerData);
            return;
          }
        }
        throw pError;
      }

      toast.success(`Вы вошли в комнату #${joinCode}`);
      onJoinRoom(roomData, player as unknown as PlayerData);
    } catch (e: any) {
      toast.error(e.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowCreate(true); setShowJoin(false); }}
          className="flex-1 rounded-xl bg-gradient-gold p-3 font-display text-sm font-bold text-primary-foreground flex items-center justify-center gap-2 shadow-gold">
          <Plus className="h-4 w-4" /> СОЗДАТЬ
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowJoin(true); setShowCreate(false); }}
          className="flex-1 rounded-xl bg-gradient-crimson p-3 font-display text-sm font-bold text-accent-foreground flex items-center justify-center gap-2 shadow-crimson">
          <LogIn className="h-4 w-4" /> ВОЙТИ
        </motion.button>
      </div>

      {/* Create room form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gold/20 bg-gradient-card p-4 space-y-3">
          <h3 className="font-display text-sm font-bold text-gold uppercase">Создать комнату</h3>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Пароль (необязательно)</label>
            <input value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Оставьте пустым для открытой комнаты"
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground border-none outline-none mt-1" />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Макс. игроков</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setMaxPlayers(n)}
                  className={`flex-1 rounded-lg py-2 text-sm font-display font-bold transition-all ${
                    maxPlayers === n ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-secondary text-muted-foreground'
                  }`}>{n}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Размер карты</label>
            <div className="flex gap-1 mt-1 flex-wrap">
              {MAP_SIZES.map(ms => (
                <button key={ms.value} onClick={() => setMapSize(ms.value)}
                  className={`rounded-lg px-3 py-2 text-[10px] font-display font-bold transition-all ${
                    mapSize === ms.value ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-secondary text-muted-foreground'
                  }`}>
                  {ms.label}
                </button>
              ))}
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={loading}
            className="w-full rounded-xl bg-gradient-gold p-3 font-display text-sm font-bold text-primary-foreground disabled:opacity-40 shadow-gold">
            {loading ? 'Создание...' : '🏰 СОЗДАТЬ КОМНАТУ'}
          </motion.button>
        </motion.div>
      )}

      {/* Join room form */}
      {showJoin && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-crimson/20 bg-gradient-card p-4 space-y-3">
          <h3 className="font-display text-sm font-bold text-crimson uppercase">Войти в комнату</h3>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Код комнаты (4 цифры)</label>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234" maxLength={4}
              className="w-full rounded-lg bg-secondary px-3 py-2 text-lg font-display font-bold text-center text-foreground tracking-widest border-none outline-none mt-1" />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Пароль</label>
            <input value={joinPassword} onChange={e => setJoinPassword(e.target.value)}
              placeholder="Если требуется"
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground border-none outline-none mt-1" />
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleJoin} disabled={loading || joinCode.length !== 4}
            className="w-full rounded-xl bg-gradient-crimson p-3 font-display text-sm font-bold text-accent-foreground disabled:opacity-40 shadow-crimson">
            {loading ? 'Вход...' : '🚪 ВОЙТИ'}
          </motion.button>
        </motion.div>
      )}

      {/* Available rooms */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-foreground uppercase">Открытые комнаты</h3>
          <button onClick={fetchRooms} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Нет открытых комнат. Создайте первую!</p>
        ) : rooms.map(room => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-gradient-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-gold">#{room.room_code}</span>
                  {room.password && <Lock className="h-3 w-3 text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {room.player_count}/{room.max_players}</span>
                  <span className="flex items-center gap-1"><Map className="h-3 w-3" /> {MAP_SIZES.find(m => m.value === room.map_size)?.label || room.map_size}</span>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { setJoinCode(room.room_code); setShowJoin(true); setShowCreate(false); }}
                disabled={room.player_count >= room.max_players}
                className="rounded-lg bg-gradient-crimson px-4 py-2 font-display text-xs font-bold text-accent-foreground disabled:opacity-40">
                ВОЙТИ
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Spawn positions distributed around the map
function getSpawnPosition(playerIndex: number, mapSize: number): { row: number; col: number } {
  const radius = Math.floor(mapSize * 0.35);
  const angle = (playerIndex * Math.PI * 2) / 6; // 6 positions evenly spaced
  return {
    row: Math.floor(Math.cos(angle) * radius),
    col: Math.floor(Math.sin(angle) * radius),
  };
}

export default MultiplayerLobby;
