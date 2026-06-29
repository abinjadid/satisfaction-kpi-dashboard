/** أدوات تنسيق الأرقام والتواريخ بالعربية. */

const arDigits = new Intl.NumberFormat('ar-SA-u-nu-latn');

/** تنسيق عدد صحيح مع فواصل الآلاف. */
export function formatNumber(value: number): string {
  return arDigits.format(Math.round(value));
}

/** تنسيق نسبة مئوية مثل "94%". */
export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

/** تنسيق متوسط تقييم مثل "4.72 / 5". */
export function formatRating(value: number): string {
  return `${value.toFixed(2)} / 5`;
}

/** تنسيق تاريخ ISO إلى صيغة عربية مقروءة (يوم شهر سنة). */
export function formatDateAr(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** تنسيق التاريخ والوقت معاً. */
export function formatDateTimeAr(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** صياغة قيمة الفرق مع علامة الاتجاه. */
export function formatDelta(delta: number, suffix = '%'): string {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  return `${sign}${Math.abs(delta).toFixed(1)}${suffix}`;
}
