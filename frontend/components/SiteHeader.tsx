"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang, type TKey } from "@/lib/i18n";
import { ArrowRight } from "@/components/ui";
import { Logo } from "@/components/Logo";

const NAV: { href: string; key: TKey }[] = [
  { href: "/check", key: "nav_check" },
  { href: "/knowledge-base", key: "nav_kb" },
  { href: "/how-it-works", key: "nav_how" },
  { href: "/adr", key: "nav_adr" },
  { href: "/dashboard", key: "nav_dashboard" },
  { href: "/about", key: "nav_about" },
];

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t("lang_toggle_label")} className={`inline-flex rounded-full border border-line-2 bg-white/[0.03] p-0.5 ${compact ? "text-xs" : "text-xs sm:text-sm"}`}>
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`relative rounded-full px-3 py-1 font-semibold transition-colors ${lang === l ? "text-primary-ink" : "text-ink-2 hover:text-ink"}`}
        >
          {lang === l && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-mint" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
          <span className="relative z-10">{l === "en" ? "EN" : "हिं"}</span>
        </button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const scrolled = useSyncExternalStore(
    (cb) => {
      window.addEventListener("scroll", cb, { passive: true });
      return () => window.removeEventListener("scroll", cb);
    },
    () => window.scrollY > 12,
    () => false,
  );

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled || open ? "glass border-b border-line shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)]" : "bg-transparent border-b border-transparent"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[68px]">
        <Link href="/" className="flex items-center gap-3 group" aria-label="TakeSure home">
          <Logo className="h-9 w-9 transition-transform duration-300 group-hover:rotate-6" />
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight text-ink">TakeSure</span>
            <span className="hidden sm:block text-[10px] font-mono tracking-[0.18em] uppercase text-ink-3">Confidence before taking something</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden xl:flex items-center gap-0.5">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${active ? "text-mint-bright" : "text-ink-2 hover:text-ink hover:bg-white/5"}`}
              >
                {t(n.key)}
                {active && <motion.span layoutId="nav-underline" className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-mint" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LangToggle />
          <Link href="/check" className="hidden md:inline-flex btn btn-primary btn-sm">
            {t("nav_cta")} <ArrowRight className="h-4 w-4" />
          </Link>
          <button type="button" className="xl:hidden btn btn-ghost btn-sm px-3" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
            <span className="sr-only">{open ? t("close") : t("menu")}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav id="mobile-nav" aria-label="Primary mobile" className="xl:hidden border-t border-line glass" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}>
            <ul className="px-4 py-3 space-y-1">
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link href={n.href} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-3 text-ink-2 font-medium hover:bg-white/5 hover:text-ink">
                    {t(n.key)} <ArrowRight className="h-4 w-4 text-ink-3" />
                  </Link>
                </motion.li>
              ))}
              <li className="pt-2">
                <Link href="/check" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                  {t("nav_cta")}
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
