import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@desktop': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173
  }
})
