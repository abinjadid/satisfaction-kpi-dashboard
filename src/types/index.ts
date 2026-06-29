/**
 * نماذج البيانات الأساسية للوحة مؤشر الرضا عن الخدمات الاستشارية.
 * كل الأنواع هنا تُستخدم عبر طبقات الخدمة والـ hooks والمكوّنات.
 */

/** أبعاد تقييم الخدمة الستة (مقياس 1-5). */
export interface ServiceDimensions {
  /** جودة الخدمة */
  quality: number;
  /** سرعة الإنجاز */
  speed: number;
  /** وضوح المخرجات */
  clarity: number;
  /** سهولة التواصل */
  communication: number;
  /** احترافية المستشار */
  professionalism: number;
  /** القيمة المضافة */
  addedValue: number;
}

/** مفاتيح الأبعاد لاستخدامها في الحلقات والعناوين. */
export type DimensionKey = keyof ServiceDimensions;

/** استجابة واحدة من جهة مستفيدة. */
export interface SurveyResponse {
  id: string;
  /** اسم الجهة المستفيدة */
  entity: string;
  /** نوع الخدمة الاستشارية */
  serviceType: string;
  /** تاريخ الاستجابة بصيغة ISO (YYYY-MM-DD) */
  date: string;
  /** التقييمات عبر الأبعاد الستة */
  dimensions: ServiceDimensions;
  /** هل توصي الجهة بالخدمة؟ */
  recommends: boolean;
  /** ملاحظات اختيارية */
  notes?: string;
  /** طابع زمني للإنشاء */
  createdAt: string;
}

/** مستويات الرضا المشتقة من متوسط التقييم. */
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

/** متوسط تقييم خدمة معيّنة. */
export interface ServiceScore {
  serviceType: string;
  /** المتوسط من 5 */
  average: number;
  /** نسبة مئوية */
  percentage: number;
  responses: number;
}

/** المقاييس المجمّعة المحسوبة من كل الاستجابات. */
export interface DashboardMetrics {
  totalResponses: number;
  overallSatisfaction: KpiMetric;
  averageRating: KpiMetric;
  recommendationRate: KpiMetric;
  responsesMetric: KpiMetric;
  distribution: SatisfactionDistribution;
  dimensionAverages: ServiceDimensions;
  monthly: MonthlyPoint[];
  topServices: ServiceScore[];
  bottomServices: ServiceScore[];
  /** متوسط زمن الاستجابة بالأيام (من تاريخ الاستجابة حتى الإدخال) */
  avgResponseTimeDays: number;
  lastUpdated: string | null;
}

/** عناصر التصفية المطبّقة على لوحة المعلومات. */
export interface DashboardFilters {
  year: string;
  month: string;
  serviceType: string;
  entity: string;
  search: string;
}

/** بطاقة استنتاج تلقائي ضمن قسم الملخص. */
export interface Insight {
  id: string;
  text: string;
  tone: 'positive' | 'negative' | 'neutral';
}
