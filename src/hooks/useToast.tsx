import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<
  ToastTone,
  { icon: typeof CheckCircle2; ring: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    ring: 'border-r-4 border-r-primary',
    iconColor: 'text-primary',
  },
  error: {
    icon: AlertTriangle,
    ring: 'border-r-4 border-r-destructive',
    iconColor: 'text-destructive',
  },
  info: {
    icon: Info,
    ring: 'border-r-4 border-r-secondary',
    iconColor: 'text-secondary',
  },
};

/** مزوّد التنبيهات: يلفّ التطبيق ويعرض التنبيهات في الزاوية. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { ...t, id }]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 left-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-3 no-print">
        <AnimatePresence>
          {toasts.map((t) => {
            const cfg = TONE_STYLES[t.tone];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'flex items-start gap-3 rounded-xl border bg-card p-4 shadow-card-hover',
                  cfg.ring,
                )}
                role="status"
              >
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', cfg.iconColor)} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-card-foreground">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="إغلاق التنبيه"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** الوصول إلى دالة عرض التنبيهات. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast يجب استخدامه داخل ToastProvider');
  }
  return ctx;
}
