import { motion } from 'framer-motion';
import {
  CalendarClock,
  MessageSquareText,
  Star,
  ThumbsUp,
} from 'lucide-react';
import type { DashboardMetrics } from '@/types';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { Sparkline } from '@/components/charts/Sparkline';
import { TrendIndicator } from './TrendIndicator';
import { useCountUp } from '@/hooks/useCountUp';
import { BRAND } from '@/utils/constants';
import { formatDateAr } from '@/utils/format';

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

/** بطاقة عدّاد متحرّك بسيطة تُستخدم لعرض رقم كبير. */
function AnimatedValue({
  value,
  decimals = 0,
  suffix = '',
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const animated = useCountUp(value, 1100);
  return (
    <span>
      {animated.toLocaleString('ar-SA-u-nu-latn', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/** صف بطاقات المؤشرات الرئيسية الخمسة أعلى اللوحة. */
export function KpiCards({ metrics }: KpiCardsProps) {
  const sparkData = metrics.monthly
    .filter((m) => m.responses > 0)
    .map((m) => m.satisfaction);
  const respSpark = metrics.monthly.map((m) => m.responses);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="dashboard-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {/* 1) مؤشر الرضا العام مع حلقة تقدّم */}
      <motion.div variants={item} className="print-block">
        <Card className="flex h-full items-center gap-4 p-5 hover:shadow-card-hover">
          <ProgressRing
            value={metrics.overallSatisfaction.value}
            color={BRAND.primary}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              مؤشر الرضا العام
            </p>
            <p className="mt-1 text-2xl font-extrabold text-card-foreground">
              <AnimatedValue
                value={metrics.overallSatisfaction.value}
                suffix="%"
              />
            </p>
            <div className="mt-2">
              <TrendIndicator metric={metrics.overallSatisfaction} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 2) عدد الاستجابات */}
      <motion.div variants={item} className="print-block">
        <Card className="flex h-full flex-col justify-between p-5 hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <TrendIndicator metric={metrics.responsesMetric} suffix="" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-card-foreground">
              <AnimatedValue value={metrics.totalResponses} />
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              عدد الاستجابات
            </p>
          </div>
          <div className="mt-1 h-8">
            <Sparkline data={respSpark} color={BRAND.secondary} height={32} />
          </div>
        </Card>
      </motion.div>

      {/* 3) متوسط التقييم */}
      <motion.div variants={item} className="print-block">
        <Card className="flex h-full flex-col justify-between p-5 hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Star className="h-5 w-5" />
            </span>
            <TrendIndicator metric={metrics.averageRating} suffix="" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-card-foreground">
              <AnimatedValue value={metrics.averageRating.value} decimals={2} />
              <span className="text-base font-semibold text-muted-foreground">
                {' '}
                / 5
              </span>
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              متوسط التقييم
            </p>
          </div>
          <div className="mt-1 h-8">
            <Sparkline
              data={sparkData.map((v) => (v / 100) * 5)}
              color={BRAND.amber}
              height={32}
            />
          </div>
        </Card>
      </motion.div>

      {/* 4) نسبة التوصية */}
      <motion.div variants={item} className="print-block">
        <Card className="flex h-full items-center gap-4 p-5 hover:shadow-card-hover">
          <ProgressRing
            value={metrics.recommendationRate.value}
            color={BRAND.accent}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              نسبة التوصية بالخدمة
            </p>
            <p className="mt-1 text-2xl font-extrabold text-card-foreground">
              <AnimatedValue
                value={metrics.recommendationRate.value}
                suffix="%"
              />
            </p>
            <div className="mt-2">
              <TrendIndicator metric={metrics.recommendationRate} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 5) آخر تحديث */}
      <motion.div variants={item} className="print-block">
        <Card className="flex h-full flex-col justify-between bg-gradient-to-br from-primary to-[#015a2c] p-5 text-primary-foreground hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <CalendarClock className="h-5 w-5" />
            </span>
            <ThumbsUp className="h-5 w-5 opacity-70" />
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold leading-tight">
              {formatDateAr(metrics.lastUpdated ?? new Date().toISOString())}
            </p>
            <p className="text-xs font-medium text-white/80">آخر تحديث</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
