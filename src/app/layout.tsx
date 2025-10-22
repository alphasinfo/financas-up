import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { LogoProvider } from "@/contexts/logo-context";
import { PWAManager } from "@/components/pwa-manager";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "Finanças Up - Controle simples, futuro grande",
  description: "Sistema completo de gestão financeira pessoal com módulos integrados para controle de receitas, despesas, contas bancárias, cartões de crédito, empréstimos, investimentos e muito mais.",
  manifest: "/manifest.json",
  applicationName: "Finanças Up",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finanças Up",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [
      { url: "/icons/icon-192x192.png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Finanças Up" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <LogoProvider>
              {/* Temporariamente removido PWAManager para resolver erro Vercel */}
              {/* <PWAManager /> */}
              {children}
              {/* Removed Vercel analytics to avoid ad blockers */}
            </LogoProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
