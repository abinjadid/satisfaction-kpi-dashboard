import { useCountUp } from '@/hooks/useCountUp';

interface ProgressRingProps {
  /** القيمة من 0 إلى 100 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  showValue?: boolean;
}

/** حلقة تقدّم دائرية (Progress Ring) مع عدّاد متحرّك. */
export function ProgressRing({
  value,
  size = 96,
  stroke = 9,
  color = '#006C35',
  showValue = true,
}: ProgressRingProps) {
  const animated = useCountUp(value, 1100);
  const clamped = Math.max(0, Math.min(100, animated));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showValue && (
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-extrabold"
          style={{ color }}
        >
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
