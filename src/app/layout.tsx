import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MiLocal — Encuentra o publica tu local comercial",
    template: "%s | MiLocal",
  },
  description:
    "MiLocal conecta emprendedores que buscan un local comercial con propietarios que quieren arrendar. Publicación gratuita y acompañamiento personalizado en la Región Metropolitana y Viña del Mar.",
  openGraph: {
    siteName: "MiLocal",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
