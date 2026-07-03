import type { ImplementationStatus, SatisfactionLevel } from '@/types';

/** ألوان العلامة التجارية المستخدمة في المخططات والتصدير. */
export const BRAND = {
  primary: '#006C35',
  secondary: '#0E7490',
  accent: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
  slate: '#64748B',
} as const;

/** أسماء الأشهر بالعربية مرتّبة من يناير إلى ديسمبر. */
export const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

/** التسميات والألوان لمستويات الرضا. */
export const SATISFACTION_LEVELS: Record<
  SatisfactionLevel,
  { label: string; color: string }
> = {
  verySatisfied: { label: 'راضٍ جداً', color: BRAND.primary },
  satisfied: { label: 'راضٍ', color: BRAND.accent },
  neutral: { label: 'محايد', color: BRAND.amber },
  unsatisfied: { label: 'غير راضٍ', color: '#F97316' },
  veryUnsatisfied: { label: 'غير راضٍ إطلاقاً', color: BRAND.red },
};

/** التسميات والألوان لدرجات تطبيق التوصيات. */
export const IMPLEMENTATION_STATUS: Record<
  ImplementationStatus,
  { label: string; color: string }
> = {
  full: { label: 'تم تطبيقها بالكامل', color: BRAND.primary },
  partial: { label: 'تطبيق جزئي / قيد التنفيذ', color: BRAND.secondary },
  none: { label: 'لم يتم التطبيق بعد', color: BRAND.red },
  unspecified: { label: 'لم يُحدَّد', color: BRAND.slate },
};

/** المجالات المعروفة التي قد تساهم فيها الاستشارة (لاقتراحها في نموذج الإضافة). */
export const CONTRIBUTION_AREAS = [
  'تعزيز الكفاءة التشغيلية',
  'تقليص مدة تنفيذ المشاريع الرقمية',
  'تحسين التنسيق بين الإدارات الداخلية',
  'زيادة معدل رضا المستفيد النهائي',
  'تحسين جانب التخطيط الاستراتيجي',
  'تحديد التوجهات الصحيحة للجهات',
  'تحسين الموائمة مع التوجهات الوطنية',
  'دليل استرشادي للتحول الرقمي',
  'الاستشارة في مراجعة استراتيجية التحول الرقمي',
] as const;
