// Application myCarto Atlas (concept) : pnpm dev:atlas → http://localhost:6007
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// En ligne, l'application est servie sous /app/ à côté du site vitrine : ATLAS_BASE=/app/ (voir build:atlas:site).
const base = process.env.ATLAS_BASE ?? '/'

export default defineConfig({
  base,
  root: fileURLToPath(new URL('./packages/atlas/app', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  plugins: [vue()],
  server: { port: 6007, strictPort: true },
  build: { outDir: fileURLToPath(new URL(process.env.ATLAS_OUT ?? './dist-atlas', import.meta.url)), emptyOutDir: true },
})
