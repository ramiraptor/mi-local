"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import {
  COMMERCIAL_STATUS,
  LABELS,
  QUALIFICATION_STATUS,
  type CommercialStatus,
  type QualificationStatus,
} from "@/lib/constants";

/**
 * Gestión manual de la oportunidad: pipeline, precalificación, asignación y
 * notas. WON exige evidencia de mediación MiLocal; LOST exige motivo;
 * VISIT_SCHEDULED implica coordinación real registrada por ADMIN.
 */
export function InterestManager({
  interestId,
  currentStatus,
  currentQualification,
  currentAssignee,
  admins,
}: {
  interestId: string;
  currentStatus: CommercialStatus;
  currentQualification: QualificationStatus;
  currentAssignee: string | null;
  admins: Array<{ user_id: string; full_name: string | null; email: string | null }>;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [status, setStatus] = useState<CommercialStatus>(currentStatus);
  const [reason, setReason] = useState("");
  const [qualification, setQualification] = useState<QualificationStatus>(currentQualification);
  const [qReason, setQReason] = useState("");
  const [assignee, setAssignee] = useState(currentAssignee ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function run(fn: () => PromiseLike<{ error: { message?: string } | null }>, okMsg: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const { error: e } = await fn();
      if (e) {
        const msg = e.message ?? "";
        if (msg.includes("LOST_REASON_REQUIRED")) setError("LOST requiere motivo.");
        else if (msg.includes("WON_EVIDENCE_REQUIRED"))
          setError("WON exige evidencia de mediación MiLocal confirmada.");
        else setError("No se pudo completar la acción.");
        return;
      }
      setOk(okMsg);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="h-fit space-y-5 lg:sticky lg:top-20">
      {/* Pipeline */}
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold text-slate-900">Estado comercial</h2>
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value as CommercialStatus)}
          aria-label="Nuevo estado comercial"
        >
          {COMMERCIAL_STATUS.map((s) => (
            <option key={s} value={s}>
              {LABELS.commercialStatus[s]}
            </option>
          ))}
        </select>
        {status === "VISIT_SCHEDULED" && (
          <p className="text-xs text-amber-700">
            Solo si la visita fue coordinada REALMENTE (teléfono/correo). La intención VISIT del
            usuario no basta.
          </p>
        )}
        {status === "WON" && (
          <p className="text-xs text-emerald-700">
            WON solo con operación concretada y mediación MiLocal confirmada. «Ya se arrendó» por
            fuera = retiro de ficha, nunca WON.
          </p>
        )}
        <textarea
          className="input"
          rows={2}
          placeholder={
            status === "LOST"
              ? "Motivo del cierre (obligatorio)"
              : status === "WON"
                ? "Evidencia/contexto de la mediación (obligatorio)"
                : "Contexto (opcional)"
          }
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          type="button"
          className="btn-primary w-full"
          disabled={busy || status === currentStatus}
          onClick={() =>
            void run(
              () =>
                supabase.rpc("admin_set_interest_status", {
                  p_interest_id: interestId,
                  p_new_status: status,
                  p_reason: status === "WON" ? null : reason.trim() || null,
                  p_evidence: status === "WON" ? reason.trim() || null : null,
                }),
              "Estado actualizado.",
            )
          }
        >
          Actualizar estado
        </button>
      </section>

      {/* Precalificación */}
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold text-slate-900">Precalificación (por oportunidad)</h2>
        <select
          className="select"
          value={qualification}
          onChange={(e) => setQualification(e.target.value as QualificationStatus)}
          aria-label="Precalificación"
        >
          {QUALIFICATION_STATUS.map((s) => (
            <option key={s} value={s}>
              {LABELS.qualification[s]}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Motivo (opcional, queda en historial)"
          value={qReason}
          onChange={(e) => setQReason(e.target.value)}
        />
        <button
          type="button"
          className="btn-secondary w-full"
          disabled={busy || qualification === currentQualification}
          onClick={() =>
            void run(
              () =>
                supabase.rpc("admin_set_qualification", {
                  p_interest_id: interestId,
                  p_new_status: qualification,
                  p_reason: qReason.trim() || null,
                }),
              "Precalificación actualizada.",
            )
          }
        >
          Actualizar precalificación
        </button>
      </section>

      {/* Asignación */}
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold text-slate-900">Responsable</h2>
        <select
          className="select"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          aria-label="Responsable asignado"
        >
          <option value="">Sin asignar</option>
          {admins.map((a) => (
            <option key={a.user_id} value={a.user_id}>
              {a.full_name ?? a.email ?? a.user_id}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-secondary w-full"
          disabled={busy || assignee === (currentAssignee ?? "")}
          onClick={() =>
            void run(
              () =>
                supabase.rpc("admin_assign_interest", {
                  p_interest_id: interestId,
                  p_admin_user_id: assignee || null,
                }),
              "Responsable actualizado.",
            )
          }
        >
          Asignar
        </button>
      </section>

      {/* Nota */}
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold text-slate-900">Agregar nota interna</h2>
        <textarea
          className="input"
          rows={3}
          placeholder="Nota mínima y pertinente…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          className="btn-secondary w-full"
          disabled={busy || note.trim().length === 0}
          onClick={() =>
            void run(
              async () => {
                const res = await supabase.rpc("admin_add_interest_note", {
                  p_interest_id: interestId,
                  p_note: note.trim(),
                });
                if (!res.error) setNote("");
                return res;
              },
              "Nota agregada.",
            )
          }
        >
          Guardar nota
        </button>
      </section>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{ok}</p>}
    </aside>
  );
}
