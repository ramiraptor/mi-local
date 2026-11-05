"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { PropertyStatus } from "@/lib/constants";

export function NotificationReviewButton({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn-secondary px-3 py-1.5 text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const supabase = createSupabaseBrowser();
        await supabase.rpc("admin_mark_notification_reviewed", {
          p_notification_id: notificationId,
        });
        router.refresh();
      }}
    >
      Marcar revisada
    </button>
  );
}

export function ModerationActions({
  propertyId,
  status,
  moderationLocked,
}: {
  propertyId: string;
  status: PropertyStatus;
  moderationLocked: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowser();

  async function unpublish() {
    const reason = window.prompt(
      "Motivo de la despublicación (obligatorio, queda auditado y visible para el oferente):",
    );
    if (!reason?.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { error: e } = await supabase.rpc("admin_unpublish_property", {
        p_property_id: propertyId,
        p_reason: reason.trim(),
      });
      if (e) setError("No se pudo despublicar.");
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function release(republish: boolean) {
    const reason = window.prompt(
      republish
        ? "Motivo de la republicación (queda auditado):"
        : "Motivo para liberar el bloqueo (queda auditado):",
    );
    if (!reason?.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { error: e } = await supabase.rpc("admin_release_property", {
        p_property_id: propertyId,
        p_reason: reason.trim(),
        p_republish: republish,
      });
      if (e) setError("No se pudo completar la acción.");
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {status === "PUBLISHED" && (
        <Link
          href={`/propiedad/${propertyId}`}
          target="_blank"
          className="btn-ghost px-2 py-1 text-xs"
        >
          Ver ficha
        </Link>
      )}
      {status === "PUBLISHED" && (
        <button
          type="button"
          className="btn-danger px-2 py-1 text-xs"
          disabled={busy}
          onClick={unpublish}
        >
          Despublicar
        </button>
      )}
      {moderationLocked && (
        <>
          <button
            type="button"
            className="btn-secondary px-2 py-1 text-xs"
            disabled={busy}
            onClick={() => void release(true)}
          >
            Republicar
          </button>
          <button
            type="button"
            className="btn-ghost px-2 py-1 text-xs"
            disabled={busy}
            onClick={() => void release(false)}
          >
            Liberar bloqueo
          </button>
        </>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
