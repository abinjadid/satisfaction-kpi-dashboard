/**
 * نماذج البيانات الأساسية للوحة مؤشر الرضا عن الخدمات الاستشارية.
 * الحقول مطابقة لبنية استبيان الرضا الفعلي (نموذج Microsoft Forms):
 * تقييم رضا عام واحد، احتمالية توصية، ودرجة تطبيق التوصيات.
 */

/** درجة تطبيق الجهة المستفيدة لتوصيات الاستشارة. */
export type ImplementationStatus = 'full' | 'partial' | 'none' | 'unspecified';

/** استجابة واحدة من جهة مستفيدة على استبيان الرضا. */
export interface SurveyResponse {
  id: string;
  /** اسم الجهة المستفيدة */
  entity: string;
  /** اسم مقدّم الاستجابة (اختياري) */
  respondentName?: string;
  /** تاريخ الاستجابة بصيغة ISO (YYYY-MM-DD) */
  date: string;
  /** هل التاريخ فعلي من الاستبيان أم مُقدَّر لعدم توفره؟ */
  hasExactDate: boolean;
  /** كيف تقيم رضاك عن الخدمة المقدمة؟ (1-5، تقبل الكسور) */
  satisfaction: number;
  /** ما مدى احتمال أن توصي بهذه الخدمة للآخرين؟ (1-5)، قد تكون غير متوفرة */
  recommendation: number | null;
  /** إلى أي درجة قامت الجهة بتطبيق التوصيات؟ */
  implementationStatus: ImplementationStatus;
  /** وصف موجز لكيفية تنفيذ التوصيات والنتائج المحققة */
  implementationNotes?: string;
  /** المجالات التي ساهمت فيها الاستشارة (قد تتضمن أكثر من مجال) */
  contributionAreas: string[];
  /** الجوانب التي يمكن تحسينها في الخدمة */
  improvementNotes?: string;
  /** الخدمات الاستشارية المستقبلية المرغوبة */
  futureServiceRequests?: string;
  /** مدة تعبئة الاستبيان بالدقائق (إن توفر وقت البدء والانتهاء) */
  completionMinutes: number | null;
  /** طابع زمني للإنشاء/الاستيراد */
  createdAt: string;
}

/** مستويات الرضا المشتقة من قيمة التقييم. */
export type SatisfactionLevel =
  | 'verySatisfied'
  | 'satisfied'
  | 'neutral'
  | 'unsatisfied'
  | 'veryUnsatisfied';

/** توزيع عدد الاستجابات على مستويات الرضا. */
export type SatisfactionDistribution = Record<SatisfactionLevel, number>;

/** بطاقة مؤشر رئيسية مع اتجاه التغيّر. */
export interface KpiMetric {
  value: number;
  /** التغيّر مقارنة بالفترة السابقة (نقاط مئوية أو قيمة) */
  delta: number;
  /** اتجاه التغيّر */
  trend: 'up' | 'down' | 'flat';
}

/** نقطة على المخطط الشهري. */
export interface MonthlyPoint {
  /** اسم الشهر بالعربية */
  month: string;
  /** رقم الشهر (0-11) للترتيب */
  index: number;
  /** متوسط الرضا العام لهذا الشهر (%) */
  satisfaction: number;
  /** عدد الاستجابات في هذا الشهر */
  responses: number;
}

/** متوسط تقييم مجال مساهمة معيّن (مشتق من حقل "ساهمت الاستشارة من خلال"). */
export interface ContributionAreaScore {
  area: string;
  /** المتوسط من 5 */
  average: number;
  /** نسبة مئوية */
  percentage: number;
  responses: number;
}

/** توزيع الاستجابات على درجات تطبيق التوصيات. */
export type ImplementationBreakdown = Record<ImplementationStatus, number>;

/** المقاييس المجمّعة المحسوبة من كل الاستجابات. */
export interface DashboardMetrics {
  totalResponses: number;
  overallSatisfaction: KpiMetric;
  averageRating: KpiMetric;
  recommendationRate: KpiMetric;
  responsesMetric: KpiMetric;
  distribution: SatisfactionDistribution;
  implementationBreakdown: ImplementationBreakdown;
  monthly: MonthlyPoint[];
  topContributionAreas: ContributionAreaScore[];
  bottomContributionAreas: ContributionAreaScore[];
  /** نسبة الاستجابات التي منحت تقييماً كاملاً (5 من 5) */
  perfectScoreRate: number;
  /** متوسط مدة تعبئة الاستبيان بالدقائق */
  avgCompletionMinutes: number;
  lastUpdated: string | null;
}

/** عناصر التصفية المطبّقة على لوحة المعلومات. */
export interface DashboardFilters {
  year: string;
  month: string;
  contributionArea: string;
  entity: string;
  search: string;
}

/** بطاقة استنتاج تلقائي ضمن قسم الملخص. */
export interface Insight {
  id: string;
  text: string;
  tone: 'positive' | 'negative' | 'neutral';
}
