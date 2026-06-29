import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  /** ترتيب الظهور للحركة المتدرّجة */
  index?: number;
  action?: ReactNode;
}

/** بطاقة قسم موحّدة تضمّ عنواناً وأيقونة ومحتوى مع حركة دخول. */
export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  index = 0,
  action,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4) }}
      className={cn('print-block', className)}
    >
      <Card className="h-full hover:shadow-card-hover">
        <div className="flex items-start justify-between gap-3 p-5 pb-2">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div>
              <h3 className="text-base font-bold leading-tight text-card-foreground">
                {title}
              </h3>
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action}
        </div>
        <div className="p-5 pt-2">{children}</div>
      </Card>
    </motion.div>
  );
}
