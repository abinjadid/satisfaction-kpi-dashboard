import { formatDateTimeAr } from '@/utils/format';

/**
 * ترويسة التقرير التي تظهر ضمن منطقة الالتقاط (PDF/PNG) وعند الطباعة.
 * تتضمّن شعاراً نائباً وعنوان الجهة وتاريخ الإصدار.
 */
export function ReportHeader() {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card print-block">
      <p className="text-xs text-muted-foreground">تاريخ الإصدار</p>
      <p className="text-sm font-semibold text-card-foreground">
        {formatDateTimeAr(new Date().toISOString())}
      </p>
    </div>
  );
}
