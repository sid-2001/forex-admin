//@ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
//@ts-ignore
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['date-fns'],
    // include: ['ckeditor5-custom-build'],
  },
  server: {
    mimeTypes: {
      js: 'application/javascript',
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /ckeditor5/],
    },
  },
  resolve: {
    alias: {
      //@ts-ignore
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
