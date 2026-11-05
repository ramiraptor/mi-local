/**
 * E2E smoke — Flujo A (propietario publica) y Flujo B (emprendedor manifiesta
 * interés) sobre next dev + Supabase local.
 */
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const RUN = Date.now().toString(36);
const OWNER_EMAIL = `owner-e2e-${RUN}@test.milocal.cl`;
const BUYER_EMAIL = `buyer-e2e-${RUN}@test.milocal.cl`;
const PASSWORD = "Pa55word-e2e!";
const PROPERTY_TITLE = `Local E2E ${RUN}`;
const SECRET_ADDRESS = "Calle Privada Secreta 1234";

test.describe.configure({ mode: "serial" });

let propertyUrl = "";

async function register(
  page: Page,
  opts: { email: string; name: string },
): Promise<void> {
  await page.getByLabel("Nombre completo").fill(opts.name);
  await page.getByLabel("Correo electrónico").fill(opts.email);
  await page.getByLabel("Teléfono").fill("+56 9 8765 4321");
  await page.getByLabel("Contraseña", { exact: false }).fill(PASSWORD);
  await page.getByText("Declaro ser mayor de 18 años").click();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
}

test("Flujo A: assessment propietario → registro → fotos → PUBLISHED", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("local");

  // CTA «Tengo un local»
  await page.getByRole("link", { name: "Tengo un local" }).click();
  await expect(page).toHaveURL(/evaluacion\/propietario/);

  // Paso 1 · Oferente
  await page.getByRole("radiogroup", { name: "¿Cuál es tu rol?" }).getByText("Propietario/a").click();
  await page
    .getByRole("radiogroup", { name: "¿Y tu relación con ESTE inmueble?" })
    .getByText("Propietario/a")
    .click();
  await page
    .getByRole("radiogroup", { name: "¿Cómo prefieres que MiLocal te contacte?" })
    .getByText("WhatsApp")
    .click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // Paso 2 · Inmueble
  await page.getByRole("radiogroup", { name: "Tipo de inmueble" }).getByText("Local comercial").click();
  await page.getByLabel("Título de la publicación").fill(PROPERTY_TITLE);
  await page.getByLabel("Descripción (opcional)").fill("Local de prueba E2E, luminoso y céntrico.");
  await page.getByLabel("Superficie (m²)").fill("120");
  await page.getByLabel("Baños").fill("2");
  await page.getByRole("radiogroup", { name: "Condición física" }).getByText("Bueno", { exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // Paso 3 · Ubicación (dirección exacta PRIVADA)
  await page.getByLabel("Región").selectOption({ label: "Región Metropolitana de Santiago" });
  await page.getByLabel("Comuna").selectOption({ label: "Ñuñoa" });
  await page.getByLabel("Sector o barrio referencial", { exact: false }).fill("Plaza Ñuñoa");
  await page.getByLabel("Dirección exacta (privada)").fill(SECRET_ADDRESS);
  await page.getByRole("button", { name: "Continuar" }).click();

  // Paso 4 · Comercial
  await page.getByLabel("Renta mensual (CLP)").fill("1200000");
  await page.getByRole("button", { name: "Continuar" }).click();

  // Paso 5 · Disponibilidad
  await page.getByRole("button", { name: "Continuar" }).click();

  // Paso 6 · Atributos
  await page.getByRole("radiogroup", { name: "Salida de gases" }).getByText("Sí", { exact: true }).click();
  await page.getByLabel("Estacionamientos", { exact: false }).fill("2");
  await page.getByRole("button", { name: "Finalizar" }).click();

  // Registro exprés con contexto propietario
  await page.getByRole("link", { name: "Crear cuenta y continuar" }).click();
  await expect(page).toHaveURL(/registro/);
  await register(page, { email: OWNER_EMAIL, name: "Propietaria E2E" });

  // Vinculación del borrador y aterrizaje en Mis locales
  await page.waitForURL((url) => url.pathname === "/mis-locales", { timeout: 45_000 });
  await expect(page.getByText(PROPERTY_TITLE)).toBeVisible();
  await expect(page.getByText("Borrador incompleto").first()).toBeVisible();

  // Editor: subir una fotografía (el pipeline sanea EXIF/GPS en el servidor)
  await page.getByRole("link", { name: "Editar ficha" }).first().click();
  await page.waitForURL(/mis-locales\/.+/);

  const dir = mkdtempSync(path.join(tmpdir(), "milocal-e2e-"));
  const photoPath = path.join(dir, "foto.jpg");
  const jpeg = await sharp({
    create: { width: 1200, height: 900, channels: 3, background: { r: 20, g: 120, b: 110 } },
  })
    .jpeg({ quality: 85 })
    .toBuffer();
  writeFileSync(photoPath, jpeg);
  await page.setInputFiles('input[type="file"]', photoPath);
  await expect(page.getByText("Fotografías (1/12)")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Portada", { exact: true })).toBeVisible();

  // Publicar: DRAFT → PUBLISHED inmediato (sin aprobación previa)
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByText("Estado: Publicada")).toBeVisible({ timeout: 30_000 });

  // Visible en Explorar
  await page.goto("/explorar");
  const card = page.getByRole("link", { name: new RegExp(PROPERTY_TITLE) });
  await expect(card).toBeVisible();
  await card.click();
  await page.waitForURL(/propiedad\/.+/);
  propertyUrl = new URL(page.url()).pathname;

  // Ficha pública sin PII: ni dirección exacta ni datos del oferente
  await expect(page.getByRole("heading", { name: PROPERTY_TITLE })).toBeVisible();
  const body = await page.locator("body").innerText();
  expect(body).not.toContain(SECRET_ADDRESS);
  expect(body).not.toContain("Propietaria E2E");
  expect(body).not.toContain(OWNER_EMAIL);
  await expect(page.getByText("Ubicación aproximada")).toBeVisible();
});

test("Flujo B: visitante → registro exprés → Interest único e idempotente", async ({ page }) => {
  expect(propertyUrl).not.toBe("");

  // Visitante anónimo abre la ficha PUBLISHED sin login
  await page.goto(propertyUrl);
  await expect(page.getByRole("heading", { name: PROPERTY_TITLE })).toBeVisible();

  // «Me interesa» → registro exprés SIN assessment
  await page.getByRole("button", { name: "Me interesa" }).click();
  await expect(page).toHaveURL(/registro\?contexto=interes/);
  await register(page, { email: BUYER_EMAIL, name: "Camila E2E" });

  // return_to: vuelve exactamente a la ficha
  await page.waitForURL((url) => url.pathname === propertyUrl, { timeout: 45_000 });

  // Enviar CONTACT
  await page.getByText("Quiero que me contacten").click();
  await page.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page.getByText("Solicitud recibida")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Recuerda: esto no es una visita agendada", { exact: false })).toBeVisible();

  // Doble envío: recarga y reenvía → un solo Interest, insistencia registrada
  await page.reload();
  await expect(page.getByText("Ya enviaste una solicitud")).toBeVisible({ timeout: 30_000 });
  await page.getByText("Quiero coordinar una visita").click();
  await page.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page.getByText("registramos tu insistencia sin duplicarla")).toBeVisible({
    timeout: 30_000,
  });

  // En el perfil aparece UNA solicitud
  await page.goto("/perfil");
  await expect(page.getByText(PROPERTY_TITLE)).toBeVisible();
  await expect(page.getByText("2 envíos")).toBeVisible();
});
