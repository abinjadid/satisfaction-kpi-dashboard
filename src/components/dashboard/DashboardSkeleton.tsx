import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** هيكل تحميل للوحة بالكامل يظهر أثناء جلب البيانات. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* بطاقات المؤشرات */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* المخططات */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </Card>
        ))}
      </div>
    </div>
  );
}
