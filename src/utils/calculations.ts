/**
 * محرّك الحسابات: يحوّل قائمة الاستجابات إلى مقاييس مجمّعة جاهزة للعرض.
 * كل الدوال نقية (pure) لتسهيل الاختبار وإعادة الاستخدام (مبدأ المسؤولية الواحدة).
 */
import type {
  ContributionAreaScore,
  DashboardMetrics,
  ImplementationBreakdown,
  Insight,
  KpiMetric,
  MonthlyPoint,
  SatisfactionDistribution,
  SatisfactionLevel,
  SurveyResponse,
} from '@/types';
import { MONTHS_AR } from './constants';

/** تحويل تقييم رضا (من 5) إلى مستوى رضا. */
export function levelFromAverage(satisfaction: number): SatisfactionLevel {
  if (satisfaction >= 4.5) return 'verySatisfied';
  if (satisfaction >= 3.5) return 'satisfied';
  if (satisfaction >= 2.5) return 'neutral';
  if (satisfaction >= 1.5) return 'unsatisfied';
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
    dist[levelFromAverage(r.satisfaction)] += 1;
  }
  return dist;
}

/** توزيع الاستجابات على درجات تطبيق التوصيات. */
export function computeImplementationBreakdown(
  responses: SurveyResponse[],
): ImplementationBreakdown {
  const breakdown: ImplementationBreakdown = {
    full: 0,
    partial: 0,
    none: 0,
    unspecified: 0,
  };
  for (const r of responses) {
    breakdown[r.implementationStatus] += 1;
  }
  return breakdown;
}

/** السلاسل الشهرية (رضا % وعدد الاستجابات) عبر أشهر السنة. */
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
      buckets[month].sum += (r.satisfaction / 5) * 100;
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

/** ترتيب مجالات مساهمة الاستشارات حسب متوسط الرضا (استجابة قد تنتمي لأكثر من مجال). */
export function computeContributionAreaScores(
  responses: SurveyResponse[],
): ContributionAreaScore[] {
  const groups = new Map<string, { sum: number; count: number }>();
  for (const r of responses) {
    for (const area of r.contributionAreas) {
      const g = groups.get(area) ?? { sum: 0, count: 0 };
      g.sum += r.satisfaction;
      g.count += 1;
      groups.set(area, g);
    }
  }
  return Array.from(groups.entries())
    .map(([area, g]) => {
      const average = safeAvg(g.sum, g.count);
      return {
        area,
        average,
        percentage: Math.round((average / 5) * 1000) / 10,
        responses: g.count,
      };
    })
    .sort((a, b) => b.average - a.average || b.responses - a.responses);
}

/** متوسط مدة تعبئة الاستبيان بالدقائق (لمن توفّر لديهم وقتا البدء والانتهاء). */
function computeAvgCompletionMinutes(responses: SurveyResponse[]): number {
  const values = responses
    .map((r) => r.completionMinutes)
    .filter((v): v is number => v !== null);
  if (values.length === 0) return 0;
  return Math.round(safeAvg(values.reduce((a, b) => a + b, 0), values.length) * 10) / 10;
}

/** نسبة الاستجابات التي منحت تقييماً كاملاً (5 من 5). */
function computePerfectScoreRate(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  const perfect = responses.filter((r) => r.satisfaction >= 5).length;
  return (perfect / responses.length) * 100;
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
  const sum = responses.reduce((acc, r) => acc + r.satisfaction, 0);
  return (safeAvg(sum, responses.length) / 5) * 100;
}

/** نسبة التوصية (%) مبنية على متوسط احتمالية التوصية (1-5) لمن أجاب عليها. */
export function recommendationPct(responses: SurveyResponse[]): number {
  const values = responses
    .map((r) => r.recommendation)
    .filter((v): v is number => v !== null);
  if (values.length === 0) return 0;
  return (safeAvg(values.reduce((a, b) => a + b, 0), values.length) / 5) * 100;
}

/** المتوسط العام لتقييم الرضا (من 5). */
export function averageRating(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  const sum = responses.reduce((acc, r) => acc + r.satisfaction, 0);
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

  const areaScores = computeContributionAreaScores(responses);
  // نفضّل الاعتماد على الاستجابات ذات التاريخ الفعلي حتى لا يطغى تاريخ تقديري
  // (لاستجابات لا تتضمن طابعاً زمنياً في المصدر) على آخر تحديث حقيقي معروف.
  const datedResponses = responses.filter((r) => r.hasExactDate);
  const lastUpdatedSource = datedResponses.length > 0 ? datedResponses : responses;
  const lastUpdated =
    lastUpdatedSource.length > 0
      ? lastUpdatedSource
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
    implementationBreakdown: computeImplementationBreakdown(responses),
    monthly: computeMonthly(responses),
    topContributionAreas: areaScores.slice(0, 6),
    bottomContributionAreas: [...areaScores].reverse().slice(0, 5),
    perfectScoreRate: computePerfectScoreRate(responses),
    avgCompletionMinutes: computeAvgCompletionMinutes(responses),
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

  // أبرز مجال مساهمة
  if (metrics.topContributionAreas.length > 0) {
    const best = metrics.topContributionAreas[0];
    insights.push({
      id: 'best-area',
      tone: 'positive',
      text: `أبرز مجالات مساهمة الاستشارات: «${best.area}» بمتوسط رضا ${best.average.toFixed(2)} من 5.`,
    });
  }

  // نسبة تطبيق التوصيات
  const impl = metrics.implementationBreakdown;
  const implTotal = impl.full + impl.partial + impl.none + impl.unspecified;
  if (implTotal > 0) {
    const appliedPct = ((impl.full + impl.partial) / implTotal) * 100;
    insights.push({
      id: 'impl',
      tone: appliedPct >= 80 ? 'positive' : 'neutral',
      text: `${appliedPct.toFixed(0)}% من الجهات المستفيدة طبّقت التوصيات كلياً أو جزئياً.`,
    });
  }

  // نسبة التوصية
  insights.push({
    id: 'rec',
    tone: metrics.recommendationRate.value >= 80 ? 'positive' : 'neutral',
    text: `${metrics.recommendationRate.value.toFixed(0)}% متوسط احتمالية توصية الجهات المستفيدة بالخدمات الاستشارية.`,
  });

  return insights;
}
