import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // عند البناء للنشر على GitHub Pages يُقدَّم الموقع من مسار فرعي باسم المستودع.
  base: command === 'build' ? '/satisfaction-kpi-dashboard/' : '/',
  plugins: [react()],
  server: {
    // احترام منفذ بيئة التشغيل عند توفّره (مثل أدوات المعاينة).
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // فصل المكتبات الثقيلة لتسريع التحميل والتخزين المؤقت.
        manualChunks: {
          charts: ['recharts'],
          motion: ['framer-motion'],
          export: ['jspdf', 'html2canvas'],
        },
      },
    },
  },
}));
