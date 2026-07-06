import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Node's process at config-eval time (no @types/node in the app tsconfig).
declare const process: { env: Record<string, string | undefined> }

// BASE_PATH is set to '/mdatlas/' for the GitHub Pages project-site deploy
// (assets are served under the repo subpath); defaults to '/' for local dev.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
})
