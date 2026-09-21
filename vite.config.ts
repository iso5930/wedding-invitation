import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    // GitHub project Pages: https://iso5930.github.io/wedding-invitation/
    // Use '/' for a custom domain or a username.github.io repository.
    base: env.VITE_BASE_PATH || '/wedding-invitation/',
  }
})
