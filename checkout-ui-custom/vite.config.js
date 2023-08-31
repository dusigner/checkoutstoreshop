import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: './',
    minify: true,
    emptyOutDir: false,
    rollupOptions: {
      logLevel: 'info',
      input: ['./src/checkout6-custom.js', './src/checkout6-custom.scss'],
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    },
    watch: {
      exclude: 'node_modules/**',
      include: '/src/**/*.{js,scss}',
    },
  },
})
