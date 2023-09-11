import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: './',
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      compress: true,
      keep_classnames: true
    },
    rollupOptions: {
      input: ['./src/checkout6-custom.js', './src/checkout6-custom.scss'],
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
      plugins: [{
        name: 'wrap-in-iife',
        generateBundle(outputOptions, bundle) {
          Object.keys(bundle).forEach((fileName) => {
            const file = bundle[fileName]
            if (fileName.slice(-3) === '.js' && 'code' in file) {
              file.code = `(($) => {\n${file.code}})(jQuery)`
            }
          })
        }
      }]
    },
    watch: {
      exclude: 'node_modules/**',
      include: '/src/**/*.{js,scss}',
    },
  },
})
