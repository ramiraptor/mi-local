import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { MfaSetup } from "./MfaSetup";

export const metadata: Metadata = {
  title: "Verificación MFA",
  robots: { index: false, follow: false },
};

export default async function AdminMfaPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?return_to=%2Fadmin");

  const { data: status } = await supabase.rpc("get_my_admin_status");
  const s = (status ?? {}) as { is_admin?: boolean; aal2?: boolean };
  if (!s.is_admin) redirect("/");
  if (s.aal2) redirect("/admin");

  return (
    <div className="container-page max-w-md py-10">
      <h1 className="text-2xl font-bold text-slate-900">Acceso administrativo</h1>
      <p className="mt-2 text-sm text-slate-600">
        El panel /admin exige autenticación multifactor (MFA). Usa una app autenticadora personal
        (Google Authenticator, 1Password, etc.). No compartas códigos.
      </p>
      <MfaSetup />
    </div>
  );
}
