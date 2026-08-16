import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
          'pages-home': ['./src/pages/HomePage.tsx'],
          'pages-products': ['./src/pages/ProductsPage.tsx'],
          'pages-product-detail': ['./src/pages/ProductDetailPage.tsx'],
          'pages-cart': ['./src/pages/CartPage.tsx'],
          'pages-checkout': ['./src/pages/CheckoutPage.tsx'],
          'pages-auth': [
            './src/pages/LoginPage.tsx',
            './src/pages/RegisterPage.tsx',
          ],
          'pages-account': ['./src/pages/AccountPage.tsx'],
          'pages-contact': ['./src/pages/ContactPage.tsx'],
          'pages-admin': [
            './src/pages/AdminDashboardPage.tsx',
            './src/pages/AdminProductsPage.tsx',
            './src/pages/AdminProductFormPage.tsx',
            './src/pages/AdminOrdersPage.tsx',
            './src/pages/AdminOrderDetailPage.tsx',
            './src/pages/AdminLoginPage.tsx',
          ],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`
          }
          if (/\.css$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    modulePreload: {
      polyfill: true,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
  },
})