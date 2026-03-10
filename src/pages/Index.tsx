import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import CharacterCreate from './CharacterCreate';
import MainMenu from './MainMenu';

const Index = () => {
  const { user, profile, loading, isTelegram } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="font-display text-2xl text-gradient-gold animate-pulse-gold">
          {isTelegram ? '⚔️ Загрузка...' : 'БИТВА ГЕРОЕВ'}
        </div>
      </div>
    );
  }

  // In Telegram, skip Auth page (auto-authenticated)
  if (!user && !isTelegram) return <Auth />;
  
  // If Telegram auth failed, show error
  if (!user && isTelegram) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
        <div className="text-center">
          <div className="font-display text-2xl text-gradient-gold mb-4">БИТВА ГЕРОЕВ</div>
          <p className="text-muted-foreground text-sm">Ошибка авторизации через Telegram. Попробуйте перезапустить приложение.</p>
        </div>
      </div>
    );
  }

  if (!profile?.character_created) return <CharacterCreate />;

  return <MainMenu />;
};

export default Index;
