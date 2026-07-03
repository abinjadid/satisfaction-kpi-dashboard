import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Save, X } from 'lucide-react';
import type { ImplementationStatus, SurveyResponse } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RatingInput } from './RatingInput';
import { CONTRIBUTION_AREAS, IMPLEMENTATION_STATUS } from '@/utils/constants';
import { cn } from '@/utils/cn';

interface AddResponseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      SurveyResponse,
      'id' | 'createdAt' | 'hasExactDate' | 'completionMinutes'
    >,
  ) => void;
  knownEntities: string[];
}

const IMPLEMENTATION_OPTIONS: ImplementationStatus[] = [
  'full',
  'partial',
  'none',
  'unspecified',
];

/** مخطط التحقق من صحة نموذج إضافة استجابة، مطابق لأسئلة استبيان الرضا الفعلي. */
const formSchema = z.object({
  entity: z.string().min(1, 'اسم الجهة مطلوب'),
  date: z.string().min(1, 'يرجى تحديد تاريخ الاستجابة'),
  satisfaction: z
    .number({ invalid_type_error: 'مطلوب' })
    .int()
    .min(1, 'تقييم الرضا مطلوب')
    .max(5),
  recommendation: z.number().int().min(0).max(5),
  implementationStatus: z.enum(['full', 'partial', 'none', 'unspecified']),
  contributionAreas: z.array(z.string()),
  otherArea: z.string().max(200).optional(),
  implementationNotes: z.string().max(1000).optional(),
  improvementNotes: z.string().max(1000).optional(),
  futureServiceRequests: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const today = () => new Date().toISOString().slice(0, 10);

const defaultValues: FormValues = {
  entity: '',
  date: today(),
  satisfaction: 0,
  recommendation: 0,
  implementationStatus: 'unspecified',
  contributionAreas: [],
  otherArea: '',
  implementationNotes: '',
  improvementNotes: '',
  futureServiceRequests: '',
};

/** نافذة حوارية لإضافة استجابة جديدة مطابقة لأسئلة استبيان الرضا الفعلي. */
export function AddResponseDialog({
  open,
  onClose,
  onSubmit,
  knownEntities,
}: AddResponseDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const submit = handleSubmit((values) => {
    const areas = [...values.contributionAreas];
    const other = values.otherArea?.trim();
    if (other) areas.push(other);

    onSubmit({
      entity: values.entity.trim(),
      date: values.date,
      satisfaction: values.satisfaction,
      recommendation: values.recommendation === 0 ? null : values.recommendation,
      implementationStatus: values.implementationStatus,
      implementationNotes: values.implementationNotes?.trim() || undefined,
      contributionAreas: areas,
      improvementNotes: values.improvementNotes?.trim() || undefined,
      futureServiceRequests: values.futureServiceRequests?.trim() || undefined,
    });
    reset(defaultValues);
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="إضافة استجابة جديدة"
      description="أدخل استجابة الجهة المستفيدة على استبيان الرضا لتحديث المؤشرات تلقائياً."
    >
      <form onSubmit={submit} className="space-y-5">
        {/* بيانات أساسية */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entity">اسم الجهة المستفيدة</Label>
            <Input
              id="entity"
              list="known-entities"
              placeholder="مثال: وزارة التعليم"
              {...register('entity')}
            />
            <datalist id="known-entities">
              {knownEntities.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
            {errors.entity && (
              <span className="text-xs text-destructive">
                {errors.entity.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">تاريخ الاستجابة</Label>
            <Input id="date" type="date" max={today()} {...register('date')} />
            {errors.date && (
              <span className="text-xs text-destructive">
                {errors.date.message}
              </span>
            )}
          </div>
        </div>

        {/* التقييمات */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Controller
              name="satisfaction"
              control={control}
              render={({ field }) => (
                <RatingInput
                  label="كيف تقيم رضاك عن الخدمة المقدمة؟"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.satisfaction?.message}
                />
              )}
            />
            <Controller
              name="recommendation"
              control={control}
              render={({ field }) => (
                <RatingInput
                  label="ما مدى احتمال أن توصي بهذه الخدمة للآخرين؟"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* درجة تطبيق التوصيات */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="implementationStatus">
            إلى أي درجة تم تطبيق التوصيات والنتائج من هذه الخدمة؟
          </Label>
          <Select
            id="implementationStatus"
            options={IMPLEMENTATION_OPTIONS.map((status) => ({
              value: status,
              label: IMPLEMENTATION_STATUS[status].label,
            }))}
            {...register('implementationStatus')}
          />
        </div>

        {/* مجالات المساهمة */}
        <div className="flex flex-col gap-2">
          <Label>ساهمت الاستشارة المقدمة من خلال:</Label>
          <Controller
            name="contributionAreas"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {CONTRIBUTION_AREAS.map((area) => {
                  const checked = field.value.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          checked
                            ? field.value.filter((v) => v !== area)
                            : [...field.value, area],
                        )
                      }
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                        checked
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40',
                      )}
                    >
                      {checked && <Check className="h-3 w-3" />}
                      {area}
                    </button>
                  );
                })}
              </div>
            )}
          />
          <Input
            placeholder="مجال آخر (اختياري)…"
            {...register('otherArea')}
          />
        </div>

        {/* ملاحظات نصية */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="implementationNotes">
              وصف موجز لكيفية تنفيذ التوصيات والنتائج المحققة (اختياري)
            </Label>
            <Textarea id="implementationNotes" {...register('implementationNotes')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="improvementNotes">
              ما هي الجوانب التي يمكن تحسينها في الخدمة؟ (اختياري)
            </Label>
            <Textarea id="improvementNotes" {...register('improvementNotes')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="futureServiceRequests">
              ما هي الخدمات الاستشارية المستقبلية المرغوبة؟ (اختياري)
            </Label>
            <Textarea
              id="futureServiceRequests"
              {...register('futureServiceRequests')}
            />
          </div>
        </div>

        {/* أزرار */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            <X className="h-4 w-4" />
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            حفظ
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
