import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  error?: string;
}

/** مُدخل تقييم من 1 إلى 5 باستخدام نجوم قابلة للنقر مع دعم لوحة المفاتيح. */
export function RatingInput({
  value,
  onChange,
  label,
  error,
}: RatingInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {value > 0 ? `${value} / 5` : '—'}
        </span>
      </div>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} من 5`}
            onClick={() => onChange(star)}
            className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-muted-foreground/40',
              )}
            />
          </button>
        ))}
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
