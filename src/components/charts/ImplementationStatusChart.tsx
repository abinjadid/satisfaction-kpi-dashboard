import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { ImplementationBreakdown, ImplementationStatus } from '@/types';
import { IMPLEMENTATION_STATUS } from '@/utils/constants';
import { ChartTooltip } from './ChartTooltip';

const ORDER: ImplementationStatus[] = ['full', 'partial', 'none', 'unspecified'];

/** مخطط دائري (Donut) لدرجة تطبيق الجهات المستفيدة لتوصيات الاستشارة. */
export function ImplementationStatusChart({
  breakdown,
}: {
  breakdown: ImplementationBreakdown;
}) {
  const data = ORDER.filter((status) => breakdown[status] > 0).map((status) => ({
    name: IMPLEMENTATION_STATUS[status].label,
    value: breakdown[status],
    color: IMPLEMENTATION_STATUS[status].color,
  }));

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={100}
          paddingAngle={2}
          stroke="hsl(var(--card))"
          strokeWidth={2}
          animationDuration={1000}
          label={({ value }) =>
            total > 0 && value > 0
              ? `${Math.round((value / total) * 100)}%`
              : ''
          }
          labelLine={false}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
