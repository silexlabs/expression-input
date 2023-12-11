import { defineConfig } from '@playwright/test'

export default defineConfig({
  files: ['src/**/*.test.ts'],
  // Run your local dev server before starting the tests.
  //webServer: {
  //  command: 'npm run serve',
  //  url: 'http://localhost:3000',
  //},
  //use: {
  //  baseURL: 'http://localhost:8000',
  //},
   use: {
    ctViteConfig: {
      resolve: {
        alias: {
          '@': './src',
          'src': './src',
        },
      },
    },
  },
})