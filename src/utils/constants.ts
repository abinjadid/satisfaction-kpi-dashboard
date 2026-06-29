import type { DimensionKey, SatisfactionLevel } from '@/types';

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

/** التسميات العربية لأبعاد الخدمة الستة. */
export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  quality: 'جودة الخدمة',
  speed: 'سرعة الإنجاز',
  clarity: 'وضوح المخرجات',
  communication: 'سهولة التواصل',
  professionalism: 'احترافية المستشار',
  addedValue: 'القيمة المضافة',
};

/** ترتيب ثابت لمفاتيح الأبعاد لضمان اتساق العرض. */
export const DIMENSION_KEYS: DimensionKey[] = [
  'quality',
  'speed',
  'clarity',
  'communication',
  'professionalism',
  'addedValue',
];

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

/** أنواع الخدمات الاستشارية المتاحة. */
export const SERVICE_TYPES = [
  'استشارات استراتيجية',
  'استشارات مالية',
  'استشارات قانونية',
  'استشارات تقنية',
  'استشارات إدارية',
  'استشارات الموارد البشرية',
  'دراسات الجدوى',
  'إدارة المشاريع',
] as const;

/** الجهات المستفيدة المتاحة. */
export const ENTITIES = [
  'وزارة المالية',
  'وزارة الصحة',
  'وزارة التعليم',
  'هيئة الاتصالات',
  'أمانة المنطقة',
  'الهيئة العامة للإحصاء',
  'صندوق التنمية',
  'هيئة تقويم التعليم',
] as const;
