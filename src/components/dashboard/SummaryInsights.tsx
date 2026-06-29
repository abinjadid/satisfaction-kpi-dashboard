import { motion } from 'framer-motion';
import { Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
import type { Insight } from '@/types';
import { cn } from '@/utils/cn';

const TONE_CONFIG = {
  positive: {
    icon: TrendingUp,
    border: 'border-r-accent',
    iconWrap: 'bg-accent/10 text-accent',
  },
  negative: {
    icon: TrendingDown,
    border: 'border-r-destructive',
    iconWrap: 'bg-destructive/10 text-destructive',
  },
  neutral: {
    icon: Lightbulb,
    border: 'border-r-secondary',
    iconWrap: 'bg-secondary/10 text-secondary',
  },
} as const;

/** شبكة بطاقات الاستنتاجات التلقائية (ملخص المؤشرات). */
export function SummaryInsights({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, i) => {
        const cfg = TONE_CONFIG[insight.tone];
        const Icon = cfg.icon;
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className={cn(
              'print-block flex items-start gap-3 rounded-2xl border border-border border-r-4 bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover',
              cfg.border,
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                cfg.iconWrap,
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-card-foreground">
              {insight.text}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
