import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyPoint } from '@/types';
import { BRAND } from '@/utils/constants';
import { ChartTooltip } from './ChartTooltip';

/** مخطط خطي يوضّح تطوّر مؤشر الرضا عبر الأشهر. */
export function SatisfactionLineChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BRAND.secondary} />
            <stop offset="100%" stopColor={BRAND.primary} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          reversed
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          orientation="right"
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<ChartTooltip unit="%" />} />
        <Line
          name="مؤشر الرضا"
          type="monotone"
          dataKey="satisfaction"
          stroke="url(#line-grad)"
          strokeWidth={3}
          dot={{ r: 3, fill: BRAND.primary, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: BRAND.primary }}
          animationDuration={1100}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
