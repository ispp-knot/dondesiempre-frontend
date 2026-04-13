import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { DEFAULT_MAP_LOCATION } from './lib/mapUtils';

// We expect the backend to already be running

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  retries: 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  webServer: [
    {
      command:
        'npm run build && node tests/scripts/copy-standalone.js && node .next/standalone/server.js',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 100000,
      // stdout: 'pipe', // <--- Verás los logs del Frontend
      // stderr: 'pipe',
    },
    {
      command: `cd ${process.env.DIR_BACKEND} && docker compose down -v postgres-test && docker compose up -d postgres-test && ${process.platform === 'win32' ? 'mvnw.cmd' : './mvnw'} clean spring-boot:run -D spring-boot.run.profiles=test -Dspring-boot.run.arguments="--stripe.secret.key=${process.env.STRIPE_SECRET_KEY}"`,
      url: 'http://localhost:8080',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
      // stdout: 'pipe', // <--- Verás los logs del Frontend
      // stderr: 'pipe',
    },
  ],
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',

    ignoreHTTPSErrors: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    headless: true,
    permissions: ['geolocation'],
    geolocation: { latitude: DEFAULT_MAP_LOCATION.lat, longitude: DEFAULT_MAP_LOCATION.lng },
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    //{
    //  name: 'chromium',
    //  use: { ...devices['Desktop Chrome'] },
    //},
    /*{
  name: 'firefox-developer',
  use: { 
    ...devices['Desktop Firefox'],
    // CAMBIO CLAVE: Ruta al ejecutable de tu Developer Edition
    // En Windows suele ser esta, compruébala en tu PC:
    launchOptions: {
      executablePath: '"C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Firefox Developer Edition.lnk"',
    }
  },
},*/

    //{
    //  name: 'webkit',
    //  use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    {
      name: 'setup-registro',
      testMatch: /.*\.setup\.ts/, // Ejecutará archivos que terminen en .setup.ts
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } }
          : {}),
      },
    },
    {
      name: 'tests',
      timeout: 300 * 10000,
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } }
          : {}),
      },
      dependencies: ['setup-registro'],
    },
    {
      name: 'failures',
      testMatch: /.*\.fail\.ts/, // Ejecutará archivos que terminen en .fail.ts
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } }
          : {}),
      },
      dependencies: ['setup-registro'],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
