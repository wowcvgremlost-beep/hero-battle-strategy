import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import CharacterCreate from './CharacterCreate';
import Game from './Game';

const Index = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="font-display text-2xl text-gradient-gold animate-pulse-gold">БИТВА ГЕРОЕВ</div>
      </div>
    );
  }

  // Not logged in
  if (!user) return <Auth />;

  // Logged in but no character
  if (!profile?.character_created) return <CharacterCreate />;

  // Has character
  return <Game />;
};

export default Index;
