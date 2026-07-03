import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Gauge,
  LineChart as LineChartIcon,
  ListChecks,
  PieChart as PieChartIcon,
  Plus,
  Sparkles,
  Table as TableIcon,
  ThumbsDown,
  Trophy,
} from 'lucide-react';

import { Header } from '@/components/dashboard/Header';
import { ReportHeader } from '@/components/dashboard/ReportHeader';
import { Filters } from '@/components/dashboard/Filters';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { SummaryInsights } from '@/components/dashboard/SummaryInsights';
import { ServicePerformance } from '@/components/dashboard/ServicePerformance';
import { RecentResponsesTable } from '@/components/dashboard/RecentResponsesTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { AddResponseDialog } from '@/components/forms/AddResponseDialog';

import { GaugeChart } from '@/components/charts/GaugeChart';
import { SatisfactionLineChart } from '@/components/charts/SatisfactionLineChart';
import { ResponsesBarChart } from '@/components/charts/ResponsesBarChart';
import { SatisfactionPieChart } from '@/components/charts/SatisfactionPieChart';
import { ImplementationStatusChart } from '@/components/charts/ImplementationStatusChart';
import { TopContributionAreasBarChart } from '@/components/charts/TopContributionAreasBarChart';

import { useResponses } from '@/hooks/useResponses';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import {
  exportToCsv,
  exportToExcel,
  exportToPdf,
  exportToPng,
} from '@/utils/export';
import { formatNumber, formatPercent } from '@/utils/format';

