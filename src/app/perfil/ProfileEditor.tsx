"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function ProfileEditor({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = name !== initialName || phone !== initialPhone;

  async function save() {
    setError(null);
    if (name.trim().length < 3) return setError("Ingresa tu nombre completo.");
    if (!/^\+?[\d\s]{8,15}$/.test(phone.trim())) return setError("Ingresa un teléfono válido.");
    setSaving(true);
    try {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error: updError } = await supabase
        .from("profiles")
        .update({ full_name: name.trim(), phone: phone.trim() })
        .eq("id", user.id);
      if (updError) {
        setError("No pudimos guardar los cambios.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="pf-name">
          Nombre completo
        </label>
        <input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="pf-phone">
          Teléfono
        </label>
        <input id="pf-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="pf-email">
          Correo (no editable por ahora)
        </label>
        <input id="pf-email" className="input bg-slate-50" value={email} disabled />
      </div>
      {error && <p className="field-error sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="button" className="btn-primary" onClick={save} disabled={!dirty || saving}>
          {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar cambios"}
        </button>
        {dirty && !saving && (
          <span className="ml-3 text-xs text-amber-700">Tienes cambios sin guardar.</span>
        )}
      </div>
    </div>
  );
}
