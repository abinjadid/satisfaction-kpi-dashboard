import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X } from 'lucide-react';
import type { SurveyResponse } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RatingInput } from './RatingInput';
import {
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  ENTITIES,
  SERVICE_TYPES,
} from '@/utils/constants';

interface AddResponseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SurveyResponse, 'id' | 'createdAt'>) => void;
}

const ratingSchema = z
  .number({ invalid_type_error: 'مطلوب' })
  .int()
  .min(1, 'التقييم مطلوب')
  .max(5);

/** مخطط التحقق من صحة نموذج إضافة استجابة. */
const formSchema = z.object({
  entity: z.string().min(1, 'يرجى اختيار الجهة'),
  serviceType: z.string().min(1, 'يرجى اختيار نوع الخدمة'),
  date: z.string().min(1, 'يرجى تحديد تاريخ الاستجابة'),
  quality: ratingSchema,
  speed: ratingSchema,
  clarity: ratingSchema,
  communication: ratingSchema,
  professionalism: ratingSchema,
  addedValue: ratingSchema,
  recommends: z.enum(['yes', 'no']),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
});

type FormValues = z.infer<typeof formSchema>;

const today = () => new Date().toISOString().slice(0, 10);

const defaultValues: FormValues = {
  entity: '',
  serviceType: '',
  date: today(),
  quality: 0,
  speed: 0,
  clarity: 0,
  communication: 0,
  professionalism: 0,
  addedValue: 0,
  recommends: 'yes',
  notes: '',
};

/** نافذة حوارية لإضافة استجابة جديدة مع تحقق كامل من المدخلات. */
export function AddResponseDialog({
  open,
  onClose,
  onSubmit,
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
    onSubmit({
      entity: values.entity,
      serviceType: values.serviceType,
      date: values.date,
      dimensions: {
        quality: values.quality,
        speed: values.speed,
        clarity: values.clarity,
        communication: values.communication,
        professionalism: values.professionalism,
        addedValue: values.addedValue,
      },
      recommends: values.recommends === 'yes',
      notes: values.notes?.trim() || '',
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
      description="أدخل تقييم الجهة المستفيدة لتحديث المؤشرات تلقائياً."
    >
      <form onSubmit={submit} className="space-y-5">
        {/* بيانات أساسية */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entity">اسم الجهة</Label>
            <Select
              id="entity"
              options={[
                { value: '', label: 'اختر الجهة…' },
                ...ENTITIES.map((e) => ({ value: e, label: e })),
              ]}
              {...register('entity')}
            />
            {errors.entity && (
              <span className="text-xs text-destructive">
                {errors.entity.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="serviceType">نوع الخدمة</Label>
            <Select
              id="serviceType"
              options={[
                { value: '', label: 'اختر الخدمة…' },
                ...SERVICE_TYPES.map((s) => ({ value: s, label: s })),
              ]}
              {...register('serviceType')}
            />
            {errors.serviceType && (
              <span className="text-xs text-destructive">
                {errors.serviceType.message}
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

        {/* تقييم الأبعاد */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-bold text-foreground">
            تقييم أبعاد الخدمة (من 1 إلى 5)
          </h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {DIMENSION_KEYS.map((key) => (
              <Controller
                key={key}
                name={key}
                control={control}
                render={({ field }) => (
                  <RatingInput
                    label={DIMENSION_LABELS[key]}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors[key]?.message}
                  />
                )}
              />
            ))}
          </div>
        </div>

        {/* التوصية */}
        <div className="flex flex-col gap-2">
          <Label>هل توصي بالخدمة؟</Label>
          <Controller
            name="recommends"
            control={control}
            render={({ field }) => (
              <div className="flex gap-3">
                {(
                  [
                    { value: 'yes', label: 'نعم، أوصي بها' },
                    { value: 'no', label: 'لا' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={
                      'flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ' +
                      (field.value === opt.value
                        ? opt.value === 'yes'
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40')
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* ملاحظات */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">ملاحظات (اختياري)</Label>
          <Textarea
            id="notes"
            placeholder="أي ملاحظات إضافية حول الخدمة…"
            {...register('notes')}
          />
          {errors.notes && (
            <span className="text-xs text-destructive">
              {errors.notes.message}
            </span>
          )}
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
