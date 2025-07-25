import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Table - Sistema de Menú Digital para Restaurantes",
  description: "Digitaliza tu restaurante con QR Table. Sistema de menú digital y pedidos con códigos QR. Sin apps, sin complicaciones. Seguimiento en tiempo real y analytics avanzados.",
  keywords: "menu digital, codigo qr restaurante, sistema pedidos, menu qr, restaurante digital, Honduras",
  authors: [{ name: "QR Table" }],
  openGraph: {
    title: "QR Table - Menú Digital con Códigos QR",
    description: "La solución más simple para digitalizar tu restaurante. Menú digital, pedidos en línea y seguimiento en tiempo real.",
    type: "website",
    locale: "es_HN",
    siteName: "QR Table",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Table - Sistema de Menú Digital",
    description: "Digitaliza tu restaurante con códigos QR. Sin apps, sin complicaciones.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
