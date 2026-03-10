import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
        platform: string;
      };
    };
  }
}

export const isTelegramWebApp = (): boolean => {
  return !!(window.Telegram?.WebApp?.initData && window.Telegram.WebApp.initData.length > 0);
};

export const useTelegramWebApp = () => {
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData && tg.initData.length > 0) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();
    }
    setIsReady(true);
  }, []);

  return {
    isReady,
    isTelegram,
    webApp: window.Telegram?.WebApp || null,
    initData: window.Telegram?.WebApp?.initData || '',
    user: window.Telegram?.WebApp?.initDataUnsafe?.user || null,
  };
};
