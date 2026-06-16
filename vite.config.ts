import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babelPlugin from '@rolldown/plugin-babel'

const babelInstance = await babelPlugin({
  include: /\.[jt]sx?$/,
  presets: [reactCompilerPreset()],
})

export default defineConfig({
  plugins: [babelInstance, react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
