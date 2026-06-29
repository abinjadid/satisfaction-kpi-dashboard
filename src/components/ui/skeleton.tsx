import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/** عنصر هيكل تحميل (Skeleton) مع تأثير لمعان. */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} {...props} />;
}
