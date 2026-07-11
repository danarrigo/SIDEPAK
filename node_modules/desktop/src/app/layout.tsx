import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaSetup from "@/components/PwaSetup";

export const viewport: Viewport = {
  themeColor: "#0B1120",
};

export const metadata: Metadata = {
  title: {
    default: "SIDEPAK",
    template: "%s | SIDEPAK",
  },
  description: "Platform digital untuk pengelolaan koperasi desa (Sistem Informasi Desa dan Pengelolaan Aset Koperasi)",
  applicationName: "SIDEPAK",
  authors: [{ name: "Kopdes Team" }],
  keywords: ["koperasi", "desa", "koperasi desa", "simpan pinjam", "platform digital", "pengelolaan koperasi"],
  openGraph: {
    title: "SIDEPAK - Platform Koperasi Desa",
    description: "Platform digital untuk pengelolaan koperasi desa secara transparan dan efisien.",
    url: "https://sidepak.id", // Optional: Update with actual domain if available
    siteName: "SIDEPAK",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIDEPAK - Platform Koperasi Desa",
    description: "Platform digital untuk pengelolaan koperasi desa secara transparan dan efisien.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIDEPAK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className="h-screen w-full flex overflow-hidden">
        <PwaSetup />
        {children}
      </body>
    </html>
  );
}
