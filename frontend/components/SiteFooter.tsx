"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="relative border-t border-line mt-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-1" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr] text-sm text-ink-2">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div>
              <p className="text-base font-bold text-ink">TakeSure</p>
              <p className="mono-label muted">Confidence before taking something</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm">{t("usp")}</p>
          <p className="mt-2 text-ink-3">{t("footer_built")}</p>
        </div>
        <div>
          <p className="mono-label saffron">{t("footer_important")}</p>
          <p className="mt-3">{t("footer_disclaimer")}</p>
        </div>
        <div>
          <p className="mono-label">{t("footer_links")}</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-mint-bright transition-colors" href="/about">Methodology & limitations</Link></li>
            <li><Link className="hover:text-mint-bright transition-colors" href="/about#feedback">Report incorrect information</Link></li>
            <li><Link className="hover:text-mint-bright transition-colors" href="/dashboard">Pharmacovigilance dashboard</Link></li>
            <li>
              <a className="hover:text-mint-bright transition-colors" href="https://ayushsuraksha.com" target="_blank" rel="noopener noreferrer">
                Ayush Suraksha portal (official ADR reporting) ↗
              </a>
            </li>
            <li><a className="hover:text-mint-bright transition-colors" href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">API documentation ↗</a></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
          <span>© {new Date().getFullYear()} TakeSure · MIT licence for code · knowledge base summarises cited public sources</span>
          <span className="font-mono tracking-widest uppercase">Decision support · not diagnosis</span>
        </div>
      </div>
    </footer>
  );
}
