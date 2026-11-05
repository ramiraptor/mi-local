/**
 * Pruebas de RLS, acceso cruzado y reglas de negocio contra el stack local de
 * Supabase (supabase start + migraciones aplicadas).
 *
 * Cubre: deny-by-default, proyección pública sin PII, guard de transiciones,
 * Interest idempotente con snapshot congelado, gating ADMIN con MFA (aal2)
 * real vía TOTP, moderación, auditoría y analítica sin PII.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";

// TOTP RFC 6238 (SHA1, 6 dígitos, 30 s) para el enrolamiento MFA en tests
function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const c of input.replace(/=+$/g, "").toUpperCase()) {
    const idx = alphabet.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function totpCode(secret: string): string {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    (hmac[offset + 1]! << 16) |
    (hmac[offset + 2]! << 8) |
    hmac[offset + 3]!;
  return (code % 1_000_000).toString().padStart(6, "0");
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Pa55word-tests!";
const RUN = Date.now().toString(36);

const service = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function anonClient(): SupabaseClient {
  return createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function createUser(
  tag: string,
  opts: { confirmed?: boolean; name?: string; phone?: string } = {},
): Promise<{ id: string; email: string }> {
  const email = `${tag}-${RUN}@test.milocal.cl`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: opts.confirmed ?? true,
    user_metadata: { full_name: opts.name ?? `Usuario ${tag}`, phone: opts.phone ?? "+56911111111" },
  });
  if (error || !data.user) throw new Error(`createUser ${tag}: ${error?.message}`);
  return { id: data.user.id, email };
}

async function signedClient(email: string): Promise<SupabaseClient> {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return client;
}

let ownerA: { id: string; email: string };
let ownerB: { id: string; email: string };
let buyer: { id: string; email: string };
let adminUser: { id: string; email: string };
let clientA: SupabaseClient;
let clientB: SupabaseClient;
let clientBuyer: SupabaseClient;
let clientAdmin: SupabaseClient;
let regionId: string;
let communeId: string;
let propertyId: string;

beforeAll(async () => {
  [ownerA, ownerB, buyer, adminUser] = await Promise.all([
    createUser("owner-a", { name: "Dueña A", phone: "+56911111111" }),
    createUser("owner-b", { name: "Dueño B", phone: "+56922222222" }),
    createUser("buyer", { name: "Camila Compradora", phone: "+56933333333" }),
    createUser("admin", { name: "Admin MiLocal", phone: "+56944444444" }),
  ]);

  // Rol ADMIN: SOLO por circuito interno (equivalente a scripts/provision_admin.sql)
  const { error: adminInsertError } = await service
    .from("admin_users")
    .insert({ user_id: adminUser.id, note: "test" });
  if (adminInsertError) throw new Error(adminInsertError.message);

  [clientA, clientB, clientBuyer, clientAdmin] = await Promise.all([
    signedClient(ownerA.email),
    signedClient(ownerB.email),
    signedClient(buyer.email),
    signedClient(adminUser.email),
  ]);

  const { data: commune } = await service
    .from("communes")
    .select("id, region_id")
    .eq("slug", "providencia")
    .single();
  regionId = commune!.region_id as string;
  communeId = commune!.id as string;
});

describe("Catálogos y configuración pública", () => {
  it("regiones y comunas se leen sin sesión (RM + Viña del Mar sembradas)", async () => {
    const anon = anonClient();
    const { data: regions } = await anon.from("regions").select("code");
    const { data: communes } = await anon.from("communes").select("slug");
    expect(regions?.length).toBe(2);
    expect((communes ?? []).length).toBeGreaterThanOrEqual(53);
  });

  it("anon no puede modificar app_settings", async () => {
    const anon = anonClient();
    const { error } = await anon
      .from("app_settings")
      .update({ value: 9999 })
      .eq("key", "goal_entrepreneurs");
    expect(error).not.toBeNull();
  });
});

describe("Propiedades: aislamiento entre cuentas y guard de estados", () => {
  it("el oferente crea su DRAFT (property_id estable)", async () => {
    const { data, error } = await clientA
      .from("properties")
      .insert({
        owner_user_id: ownerA.id,
        status: "DRAFT",
        title: "Local esquina Providencia",
        description: "Local luminoso",
        property_type: "LOCAL_COMERCIAL",
        owner_relationship: "PROPIETARIO",
        region_id: regionId,
        commune_id: communeId,
        sector: "Metro Manuel Montt",
        address_full: "Av. Siempre Viva 742, Providencia", // PRIVADA
        lat_exact: -33.4263,
        lng_exact: -70.6201,
        monthly_rent_clp: 1200000,
        surface_m2: 85,
        bathrooms: 1,
        has_gas_extraction: "SI",
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    propertyId = data!.id as string;
  });

  it("usuario A no puede insertar una propiedad a nombre de B", async () => {
    const { error } = await clientA
      .from("properties")
      .insert({ owner_user_id: ownerB.id, status: "DRAFT", title: "suplantada" });
    expect(error).not.toBeNull();
  });

  it("B no ve ni edita la propiedad de A cambiando el UUID (acceso cruzado)", async () => {
    const { data } = await clientB.from("properties").select("*").eq("id", propertyId);
    expect(data ?? []).toHaveLength(0);
    const { data: updated } = await clientB
      .from("properties")
      .update({ title: "hackeada" })
      .eq("id", propertyId)
      .select();
    expect(updated ?? []).toHaveLength(0);
  });

  it("el dueño NO puede cambiar status directamente (solo RPCs)", async () => {
    const { error } = await clientA
      .from("properties")
      .update({ status: "PUBLISHED" })
      .eq("id", propertyId);
    expect(error?.message ?? "").toContain("GUARDED_COLUMN_CHANGE_DENIED");
  });

  it("el dueño NO puede autoconfirmar vigencia editando la columna", async () => {
    const { error } = await clientA
      .from("properties")
      .update({ availability_last_confirmed_at: new Date().toISOString() })
      .eq("id", propertyId);
    expect(error?.message ?? "").toContain("GUARDED_COLUMN_CHANGE_DENIED");
  });

  it("anon no lee la tabla properties (solo la vista pública)", async () => {
    const anon = anonClient();
    const { data, error } = await anon.from("properties").select("*").eq("id", propertyId);
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });
});

describe("Publicación (Flujo A): validaciones, PUBLISHED inmediato y aviso ADMIN", () => {
  it("publicar sin fotos falla (PHOTOS_REQUIRED)", async () => {
    const { error } = await clientA.rpc("publish_property", { p_property_id: propertyId });
    expect(error?.message ?? "").toContain("PHOTOS_REQUIRED");
  });

  it("con foto saneada, DRAFT → PUBLISHED inmediato + notificación interna", async () => {
    // Simula el pipeline del servidor (sharp -> storage -> fila)
    const { error: photoError } = await service.from("property_photos").insert({
      property_id: propertyId,
      storage_path: `${propertyId}/foto1.webp`,
      thumb_path: `${propertyId}/foto1_thumb.webp`,
      position: 0,
    });
    expect(photoError).toBeNull();

    const { data, error } = await clientA.rpc("publish_property", { p_property_id: propertyId });
    expect(error).toBeNull();
    expect((data as { status: string }).status).toBe("PUBLISHED");

    const { data: notif } = await service
      .from("admin_notifications")
      .select("*")
      .eq("property_id", propertyId)
      .eq("type", "NEW_PUBLICATION");
    expect(notif?.length).toBe(1);
  });

  it("la proyección pública expone SOLO campos permitidos y pin aproximado", async () => {
    const anon = anonClient();
    const { data } = await anon.from("public_properties").select("*").eq("id", propertyId);
    expect(data).toHaveLength(1);
    const pub = data![0] as Record<string, unknown>;

    // Campos permitidos presentes
    expect(pub.commune_name).toBe("Providencia");
    expect(pub.monthly_rent_clp).toBe(1200000);

    // PII/privados JAMÁS presentes (ni siquiera como columnas)
    expect("address_full" in pub).toBe(false);
    expect("lat_exact" in pub).toBe(false);
    expect("lng_exact" in pub).toBe(false);
    expect("owner_user_id" in pub).toBe(false);

    // Coordenada aproximada: distinta de la exacta pero cercana (~<1.5km)
    const latPub = pub.lat_public as number;
    expect(latPub).not.toBe(-33.4263);
    expect(Math.abs(latPub - -33.4263)).toBeLessThan(0.015);
  });

  it("las fotos públicas solo existen para propiedades PUBLISHED", async () => {
    const anon = anonClient();
    const { data } = await anon
      .from("public_property_photos")
      .select("*")
      .eq("property_id", propertyId);
    expect(data?.length).toBe(1);
  });
});

describe("Interest (Flujo B): único, idempotente, snapshot congelado", () => {
  it("usuario con correo verificado crea el Interest con snapshot", async () => {
    const { data, error } = await clientBuyer.rpc("create_interest", {
      p_property_id: propertyId,
      p_intent: "CONTACT",
    });
    expect(error).toBeNull();
    const res = data as { created: boolean; attempt_count: number };
    expect(res.created).toBe(true);
    expect(res.attempt_count).toBe(1);
  });

  it("doble envío NO duplica: incrementa insistencias, fecha original intacta", async () => {
    const { data: first } = await service
      .from("interests")
      .select("id, created_at, intent")
      .eq("user_id", buyer.id)
      .eq("property_id", propertyId)
      .single();

    const { data, error } = await clientBuyer.rpc("create_interest", {
      p_property_id: propertyId,
      p_intent: "VISIT",
    });
    expect(error).toBeNull();
    const res = data as { created: boolean; attempt_count: number };
    expect(res.created).toBe(false);
    expect(res.attempt_count).toBe(2);

    const { data: after } = await service
      .from("interests")
      .select("id, created_at, intent, interest_attempt_count")
      .eq("user_id", buyer.id)
      .eq("property_id", propertyId);
    expect(after).toHaveLength(1); // unique(user_id, property_id)
    expect(after![0]!.created_at).toBe(first!.created_at);
    expect(after![0]!.intent).toBe("CONTACT"); // intención original preservada
  });

  it("si cambia la renta, el snapshot NO se sobrescribe (conviven ambos)", async () => {
    await service.from("properties").update({ monthly_rent_clp: 1500000 }).eq("id", propertyId);
    const { data } = await service
      .from("interests")
      .select("rent_snapshot_clp")
      .eq("user_id", buyer.id)
      .eq("property_id", propertyId)
      .single();
    expect(data!.rent_snapshot_clp).toBe(1200000);
  });

  it("created_at y snapshot son inmutables incluso para service_role", async () => {
    const { data: row } = await service
      .from("interests")
      .select("id")
      .eq("user_id", buyer.id)
      .single();
    const { error: e1 } = await service
      .from("interests")
      .update({ created_at: new Date().toISOString() })
      .eq("id", row!.id);
    expect(e1?.message ?? "").toContain("INTEREST_CREATED_AT_IMMUTABLE");
    const { error: e2 } = await service
      .from("interests")
      .update({ rent_snapshot_clp: 999 })
      .eq("id", row!.id);
    expect(e2?.message ?? "").toContain("INTEREST_SNAPSHOT_IMMUTABLE");
  });

  it("el titular ve su interés vía my_interests SIN estado comercial ni precalificación", async () => {
    const { data } = await clientBuyer.from("my_interests").select("*");
    expect(data).toHaveLength(1);
    const mine = data![0] as Record<string, unknown>;
    expect("commercial_status" in mine).toBe(false);
    expect("qualification_status" in mine).toBe(false);
    expect("assigned_admin_user_id" in mine).toBe(false);
  });

  it("otro usuario no ve el interés ajeno; la tabla directa está revocada", async () => {
    const { data } = await clientB.from("my_interests").select("*");
    expect(data ?? []).toHaveLength(0);
    const { error } = await clientBuyer.from("interests").select("*");
    expect(error).not.toBeNull();
  });

  it("usuario con correo NO verificado no puede crear Interest válido", async () => {
    const unverified = await createUser("unverified", { confirmed: false });
    const client = anonClient();
    const { error: signInError } = await client.auth.signInWithPassword({
      email: unverified.email,
      password: PASSWORD,
    });
    if (signInError) {
      // El proveedor Auth ya bloquea sesiones sin correo confirmado: control satisfecho
      expect(signInError).not.toBeNull();
    } else {
      const { error } = await client.rpc("create_interest", {
        p_property_id: propertyId,
        p_intent: "CONTACT",
      });
      expect(error?.message ?? "").toContain("EMAIL_NOT_VERIFIED");
    }
  });
});

describe("ADMIN: gating por rol + MFA (aal2), moderación y auditoría", () => {
  it("usuario normal: vistas admin vacías y RPCs denegadas (API/RLS)", async () => {
    const { data } = await clientBuyer.from("admin_interests").select("*");
    expect(data ?? []).toHaveLength(0);
    const { error } = await clientBuyer.rpc("admin_unpublish_property", {
      p_property_id: propertyId,
      p_reason: "intento ilegítimo",
    });
    expect(error?.message ?? "").toContain("ADMIN_AAL2_REQUIRED");
  });

  it("ADMIN sin MFA (aal1): sigue denegado — correo verificado ≠ MFA", async () => {
    const { data } = await clientAdmin.from("admin_interests").select("*");
    expect(data ?? []).toHaveLength(0);
    const { error } = await clientAdmin.rpc("admin_unpublish_property", {
      p_property_id: propertyId,
      p_reason: "sin mfa",
    });
    expect(error?.message ?? "").toContain("ADMIN_AAL2_REQUIRED");
  });

  it("ADMIN enrola TOTP y eleva a aal2", async () => {
    const { data: enroll, error: enrollError } = await clientAdmin.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `test-${RUN}`,
    });
    expect(enrollError).toBeNull();
    const { data: challenge } = await clientAdmin.auth.mfa.challenge({ factorId: enroll!.id });
    const code = totpCode(enroll!.totp.secret);
    const { error: verifyError } = await clientAdmin.auth.mfa.verify({
      factorId: enroll!.id,
      challengeId: challenge!.id,
      code,
    });
    expect(verifyError).toBeNull();

    const { data: status } = await clientAdmin.rpc("get_my_admin_status");
    expect((status as { is_admin: boolean; aal2: boolean }).is_admin).toBe(true);
    expect((status as { is_admin: boolean; aal2: boolean }).aal2).toBe(true);
  });

  it("con aal2 ve la bandeja completa (incluye contacto del interesado)", async () => {
    const { data } = await clientAdmin.from("admin_interests").select("*");
    expect((data ?? []).length).toBeGreaterThanOrEqual(1);
    const row = (data ?? []).find((r) => r.property_id === propertyId) as Record<string, unknown>;
    expect(row.user_phone).toBe("+56933333333");
    expect(row.rent_snapshot_clp).toBe(1200000);
    expect(row.current_rent_clp).toBe(1500000);
  });

  it("pipeline: LOST exige motivo, WON exige evidencia; CONTACTED deja historial", async () => {
    const { data: interests } = await clientAdmin
      .from("admin_interests")
      .select("id")
      .eq("property_id", propertyId);
    const interestId = interests![0]!.id as string;

    const { error: lostError } = await clientAdmin.rpc("admin_set_interest_status", {
      p_interest_id: interestId,
      p_new_status: "LOST",
    });
    expect(lostError?.message ?? "").toContain("LOST_REASON_REQUIRED");

    const { error: wonError } = await clientAdmin.rpc("admin_set_interest_status", {
      p_interest_id: interestId,
      p_new_status: "WON",
    });
    expect(wonError?.message ?? "").toContain("WON_EVIDENCE_REQUIRED");

    const { error: okError } = await clientAdmin.rpc("admin_set_interest_status", {
      p_interest_id: interestId,
      p_new_status: "CONTACTED",
      p_reason: "Llamada telefónica efectiva",
    });
    expect(okError).toBeNull();

    const { data: history } = await clientAdmin
      .from("admin_interest_history")
      .select("*")
      .eq("interest_id", interestId)
      .eq("field", "commercial_status");
    expect(history!.some((h) => h.new_value === "CONTACTED")).toBe(true);

    // Precalificación independiente del pipeline
    const { error: qError } = await clientAdmin.rpc("admin_set_qualification", {
      p_interest_id: interestId,
      p_new_status: "POR_VALIDAR",
      p_reason: "Presupuesto cercano con renta negociable",
    });
    expect(qError).toBeNull();

    // Nota interna append-only
    const { error: noteError } = await clientAdmin.rpc("admin_add_interest_note", {
      p_interest_id: interestId,
      p_note: "Prefiere visitar el fin de semana",
    });
    expect(noteError).toBeNull();
  });

  it("moderación: despublica con motivo, bloquea republicación autónoma y audita", async () => {
    const { error } = await clientAdmin.rpc("admin_unpublish_property", {
      p_property_id: propertyId,
      p_reason: "Fotos muestran información sensible",
    });
    expect(error).toBeNull();

    // Desaparece de la proyección pública DE INMEDIATO
    const anon = anonClient();
    const { data: pub } = await anon.from("public_properties").select("id").eq("id", propertyId);
    expect(pub ?? []).toHaveLength(0);
    const { data: pubPhotos } = await anon
      .from("public_property_photos")
      .select("id")
      .eq("property_id", propertyId);
    expect(pubPhotos ?? []).toHaveLength(0);

    // Nuevos intereses bloqueados
    const { error: interestError } = await clientBuyer.rpc("create_interest", {
      p_property_id: propertyId,
      p_intent: "CONTACT",
    });
    expect(interestError?.message ?? "").toContain("PROPERTY_NOT_PUBLISHED");

    // El dueño NO puede republicar
    const { error: republishError } = await clientA.rpc("publish_property", {
      p_property_id: propertyId,
    });
    expect(republishError?.message ?? "").toContain("MODERATION_LOCKED");

    // Auditoría íntegra
    const { data: audit } = await clientAdmin
      .from("admin_actions_log")
      .select("*")
      .eq("entity_id", propertyId)
      .eq("action", "ADMIN_UNPUBLISH");
    expect(audit?.length).toBe(1);
    expect(audit![0]!.reason).toContain("sensible");
  });

  it("ADMIN libera y republica, con auditoría", async () => {
    const { error } = await clientAdmin.rpc("admin_release_property", {
      p_property_id: propertyId,
      p_reason: "Fotos corregidas por el oferente",
      p_republish: true,
    });
    expect(error).toBeNull();
    const anon = anonClient();
    const { data: pub } = await anon.from("public_properties").select("id").eq("id", propertyId);
    expect(pub).toHaveLength(1);
  });

  it("«ya se arrendó» externo retira la ficha y queda trazado (nunca WON)", async () => {
    const { error } = await clientA.rpc("owner_unpublish_property", {
      p_property_id: propertyId,
      p_mode: "RENTED_EXTERNAL",
    });
    expect(error).toBeNull();
    const { data: prop } = await service
      .from("properties")
      .select("status")
      .eq("id", propertyId)
      .single();
    expect(prop!.status).toBe("ARCHIVED");
    // El interés asociado NO pasó a WON
    const { data: interest } = await service
      .from("interests")
      .select("commercial_status")
      .eq("property_id", propertyId)
      .single();
    expect(interest!.commercial_status).toBe("CONTACTED");
  });

  it("exportación CSV queda auditada con dataset y nº de filas", async () => {
    const { error } = await clientAdmin.rpc("admin_log_csv_export", {
      p_dataset: "intereses",
      p_filters: { estado: "CONTACTED" },
      p_row_count: 1,
    });
    expect(error).toBeNull();
    const { data } = await clientAdmin
      .from("admin_actions_log")
      .select("*")
      .eq("action", "CSV_EXPORT")
      .order("created_at", { ascending: false })
      .limit(1);
    expect(data![0]!.metadata).toMatchObject({ dataset: "intereses", row_count: 1 });
  });

  it("usuarios normales no pueden leer la auditoría ni las notificaciones", async () => {
    const { data: a } = await clientBuyer.from("admin_actions_log").select("*");
    expect(a ?? []).toHaveLength(0);
    const { data: n } = await clientBuyer.from("admin_notifications_view").select("*");
    expect(n ?? []).toHaveLength(0);
  });
});

describe("Analítica propia sin PII", () => {
  it("acepta eventos del diccionario y filtra props no permitidas", async () => {
    const anon = anonClient();
    const sid = crypto.randomUUID();
    const { error } = await anon.rpc("track_event", {
      p_event_name: "property_view",
      p_anon_session_id: sid,
      p_property_id: propertyId,
      p_props: { commune_slug: "providencia", email: "leak@pii.cl", nombre: "Juan" },
    });
    expect(error).toBeNull();
    const { data } = await service
      .from("analytics_events")
      .select("*")
      .eq("anon_session_id", sid)
      .single();
    expect(data!.props).toMatchObject({ commune_slug: "providencia" });
    expect("email" in (data!.props as Record<string, unknown>)).toBe(false);
  });

  it("descarta en silencio eventos fuera del diccionario", async () => {
    const anon = anonClient();
    const sid = crypto.randomUUID();
    const { error } = await anon.rpc("track_event", {
      p_event_name: "evento_invent4do",
      p_anon_session_id: sid,
    });
    expect(error).toBeNull();
    const { data } = await service.from("analytics_events").select("id").eq("anon_session_id", sid);
    expect(data ?? []).toHaveLength(0);
  });
});

describe("Consentimientos (append-only, por titular)", () => {
  it("el titular registra y lee sus constancias; no puede alterarlas ni borrarlas", async () => {
    const { error: insertError } = await clientBuyer.from("consents").insert({
      user_id: buyer.id,
      consent_type: "MARKETING_OPT_IN",
      version: "v0",
      granted: true,
      source: "TEST",
    });
    expect(insertError).toBeNull();

    const { error: spoofError } = await clientBuyer.from("consents").insert({
      user_id: ownerA.id,
      consent_type: "MARKETING_OPT_IN",
      version: "v0",
      granted: true,
    });
    expect(spoofError).not.toBeNull();

    const { error: updateError } = await clientBuyer
      .from("consents")
      .update({ granted: false })
      .eq("user_id", buyer.id);
    expect(updateError).not.toBeNull();
  });
});
