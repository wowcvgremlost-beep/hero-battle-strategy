import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Письмо для сброса пароля отправлено!');
        setMode('login');
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Регистрация успешна! Проверьте почту для подтверждения.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-black text-gradient-gold tracking-wider">
            БИТВА
          </h1>
          <h2 className="font-display text-2xl font-bold text-foreground -mt-1 tracking-widest">
            ГЕРОЕВ
          </h2>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-gold/10 bg-gradient-card p-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 text-center">
            {mode === 'login' && 'ВХОД'}
            {mode === 'register' && 'РЕГИСТРАЦИЯ'}
            {mode === 'forgot' && 'ВОССТАНОВЛЕНИЕ'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-border bg-secondary pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-gold py-3 font-display font-bold text-primary-foreground shadow-gold disabled:opacity-50"
            >
              {loading
                ? '...'
                : mode === 'login'
                ? 'ВОЙТИ'
                : mode === 'register'
                ? 'СОЗДАТЬ АККАУНТ'
                : 'ОТПРАВИТЬ ПИСЬМО'}
            </motion.button>
          </form>

          {/* Links */}
          <div className="mt-4 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  Забыли пароль?
                </button>
                <div>
                  <span className="text-xs text-muted-foreground">Нет аккаунта? </span>
                  <button
                    onClick={() => setMode('register')}
                    className="text-xs text-gold hover:text-gold-light transition-colors font-semibold"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </>
            )}
            {mode === 'register' && (
              <div>
                <span className="text-xs text-muted-foreground">Уже есть аккаунт? </span>
                <button
                  onClick={() => setMode('login')}
                  className="text-xs text-gold hover:text-gold-light transition-colors font-semibold"
                >
                  Войти
                </button>
              </div>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-xs text-gold hover:text-gold-light transition-colors font-semibold"
              >
                Назад ко входу
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
