// Application myCarto Atlas (concept) : pnpm dev:atlas → http://localhost:6007
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: fileURLToPath(new URL('./packages/atlas/app', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  plugins: [vue()],
  server: { port: 6007, strictPort: true },
  build: { outDir: fileURLToPath(new URL('./dist-atlas', import.meta.url)), emptyOutDir: true },
})
