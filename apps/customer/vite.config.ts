// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM で __dirname 相当を作る
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@eoa/common': path.resolve(__dirname, '../../lib/common/src'),
      '@eoa/core':   path.resolve(__dirname, '../../lib/core/src'),
      '@eoa/utils':  path.resolve(__dirname, '../../lib/utils/src'),
    }
  },
  server: {
    fs: {
      allow: ['..', '../..']
    }
  }
})
