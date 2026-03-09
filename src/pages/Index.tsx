import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import CharacterCreate from './CharacterCreate';
import MainMenu from './MainMenu';

const Index = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="font-display text-2xl text-gradient-gold animate-pulse-gold">БИТВА ГЕРОЕВ</div>
      </div>
    );
  }

  if (!user) return <Auth />;
  if (!profile?.character_created) return <CharacterCreate />;

  return <MainMenu />;
};

export default Index;
