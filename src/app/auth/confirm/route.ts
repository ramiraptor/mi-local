import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { safeReturnTo } from "@/lib/return-to";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Callback de verificación de correo / recuperación.
 * Soporta flujo PKCE (?code=) y token_hash (?token_hash=&type=).
 * Tras verificar: /bienvenida (vincula borradores y consentimientos) y
 * retorno seguro a la intención original (return_to whitelisted).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const returnTo = safeReturnTo(searchParams.get("return_to")) ?? "/";

  const supabase = await createSupabaseServer();
  let ok = false;
  let isRecovery = type === "recovery";

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    // El flujo de recuperación PKCE también llega con ?code=
    if (ok && data.session?.user && searchParams.get("flow") === "recovery") {
      isRecovery = true;
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  if (!ok) {
    return NextResponse.redirect(
      `${origin}/verificar-correo?estado=enlace-invalido&return_to=${encodeURIComponent(returnTo)}`,
    );
  }

  if (isRecovery) {
    return NextResponse.redirect(`${origin}/restablecer`);
  }
  return NextResponse.redirect(`${origin}/bienvenida?return_to=${encodeURIComponent(returnTo)}`);
}
