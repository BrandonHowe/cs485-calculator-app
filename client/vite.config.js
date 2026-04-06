const react = require('@vitejs/plugin-react')
const { defineConfig } = require('vite')
const apiPort = Number(process.env.CALC_API_PORT || 5000)

module.exports = defineConfig({
  plugins: [react()],
  root: 'client',
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true
      }
    },
    host: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
