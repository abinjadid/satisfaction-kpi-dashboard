import { Award, TrendingDown } from 'lucide-react';
import type { ContributionAreaScore } from '@/types';
import { BRAND } from '@/utils/constants';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

interface ServiceListProps {
  areas: ContributionAreaScore[];
  variant: 'top' | 'bottom';
}

/** قائمة مجالات المساهمة الأعلى/الأدنى أداءً مع أشرطة تقدّم. */
export function ServicePerformance({ areas, variant }: ServiceListProps) {
  const isTop = variant === 'top';
  const color = isTop ? BRAND.primary : BRAND.red;

  return (
    <ul className="flex flex-col gap-3">
      {areas.map((s, i) => (
        <li key={s.area} className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
              isTop
                ? 'bg-primary/10 text-primary'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-card-foreground">
                {s.area}
              </span>
              <span className="shrink-0 text-sm font-bold" style={{ color }}>
                {s.percentage}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.percentage}%`, background: color }}
              />
            </div>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              {formatNumber(s.responses)} استجابة · متوسط {s.average.toFixed(2)}
            </span>
          </div>
          {isTop ? (
            i === 0 && <Award className="h-4 w-4 shrink-0 text-amber-500" />
          ) : (
            i === 0 && (
              <TrendingDown className="h-4 w-4 shrink-0 text-destructive" />
            )
          )}
        </li>
      ))}
    </ul>
  );
}
