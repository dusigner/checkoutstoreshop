import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import manifest from '../manifest.json' assert { type: 'json' }

const version = manifest.version
const vendor = manifest.vendor
const name = manifest.name

function generateCheckoutScript() {
  return {
    name: 'generate-checkout6-custom',
    closeBundle() {
      const templatePath = path.resolve(__dirname, 'checkout-template.js')
      const outputPath = path.resolve(__dirname, 'checkout6-custom.js')

      let content = fs.readFileSync(templatePath, 'utf-8')
      content = content.replace(/__VERSION__/g, version)

      fs.writeFileSync(outputPath, content)
      console.log(`✅ checkout6-custom.js gerado com versão ${version}`)
    }
  }
}

function copyCheckoutCssFromBuildOutput() {
  return {
    name: 'copy-generated-standard-css',
    closeBundle() {
      const sourcePath = path.resolve(__dirname, '../public/checkout/standard/style.css')
      const destPath = path.resolve(__dirname, 'checkout6-custom.css')

      try {
        fs.copyFileSync(sourcePath, destPath)
        console.log('✅ checkout6-custom.css copiado de /public/checkout/standard/style.css para a raiz com sucesso.')
      } catch (err) {
        console.error('❌ Erro ao copiar style.css como checkout6-custom.css:', err)
      }
    }
  }
}


export default defineConfig({
  define: {
    __CHECKOUT_NAME__: JSON.stringify(name),
    __CHECKOUT_VENDOR__: JSON.stringify(vendor),
    __CHECKOUT_VERSION__: JSON.stringify(version),
  },
  build: {
    outDir: '../public',
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      compress: true,
      keep_classnames: true
    },
    rollupOptions: {
      input: {
        // Entradas para checkout padrão
        'checkout/standard/script': path.resolve(__dirname, 'src/standard/checkout6-custom.js'),
        'checkout/standard/style': path.resolve(__dirname, 'src/standard/checkout6-custom.scss'),
        // Entradas para checkout one page
        'checkout/onepage/script': path.resolve(__dirname, 'src/onepage/checkout6-custom.js'),
        'checkout/onepage/style': path.resolve(__dirname, 'src/onepage/checkout6-custom.scss'),
      },
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
              file.code = `;(($) => {\n${file.code}})(jQuery)`
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
  plugins: [
    generateCheckoutScript(),
    copyCheckoutCssFromBuildOutput()
  ],
})
