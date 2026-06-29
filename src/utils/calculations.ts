/**
 * محرّك الحسابات: يحوّل قائمة الاستجابات إلى مقاييس مجمّعة جاهزة للعرض.
 * كل الدوال نقية (pure) لتسهيل الاختبار وإعادة الاستخدام (مبدأ المسؤولية الواحدة).
 */
import type {
  DashboardMetrics,
  Insight,
  KpiMetric,
  MonthlyPoint,
  SatisfactionDistribution,
  SatisfactionLevel,
  ServiceDimensions,
  ServiceScore,
  SurveyResponse,
} from '@/types';
import { DIMENSION_KEYS, DIMENSION_LABELS, MONTHS_AR } from './constants';

const EMPTY_DIMENSIONS: ServiceDimensions = {
  quality: 0,
  speed: 0,
  clarity: 0,
  communication: 0,
  professionalism: 0,
  addedValue: 0,
};

/** متوسط أبعاد استجابة واحدة (من 5). */
export function responseAverage(r: SurveyResponse): number {
  const values = DIMENSION_KEYS.map((k) => r.dimensions[k]);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** تحويل متوسط (من 5) إلى مستوى رضا. */
export function levelFromAverage(avg: number): SatisfactionLevel {
  if (avg >= 4.5) return 'verySatisfied';
  if (avg >= 3.5) return 'satisfied';
  if (avg >= 2.5) return 'neutral';
  if (avg >= 1.5) return 'unsatisfied';
  return 'veryUnsatisfied';
}

/** متوسط آمن يتجنّب القسمة على صفر. */
function safeAvg(sum: number, count: number): number {
  return count === 0 ? 0 : sum / count;
}

/** بناء كائن مؤشر مع اتجاه التغيّر. */
function buildMetric(value: number, previous: number): KpiMetric {
  const delta = value - previous;
  const trend: KpiMetric['trend'] =
    Math.abs(delta) < 0.05 ? 'flat' : delta > 0 ? 'up' : 'down';
  return { value, delta, trend };
}

/** حساب متوسطات الأبعاد عبر مجموعة استجابات. */
export function computeDimensionAverages(
  responses: SurveyResponse[],
): ServiceDimensions {
  if (responses.length === 0) return { ...EMPTY_DIMENSIONS };
  const totals: ServiceDimensions = { ...EMPTY_DIMENSIONS };
  for (const r of responses) {
    for (const key of DIMENSION_KEYS) {
      totals[key] += r.dimensions[key];
    }
  }
  const result = { ...EMPTY_DIMENSIONS };
  for (const key of DIMENSION_KEYS) {
    result[key] = safeAvg(totals[key], responses.length);
  }
  return result;
}

/** توزيع الاستجابات على مستويات الرضا الخمسة. */
export function computeDistribution(
  responses: SurveyResponse[],
): SatisfactionDistribution {
  const dist: SatisfactionDistribution = {
    verySatisfied: 0,
    satisfied: 0,
    neutral: 0,
    unsatisfied: 0,
    veryUnsatisfied: 0,
  };
  for (const r of responses) {
    dist[levelFromAverage(responseAverage(r))] += 1;
  }
  return dist;
}

/** السلاسل الشهرية (رضا % وعدد الاستجابات) لسنة معيّنة أو لكل البيانات. */
export function computeMonthly(responses: SurveyResponse[]): MonthlyPoint[] {
  const buckets = MONTHS_AR.map((month, index) => ({
    month,
    index,
    sum: 0,
    count: 0,
  }));

  for (const r of responses) {
    const month = new Date(r.date).getMonth();
    if (month >= 0 && month < 12) {
      buckets[month].sum += (responseAverage(r) / 5) * 100;
      buckets[month].count += 1;
    }
  }

  return buckets.map((b) => ({
    month: b.month,
    index: b.index,
    satisfaction: Math.round(safeAvg(b.sum, b.count) * 10) / 10,
    responses: b.count,
  }));
}

/** ترتيب الخدمات حسب متوسط التقييم. */
export function computeServiceScores(
  responses: SurveyResponse[],
): ServiceScore[] {
  const groups = new Map<string, { sum: number; count: number }>();
  for (const r of responses) {
    const g = groups.get(r.serviceType) ?? { sum: 0, count: 0 };
    g.sum += responseAverage(r);
    g.count += 1;
    groups.set(r.serviceType, g);
  }
  return Array.from(groups.entries())
    .map(([serviceType, g]) => {
      const average = safeAvg(g.sum, g.count);
      return {
        serviceType,
        average,
        percentage: Math.round((average / 5) * 1000) / 10,
        responses: g.count,
      };
    })
    .sort((a, b) => b.average - a.average);
}

/** متوسط زمن التسجيل بالأيام (من تاريخ الاستجابة إلى الإدخال). */
function computeAvgResponseTime(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  let total = 0;
  let count = 0;
  for (const r of responses) {
    const responded = new Date(r.date).getTime();
    const created = new Date(r.createdAt).getTime();
    if (!Number.isNaN(responded) && !Number.isNaN(created)) {
      total += Math.max(0, (created - responded) / 86_400_000);
      count += 1;
    }
  }
  return Math.round(safeAvg(total, count) * 10) / 10;
}

/** الفصل بين استجابات الشهر الحالي والشهر السابق ضمن المجموعة المعطاة. */
function splitByRecentMonth(responses: SurveyResponse[]): {
  current: SurveyResponse[];
  previous: SurveyResponse[];
} {
  const sorted = [...responses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const latest = sorted[0] ? new Date(sorted[0].date) : new Date();
  const curKey = latest.getFullYear() * 12 + latest.getMonth();

  const current: SurveyResponse[] = [];
  const previous: SurveyResponse[] = [];
  for (const r of responses) {
    const d = new Date(r.date);
    const key = d.getFullYear() * 12 + d.getMonth();
    if (key === curKey) current.push(r);
    else if (key === curKey - 1) previous.push(r);
  }
  return { current, previous };
}

/** نسبة الرضا العام (%) لمجموعة استجابات. */
export function overallSatisfactionPct(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  const sum = responses.reduce((acc, r) => acc + responseAverage(r), 0);
  return (safeAvg(sum, responses.length) / 5) * 100;
}

/** نسبة التوصية (%) لمجموعة استجابات. */
export function recommendationPct(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  const yes = responses.filter((r) => r.recommends).length;
  return (yes / responses.length) * 100;
}

/** المتوسط العام للتقييم (من 5). */
export function averageRating(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  const sum = responses.reduce((acc, r) => acc + responseAverage(r), 0);
  return sum / responses.length;
}

/** الدالة الرئيسية: حساب كل مقاييس لوحة المعلومات دفعة واحدة. */
export function computeDashboardMetrics(
  responses: SurveyResponse[],
): DashboardMetrics {
  const { current, previous } = splitByRecentMonth(responses);

  const overallNow = overallSatisfactionPct(responses);
  const overallPrev =
    previous.length > 0 ? overallSatisfactionPct([...previous]) : overallNow;

  const ratingNow = averageRating(responses);
  const ratingPrev =
    previous.length > 0 ? averageRating(previous) : ratingNow;

  const recNow = recommendationPct(responses);
  const recPrev = previous.length > 0 ? recommendationPct(previous) : recNow;

  const scores = computeServiceScores(responses);
  const lastUpdated =
    responses.length > 0
      ? responses
          .map((r) => r.createdAt)
          .sort()
          .at(-1) ?? null
      : null;

  return {
    totalResponses: responses.length,
    overallSatisfaction: buildMetric(overallNow, overallPrev),
    averageRating: buildMetric(ratingNow, ratingPrev),
    recommendationRate: buildMetric(recNow, recPrev),
    responsesMetric: buildMetric(current.length, previous.length),
    distribution: computeDistribution(responses),
    dimensionAverages: computeDimensionAverages(responses),
    monthly: computeMonthly(responses),
    topServices: scores.slice(0, 6),
    bottomServices: [...scores].reverse().slice(0, 5),
    avgResponseTimeDays: computeAvgResponseTime(responses),
    lastUpdated,
  };
}

/** توليد بطاقات الاستنتاجات التلقائية من المقاييس. */
export function generateInsights(metrics: DashboardMetrics): Insight[] {
  const insights: Insight[] = [];

  if (metrics.totalResponses === 0) return insights;

  // اتجاه مؤشر الرضا العام
  const sat = metrics.overallSatisfaction;
  if (sat.trend === 'up') {
    insights.push({
      id: 'sat-up',
      tone: 'positive',
      text: `ارتفع مؤشر الرضا بنسبة ${sat.delta.toFixed(1)}% مقارنة بالشهر السابق.`,
    });
  } else if (sat.trend === 'down') {
    insights.push({
      id: 'sat-down',
      tone: 'negative',
      text: `انخفض مؤشر الرضا بنسبة ${Math.abs(sat.delta).toFixed(1)}% مقارنة بالشهر السابق.`,
    });
  } else {
    insights.push({
      id: 'sat-flat',
      tone: 'neutral',
      text: `استقر مؤشر الرضا العام عند ${metrics.overallSatisfaction.value.toFixed(0)}%.`,
    });
  }

  // اتجاه عدد الاستجابات
  const resp = metrics.responsesMetric;
  if (resp.trend === 'up') {
    insights.push({
      id: 'resp-up',
      tone: 'positive',
      text: `زادت الاستجابات هذا الشهر بمقدار ${Math.abs(resp.delta).toFixed(0)} استجابة.`,
    });
  } else if (resp.trend === 'down') {
    insights.push({
      id: 'resp-down',
      tone: 'negative',
      text: `انخفضت الاستجابات هذا الشهر بمقدار ${Math.abs(resp.delta).toFixed(0)} استجابة.`,
    });
  }

  // أعلى وأقل بُعد تقييماً
  const dims = DIMENSION_KEYS.map((k) => ({
    key: k,
    value: metrics.dimensionAverages[k],
  }));
  const best = dims.reduce((a, b) => (b.value > a.value ? b : a));
  const worst = dims.reduce((a, b) => (b.value < a.value ? b : a));

  insights.push({
    id: 'best-dim',
    tone: 'positive',
    text: `أعلى تقييم كان لبُعد «${DIMENSION_LABELS[best.key]}» بمتوسط ${best.value.toFixed(2)} من 5.`,
  });
  insights.push({
    id: 'worst-dim',
    tone: 'negative',
    text: `أقل تقييم كان لبُعد «${DIMENSION_LABELS[worst.key]}» بمتوسط ${worst.value.toFixed(2)} من 5، ويُنصح بتحسينه.`,
  });

  // نسبة التوصية
  insights.push({
    id: 'rec',
    tone: metrics.recommendationRate.value >= 80 ? 'positive' : 'neutral',
    text: `${metrics.recommendationRate.value.toFixed(0)}% من الجهات المستفيدة توصي بالخدمات الاستشارية.`,
  });

  return insights;
}
