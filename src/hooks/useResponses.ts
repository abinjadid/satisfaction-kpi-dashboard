import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  DashboardFilters,
  DashboardMetrics,
  Insight,
  SurveyResponse,
} from '@/types';
import { dataService } from '@/services/dataService';
import {
  computeDashboardMetrics,
  generateInsights,
} from '@/utils/calculations';

export const DEFAULT_FILTERS: DashboardFilters = {
  year: 'all',
  month: 'all',
  serviceType: 'all',
  entity: 'all',
  search: '',
};

interface UseResponsesResult {
  loading: boolean;
  responses: SurveyResponse[];
  filtered: SurveyResponse[];
  metrics: DashboardMetrics;
  insights: Insight[];
  filters: DashboardFilters;
  years: string[];
  setFilter: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => void;
  resetFilters: () => void;
  addResponse: (
    input: Omit<SurveyResponse, 'id' | 'createdAt'>,
  ) => Promise<void>;
  removeResponse: (id: string) => Promise<void>;
  resetData: () => Promise<void>;
}

/**
 * الـ hook المركزي لإدارة حالة الاستجابات: التحميل، التصفية، الحساب، والتعديل.
 * يعيد حساب المقاييس والاستنتاجات تلقائياً عند أي تغيير (لا حاجة لتحديث الصفحة).
 */
export function useResponses(): UseResponsesResult {
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  // التحميل الأولي.
  useEffect(() => {
    let active = true;
    (async () => {
      const data = await dataService.getAll();
      if (active) {
        setResponses(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // السنوات المتاحة مشتقّة من البيانات.
  const years = useMemo(() => {
    const set = new Set<string>();
    for (const r of responses) {
      set.add(new Date(r.date).getFullYear().toString());
    }
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [responses]);

  // تطبيق كل عوامل التصفية.
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return responses.filter((r) => {
      const d = new Date(r.date);
      if (filters.year !== 'all' && d.getFullYear().toString() !== filters.year)
        return false;
      if (filters.month !== 'all' && d.getMonth().toString() !== filters.month)
        return false;
      if (filters.serviceType !== 'all' && r.serviceType !== filters.serviceType)
        return false;
      if (filters.entity !== 'all' && r.entity !== filters.entity) return false;
      if (q) {
        const haystack =
          `${r.entity} ${r.serviceType} ${r.notes ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [responses, filters]);

  const metrics = useMemo(
    () => computeDashboardMetrics(filtered),
    [filtered],
  );
  const insights = useMemo(() => generateInsights(metrics), [metrics]);

  const setFilter = useCallback(
    <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const addResponse = useCallback(
    async (input: Omit<SurveyResponse, 'id' | 'createdAt'>) => {
      const created = await dataService.add(input);
      setResponses((prev) => [created, ...prev]);
    },
    [],
  );

  const removeResponse = useCallback(async (id: string) => {
    await dataService.remove(id);
    setResponses((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const resetData = useCallback(async () => {
    const seed = await dataService.reset();
    setResponses(seed);
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    loading,
    responses,
    filtered,
    metrics,
    insights,
    filters,
    years,
    setFilter,
    resetFilters,
    addResponse,
    removeResponse,
    resetData,
  };
}
