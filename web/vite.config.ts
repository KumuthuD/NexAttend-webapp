import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,  // sourcemaps in dev/staging, off in production
      minify: isProduction ? 'esbuild' : false,
      chunkSizeWarningLimit: 1500,  // raise limit for large app bundles
      rollupOptions: {
        output: {
          // Split large dependencies into separate cacheable chunks
          manualChunks(id) {
            // Vendor chunks — heavy libraries cached separately
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/axios')) {
              return 'vendor-axios';
            }
            // App page-level chunks
            if (id.includes('/pages/LandingPage')) return 'page-landing';
            if (id.includes('/pages/DashboardPage') || id.includes('/pages/AttendanceHistoryPage') || id.includes('/pages/CalendarPage')) return 'page-dashboard';
            if (id.includes('/pages/ClassroomPage')) return 'page-classroom';
            if (id.includes('/pages/SettingsPage') || id.includes('/pages/ProfilePage')) return 'page-settings';
          },
        },
      },
    },
  };
});
