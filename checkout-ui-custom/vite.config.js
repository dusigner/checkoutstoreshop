import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import manifest from '../manifest.json' assert { type: 'json' }

const version = manifest.version
const vendor = manifest.vendor
const name = manifest.name

function generateCheckoutScript(buildState, assetVisibility, env) {
  return {
    name: 'generate-checkout6-custom',
    closeBundle() {
      const templatePath = path.resolve(__dirname, 'checkout-template.js')
      const outputPath = path.resolve(__dirname, 'checkout6-custom.js')

      let content = fs.readFileSync(templatePath, 'utf-8')
      content = content
        .replace(/__VERSION__/g, version)
        .replace(/__BUILD_STATE__/g, buildState)
        .replace(/__ASSET_VISIBILITY__/g, assetVisibility)

      fs.writeFileSync(outputPath, content)
      console.log(`✅ Ambiente: ${env}, assetVisibility: ${assetVisibility}, buildState: ${buildState}`)
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

function checkRootPathPlugin() {
  return {
    name: 'check-rootpath',
    enforce: 'pre',
    buildStart() {
      const files = [];
      const walk = (dir) => {
        fs.readdirSync(dir).forEach((file) => {
          const filepath = path.join(dir, file);
          const stat = fs.statSync(filepath);
          if (stat.isDirectory()) {
            walk(filepath);
          } else if (/\.(js|ts|jsx|tsx)$/.test(file)) {
            files.push(filepath);
          }
        });
      };

      walk(path.resolve(__dirname, './src'));

      const regex = /\b(window\.location\.(href|assign)|navigate)\s*=\s*([`'"])\s*\/checkout|\b(window\.location\.(href|assign)|navigate)\s*\(\s*([`'"])\s*\/checkout/i;
      const errors = [];

      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        content.split('\n').forEach((line, idx) => {
          if (regex.test(line) && !/rootPath\s*\(/.test(line)) {
            errors.push(`${file}:${idx + 1} → ${line.trim()}`);
          }
        });
      });

      if (errors.length) {
        this.error(
          `🚨 Foram encontrados redirecionamentos ou URLs para /checkout sem rootPath:\n${errors.join('\n')}`
        );
      }
    }
  };
}

export default defineConfig(({}) => {
  const env = process.env.NODE_ENV
  const isProduction = env === 'production'
  
  const buildState = isProduction ? 'published' : 'linked'
  const assetVisibility = isProduction ? 'public' : 'private'

  return {
    define: {
      __CHECKOUT_NAME__: JSON.stringify(name),
      __CHECKOUT_VENDOR__: JSON.stringify(vendor),
      __CHECKOUT_VERSION__: JSON.stringify(version),
      __BUILD_STATE__: JSON.stringify(buildState),
      __VISIBILITY__: JSON.stringify(assetVisibility),
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
      watch: process.env.CI ? null : {
        exclude: 'node_modules/**',
        include: ['/src/**/*.{js,scss}','checkout-template.js']
      },
    },
    plugins: [
      generateCheckoutScript(buildState, assetVisibility, env),
      copyCheckoutCssFromBuildOutput(),
      checkRootPathPlugin()
    ],
  }
})
