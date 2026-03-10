import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Users, LogOut } from 'lucide-react';

const MainMenu = () => {
  const navigate = useNavigate();
  const { profile, signOut, isTelegram } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-4xl font-black text-gradient-gold tracking-wider">
          БИТВА ГЕРОЕВ
        </h1>
        {profile?.character_name && (
          <p className="text-muted-foreground mt-2 font-display text-sm">
            Герой: <span className="text-gold font-bold">{profile.character_name}</span>
          </p>
        )}
      </motion.div>

      <div className="w-full max-w-xs space-y-4">
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/game')}
          className="w-full rounded-xl bg-gradient-gold p-5 shadow-gold flex items-center justify-center gap-3"
        >
          <Globe className="h-6 w-6 text-primary-foreground" />
          <span className="font-display text-xl font-black text-primary-foreground">ОНЛАЙН</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/multiplayer')}
          className="w-full rounded-xl bg-gradient-crimson p-5 shadow-crimson flex items-center justify-center gap-3"
        >
          <Users className="h-6 w-6 text-accent-foreground" />
          <span className="font-display text-xl font-black text-accent-foreground">МУЛЬТИПЛЕЕР</span>
        </motion.button>
      </div>

      {!isTelegram && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={signOut}
          className="mt-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Выйти</span>
        </motion.button>
      )}
    </div>
  );
};

export default MainMenu;
