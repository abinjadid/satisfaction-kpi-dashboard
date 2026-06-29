import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ServiceScore } from '@/types';
import { BRAND } from '@/utils/constants';
import { ChartTooltip } from './ChartTooltip';

/** تسمية القيمة المرسومة عند طرف العمود مع تثبيت اتجاه LTR لتجنّب انعكاس RTL. */
function ValueLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}) {
  const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
  return (
    <text
      x={x + width - 10}
      y={y + height / 2}
      fill="#ffffff"
      fontSize={12}
      fontWeight={700}
      textAnchor="end"
      dominantBaseline="central"
      direction="ltr"
    >
      {value}%
    </text>
  );
}

/** مخطط أعمدة أفقي لأفضل الخدمات الاستشارية تقييماً (نسبة مئوية). */
export function TopServicesBarChart({ data }: { data: ServiceScore[] }) {
  const palette = [
    BRAND.primary,
    BRAND.accent,
    BRAND.secondary,
    '#0891B2',
    '#15803D',
    '#65A30D',
  ];

  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 46)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="serviceType"
          orientation="right"
          width={140}
          tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
          content={<ChartTooltip unit="%" />}
        />
        <Bar
          name="نسبة الرضا"
          dataKey="percentage"
          radius={[6, 0, 0, 6]}
          animationDuration={1000}
          barSize={22}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
          <LabelList dataKey="percentage" content={<ValueLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
