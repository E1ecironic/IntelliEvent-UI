import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/intellievent': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 如果后端接口没有 /intellievent 前缀，则需要 rewrite
        // rewrite: (path) => path.replace(/^\/intellievent/, '')
      }
    }
  }
})
