import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return '' // sin git o sin historial (por ejemplo una imagen construida sin .git)
  }
}

/**
 * Novedades: se arman en cada build con los commits `feat`, `fix` y `perf` del historial, así que
 * cada despliegue de la web publica solas sus novedades. Sin git la lista queda vacía.
 */
const changelog = () => {
  const raw = git('log', '--no-merges', '-300', '--date=short', '--pretty=format:%h\t%ad\t%s')
  return raw
    .split('\n')
    .map((line) => line.split('\t'))
    .map(([hash, date, subject]) => {
      const m = /^(feat|fix|perf)(?:\(([^)]+)\))?!?:\s*(.+)$/.exec(subject ?? '')
      return m ? { hash, date, type: m[1], scope: m[2] ?? '', title: m[3] } : null
    })
    .filter(Boolean)
    .slice(0, 60)
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
  return {
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
      __COMMIT__: JSON.stringify(git('rev-parse', '--short', 'HEAD')),
      __CHANGELOG__: JSON.stringify(changelog()),
    },
    server: {
      // En desarrollo la web llama a /api en su propio origen y Vite lo reenvía al gateway, igual
      // que nginx en la pila de Docker: las cookies HttpOnly de la sesión funcionan sin CORS.
      proxy: {
        '/api': env.VITE_DEV_API_TARGET || 'http://localhost:8080',
      },
    },
  }
})
