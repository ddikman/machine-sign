import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: process.env.VITE_BASE_URL || '/',
  publicDir: 'public',
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
      if (hostType === 'html' && filename.startsWith('/static/')) {
        return `${process.env.VITE_BASE_URL || '/'}${filename.slice(1)}`
      }
      return filename
    }
  }
})
