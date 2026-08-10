import path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    // The entry chunk sits around 1 MB, mostly vendor. That is a real number
    // and not a mystery, so it does not need to be announced on every build;
    // the upgrade path when it starts mattering is splitting vendors out with
    // `output.manualChunks`, not raising this again.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        // Chakra ships `"use client"` directives with sourcemaps Rollup cannot
        // map back, so reporting them fails on a dependency we do not own.
        // Nothing in this repo can fix it and nothing here should read it.
        if (warning.code === 'SOURCEMAP_ERROR') return
        defaultHandler(warning)
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
})
