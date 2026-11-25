import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Text } from "next/font/google";
import "./globals.css";

// DM Serif Text existe en regular e itálica: los títulos juegan con las dos.
// DM Sans (misma familia DM) lleva el texto y los botones en regular, semibold y bold.
const dmSerif = DM_Serif_Text({
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unbarber",
  description: "Tu próximo barbero, a la vuelta de la esquina.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#182d26",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${dmSerif.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
