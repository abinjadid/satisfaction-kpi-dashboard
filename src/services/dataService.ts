/**
 * خدمة البيانات: الواجهة الوحيدة التي تتعامل معها بقية التطبيق للوصول للاستجابات.
 * تخفي تفاصيل التخزين خلف عقد واضح يسهل استبداله بـ API لاحقاً (مبدأ عكس الاعتماد).
 */
import type { SurveyResponse } from '@/types';
import { storage } from './storageService';
import { generateSeedResponses } from './seedData';

const RESPONSES_KEY = 'responses';
const SEEDED_KEY = 'seeded';

/** واجهة مجرّدة لمصدر البيانات لتسهيل استبدال التنفيذ. */
export interface IDataService {
  getAll(): Promise<SurveyResponse[]>;
  add(input: Omit<SurveyResponse, 'id' | 'createdAt'>): Promise<SurveyResponse>;
  remove(id: string): Promise<void>;
  reset(): Promise<SurveyResponse[]>;
}

/** معرّف فريد بسيط يعمل في كل المتصفحات. */
function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class LocalDataService implements IDataService {
  /** قراءة كل الاستجابات، مع زرع بيانات أولية عند أول تشغيل. */
  async getAll(): Promise<SurveyResponse[]> {
    const alreadySeeded = storage.get<boolean>(SEEDED_KEY, false);
    if (!alreadySeeded) {
      const seed = generateSeedResponses();
      storage.set(RESPONSES_KEY, seed);
      storage.set(SEEDED_KEY, true);
      return seed;
    }
    return storage.get<SurveyResponse[]>(RESPONSES_KEY, []);
  }

  /** إضافة استجابة جديدة وإرجاعها بعد توليد المعرّف والطابع الزمني. */
  async add(
    input: Omit<SurveyResponse, 'id' | 'createdAt'>,
  ): Promise<SurveyResponse> {
    const all = await this.getAll();
    const response: SurveyResponse = {
      ...input,
      id: createId(),
      createdAt: new Date().toISOString(),
    };
    storage.set(RESPONSES_KEY, [response, ...all]);
    return response;
  }

  /** حذف استجابة حسب المعرّف. */
  async remove(id: string): Promise<void> {
    const all = await this.getAll();
    storage.set(
      RESPONSES_KEY,
      all.filter((r) => r.id !== id),
    );
  }

  /** إعادة تعيين كل البيانات إلى الحالة الأولية. */
  async reset(): Promise<SurveyResponse[]> {
    const seed = generateSeedResponses();
    storage.set(RESPONSES_KEY, seed);
    storage.set(SEEDED_KEY, true);
    return seed;
  }
}

export const dataService: IDataService = new LocalDataService();
