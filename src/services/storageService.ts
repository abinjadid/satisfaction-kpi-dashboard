/**
 * طبقة تخزين منخفضة المستوى تغلّف localStorage مع معالجة أخطاء آمنة.
 * فصلها يسمح باستبدالها لاحقاً (مثلاً sessionStorage أو IndexedDB) دون لمس بقية الكود.
 */
export class StorageService {
  constructor(private readonly namespace = 'satisfaction-dashboard') {}

  private key(name: string): string {
    return `${this.namespace}:${name}`;
  }

  /** قراءة قيمة JSON مع قيمة افتراضية عند الفشل. */
  get<T>(name: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.key(name));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  /** كتابة قيمة JSON. */
  set<T>(name: string, value: T): void {
    try {
      localStorage.setItem(this.key(name), JSON.stringify(value));
    } catch (error) {
      // قد تمتلئ مساحة التخزين — نتجاهل بهدوء مع تسجيل تحذير.
      console.warn('StorageService: تعذّر الحفظ', error);
    }
  }

  /** حذف مفتاح. */
  remove(name: string): void {
    try {
      localStorage.removeItem(this.key(name));
    } catch {
      /* تجاهل */
    }
  }
}

export const storage = new StorageService();
