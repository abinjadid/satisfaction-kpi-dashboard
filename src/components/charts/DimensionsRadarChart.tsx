import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ServiceDimensions } from '@/types';
import { BRAND, DIMENSION_KEYS, DIMENSION_LABELS } from '@/utils/constants';
import { ChartTooltip } from './ChartTooltip';

/** مخطط راداري لتقييم أبعاد الخدمة الستة (من 5). */
export function DimensionsRadarChart({
  dimensions,
}: {
  dimensions: ServiceDimensions;
}) {
  const data = DIMENSION_KEYS.map((key) => ({
    dimension: DIMENSION_LABELS[key],
    value: Math.round(dimensions[key] * 100) / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          tickCount={6}
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
        />
        <Radar
          name="متوسط التقييم"
          dataKey="value"
          stroke={BRAND.primary}
          fill={BRAND.primary}
          fillOpacity={0.25}
          strokeWidth={2}
          animationDuration={1100}
        />
        <Tooltip content={<ChartTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
