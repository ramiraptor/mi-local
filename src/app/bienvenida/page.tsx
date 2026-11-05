import type { Metadata } from "next";
import { Suspense } from "react";
import { WelcomeSetup } from "./WelcomeSetup";

export const metadata: Metadata = {
  title: "Bienvenido/a",
  robots: { index: false },
};

export default function BienvenidaPage() {
  return (
    <div className="container-page max-w-md py-16 text-center">
      <Suspense>
        <WelcomeSetup />
      </Suspense>
    </div>
  );
}
