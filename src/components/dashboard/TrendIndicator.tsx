import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { KpiMetric } from '@/types';
import { cn } from '@/utils/cn';

interface TrendIndicatorProps {
  metric: KpiMetric;
  suffix?: string;
  /** اعتبار الانخفاض إيجابياً (مثل زمن الاستجابة) */
  invert?: boolean;
}

/** مؤشر اتجاه (↑↓) يعرض مقدار التغيّر مقارنة بالشهر السابق. */
export function TrendIndicator({
  metric,
  suffix = '%',
  invert = false,
}: TrendIndicatorProps) {
  const { trend, delta } = metric;

  if (trend === 'flat') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <Minus className="h-3 w-3" />
        مستقر
      </span>
    );
  }

  const isGood = invert ? trend === 'down' : trend === 'up';
  const Icon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
        isGood
          ? 'bg-accent/10 text-accent'
          : 'bg-destructive/10 text-destructive',
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(delta).toFixed(1)}
      {suffix}
    </span>
  );
}
