const RADIAN = Math.PI / 180;

interface DonutLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

/**
 * تسمية نسبة مئوية مرسومة داخل حلقة مخطط Donut، بموضع محسوب يدوياً واتجاه LTR
 * صريح. اتجاه الصفحة RTL يعكس افتراضياً نقطة ارتساء تسميات Recharts فتُقصّ
 * النسب القصيرة (كما حدث مع تسميات محور الأعمدة)، لذا نتجاوز ذلك بحساب الموضع
 * ورسم <text> مخصّص بدلاً من الاعتماد على تموضع Recharts الافتراضي.
 */
export function DonutLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: DonutLabelProps) {
  if (percent <= 0) return null;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      fontSize={12}
      fontWeight={700}
      textAnchor="middle"
      dominantBaseline="central"
      direction="ltr"
    >
      {Math.round(percent * 100)}%
    </text>
  );
}
