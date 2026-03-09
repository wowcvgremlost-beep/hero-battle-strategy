import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MultiplayerLobby from '@/components/multiplayer/MultiplayerLobby';
import MultiplayerRoom from '@/components/multiplayer/MultiplayerRoom';
import MultiplayerGame from '@/components/multiplayer/MultiplayerGame';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface RoomData {
  id: string;
  room_code: string;
  password: string;
  max_players: number;
  map_size: number;
  creator_id: string;
  status: string;
  current_round: number;
}

export interface PlayerData {
  id: string;
  room_id: string;
  user_id: string;
  player_number: number;
  character_name: string | null;
  town: string | null;
  hero_id: string | null;
  hero_level: number;
  hero_experience: number;
  hero_attack: number;
  hero_defense: number;
  hero_spellpower: number;
  hero_knowledge: number;
  gold: number;
  mana: number;
  health: number;
  map_row: number;
  map_col: number;
  is_ready: boolean;
  has_ended_turn: boolean;
  day: number;
  status: string;
}

const Multiplayer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [myPlayer, setMyPlayer] = useState<PlayerData | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerData[]>([]);

  // Check if user is already in a room
  useEffect(() => {
    if (!user) return;
    const checkExistingRoom = async () => {
      const { data: playerData } = await supabase
        .from('multiplayer_players')
        .select('*, multiplayer_rooms(*)')
        .eq('user_id', user.id)
        .in('status', ['setup', 'playing'])
        .limit(1)
        .single();

      if (playerData) {
        const room = (playerData as any).multiplayer_rooms as RoomData;
        if (room && (room.status === 'waiting' || room.status === 'playing')) {
          setCurrentRoom(room);
          setMyPlayer(playerData as unknown as PlayerData);
          await fetchPlayers(room.id);
        }
      }
    };
    checkExistingRoom();
  }, [user]);

  const fetchPlayers = async (roomId: string) => {
    const { data } = await supabase
      .from('multiplayer_players')
      .select('*')
      .eq('room_id', roomId)
      .order('player_number');
    setAllPlayers((data as PlayerData[]) || []);
    if (user) {
      const me = (data as PlayerData[])?.find(p => p.user_id === user.id);
      if (me) setMyPlayer(me);
    }
  };

  const handleJoinRoom = (room: RoomData, player: PlayerData) => {
    setCurrentRoom(room);
    setMyPlayer(player);
    fetchPlayers(room.id);
  };

  const handleLeaveRoom = async () => {
    if (!user || !currentRoom || !myPlayer) return;

    try {
      const isCreator = currentRoom.creator_id === user.id;

      if (isCreator) {
        // IMPORTANT: fetch remaining players BEFORE deleting our player row,
        // otherwise we lose room membership and RLS will block reading the room players.
        const { data: otherPlayers, error: otherPlayersError } = await supabase
          .from('multiplayer_players')
          .select('id, user_id, player_number')
          .eq('room_id', currentRoom.id)
          .neq('id', myPlayer.id)
          .order('player_number', { ascending: true });

        if (otherPlayersError) throw otherPlayersError;

        if (!otherPlayers || otherPlayers.length === 0) {
          // No one else in the room → keep the room so creator can re-join later
          const { error: leaveError } = await supabase
            .from('multiplayer_players')
            .delete()
            .eq('id', myPlayer.id);
          if (leaveError) throw leaveError;
          toast.success('Вы покинули комнату');
        } else {
          // Transfer creator role to the lowest player_number so the room can continue
          const nextCreatorId = (otherPlayers[0] as any).user_id as string;
          const { error: transferError } = await supabase
            .from('multiplayer_rooms')
            .update({ creator_id: nextCreatorId })
            .eq('id', currentRoom.id);
          if (transferError) throw transferError;

          const { error: leaveError } = await supabase
            .from('multiplayer_players')
            .delete()
            .eq('id', myPlayer.id);
          if (leaveError) throw leaveError;

          toast.success('Вы покинули комнату (создатель передан)');
        }
      } else {
        const { error: leaveError } = await supabase
          .from('multiplayer_players')
          .delete()
          .eq('id', myPlayer.id);
        if (leaveError) throw leaveError;
        toast.success('Вы покинули комнату');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка выхода из комнаты');
    } finally {
      setCurrentRoom(null);
      setMyPlayer(null);
      setAllPlayers([]);
    }
  };

  if (!user) return null;

  // In game
  if (currentRoom?.status === 'playing' && myPlayer?.status === 'playing') {
    return (
      <MultiplayerGame
        room={currentRoom}
        myPlayer={myPlayer}
        allPlayers={allPlayers}
        onLeave={handleLeaveRoom}
        onRefreshPlayers={() => fetchPlayers(currentRoom.id)}
        onUpdatePlayer={setMyPlayer}
        onUpdateRoom={setCurrentRoom}
      />
    );
  }

  // In room (lobby / setup)
  if (currentRoom && myPlayer) {
    return (
      <MultiplayerRoom
        room={currentRoom}
        myPlayer={myPlayer}
        allPlayers={allPlayers}
        onLeave={handleLeaveRoom}
        onRefreshPlayers={() => fetchPlayers(currentRoom.id)}
        onGameStart={(room, player) => {
          setCurrentRoom(room);
          setMyPlayer(player);
          fetchPlayers(room.id);
        }}
      />
    );
  }

  // Lobby - list/create/join rooms
  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-gold/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-gradient-gold">🏰 МУЛЬТИПЛЕЕР</h1>
        </div>
      </div>
      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        <MultiplayerLobby userId={user.id} onJoinRoom={handleJoinRoom} />
      </div>
    </div>
  );
};

export default Multiplayer;
