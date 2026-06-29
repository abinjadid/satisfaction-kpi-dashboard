import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type { DashboardFilters } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, type SelectOption } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ENTITIES, MONTHS_AR, SERVICE_TYPES } from '@/utils/constants';

interface FiltersProps {
  filters: DashboardFilters;
  years: string[];
  onChange: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => void;
  onReset: () => void;
}

const withAll = (label: string, options: SelectOption[]): SelectOption[] => [
  { value: 'all', label },
  ...options,
];

/** شريط التصفية: السنة، الشهر، نوع الخدمة، الجهة، البحث، وإعادة التعيين. */
export function Filters({ filters, years, onChange, onReset }: FiltersProps) {
  const yearOptions = withAll(
    'كل السنوات',
    years.map((y) => ({ value: y, label: y })),
  );
  const monthOptions = withAll(
    'كل الأشهر',
    MONTHS_AR.map((m, i) => ({ value: i.toString(), label: m })),
  );
  const serviceOptions = withAll(
    'كل الخدمات',
    SERVICE_TYPES.map((s) => ({ value: s, label: s })),
  );
  const entityOptions = withAll(
    'كل الجهات',
    ENTITIES.map((e) => ({ value: e, label: e })),
  );

  return (
    <Card className="no-print p-5">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-card-foreground">
          تصفية البيانات
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-year">السنة</Label>
          <Select
            id="f-year"
            options={yearOptions}
            value={filters.year}
            onChange={(e) => onChange('year', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-month">الشهر</Label>
          <Select
            id="f-month"
            options={monthOptions}
            value={filters.month}
            onChange={(e) => onChange('month', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-service">نوع الخدمة</Label>
          <Select
            id="f-service"
            options={serviceOptions}
            value={filters.serviceType}
            onChange={(e) => onChange('serviceType', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-entity">الجهة</Label>
          <Select
            id="f-entity"
            options={entityOptions}
            value={filters.entity}
            onChange={(e) => onChange('entity', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-search">بحث</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="f-search"
              className="pr-9"
              placeholder="ابحث في الجهات أو الملاحظات…"
              value={filters.search}
              onChange={(e) => onChange('search', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={onReset}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>
      </div>
    </Card>
  );
}
