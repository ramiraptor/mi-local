import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke de los flujos A (propietario publica) y B (emprendedor manifiesta
 * interés) contra `next dev` + Supabase local (supabase start).
 * Nota: el entorno local auto-confirma correos; la verificación real se probó
 * en tests/rls y se verifica manualmente en producción.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    locale: "es-CL",
  },
  projects: [
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
