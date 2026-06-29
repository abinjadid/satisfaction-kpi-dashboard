import { formatDateTimeAr } from '@/utils/format';

/**
 * ترويسة التقرير التي تظهر ضمن منطقة الالتقاط (PDF/PNG) وعند الطباعة.
 * تتضمّن شعاراً نائباً وعنوان الجهة وتاريخ الإصدار.
 */
export function ReportHeader() {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-card print-block">
      <div className="flex items-center gap-4">
        {/* عنصر نائب للشعار */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-[10px] font-semibold text-primary">
          الشعار
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-card-foreground">
            تقرير مؤشر الرضا عن الخدمات الاستشارية
          </h2>
          <p className="text-xs text-muted-foreground">
            تقرير تنفيذي لمتابعة أداء رضا الجهات المستفيدة
          </p>
        </div>
      </div>
      <div className="text-left">
        <p className="text-xs text-muted-foreground">تاريخ الإصدار</p>
        <p className="text-sm font-semibold text-card-foreground">
          {formatDateTimeAr(new Date().toISOString())}
        </p>
      </div>
    </div>
  );
}
