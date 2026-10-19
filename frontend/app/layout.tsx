import type { Metadata, Viewport } from "next";
import { Inter, DM_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LanguageProvider } from "@/lib/i18n";
import { PageTransition } from "@/components/motion";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500", "600", "700"], variable: "--font-devanagari", display: "swap" });

export const metadata: Metadata = {
  title: { default: "TakeSure — Confidence before taking something · Ayurveda × Allopathy interaction checker", template: "%s · TakeSure" },
  description:
    "Check whether an Ayurvedic product is known to interact with your prescription medicines. Verdict from published data; AI only explains.",
  applicationName: "TakeSure",
  keywords: ["Ayurveda", "herb-drug interaction", "Ashwagandha", "Giloy", "Guggul", "pharmacovigilance", "Ministry of Ayush"],
};

export const viewport: Viewport = { themeColor: "#060f0c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${devanagari.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] btn btn-primary">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1 relative">
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
