"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import type { PropertyRow } from "@/lib/types";

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_VERIFIED: "Debes verificar tu correo antes de publicar.",
  MODERATION_LOCKED:
    "Esta publicación fue retirada por el equipo MiLocal y no puede republicarse sin su autorización.",
  INCOMPLETE_PROPERTY:
    "Faltan campos obligatorios (título, tipo, región/comuna, renta, superficie o tu relación con el inmueble).",
  PHOTOS_REQUIRED: "Debes subir al menos 1 fotografía (máximo 12).",
  INVALID_STATUS_TRANSITION: "El estado actual no permite esta acción.",
};

export function friendlyRpcError(message: string | undefined): string {
  if (!message) return "No pudimos completar la acción. Inténtalo nuevamente.";
  for (const [code, text] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) return text;
  }
  return "No pudimos completar la acción. Inténtalo nuevamente.";
}

export function PropertyActions({
  property,
  emailVerified,
}: {
  property: PropertyRow;
  emailVerified: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowser();

  async function run(action: () => PromiseLike<{ error: { message?: string } | null }>) {
    setBusy(true);
    setError(null);
    try {
      const { error: rpcError } = await action();
      if (rpcError) {
        setError(friendlyRpcError(rpcError.message));
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <Link href={`/mis-locales/${property.id}`} className="btn-secondary px-3 py-1.5 text-xs">
          Editar ficha
        </Link>

        {(property.status === "DRAFT" || property.status === "UNPUBLISHED") &&
          !property.moderation_locked && (
            <button
              type="button"
              className="btn-primary px-3 py-1.5 text-xs"
              disabled={busy || !emailVerified}
              title={!emailVerified ? "Verifica tu correo para publicar" : undefined}
              onClick={() =>
                run(async () => {
                  const res = await supabase.rpc("publish_property", {
                    p_property_id: property.id,
                  });
                  if (!res.error) track("property_published", {}, property.id);
                  return res;
                })
              }
            >
              Publicar
            </button>
          )}

        {property.status === "PUBLISHED" && (
          <>
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              disabled={busy}
              onClick={() =>
                run(() =>
                  supabase.rpc("owner_confirm_availability", { p_property_id: property.id }),
                )
              }
            >
              Confirmar disponibilidad
            </button>
            <button
              type="button"
              className="btn-ghost px-3 py-1.5 text-xs"
              disabled={busy}
              onClick={() => {
                if (!window.confirm("¿Pausar esta publicación? Dejará de recibir solicitudes."))
                  return;
                void run(() =>
                  supabase.rpc("owner_unpublish_property", {
                    p_property_id: property.id,
                    p_mode: "PAUSE",
                  }),
                );
              }}
            >
              Pausar
            </button>
            <button
              type="button"
              className="btn-ghost px-3 py-1.5 text-xs"
              disabled={busy}
              onClick={() => {
                if (
                  !window.confirm(
                    "¿Se arrendó fuera de MiLocal? La ficha se retirará del sitio. Esto NO borra tus datos.",
                  )
                )
                  return;
                void run(() =>
                  supabase.rpc("owner_unpublish_property", {
                    p_property_id: property.id,
                    p_mode: "RENTED_EXTERNAL",
                  }),
                );
              }}
            >
              Ya se arrendó
            </button>
          </>
        )}

        {property.status !== "ARCHIVED" && property.status !== "PUBLISHED" && (
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs text-red-600"
            disabled={busy}
            onClick={() => {
              if (
                !window.confirm(
                  "¿Archivar este inmueble? Saldrá de tus listados activos. La eliminación definitiva de datos se solicita por el canal de privacidad.",
                )
              )
                return;
              void run(() =>
                supabase.rpc("owner_unpublish_property", {
                  p_property_id: property.id,
                  p_mode: "ARCHIVE",
                }),
              );
            }}
          >
            Archivar
          </button>
        )}
      </div>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
