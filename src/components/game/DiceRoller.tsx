import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice6 } from 'lucide-react';

interface DiceRollerProps {
  onRoll: (value: number) => void;
  disabled?: boolean;
}

const DiceRoller = ({ onRoll, disabled }: DiceRollerProps) => {
  const [manualInput, setManualInput] = useState('');
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const handleManualSubmit = () => {
    const value = parseInt(manualInput);
    if (value >= 1 && value <= 6) {
      setLastRoll(value);
      onRoll(value);
      setManualInput('');
    }
  };

  const handleAutoRoll = () => {
    if (rolling) return;
    setRolling(true);
    
    // Animate through values
    let count = 0;
    const interval = setInterval(() => {
      setLastRoll(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setLastRoll(finalValue);
        onRoll(finalValue);
        setRolling(false);
      }
    }, 80);
  };

  return (
    <div className="rounded-xl border border-gold/20 bg-gradient-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Dice6 className="h-5 w-5 text-gold" />
        <h3 className="font-display text-sm font-bold text-foreground">БРОСОК КУБИКА (d6)</h3>
      </div>

      <div className="flex items-center gap-3">
        {/* Manual input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="6"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="1-6"
            disabled={disabled}
            className="w-14 rounded-lg border border-border bg-secondary px-2 py-2 text-center text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleManualSubmit}
            disabled={disabled || !manualInput}
            className="rounded-lg bg-gradient-gold px-3 py-2 font-display text-xs font-bold text-primary-foreground disabled:opacity-40"
          >
            ОК
          </motion.button>
        </div>

        <span className="text-muted-foreground text-xs">или</span>

        {/* Auto roll */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAutoRoll}
          disabled={disabled || rolling}
          className="flex-1 rounded-lg bg-gradient-crimson px-4 py-2 font-display text-xs font-bold text-accent-foreground disabled:opacity-40"
        >
          {rolling ? 'КРУТИТСЯ...' : 'БРОСИТЬ'}
        </motion.button>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {lastRoll !== null && (
          <motion.div
            key={lastRoll}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="mt-3 flex justify-center"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <span className="font-display text-2xl font-black text-primary-foreground">{lastRoll}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiceRoller;
