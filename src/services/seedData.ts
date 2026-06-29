/**
 * توليد بيانات أولية واقعية لعرض اللوحة عند أول تشغيل.
 * يُستخدم مولّد عشوائي بنواة ثابتة لضمان نتائج متّسقة بين الجلسات.
 */
import type { ServiceDimensions, SurveyResponse } from '@/types';
import { ENTITIES, SERVICE_TYPES } from '@/utils/constants';

/** مولّد عشوائي حتمي (mulberry32) لنتائج قابلة للتكرار. */
function createRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** تقييم منحاز للأعلى (1-5) ليعكس رضا واقعياً مرتفعاً. */
function biasedScore(rng: () => number, base: number): number {
  const noise = (rng() - 0.5) * 1.6;
  return Math.max(1, Math.min(5, Math.round(base + noise)));
}

/** إنشاء مجموعة استجابات اصطناعية موزّعة على أشهر السنة الحالية. */
export function generateSeedResponses(): SurveyResponse[] {
  const rng = createRng(20260630);
  const responses: SurveyResponse[] = [];
  const year = new Date().getFullYear();
  let counter = 0;

  // عدد متصاعد عبر الأشهر لإظهار اتجاه نمو واضح.
  const perMonth = [12, 14, 13, 16, 18, 17, 19, 21, 20, 22, 24, 23];

  for (let month = 0; month < 12; month++) {
    // اتجاه تحسّن تدريجي في الرضا عبر الأشهر.
    const monthBase = 3.9 + month * 0.045;
    for (let i = 0; i < perMonth[month]; i++) {
      const serviceType = pick(rng, SERVICE_TYPES);
      // بعض الخدمات تميل لتقييم أعلى لإبراز الترتيب.
      const serviceBoost =
        serviceType === 'دراسات الجدوى' || serviceType === 'استشارات استراتيجية'
          ? 0.4
          : serviceType === 'استشارات قانونية'
            ? -0.35
            : 0;

      const base = monthBase + serviceBoost;
      const dimensions: ServiceDimensions = {
        quality: biasedScore(rng, base + 0.3),
        speed: biasedScore(rng, base - 0.4),
        clarity: biasedScore(rng, base + 0.1),
        communication: biasedScore(rng, base),
        professionalism: biasedScore(rng, base + 0.2),
        addedValue: biasedScore(rng, base - 0.1),
      };

      const day = 1 + Math.floor(rng() * 27);
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const createdAt = new Date(
        `${date}T09:00:00Z`,
      );
      // الإدخال بعد يوم إلى خمسة أيام من الاستجابة.
      createdAt.setDate(createdAt.getDate() + 1 + Math.floor(rng() * 5));

      const avg =
        (dimensions.quality +
          dimensions.speed +
          dimensions.clarity +
          dimensions.communication +
          dimensions.professionalism +
          dimensions.addedValue) /
        6;

      responses.push({
        id: `seed-${counter++}`,
        entity: pick(rng, ENTITIES),
        serviceType,
        date,
        dimensions,
        recommends: avg >= 3.4 ? rng() > 0.12 : rng() > 0.6,
        notes: '',
        createdAt: createdAt.toISOString(),
      });
    }
  }

  return responses;
}
