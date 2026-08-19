import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "BetLocal",
  description:
    "Cuotas justas, valor esperado y edge por mercado en LaLiga. Análisis estadístico, no consejos de apuestas.",
  applicationName: "BetLocal",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BetLocal",
  },
};

export const viewport: Viewport = {
  themeColor: "#05080c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-dvh">
        {children}
        <Toaster richColors theme="dark" position="top-center" />
      </body>
    </html>
  );
}
