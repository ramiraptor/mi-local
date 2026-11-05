"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn-ghost px-3 py-2"
      onClick={async () => {
        const supabase = createSupabaseBrowser();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
