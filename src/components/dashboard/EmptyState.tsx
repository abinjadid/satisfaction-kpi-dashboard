import { motion } from 'framer-motion';
import { Inbox, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  onAdd: () => void;
  onReset: () => void;
}

/** حالة فارغة أنيقة تظهر عند عدم وجود استجابات مطابقة. */
export function EmptyState({ onAdd, onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox className="h-10 w-10" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-card-foreground">
            لا توجد استجابات مطابقة
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            لم نعثر على بيانات تطابق عوامل التصفية الحالية. جرّب إعادة تعيين
            التصفية أو إضافة استجابة جديدة لبدء قياس مؤشر الرضا.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4" />
            إضافة استجابة
          </Button>
          <Button variant="outline" onClick={onReset}>
            إعادة تعيين البيانات
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
