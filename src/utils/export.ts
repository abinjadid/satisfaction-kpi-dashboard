/**
 * أدوات التصدير: PDF عالي الدقة، صورة PNG، CSV و Excel.
 * تعتمد على html2canvas + jsPDF لالتقاط اللوحة كما تظهر مع الحفاظ على الألوان وRTL.
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { SurveyResponse } from '@/types';
import { DIMENSION_KEYS, DIMENSION_LABELS } from './constants';
import { responseAverage } from './calculations';

/** التقاط عنصر DOM كـ canvas بدقة عالية مع خلفية بيضاء. */
async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2, // دقة مضاعفة لإخراج حاد
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
}

/** بدء تنزيل ملف من رابط بيانات أو Blob. */
function triggerDownload(href: string, filename: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** تصدير العنصر كصورة PNG عالية الدقة. */
export async function exportToPng(
  element: HTMLElement,
  filename = `تقرير-الرضا-${dateStamp()}.png`,
): Promise<void> {
  const canvas = await captureElement(element);
  triggerDownload(canvas.toDataURL('image/png'), filename);
}

/**
 * تصدير العنصر إلى تقرير PDF بحجم A4 عمودي.
 * يقسّم المحتوى الطويل على عدّة صفحات دون قص العناصر.
 */
export async function exportToPdf(
  element: HTMLElement,
  filename = `تقرير-الرضا-${dateStamp()}.pdf`,
): Promise<void> {
  const canvas = await captureElement(element);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  // ارتفاع الصورة بعد ملاءمتها لعرض الصفحة.
  const imgHeight = (canvas.height * usableWidth) / canvas.width;

  if (imgHeight <= usableHeight) {
    pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight);
  } else {
    // التقسيم على صفحات متعددة باستخدام إزاحة عمودية.
    let remaining = imgHeight;
    let position = margin;
    let pageIndex = 0;
    while (remaining > 0) {
      if (pageIndex > 0) {
        pdf.addPage();
        position = margin - pageIndex * usableHeight;
      }
      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
      remaining -= usableHeight;
      pageIndex += 1;
    }
  }

  pdf.save(filename);
}

/** تحويل قيمة إلى خلية CSV آمنة (تغليف وهروب علامات الاقتباس). */
function csvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** بناء صفوف CSV من الاستجابات (تُستخدم لـ CSV و Excel). */
function buildRows(responses: SurveyResponse[]): (string | number)[][] {
  const header = [
    'الجهة',
    'نوع الخدمة',
    'تاريخ الاستجابة',
    ...DIMENSION_KEYS.map((k) => DIMENSION_LABELS[k]),
    'المتوسط',
    'التوصية',
    'ملاحظات',
  ];
  const rows = responses.map((r) => [
    r.entity,
    r.serviceType,
    r.date,
    ...DIMENSION_KEYS.map((k) => r.dimensions[k]),
    responseAverage(r).toFixed(2),
    r.recommends ? 'نعم' : 'لا',
    r.notes ?? '',
  ]);
  return [header, ...rows];
}

/** تصدير الاستجابات كملف CSV (مع BOM لدعم العربية في Excel). */
export function exportToCsv(
  responses: SurveyResponse[],
  filename = `بيانات-الرضا-${dateStamp()}.csv`,
): void {
  const rows = buildRows(responses);
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

/**
 * تصدير Excel عبر جدول HTML يفتحه Excel أصلاً.
 * يتجنّب الاعتماد على مكتبة إضافية مع الحفاظ على التنسيق والاتجاه RTL.
 */
export function exportToExcel(
  responses: SurveyResponse[],
  filename = `بيانات-الرضا-${dateStamp()}.xls`,
): void {
  const rows = buildRows(responses);
  const thead = `<tr>${rows[0]
    .map(
      (c) =>
        `<th style="background:#006C35;color:#fff;padding:6px;border:1px solid #ccc">${c}</th>`,
    )
    .join('')}</tr>`;
  const tbody = rows
    .slice(1)
    .map(
      (row) =>
        `<tr>${row
          .map(
            (c) =>
              `<td style="padding:6px;border:1px solid #ddd;text-align:center">${c}</td>`,
          )
          .join('')}</tr>`,
    )
    .join('');

  const html = `<html dir="rtl"><head><meta charset="utf-8" /></head>
    <body><table style="border-collapse:collapse;font-family:'IBM Plex Sans Arabic',sans-serif">
    <thead>${thead}</thead><tbody>${tbody}</tbody></table></body></html>`;

  const blob = new Blob(['﻿' + html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}
