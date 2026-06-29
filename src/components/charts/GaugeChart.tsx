import { useMemo } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { BRAND } from '@/utils/constants';

interface GaugeChartProps {
  /** القيمة من 0 إلى 100 */
  value: number;
  size?: number;
  label?: string;
}

/**
 * مقياس نصف دائري (Gauge) مرسوم بـ SVG لإظهار نسبة الرضا العام.
 * يستخدم تدرّجاً لونياً وعدّاداً متحركاً ومؤشّراً متحركاً.
 */
export function GaugeChart({
  value,
  size = 240,
  label = 'مؤشر الرضا العام',
}: GaugeChartProps) {
  const animated = useCountUp(value, 1200);
  const clamped = Math.max(0, Math.min(100, animated));

  const geometry = useMemo(() => {
    const stroke = 20;
    const radius = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;
    // نصف دائرة علوية: من 180° إلى 0°.
    const startAngle = Math.PI;
    const endAngle = 0;
    const angle = startAngle + (endAngle - startAngle) * (clamped / 100);

    const polar = (a: number) => ({
      x: cx + radius * Math.cos(a),
      y: cy - radius * Math.sin(a),
    });

    const start = polar(startAngle);
    const end = polar(angle);
    const full = polar(endAngle);

    const arc = (from: { x: number; y: number }, to: { x: number; y: number }) =>
      `M ${from.x} ${from.y} A ${radius} ${radius} 0 0 1 ${to.x} ${to.y}`;

    return {
      stroke,
      radius,
      cx,
      cy,
      track: arc(start, full),
      progress: arc(start, end),
      needle: end,
    };
  }, [clamped, size]);

  const color =
    clamped >= 85 ? BRAND.primary : clamped >= 70 ? BRAND.accent : BRAND.amber;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 28}
        viewBox={`0 0 ${size} ${size / 2 + 28}`}
        role="img"
        aria-label={`${label}: ${Math.round(clamped)}%`}
      >
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BRAND.secondary} />
            <stop offset="50%" stopColor={BRAND.accent} />
            <stop offset="100%" stopColor={BRAND.primary} />
          </linearGradient>
        </defs>
        {/* المسار الخلفي */}
        <path
          d={geometry.track}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={geometry.stroke}
          strokeLinecap="round"
        />
        {/* مسار التقدّم */}
        <path
          d={geometry.progress}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={geometry.stroke}
          strokeLinecap="round"
        />
        {/* مؤشّر النهاية */}
        <circle
          cx={geometry.needle.x}
          cy={geometry.needle.y}
          r={geometry.stroke / 2 + 3}
          fill="hsl(var(--card))"
          stroke={color}
          strokeWidth={3}
        />
      </svg>
      <div className="-mt-12 flex flex-col items-center">
        <span className="text-5xl font-extrabold tracking-tight" style={{ color }}>
          {Math.round(clamped)}%
        </span>
        <span className="mt-1 text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
