import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:3200',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    dedupe: ['vue', '@vue/apollo-composable', '@apollo/client'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
