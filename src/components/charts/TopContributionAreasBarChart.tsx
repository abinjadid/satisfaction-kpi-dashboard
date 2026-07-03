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
import type { ContributionAreaScore } from '@/types';
import { BRAND } from '@/utils/constants';
import { ChartTooltip } from './ChartTooltip';

const AXIS_WIDTH = 210;
const CHARS_PER_LINE = 24;
const MAX_LINES = 3;
const LINE_HEIGHT = 13;

/** تقسيم نص طويل إلى أسطر قصيرة عند حدود الكلمات لعرضه داخل محور فئوي ضيّق. */
function wrapLabel(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > CHARS_PER_LINE && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  if (lines.length > MAX_LINES) {
    const shown = lines.slice(0, MAX_LINES);
    const last = shown[MAX_LINES - 1];
    shown[MAX_LINES - 1] =
      last.length > CHARS_PER_LINE - 1
        ? `${last.slice(0, CHARS_PER_LINE - 1)}…`
        : last;
    return shown;
  }
  return lines;
}

/**
 * تسمية محور الفئات (أسماء المجالات) مع تثبيت اتجاه LTR للتموضع وتقسيم الأسطر،
 * لأن اتجاه الصفحة RTL يعكس نقطة الارتساء الافتراضية في Recharts فيقصّ النص.
 */
function CategoryTick(props: { x?: number; y?: number; payload?: { value: string } }) {
  const { x = 0, y = 0, payload } = props;
  const lines = wrapLabel(payload?.value ?? '');
  const startDy = -((lines.length - 1) * LINE_HEIGHT) / 2;
  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      fontSize={11}
      textAnchor="start"
      direction="ltr"
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? startDy : LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

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

/** مخطط أعمدة أفقي لأفضل مجالات مساهمة الاستشارات تقييماً (نسبة مئوية). */
export function TopContributionAreasBarChart({
  data,
}: {
  data: ContributionAreaScore[];
}) {
  const palette = [
    BRAND.primary,
    BRAND.accent,
    BRAND.secondary,
    '#0891B2',
    '#15803D',
    '#65A30D',
  ];

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 60)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="area"
          orientation="right"
          width={AXIS_WIDTH}
          tick={<CategoryTick />}
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
