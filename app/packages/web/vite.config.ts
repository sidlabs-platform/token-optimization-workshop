import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@sentinelops/shared': path.resolve(__dirname, '../shared/src/index.ts') } },
  server: { port: 5173 },
  build: { outDir: 'dist' },
});
