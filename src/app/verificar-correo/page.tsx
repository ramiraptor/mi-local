import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyNotice } from "./VerifyNotice";

export const metadata: Metadata = {
  title: "Verifica tu correo",
  robots: { index: false },
};

export default function VerificarCorreoPage() {
  return (
    <div className="container-page max-w-md py-10">
      <Suspense>
        <VerifyNotice />
      </Suspense>
    </div>
  );
}
