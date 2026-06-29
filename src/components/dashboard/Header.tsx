import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Moon,
  Printer,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onResetData: () => void;
  exporting: boolean;
}

/** شريط علوي يحوي هوية اللوحة وأدوات التصدير والطباعة والوضع الليلي. */
export function Header({
  theme,
  onToggleTheme,
  onExportPdf,
  onExportPng,
  onExportCsv,
  onExportExcel,
  onPrint,
  onResetData,
  exporting,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 glass-header no-print">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* الهوية */}
        <div className="flex items-center gap-3">
          {/* عنصر نائب للشعار */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
              <path
                d="M6 13l4 4 8-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-extrabold leading-tight text-foreground sm:text-lg">
              لوحة معلومات مؤشر الرضا عن الخدمات الاستشارية
            </h1>
            <p className="text-xs text-muted-foreground">
              متابعة أداء رضا الجهات المستفيدة من الخدمات الاستشارية بشكل لحظي.
            </p>
          </div>
        </div>

        {/* الأدوات */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default" size="sm" onClick={onExportPdf} disabled={exporting}>
            <FileText className="h-4 w-4" />
            {exporting ? 'جارٍ التصدير…' : 'تصدير PDF'}
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPng} disabled={exporting}>
            <ImageIcon className="h-4 w-4" />
            صورة PNG
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={onExportCsv}>
            <FileDown className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onResetData}
            aria-label="إعادة تعيين البيانات"
            title="إعادة تعيين البيانات"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            aria-label="تبديل الوضع الليلي"
            title="تبديل الوضع الليلي"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
