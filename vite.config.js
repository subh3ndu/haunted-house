import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  base: '/haunted-house/',
  server: {
    open: true,
  },
})
