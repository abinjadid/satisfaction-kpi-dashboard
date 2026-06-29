import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyPoint } from '@/types';
import { BRAND } from '@/utils/constants';
import { ChartTooltip } from './ChartTooltip';

/** مخطط أعمدة لعدد الاستجابات حسب الشهر. */
export function ResponsesBarChart({ data }: { data: MonthlyPoint[] }) {
  const max = Math.max(...data.map((d) => d.responses), 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND.accent} />
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
          allowDecimals={false}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          orientation="right"
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
          content={<ChartTooltip />}
        />
        <Bar
          name="عدد الاستجابات"
          dataKey="responses"
          radius={[6, 6, 0, 0]}
          animationDuration={1000}
        >
          {data.map((d) => (
            <Cell
              key={d.index}
              fill={d.responses === max ? 'url(#bar-grad)' : BRAND.secondary}
              fillOpacity={d.responses === max ? 1 : 0.55}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