export default function App() {
  const {
    loading,
    filtered,
    metrics,
    insights,
    filters,
    years,
    entities,
    contributionAreas,
    setFilter,
    resetFilters,
    addResponse,
    removeResponse,
    resetData,
  } = useResponses();

  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const hasData = filtered.length > 0;

  /** حفظ استجابة جديدة مع تنبيه تأكيد. */
  const handleAdd = async (data: Parameters<typeof addResponse>[0]) => {
    await addResponse(data);
    setDialogOpen(false);
    toast({
      tone: 'success',
      title: 'تم حفظ الاستجابة بنجاح',
      description: 'تم تحديث جميع المؤشرات والمخططات تلقائياً.',
    });
  };

  const handleDelete = async (id: string) => {
    await removeResponse(id);
    toast({ tone: 'info', title: 'تم حذف الاستجابة' });
  };

  const handleReset = async () => {
    await resetData();
    toast({
      tone: 'info',
      title: 'تمت إعادة تعيين البيانات',
      description: 'تمت استعادة بيانات الاستبيان الأصلية.',
    });
  };

  const withExport = async (fn: () => Promise<void>, successMsg: string) => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      await fn();
      toast({ tone: 'success', title: successMsg });
    } catch (error) {
      console.error(error);
      toast({
        tone: 'error',
        title: 'تعذّر إكمال التصدير',
        description: 'حدث خطأ غير متوقع، يرجى المحاولة مجدداً.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = () =>
    withExport(
      () => exportToPdf(reportRef.current!),
      'تم تصدير تقرير PDF بنجاح',
    );

  const handleExportPng = () =>
    withExport(() => exportToPng(reportRef.current!), 'تم حفظ الصورة بنجاح');

  const handleExportCsv = () => {
    exportToCsv(filtered);
    toast({ tone: 'success', title: 'تم تصدير ملف CSV' });
  };

  const handleExportExcel = () => {
    exportToExcel(filtered);
    toast({ tone: 'success', title: 'تم تصدير ملف Excel' });
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportPdf={handleExportPdf}
        onExportPng={handleExportPng}
        onExportCsv={handleExportCsv}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
        onResetData={handleReset}
        exporting={exporting}
      />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="mb-6">
              <Filters
                filters={filters}
                years={years}
                entities={entities}
                contributionAreas={contributionAreas}
                onChange={setFilter}
                onReset={resetFilters}
              />
            </div>

            {/* منطقة الالتقاط للتقرير (PDF / PNG / طباعة) */}
            <div ref={reportRef} className="space-y-6 bg-background">
              <ReportHeader />

              {!hasData ? (
                <EmptyState
                  onAdd={() => setDialogOpen(true)}
                  onReset={handleReset}
                />
              ) : (
                <>
                  {/* بطاقات المؤشرات */}
                  <KpiCards metrics={metrics} />

                  {/* الصف الأول من المخططات */}
                  <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <SectionCard
                      title="مؤشر الرضا العام"
                      description="النسبة الإجمالية للرضا"
                      icon={Gauge}
                      index={0}
                    >
                      <div className="flex items-center justify-center py-2">
                        <GaugeChart value={metrics.overallSatisfaction.value} />
                      </div>
                    </SectionCard>

                    <SectionCard
                      title="تطوّر مؤشر الرضا عبر الأشهر"
                      description="النسبة الشهرية خلال العام"
                      icon={LineChartIcon}
                      index={1}
                      className="lg:col-span-2"
                    >
                      <SatisfactionLineChart data={metrics.monthly} />
                    </SectionCard>
                  </div>

                  {/* الصف الثاني */}
                  <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <SectionCard
                      title="عدد الاستجابات حسب الشهر"
                      description="توزيع الاستجابات على أشهر السنة"
                      icon={BarChart3}
                      index={0}
                    >
                      <ResponsesBarChart data={metrics.monthly} />
                    </SectionCard>

                    <SectionCard
                      title="توزيع مستويات الرضا"
                      description="نسب مستويات الرضا الخمسة"
                      icon={PieChartIcon}
                      index={1}
                    >
                      <SatisfactionPieChart distribution={metrics.distribution} />
                    </SectionCard>
                  </div>

                  {/* الصف الثالث */}
                  <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <SectionCard
                      title="حالة تطبيق التوصيات"
                      description="مدى تطبيق الجهات المستفيدة لتوصيات الاستشارة"
                      icon={CheckCircle2}
                      index={0}
                    >
                      <ImplementationStatusChart
                        breakdown={metrics.implementationBreakdown}
                      />
                    </SectionCard>

                    <SectionCard
                      title="أفضل مجالات مساهمة الاستشارات تقييماً"
                      description="ترتيب مجالات المساهمة حسب نسبة الرضا"
                      icon={Trophy}
                      index={1}
                    >
                      <TopContributionAreasBarChart
                        data={metrics.topContributionAreas}
                      />
                    </SectionCard>
                  </div>

                  {/* ملخص المؤشرات */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">
                        ملخص المؤشرات
                      </h2>
                    </div>
                    <SummaryInsights insights={insights} />
                  </section>

                  {/* أداء مجالات المساهمة + مؤشرات إضافية */}
                  <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <SectionCard
                      title="مجالات المساهمة الأعلى أداءً"
                      icon={Trophy}
                      index={0}
                    >
                      <ServicePerformance
                        areas={metrics.topContributionAreas.slice(0, 5)}
                        variant="top"
                      />
                    </SectionCard>

                    <SectionCard
                      title="مجالات المساهمة الأقل أداءً"
                      icon={ThumbsDown}
                      index={1}
                    >
                      <ServicePerformance
                        areas={metrics.bottomContributionAreas}
                        variant="bottom"
                      />
                    </SectionCard>

                    <SectionCard
                      title="مؤشرات تشغيلية"
                      icon={Activity}
                      index={2}
                    >
                      <div className="flex flex-col gap-4">
                        <StatRow
                          icon={Clock}
                          label="متوسط مدة تعبئة الاستبيان"
                          value={`${metrics.avgCompletionMinutes.toLocaleString('ar-SA-u-nu-latn')} دقيقة`}
                        />
                        <StatRow
                          icon={ListChecks}
                          label="إجمالي الاستجابات (بعد التصفية)"
                          value={formatNumber(metrics.totalResponses)}
                        />
                        <StatRow
                          icon={Trophy}
                          label="نسبة التقييمات الكاملة (5/5)"
                          value={formatPercent(metrics.perfectScoreRate)}
                        />
                      </div>
                    </SectionCard>
                  </div>

                  {/* جدول أحدث الاستجابات */}
                  <SectionCard
                    title="أحدث الاستجابات"
                    description="آخر الاستجابات المسجّلة مع إمكانية الفرز"
                    icon={TableIcon}
                  >
                    <RecentResponsesTable
                      responses={filtered}
                      onDelete={handleDelete}
                    />
                  </SectionCard>

                  {/* تذييل التقرير */}
                  <footer className="print-block border-t border-border pt-4 text-center text-xs text-muted-foreground">
                    تم إنشاء هذا التقرير آلياً من لوحة معلومات مؤشر الرضا عن
                    الخدمات الاستشارية · جميع الحقوق محفوظة © {new Date().getFullYear()}
                  </footer>
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* زر عائم لإضافة استجابة */}
      <AnimatePresence>
        {!loading && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setDialogOpen(true)}
            className="no-print fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-card-hover transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="إضافة استجابة"
          >
            <Plus className="h-5 w-5" />
            إضافة استجابة
          </motion.button>
        )}
      </AnimatePresence>

      <AddResponseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAdd}
        knownEntities={entities}
      />
    </div>
  );
}

/** صف إحصائي صغير داخل بطاقة المؤشرات التشغيلية. */
function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </span>
      <span className="text-sm font-bold text-card-foreground">{value}</span>
    </div>
  );
}
