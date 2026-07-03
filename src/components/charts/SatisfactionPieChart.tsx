import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { SatisfactionDistribution, SatisfactionLevel } from '@/types';
import { SATISFACTION_LEVELS } from '@/utils/constants';
import { ChartTooltip } from './ChartTooltip';
import { DonutLabel } from './DonutLabel';

/** مخطط دائري (Donut) لتوزيع مستويات الرضا الخمسة. */
export function SatisfactionPieChart({
  distribution,
}: {
  distribution: SatisfactionDistribution;
}) {
  const data = (Object.keys(SATISFACTION_LEVELS) as SatisfactionLevel[]).map(
    (level) => ({
      name: SATISFACTION_LEVELS[level].label,
      value: distribution[level],
      color: SATISFACTION_LEVELS[level].color,
    }),
  );

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
          label={<DonutLabel />}
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
