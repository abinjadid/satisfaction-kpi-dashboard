import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/services/storageService';

type Theme = 'light' | 'dark';

/** إدارة الوضع الليلي/النهاري مع الحفظ في التخزين المحلي واحترام تفضيل النظام. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = storage.get<Theme | null>('theme', null);
    if (saved) return saved;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    storage.set('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
