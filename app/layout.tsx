import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unbarber",
  description: "Encontrá barbero cerca, ahora o con turno.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${archivoBlack.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body data-mode="client" className="min-h-full flex flex-col">
        <div className="mx-auto w-full max-w-[480px] flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
