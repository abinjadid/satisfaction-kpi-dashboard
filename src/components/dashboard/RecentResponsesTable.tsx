import { useMemo, useState } from 'react';
import { ArrowUpDown, Check, Trash2, X } from 'lucide-react';
import type { SurveyResponse } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { responseAverage } from '@/utils/calculations';
import { formatDateAr } from '@/utils/format';
import { cn } from '@/utils/cn';

interface RecentResponsesTableProps {
  responses: SurveyResponse[];
  onDelete: (id: string) => void;
}

type SortKey = 'date' | 'entity' | 'serviceType' | 'average';
type SortDir = 'asc' | 'desc';

/** جدول أحدث الاستجابات مع فرز قابل للنقر وحذف. */
export function RecentResponsesTable({
  responses,
  onDelete,
}: RecentResponsesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const copy = [...responses];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'average':
          cmp = responseAverage(a) - responseAverage(b);
          break;
        case 'date':
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        default:
          cmp = a[sortKey].localeCompare(b[sortKey], 'ar');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy.slice(0, 8);
  }, [responses, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const header = (key: SortKey, label: string) => (
    <th className="px-3 py-2 text-right font-semibold">
      <button
        onClick={() => toggleSort(key)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-primary',
          sortKey === key && 'text-primary',
        )}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            {header('entity', 'الجهة')}
            {header('serviceType', 'نوع الخدمة')}
            {header('date', 'التاريخ')}
            {header('average', 'المتوسط')}
            <th className="px-3 py-2 text-right font-semibold">التوصية</th>
            <th className="px-3 py-2 text-center font-semibold no-print">
              إجراء
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const avg = responseAverage(r);
            return (
              <tr
                key={r.id}
                className="border-b border-border/60 transition-colors hover:bg-muted/40"
              >
                <td className="px-3 py-2.5 font-medium text-card-foreground">
                  {r.entity}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {r.serviceType}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                  {formatDateAr(r.date)}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    variant={
                      avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'destructive'
                    }
                  >
                    {avg.toFixed(2)}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">
                  {r.recommends ? (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Check className="h-4 w-4" /> نعم
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <X className="h-4 w-4" /> لا
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center no-print">
                  {pendingDelete === r.id ? (
                    <span className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2"
                        onClick={() => {
                          onDelete(r.id);
                          setPendingDelete(null);
                        }}
                      >
                        تأكيد
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => setPendingDelete(null)}
                      >
                        إلغاء
                      </Button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setPendingDelete(r.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="حذف الاستجابة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
